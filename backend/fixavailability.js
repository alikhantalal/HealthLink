// fixAvailability.js
const mongoose = require('mongoose');
const Doctor = require('./models/DoctorsData');

// Use the provided MongoDB Atlas connection string
const mongoURI = "mongodb+srv://talalalikhan8:talal123@cluster0.a0tjkgd.mongodb.net/healthlink";

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB Atlas connection error:', err));

async function fixAvailabilityReferences() {
  try {
    // Get all doctors
    const doctors = await Doctor.find({});
    console.log(`Found ${doctors.length} doctors to fix`);
    
    let updateCount = 0;
    
    // Update each doctor with a fresh copy of their availability
    for (const doctor of doctors) {
      if (doctor.availability) {
        // Create a deep copy by converting to JSON and back
        const availabilityCopy = JSON.parse(JSON.stringify(doctor.availability));
        
        // Update the doctor with the copy
        await Doctor.updateOne(
          { _id: doctor._id },
          { $set: { availability: availabilityCopy } }
        );
        
        updateCount++;
        if (updateCount % 10 === 0) {
          console.log(`Updated ${updateCount} doctors so far`);
        }
      }
    }
    
    console.log(`Successfully updated ${updateCount} doctors with independent availability schedules`);
  } catch (error) {
    console.error('Error fixing availability references:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

fixAvailabilityReferences();