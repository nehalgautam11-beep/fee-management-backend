import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import MainLayout from "../layout/MainLayout"
import API from "../services/api"
import ClassSelector from "../components/ClassSelector"
import StudentRow from "../components/StudentRow"
import Toast from "../components/Toast"
import { exportCSV } from "../utils/csvUtils"



export default function Students() {
  const [selectedClass, setSelectedClass] = useState("")
  const [allStudents, setAllStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState("")


const loadStudents = useCallback(async () => {
  try {
    setLoading(true)
    const res = await API.get("/students")
    setAllStudents(res.data)
  } catch (err) {
    setToast({ type: "error", message: err.message })
  } finally {
    setLoading(false)
  }
}, [])


useEffect(() => {
  loadStudents()
}, [loadStudents])

const [filters, setFilters] = useState({
  status: "all", // all, paid, due
  minDue: "",
  maxDue: ""
})

const getFilteredStudents = () => {
  let filtered = selectedClass
    ? allStudents.filter(s => s.class === selectedClass)
    : []

  if (search) {
    filtered = filtered.filter(
      s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.includes(search)
    )
  }

  if (filters.status === "paid") {
    filtered = filtered.filter(s => s.dueFee === 0)
  } else if (filters.status === "due") {
    filtered = filtered.filter(s => s.dueFee > 0)
  }

  if (filters.minDue) {
    filtered = filtered.filter(s => s.dueFee >= Number(filters.minDue))
  }

  if (filters.maxDue) {
    filtered = filtered.filter(s => s.dueFee <= Number(filters.maxDue))
  }

  return filtered
}


// Move promoteWholeClass here, above return
const promoteWholeClass = async () => {
  if (!window.confirm(`Promote all students of class ${selectedClass}? This cannot be undone.`)) return

  try {
setLoading(true)
for (const student of filteredStudents) {

  await API.post(`/students/auto-promote/${student._id}`)
}

    setToast({ type: "success", message: `Class ${selectedClass} promoted successfully!` })
    loadStudents()
    setSelectedClass("") // Reset class
  } catch (err) {
    setToast({ type: "error", message: err.message })
  } finally {
    setLoading(false)
  }
}


// ================= CSV EXPORT =================

const handleExport = () => {
  if (!selectedClass) return
  exportCSV(filteredStudents, selectedClass)
}

const filteredStudents = getFilteredStudents()

  return (
    
    <MainLayout>
      <div className="students-page">
        {/* Header with ERP Note */}
        <motion.div
          className="page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px"
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "700",
              background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "8px"
            }}>
              Student Management
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Manage students, fees, and records
            </p>
          </div>

          <div
            style={{
              padding: "12px 18px",
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px dashed var(--accent)",
              borderRadius: "12px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>ℹ️</span>
            <span>Students will be added in the main School ERP system</span>
          </div>
        </motion.div>

{selectedClass && filteredStudents.length > 0 && (
  <motion.button
    onClick={promoteWholeClass}
    style={{
      padding: "14px 24px",
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer"
    }}
    whileHover={{ scale: 1.05 }}
  >
    ⬆️ Promote Entire Class
  </motion.button>
)}

{/* Class Selector */}
<ClassSelector 
  selected={selectedClass}
  onSelect={setSelectedClass}
/>
{selectedClass && (
  <motion.div
    className="filters-container"
    style={{
      padding: "20px",
      background: "var(--bg-card)",
      borderRadius: "16px",
      marginBottom: "24px",
      border: "1px solid var(--border)"
    }}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <h4 style={{ marginBottom: "16px", fontSize: "16px" }}>🔍 Filters</h4>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
          Payment Status
        </label>
        <select
          className="form-input"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">All Students</option>
          <option value="paid">Fully Paid</option>
          <option value="due">Has Due</option>
        </select>
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
          Min Due Amount
        </label>
        <input
          type="number"
          className="form-input"
          placeholder="₹ 0"
          value={filters.minDue}
          onChange={(e) => setFilters({ ...filters, minDue: e.target.value })}
        />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
          Max Due Amount
        </label>
        <input
          type="number"
          className="form-input"
          placeholder="₹ 100000"
          value={filters.maxDue}
          onChange={(e) => setFilters({ ...filters, maxDue: e.target.value })}
        />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <motion.button
          onClick={() => setFilters({ status: "all", minDue: "", maxDue: "" })}
          style={{
            padding: "12px 20px",
            background: "rgba(239, 68, 68, 0.1)",
            color: "var(--error)",
            border: "1px solid var(--error)",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px"
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reset Filters
        </motion.button>
      </div>
    </div>
  </motion.div>
)}


{selectedClass && (
  <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
    <motion.button
      type="button"
      onClick={handleExport}
      disabled={!filteredStudents.length}
      whileHover={{ scale: 1.05 }}
      style={{
        padding: "12px 20px",
        background: "#0ea5e9",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        opacity: filteredStudents.length ? 1 : 0.5
      }}
    >
      📤 Export CSV
    </motion.button>
  </div>
)}


<input
  type="text"
  placeholder="🔍 Search by name or phone"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="form-input"
  style={{
    width: "300px",
    marginBottom: "15px"
  }}
/>



{/* Students List */}
        <div className="students-container">

            <motion.div
              className="students-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3>Class {selectedClass} Students</h3>
              <p className="student-count">{filteredStudents.length} students found</p>
            </motion.div>

            {loading ? (
              <div className="loading-container">
                <motion.div
                  className="loading-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p>Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <motion.div
                className="no-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="no-data-icon">📚</div>
                <h4>No students found</h4>
                <p>No students enrolled in this class yet</p>
              </motion.div>
            ) : (
              <div className="students-grid">
                {filteredStudents.map((student, index) => (
                  <motion.div
                    key={student._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StudentRow 
                      data={student}
                      onUpdate={loadStudents}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        

        {!selectedClass && (
          <motion.div
            className="select-prompt"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="prompt-icon">👆</div>
            <h3>Select a class to view students</h3>
            <p>Choose from the class options above</p>
          </motion.div>
        )}
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </MainLayout>
  )
}