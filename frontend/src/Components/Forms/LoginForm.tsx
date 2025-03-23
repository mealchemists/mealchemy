import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";

const LoginForm = ({ onSubmit, onToggle }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");
        onSubmit({ username: email, password })
            // Display Errors recieved from backend
            .catch((err) => {
                // If error occurs, show it on form
                setError(err?.response?.data?.error || "Something went wrong");
            });
        console.log(error);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                            borderColor: "gray",
                            borderRadius: '10px'
                        }, // Default border color
                        "&:hover fieldset": { borderColor: "#38793b" }, // Border color on hover
                        "&.Mui-focused fieldset": { borderColor: "#38793b", borderWidth: "2px" } // Green border when focused
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "#38793b" // Green label when focused
                    },
                    borderRadius: '10px'

                }}
            />
            <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                            borderColor: "gray",
                            borderRadius: '10px'
                        }, // Default border color
                        "&:hover fieldset": { borderColor: "#38793b" }, // Border color on hover
                        "&.Mui-focused fieldset": { borderColor: "#38793b", borderWidth: "2px" } // Green border when focused
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "#38793b" // Green label when focused
                    },
                }}
            />

            {/* Display error message if passwords do not match */}
            {error && <Typography color="error" variant="body2">{error}</Typography>}

            <Button variant="contained" color="primary" type="submit" fullWidth
                sx={{
                    backgroundColor:'#38793b',

                    borderRadius: '10px'
                }}
            >
                Login
            </Button>
            <Button variant="text" 
                sx={{
                    borderRadius: '10px',
                    color: '2f5d2b'
                }}
                onClick={() => console.log("Forgot Password Clicked")}>
                Forgot Password?
            </Button>
            <Button variant="outlined" color="primary" onClick={onToggle} fullWidth
                sx={{
                    color:'#38793b',
                    borderColor:'#38793b',
                    borderRadius: '10px',
                    "&:hover": {
                        backgroundColor: "#b0dbb2", // Green background on hover
                        color: "black", // White text on hover
                    }
                }}>
                Sign Up
            </Button>
        </Box>
    );
};

export default LoginForm;
