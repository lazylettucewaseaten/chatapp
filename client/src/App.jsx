import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Chat = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [roomUsers,setRoomUsers]=useState([]);
  const [room, setRoom] = useState("");
  //room is to be usde in code and roomname is because of my  input box
  const [roomname, setRoomname] = useState("");
  const [socketId, setSocketId] = useState("");
  const [messages, setMessages] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false); 
  const userid = localStorage.getItem("userId");
  const messagesEndRef = useRef(null);
  const userMapRef = useRef(new Map());
  let currentuseradmin=false;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || !userid) {
      navigate("/login");
      return;
    }

    const newSocket = io("http://localhost:3000", { auth: { token } });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setSocketId(newSocket.id);
    });

    newSocket.on("recieve-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on("recieve-user-joining", (event) => {
      // console.log("here i am now")
      // console.log(event)
      const specificUser = userMapRef.current.get(event.userid);
      if(!specificUser){
        const newUser = {
          username: event.userid,
          isadmin: false, 
        };
        userMapRef.current.set(newUser.username, newUser);
        setRoomUsers((prev) => [...prev, newUser]);
      }
      // setRoomUsers(event);
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

  const onRoomJoin = async (e) => {
    e.preventDefault();
    if (roomname) {
      socket.emit("join-room",{roomname,userid});
      setRoom(roomname);
      setRoomname("");
      axios.get(`http://localhost:3000/rooms/${roomname}/messages`).then((res) => {
        setMessages(res.data);
      });
      // console.log("afsd")
      // console.log(messages)
      // console.log("sfd")
      await axios.patch(`http://localhost:3000/makeroom/${roomname}/${userid}`)
      const adminlist=await axios.get(`http://localhost:3000/getadmins/${roomname}`)
      if(adminlist.data.length!=0){
        const userlist=adminlist.data[0].users
        const adminInfoList = userlist.map((element) => ({
          username: element.username,
          isadmin: element.isadmin,
        }));        
        setRoomUsers(() => {
          userMapRef.current.clear(); 
          adminInfoList.forEach((admininfo) => {
            userMapRef.current.set(admininfo.username, admininfo);
          });
          return Array.from(userMapRef.current.values());
        });
        socket.emit("userjoining",{userid,roomname})
        // console.log(admininfo)
      }
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const deltemessage=()=>{
    const usercheck=userMapRef.current.get(userid)
    if(usercheck.isadmin){
      axios.delete(`http://localhost:3000/delete/${room}`)
    }
  }

  const adminpanel=()=>{
    setShowAdminPanel((prev) => !prev);
  }

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
              onClick={deltemessage}
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <DeleteIcon/>
            </IconButton>
            <IconButton
              onClick={adminpanel}
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <AdminPanelSettingsIcon/>
            </IconButton>
            
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
              // console.log(m)
                <Box 
                  key={i}
                  sx={{
                    display: 'flex',
                    justifyContent: m.userId === userid ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                    <Box
                      sx={{
                        backgroundColor: m.userId === userid ? '#e6f2ff' : '#fff0f0',
                        color: m.userId === userid ? '#0d47a1' : '#b71c1c',
                        padding: '10px',
                        borderRadius: '12px',
                        maxWidth: '100%',
                        wordWrap: 'break-word',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        position: 'relative',
                      }}
                    >
                      {/* Sender's Name */}
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: m.userId === userid ? '#0d47a1' : '#b71c1c',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          mb: '4px',
                          textAlign: 'left', 
                        }}
                      >
                      {m.userId === userid ? 'You' : m.userId}
                      
                    </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      backgroundColor: m.userId === userid ? '#e6f2ff' : '#fff0f0',
                      color: m.userId === userid ? '#0d47a1' : '#b71c1c',
                      padding: '10px',
                      borderRadius: '12px',
                      maxWidth: '100%',
                      wordWrap: 'break-word',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  >
                    {m.message}
                  </Typography>
                </Box>
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
      {showAdminPanel && (
        <Paper
          elevation={8}
          sx={{
            padding: 2,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
          {roomUsers.map((user, index) => (
              <Box 
                key={index} 
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
              >
                <Typography>{user.username}</Typography>
                <Typography 
                  sx={{ 
                    color: user.isadmin ? 'green' : 'red', 
                    fontWeight: 'bold' 
                  }}
                >
                  {user.isadmin ? 'Admin' : 'Not Admin'}
                </Typography>
              </Box>
            ))}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Chat;