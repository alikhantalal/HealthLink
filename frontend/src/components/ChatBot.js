import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  List,
  ListItem,
  Box,
  Avatar,
  Paper,
  Chip,
  IconButton,
  Divider,
  LinearProgress,
  CircularProgress,
  useTheme
} from "@mui/material";
import { 
  Send as SendIcon,
  SmartToy as BotIcon,
  Mic as MicIcon,
  HealthAndSafety as HealthIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { chatbotApi, doctorsApi } from '../services/apiService';

const ChatBot = () => {
  const [symptoms, setSymptoms] = useState('');
  const [response, setResponse] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState([
    { 
      type: 'bot', 
      message: "Hello! I'm your AI Health Assistant. Please describe your symptoms in detail, and I'll help you find the right care.",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFetchingDoctors, setIsFetchingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  // Scroll to bottom of chat on new messages
  const chatEndRef = React.useRef(null);
  const chatContainerRef = React.useRef(null);
  
  // Set fixed height for chat container to prevent page fluctuation
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.style.height = '400px';
    }
  }, []);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  // Enhanced symptom analysis to determine the appropriate specialist
  const analyzeSymptoms = useCallback((symptoms) => {
    // Convert to lowercase for easier matching
    const symptomText = symptoms.toLowerCase();
    
    // More extensive keyword matching for different specialties
    if (symptomText.length < 10 || symptomText === 'hi' || symptomText === 'hello') {
      return {
        response: "I need more information about your symptoms to make an accurate recommendation. Please provide details like what you're experiencing, how long it's been happening, and any other symptoms you may have.",
        specialist: null,
        needsMoreInfo: true
      };
    }
    
    // Dental issues
    if (
      symptomText.includes('tooth') || 
      symptomText.includes('teeth') || 
      symptomText.includes('gum') || 
      symptomText.includes('dental') ||
      symptomText.includes('cavity') ||
      symptomText.includes('toothache') ||
      symptomText.includes('mouth pain')
    ) {
      return {
        response: `Based on your symptoms related to dental issues, I recommend consulting with a Dentist. Dental problems like toothaches, gum issues, or cavities require specialized care.`,
        specialist: 'Dentist'
      };
    }
    
    // Eye issues
    if (
      symptomText.includes('eye') || 
      symptomText.includes('vision') || 
      symptomText.includes('seeing') || 
      symptomText.includes('sight') ||
      symptomText.includes('blind') ||
      symptomText.includes('glasses') ||
      symptomText.includes('blurry')
    ) {
      return {
        response: `Based on your symptoms related to vision or eye issues, I recommend consulting with an Ophthalmologist. They specialize in diagnosing and treating eye conditions and can help with vision problems.`,
        specialist: 'Ophthalmologist'
      };
    }
    
    // Heart issues
    if (
      symptomText.includes('heart') || 
      symptomText.includes('chest pain') || 
      symptomText.includes('palpitations') || 
      symptomText.includes('shortness of breath') ||
      symptomText.includes('chest tightness') ||
      symptomText.includes('rapid heartbeat') ||
      symptomText.includes('irregular heartbeat')
    ) {
      return {
        response: `Based on your symptoms related to heart or chest pain, I recommend consulting with a Cardiologist. These symptoms could indicate various heart conditions that require specialized evaluation.`,
        specialist: 'Cardiologist'
      };
    }
    
    // Skin issues
    if (
      symptomText.includes('skin') || 
      symptomText.includes('rash') || 
      symptomText.includes('acne') || 
      symptomText.includes('itch') ||
      symptomText.includes('derma') ||
      symptomText.includes('mole') ||
      symptomText.includes('eczema')
    ) {
      return {
        response: `Based on your symptoms related to skin conditions, I recommend consulting with a Dermatologist. They specialize in diagnosing and treating skin disorders like rashes, acne, or eczema.`,
        specialist: 'Dermatologist'
      };
    }
    
    // Joint/bone issues
    if (
      symptomText.includes('bone') || 
      symptomText.includes('joint') || 
      symptomText.includes('fracture') || 
      symptomText.includes('sprain') ||
      symptomText.includes('arthritis') ||
      symptomText.includes('knee pain') ||
      symptomText.includes('back pain')
    ) {
      return {
        response: `Based on your symptoms related to bone or joint issues, I recommend consulting with an Orthopedic Surgeon. They specialize in musculoskeletal conditions and can help with pain, injuries, or arthritis.`,
        specialist: 'Orthopedic Surgeon'
      };
    }
    
    // Mental health issues
    if (
      symptomText.includes('depress') || 
      symptomText.includes('anxiety') || 
      symptomText.includes('stress') || 
      symptomText.includes('mental') ||
      symptomText.includes('panic') ||
      symptomText.includes('mood') ||
      symptomText.includes('suicide')
    ) {
      return {
        response: `Based on your symptoms related to mental health, I recommend consulting with a Psychiatrist. Mental health is important, and they can provide proper diagnosis and treatment options.`,
        specialist: 'Psychiatrist'
      };
    }
    
    // Digestive issues
    if (
      symptomText.includes('stomach') || 
      symptomText.includes('digest') || 
      symptomText.includes('bowel') || 
      symptomText.includes('nausea') ||
      symptomText.includes('vomit') ||
      symptomText.includes('diarrhea') ||
      symptomText.includes('constipation')
    ) {
      return {
        response: `Based on your symptoms related to digestive issues, I recommend consulting with a Gastroenterologist. They specialize in digestive system disorders and can provide appropriate treatment.`,
        specialist: 'Gastroenterologist'
      };
    }
    
    // Neurological issues
    if (
      symptomText.includes('headache') || 
      symptomText.includes('migraine') || 
      symptomText.includes('nerve') || 
      symptomText.includes('brain') ||
      symptomText.includes('seizure') ||
      symptomText.includes('dizzy') ||
      symptomText.includes('numbness')
    ) {
      return {
        response: `Based on your symptoms related to neurological issues, I recommend consulting with a Neurologist. They specialize in brain and nervous system disorders and can help with conditions like headaches or dizziness.`,
        specialist: 'Neurologist'
      };
    }
    
    // For general symptoms or nonspecific issues, recommend a General Physician
    return {
      response: `Based on the information provided, I recommend consulting with a General Physician first. They can perform an initial assessment and refer you to a specialist if needed. For more specific recommendations, please provide more details about your symptoms.`,
      specialist: 'General Physician'
    };
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symptoms.trim() || submitting) return;
    
    // Add user message to chat
    setChats(prev => [...prev, { 
      type: 'user', 
      message: symptoms,
      timestamp: new Date()
    }]);
    
    // Reset input field
    const input = symptoms;
    setSymptoms('');
    
    // Show typing indicator
    setIsTyping(true);
    setSubmitting(true);
    
    // Process user input
    handleChat(input);
  };

  // Handle AI-based chatbot response
  const handleChat = async (input) => {
    try {
      console.log('Processing symptoms:', input);
      
      let responseData;
      let doctorsData = [];
      
      // Try to use backend API if available
      try {
        const chatResponse = await chatbotApi.getResponse(input);
        console.log('Chatbot API response:', chatResponse);
        
        if (chatResponse && chatResponse.response) {
          responseData = { 
            response: chatResponse.response,
            specialist: extractSpecialist(chatResponse.response)
          };
        } else if (typeof chatResponse === 'string') {
          responseData = {
            response: chatResponse,
            specialist: extractSpecialist(chatResponse)
          };
        } else {
          // If API format is unexpected, fall back to local analysis
          responseData = analyzeSymptoms(input);
        }
      } catch (error) {
        console.log('Error with API, falling back to local analysis:', error);
        // Fall back to local symptom analysis if API fails
        responseData = analyzeSymptoms(input);
      }
      
      // Add bot response to chat
      setChats(prev => [...prev, { 
        type: 'bot', 
        message: responseData.response,
        timestamp: new Date()
      }]);
      
      setResponse(responseData.response);
      
      // If we have a specialist identified and more info isn't needed, fetch doctors
      if (responseData.specialist && !responseData.needsMoreInfo) {
        try {
          // Add "searching for doctors" message to chat
          setChats(prev => [...prev, { 
            type: 'bot', 
            message: `Searching for ${responseData.specialist}s near you...`,
            timestamp: new Date(),
            isSearching: true
          }]);
          
          // Fetch doctors data
          const response = await doctorsApi.getBySpecialization(responseData.specialist);
          console.log('Doctor API response:', response);
          
          // Process the response to get doctor list
          if (response && response.success && response.data) {
            doctorsData = response.data;
          } else if (response && Array.isArray(response)) {
            doctorsData = response;
          } else if (response && response.data) {
            doctorsData = response.data;
          }
          
          // Update the searching message with doctor recommendations
          if (doctorsData.length > 0) {
            setChats(prev => {
              // Find the last searching message and replace it
              const newChats = [...prev];
              const searchIndex = newChats.findIndex(c => c.isSearching);
              
              if (searchIndex !== -1) {
                newChats[searchIndex] = {
                  type: 'bot',
                  message: `I've found ${doctorsData.length} ${responseData.specialist}s who can help you. Here they are:`,
                  timestamp: new Date(),
                  isDoctorRecommendation: true,
                  doctors: doctorsData
                };
              } else {
                // If no searching message found, just add new message
                newChats.push({
                  type: 'bot',
                  message: `I've found ${doctorsData.length} ${responseData.specialist}s who can help you. Here they are:`,
                  timestamp: new Date(),
                  isDoctorRecommendation: true,
                  doctors: doctorsData
                });
              }
              
              return newChats;
            });
          } else {
            // Update with "no doctors found" message
            setChats(prev => {
              // Find the last searching message and replace it
              const newChats = [...prev];
              const searchIndex = newChats.findIndex(c => c.isSearching);
              
              if (searchIndex !== -1) {
                newChats[searchIndex] = {
                  type: 'bot',
                  message: `I couldn't find any ${responseData.specialist}s available at the moment. You may want to try a different specialist type or check back later.`,
                  timestamp: new Date()
                };
              } else {
                // If no searching message found, just add new message
                newChats.push({
                  type: 'bot',
                  message: `I couldn't find any ${responseData.specialist}s available at the moment. You may want to try a different specialist type or check back later.`,
                  timestamp: new Date()
                });
              }
              
              return newChats;
            });
          }
        } catch (error) {
          console.error('Error fetching doctors:', error);
          
          // Update with error message
          setChats(prev => {
            // Find the last searching message and replace it
            const newChats = [...prev];
            const searchIndex = newChats.findIndex(c => c.isSearching);
            
            if (searchIndex !== -1) {
              newChats[searchIndex] = {
                type: 'bot',
                message: `I had trouble finding ${responseData.specialist}s: ${error.message || "Database error"}. Please try again later.`,
                timestamp: new Date(),
                isError: true
              };
            } else {
              // If no searching message found, just add new message
              newChats.push({
                type: 'bot',
                message: `I had trouble finding ${responseData.specialist}s: ${error.message || "Database error"}. Please try again later.`,
                timestamp: new Date(),
                isError: true
              });
            }
            
            return newChats;
          });
        }
      }
      
    } catch (error) {
      console.error('Error processing chat:', error);
      
      setChats(prev => [...prev, { 
        type: 'bot', 
        message: `I'm having trouble processing your symptoms. Please try being more specific with your description.`,
        timestamp: new Date(),
        isError: true
      }]);
      
    } finally {
      setIsTyping(false);
      setSubmitting(false);
      setIsFetchingDoctors(false);
    }
  };

  // Extract specialist from response text
  const extractSpecialist = (response) => {
    if (!response) return 'General Physician';
    
    const text = response.toLowerCase();
    if (text.includes('dentist')) return 'Dentist';
    if (text.includes('cardiologist')) return 'Cardiologist';
    if (text.includes('neurologist')) return 'Neurologist';
    if (text.includes('gastroenterologist')) return 'Gastroenterologist';
    if (text.includes('pulmonologist')) return 'Pulmonologist';
    if (text.includes('ophthalmologist')) return 'Ophthalmologist';
    if (text.includes('dermatologist')) return 'Dermatologist';
    if (text.includes('orthopedic')) return 'Orthopedic Surgeon';
    if (text.includes('psychiatrist')) return 'Psychiatrist';
    
    return 'General Physician'; // Default
  };

  // Close doctor list modal
  const handleClose = () => {
    setOpen(false);
  };

  // Handle "Show More" redirection
  const handleShowMore = () => {
    const specialistKey = extractSpecialist(response)?.toLowerCase().replace(/\s+/g, "-");
    if (specialistKey) {
      navigate(`/specialists/${specialistKey}`);
    }
  };

  // Format time to display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Generate placeholder image if doctor has no profile picture
  const getInitials = (name) => {
    if (!name) return 'DR';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <Card 
      elevation={3} 
      sx={{ 
        maxWidth: 500, // Reduced from 600
        margin: '20px auto', 
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: '#ffffff20', 
            mr: 2,
            p: 0.5
          }}
        >
          <HealthIcon color="inherit" />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            AI Health Assistant
          </Typography>
          <Typography variant="body2">
            Powered by HealthLink
          </Typography>
        </Box>
      </Box>
      
      {/* Chat Area - with fixed height container */}
      <Box 
        ref={chatContainerRef}
        sx={{ 
          height: 400, 
          overflowY: 'auto',
          p: 2,
          bgcolor: '#f8f9fa', 
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {chats.map((chat, index) => (
          <Box 
            key={index} 
            sx={{ 
              alignSelf: chat.type === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              mb: 2
            }}
          >
            {/* Message bubble */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: chat.type === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 1
              }}
            >
              {/* Avatar */}
              <Avatar 
                sx={{ 
                  bgcolor: chat.type === 'user' 
                    ? theme.palette.secondary.main 
                    : theme.palette.primary.main,
                  width: 36,
                  height: 36,
                  mt: 0.5
                }}
              >
                {chat.type === 'user' ? <PersonIcon /> : <BotIcon />}
              </Avatar>
              
              {/* Message content */}
              <Paper 
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: chat.type === 'user' 
                    ? theme.palette.secondary.light
                    : (chat.isError ? '#ffebee' : 'white'),
                  color: chat.type === 'user' 
                    ? 'white'
                    : 'text.primary',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 10,
                    [chat.type === 'user' ? 'right' : 'left']: -10,
                    width: 0,
                    height: 0,
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    [chat.type === 'user' 
                      ? 'borderLeft' 
                      : 'borderRight']: `10px solid ${
                      chat.type === 'user' 
                        ? theme.palette.secondary.light
                        : (chat.isError ? '#ffebee' : 'white')
                    }`
                  }
                }}
              >
                {/* Show error icon for error messages */}
                {chat.isError && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'error.main' }}>
                    <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption" fontWeight="medium">
                      Error
                    </Typography>
                  </Box>
                )}
                
                {/* Show info icon for need more info messages */}
                {chat.needsMoreInfo && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'info.main' }}>
                    <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption" fontWeight="medium">
                      More Info Needed
                    </Typography>
                  </Box>
                )}
                
                {/* Show loading indicator for searching message */}
                {chat.isSearching ? (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {chat.message}
                    </Typography>
                    <LinearProgress sx={{ borderRadius: 1, height: 4, mb: 0.5 }} />
                  </Box>
                ) : (
                  <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                    {chat.message}
                  </Typography>
                )}
                
                {/* Timestamp */}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1, 
                    textAlign: 'right',
                    color: chat.type === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary' 
                  }}
                >
                  {formatTime(chat.timestamp)}
                </Typography>
                
                {/* Doctor recommendations */}
                {chat.isDoctorRecommendation && chat.doctors && chat.doctors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ my: 1 }} />
                    {chat.doctors.map((doctor, idx) => (
                      <Box 
                        key={idx}
                        sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          bgcolor: theme.palette.background.subtle || '#f5f5f5',
                          mb: 1.5,
                          border: '1px solid rgba(0,0,0,0.05)'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          {doctor.profile ? (
                            <Avatar 
                              src={doctor.profile} 
                              alt={doctor.name} 
                              sx={{ width: 40, height: 40 }}
                            />
                          ) : (
                            <Avatar 
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                bgcolor: theme.palette.primary.main,
                                fontSize: '1rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {getInitials(doctor.name)}
                            </Avatar>
                          )}
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {doctor.name || "Doctor Name"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {Array.isArray(doctor.qualification) 
                                ? doctor.qualification.join(", ") 
                                : (doctor.qualification || "Specialist")}
                            </Typography>
                          </Box>
                          
                          <Chip 
                            label="Available Today"
                            size="small"
                            color="success"
                            sx={{ height: 24 }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 0.5 }} />
                            <Typography variant="body2">
                              {doctor.experience || "N/A"} yrs
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 0.5 }} />
                            <Typography variant="body2">
                              Islamabad
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight="medium" color="primary.main">
                            Fee: Rs. {doctor.fee || "N/A"}
                          </Typography>
                          
                          <Button 
                            variant="outlined" 
                            size="small" 
                            color="primary"
                            sx={{ borderRadius: 6 }}
                            onClick={() => navigate(`/doctor/${doctor._id}`)}
                            disabled={!doctor._id}
                          >
                            View Profile
                          </Button>
                        </Box>
                      </Box>
                    ))}
                    
                    <Button 
                      variant="text" 
                      size="small" 
                      color="primary"
                      onClick={handleShowMore}
                      sx={{ mt: 1 }}
                    >
                      View More Specialists
                    </Button>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36, mr: 1 }}>
              <BotIcon />
            </Avatar>
            <Paper 
              elevation={1}
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'white',
                minWidth: 100
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: theme.palette.primary.main,
                    animation: 'pulse 1s infinite',
                    mr: 1,
                    '@keyframes pulse': {
                      '0%': { opacity: 0.5, transform: 'scale(0.8)' },
                      '50%': { opacity: 1, transform: 'scale(1.2)' },
                      '100%': { opacity: 0.5, transform: 'scale(0.8)' },
                    }
                  }} 
                />
                <Box 
                  sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: theme.palette.primary.main,
                    animation: 'pulse 1s infinite 0.2s',
                    mr: 1
                  }} 
                />
                <Box 
                  sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: theme.palette.primary.main,
                    animation: 'pulse 1s infinite 0.4s'
                  }} 
                />
              </Box>
            </Paper>
          </Box>
        )}
        
        {/* Scroll anchor */}
        <div ref={chatEndRef} />
      </Box>
      
      {/* Input Area */}
      <CardContent 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          borderTop: '1px solid rgba(0,0,0,0.08)'
        }}
      >
        <TextField
          placeholder="Enter your symptoms in detail..."
          fullWidth
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          variant="outlined"
          size="small"
          disabled={isTyping || isFetchingDoctors || submitting}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
              p: 0.5,
              pl: 1.5
            }
          }}
        />
        
        <IconButton 
          color="primary" 
          sx={{ 
            bgcolor: theme.palette.primary.main, 
            color: 'white', 
            '&:hover': { 
              bgcolor: theme.palette.primary.dark 
            },
            '&.Mui-disabled': {
              bgcolor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled
            }
          }}
          type="submit"
          disabled={!symptoms.trim() || isTyping || isFetchingDoctors || submitting}
        >
          {submitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <SendIcon />
          )}
        </IconButton>
        
        <IconButton 
          sx={{ 
            bgcolor: theme.palette.secondary.main, 
            color: 'white', 
            '&:hover': { 
              bgcolor: theme.palette.secondary.dark 
            },
            '&.Mui-disabled': {
              bgcolor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled
            }
          }}
          disabled={isTyping || isFetchingDoctors || submitting}
        >
          <MicIcon />
        </IconButton>
      </CardContent>
    </Card>
  );
};

export default ChatBot;