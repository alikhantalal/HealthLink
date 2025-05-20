const mongoose = require('mongoose');

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

// Specifically tell Mongoose to use the 'admin' collection
const Admin = mongoose.model('admin', AdminSchema, 'admin');

module.exports = Admin;