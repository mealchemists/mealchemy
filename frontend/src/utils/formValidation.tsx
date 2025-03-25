export const validatePassword = (password, setPasswordError) => {
    const minLength = 6; 
    const maxLength = 50; 
  
    // Regex to check if password contains atleast one special character
    const strongPasswordRegex = /[!@#$%^&*(),.?":{}|<>]/;
  
    if (password.length < minLength) {
      setPasswordError(`Password must be at least ${minLength} characters long.`)
      return false;
    }
  
    if (password.length > maxLength) {
      setPasswordError(`Password cannot exceed ${maxLength} characters.`)
      return false;
    }
  
    if (!strongPasswordRegex.test(password)) {
      setPasswordError('Password must contain at least one special character.')
      return false;
    }
    setPasswordError("");
    return true;
  }
  

export const validateEmail = (email, setEmailError) => {
    if (!email) {
        setEmailError("Email is required.");
        return false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        setEmailError("Invalid email format.");
        return false;
    }
    setEmailError("");
    return true;
};

export const validateConfirmPassword = (password, confirmPassword, setConfirmPasswordError) => {
    if (confirmPassword !== password) {
        setConfirmPasswordError("Passwords do not match.");
        return false;
    }
    setConfirmPasswordError("");
    return true;
};