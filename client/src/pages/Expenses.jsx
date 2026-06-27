import { useState, useEffect } from 'react'
import api from '../api/axios'
import { exportToExcel, exportToPDF } from '../utils/export'

const CATEGORIES = ['electricity', 'material', 'maintenance', 'transport', 'rent', 'other']

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    billNumber: '',
    notes: ''
  })

  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/expenses/month/${month}`)
      setExpenses(res.data)
    } catch (err) {
      setError('Failed to load expenses')
    }
  }

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/expenses/summary/${month}`)
      setSummary(res.data)
    } catch (err) {
      setError('Failed to load summary')
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchExpenses()
    fetchSummary()
  }, [month])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const expenseMonth = form.date.slice(0, 7)
      await api.post('/expenses', { ...form, month: expenseMonth })
      setForm({
        category: '', amount: '', date: new Date().toISOString().split('T')[0],
        billNumber: '', notes: ''
      })
      setShowForm(false)
      fetchExpenses()
      fetchSummary()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await api.delete(`/expenses/${id}`)
      fetchExpenses()
      fetchSummary()
    } catch (err) {
      setError('Failed to delete')
    }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  // 👇 NAYE FUNCTIONS
  const expenseColumns = [
    { label: 'Category', value: (e) => e.category },
    { label: 'Amount', value: (e) => e.amount },
    { label: 'Date', value: (e) => new Date(e.date).toLocaleDateString('en-IN') },
    { label: 'Bill No', value: (e) => e.billNumber || '-' },
    { label: 'Notes', value: (e) => e.notes || '-' }
  ]

  const handleExcelExport = () => exportToExcel(expenses, expenseColumns, `expenses_${month}`, month)
  const handlePDFExport = () => exportToPDF(expenses, expenseColumns, `expenses_${month}`, `Factory Expenses — ${month}`)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Factory Expenses</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="date-input"
          />
          <button className="btn-sm-outline" onClick={handleExcelExport}>Excel</button>
          <button className="btn-sm-outline" onClick={handlePDFExport}>PDF</button>
          <button className="btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ Add expense'}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="card-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field">
              <label>Category *</label>
              <input
                name="category"
                list="category-suggestions"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Electricity, Diesel, Bonus"
                required
              />
              <datalist id="category-suggestions">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c.charAt(0).toUpperCase() + c.slice(1)} />
                ))}
              </datalist>
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
          <div className="form-row" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Bill number (optional)</label>
              <input name="billNumber" value={form.billNumber} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Notes (optional)</label>
              <input name="notes" value={form.notes} onChange={handleChange} />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary">Save expense</button>
        </form>
      )}

      {summary.length > 0 && (
        <div className="category-grid">
          {summary.map((s) => (
            <div className="category-card" key={s._id}>
              <p className="category-name">{s._id}</p>
              <p className="category-amount">₹{s.total.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <div className="summary-bar">
        <span>Total expenses — {month}</span>
        <span className="summary-amount">₹{total.toLocaleString()}</span>
      </div>

      <div className="worker-list">
        {expenses.length === 0 && <p className="empty-state">No expenses recorded for this month.</p>}

        {expenses.map((e) => (
          <div className="worker-card" key={e._id}>
            <div className="worker-main">
              <p className="worker-name">{e.category.charAt(0).toUpperCase() + e.category.slice(1)}</p>
              <p className="worker-meta">
                ₹{e.amount.toLocaleString()} · {new Date(e.date).toLocaleDateString('en-IN')}
                {e.billNumber && ` · Bill #${e.billNumber}`}
              </p>
            </div>
            <button className="btn-icon" onClick={() => handleDelete(e._id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Expenses