export const importCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target.result
        const lines = text.split("\n").filter(l => l.trim() !== "")
        const headers = lines[0].split(",").map(h => h.trim())

        const students = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim())
          const obj = {}

          headers.forEach((h, i) => {
            obj[h] = values[i]
          })

          return {
            name: obj["Name"],
            phone: String(obj["Mobile No."]),
            class: obj["Class"],
            totalFee: Number(obj["Total Fee"])
          }
        })

        resolve(students)
      } catch (err) {
        reject(new Error("Invalid CSV format"))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

export const exportCSV = (students, className) => {
  const headers = ["Serial No.", "Name", "Mobile No.", "Class"]
  const rows = students.map((s, i) =>
    [i + 1, s.name, s.phone, s.class].join(",")
  )

  const csv = [headers.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `Class_${className}_Students.csv`
  a.click()

  window.URL.revokeObjectURL(url)
}

export const exportAllDataCSV = (students) => {
  const headers = [
    "Serial No.", 
    "Name", 
    "Mobile No.", 
    "Class", 
    "Total Fee (Rs)", 
    "Paid Amount (Rs)", 
    "Pending Amount (Rs)", 
    "Payment History"
  ]

  const rows = students.map((s, i) => {
    // Format payment history nicely
    const history = (s.installments || []).map(inst => {
      const d = new Date(inst.date).toLocaleDateString("en-GB")
      return `${d}: Rs ${inst.amount}`
    }).join(" | ")

    // Escape quotes to prevent CSV breaking
    const safeHistory = `"${history.replace(/"/g, '""')}"`

    return [
      i + 1,
      `"${s.name}"`,
      s.phone,
      `"${s.class}"`,
      s.totalFee || 0,
      s.paidFee || 0,
      s.dueFee || 0,
      safeHistory
    ].join(",")
  })

  const csv = [headers.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  
  const today = new Date().toISOString().split("T")[0]
  a.download = `School_Database_Backup_${today}.csv`
  a.click()

  window.URL.revokeObjectURL(url)
}
