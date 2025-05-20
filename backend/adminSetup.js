const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Database connection
const mongoURI = "mongodb://localhost:27017/healthlink";

// Admin schema definition
const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Connect to MongoDB directly without using db.js
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB successfully");
    return true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    return false;
  }
};

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectToMongo();
    if (!connected) {
      console.log("Failed to connect to MongoDB. Exiting...");
      process.exit(1);
    }
    
    // Define the Admin model directly with the specific collection name
    const Admin = mongoose.model('admin', AdminSchema, 'admin');
    
    // Admin credentials
    const adminEmail = 'admin@healthlink.com';
    const adminPassword = 'Admin@123'; // Change this in production
    const adminName = 'Admin User';
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      mongoose.connection.close();
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Create admin user
    const admin = await Admin.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('Admin user created successfully:');
    console.log('- Email:', adminEmail);
    console.log('- Password:', adminPassword);
    console.log('- Role:', admin.role);
    
    // Close connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.connection.close();
  }
};

// Run the function
createAdminUser();