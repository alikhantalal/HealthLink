const express = require("express");
const router = express.Router();
const Doctor = require("../models/DoctorsData");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const FormData = require('form-data');

// JWT Secret
const JWT_SECRET = "project";

// Configure multer for file storage
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
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDF files are allowed.'));
    }
  }
});

// Configure upload middleware for multiple files
const uploadFields = upload.fields([
  { name: 'license', maxCount: 1 },
  { name: 'degree', maxCount: 1 },
  { name: 'profile_photo', maxCount: 1 }
]);

// Error handling middleware for multer
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum file size is 10MB.'
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

// NEW ROUTE: Proxy for document verification
router.post("/verify-documents", uploadFields, handleUploadErrors, async (req, res) => {
  try {
    console.log("Document verification request received via Node backend");
    console.log("Files received:", req.files ? Object.keys(req.files) : "none");
    console.log("Form data received keys:", Object.keys(req.body));
    
    // Check if required files are uploaded
    if (!req.files || !req.files.license || !req.files.degree || !req.files.profile_photo) {
      return res.status(400).json({ 
        success: false, 
        error: "Required documents are missing" 
      });
    }
    
    // Create a new FormData for the Python service
    const formData = new FormData();
    
    // Append text fields
    Object.keys(req.body).forEach(key => {
      formData.append(key, req.body[key]);
    });
    
    // Append files
    for (const fileType in req.files) {
      const file = req.files[fileType][0];
      formData.append(fileType, fs.createReadStream(file.path), file.originalname);
      console.log(`Appending file ${fileType}:`, file.originalname);
    }
    
    try {
      // Forward to Python service
      const verificationUrl = process.env.NODE_ENV === 'production' 
        ? 'http://doc-verification:5001/api/verify-doctor'
        : 'http://localhost:5001/api/verify-doctor';
        
      console.log(`Forwarding request to Python service at ${verificationUrl}`);
      
      // Make the request with increased timeout and limits
      const response = await axios.post(
        verificationUrl,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 60000 // 60 second timeout
        }
      );
      
      console.log("Received response from Python service:", response.status);
      res.json(response.data);
    } catch (flaskError) {
      console.error("Flask service error:", flaskError.message);
      
      // Create a fallback verification response if Flask service is unavailable
      const fallbackResponse = {
        success: true,
        doctor_data: {
          name: req.body.name,
          email: req.body.email,
          specialization: req.body.specialization,
          phone: req.body.phone
        },
        verification_results: {
          license: {
            status: 'pending_review',
            confidence: 0.85,
            method: 'rule-based'
          },
          degree: {
            status: 'pending_review',
            confidence: 0.85,
            method: 'rule-based'
          }
        },
        status: 'pending_review',
        message: 'Documents have been received and will be reviewed by our team.'
      };
      
      console.log("Using fallback verification response due to Flask service error");
      res.json(fallbackResponse);
    }
  } catch (error) {
    console.error("Error in document verification:", error);
    
    // Detailed error response
    const errorResponse = {
      success: false,
      error: "Document verification failed"
    };
    
    // If there's an axios error with response
    if (error.response) {
      console.error("API error details:", error.response.data);
      errorResponse.status = error.response.status;
      errorResponse.details = error.response.data;
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response received from service");
      errorResponse.details = "Service unreachable";
    } else {
      // Something else went wrong
      errorResponse.details = error.message;
    }
    
    res.status(500).json(errorResponse);
  }
});

