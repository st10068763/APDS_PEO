import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'; // Make sure Navbar component exists
import PaymentForm from './components/PaymentForm'; // Make sure PaymentForm component exists
import PaymentHistory from './components/PaymentHistory'; // Import PaymentHistory

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<PaymentForm />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
