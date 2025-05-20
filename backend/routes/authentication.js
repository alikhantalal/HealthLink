const express = require("express");
const Admin = require("../models/Admin"); // Import the Admin model
const Doctor = require("../models/DoctorsData");
const UnverifiedDoctor = require("../models/UnverifiedDoctor"); // Import the UnverifiedDoctor model
const User = require("../models/User"); // Import the User model
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "project";

// Login endpoint - POST "/api/auth/login"
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    try {
      console.log("Login request:", req.body);
      
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { email, password, role } = req.body;
      
      // Check if trying to login as admin
      if (role === 'admin') {
        // Find admin by email in the admin collection
        let admin = await Admin.findOne({ email });
        if (!admin) {
          return res.status(400).json({ 
            success: false, 
            error: "Invalid admin credentials" 
          });
        }

        // Verify admin password
        const passwordCompare = await bcrypt.compare(password, admin.password);
        if (!passwordCompare) {
          return res.status(400).json({ 
            success: false, 
            error: "Invalid admin credentials" 
          });
        }

        // Generate JWT token for admin
        const payload = {
          user: {
            id: admin.id,
            role: 'admin'
          }
        };
        
        const authToken = jwt.sign(payload, JWT_SECRET);
        
        return res.json({ 
          success: true, 
          authToken,
          user: {
            name: admin.name,
            email: admin.email,
            role: 'admin'
          }
        });
      } 
      else if (role === 'doctor') {
        // For doctor login, first check in User collection
        console.log("Looking for user with email:", email);
        let user = await User.findOne({ email });

        if (!user) {
          console.log("No user found with this email");
          return res.status(400).json({ 
            success: false, 
            error: "Invalid credentials" 
          });
        }

        // Verify password from User collection
        console.log("Verifying password for user");
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
          console.log("Password verification failed");
          return res.status(400).json({ 
            success: false, 
            error: "Invalid credentials" 
          });
        }

        // Check if user is a doctor
        if (user.role !== 'doctor') {
          console.log("User is not a doctor");
          return res.status(400).json({
            success: false,
            error: "You're not registered as a doctor"
          });
        }

        // First check in verified doctors
        console.log("Checking verified doctors collection");
        let doctor = await Doctor.findOne({ email });
        
        if (doctor) {
          console.log("Doctor found in verified collection!");
          
          // Generate JWT token for verified doctor
          const payload = {
            user: {
              id: user._id, // Use user ID instead of doctor ID
              role: 'doctor'
            }
          };
          
          const authToken = jwt.sign(payload, JWT_SECRET);
          
          return res.json({ 
            success: true, 
            authToken,
            verification_status: 'approved',
            doctor_id: doctor._id,
            user_id: user._id
          });
        } else {
          // Check in unverified doctors
          console.log("Checking unverified doctors collection");
          let unverifiedDoctor = await UnverifiedDoctor.findOne({ email });
          
          if (!unverifiedDoctor) {
            console.log("Doctor profile not found in either collection");
            return res.status(400).json({ 
              success: false, 
              error: "Doctor profile not found" 
            });
          }
          
          // Check status
          console.log("Unverified doctor found with status:", unverifiedDoctor.verification_status);
          if (unverifiedDoctor.verification_status === 'rejected') {
            return res.status(400).json({
              success: false,
              error: "Your application has been rejected"
            });
          }
          
          // Generate JWT token for unverified doctor
          const payload = {
            user: {
              id: user._id, // Use user ID instead of doctor ID
              role: 'doctor'
            }
          };
          
          const authToken = jwt.sign(payload, JWT_SECRET);
          
          return res.json({ 
            success: true, 
            authToken,
            verification_status: unverifiedDoctor.verification_status || 'pending',
            doctor_id: unverifiedDoctor._id,
            user_id: user._id
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: "Invalid role specified"
        });
      }
    } catch (error) {
      console.error("Login error:", error.message);
      console.error("Error stack:", error.stack); // Add stack trace for debugging
      res.status(500).json({ 
        success: false, 
        error: "Internal Server Error",
        details: error.message 
      });
    }
  }
);

// Get User Data using POST "/api/auth/getuser"
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    console.log("Get user request for user ID:", req.user.id);
    
    // Check if user is admin
    if (req.user.role === 'admin') {
      const admin = await Admin.findById(req.user.id).select("-password");
      
      if (!admin) {
        return res.status(404).json({
          success: false,
          error: "Admin not found"
        });
      }
      
      return res.json({
        success: true,
        user: {
          ...admin.toObject(),
          role: 'admin'
        }
      });
    } else if (req.user.role === 'doctor') {
      // Get user data first to ensure user exists
      const user = await User.findById(req.user.id).select("-password");
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }
      
      // Check if doctor is verified
      const doctor = await Doctor.findOne({ email: user.email });
      
      if (doctor) {
        // Doctor is verified
        return res.json({
          success: true,
          user: {
            ...user.toObject(),
            doctor_profile: doctor.toObject(),
            role: 'doctor',
            verification_status: 'approved'
          }
        });
      } else {
        // Check in unverified doctors
        const unverifiedDoctor = await UnverifiedDoctor.findOne({ email: user.email });
        
        if (!unverifiedDoctor) {
          return res.status(404).json({
            success: false,
            error: "Doctor profile not found"
          });
        }
        
        return res.json({
          success: true,
          user: {
            ...user.toObject(),
            doctor_profile: unverifiedDoctor.toObject(),
            role: 'doctor',
            verification_status: unverifiedDoctor.verification_status || 'pending'
          }
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid role"
      });
    }
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

// Test Route: To check if API is working
router.get("/", (req, res) => {
  res.json({ message: "Authentication API is working!" });
});

module.exports = router;