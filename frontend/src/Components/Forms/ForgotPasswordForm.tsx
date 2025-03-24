import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";

const ForgotPasswordForm = ({ onSubmit, onBack }) => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");
        onSubmit({ email })
            .catch((err) => {
                setError(err?.response?.data?.error || "Something went wrong");
            });
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
            {error && <Typography color="error" variant="body2">{error}</Typography>}
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
