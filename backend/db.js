const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/healthlink"; // Ensure your database name is included

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,  // Not needed in Mongoose 6+
            useUnifiedTopology: true  // Not needed in Mongoose 6+
        });
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectToMongo;
