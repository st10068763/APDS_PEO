import React from 'react';
import { Link } from 'react-router-dom'; 
const Navbar = () => {
    return (
        <nav className="navbar">
            <h1>Banking App</h1>
            <div className="nav-links">
                <Link to="/PaymentForm">Payment Form</Link>
                <Link to="/PaymentHistory">Payment History</Link>
            </div>
        </nav>
    );
};

export default Navbar;
