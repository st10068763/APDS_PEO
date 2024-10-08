// src/components/PaymentHistory.js
import React, { useState, useEffect } from 'react';

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
        <div className="payment-history">
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

export default PaymentHistory;
