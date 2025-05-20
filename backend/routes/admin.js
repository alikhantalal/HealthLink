const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const User = require("../models/User");
const Doctor = require("../models/DoctorsData");
const UnverifiedDoctor = require("../models/UnverifiedDoctor");
const fetchuser = require("../middleware/fetchuser");
const verificationService = require('../services/verification-service'); // Import verification service

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    console.log("Checking admin privileges for user:", req.user);
    
    // Check if req.user exists and has a role property
    if (!req.user || !req.user.role) {
      console.log("User role not found in token data");
      return res.status(403).json({
        success: false,
        error: "Access denied. Invalid user data."
      });
    }
    
    // Check if the user role is admin
    if (req.user.role !== 'admin') {
      console.log("User role is not admin:", req.user.role);
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required."
      });
    }
    
    console.log("Admin privileges confirmed");
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};

// Route for the pending applications API endpoint
router.get("/pending-applications", fetchuser, isAdmin, async (req, res) => {
  console.log("Pending applications request received");
  try {
    // Fetch all pending doctor applications
    const pendingDoctors = await UnverifiedDoctor.find({ 
      verification_status: 'pending' 
    }).sort({ submitted_at: -1 });
    
    console.log(`Found ${pendingDoctors.length} pending applications`);
    
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

// New Route: Get PMDC pending approval applications
router.get("/pending-approval", fetchuser, isAdmin, async (req, res) => {
  try {
    const pendingApprovalDoctors = await UnverifiedDoctor.find({ 
      verification_status: 'pending_approval' 
    }).sort({ submitted_at: -1 });
    
    res.json({
      success: true,
      count: pendingApprovalDoctors.length,
      data: pendingApprovalDoctors
    });
  } catch (error) {
    console.error("Error fetching pending approval applications:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

// Route 1: Get admin profile - GET /api/admin/profile
router.get("/profile", fetchuser, isAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: "Admin not found"
      });
    }
    
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

// Route 2: Get dashboard stats - GET /api/admin/dashboard-stats
router.get("/dashboard-stats", fetchuser, isAdmin, async (req, res) => {
  try {
    // Count total users, doctors, pending verifications
    const totalUsers = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments();
    const pendingVerifications = await UnverifiedDoctor.countDocuments({ verification_status: 'pending' });
    const pendingApproval = await UnverifiedDoctor.countDocuments({ verification_status: 'pending_approval' });
    const rejectedApplications = await UnverifiedDoctor.countDocuments({ verification_status: 'rejected' });
    
    // Count PMDC verified applications
    const pmdcVerifiedCount = await UnverifiedDoctor.countDocuments({
      'ai_analysis_results.verification_results.license.pmdc_verification.pmdc_verified': true
    });
    
    // Get recent registrations
    const recentDoctorRegistrations = await UnverifiedDoctor.find()
      .sort({ submitted_at: -1 })
      .limit(5)
      .select('name email specialization submitted_at verification_status pmdc');
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        pendingVerifications,
        pendingApproval,
        rejectedApplications,
        pmdcVerifiedCount,
        recentDoctorRegistrations
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

// Route 3: Get pending doctor verifications - GET /api/admin/pending-verifications
router.get("/pending-verifications", fetchuser, isAdmin, async (req, res) => {
  try {
    const pendingDoctors = await UnverifiedDoctor.find({ 
      verification_status: 'pending' 
    }).sort({ submitted_at: -1 });
    
    res.json({
      success: true,
      count: pendingDoctors.length,
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

// Route 4: Get doctor application details - GET /api/admin/doctor-application/:id
router.get("/doctor-application/:id", fetchuser, isAdmin, async (req, res) => {
  try {
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

// Route 5: Review doctor application - PUT /api/admin/review-application/:id
router.put("/review-application/:id", fetchuser, isAdmin, async (req, res) => {
  try {
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
    
    // Update status and review timestamp
    unverifiedDoctor.verification_status = status;
    unverifiedDoctor.admin_notes = admin_notes || '';
    unverifiedDoctor.reviewed_at = new Date();
    
    await unverifiedDoctor.save();
    
    // If approved, create entry in the verified doctors collection
    if (status === 'approved') {
      const doctor = new Doctor({
        name: unverifiedDoctor.name,
        email: unverifiedDoctor.email,
        specialization: unverifiedDoctor.specialization,
        qualification: unverifiedDoctor.qualification,
        experience: unverifiedDoctor.experience,
        fee: unverifiedDoctor.fee,
        user_id: unverifiedDoctor.user_id,
        profile: unverifiedDoctor.profile_photo,
        pmdc: unverifiedDoctor.pmdc, // Include PMDC number
        verified: true
      });
      
      await doctor.save();
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
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

// New Route: Verify PMDC registration - POST /api/admin/verify-pmdc/:id
router.post("/verify-pmdc/:id", fetchuser, isAdmin, async (req, res) => {
  try {
    const { pmdc_number } = req.body;
    
    if (!pmdc_number) {
      return res.status(400).json({
        success: false,
        error: "PMDC number is required"
      });
    }
    
    // Find the doctor application
    const application = await UnverifiedDoctor.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Application not found"
      });
    }
    
    // Verify PMDC number
    const verificationResult = await verificationService.verifyPmdcRegistration(pmdc_number);
    
    // Update application with PMDC verification results
    application.pmdc = pmdc_number;
    
    // If application doesn't have ai_analysis_results structure, initialize it
    if (!application.ai_analysis_results) {
      application.ai_analysis_results = {
        success: true,
        status: 'pending_review',
        message: 'Documents are being verified.',
        verification_results: {
          license: {},
          degree: {}
        }
      };
    }
    
    // If verification_results doesn't exist yet, initialize it
    if (!application.ai_analysis_results.verification_results) {
      application.ai_analysis_results.verification_results = {
        license: {},
        degree: {}
      };
    }
    
    // Add PMDC verification result to license verification
    application.ai_analysis_results.verification_results.license.pmdc_verification = verificationResult;
    
    // If PMDC verification was successful, update application status
    if (verificationResult.pmdc_verified && verificationResult.status === 'verified') {
      application.verification_status = 'pending_approval';
      application.ai_analysis_results.status = 'likely_valid';
      application.ai_analysis_results.message = 'PMDC verification successful. Application is pending final approval.';
    }
    
    await application.save();
    
    res.json({
      success: true,
      message: "PMDC verification completed",
      verification_result: verificationResult,
      application_status: application.verification_status
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

// Route 6: Get all verified doctors - GET /api/admin/verified-doctors
router.get("/verified-doctors", fetchuser, isAdmin, async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error("Error fetching verified doctors:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

// Route 7: Get all users - GET /api/admin/users
router.get("/users", fetchuser, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") // Don't send passwords
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

// New Route: Get PMDC verification stats
router.get("/pmdc-stats", fetchuser, isAdmin, async (req, res) => {
  try {
    // Get PMDC verification statistics
    const totalVerifications = await UnverifiedDoctor.countDocuments({
      'ai_analysis_results.verification_results.license.pmdc_verification': { $exists: true }
    });
    
    const successfulVerifications = await UnverifiedDoctor.countDocuments({
      'ai_analysis_results.verification_results.license.pmdc_verification.pmdc_verified': true
    });
    
    const failedVerifications = await UnverifiedDoctor.countDocuments({
      'ai_analysis_results.verification_results.license.pmdc_verification.pmdc_verified': false
    });
    
    // Get recent verifications
    const recentVerifications = await UnverifiedDoctor.find({
      'ai_analysis_results.verification_results.license.pmdc_verification': { $exists: true }
    })
      .sort({ submitted_at: -1 })
      .limit(10)
      .select('name email pmdc verification_status ai_analysis_results.verification_results.license.pmdc_verification submitted_at');
      
    res.json({
      success: true,
      data: {
        totalVerifications,
        successfulVerifications,
        failedVerifications,
        verificationRate: totalVerifications > 0 ? (successfulVerifications / totalVerifications) * 100 : 0,
        recentVerifications
      }
    });
  } catch (error) {
    console.error("Error fetching PMDC stats:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

module.exports = router;