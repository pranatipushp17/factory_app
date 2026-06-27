const express = require('express')
const router = express.Router()
const Worker = require('../models/Worker')
const Attendance = require('../models/Attendance')
const Advance = require('../models/Advance')
const authMiddleware = require('../middleware/auth')

router.get('/month/:month', authMiddleware, async (req, res) => {
  try {
    const month = req.params.month
    const start = new Date(`${month}-01`)
    const end = new Date(start)
    end.setMonth(end.getMonth() + 1)

    const workers = await Worker.find({ isActive: true })

    const report = await Promise.all(
      workers.map(async (worker) => {
        let gross = 0
        let daysPresent = 0

        if (worker.workerType === 'daily') {
          const records = await Attendance.find({
            workerId: worker._id,
            date: { $gte: start, $lt: end }
          })

          records.forEach(r => {
            if (r.status === 'present') daysPresent += 1
            if (r.status === 'half') daysPresent += 0.5
            if (r.status === 'overtime') daysPresent += 1
          })

          gross = daysPresent * worker.rate
        } else {
          gross = worker.rate
          daysPresent = '-'
        }

        const advances = await Advance.find({
          workerId: worker._id,
          month: month
        })
        const totalAdvance = advances.reduce((sum, a) => sum + a.amount, 0)

        const netPay = gross - totalAdvance

        return {
          workerId: worker._id,
          name: worker.name,
          workerType: worker.workerType,
          rate: worker.rate,
          daysPresent,
          gross,
          totalAdvance,
          netPay
        }
      })
    )

    res.json(report)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router