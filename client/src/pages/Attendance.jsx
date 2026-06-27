import { useState, useEffect } from 'react'
import api from '../api/axios'
import { exportToExcel, exportToPDF } from '../utils/export'

function Attendance() {
  const [workers, setWorkers] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceMap, setAttendanceMap] = useState({})
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/workers')
      setWorkers(res.data.filter(w => w.workerType === 'daily'))
    } catch (err) {
      setError('Failed to load workers')
    }
  }

  useEffect(() => {
    fetchWorkers()
  }, [])

  const markStatus = (workerId, status) => {
    setAttendanceMap({ ...attendanceMap, [workerId]: status })
    setSaved(false)
  }

  const handleSaveAll = async () => {
    setError('')
    try {
      const entries = Object.entries(attendanceMap)
      for (const [workerId, status] of entries) {
        await api.post('/attendance', { workerId, date, status })
      }
      setSaved(true)
      setAttendanceMap({})
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save attendance')
    }
  }

  // --- Today's snapshot export ---
  const attendanceColumns = [
    { label: 'Name', value: (w) => w.name },
    { label: 'Status', value: (w) => attendanceMap[w._id] || '-' }
  ]

  const handleExcelExport = () => exportToExcel(workers, attendanceColumns, `attendance_${date}`, date)
  const handlePDFExport = () => exportToPDF(workers, attendanceColumns, `attendance_${date}`, `Attendance — ${date}`)

  // --- Monthly date-wise grid export ---
  const buildMonthlyGrid = async () => {
    const month = date.slice(0, 7) // "2025-06"
    const res = await api.get(`/attendance/month/${month}`)
    const records = res.data // [{ workerId: {name}, date, status }, ...]

    const datesSet = new Set()
    const workerMap = {}

    records.forEach((r) => {
      const day = new Date(r.date).getDate()
      datesSet.add(day)
      const name = r.workerId?.name || 'Unknown'
      if (!workerMap[name]) workerMap[name] = {}
      workerMap[name][day] = r.status
    })

    const sortedDates = Array.from(datesSet).sort((a, b) => a - b)

    const gridData = Object.entries(workerMap).map(([name, days]) => {
      const row = { Worker: name }
      sortedDates.forEach((d) => {
        row[`Day ${d}`] = days[d] || '-'
      })
      return row
    })

    const columns = [
      { label: 'Worker', value: (row) => row.Worker },
      ...sortedDates.map((d) => ({ label: `Day ${d}`, value: (row) => row[`Day ${d}`] }))
    ]

    return { gridData, columns, month }
  }

  const handleMonthlyExcelExport = async () => {
    setError('')
    try {
      const { gridData, columns, month } = await buildMonthlyGrid()
      exportToExcel(gridData, columns, `attendance_monthly_${month}`, month)
    } catch (err) {
      setError('Failed to export monthly attendance')
    }
  }

  const handleMonthlyPDFExport = async () => {
    setError('')
    try {
      const { gridData, columns, month } = await buildMonthlyGrid()
      exportToPDF(gridData, columns, `attendance_monthly_${month}`, `Monthly Attendance — ${month}`)
    } catch (err) {
      setError('Failed to export monthly attendance')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Attendance</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="date-input"
          />
          <button className="btn-sm-outline" onClick={handleExcelExport}>Today Excel</button>
          <button className="btn-sm-outline" onClick={handlePDFExport}>Today PDF</button>
          <button className="btn-sm-outline" onClick={handleMonthlyExcelExport}>Monthly Excel</button>
          <button className="btn-sm-outline" onClick={handleMonthlyPDFExport}>Monthly PDF</button>
        </div>
      </div>

      {workers.length === 0 && <p className="empty-state">No daily workers found. Add some from Workers page.</p>}

      <div className="attendance-list">
        {workers.map((w) => (
          <div className="attendance-row" key={w._id}>
            <div className="attendance-name">
              <p className="worker-name">{w.name}</p>
              <p className="worker-meta">₹{w.rate}/day</p>
            </div>
            <div className="attendance-buttons">
              <button
                className={`status-btn present ${attendanceMap[w._id] === 'present' ? 'active' : ''}`}
                onClick={() => markStatus(w._id, 'present')}
              >P</button>
              <button
                className={`status-btn half ${attendanceMap[w._id] === 'half' ? 'active' : ''}`}
                onClick={() => markStatus(w._id, 'half')}
              >H</button>
              <button
                className={`status-btn absent ${attendanceMap[w._id] === 'absent' ? 'active' : ''}`}
                onClick={() => markStatus(w._id, 'absent')}
              >A</button>
              <button
                className={`status-btn overtime ${attendanceMap[w._id] === 'overtime' ? 'active' : ''}`}
                onClick={() => markStatus(w._id, 'overtime')}
              >OT</button>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="auth-error">{error}</p>}
      {saved && <p className="auth-success">Attendance saved for {date} ✓</p>}

      {workers.length > 0 && (
        <button className="btn-primary" onClick={handleSaveAll} disabled={Object.keys(attendanceMap).length === 0}>
          Save attendance
        </button>
      )}
    </div>
  )
}

export default Attendance