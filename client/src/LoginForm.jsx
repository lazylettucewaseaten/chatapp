import React, { useState } from "react";
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Box 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://chatapp-dct7.onrender.com/login", { username, password });
      const token = res.data.token;
      const id = res.data.userId;
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", id);
      // console.log(res.data)
      navigate("/chat");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  const onSwitchToRegister = () => {
    navigate("/register");
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
            Welcome Back
          </Typography>
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              fullWidth
              required
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              fullWidth
              required
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
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
              Login
            </Button>
            <Button 
              variant="text" 
              fullWidth
              onClick={onSwitchToRegister}
              sx={{
                color: '#667eea',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.1)'
                }
              }}
            >
              Don't have an account? Register
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginForm;