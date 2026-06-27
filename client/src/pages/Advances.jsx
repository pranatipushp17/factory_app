import { useState, useEffect } from 'react'
import api from '../api/axios'
import { exportMultiSheetExcel, exportToPDF } from '../utils/export'

function Advances() {
  const [workers, setWorkers] = useState([])
  const [advances, setAdvances] = useState([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    workerId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reason: ''
  })

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/workers')
      setWorkers(res.data)
    } catch (err) {
      setError('Failed to load workers')
    }
  }

  const fetchAdvances = async () => {
    try {
      const res = await api.get(`/advances/month/${month}`)
      setAdvances(res.data)
    } catch (err) {
      setError('Failed to load advances')
    }
  }

  useEffect(() => {
    fetchWorkers()
  }, [])

  useEffect(() => {
    fetchAdvances()
  }, [month])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const advanceMonth = form.date.slice(0, 7)
      await api.post('/advances', { ...form, month: advanceMonth })
      setForm({
        workerId: '', amount: '', date: new Date().toISOString().split('T')[0], reason: ''
      })
      setShowForm(false)
      fetchAdvances()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add advance')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this advance record?')) return
    try {
      await api.delete(`/advances/${id}`)
      fetchAdvances()
    } catch (err) {
      setError('Failed to delete')
    }
  }

  const totalThisMonth = advances.reduce((sum, a) => sum + a.amount, 0)

  // 👇 NAYE FUNCTIONS
  const advanceColumns = [
    { label: 'Worker', value: (a) => a.workerId?.name || 'Unknown' },
    { label: 'Amount', value: (a) => a.amount },
    { label: 'Date', value: (a) => new Date(a.date).toLocaleDateString('en-IN') },
    { label: 'Reason', value: (a) => a.reason || '-' }
  ]

  const attendanceColumns = [
    { label: 'Name', value: (r) => r.workerId?.name || 'Unknown' },
    { label: 'Date', value: (r) => new Date(r.date).toLocaleDateString('en-IN') },
    { label: 'Status', value: (r) => r.status }
  ]

  const handleCombinedExcel = async () => {
    try {
      const attendanceRes = await api.get(`/attendance/month/${month}`)
      exportMultiSheetExcel(
        [
          { data: attendanceRes.data, columns: attendanceColumns, sheetName: 'Attendance' },
          { data: advances, columns: advanceColumns, sheetName: 'Advances' }
        ],
        `attendance_advances_${month}`
      )
    } catch (err) {
      setError('Failed to export')
    }
  }

  const handlePDFExport = () => exportToPDF(advances, advanceColumns, `advances_${month}`, `Advances — ${month}`)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Advances</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="date-input"
          />
          <button className="btn-sm-outline" onClick={handleCombinedExcel}>Excel</button>
          <button className="btn-sm-outline" onClick={handlePDFExport}>PDF</button>
          <button className="btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ Add advance'}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="card-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field">
              <label>Worker *</label>
              <select name="workerId" value={form.workerId} onChange={handleChange} required>
                <option value="">Select worker</option>
                {workers.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Amount (₹) *</label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
            </div>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Reason (optional)</label>
            <input name="reason" value={form.reason} onChange={handleChange} placeholder="e.g. medical, personal" />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary">Save advance</button>
        </form>
      )}

      <div className="summary-bar">
        <span>Total advances — {month}</span>
        <span className="summary-amount">₹{totalThisMonth.toLocaleString()}</span>
      </div>

      <div className="worker-list">
        {advances.length === 0 && <p className="empty-state">No advances recorded for this month.</p>}

        {advances.map((a) => (
          <div className="worker-card" key={a._id}>
            <div className="worker-main">
              <p className="worker-name">{a.workerId?.name || 'Unknown'}</p>
              <p className="worker-meta">
                ₹{a.amount.toLocaleString()} · {new Date(a.date).toLocaleDateString('en-IN')}
                {a.reason && ` · ${a.reason}`}
              </p>
            </div>
            <button className="btn-icon" onClick={() => handleDelete(a._id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Advances