const express = require("express");
const router = express.Router();
const UnverifiedDoctor = require("../models/UnverifiedDoctor");
const Doctor = require("../models/DoctorsData");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import the enhanced verification service
const verificationService = require("../services/verification-service");

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

// Route to verify PMDC number directly
router.post("/verify-pmdc", async (req, res) => {
  try {
    const { pmdcNumber } = req.body;
    
    if (!pmdcNumber) {
      return res.status(400).json({
        success: false,
        error: "PMDC number is required"
      });
    }
    
    // Verify PMDC number using the verification service
    const verificationResult = await verificationService.verifyPmdcRegistration(pmdcNumber);
    
    res.json({
      success: true,
      verification_result: verificationResult
    });
  } catch (error) {
    console.error("Error verifying PMDC number:", error);
    res.status(500).json({
      success: false,
      error: "Verification error",
      details: error.message
    });
  }
});

// Route to verify documents with enhanced verification
router.post("/verify-documents", uploadFields, handleUploadErrors, async (req, res) => {
  try {
    console.log("Enhanced verification request received");
    
    // Get files from request
    const files = req.files;
    
    if (!files || !files.license || !files.degree) {
      return res.status(400).json({
        success: false,
        error: "Missing required documents"
      });
    }
    
    // Get doctor data from form
    const doctorData = {
      name: req.body.name || '',
      email: req.body.email || '',
      specialization: req.body.specialization || '',
      phone: req.body.phone || '',
      pmdc: req.body.pmdc || '' // Make sure to include PMDC number if available
    };
    
    // Verify license document with enhanced verification (including PMDC check)
    const licenseResult = await verificationService.verifyDocument(
      files.license[0].path,
      'license',
      doctorData
    );
    
    // Verify degree document
    const degreeResult = await verificationService.verifyDocument(
      files.degree[0].path,
      'degree',
      doctorData
    );
    
    // Determine overall verification status
    let overallStatus = 'pending_review';
    
    // Priority: PMDC verification > OCR verification
    if (licenseResult.pmdc_verification && licenseResult.pmdc_verification.pmdc_verified) {
      // If PMDC verification was successful, use its status
      overallStatus = licenseResult.pmdc_verification.status;
    } else if (licenseResult.status === 'verified' && degreeResult.status === 'verified') {
      // If both OCR verifications passed, mark as verified
      overallStatus = 'verified';
    } else if (licenseResult.status === 'suspicious' || degreeResult.status === 'suspicious') {
      // If any document is suspicious, mark as suspicious
      overallStatus = 'suspicious';
    }
    
    // Return verification results
    res.json({
      success: true,
      status: overallStatus,
      message: 'Documents have been analyzed with AI and PMDC verification.',
      verification_results: {
        license: licenseResult,
        degree: degreeResult
      }
    });
    
  } catch (error) {
    console.error("Error in verification:", error);
    res.status(500).json({
      success: false,
      error: "Verification error",
      details: error.message
    });
  }
});

