const express = require('express')
const router = express.Router()
const Worker = require('../models/Worker')
const authMiddleware = require('../middleware/auth')

router.post('/', authMiddleware, async (req, res) => {
  try {
    const worker = new Worker(req.body)
    await worker.save()
    res.status(201).json(worker)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/', authMiddleware, async (req, res) => {
  try {
    const workers = await Worker.find({ isActive: true })
    res.json(workers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
    if (!worker) return res.status(404).json({ error: 'Worker not found' })
    res.json(worker)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(worker)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Worker.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ message: 'Worker removed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router