const express = require('express')
const router = express.Router()
const Advance = require('../models/Advance')
const authMiddleware = require('../middleware/auth')

router.post('/', authMiddleware, async (req, res) => {
  try {
    const advance = new Advance(req.body)
    await advance.save()
    res.status(201).json(advance)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/worker/:workerId', authMiddleware, async (req, res) => {
  try {
    const advances = await Advance.find({ workerId: req.params.workerId })
    res.json(advances)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/month/:month', authMiddleware, async (req, res) => {
  try {
    const advances = await Advance.find({ month: req.params.month })
      .populate('workerId', 'name workerType rate')
    res.json(advances)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const advance = await Advance.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(advance)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Advance.findByIdAndDelete(req.params.id)
    res.json({ message: 'Advance deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router