const mongoose = require('mongoose');

// Test MongoDB connection independently
const testConnection = async () => {
    const mongoURI = "mongodb+srv://talalalikhan8:talal123@cluster0.a0tjkgd.mongodb.net/healthlink";
    
    console.log("🧪 Testing MongoDB connection...");
    console.log("URI:", mongoURI.replace(/\/\/.*@/, "//****:****@")); // Hide credentials in log
    
    try {
        // Disable buffering
        mongoose.set('bufferCommands', false);
        
        const options = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            maxPoolSize: 1,
            retryWrites: true,
            authSource: 'admin',
            ssl: true,
            family: 4,
        };
        
        console.log("⏳ Connecting...");
        await mongoose.connect(mongoURI, options);
        
        console.log("✅ Connection successful!");
        console.log("Database:", mongoose.connection.db.databaseName);
        console.log("Connection state:", mongoose.connection.readyState);
        
        // Test database operations
        console.log("🔍 Testing database operations...");
        
        // Simple ping test
        const pingResult = await mongoose.connection.db.admin().ping();
        console.log("✅ Ping successful:", pingResult);
        
        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("📁 Available collections:", collections.map(c => c.name));
        
        // Test a simple query (if users collection exists)
        try {
            const userCount = await mongoose.connection.db.collection('users').countDocuments();
            console.log("👥 Users in database:", userCount);
        } catch (err) {
            console.log("ℹ️  Users collection might not exist yet (this is normal for new setups)");
        }
        
        console.log("🎉 All tests passed! Your MongoDB connection is working properly.");
        
    } catch (error) {
        console.error("❌ Connection test failed:");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        
        if (error.name === 'MongooseServerSelectionError') {
            console.error("\n💡 Troubleshooting suggestions:");
            console.error("1. Check if your IP is whitelisted in MongoDB Atlas");
            console.error("2. Verify your username and password");
            console.error("3. Make sure the cluster is not paused");
            console.error("4. Check your internet connection");
        }
        
        return false;
    } finally {
        // Always close the connection
        try {
            await mongoose.connection.close();
            console.log("🔒 Connection closed.");
        } catch (err) {
            console.error("Error closing connection:", err.message);
        }
    }
    
    return true;
};

// Run the test
testConnection()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error("Unexpected error:", error);
        process.exit(1);
    });