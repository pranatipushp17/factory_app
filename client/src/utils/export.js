import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Single-sheet Excel export
export function exportToExcel(data, columns, fileName, sheetName = 'Sheet1') {
  const rows = data.map((row) => {
    const obj = {}
    columns.forEach((col) => {
      obj[col.label] = col.value(row)
    })
    return obj
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

// Multi-sheet Excel export (Attendance + Advances combined)
export function exportMultiSheetExcel(sheets, fileName) {
  const wb = XLSX.utils.book_new()

  sheets.forEach(({ data, columns, sheetName }) => {
    const rows = data.map((row) => {
      const obj = {}
      columns.forEach((col) => {
        obj[col.label] = col.value(row)
      })
      return obj
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  })

  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

// PDF export
export function exportToPDF(data, columns, fileName, title) {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text(title, 14, 16)

  const head = [columns.map((c) => c.label)]
  const body = data.map((row) => columns.map((c) => String(c.value(row))))

  autoTable(doc, {
    head,
    body,
    startY: 24,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [26, 29, 26] }
  })

  doc.save(`${fileName}.pdf`)
}