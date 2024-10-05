import fs from 'fs';
import https from 'https';
import express from 'express';

const app = express();

try {
    const privateKey = fs.readFileSync('./keys/privateKey.pem');  // Updated path
    const certificate = fs.readFileSync('./keys/certificate.pem'); // Updated path

    const options = {
        key: privateKey,
        cert: certificate
    };

    // Defining the route
    app.get('/', (req, res) => {
        res.send('Welcome to your bank server');
    });

    // Creating the server
    https.createServer(options, app).listen(443, () => {
        console.log('Server is running on https://localhost:443');
    });

} catch (error) {
    console.error('Error reading certificate/key files:', error.message);
}
