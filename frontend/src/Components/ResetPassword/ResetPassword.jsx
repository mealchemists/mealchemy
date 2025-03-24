import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";  // Use useNavigate instead of useHistory

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();  // Using the new hook in React Router v6

  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Make POST request to your Django backend to reset password
      console.log(token)
      const response = await axios.post(
      'http://localhost:8000/api/update-account/', 
      { 
        password,  // Send password if it's being updated
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Correct format: 'Bearer <your-token>'
          'Content-Type': 'application/json',  // Ensure the correct content type is set
        }
      }
    );


      setMessage(response.data.message);
      // Redirect user to login after success
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || "An error occurred.");
      } else {
        setError("Network error. Please try again later.");
      }
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ResetPassword;
