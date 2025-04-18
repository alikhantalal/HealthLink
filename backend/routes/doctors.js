const express = require('express');
const router = express.Router();
const Doctor = require('../models/DoctorData'); // ✅ Adjust path according to your project structure

// ✅ Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
