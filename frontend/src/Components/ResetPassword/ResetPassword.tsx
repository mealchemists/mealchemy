import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";  // Use useNavigate instead of useHistory
import {validatePassword, validateConfirmPassword} from '../../utils/formValidation';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();  // Using the new hook in React Router v6

  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;

    // Reset errors
    setPasswordError("");
    setConfirmPasswordError("");

    const isPasswordValid = validatePassword(password, setPasswordError);
    const isConfirmPasswordValid = validateConfirmPassword(password, confirmPassword, setConfirmPasswordError);
    
    if (!isPasswordValid || !isConfirmPasswordValid) return;

    try {
      // Make POST request to your Django backend to reset password
      const response = await axios.post(
        'http://localhost:8000/api/reset-password/', 
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
      toast.success('Password was reset, please login! 🎉');


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
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
                label="New Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "gray", borderRadius: '10px' },
                        "&:hover fieldset": { borderColor: "#38793b" },
                        "&.Mui-focused fieldset": { borderColor: "#38793b", borderWidth: "2px" }
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#38793b" }
                }}
            />

            <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "gray", borderRadius: '10px' },
                        "&:hover fieldset": { borderColor: "#38793b" },
                        "&.Mui-focused fieldset": { borderColor: "#38793b", borderWidth: "2px" }
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#38793b" }
                }}
            />
            {/* General error message displayed below the inputs */}
            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
            <Button variant="contained" color="primary" type="submit" fullWidth
                sx={{ backgroundColor: '#38793b', borderRadius: '10px' }}
            >
                Reset Password
            </Button>
        </Box>
    );
};

export default ResetPassword;
