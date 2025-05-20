// First, install the native MongoDB driver if not already installed
// Run: npm install mongodb

const { MongoClient } = require('mongodb');

const testNativeConnection = async () => {
    // Use the exact same URI as Compass
    const uri = "mongodb+srv://talalalikhan8:talal123@cluster0.a0tjkgd.mongodb.net/";
    
    console.log("🧪 Testing with native MongoDB driver (same as Compass)...");
    console.log("URI:", uri.replace(/\/\/.*@/, "//****:****@"));
    
    const client = new MongoClient(uri, {
        // Similar options to what Compass might use
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4, // IPv4 only
        retryWrites: true,
    });
    
    try {
        console.log("⏳ Connecting with native driver...");
        await client.connect();
        console.log("✅ Native driver connection successful!");
        
        // Test the healthlink database
        const db = client.db('healthlink');
        console.log("📋 Connected to database: healthlink");
        
        // Test ping
        const pingResult = await db.admin().ping();
        console.log("✅ Ping successful:", pingResult);
        
        // List collections
        const collections = await db.listCollections().toArray();
        console.log("📁 Collections:", collections.map(c => c.name).join(", "));
        
        // Test a simple operation
        if (collections.find(c => c.name === 'doctors')) {
            const doctorCount = await db.collection('doctors').countDocuments();
            console.log("👨‍⚕️ Doctor count:", doctorCount);
        }
        
        console.log("🎉 Native MongoDB driver works perfectly!");
        
        // Now test Mongoose with the working native connection settings
        console.log("\n🔄 Now testing Mongoose with successful settings...");
        return await testMongooseConnection(uri);
        
    } catch (error) {
        console.error("❌ Native driver connection failed:");
        console.error("Error:", error.message);
        console.error("Name:", error.name);
        return false;
    } finally {
        await client.close();
        console.log("🔒 Native connection closed.");
    }
};

const testMongooseConnection = async (uri) => {
    const mongoose = require('mongoose');
    
    try {
        // Clear any existing connections
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Only set valid mongoose options
        mongoose.set('bufferCommands', false);
        
        console.log("⏳ Testing Mongoose connection...");
        
        await mongoose.connect(uri, {
            dbName: 'healthlink',
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,
            retryWrites: true,
        });
        
        console.log("✅ Mongoose connection successful!");
        console.log("Database:", mongoose.connection.db.databaseName);
        
        // Test Mongoose operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("📁 Mongoose can see collections:", collections.map(c => c.name).join(", "));
        
        return true;
        
    } catch (error) {
        console.error("❌ Mongoose connection failed:");
        console.error("Error:", error.message);
        return false;
    } finally {
        try {
            await mongoose.disconnect();
            console.log("🔒 Mongoose connection closed.");
        } catch (err) {
            // Ignore disconnect errors
        }
    }
};

// Alternative test with different connection parameters
const testAlternativeApproaches = async () => {
    console.log("\n🔧 Trying alternative approaches...");
    
    const approaches = [
        {
            name: "Standard connection with SSL options",
            uri: "mongodb+srv://talalalikhan8:talal123@cluster0.a0tjkgd.mongodb.net/",
            options: {
                dbName: 'healthlink',
                serverSelectionTimeoutMS: 60000,
                family: 4,
                ssl: true,
                sslValidate: true,
            }
        },
        {
            name: "Connection with explicit auth",
            uri: "mongodb+srv://talalalikhan8:talal123@cluster0.a0tjkgd.mongodb.net/",
            options: {
                dbName: 'healthlink',
                serverSelectionTimeoutMS: 60000,
                family: 4,
                authSource: 'admin',
            }
        },
        {
            name: "Direct connection to healthlink database",
            uri: "mongodb+srv://talalalikhan8:talal123@cluster0.a0tjkgd.mongodb.net/healthlink",
            options: {
                serverSelectionTimeoutMS: 60000,
                family: 4,
                retryWrites: true,
            }
        }
    ];
    
    const mongoose = require('mongoose');
    
    for (const approach of approaches) {
        console.log(`\n🧪 Testing: ${approach.name}`);
        
        try {
            // Disconnect any existing connection
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            mongoose.set('bufferCommands', false);
            
            await mongoose.connect(approach.uri, approach.options);
            console.log(`✅ ${approach.name} - SUCCESS!`);
            
            const dbName = mongoose.connection.db.databaseName;
            console.log(`   Database: ${dbName}`);
            
            await mongoose.disconnect();
            return { success: true, approach };
            
        } catch (error) {
            console.log(`❌ ${approach.name} - Failed: ${error.message}`);
        }
    }
    
    return { success: false };
};

// Main execution
const main = async () => {
    try {
        console.log("=".repeat(60));
        console.log("🚀 Comprehensive MongoDB Connection Test");
        console.log("=".repeat(60));
        
        // Test 1: Native MongoDB driver (like Compass)
        const nativeWorked = await testNativeConnection();
        
        if (!nativeWorked) {
            console.log("\n⚠️  Native driver failed - this suggests a network/auth issue");
            
            // Test 2: Try alternative approaches
            const alternativeResult = await testAlternativeApproaches();
            
            if (alternativeResult.success) {
                console.log(`\n🎉 SUCCESS with: ${alternativeResult.approach.name}`);
                console.log("Use this approach in your application!");
            } else {
                console.log("\n❌ All connection attempts failed");
                console.log("\n💡 Recommendations:");
                console.log("1. Run this script as Administrator");
                console.log("2. Temporarily disable Windows Firewall");
                console.log("3. Try from a different network (mobile hotspot)");
                console.log("4. Check if antivirus is blocking connections");
            }
        } else {
            console.log("\n🎉 Great! Both native driver and Mongoose work!");
            console.log("Your backend should now work properly.");
        }
        
    } catch (error) {
        console.error("💥 Unexpected error:", error);
    }
    
    process.exit(0);
};

// Run the main function
main();