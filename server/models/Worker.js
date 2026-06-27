const mongoose = require('mongoose')

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  workerType: {
    type: String,
    enum: ['daily', 'monthly', 'seasonal'],
    required: true
  },
  rate: {
    type: Number,
    required: true
  },

  // Optional fields
  phone: String,
  address: String,
  photo: String,
  department: String,
  joiningDate: Date,
  emergencyContact: String,

  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Worker', workerSchema)