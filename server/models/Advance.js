const mongoose = require('mongoose')

const advanceSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  month: {
    type: String,    // "2025-06" format
    required: true
  },
  reason: String,     // optional
  status: {
    type: String,
    enum: ['pending', 'deducted'],
    default: 'pending'
  }
}, { timestamps: true })

module.exports = mongoose.model('Advance', advanceSchema)