// UPDATED: Route for doctor registration with enhanced verification
router.post(
  "/register",
  uploadFields,
  handleUploadErrors,
  [
    body("name", "Name must be at least 3 characters long").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("phone", "Phone number must be valid").isMobilePhone(),
    body("password", "Password must be at least 6 characters long").isLength({ min: 6 }),
    body("specialization", "Specialization is required").notEmpty(),
    body("experience", "Experience must be a number").isNumeric(),
    body("fee", "Fee must be a number").isNumeric(),
    body("pmdc", "PMDC number is required").notEmpty() // PMDC validation
  ],
  async (req, res) => {
    try {
      console.log("Doctor registration request received");
      console.log("Request body:", req.body); // Debug log to see all fields
      console.log("PMDC number received:", req.body.pmdc); // Debug log for PMDC
      
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      
      // Check if required files are uploaded
      if (!req.files || !req.files.license || !req.files.degree || !req.files.profile_photo) {
        console.log("Missing required files. Files received:", req.files);
        return res.status(400).json({ 
          success: false, 
          error: "Required documents are missing" 
        });
      }
      
      // Check for existing user
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: "A user with this email already exists" 
        });
      }

      // Also check if the doctor is already in the unverified collection
      const existingUnverifiedDoctor = await UnverifiedDoctor.findOne({ email: req.body.email });
      if (existingUnverifiedDoctor) {
        return res.status(400).json({ 
          success: false, 
          error: "An application with this email is already pending verification" 
        });
      }
      
      // Process qualifications
      let qualifications = [];
      if (req.body.qualifications) {
        try {
          qualifications = JSON.parse(req.body.qualifications);
        } catch (e) {
          qualifications = req.body.qualifications.split(',').map(q => q.trim());
        }
      }
      
      // First create the user account
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      
      console.log("Creating user with email:", req.body.email);
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: "doctor"
      });
      
      console.log("User created with ID:", user._id);
      
      // Prepare document paths
      const licensePath = `/uploads/${req.files.license[0].filename}`;
      const degreePath = `/uploads/${req.files.degree[0].filename}`;
      const profilePath = `/uploads/${req.files.profile_photo[0].filename}`;
      
      // Set default analysis results to ensure record is created even if verification fails
      const defaultAnalysisResults = {
        success: true,
        status: 'pending_review',
        message: 'Documents are pending review by our team.'
      };
      
      // Create unverified doctor record with PMDC number
      console.log("Creating unverified doctor record with PMDC:", req.body.pmdc);
      const unverifiedDoctor = new UnverifiedDoctor({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        specialization: req.body.specialization,
        qualification: qualifications,
        experience: req.body.experience,
        fee: req.body.fee,
        pmdc: req.body.pmdc, // Make sure PMDC is saved
        user_id: user._id,
        profile_photo: profilePath,
        verification_status: 'pending',
        documents: {
          license: licensePath,
          degree: degreePath
        },
        submitted_at: new Date(),
        ai_analysis_results: defaultAnalysisResults
      });
      
      // Save the record BEFORE attempting verification
      await unverifiedDoctor.save();
      console.log("Unverified doctor record saved successfully with PMDC:", req.body.pmdc);
      
      // Handle enhanced verification separately, so it doesn't block registration
      let aiAnalysisResults = defaultAnalysisResults; // Start with the default
      
      try {
        console.log("Preparing enhanced verification");
        
        // Doctor data for verification including PMDC
        const doctorData = {
          name: req.body.name,
          email: req.body.email,
          pmdc: req.body.pmdc
        };
        
        // Process license with PMDC verification
        const licenseResult = await verificationService.verifyDocument(
          req.files.license[0].path,
          'license',
          doctorData
        );
        
        // Process degree
        const degreeResult = await verificationService.verifyDocument(
          req.files.degree[0].path,
          'degree',
          doctorData
        );
        
        // Determine overall verification status
        let overallStatus = 'pending_review';
        
        // Priority: PMDC verification > OCR verification
        if (licenseResult.pmdc_verification && licenseResult.pmdc_verification.pmdc_verified) {
          // If PMDC verification was successful, use its status
          overallStatus = licenseResult.pmdc_verification.status;
        } else if (licenseResult.status === 'verified' && degreeResult.status === 'verified') {
          // If both OCR verifications passed, mark as verified
          overallStatus = 'verified';
        } else if (licenseResult.status === 'suspicious' || degreeResult.status === 'suspicious') {
          // If any document is suspicious, mark as suspicious
          overallStatus = 'suspicious';
        }
        
        // Create verification results
        aiAnalysisResults = {
          success: true,
          status: overallStatus,
          message: 'Documents have been analyzed using AI technology and PMDC verification.',
          verification_results: {
            license: licenseResult,
            degree: degreeResult
          }
        };
        
        console.log("Enhanced verification complete. Status:", overallStatus);
        
      } catch (error) {
        console.error("Error in verification process:", error.message);
        // Continue with registration using default results
      }
      
      // Only update the record with new analysis results if verification succeeded and returned different results
      if (aiAnalysisResults !== defaultAnalysisResults) {
        try {
          await UnverifiedDoctor.findByIdAndUpdate(
            unverifiedDoctor._id,
            { $set: { ai_analysis_results: aiAnalysisResults } }
          );
          console.log("Doctor record updated with enhanced verification results");
        } catch (updateError) {
          console.error("Error updating doctor record with verification results:", updateError);
          // Not critical - registration already succeeded
        }
      }
      
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
        message: "Doctor registration successful. Your application is pending verification by our team.",
        authToken,
        verification_status: 'pending'
      });
      
    } catch (error) {
      console.error("Error in doctor registration:", error);
      console.error("Stack trace:", error.stack);
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
    // Check if the user exists in the main doctors collection
    const doctor = await Doctor.findOne({ user_id: req.user.id });
    
    if (doctor) {
      return res.json({
        success: true,
        verification_status: 'approved',
        message: "Your application has been approved."
      });
    }
    
    // Check if the user exists in the unverified doctors collection
    const unverifiedDoctor = await UnverifiedDoctor.findOne({ user_id: req.user.id });
    
    if (!unverifiedDoctor) {
      return res.status(404).json({ 
        success: false, 
        error: "Doctor profile not found" 
      });
    }
    
    res.json({
      success: true,
      verification_status: unverifiedDoctor.verification_status,
      message: getStatusMessage(unverifiedDoctor.verification_status),
      submitted_at: unverifiedDoctor.submitted_at,
      reviewed_at: unverifiedDoctor.reviewed_at
    });
    
  } catch (error) {
    console.error("Error fetching verification status:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

// Helper function to get status message
function getStatusMessage(status) {
  switch(status) {
    case 'pending':
      return "Your application is pending review by our team. We'll notify you once the verification is complete.";
    case 'pending_approval':
      return "Your documents have been verified. Your application is now awaiting final review by our team.";
    case 'approved':
      return "Congratulations! Your application has been approved. You can now log in as a verified doctor.";
    case 'rejected':
      return "We're sorry, but your application has been rejected. Please contact our support team for more information.";
    case 'suspicious':
      return "We've detected some issues with your documents. Our team will review them manually. This may take additional time.";
    default:
      return "Application status unknown.";
  }
}

// ADMIN ROUTES

// Route 3: Get all unverified doctors - GET /api/doctor-registration/pending-applications
router.get("/pending-applications", fetchuser, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Access denied. Admin privileges required." 
      });
    }
    
    // Get all pending applications
    const pendingDoctors = await UnverifiedDoctor.find({ 
      verification_status: 'pending' 
    }).sort({ submitted_at: -1 }); // Sort by newest first
    
    res.json({
      success: true,
      count: pendingDoctors.length,
      data: pendingDoctors
    });
    
  } catch (error) {
    console.error("Error fetching pending applications:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

// Route 4: Review doctor application - PUT /api/doctor-registration/review/:id
router.put("/review/:id", fetchuser, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Access denied. Admin privileges required." 
      });
    }
    
    const { status, admin_notes } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid status (approved or rejected) is required" 
      });
    }
    
    // Find the unverified doctor
    const unverifiedDoctor = await UnverifiedDoctor.findById(req.params.id);
    
    if (!unverifiedDoctor) {
      return res.status(404).json({ 
        success: false, 
        error: "Application not found" 
      });
    }
    
    // Update status and add review timestamp
    unverifiedDoctor.verification_status = status;
    unverifiedDoctor.admin_notes = admin_notes || '';
    unverifiedDoctor.reviewed_at = new Date();
    
    await unverifiedDoctor.save();
    
    // If approved, create entry in the verified doctors collection
    if (status === 'approved') {
      // Check if the user associated with the doctor application exists
      console.log("Finding user with ID:", unverifiedDoctor.user_id);
      const userDoc = await User.findById(unverifiedDoctor.user_id);
      
      if (!userDoc) {
        console.log("User not found. Creating a new user");
        // Generate a default password
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = "changeme123"; // Should be randomly generated in production
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);
        
        // Create a new user for the doctor
        const newUser = new User({
          name: unverifiedDoctor.name,
          email: unverifiedDoctor.email,
          password: hashedPassword,
          role: "doctor"
        });
        
        await newUser.save();
        console.log("New user created for approved doctor:", newUser._id);
        
        // Update the unverified doctor record with the new user_id
        unverifiedDoctor.user_id = newUser._id;
        await unverifiedDoctor.save();
      } else {
        // Ensure the user role is set to doctor
        userDoc.role = "doctor";
        await userDoc.save();
        console.log("Existing user updated for approved doctor");
      }
      
      console.log("Creating verified doctor record");
      // Create the verified doctor record with PMDC number
      const doctor = new Doctor({
        name: unverifiedDoctor.name,
        email: unverifiedDoctor.email,
        specialization: unverifiedDoctor.specialization,
        qualification: unverifiedDoctor.qualification,
        experience: unverifiedDoctor.experience,
        fee: unverifiedDoctor.fee,
        pmdc: unverifiedDoctor.pmdc, // Include PMDC number in verified doctor record
        user_id: unverifiedDoctor.user_id,
        profile: unverifiedDoctor.profile_photo,
        verified: true
      });
      
      await doctor.save();
      console.log("Verified doctor record created successfully");
    }
    
    res.json({
      success: true,
      message: `Application has been ${status}`,
      data: {
        id: unverifiedDoctor._id,
        name: unverifiedDoctor.name,
        status: unverifiedDoctor.verification_status
      }
    });
    
  } catch (error) {
    console.error("Error reviewing application:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error",
      details: error.message
    });
  }
});

// Route 5: Get application details - GET /api/doctor-registration/application/:id
router.get("/application/:id", fetchuser, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Access denied. Admin privileges required." 
      });
    }
    
    const application = await UnverifiedDoctor.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ 
        success: false, 
        error: "Application not found" 
      });
    }
    
    res.json({
      success: true,
      data: application
    });
    
  } catch (error) {
    console.error("Error fetching application details:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

module.exports = router;