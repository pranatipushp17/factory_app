 const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  month: {
    type: String,       // "2025-06"
    required: true
  },
  netPayDue: {
    type: Number,
    required: true      // salary API se calculate hua amount
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balanceLeft: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  }
}, { timestamps: true })

module.exports = mongoose.model('Payment', paymentSchema)