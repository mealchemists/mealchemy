import { useState } from 'react';
import { Button, Card, CardContent, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from "@mui/material";

import './UserProfile.css';
import { VisibilityOff, Visibility } from '@mui/icons-material';

function UserProfile() {
    const [email, setEmail] = useState("user@example.com");
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [newPassword, setNewPassword] = useState("");

    const handleSignOut = () => {
        console.log("Signing out...");
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleChangePassword = () => {
        setShowPasswordInput(!showPasswordInput);
    };
    const handleSavePassword = () => {
        console.log("New Password:", newPassword); // Replace with actual password update logic
        setShowPasswordInput(false);
        setNewPassword(newPassword);
    };
    return (
        <Card sx={{ maxWidth: 400, margin: "auto", mt: 5, p: 3, textAlign: "center", borderRadius:'10px' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            User Account
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Email:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold", mb: 2 }}>
            {email}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleChangePassword} sx={{ mb: 1, width: "100%" }}>
            Change Password
          </Button>
          {showPasswordInput && (
            <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center", mt: 1, mb: 2 }} variant="outlined">
              <OutlinedInput
                sx={{ flex: 1 }}
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "hide the password" : "display the password"
                      }
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <Button variant="contained" color="success" onClick={handleSavePassword} sx={{ ml: 1 }}>
                Done
              </Button>
            </FormControl>
          )}
          <Button variant="outlined" color="error" onClick={handleSignOut} sx={{ width: "100%" }}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    );
}

export default UserProfile;
