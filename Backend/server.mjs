import https from "https";
import fs from "fs";
import express from "express";
import cors from "cors";

const PORT = 3001;
const app = express();

// SSL options
const options = {
    key: fs.readFileSync('keys/privateKey.pem'),
    cert: fs.readFileSync('keys/certificate.pem')
};

// Enable CORS to allow requests from your frontend
app.use(cors({
    origin: 'http://localhost:3000',  // Allow requests from your frontend
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Allow CORS globally for all requests
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// Define a basic route to check server status
app.get('/', (req, res) => {
    res.send('Welcome to the Bank Server');
});

// Create HTTPS server
let server = https.createServer(options, app);

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
});
