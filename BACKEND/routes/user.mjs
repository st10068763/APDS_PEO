import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";

const router = express.Router();

var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

// Sign up
router.post("/signup", async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            username, 
            password, 
            accountNumber, 
            idNumber 
        } = req.body;

        console.log(`Signup attempt for username: ${username}`);

        if (!username || !password) {
            console.log("Signup failed: Username and password are required");
            return res.status(400).json({ message: "Username and password are required" });
        }

        const collection = await db.collection("users");

        // Check if username already exists
        const existingUser = await collection.findOne({ username });
        if (existingUser) {
            console.log(`Signup failed: Username ${username} already exists`);
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user document
        const newUser = {
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword,
            accountNumber,
            idNumber,
            createdAt: new Date()
        };

        // Insert new user document into database
        const result = await collection.insertOne(newUser);

        console.log(`User registered successfully: ${username}`);
        res.status(201).json({ message: "User registered successfully", userId: result.insertedId });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Signup failed" });
    }
});

// Login
router.post("/login", bruteforce.prevent, async (req, res) => {
    const { identifier, password } = req.body;
    console.log(`Login attempt for: ${identifier}`);

    try {
        const collection = await db.collection("users");
        const user = await collection.findOne({ 
            $or: [{ username: identifier }, { email: identifier }]
        });

        if (!user) {
            console.log(`User not found: ${identifier}`);
            return res.status(401).json({ message: "Authentication failed" });
        }

        console.log(`User found: ${user.username}`);

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.log(`Password mismatch for user: ${user.username}`);
            return res.status(401).json({ message: "Authentication failed" });
        }
        
        console.log(`Password match for user: ${user.username}`);

        // Authentication successful
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || "this_secret_should_be_longer_than_it_is",
            { expiresIn: "1h" }
        );

        // Log the token to the console
        console.log(`Token generated for user: ${user.username}: ${token}`);

        // Respond to the client with the token and user details
        res.status(200).json({ 
            message: "Authentication successful", 
            token, 
            userId: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
        });

        console.log(`Login successful for user: ${user.username}`);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
});

// Local Payment
router.post("/local-payment", async (req, res) => {
    const { userId, recipient, amount, accountNumber, currency } = req.body;
    console.log(`Local payment attempt for user: ${userId}`);

    // Validate account number
    if (!accountNumber || accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
        console.log(`Invalid account number: ${accountNumber}`);
        return res.status(400).json({ message: "Account number must be 10 digits" });
    }

    try {
        const userCollection = await db.collection("users");
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            console.log(`User not found: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        const transactionCollection = await db.collection("transactions");
        const newTransaction = {
            userId: new ObjectId(userId),
            recipient,
            amount: parseFloat(amount),
            currency,
            accountNumber,
            type: "Local Payment",
            date: new Date()
        };

        const result = await transactionCollection.insertOne(newTransaction);

        if (result.acknowledged) {
            console.log(`Local payment processed for user: ${userId}`);
            res.status(200).json({ message: "Local payment processed successfully" });
        } else {
            console.log(`Failed to process local payment for user: ${userId}`);
            res.status(400).json({ message: "Failed to process payment" });
        }
    } catch (error) {
        console.error("Local payment error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// International Payment
router.post("/international-payment", async (req, res) => {
    const { userId, recipient, amount, accountNumber, currency, swiftCode } = req.body;
    console.log(`International payment attempt for user: ${userId}`);

    // Validate account number
    if (!accountNumber || accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
        console.log(`Invalid account number: ${accountNumber}`);
        return res.status(400).json({ message: "Account number must be 10 digits" });
    }

    // Validate SWIFT code
    if (!swiftCode || swiftCode.length !== 11) {
        console.log(`Invalid SWIFT code: ${swiftCode}`);
        return res.status(400).json({ message: "SWIFT code must be 11 characters" });
    }

    try {
        const userCollection = await db.collection("users");
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            console.log(`User not found: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        const transactionCollection = await db.collection("transactions");
        const newTransaction = {
            userId: new ObjectId(userId),
            recipient,
            amount: parseFloat(amount),
            currency,
            accountNumber,
            swiftCode,
            type: "International Payment",
            date: new Date()
        };

        const result = await transactionCollection.insertOne(newTransaction);

        if (result.acknowledged) {
            console.log(`International payment processed for user: ${userId}`);
            res.status(200).json({ message: "International payment processed successfully" });
        } else {
            console.log(`Failed to process international payment for user: ${userId}`);
            res.status(400).json({ message: "Failed to process payment" });
        }
    } catch (error) {
        console.error("International payment error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Fetch user transactions
router.get("/transactions/:userId", async (req, res) => {
    const userId = req.params.userId;
    console.log(`Fetching transactions for user: ${userId}`);

    try {
        const transactionCollection = await db.collection("transactions");
        const transactions = await transactionCollection
            .find({ userId: new ObjectId(userId) })
            .sort({ date: -1 })
            .limit(10)
            .toArray();

        console.log(`Fetched ${transactions.length} transactions for user: ${userId}`);
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Error fetching transactions" });
    }
});

export default router;