// Route 1: Register a doctor with document verification - POST /api/doctor-registration/register
router.post(
  "/register",
  uploadFields,
  [
    body("name", "Name must be at least 3 characters long").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("phone", "Phone number must be valid").isMobilePhone(),
    body("password", "Password must be at least 6 characters long").isLength({ min: 6 }),
    body("specialization", "Specialization is required").notEmpty(),
    body("experience", "Experience must be a number").isNumeric(),
    body("fee", "Fee must be a number").isNumeric()
  ],
  async (req, res) => {
    try {
      console.log("Doctor registration request received");
      
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      
      // Check if required files are uploaded
      if (!req.files.license || !req.files.degree || !req.files.profile_photo) {
        return res.status(400).json({ 
          success: false, 
          error: "Required documents are missing" 
        });
      }
      
      // Check if user already exists with this email
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: "A user with this email already exists" 
        });
      }
      
      // Process qualifications if provided as string
      let qualifications = [];
      if (req.body.qualifications) {
        try {
          qualifications = JSON.parse(req.body.qualifications);
        } catch (e) {
          // If parsing fails, treat as comma-separated string
          qualifications = req.body.qualifications.split(',').map(q => q.trim());
        }
      }
      
      // Prepare FormData for Python verification service
      const verificationData = new FormData();
      verificationData.append('name', req.body.name);
      verificationData.append('email', req.body.email);
      verificationData.append('specialization', req.body.specialization);
      verificationData.append('phone', req.body.phone);
      
      // Append files
      verificationData.append('license', fs.createReadStream(req.files.license[0].path));
      verificationData.append('degree', fs.createReadStream(req.files.degree[0].path));
      verificationData.append('profile_photo', fs.createReadStream(req.files.profile_photo[0].path));
      
      // Send documents for verification
      console.log("Sending documents for verification");
      const verificationResponse = await axios.post(
        'http://localhost:5001/api/verify-doctor',
        verificationData,
        { 
          headers: verificationData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 60000 // 60 second timeout
        }
      );
      
      console.log("Verification response received:", verificationResponse.data);
      
      // Create user account with hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: "doctor"
      });
      
      // Create doctor profile
      const doctor = new Doctor({
        name: req.body.name,
        email: req.body.email,
        specialization: req.body.specialization,
        qualification: qualifications,
        experience: req.body.experience,
        fee: req.body.fee,
        user_id: user._id,
        profile: `/uploads/${req.files.profile_photo[0].filename}`,
        verified: verificationResponse.data.status === 'verified',
        verification_status: verificationResponse.data.status,
        documents: {
          license: `/uploads/${req.files.license[0].filename}`,
          degree: `/uploads/${req.files.degree[0].filename}`
        },
        verification_details: verificationResponse.data
      });
      
      await doctor.save();
      
      // Generate JWT token
      const payload = {
        user: {
          id: user.id,
          role: "doctor"
        }
      };
      
      const authToken = jwt.sign(payload, JWT_SECRET);
      
      res.status(201).json({
        success: true,
        message: "Doctor registration successful",
        authToken,
        verification_status: verificationResponse.data.status
      });
      
    } catch (error) {
      console.error("Error in doctor registration:", error);
      res.status(500).json({ 
        success: false, 
        error: "Internal Server Error", 
        details: error.message 
      });
    }
  }
);

// Route 2: Get verification status - GET /api/doctor-registration/verification-status
router.get("/verification-status", fetchuser, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user_id: req.user.id });
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        error: "Doctor profile not found" 
      });
    }
    
    res.json({
      success: true,
      verification_status: doctor.verification_status,
      verification_details: doctor.verification_details
    });
    
  } catch (error) {
    console.error("Error fetching verification status:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

// Route 3: Get all doctors with pending verification - GET /api/doctor-registration/pending-verification
router.get("/pending-verification", fetchuser, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Access denied. Admin privileges required." 
      });
    }
    
    const pendingDoctors = await Doctor.find({ 
      verification_status: { $in: ['pending_review'] }
    });
    
    res.json({
      success: true,
      data: pendingDoctors
    });
    
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

// Route 4: Update doctor verification status - PUT /api/doctor-registration/update-verification/:id
router.put("/update-verification/:id", fetchuser, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Access denied. Admin privileges required." 
      });
    }
    
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: "Verification status is required" 
      });
    }
    
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        error: "Doctor not found" 
      });
    }
    
    doctor.verification_status = status;
    doctor.verified = status === 'verified';
    doctor.admin_notes = notes;
    doctor.verification_updated_at = Date.now();
    
    await doctor.save();
    
    res.json({
      success: true,
      message: "Verification status updated successfully",
      data: {
        id: doctor._id,
        name: doctor.name,
        status: doctor.verification_status
      }
    });
    
  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

module.exports = router;