import React, { useState } from 'react';
import './LoginPage.css';
import { loginUser, registerUser, forgotPassword } from '../../api/login';
import { Container, Button, Typography, Paper } from "@mui/material";
import LoginForm from '../Forms/LoginForm';
import RegisterForm from '../Forms/RegisterForm';
import ForgotPasswordForm from '../Forms/ForgotPasswordForm';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import validatePassword from '../../utils/passwordSecuity';

function LoginPage() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (creds) => {
        try {
            const response = await loginUser(creds);
            navigate("/Recipes");
            toast.success('Login successful! 🎉');
        } catch (error) {
            toast.error("Login failed: " + (error.response?.data?.error || "Something went wrong"));
        }
    };

    const handleForgotPassword = async (data) => {
        console.log(data)
        try {
            await forgotPassword(data);
            toast.success('Password reset link sent to your email!');
            setIsForgotPassword(false); // Hide Forgot Password form
        } catch (error) {
            toast.error("Error: " + (error.response?.data?.error || "An unexpected error occurred"));
        }
    };

    const handleSignup = async (creds) => {
        const { email, password } = creds;
        
        const passwordValidation = validatePassword(password);

        if (!passwordValidation.isValid) {
            console.log(passwordValidation.message);
            return; 
        }

        try {
            await registerUser(creds);
            toast.success('Registration successful! Please Login');
            setIsRegistering(false);
        } catch (error) {
            toast.error("Registration failed: " + (error.response?.data?.error || "Something went wrong"));
        }
    };

    return (
        <div>
            <div className='login-title'>
                <img src='mealchemy-logo.png' alt="Mealchemy Logo" />
                <h1>Welcome to Mealchemy!</h1>
            </div>
            <Container component="main" maxWidth="xs">
                <Paper elevation={3} sx={{ padding: 3, borderRadius: '10px', boxShadow: "0px 3px 7px #38793b" }}>
                    <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
                        {isRegistering ? "Sign Up" : isForgotPassword ? "Forgot Password" : "Login"}
                    </Typography>

                    {isForgotPassword ? (
                        <ForgotPasswordForm onSubmit={handleForgotPassword} onBack={() => setIsForgotPassword(false)} />
                    ) : isRegistering ? (
                        <RegisterForm onSubmit={handleSignup} />
                    ) : (
                        <LoginForm onSubmit={handleLogin} />
                    )}

                    {/* Only show the following buttons based on the form state */}
                    {!isForgotPassword && !isRegistering && (
                        <>
                            <Button
                                variant="text"
                                sx={{ borderRadius: '10px', color: '#38793b' }}
                                onClick={() => setIsForgotPassword(true)}>
                                Forgot Password?
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => setIsRegistering(true)}
                                fullWidth
                                sx={{
                                    color: '#38793b',
                                    borderColor: '#38793b',
                                    borderRadius: '10px',
                                    "&:hover": {
                                        backgroundColor: "#b0dbb2",  // Green background on hover
                                        color: "black",  // White text on hover
                                    }
                                }}>
                                Sign Up
                            </Button>
                        </>
                    )}
                </Paper>
            </Container>
        </div>
    );
}

export default LoginPage;
