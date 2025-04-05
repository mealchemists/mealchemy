import React, { useState } from 'react';
import './LoginPage.css';
import { loginUser, registerUser, forgotPassword } from '../../api/login';
import { Container, Button, Typography, Paper } from "@mui/material";
import LoginForm from '../Forms/LoginForm';
import RegisterForm from '../Forms/RegisterForm';
import ForgotPasswordForm from '../Forms/ForgotPasswordForm';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const navigate = useNavigate();
    const [formError, setFormError] = useState("");

    const clearForm = () => {
        setFormError(""); 
    };

    const handleLogin = async (creds) => {
        try {
            const response = await loginUser(creds);
            navigate("/Recipes");
            toast.success('Login successful! 🎉');
            clearForm();
        } catch (error) {
            const errorMessage = error.response?.data || "Something went wrong";
            setFormError(errorMessage);
        }
    };

    const handleForgotPassword = async (data) => {
        try {
            await forgotPassword(data);
            toast.success('Password reset link sent to your email!');
            setIsForgotPassword(false); // Hide Forgot Password form
            clearForm()
        } catch (error) {
            const errorMessage = error.response?.data || "Something went wrong";
            setFormError(errorMessage);
        }
    };

    const handleSignup = async (creds) => {
        try {
            await registerUser(creds);
            toast.success('Registration successful! Please Login');
            setIsRegistering(false);
            clearForm();
        } catch (error) {
            const data = error.response?.data;
            if (data.email) {
                setFormError(data.email[0]); 
                return;
            }
            if (data.password) {
                setFormError(data.password[0]);
                return;
            }
            setFormError("Unexpected Error, Try Again Later");
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
                        <RegisterForm onSubmit={handleSignup} onBack={() => setIsRegistering(false)} formError={formError}/>
                    ) : (
                        <LoginForm onSubmit={handleLogin} onForgotPassword={() => setIsForgotPassword(true)}formError={formError}/>
                    )}

                    {/* Only show the following buttons based on the form state */}
                    {!isForgotPassword && !isRegistering && (
                        <>
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
