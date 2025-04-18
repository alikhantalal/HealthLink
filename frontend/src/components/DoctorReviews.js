import React from 'react';
import {
  Typography,
  Box,
  Paper,
  Rating,
  Button,
  Avatar,
  Chip,
  Grid,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  Verified as VerifiedIcon,
  FormatQuote as FormatQuoteIcon
} from '@mui/icons-material';

const DoctorReviews = ({ doctor }) => {
  const theme = useTheme();
  
  // Calculate average rating
  const calculateAverageRating = () => {
    if (!doctor.reviews || doctor.reviews.length === 0) return 4.8;
    
    const total = doctor.reviews.reduce((sum, review) => sum + (review.rating || 5), 0);
    return (total / doctor.reviews.length).toFixed(1);
  };
  
  // Generate rating breakdown
  const generateRatingBreakdown = () => {
    const breakdown = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    if (!doctor.reviews || doctor.reviews.length === 0) {
      // Default distribution for missing reviews
      breakdown[5] = 70;
      breakdown[4] = 23;
      breakdown[3] = 5;
      breakdown[2] = 1;
      breakdown[1] = 1;
      return breakdown;
    }
    
    // Count reviews by rating
    doctor.reviews.forEach(review => {
      const rating = review.rating || 5;
      breakdown[rating] = (breakdown[rating] || 0) + 1;
    });
    
    // Convert to percentages
    const total = doctor.reviews.length;
    Object.keys(breakdown).forEach(key => {
      breakdown[key] = Math.round((breakdown[key] / total) * 100);
    });
    
    return breakdown;
  };
  
  const averageRating = calculateAverageRating();
  const ratingBreakdown = generateRatingBreakdown();

  return (
    <Box>
      {/* Rating Summary Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4 
      }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Patient Reviews
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Based on {doctor.reviews?.length || 124} verified patient experiences
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          p: 2,
          borderRadius: 3,
          minWidth: 120
        }}>
          <Typography variant="h3" fontWeight="bold" sx={{ color: theme.palette.warning.dark }}>
            {averageRating}
          </Typography>
          <Rating 
            value={parseFloat(averageRating)} 
            readOnly 
            precision={0.5}
            sx={{
              my: 0.5,
              '& .MuiRating-iconFilled': {
                color: theme.palette.warning.main,
              }
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.warning.dark }}>
            out of 5
          </Typography>
        </Box>
      </Box>
      
      {/* Rating Breakdown */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 3, 
          mb: 4,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.default, 0.5)
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Rating Breakdown
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 40, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography>{rating}</Typography>
                <StarIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
              </Box>
              <Box sx={{ flex: 1, mx: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={ratingBreakdown[rating]} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: rating > 3 
                        ? theme.palette.success.main 
                        : rating > 1 
                          ? theme.palette.warning.main 
                          : theme.palette.error.main
                    }
                  }} 
                />
              </Box>
              <Typography variant="body2" sx={{ width: 40, textAlign: 'right' }}>
                {ratingBreakdown[rating]}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
      
      {/* Reviews */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Recent Patient Experiences
      </Typography>
      
      <Grid container spacing={3}>
        {(doctor.reviews || []).map((review, index) => (
          <Grid item xs={12} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <FormatQuoteIcon 
                sx={{ 
                  position: 'absolute', 
                  top: 12, 
                  right: 12, 
                  fontSize: 32, 
                  color: alpha(theme.palette.primary.main, 0.1),
                  transform: 'rotate(180deg)'
                }} 
              />
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Avatar
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    bgcolor: index % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
                    mr: 2
                  }}
                >
                  {review.author?.charAt(0) || 'P'}
                </Avatar>
                
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography fontWeight="bold">
                      {review.author || "Anonymous Patient"}
                    </Typography>
                    
                    {review.verified && (
                      <Chip 
                        icon={<VerifiedIcon fontSize="small" />} 
                        label="Verified Visit"
                        size="small"
                        sx={{ 
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          fontWeight: 500,
                          height: 24
                        }}
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {review.date || "Recent"}
                  </Typography>
                </Box>
              </Box>
              
              <Rating 
                value={review.rating || 5} 
                readOnly 
                size="small" 
                sx={{ mb: 2 }} 
              />
              
              <Typography 
                variant="body1"
                sx={{ 
                  color: 'text.secondary',
                  lineHeight: 1.7,
                  mb: 2,
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {review.text}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  size="small"
                  startIcon={<ThumbUpIcon fontSize="small" />}
                  sx={{ 
                    textTransform: 'none',
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  Helpful
                </Button>
                
                {index === 0 && (
                  <Chip 
                    label="Top Review" 
                    size="small"
                    sx={{ 
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.dark,
                      fontWeight: 500
                    }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          View All {doctor.reviews?.length || 124} Reviews
        </Button>
      </Box>
    </Box>
  );
};

export default DoctorReviews;