import { useState, useEffect, useRef } from "react";
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
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import InfoIcon from '@mui/icons-material/Info';

const Chat = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [roomUsers,setRoomUsers]=useState([]);
  const [room, setRoom] = useState("");
  //room is to be usde in code and roomname is because of my  input box
  const [roomname, setRoomname] = useState("");
  const [messages, setMessages] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false); 
  const userid = localStorage.getItem("userId");
  const actualname=localStorage.getItem("actualname");
  const messagesEndRef = useRef(null);
  const userMapRef = useRef(new Map());

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || !userid) {
      navigate("/login");
      return;
    }

    const newSocket = io("https://chatappmedia.onrender.com", { auth: { token } });
    setSocket(newSocket);

    newSocket.on("connect", () => {
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
          actualname:event.actualname,
        };
        userMapRef.current.set(newUser.username, newUser);
        setRoomUsers((prev) => [...prev, newUser]);
      }
      // setRoomUsers(event);
    });

    newSocket.on("recieve-room-deleted", ({ room: deletedRoom }) => {
      alert(`The room "${deletedRoom}" has been deleted by an admin.`);
      setRoom("");
      setMessages([]);
      setRoomUsers([]);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      if (socket && room) {
        const msgData = { message: base64String, userId: userid };
        socket.emit("message", { ...msgData, room });
        setMessages((prev) => [...prev, msgData]);
      }
    };
    reader.readAsDataURL(file);
  };

  const onRoomJoin = async (e) => {
    e.preventDefault();
    if (roomname) {
      socket.emit("join-room",{roomname,userid});
      setRoom(roomname);
      setRoomname("");
      
      // console.log("afsd")
      // console.log(messages)
      // console.log("sfd")
      // console.log(actualname)
      await axios.patch(`https://chatappmedia.onrender.com/makeroom/${roomname}/${userid}/${actualname}`)
      const adminlist=await axios.get(`https://chatappmedia.onrender.com/getadmins/${roomname}`)
      if(adminlist.data.length!=0){
        const userlist=adminlist.data[0].users
        const adminInfoList = userlist.map((element) => ({
          username: element.username,
          isadmin: element.isadmin,
          actualname:element.actualname,
        }));        
        setRoomUsers(() => {
          userMapRef.current.clear(); 
          adminInfoList.forEach((admininfo) => {
            userMapRef.current.set(admininfo.username, admininfo);
          });
          return Array.from(userMapRef.current.values());
        });
        socket.emit("userjoining",{userid,roomname,actualname})
        axios.get(`https://chatappmedia.onrender.com/rooms/${roomname}/messages`).then((res) => {
          setMessages(res.data);
        });
      }
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const deltemessage = async () => {
    if (!room) {
      alert("You are not in any chat room.");
      return;
    }
    const usercheck = userMapRef.current.get(userid);
    if (!usercheck || !usercheck.isadmin) {
      alert("Only admins can delete the room.");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the room "${room}"? This will delete all messages and the room itself.`)) {
      try {
        await axios.delete(`https://chatappmedia.onrender.com/delete/${room}/${userid}`);
        if (socket) {
          socket.emit("room-deleted", { room });
        }
        setRoom("");
        setMessages([]);
        setRoomUsers([]);
        alert("Room successfully deleted.");
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || "Failed to delete the room.");
      }
    }
  };

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
        backgroundImage: 'url("https://wallpaperaccess.com/full/269147.png")',
        // backgroundSize: 'cover',
        // backgroundPosition: 'center',
        // filter: 'blur(10px)', 
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {room ? `Room: ${room}` : "lazylettuce Chat Rooms"}
              </Typography>
              <IconButton
                onClick={() => navigate("/readme")}
                color="inherit"
                size="small"
                sx={{
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Box>
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
              {messages.map((m, i) => 
                // console.log(m.userId)
                // console.log(userMapRef.current.get(m.userId).actualname)
              (
                
                <Box 
                  key={i}
                  sx={{
                    display: 'flex',
                    // justifyContent: userMapRef.current.get(m.userId).actualname === actualname ? 'flex-end' : 'flex-start',
                    justifyContent: (m.userId) === userid ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                    <Box
                      sx={{
                        // backgroundColor:userMapRef.current.get(m.userId).actualname === actualname  ? '#e6f2ff' : '#fff0f0',
                        color: (m.userId) === userid  ? '#0d47a1' : '#b71c1c',
                        backgroundColor:(m.userId) === userid  ? '#e6f2ff' : '#fff0f0',
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
                      {m.userId === userid ? 'You' : (userMapRef.current.get(m.userId)?.actualname || 'User')}
                      
                    </Typography>

                  {m.message && m.message.startsWith("data:image/") ? (
                    <Box
                      sx={{
                        backgroundColor: m.userId === userid ? '#e6f2ff' : '#fff0f0',
                        padding: '6px',
                        borderRadius: '12px',
                        maxWidth: '100%',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Box
                        component="img"
                        src={m.message}
                        alt="shared media"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          borderRadius: '8px',
                          display: 'block',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                        onClick={() => {
                          const newWindow = window.open();
                          if (newWindow) {
                            newWindow.document.write(`<img src="${m.message}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`);
                          }
                        }}
                      />
                    </Box>
                  ) : (
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
                  )}
                </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>


            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  component="label"
                  sx={{
                    mr: 1,
                    color: '#667eea',
                    '&:hover': {
                      background: 'rgba(102, 126, 234, 0.1)',
                    }
                  }}
                >
                  <AddPhotoAlternateIcon />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </IconButton>
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
                <Typography>{user.actualname}</Typography>
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