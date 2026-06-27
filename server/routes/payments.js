const express = require('express')
const router = express.Router()
const Payment = require('../models/Payment')
const authMiddleware = require('../middleware/auth')

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { workerId, month, netPayDue, amountPaid } = req.body

    const balanceLeft = netPayDue - amountPaid

    let status = 'pending'
    if (amountPaid > 0 && balanceLeft === 0) status = 'paid'
    else if (amountPaid > 0 && balanceLeft > 0) status = 'partial'

    let payment = await Payment.findOne({ workerId, month })

    if (payment) {
      payment.netPayDue = netPayDue
      payment.amountPaid = amountPaid
      payment.balanceLeft = balanceLeft
      payment.status = status
      await payment.save()
    } else {
      payment = new Payment({ workerId, month, netPayDue, amountPaid, balanceLeft, status })
      await payment.save()
    }

    res.status(201).json(payment)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/month/:month', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ month: req.params.month })
      .populate('workerId', 'name workerType rate')
    res.json(payments)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/worker/:workerId', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ workerId: req.params.workerId })
    res.json(payments)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router