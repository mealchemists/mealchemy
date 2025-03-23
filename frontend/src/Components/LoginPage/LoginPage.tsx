import React, { useState } from 'react';
import './LoginPage.css';
import {loginUser, getCsrfToken, registerUser} from '../../api/login';
import { Container, TextField, Button, Typography, Box, Paper } from "@mui/material";
import LoginForm from '../Forms/LoginForm'
import RegisterForm from '../Forms/RegisterForm';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const [csrfToken, setCsrfToken] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const showNotification = () => {
        toast.success('Hello from another component!');
    };
    

    const handleLogin = async (creds) => {
        try {
            console.log("CREDS", creds);
            const response = await loginUser(creds);
            navigate("/Recipes");
            toast.success('Login successful! 🎉'); // Success toast
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
        try {
            const response = await registerUser(creds);
            toast.success('Registration successful! Please Login'); // Success toast
            setIsRegistering(false);
            console.log("Registration successful", response);
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };
    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ padding: 3,
                borderRadius:'10px'
            }}>
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
