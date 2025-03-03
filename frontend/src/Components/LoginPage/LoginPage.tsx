import React, { useState } from 'react';
import './LoginPage.css';
import { Container, TextField, Button, Typography, Box, Paper } from "@mui/material";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        console.log("Email:", email);
        console.log("Password:", password);
        // TODO: Implement login logic
    };
    const handleForgotPassword = () => {
        console.log("Forgot password clicked");
        // TODO: Implement forgot password logic
    };

    const handleSignup = () => {
        console.log("Signup clicked");
        // TODO: Implement signup logic
    };
    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h5" gutterBottom>Login</Typography>
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div>
                        <TextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button variant="contained" color="primary" onClick={handleLogin} fullWidth>
                        Login
                    </Button>
                    <Button variant="text" color="secondary" onClick={handleForgotPassword}>
                        Forgot Password?
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleSignup} fullWidth>
                        Sign Up
                    </Button>
                </Box>
            </Paper>
        </Container>
    );

}

export default LoginPage;
