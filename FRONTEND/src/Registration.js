
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Eye, EyeOff, Loader } from 'lucide-react';
import backgroundImage from './assets/background.jpg';

const Registration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    accountNumber: "",
    idNumber: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return /^[A-Za-z]+$/.test(value) ? '' : 'Only letters are allowed';
      case 'idNumber':
        return /^\d{13}$/.test(value) ? '' : 'ID number must be exactly 13 digits';
      case 'email':
        return /\S+@\S+\.\S+/.test(value) ? '' : 'Invalid email format';
      case 'password':
        return value.length >= 8 ? '' : 'Password must be at least 8 characters long';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
  
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Prepare the data to send (excluding confirmPassword)
      const { confirmPassword, ...dataToSend } = formData;
      
      // Send registration request with all data
      const response = await axios.post('https://localhost:3001/user/signup', dataToSend);
  
      console.log("Registration successful:", response.data);
      setIsLoading(false);
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error.response?.data?.message || "An error occurred during registration");
      setErrors({ submit: error.response?.data?.message || "Registration failed. Please try again." });
      setIsLoading(false);
    }
  };
  const navigateToLogin = () => {
    navigate("/login");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.header}>Customer Registration Form</h2>

        {errors.submit && <p style={styles.submitError}>{errors.submit}</p>}

        <div style={styles.formContent}>
          <div style={styles.column}>
            <div style={styles.inputContainer}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.firstName && <span style={styles.error}>{errors.firstName}</span>}
            </div>
            <div style={styles.inputContainer}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.email && <span style={styles.error}>{errors.email}</span>}
            </div>
            <div style={styles.inputContainer}>
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
              {errors.password && <span style={styles.error}>{errors.password}</span>}
            </div>
            <div style={styles.inputContainer}>
              <input
                type="text"
                name="accountNumber"
                placeholder="Account Number"
                value={formData.accountNumber}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={styles.column}>
            <div style={styles.inputContainer}>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.lastName && <span style={styles.error}>{errors.lastName}</span>}
            </div>
            <div style={styles.inputContainer}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.username && <span style={styles.error}>{errors.username}</span>}
            </div>
            <div style={styles.inputContainer}>
              <div style={styles.passwordContainer}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={styles.passwordInput}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
            </div>
            <div style={styles.inputContainer}>
              <input
                type="text"
                name="idNumber"
                placeholder="ID Number"
                value={formData.idNumber}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.idNumber && <span style={styles.error}>{errors.idNumber}</span>}
            </div>
          </div>
        </div>

        <button type="submit" style={styles.submitButton} disabled={isLoading}>
          {isLoading ? (
            <div style={styles.loadingContainer}>
              <Loader size={24} style={styles.loadingIcon} />
              <span>Registering...</span>
            </div>
          ) : (
            "Submit"
          )}
        </button>

        <div style={styles.loginSection}>
          <p style={styles.existingCustomerText}>An existing customer?</p>
          <button type="button" onClick={navigateToLogin} style={styles.loginButton}>
            Click to Login
          </button>
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
    minHeight: "100vh",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "40px 0",
  },
  form: {
    padding: "40px",
    border: "1px solid #ccc",
    borderRadius: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    width: "700px",
    maxWidth: "90%",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "28px",
    color: "#333",
  },
  formContent: {
    display: "flex",
    justifyContent: "space-between",
    gap: "40px",
  },
  column: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  inputContainer: {
    marginBottom: "25px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    transition: "border-color 0.3s ease",
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
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
  },
  eyeButton: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginTop: "8px",
  },
  submitError: {
    color: "red",
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "16px",
  },
  submitButton: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "18px",
    transition: "background-color 0.3s ease",
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIcon: {
    marginRight: "10px",
    animation: "spin 1s linear infinite",
  },
  loginSection: {
    textAlign: "center",
    marginTop: "30px",
  },
  existingCustomerText: {
    marginBottom: "15px",
    fontSize: "16px",
  },
  loginButton: {
    padding: "12px 20px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s ease",
  },
};

export default Registration;