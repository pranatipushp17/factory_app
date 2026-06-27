const express = require('express')
const router = express.Router()
const Expense = require('../models/Expense')
const authMiddleware = require('../middleware/auth')

router.post('/', authMiddleware, async (req, res) => {
  try {
    const expense = new Expense(req.body)
    await expense.save()
    res.status(201).json(expense)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/month/:month', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ month: req.params.month })
    res.json(expenses)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/summary/:month', authMiddleware, async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { month: req.params.month } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ])
    res.json(summary)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(expense)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id)
    res.json({ message: 'Expense deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router