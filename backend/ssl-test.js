const mongoose = require('mongoose');

// Use the same connection string as MongoDB Compass (without database name)
const mongoURI = "mongodb+srv://talalalikhan8:talal123@cluster0.a0tjkgd.mongodb.net/";

const connectToMongo = async () => {
    try {
        // Disable buffering globally to prevent timeout issues (only valid option)
        mongoose.set('bufferCommands', false);
        
        // For development: disable SSL validation to avoid certificate issues
        // Remove this in production and configure proper SSL certificates
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        
        // Connection with database specified in options
        await mongoose.connect(mongoURI, {
            // Specify the database name here instead of in the URI
            dbName: 'healthlink',
            
            // Essential connection options
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            family: 4, // Use IPv4, skip trying IPv6
            
            // SSL/TLS options for development
            ssl: true,
            sslValidate: false, // Disable certificate validation for dev
            
            // Retry settings  
            retryWrites: true,
            retryReads: true,
        });
        
        console.log("Connected to MongoDB Atlas successfully");
        console.log("Database:", mongoose.connection.db.databaseName);
        return true;
        
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw error;
    }
};

module.exports = connectToMongo;