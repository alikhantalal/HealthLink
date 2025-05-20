const express = require("express");
const router = express.Router();
const Doctor = require("../models/DoctorsData"); // ✅ Fixed import

// 🏥 Route to fetch doctors by qualification or specialization
// In fetchdoctorsdata.js
router.get("/", async (req, res) => {
    try {
        const { qualification, specialization } = req.query;
        console.log("Requested Qualification:", qualification);
        console.log("Requested Specialization:", specialization);

        let query = {};

        // If specialization is provided, search across multiple fields
        if (specialization) {
            query.$or = [
                { specialization: { $regex: specialization, $options: "i" } },
                { qualification: { $regex: specialization, $options: "i" } }
            ];
        }

        // If qualification is provided separately
        if (qualification) {
            if (!query.$or) query.$or = [];
            query.$or.push({ qualification: { $regex: qualification, $options: "i" } });
            query.$or.push({ qualifications: { $elemMatch: { $regex: qualification, $options: "i" } } });
        }

        console.log("Query:", JSON.stringify(query));
        // Fetch doctors based on query
        const doctors = await Doctor.find(query);
        console.log(`Found ${doctors.length} doctors matching the query`);

        if (!doctors.length) {
            return res.status(404).json({ success: false, message: "No doctors found" });
        }

        res.status(200).json({ success: true, data: doctors });
    } catch (error) {
        console.error("Error fetching doctors:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});
// ➕ Route to add a doctor
router.post("/adddoctor", async (req, res) => {
    try {
        const { name, specialization, qualification, experience, fee, profile } = req.body;

        // ✅ Validate required fields
        if (!name || !specialization || !qualification || !profile) {
            return res.status(400).json({ success: false, error: "Name, specialization, qualification, and profile are required" });
        }

        // ✅ Ensure experience and fee are valid numbers
        if (experience !== undefined && isNaN(Number(experience))) {
            return res.status(400).json({ success: false, error: "Experience must be a number" });
        }
        if (fee !== undefined && isNaN(Number(fee))) {
            return res.status(400).json({ success: false, error: "Fee must be a number" });
        }

        // ✅ Convert qualification to an array if it's a string
        const formattedQualification = Array.isArray(qualification)
            ? qualification
            : qualification.split(",").map((q) => q.trim());

        // ✅ Create new doctor entry
        const newDoctor = new Doctor({
            name,
            specialization,
            qualification: formattedQualification,
            experience: experience || 0, // Default to 0 if not provided
            fee: fee || 0, // Default to 0 if not provided
            profile
        });

        // ✅ Save doctor to the database
        await newDoctor.save();
        res.status(201).json({ success: true, message: "Doctor added successfully", data: newDoctor });
    } catch (error) {
        console.error("Error adding doctor:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// ✅ Route to get a doctor by ID
router.get("/doctor/:id", async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        res.status(200).json({ success: true, data: doctor });
    } catch (error) {
        console.error("Error fetching doctor by ID:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

module.exports = router;