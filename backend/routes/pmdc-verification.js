const express = require('express');
const router = express.Router();
const UnverifiedDoctor = require('../models/UnverifiedDoctor');
const Doctor = require('../models/DoctorsData');
const User = require('../models/User');
const fetchuser = require('../middleware/fetchuser');
const verificationService = require('../services/verification-service');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    // Check if req.user exists and has a role property
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Invalid user data."
      });
    }
    
    // Check if the user role is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required."
      });
    }
    
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};

// Route to get PMDC verification dashboard for admin users
router.get('/dashboard', fetchuser, isAdmin, async (req, res) => {
  try {
    // Get verification statistics
    const pendingVerifications = await UnverifiedDoctor.countDocuments({
      verification_status: 'pending'
    });

    const verifiedDoctors = await Doctor.countDocuments({
      verified: true
    });

    const rejectedApplications = await UnverifiedDoctor.countDocuments({
      verification_status: 'rejected'
    });
    
    const totalVerifications = await UnverifiedDoctor.countDocuments({
      'ai_analysis_results.verification_results.license.pmdc_verification': { $exists: true }
    });
    
    const successfulVerifications = await UnverifiedDoctor.countDocuments({
      'ai_analysis_results.verification_results.license.pmdc_verification.pmdc_verified': true
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
      statistics: {
        pendingVerifications,
        verifiedDoctors,
        rejectedApplications,
        totalVerifications,
        successfulVerifications,
        failedVerifications: totalVerifications - successfulVerifications,
        verificationRate: totalVerifications > 0 ? Math.round((successfulVerifications / totalVerifications) * 100) : 0
      },
      recentVerifications
    });
  } catch (error) {
    console.error('Error fetching PMDC verification dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
});

// Route to manually verify a doctor's PMDC registration
router.post('/verify/:id', fetchuser, isAdmin, async (req, res) => {
  try {
    const { pmdcNumber } = req.body;

    if (!pmdcNumber) {
      return res.status(400).json({
        success: false,
        error: 'PMDC number is required'
      });
    }

    // Find the doctor application
    const doctorApplication = await UnverifiedDoctor.findById(req.params.id);

    if (!doctorApplication) {
      return res.status(404).json({
        success: false,
        error: 'Doctor application not found'
      });
    }

    // Perform PMDC verification
    const pmdcVerification = await verificationService.verifyPmdcRegistration(pmdcNumber);

    // Update the doctor application with PMDC verification results
    const updatedApplication = await UnverifiedDoctor.findByIdAndUpdate(
      req.params.id,
      {
        pmdc: pmdcNumber,
        $set: {
          'ai_analysis_results.verification_results.license.pmdc_verification': pmdcVerification
        }
      },
      { new: true }
    );

    // If PMDC verification was successful and status is verified, update application status accordingly
    if (pmdcVerification.pmdc_verified && pmdcVerification.status === 'verified') {
      updatedApplication.verification_status = 'pending_approval';
      updatedApplication.ai_analysis_results.status = 'likely_valid';
      updatedApplication.ai_analysis_results.message = 'PMDC verification successful. Application is pending final approval.';
      await updatedApplication.save();
    }

    res.json({
      success: true,
      message: 'PMDC verification completed',
      verification_result: pmdcVerification,
      updated_application: {
        id: updatedApplication._id,
        name: updatedApplication.name,
        pmdc: updatedApplication.pmdc,
        verification_status: updatedApplication.verification_status
      }
    });
  } catch (error) {
    console.error('Error during manual PMDC verification:', error);
    res.status(500).json({
      success: false,
      error: 'Verification error',
      details: error.message
    });
  }
});

// Route to bulk verify multiple PMDC registrations
router.post('/bulk-verify', fetchuser, isAdmin, async (req, res) => {
  try {
    const { pmdcNumbers } = req.body;

    if (!pmdcNumbers || !Array.isArray(pmdcNumbers) || pmdcNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Array of PMDC numbers is required'
      });
    }

    // Limit batch size for performance
    if (pmdcNumbers.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Maximum batch size is 20 PMDC numbers'
      });
    }

    // Process each PMDC number
    const results = [];
    for (const pmdcNumber of pmdcNumbers) {
      try {
        // Verify PMDC number
        const verificationResult = await verificationService.verifyPmdcRegistration(pmdcNumber);
        
        // Find any doctor applications with this PMDC number
        const doctorApplications = await UnverifiedDoctor.find({ pmdc: pmdcNumber });
        
        // Update each application if found
        for (const application of doctorApplications) {
          // Make sure ai_analysis_results structure exists
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
          
          // Make sure verification_results structure exists
          if (!application.ai_analysis_results.verification_results) {
            application.ai_analysis_results.verification_results = {
              license: {},
              degree: {}
            };
          }
          
          // Add PMDC verification result
          application.ai_analysis_results.verification_results.license.pmdc_verification = verificationResult;
          
          // If PMDC verification was successful, update application status
          if (verificationResult.pmdc_verified && verificationResult.status === 'verified') {
            application.verification_status = 'pending_approval';
            application.ai_analysis_results.status = 'likely_valid';
            application.ai_analysis_results.message = 'PMDC verification successful. Application is pending final approval.';
          }
          
          await application.save();
        }
        
        results.push({
          pmdc_number: pmdcNumber,
          verification_result: verificationResult,
          applications_updated: doctorApplications.length
        });
      } catch (error) {
        results.push({
          pmdc_number: pmdcNumber,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk PMDC verification completed',
      results
    });
  } catch (error) {
    console.error('Error during bulk PMDC verification:', error);
    res.status(500).json({
      success: false,
      error: 'Verification error',
      details: error.message
    });
  }
});

