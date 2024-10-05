import fs from 'fs';
import https from 'https';
import express from 'express';
import path from 'path';

const app = express();
const keysDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'keys');

try {
    const privateKey = fs.readFileSync(path.join(keysDir, 'privateKey.pem'));  
    const certificate = fs.readFileSync(path.join(keysDir, 'certificate.pem')); 

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
