import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import backgroundImage from "./assets/background.jpg";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post('https://localhost:3001/user/login', formData);
      console.log("Login successful:", response.data);
      
      localStorage.setItem('user', JSON.stringify({
        userId: response.data.userId,
        username: response.data.username,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        token: response.data.token
      }));
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.response?.data?.message || "An error occurred during login");
      setError(error.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.header}>Login Form</h2>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.row}>
          <input
            type="text"
            name="identifier"
            placeholder="Username or Email"
            value={formData.identifier}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.row}>
          <div style={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={styles.passwordInput}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={styles.eyeButton}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button type="submit" style={styles.submitButton}>Log in</button>

        <div style={styles.forgotSection}>
          <button type="button" style={styles.forgotButton}>Forgot Password</button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "20px",
  },
  form: {
    padding: "30px",
    maxWidth: "400px",
    width: "100%",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  row: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    width: '100%',
    padding: '12px',
    paddingRight: '40px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  eyeButton: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
  },
  submitButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  forgotSection: {
    textAlign: "center",
    marginTop: "20px",
  },
  forgotButton: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "15px",
    fontSize: "14px",
  },
};

export default Login;