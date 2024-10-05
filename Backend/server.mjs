import https from "https";
import http from "http";
import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Constants
const PORT = 3000;
const HOST = 'localhost';  // You can also use an IP address or a domain
const app = express();

// Get the correct directory paths for the keys folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keysDir = path.join(__dirname, 'keys');

// SSL options - ensure paths are correctly resolved
const options = {
  key: fs.readFileSync(path.join(keysDir, 'privateKey.pem')),
  cert: fs.readFileSync(path.join(keysDir, 'certificate.pem'))
};

// Middleware
app.use(cors());
app.use(express.json());

// Allow CORS globally
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
});

// Create HTTPS server
let server = https.createServer(options, app);

// Log the full URL
server.listen(PORT, HOST, () => {
  console.log(`Server is running at https://${HOST}:${PORT}`);
});