// Route to check PMDC number without saving
router.post('/check-pmdc', fetchuser, async (req, res) => {
  try {
    const { pmdcNumber } = req.body;
    
    if (!pmdcNumber) {
      return res.status(400).json({
        success: false,
        error: 'PMDC number is required'
      });
    }
    
    // Verify PMDC number
    const verificationResult = await verificationService.verifyPmdcRegistration(pmdcNumber);
    
    res.json({
      success: true,
      verification_result: verificationResult
    });
  } catch (error) {
    console.error('Error checking PMDC number:', error);
    res.status(500).json({
      success: false,
      error: 'Verification error',
      details: error.message
    });
  }
});

// Add all other routes from the original file...
// Route to get verification history
router.get('/verification-history', fetchuser, isAdmin, async (req, res) => {
  try {
    // Get all verifications with dates and results
    const verifications = await UnverifiedDoctor.find({
      'ai_analysis_results.verification_results.license.pmdc_verification': { $exists: true }
    })
      .select('name email pmdc verification_status ai_analysis_results.verification_results.license.pmdc_verification submitted_at')
      .sort({ submitted_at: -1 });
    
    // Group by result (success/failure)
    const successful = verifications.filter(v => 
      v.ai_analysis_results.verification_results.license.pmdc_verification.pmdc_verified
    );
    
    const failed = verifications.filter(v => 
      !v.ai_analysis_results.verification_results.license.pmdc_verification.pmdc_verified
    );
    
    res.json({
      success: true,
      data: {
        total: verifications.length,
        successful: successful.length,
        failed: failed.length,
        verifications
      }
    });
  } catch (error) {
    console.error('Error fetching verification history:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
});

// Additional routes from the original file
router.get('/verified-applications', fetchuser, isAdmin, async (req, res) => {
  try {
    const verifiedApplications = await UnverifiedDoctor.find({
      'ai_analysis_results.verification_results.license.pmdc_verification.pmdc_verified': true
    }).sort({ submitted_at: -1 });
    
    res.json({
      success: true,
      count: verifiedApplications.length,
      data: verifiedApplications
    });
} catch (error) {
    console.error('Error fetching PMDC verified applications:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
});

// Route to get all applications with failed PMDC verification
router.get('/failed-verifications', fetchuser, isAdmin, async (req, res) => {
  try {
    const failedVerifications = await UnverifiedDoctor.find({
      'ai_analysis_results.verification_results.license.pmdc_verification.pmdc_verified': false
    }).sort({ submitted_at: -1 });
    
    res.json({
      success: true,
      count: failedVerifications.length,
      data: failedVerifications
    });
  } catch (error) {
    console.error('Error fetching failed PMDC verifications:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
});

module.exports = router;