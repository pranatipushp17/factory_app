import { exportToExcel, exportToPDF } from '../utils/export'
import { useState, useEffect } from 'react'
import api from '../api/axios'

function Workers() {
  const [workers, setWorkers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    workerType: 'daily',
    rate: '',
    phone: '',
    address: '',
    department: '',
    joiningDate: '',
    emergencyContact: ''
  })

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/workers')
      setWorkers(res.data)
    } catch (err) {
      setError('Failed to load workers')
    }
  }

  useEffect(() => {
    fetchWorkers()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/workers', form)
      setForm({
        name: '', workerType: 'daily', rate: '', phone: '',
        address: '', department: '', joiningDate: '', emergencyContact: ''
      })
      setShowForm(false)
      setShowMore(false)
      fetchWorkers()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add worker')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this worker?')) return
    try {
      await api.delete(`/workers/${id}`)
      fetchWorkers()
    } catch (err) {
      setError('Failed to remove worker')
    }
  }

  // 👇 NAYE FUNCTIONS — yahan add kiye
  const workerColumns = [
    { label: 'Name', value: (w) => w.name },
    { label: 'Type', value: (w) => w.workerType },
    { label: 'Rate', value: (w) => w.rate },
    { label: 'Phone', value: (w) => w.phone || '-' }
  ]

  const handleExcelExport = () => exportToExcel(workers, workerColumns, 'workers_list')
  const handlePDFExport = () => exportToPDF(workers, workerColumns, 'workers_list', 'Workers List')

  return (
    <div className="page">
      <div className="page-header">
        <h1>Workers</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-sm-outline" onClick={handleExcelExport}>Excel</button>
          <button className="btn-sm-outline" onClick={handlePDFExport}>PDF</button>
          <button className="btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ Add worker'}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="card-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field">
              <label>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Type *</label>
              <select name="workerType" value={form.workerType} onChange={handleChange}>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>
            <div className="field">
              <label>Rate (₹) *</label>
              <input type="number" name="rate" value={form.rate} onChange={handleChange} required />
            </div>
          </div>

          <button type="button" className="link-btn" onClick={() => setShowMore(!showMore)}>
            {showMore ? '- Hide details' : '+ Add more details'}
          </button>

          {showMore && (
            <div className="form-row">
              <div className="field">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Department</label>
                <input name="department" value={form.department} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Joining date</label>
                <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Address</label>
                <input name="address" value={form.address} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Emergency contact</label>
                <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
              </div>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary">Save worker</button>
        </form>
      )}

      <div className="worker-list">
        {workers.length === 0 && <p className="empty-state">No workers added yet.</p>}

        {workers.map((w) => (
          <div className="worker-card" key={w._id}>
            <div className="worker-main">
              <p className="worker-name">{w.name}</p>
              <p className="worker-meta">{w.workerType} · ₹{w.rate}{w.workerType === 'daily' ? '/day' : '/month'}</p>
            </div>
            <button className="btn-icon" onClick={() => handleDelete(w._id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Workers