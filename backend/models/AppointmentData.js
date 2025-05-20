const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  // Instead of storing patient_id (which would require auth),
  // store patient information directly:
  patient_name: {
    type: String,
    required: true
  },
  patient_email: {
    type: String,
    required: true
  },
  patient_phone: {
    type: String,
    default: ""
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    default: "Consultation"
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled", "no-show"],
    default: "scheduled"
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Appointment", AppointmentSchema);