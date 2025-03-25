import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import {validatePassword, validateEmail} from '../../utils/formValidation';

const LoginForm = ({ onSubmit, onForgotPassword, formError }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");


    const handleSubmit = async (event) => {
        event.preventDefault();
        let valid = true;

        // Reset errors
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");

        const isEmailValid = validateEmail(email, setEmailError);
        const isPasswordValid = validatePassword(password, setPasswordError);

        if (!isEmailValid || !isPasswordValid) return;

        await onSubmit({ email, password });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
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
            <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <Button
                    variant="text"
                    sx={{
                        borderRadius: '10px',
                        color: '#38793b',
                    }}
                    onClick={onForgotPassword}
                >
                    Forgot Password?
                </Button>
            </Box>
            {formError && (
                <Typography color="error" variant="body2" sx={{ marginTop: 2 }}>
                    {formError}
                </Typography>
            )}
            <Button variant="contained" color="primary" type="submit" fullWidth
                sx={{
                    backgroundColor: '#38793b',
                    borderRadius: '10px',
                    marginBottom:'10px',
                }}
            >
                Login
            </Button>

        </Box>
    );
};

export default LoginForm;
