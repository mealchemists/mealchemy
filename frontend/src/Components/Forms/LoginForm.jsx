import React, { useState } from "react";
import { TextField, Button, Box, Typography} from "@mui/material";

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
            />
            <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {/* Display error message if passwords do not match */}
            {error && <Typography color="error" variant="body2">{error}</Typography>}

            <Button variant="contained" color="primary" type="submit" fullWidth>
                Login
            </Button>
            <Button variant="text" color="secondary" onClick={() => console.log("Forgot Password Clicked")}>
                Forgot Password?
            </Button>
            <Button variant="outlined" color="primary" onClick={onToggle} fullWidth>
                Sign Up
            </Button>
        </Box>
    );
};

export default LoginForm;
