const mongoose = require('mongoose');

// Use the exact same connection string as MongoDB Compass
const testConnection = async () => {
    const mongoURI = "mongodb+srv://talalalikhan8:talal123@cluster0.a0tjkgd.mongodb.net/";
    
    console.log("🧪 Testing MongoDB connection using Compass format...");
    console.log("URI:", mongoURI.replace(/\/\/.*@/, "//****:****@"));
    
    try {
        // Disable buffering to prevent timeout issues (only valid options)
        mongoose.set('bufferCommands', false);
        
        const options = {
            // Specify database name in options instead of URI
            dbName: 'healthlink',
            
            // Connection settings
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            family: 4, // Use IPv4
            
            // Retry settings
            retryWrites: true,
            retryReads: true,
        };
        
        console.log("⏳ Connecting with same format as Compass...");
        await mongoose.connect(mongoURI, options);
        
        console.log("✅ Connection successful!");
        console.log("Database:", mongoose.connection.db.databaseName);
        console.log("Connection state:", mongoose.connection.readyState);
        
        // Test database operations
        console.log("🔍 Testing database operations...");
        
        // Simple ping test
        const pingResult = await mongoose.connection.db.admin().ping();
        console.log("✅ Ping successful:", pingResult);
        
        // List collections in healthlink database
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("📁 Available collections:", collections.map(c => c.name));
        
        // Test a simple count operation
        try {
            const doctorCount = await mongoose.connection.db.collection('doctors').countDocuments();
            console.log("👨‍⚕️ Doctors in database:", doctorCount);
        } catch (err) {
            console.log("ℹ️  Could not count doctors (collection might not exist)");
        }
        
        console.log("🎉 All tests passed! Connection is working perfectly.");
        return true;
        
    } catch (error) {
        console.error("❌ Connection test failed:");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        
        // Additional diagnostics
        if (error.name === 'MongooseServerSelectionError') {
            console.error("\n🔍 This is strange since Compass can connect...");
            console.error("💡 Possible causes:");
            console.error("1. Compass and Node.js might be using different network interfaces");
            console.error("2. Windows firewall might be blocking Node.js but not Compass");
            console.error("3. Different SSL/TLS handling between Compass and Node.js");
            console.error("\n🔧 Try running as administrator or temporarily disable Windows Firewall");
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
};

// Run the test
testConnection()
    .then((success) => {
        if (success) {
            console.log("\n✨ SUCCESS! Your backend should now work with this connection format.");
            console.log("Run 'npm run start:both' to start your application.");
        } else {
            console.log("\n❌ Connection failed. Please check the suggestions above.");
        }
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error("Unexpected error:", error);
        process.exit(1);
    });