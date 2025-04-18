import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Avatar,
  IconButton,
  Divider,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';

// Import utils
import { getInitials } from '../utils/doctorUtils';

const ChatWithDoctorModal = ({ open, handleClose, doctor }) => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sending, setSending] = useState(false);
  const endOfMessagesRef = useRef(null);
  
  // Sample initial messages
  useEffect(() => {
    if (open) {
      // Reset chat when reopened
      setChatHistory([
        {
          sender: 'doctor',
          message: `Hello! I'm ${doctor?.name || 'Dr. John'}. How can I help you today?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [open, doctor]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message to chat
    setChatHistory(prev => [...prev, {
      sender: 'user',
      message: message.trim(),
      timestamp: new Date()
    }]);
    
    // Clear input
    setMessage('');
    
    // Simulate doctor response (would be replaced with actual API call)
    setSending(true);
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        sender: 'doctor',
        message: getAutomatedResponse(message),
        timestamp: new Date()
      }]);
      setSending(false);
    }, 1500);
  };

  // Handle pressing Enter to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp for chat bubbles
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Automated responses based on keywords (would be replaced with real backend)
  const getAutomatedResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('appointment') || msg.includes('book') || msg.includes('schedule')) {
      return "You can book an appointment by clicking the 'Book Appointment' button on my profile. This will let you select a suitable time slot.";
    }
    
    if (msg.includes('cost') || msg.includes('fee') || msg.includes('charges') || msg.includes('price')) {
      return `My consultation fee is Rs. ${doctor?.fee || '2,000'} for initial visits and follow-ups may vary. For detailed information, please check the Services tab on my profile.`;
    }
    
    if (msg.includes('headache') || msg.includes('pain')) {
      return "I understand you're experiencing pain. For proper diagnosis, I would need more details about the location, intensity, and duration. However, I recommend scheduling an in-person consultation for a thorough examination.";
    }
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hello! How can I assist you with your health concerns today?";
    }
    
    if (msg.includes('thank')) {
      return "You're welcome! Feel free to schedule an appointment if you need further assistance.";
    }
    
    return "Thank you for your message. For specific medical advice, I recommend scheduling an appointment. Is there anything specific you'd like to know about my services or availability?";
  };

  return (
    <Modal 
      open={open} 
      onClose={handleClose}
      aria-labelledby="chat-with-doctor-modal"
    >
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '600px' },
          maxHeight: '80vh',
          borderRadius: 4,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        elevation={24}
      >
        {/* Header */}
        <Box 
          sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {doctor?.profile ? (
              <Avatar 
                src={doctor.profile} 
                alt={doctor.name}
                sx={{ width: 48, height: 48, mr: 2 }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  mr: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  color: theme.palette.primary.main,
                  fontWeight: 'bold'
                }}
              >
                {getInitials(doctor?.name || 'Doctor')}
              </Avatar>
            )}
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Chat with {doctor?.name || 'Doctor'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {doctor?.specialization || 'Specialist'}
              </Typography>
            </Box>
          </Box>
          
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'white',
              bgcolor: alpha('#fff', 0.2),
              '&:hover': {
                bgcolor: alpha('#fff', 0.3),
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Chat Message Area */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: alpha(theme.palette.background.default, 0.5),
            maxHeight: '50vh'
          }}
        >
          {chatHistory.map((chat, index) => (
            <Box 
              key={index} 
              sx={{ 
                alignSelf: chat.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                flexDirection: chat.sender === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 1
              }}
            >
              {chat.sender === 'doctor' && (
                <Avatar
                  src={doctor?.profile}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {doctor?.profile ? null : <MedicalIcon fontSize="small" />}
                </Avatar>
              )}
              
              <Box>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderTopLeftRadius: chat.sender === 'user' ? 3 : 0,
                    borderTopRightRadius: chat.sender === 'user' ? 0 : 3,
                    bgcolor: chat.sender === 'user' 
                      ? theme.palette.primary.main 
                      : alpha(theme.palette.background.paper, 0.9),
                    color: chat.sender === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {chat.message}
                  </Typography>
                </Paper>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 0.5, 
                    color: 'text.secondary',
                    textAlign: chat.sender === 'user' ? 'right' : 'left'
                  }}
                >
                  {formatTime(chat.timestamp)}
                </Typography>
              </Box>
              
              {chat.sender === 'user' && (
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: theme.palette.secondary.main,
                    color: 'white'
                  }}
                >
                  {getInitials('Me')}
                </Avatar>
              )}
            </Box>
          ))}
          
          {/* Typing indicator when doctor is "replying" */}
          {sending && (
            <Box 
              sx={{ 
                alignSelf: 'flex-start',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 1
              }}
            >
              <Avatar
                src={doctor?.profile}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {doctor?.profile ? null : <MedicalIcon fontSize="small" />}
              </Avatar>
              
              <Paper
                elevation={1}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  borderRadius: 3,
                  borderTopLeftRadius: 0,
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CircularProgress size={8} />
                  <CircularProgress size={8} sx={{ animationDelay: '0.2s' }} />
                  <CircularProgress size={8} sx={{ animationDelay: '0.4s' }} />
                </Box>
              </Paper>
            </Box>
          )}
          
          {/* Message end reference for auto-scrolling */}
          <div ref={endOfMessagesRef} />
        </Box>
        
        <Divider />
        
        {/* Input Area */}
        <Box sx={{ p: 2, display: 'flex', gap: 1, bgcolor: 'background.paper' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                padding: 1
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
            sx={{ 
              borderRadius: 3,
              minWidth: 'auto',
              width: 56,
              height: 56
            }}
          >
            <SendIcon />
          </Button>
        </Box>
        
        {/* Disclaimer */}
        <Box sx={{ p: 2, pt: 0 }}>
          <Typography variant="caption" color="text.secondary">
            Note: This chat is for general inquiries only. For medical emergencies, please call emergency services. For specific medical advice, schedule an appointment.
          </Typography>
        </Box>
      </Paper>
    </Modal>
  );
};

export default ChatWithDoctorModal;