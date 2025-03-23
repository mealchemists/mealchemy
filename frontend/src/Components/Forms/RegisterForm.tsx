import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";

const RegisterForm = ({ onSubmit, onToggle }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError("") // clear any form errors
        onSubmit({ username: email, password });
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
            />
            <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* Display error message if passwords do not match */}
            {error && <Typography color="error" variant="body2">{error}</Typography>}

            <Button variant="contained" color="primary" type="submit" fullWidth>
                Sign Up
            </Button> 
            <Button variant="outlined" color="primary" onClick={onToggle} fullWidth>
                Login
            </Button>
        </Box>
    );
};

export default RegisterForm;
