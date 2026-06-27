
const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half', 'overtime'],
    required: true
  },
  overtimeHours: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

module.exports = mongoose.model('Attendance', attendanceSchema)