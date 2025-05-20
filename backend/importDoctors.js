// Import script - save as importDoctors.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Use the provided MongoDB Atlas connection string
const mongoURI = "mongodb+srv://talalalikhan8:talal123@cluster0.a0tjkgd.mongodb.net/healthlink";

// Connect to MongoDB Atlas
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB Atlas connection error:', err));

// Get the DoctorsData model
// Note: Make sure this path is correct relative to where you're running the script
const Doctor = require('./models/DoctorsData');

// Read the JSON file from the specified path
const filePath = path.join('C:', 'Users', 'Talal Ali khan', 'Downloads', 'healthlink.doctors.json');
let doctorsData;

try {
  const jsonData = fs.readFileSync(filePath, 'utf8');
  doctorsData = JSON.parse(jsonData);
  console.log(`Successfully read ${doctorsData.length} doctor records from file`);
} catch (error) {
  console.error('Error reading or parsing JSON file:', error);
  process.exit(1); // Exit if we can't read the file
}

// Function to import data
async function importDoctors() {
  try {
    // First, drop the existing collection to avoid duplicate key errors
    try {
      await mongoose.connection.collections.doctors.drop();
      console.log('Existing doctors collection dropped');
    } catch (dropError) {
      console.log('No existing doctors collection to drop or drop failed:', dropError.message);
      // Continue even if drop fails (collection might not exist)
    }
    
    // Process data to handle null emails and add any missing required fields
    const processedData = doctorsData.map(doc => {
      // Create a clean object for insertion
      const processedDoc = {
        name: doc.name || 'Unknown Doctor',
        specialization: doc.specialization || 'General Practitioner',
        experience: doc.experience || 0,
        fee: doc.fee || 0,
        qualification: doc.qualification || [],
        verified: doc.verified || false,
        profile: doc.profile || ''
      };
      
      // Only add email if it exists and is not null
      if (doc.email && doc.email !== null) {
        processedDoc.email = doc.email;
      }
      
      // Add user_id if it exists
      if (doc.user_id) {
        // Handle different formats of user_id
        if (typeof doc.user_id === 'object' && doc.user_id.$oid) {
          // MongoDB extended JSON format
          processedDoc.user_id = doc.user_id.$oid;
        } else if (typeof doc.user_id === 'string') {
          processedDoc.user_id = doc.user_id;
        }
      }
      
      // Add any other fields that might be in the document
      for (const key in doc) {
        if (!processedDoc.hasOwnProperty(key) && key !== '_id' && key !== 'email') {
          processedDoc[key] = doc[key];
        }
      }
      
      return processedDoc;
    });
    
    // Log a sample processed document for debugging
    console.log('Sample processed document:', JSON.stringify(processedData[0], null, 2));
    
    // Insert documents individually for better error handling
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < processedData.length; i++) {
      try {
        const newDoctor = new Doctor(processedData[i]);
        await newDoctor.save();
        successCount++;
        
        // Log progress every 10 documents
        if (successCount % 10 === 0) {
          console.log(`Imported ${successCount} documents so far...`);
        }
      } catch (err) {
        errorCount++;
        console.error(`Error importing document #${i+1}:`, err.message);
      }
    }
    
    console.log(`Import complete: ${successCount} successes, ${errorCount} failures`);
  } catch (error) {
    console.error('Import error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the import
importDoctors();