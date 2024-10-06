import React, { useState, useEffect } from 'react';

const PaymentForm = () => {
    const [formData, setFormData] = useState({
        beneficiary: '',
        accountNumber: '',
        swiftCode: '',
        amount: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:3001/api/payments/interPayments', {  
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        const result = await response.json();
        console.log(result);
    };    

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <h2>International Payment Form</h2>
            </div>

            <div>
                <h3>Beneficiary Details</h3>

                <input type="text" name="beneficiary" onChange={handleChange} placeholder="Beneficiary Name" />
                <input type="text" name="accountNumber" onChange={handleChange} placeholder="Account Number" />
                <input type="text" name="swiftCode" onChange={handleChange} placeholder="SWIFT Code" />
                <input type="number" name="amount" onChange={handleChange} placeholder="Amount" />
            </div>
            
           
            <button type="submit">Make Payment</button>
        </form>
    );
};

const PaymentHistory = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            const response = await fetch('http://localhost:3001/api/payments/history');
            const data = await response.json();
            setHistory(data);
        };
        fetchHistory();
    }, []);

    return (
        <div>
            <h2>Payment History</h2>
            <ul>
                {history.map(payment => (
                    <li key={payment.id}>
                        {payment.beneficiary} - {payment.amount} - {payment.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const App = () => (
    <div>
        <PaymentForm />
        <PaymentHistory />
    </div>
);

export default App;
