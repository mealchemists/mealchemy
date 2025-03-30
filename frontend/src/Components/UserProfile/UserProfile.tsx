import { useEffect, useState } from 'react';
import { Button, Card, CardContent, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from "@mui/material";
import { logout,changePassword } from '../../api/login';
import { useAuth } from '../../api/useAuth';
import './UserProfile.css';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';


function UserProfile() {
  const { isAuthenticated, username } = useAuth();
  const [email, setEmail] = useState(username);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(username);
  }, [username]);

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChangePassword = () => {
    setShowPasswordInput(!showPasswordInput);
  };
  const handleSavePassword = async () => {
    console.log("New Password:", newPassword); 
    await changePassword(email, newPassword);
    setShowPasswordInput(false);
    setNewPassword(newPassword);
    navigate('/login');

  };
  return (
    <Card sx={{ maxWidth: 400, margin: "auto", mt: 5, p: 3, textAlign: "center", borderRadius: '10px' }}>
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
        <Button variant="contained" color="primary" onClick={handleChangePassword} sx={{ mb: 1, width: "100%",borderRadius:'10px'}}>
          Change Password
        </Button>
        {showPasswordInput && (
          <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center", mt: 1, mb: 2 }} variant="outlined">
            <OutlinedInput
              sx={{ flex: 1,borderRadius:'10px' }}
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
            <Button variant="contained" color="success" onClick={handleSavePassword} sx={{ ml: 1 ,borderRadius:'10px'}}>
              Done
            </Button>
          </FormControl>
        )}
        <Button variant="outlined" color="error" onClick={handleSignOut} sx={{ width: "100%" ,borderRadius:'10px'}}>
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}

export default UserProfile;
