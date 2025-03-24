import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { validateEmail} from '../../utils/formValidation';

const ForgotPasswordForm = ({ onSubmit, onBack }) => {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(""); 

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        setEmailError("");        
        const isEmailValid = validateEmail(email, setEmailError);

        if (!isEmailValid ) return;
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
                        },
                        "&:hover fieldset": { borderColor: "#38793b" },
                        "&.Mui-focused fieldset": { borderColor: "#38793b", borderWidth: "2px" }
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "#38793b"
                    },
                }}
            />
            <Button variant="contained" color="primary" type="submit" fullWidth
                sx={{
                    backgroundColor:'#38793b',

                    borderRadius: '10px'
                }}
            >
                Send Password Reset Link
            </Button>
            <Button variant="text" onClick={onBack} sx={{ color: '#38793b', borderRadius: '10px' }}>
                Back to Login
            </Button>
        </Box>
    );
};

export default ForgotPasswordForm;
