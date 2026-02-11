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
