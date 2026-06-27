const express = require('express')
const router = express.Router()
const Attendance = require('../models/Attendance')
const authMiddleware = require('../middleware/auth')

// Mark attendance (upsert - agar already hai toh update karo, warna naya banao)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { workerId, date, status, overtimeHours } = req.body

    // Date ko normalize karo (sirf date, time hata do) taaki matching sahi ho
    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(normalizedDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const existing = await Attendance.findOne({
      workerId,
      date: { $gte: normalizedDate, $lt: nextDay }
    })

    if (existing) {
      existing.status = status
      existing.overtimeHours = overtimeHours || 0
      await existing.save()
      return res.status(200).json(existing)
    }

    const attendance = new Attendance({ workerId, date: normalizedDate, status, overtimeHours })
    await attendance.save()
    res.status(201).json(attendance)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/worker/:workerId', authMiddleware, async (req, res) => {
  try {
    const records = await Attendance.find({ workerId: req.params.workerId })
    res.json(records)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/month/:month', authMiddleware, async (req, res) => {
  try {
    const month = req.params.month
    const start = new Date(`${month}-01`)
    const end = new Date(start)
    end.setMonth(end.getMonth() + 1)

    const records = await Attendance.find({
      date: { $gte: start, $lt: end }
    }).populate('workerId', 'name workerType rate')

    res.json(records)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(record)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id)
    res.json({ message: 'Attendance record deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router