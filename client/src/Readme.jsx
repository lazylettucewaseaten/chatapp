import { useNavigate } from "react-router-dom";
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Readme = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const handleBack = () => {
    if (token) {
      navigate("/chat");
    } else {
      navigate("/login");
    }
  };

  const features = [
    {
      title: "User Authentication",
      desc: "Choose a name and hop on any-time and from any-where."
    },
    {
      title: "Chat Rooms",
      desc: "Want personal chat, well make a unique room-name, join others room simply via name."
    },
    {
      title: "Real-time Messaging",
      desc: "Instant text messaging inside rooms."
    },
    {
      title: "End-to-End Encryption",
      desc: "Secure database storage with  AES-256-CBC encryption and decryption."
    },
    {
      title: "Media & Image Sharing",
      desc: "Share images directly in chat."
    },
    {
      title: "Admin Room Panel",
      desc: "Room creators become admins who can delete the room and its entire history."
    }
  ];

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
      <Container maxWidth="md">
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <InfoIcon sx={{ fontSize: 40, mr: 1, color: '#667eea' }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Chat App Features For Users Not for Devs
            </Typography>
          </Box>

          <List sx={{ width: '100%', mb: 3 }}>
            {features.map((f, i) => (
              <ListItem key={i} sx={{ alignItems: 'flex-start', px: 0, py: 1.5 }}>
                <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                  {/* <Box 
                    sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(45deg, #667eea, #764ba2)' 
                    }} 
                  /> */}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4a4a4a' }}>
                      {f.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {f.desc}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              transition: 'transform 0.2s ease-in-out',
              padding: '10px 24px',
              fontWeight: 'bold',
              borderRadius: 2,
              '&:hover': {
                transform: 'scale(1.02)',
                background: 'linear-gradient(45deg, #667eea, #764ba2)'
              }
            }}
          >
            {token ? "Back to Chat" : "Back to Login"}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Readme;
