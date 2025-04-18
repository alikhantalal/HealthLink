const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  qualification: [String], // 👈 Store qualifications as an array
  experience: Number,
  fee: Number,
  profile: String
});

module.exports = mongoose.model("Doctor", DoctorSchema);
