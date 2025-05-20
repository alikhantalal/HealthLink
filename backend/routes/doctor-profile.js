const express = require("express");
const router = express.Router();
const Doctor = require("../models/DoctorsData");
const User = require("../models/User");
const fetchuser = require("../middleware/fetchuser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file storage (profile images)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

// Error handling middleware for multer
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum file size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
  } else if (err) {
    // A non-Multer error occurred
    console.error('Upload error:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
  next();
};

// Middleware to check if user is a doctor
const isDoctor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: "Access denied. Doctor privileges required."
      });
    }
    next();
  } catch (error) {
    console.error("Error in isDoctor middleware:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};

// Route 1: Get doctor profile by user ID - GET /api/doctor-profile/user/:userId
router.get("/user/:userId", fetchuser, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if the request is for the authenticated user's profile or admin request
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only view your own profile."
      });
    }
    
    const doctorProfile = await Doctor.findOne({ user_id: userId });
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        error: "Doctor profile not found"
      });
    }
    
    res.json({
      success: true,
      data: doctorProfile
    });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

// Route 2: Get doctor profile by doctor ID - GET /api/doctor-profile/:id
router.get("/:id", async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctorProfile = await Doctor.findById(doctorId);
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        error: "Doctor profile not found"
      });
    }
    
    res.json({
      success: true,
      data: doctorProfile
    });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

// Route 3: Update doctor profile - PUT /api/doctor-profile/:id
router.put("/:id", fetchuser, isDoctor, async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctorProfile = await Doctor.findById(doctorId);
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        error: "Doctor profile not found"
      });
    }
    
    // Check if the profile belongs to the authenticated user
    if (!doctorProfile.user_id) {
      console.warn(`Doctor ${doctorId} has no user_id field`);
      // Skip the authorization check if user_id is missing
    } else if (doctorProfile.user_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only update your own profile."
      });
    }
    
    // Fields that can be updated
    const {
      name,
      specialization,
      qualification,
      experience,
      fee,
      clinicAddress,
      bio,
      phone,
      availability
    } = req.body;
    
    // Create update object with only provided fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (specialization) updateFields.specialization = specialization;
    if (qualification) updateFields.qualification = qualification;
    if (experience !== undefined) updateFields.experience = experience;
    if (fee !== undefined) updateFields.fee = fee;
    if (clinicAddress) updateFields.clinicAddress = clinicAddress;
    if (bio) updateFields.bio = bio;
    if (phone) updateFields.phone = phone;
    if (availability) updateFields.availability = availability;
    
    // Update the profile
    const updatedProfile = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updateFields },
      { new: true } // Return the updated document
    );
    
    // If name was updated, also update the user record
    if (name && doctorProfile.user_id) {
      await User.findByIdAndUpdate(
        req.user.id,
        { $set: { name } }
      );
    }
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

// Route 4: Update doctor profile image - PUT /api/doctor-profile/:id/image
router.put("/:id/image", fetchuser, isDoctor, upload.single('profile_photo'), handleUploadErrors, async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctorProfile = await Doctor.findById(doctorId);
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        error: "Doctor profile not found"
      });
    }
    
    // Check if the profile belongs to the authenticated user
    if (!doctorProfile.user_id) {
      console.warn(`Doctor ${doctorId} has no user_id field`);
      // Skip the authorization check if user_id is missing
    } else if (doctorProfile.user_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only update your own profile."
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file uploaded"
      });
    }
    
    // If there's an existing profile image, delete it
    if (doctorProfile.profile && doctorProfile.profile.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '..', doctorProfile.profile);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Update profile with new image path
    const imagePath = `/uploads/${req.file.filename}`;
    
    const updatedProfile = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: { profile: imagePath } },
      { new: true }
    );
    
    res.json({
      success: true,
      message: "Profile image updated successfully",
      data: {
        profile: updatedProfile.profile
      }
    });
  } catch (error) {
    console.error("Error updating doctor profile image:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

// Route 5: Get verification status - GET /api/doctor-profile/verification-status/:id
router.get("/verification-status/:id", fetchuser, async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctorProfile = await Doctor.findById(doctorId);
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        error: "Doctor profile not found"
      });
    }
    
    // Check if the profile belongs to the authenticated user or user is admin
    if (!doctorProfile.user_id) {
      console.warn(`Doctor ${doctorId} has no user_id field`);
      // Skip the authorization check if user_id is missing
    } else if (doctorProfile.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Access denied."
      });
    }
    
    res.json({
      success: true,
      verification_status: doctorProfile.verification_status || 'pending',
      verification_details: doctorProfile.verification_details
    });
  } catch (error) {
    console.error("Error fetching verification status:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

// Route 6: Update doctor availability - PUT /api/doctor-profile/:id/availability
router.put("/:id/availability", fetchuser, isDoctor, async (req, res) => {
  try {
    console.log("Request to update availability received");
    console.log("Request params:", req.params);
    console.log("Request user:", req.user);
    
    const doctorId = req.params.id;
    const { availability, userId } = req.body;
    
    // Validate request
    if (!availability) {
      return res.status(400).json({
        success: false,
        error: "Availability data is required"
      });
    }
    
    // Log the availability data
    console.log("Availability data received:", JSON.stringify(availability).substring(0, 200) + "...");
    
    // Basic validation of the availability object structure
    const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const isValidStructure = requiredDays.every(day => 
      availability[day] && 
      typeof availability[day].isAvailable === 'boolean' && 
      Array.isArray(availability[day].slots)
    );
    
    if (!isValidStructure) {
      return res.status(400).json({
        success: false,
        error: "Invalid availability format. Each day must have isAvailable (boolean) and slots (array)."
      });
    }
    
    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: "Doctor not found"
      });
    }
    
    console.log("Doctor found:", {
      id: doctor._id,
      name: doctor.name,
      hasUserId: !!doctor.user_id
    });
    
    // Check if the profile belongs to the authenticated user
    if (!doctor.user_id) {
      console.warn(`Doctor ${doctorId} has no user_id field. Proceeding with update anyway.`);
      // Skip the authorization check if user_id is missing
    } else {
      try {
        // Try to compare user IDs safely
        if (doctor.user_id.toString() !== req.user.id) {
          console.warn(`User ID mismatch: ${doctor.user_id.toString()} !== ${req.user.id}`);
          
          // If userId was provided in request body, check that too
          if (userId && userId === req.user.id) {
            console.log("Using user ID from request body, which matches authenticated user");
            // Continue with the update
          } else {
            return res.status(403).json({
              success: false,
              error: "Access denied. You can only update your own availability."
            });
          }
        }
      } catch (authError) {
        console.error("Error during authorization check:", authError);
        // Continue anyway if we're in development mode
        if (process.env.NODE_ENV === 'development') {
          console.warn("Bypassing authorization check in development mode");
        } else {
          return res.status(403).json({
            success: false,
            error: "Authorization error. Please try again."
          });
        }
      }
    }
    
    // Update availability
    console.log(`Updating availability for doctor ${doctorId}`);
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: { availability } },
      { new: true }
    );
    
    console.log("Availability updated successfully");
    res.json({
      success: true,
      message: "Availability updated successfully",
      data: {
        availability: updatedDoctor.availability
      }
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

module.exports = router;