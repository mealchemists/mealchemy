function validatePassword(password) {
    const minLength = 8; 
    const maxLength = 50; 
  
    // Regex to check if password contains at least one lowercase, one uppercase, one digit, and one special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;
  
    if (password.length < minLength) {
      return { isValid: false, message: `Password must be at least ${minLength} characters long.` };
    }
  
    if (password.length > maxLength) {
      return { isValid: false, message: `Password cannot exceed ${maxLength} characters.` };
    }
  
    if (!strongPasswordRegex.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.',
      };
    }
  
    return { isValid: true, message: 'Password is strong.' };
  }
  
  export default validatePassword;