const mongoose = require('mongoose');

// Use the same connection string as MongoDB Compass (without database name)
const mongoURI = "mongodb://localhost:27017/healthlink"; // This is using local MongoDB

const connectToMongo = async () => {
    try {
        // Only set valid mongoose options (bufferMaxEntries is NOT valid)
        mongoose.set('bufferCommands', false);
        
        // Connection with database specified in options
        await mongoose.connect(mongoURI, {
            // Specify the database name here instead of in the URI
            dbName: 'healthlink',
            
            // Essential connection options
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            family: 4, // Use IPv4, skip trying IPv6
            
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