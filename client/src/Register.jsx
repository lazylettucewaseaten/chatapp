import { useState } from "react";
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Box 
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Client-side validations
    let hasError = false;
    const newFieldErrors = { username: "", password: "", confirmPassword: "" };

    if (username.trim().length < 3) {
      newFieldErrors.username = "Username must be at least 3 characters long";
      hasError = true;
    }

    if (password.length < 6) {
      newFieldErrors.password = "Password must be at least 6 characters long";
      hasError = true;
    }

    if (password !== confirmPassword) {
      newFieldErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    setFieldErrors(newFieldErrors);

    if (hasError) {
      return;
    }

    try {
      await axios.post("https://chatappmedia.onrender.com/register", { username, password });
      setSuccess("Registration successful! You can now log in.");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setSuccess("");
      if (err.response && err.response.data && err.response.data.error) {
        const backendError = err.response.data.error;
        setError(backendError);
        // Highlight field if it is a username issue
        if (backendError.toLowerCase().includes("username")) {
          setFieldErrors(prev => ({ ...prev, username: backendError }));
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  const handleSwitchToLogin = () => {
    navigate("/login");
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Container maxWidth="xs">
        <Paper 
          elevation={10} 
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 3, 
              fontWeight: 'bold', 
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Create Account
          </Typography>
          <form onSubmit={handleRegister} style={{ width: '100%' }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (fieldErrors.username) {
                  setFieldErrors(prev => ({ ...prev, username: "" }));
                }
                setError("");
              }}
              variant="outlined"
              fullWidth
              required
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: fieldErrors.username ? 'error.main' : 'rgba(102, 126, 234, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: fieldErrors.username ? 'error.main' : '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: fieldErrors.username ? 'error.main' : '#667eea',
                  },
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors(prev => ({ ...prev, password: "" }));
                }
                setError("");
              }}
              variant="outlined"
              fullWidth
              required
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: fieldErrors.password ? 'error.main' : 'rgba(102, 126, 234, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: fieldErrors.password ? 'error.main' : '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: fieldErrors.password ? 'error.main' : '#667eea',
                  },
                },
              }}
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors(prev => ({ ...prev, confirmPassword: "" }));
                }
                setError("");
              }}
              variant="outlined"
              fullWidth
              required
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: fieldErrors.confirmPassword ? 'error.main' : 'rgba(102, 126, 234, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: fieldErrors.confirmPassword ? 'error.main' : '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: fieldErrors.confirmPassword ? 'error.main' : '#667eea',
                  },
                },
              }}
            />
            {error && (
              <Typography 
                color="error" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 2,
                  fontWeight: 'medium'
                }}
              >
                {error}
              </Typography>
            )}
            {success && (
              <Typography 
                color="success" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 2,
                  fontWeight: 'medium',
                  color: '#4caf50'
                }}
              >
                {success}
              </Typography>
            )}
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              sx={{
                mb: 2,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)'
                }
              }}
            >
              Register
            </Button>
            <Button 
              variant="text" 
              fullWidth
              onClick={handleSwitchToLogin}
              sx={{
                color: '#667eea',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.1)'
                }
              }}
            >
              Already have an account? Log in
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterForm;