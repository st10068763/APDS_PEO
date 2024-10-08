import React, { useState, useEffect } from 'react';
import { Menu, X, Home, FileText, CreditCard, User, LogOut } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

// Currency options
const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'NGN', name: 'Nigerian Naira' },
];

// Header component
const Header = ({ customerName, onMenuToggle }) => (
  <header className="dashboard-header">
    <div className="header-content">
      <button className="menu-toggle" onClick={onMenuToggle}>
        <Menu size={24} />
      </button>
      <h1>Dashboard</h1>
      <div className="user-info">
        <User className="user-icon" />
        <span>{customerName}</span>
      </div>
    </div>
  </header>
);

// Sidebar component
const Sidebar = ({ isOpen, activeItem, onItemClick, onClose, onLogout }) => (
  <div className={`sidebar ${isOpen ? 'open' : ''}`}>
    <div className="sidebar-header">
      <div className="logo">MENU</div>
      <button onClick={onClose} className="close-sidebar">
        <X size={24} />
      </button>
    </div>
    <nav className="sidebar-nav">
      {['dashboard', 'transactions', 'payments'].map((item) => (
        <a
          key={item}
          href={`/${item}`}
          className={`nav-item ${activeItem === item ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onItemClick(item);
          }}
        >
          {item === 'dashboard' && <Home className="nav-icon" />}
          {item === 'transactions' && <FileText className="nav-icon" />}
          {item === 'payments' && <CreditCard className="nav-icon" />}
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </a>
      ))}
      <a
        href="/logout"
        className="nav-item logout"
        onClick={(e) => {
          e.preventDefault();
          onLogout();
        }}
      >
        <LogOut className="nav-icon" />
        Logout
      </a>
    </nav>
  </div>
);

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, onSubmit, title, isInternational = false }) => {
  const [paymentData, setPaymentData] = useState({
    recipient: '',
    amount: '',
    currency: 'USD',
    accountNumber: '',
    ...(isInternational ? { swiftCode: '' } : {})
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await onSubmit(paymentData);
      setLoading(false);
      onClose();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to process payment.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="recipient">Recipient</label>
            <input
              type="text"
              id="recipient"
              name="recipient"
              value={paymentData.recipient}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={paymentData.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              name="currency"
              value={paymentData.currency}
              onChange={handleChange}
              required
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="accountNumber">Account Number</label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={paymentData.accountNumber}
              onChange={handleChange}
              required
            />
          </div>
          {isInternational && (
            <div className="form-group">
              <label htmlFor="swiftCode">SWIFT Code</label>
              <input
                type="text"
                id="swiftCode"
                name="swiftCode"
                value={paymentData.swiftCode}
                onChange={handleChange}
                placeholder="e.g., BOFAUS3NXXX"
                required
              />
            </div>
          )}
          <div className="modal-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Processing...' : 'Submit Payment'}
            </button>
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ onPaymentSubmit }) => {
  const [isLocalPaymentModalOpen, setIsLocalPaymentModalOpen] = useState(false);
  const [isInternationalPaymentModalOpen, setIsInternationalPaymentModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await axios.get(`https://localhost:3001/user/transactions/${user.userId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        setTransactions(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Failed to fetch transactions. Please try again later.");
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handlePaymentSubmit = async (paymentData, isInternational) => {
    try {
      await onPaymentSubmit(paymentData, isInternational);
      // Refresh transactions after successful payment
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`https://localhost:3001/user/transactions/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      setTransactions(response.data);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="dashboard-card">
        <h3>Account Balance</h3>
        <div className="balance-info">
          <div className="balance">$12,345.67</div>
          <div className="balance-label">Available balance</div>
        </div>
      </div>
      <div className="dashboard-card">
        <h3>Quick Actions</h3>
        <div className="quick-actions">
          <button className="action-button primary" onClick={() => setIsLocalPaymentModalOpen(true)}>Make Local Payment</button>
          <button className="action-button secondary" onClick={() => setIsInternationalPaymentModalOpen(true)}>Make International Payment</button>
        </div>
      </div>
      <div className="dashboard-card full-width">
        <h3>Recent Transactions</h3>
        {loading ? (
          <p>Loading transactions...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="transactions-list">
            {transactions.map((transaction, index) => (
              <div key={index} className="transaction-item">
                <div>
                  <div className="transaction-title">{transaction.recipient}</div>
                  <div className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</div>
                  <div className="transaction-account">Account: {transaction.accountNumber}</div>
                </div>
                <div className={`transaction-amount ${transaction.type.includes('Payment') ? 'negative' : 'positive'}`}>
                  {transaction.type.includes('Payment') ? '-' : '+'}
                  {Math.abs(transaction.amount).toFixed(2)} {transaction.currency}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <PaymentModal
        isOpen={isLocalPaymentModalOpen}
        onClose={() => setIsLocalPaymentModalOpen(false)}
        onSubmit={(data) => handlePaymentSubmit(data, false)}
        title="Make Local Payment"
      />
      <PaymentModal
        isOpen={isInternationalPaymentModalOpen}
        onClose={() => setIsInternationalPaymentModalOpen(false)}
        onSubmit={(data) => handlePaymentSubmit(data, true)}
        title="Make International Payment"
        isInternational
      />
    </div>
  );
};

// Transactions Content Component
const TransactionsContent = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await axios.get(`https://localhost:3001/user/transactions/${user.userId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        setTransactions(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Failed to fetch transactions. Please try again later.");
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="transactions-content">
      <h2>Transactions</h2>
      <p>Your recent account activity</p>
      {loading ? (
        <p>Loading transactions...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Account Number</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.recipient}</td>
                <td className={transaction.type.includes('Payment') ? 'negative' : 'positive'}>
                  {transaction.type.includes('Payment') ? '-' : '+'}
                  {Math.abs(transaction.amount).toFixed(2)}
                </td>
                <td>{transaction.currency}</td>
                <td>{transaction.accountNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Payments Content Component
const PaymentsContent = ({ onPaymentSubmit }) => {
  const [paymentData, setPaymentData] = useState({
    recipient: '',
    amount: '',
    currency: 'USD',
    accountNumber: '',
    swiftCode: ''
  });
  const [isInternational, setIsInternational] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await onPaymentSubmit(paymentData, isInternational);
      setSuccessMessage("Payment processed successfully");
      setPaymentData({ recipient: '', amount: '', currency: 'USD', accountNumber: '', swiftCode: '' });
      setLoading(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to make payment.');
      setLoading(false);
    }
  };

  return (
    <div className="payments-content">
      <h2>Make a Payment</h2>
      <p>Enter payment details below</p>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      <form className="payment-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="paymentType">Payment Type</label>
          <select
            id="paymentType"
            name="paymentType"
            value={isInternational ? 'international' : 'local'}
            onChange={(e) => setIsInternational(e.target.value === 'international')}
            required
          >
            <option value="local">Local Payment</option>
            <option value="international">International Payment</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="recipient">Pay to</label>
          <input
            type="text"
            id="recipient"
            name="recipient"
            value={paymentData.recipient}
            onChange={handleChange}
            placeholder="Enter recipient name or account"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={paymentData.amount}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            name="currency"
            value={paymentData.currency}
            onChange={handleChange}
            required
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="accountNumber">Account Number</label>
          <input
            type="text"
            id="accountNumber"
            name="accountNumber"
            value={paymentData.accountNumber}
            onChange={handleChange}
            placeholder="Enter account number"
            required
          />
        </div>
        {isInternational && (
          <div className="form-group">
            <label htmlFor="swiftCode">SWIFT Code</label>
            <input
              type="text"
              id="swiftCode"
              name="swiftCode"
              value={paymentData.swiftCode}
              onChange={handleChange}
              placeholder="Enter SWIFT code"
              required
            />
          </div>
        )}
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Processing...' : 'Make Payment'}
        </button>
      </form>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.firstName && user.lastName) {
      setCustomerName(`${user.firstName} ${user.lastName}`);
    } else {
      setCustomerName('Guest User');
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handlePaymentSubmit = async (paymentData, isInternational) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const endpoint = isInternational ? '/user/international-payment' : '/user/local-payment';
      const response = await axios.post(`https://localhost:3001${endpoint}`, {
        ...paymentData,
        userId: user.userId
      }, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.data.message.includes("payment processed successfully")) {
        return "Payment processed successfully";
      } else {
        throw new Error("Failed to process payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      throw error;
    }
  };

  const renderContent = () => {
    switch (activeMenuItem) {
      case 'dashboard':
        return <DashboardContent onPaymentSubmit={handlePaymentSubmit} />;
      case 'transactions':
        return <TransactionsContent />;
      case 'payments':
        return <PaymentsContent onPaymentSubmit={handlePaymentSubmit} />;
      default:
        return <DashboardContent onPaymentSubmit={handlePaymentSubmit} />;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar
        isOpen={isSidebarOpen}
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
        onClose={toggleSidebar}
        onLogout={handleLogout}
      />
      <div className="main-content">
        <Header 
          customerName={customerName} 
          onMenuToggle={toggleSidebar}
        />
        <main className="content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;