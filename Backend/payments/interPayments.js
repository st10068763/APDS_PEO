import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Route to handle international payments
app.post('/api/payments/international', (req, res) => {
    const paymentData = req.body;
    console.log('Processing international payment:', paymentData);

    // Mock logic for international payment processing
    res.status(200).json({ message: 'Payment processed successfully', paymentData });
});

// Route to fetch payment history
app.get('/api/payments/history', (req, res) => {
    // Fetch payment history logic here (from a database or mock data)
    const mockHistory = [
        { id: 1, amount: 1000, beneficiary: 'John Doe', status: 'Completed' },
        { id: 2, amount: 500, beneficiary: 'Jane Smith', status: 'Pending' }
    ];
    res.json(mockHistory);
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
