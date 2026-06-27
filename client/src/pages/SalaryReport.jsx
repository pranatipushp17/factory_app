import { useState, useEffect } from 'react'
import api from '../api/axios'
import { exportToExcel, exportToPDF } from '../utils/export'

function SalaryReport() {
  const [report, setReport] = useState([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [error, setError] = useState('')

  const fetchReport = async () => {
    try {
      const res = await api.get(`/salary/month/${month}`)
      setReport(res.data)
    } catch (err) {
      setError('Failed to load salary report')
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchReport()
  }, [month])

  const totals = report.reduce((acc, r) => {
    acc.gross += r.gross
    acc.advance += r.totalAdvance
    acc.net += r.netPay
    return acc
  }, { gross: 0, advance: 0, net: 0 })

  const salaryColumns = [
    { label: 'Name', value: (r) => r.name },
    { label: 'Type', value: (r) => r.workerType },
    { label: 'Days', value: (r) => r.daysPresent },
    { label: 'Gross', value: (r) => r.gross },
    { label: 'Advance', value: (r) => r.totalAdvance },
    { label: 'Net Pay', value: (r) => r.netPay }
  ]

  const handleExcelExport = () => exportToExcel(report, salaryColumns, `salary_${month}`, month)
  const handlePDFExport = () => exportToPDF(report, salaryColumns, `salary_${month}`, `Salary Report — ${month}`)

  return (
    <div className="page page-wide">
      <div className="page-header">
        <h1>Salary Report</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="date-input"
          />
          <button className="btn-sm-outline" onClick={handleExcelExport}>Excel</button>
          <button className="btn-sm-outline" onClick={handlePDFExport}>PDF</button>
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div className="summary-cards">
        <div className="summary-card">
          <p className="summary-label">Total Gross</p>
          <p className="summary-value">₹{totals.gross.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Total Advance</p>
          <p className="summary-value warning">₹{totals.advance.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Net Payable</p>
          <p className="summary-value success">₹{totals.net.toLocaleString()}</p>
        </div>
      </div>

      {report.length === 0 && <p className="empty-state">No workers found.</p>}

      <div className="salary-table-wrap">
        <table className="salary-table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Days</th>
              <th>Gross</th>
              <th>Advance</th>
              <th>Net Pay</th>
            </tr>
          </thead>
          <tbody>
            {report.map((r) => (
              <tr key={r.workerId}>
                <td>
                  <p className="worker-name">{r.name}</p>
                  <p className="worker-meta">{r.workerType}</p>
                </td>
                <td>{r.daysPresent}</td>
                <td>₹{r.gross.toLocaleString()}</td>
                <td className={r.totalAdvance > 0 ? 'text-warning' : ''}>₹{r.totalAdvance.toLocaleString()}</td>
                <td className={r.netPay < 0 ? 'text-danger' : 'text-success'}>
                  ₹{r.netPay.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SalaryReport