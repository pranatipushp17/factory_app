const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true   // "electricity" | "material" | "maintenance" | "transport" | "other"
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
    type: String,     // "2025-06"
    required: true
  },
  billNumber: String, // optional
  notes: String        // optional
}, { timestamps: true })

module.exports = mongoose.model('Expense', expenseSchema)