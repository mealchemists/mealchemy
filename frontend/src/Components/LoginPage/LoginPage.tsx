import React, { useState } from 'react';
import './LoginPage.css';
import {loginUser, getCsrfToken, registerUser} from '../../api/login.js';
import { Container, TextField, Button, Typography, Box, Paper } from "@mui/material";
import LoginForm from '../Forms/LoginForm'
import RegisterForm from '../Forms/RegisterForm';

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const [csrfToken, setCsrfToken] = useState("");
    const [error, setError] = useState("");
    

    const handleLogin = async (creds) => {
        console.log(creds);
        try {
            const response = await loginUser(creds);
            console.log("Login successful:", response);
        } catch (error) {
            setError("Login failed: " + (error.response?.data?.error));
            console.error("Login failed:", error.request);
        }
    };

    const handleForgotPassword = () => {
        console.log("Forgot password clicked");
        // TODO: Implement forgot password logic
    };

    const handleSignup = async (creds) => {
        console.log("Signup clicked");
        console.log(creds);
        try {
            const response = await registerUser(creds);
            console.log("Registration successful:", response);
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };
    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h5" gutterBottom>
                    {isRegistering ? "Sign Up" : "Login"}
                </Typography>
                {isRegistering ? (
                    <RegisterForm onSubmit={handleSignup} onToggle={() => setIsRegistering(false)} />
                ) : (
                    <LoginForm onSubmit={handleLogin} onToggle={() => setIsRegistering(true)} />
                )}
                {error && <Typography color="error" variant="body2">{error}</Typography>} 
            </Paper>
        </Container>
    );

}

export default LoginPage;
