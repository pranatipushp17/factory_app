const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()
const workerRoutes = require('./routes/workers')
const attendanceRoutes = require('./routes/attendance')
const advanceRoutes = require('./routes/advances')
const expenseRoutes = require('./routes/expenses')
const salaryRoutes = require('./routes/salary')
const paymentRoutes = require('./routes/payments')
const authRoutes = require('./routes/auth')

// Middleware
app.use(cors())
app.use(express.json())
app.use('/api/workers', workerRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/advances', advanceRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/salary', salaryRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/auth', authRoutes)


// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Factory App Server Running!' })
})

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!')
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`)
    })
  })
  .catch(err => console.log(err))