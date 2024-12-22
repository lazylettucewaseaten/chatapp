import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  IconButton 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import zIndex from "@mui/material/styles/zIndex";

const Chat = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [roomname, setRoomname] = useState("");
  const [socketId, setSocketId] = useState("");
  const [messages, setMessages] = useState([]);
  const userid = localStorage.getItem("userId");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || !userid) {
      navigate("/login");
      return;
    }

    const newSocket = io("https://chatapp-dct7.onrender.com", { auth: { token } });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setSocketId(newSocket.id);
    });

    newSocket.on("recieve-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [navigate, userid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message && room) {
      const msgData = { message, userId: userid };
      socket.emit("message", { ...msgData, room });
      setMessages((prev) => [...prev, msgData]);
      setMessage("");
    }
  };

  const onRoomJoin = (e) => {
    e.preventDefault();
    if (roomname) {
      socket.emit("join-room", roomname);
      setRoom(roomname);
      setRoomname("");
      axios.get(`https://chatapp-dct7.onrender.com/rooms/${roomname}/messages`).then((res) => {
        setMessages(res.data);
      });
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <Box 
    sx={{
      minHeight: '100vh',
      position: 'relative', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2,
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("https://images3.alphacoders.com/133/1337543.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(10px)', 
        zIndex: -1, 
        transform: 'scale(1.1)'
      }
    }}
    >
      <Container 
  maxWidth="sm" 
  sx={{
    height:'80vh',
  }  }>
        <Paper 
          elevation={12} 
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            // height:'90vh'
          }}
        >
          <Box 
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Ashley's Chat Room
            </Typography>
            <IconButton 
              onClick={handleSignOut} 
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 2 }}>
            <form onSubmit={onRoomJoin} style={{ marginBottom: 16 }}>
              <TextField
                value={roomname}
                onChange={(e) => setRoomname(e.target.value)}
                label="Join Room"
                variant="outlined"
                fullWidth
                sx={{ 
                  mb: 1,
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
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                sx={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    opacity: 0.9
                  }
                }}
              >
                Join Room
              </Button>
            </form>

            <Box
              sx={{
                height: '60vh',
                overflowY: 'auto',
                border: '1px solid rgba(102, 126, 234, 0.2)',
                borderRadius: 2,
                mb: 2,
                p: 2,
                background: 'rgba(255,255,255,0.7)'
              }}
            >
              {messages.map((m, i) => (
                <Box 
                  key={i}
                  sx={{
                    display: 'flex',
                    justifyContent: m.userId === userid ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      backgroundColor: m.userId === userid ? '#e6f2ff' : '#fff0f0',
                      color: m.userId === userid ? '#0d47a1' : '#b71c1c',
                      padding: '10px',
                      borderRadius: '12px',
                      maxWidth: '70%',
                      wordWrap: 'break-word',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  >
                    {m.message}
                  </Typography>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  label="Message"
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    mr: 1,
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
                <IconButton 
                  type="submit" 
                  color="primary"
                  sx={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      opacity: 0.9
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Chat;