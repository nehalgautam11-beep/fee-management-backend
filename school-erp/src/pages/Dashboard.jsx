import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "../layout/MainLayout"
import API from "../services/api"
import StatCard from "../components/StatCard"
import Toast from "../components/Toast"
import { getAdmin } from "../hooks/useAuth"
import AIChatbot from "../components/AIChatbot"


export default function Dashboard() {
  const admin = getAdmin()
  const [stats, setStats] = useState({
    students: 0,
    collected: 0,
    pending: 0,
    avg: 0,
    high: 0
  })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)


  const [showAcademicYearModal, setShowAcademicYearModal] = useState(false)
const [classFees, setClassFees] = useState({
  "Playgroup": "",
  "Nursery": "",
  "KG-1": "",
  "KG-2": "",
  "1st": "",
  "2nd": "",
  "3rd": "",
  "4th": "",
  "5th": "",
  "6th": "",
  "7th": "",
  "8th": "",
  "9th": ""
})
const [ayLoading, setAyLoading] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [studentsRes, extraFeesRes] = await Promise.all([
        API.get("/students"),
        API.get("/extra-fees").catch(() => ({ data: [] }))
      ])

      const students = studentsRes.data
      const activeStudents = students.filter(s => s.isActive)
      const extraFees = extraFeesRes.data

      if (activeStudents.length === 0) {
        setStats({ students: 0, collected: 0, pending: 0, avg: 0, high: 0 })
        return
      }

      // Calculate regular fees
      const totalCollected = activeStudents.reduce((sum, s) => sum + (s.paidFee || 0), 0)
      const totalPending = activeStudents.reduce((sum, s) => sum + (s.dueFee || 0), 0)
      const totalFee = activeStudents.reduce((sum, s) => sum + (s.totalFee || 0), 0)
      const highestDue = Math.max(...activeStudents.map(s => s.dueFee || 0), 0)

      // Add extra fees to collected/pending
      let extraCollected = 0
      let extraPending = 0
      extraFees.forEach(ef => {
        const paidCount = ef.payments?.filter(p => p.paid).length || 0
        const unpaidCount = ef.payments?.filter(p => !p.paid).length || 0
        extraCollected += paidCount * ef.amount
        extraPending += unpaidCount * ef.amount
      })

      setStats({
        students: activeStudents.length,
        collected: totalCollected + extraCollected,
        pending: totalPending + extraPending,
        avg: activeStudents.length > 0 ? Math.round(totalFee / activeStudents.length) : 0,
        high: highestDue
      })
    } catch (err) {
      console.error("Dashboard load error:", err)
      setToast({ type: "error", message: "Failed to load dashboard data" })
    } finally {
      setLoading(false)
    }
  }

  const startAcademicYear = async () => {
  try {
    // Validate all fields filled
    const allFilled = Object.values(classFees).every(fee => fee && Number(fee) > 0)
    if (!allFilled) {
      setToast({ type: "error", message: "Please fill all class fees" })
      return
    }

 

    setAyLoading(true)
    
    // Convert to numbers
    const fees = {}
    Object.keys(classFees).forEach(cls => {
      fees[cls] = Number(classFees[cls])
    })

    await API.post("/students/academic-year/start", { classFees: fees })
    
    setToast({ type: "success", message: "Academic year started successfully!" })
    setShowAcademicYearModal(false)
    loadDashboard()
    
    // Reset form
    setClassFees({
      "Playgroup": "",
      "Nursery": "",
      "KG-1": "",
      "KG-2": "",
      "1st": "",
      "2nd": "",
      "3rd": "",
      "4th": "",
      "5th": "",
      "6th": "",
      "7th": "",
      "8th": "",
      "9th": ""
    })
  } catch (err) {
    setToast({ type: "error", message: err.response?.data?.message || err.message })
  } finally {
    setAyLoading(false)
  }
}

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <motion.div
          className="welcome-section"
          style={{
            marginBottom: "40px",
            padding: "30px",
            background: "var(--bg-card)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            position: "relative",
            overflow: "hidden"
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-10%",
              width: "300px",
              height: "300px",
              background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
              borderRadius: "50%",
              opacity: 0.1,
              filter: "blur(60px)"
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <h1 style={{ 
            fontSize: "36px", 
            fontWeight: "700",
            background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "12px",
            position: "relative",
            zIndex: 1
          }}>
            Hi {admin?.name || "Admin"}, Welcome Back! 👋
          </h1>
          <p style={{ 
            color: "var(--text-secondary)", 
            fontSize: "16px",
            position: "relative",
            zIndex: 1
          }}>
            {new Date().toLocaleDateString("en-IN", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })} • Global Innovative School ERP
          </p>
        </motion.div>

        {/* Academic Year Button */}
<motion.div
  style={{ marginBottom: "30px", display: "flex", justifyContent: "flex-end" }}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.3 }}
>
  <motion.button
    onClick={() => setShowAcademicYearModal(true)}
    style={{
      padding: "10px 20px",
      background: "linear-gradient(135deg, #f59e0b, #ef4444)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    🎓 Start New Academic Year
  </motion.button>
</motion.div>

        {/* Stats Grid */}
        {loading ? (
          <div className="dashboard-grid">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : (
          <div className="dashboard-grid">
            <StatCard title="Total Students" value={stats.students} delay={0.1} />
            <StatCard title="Total Collected" value={`₹${stats.collected.toLocaleString("en-IN")}`} delay={0.2} />
            <StatCard title="Total Pending" value={`₹${stats.pending.toLocaleString("en-IN")}`} delay={0.3} />
            <StatCard title="Average Fee" value={`₹${stats.avg.toLocaleString("en-IN")}`} delay={0.4} />
            <StatCard title="Highest Due" value={`₹${stats.high.toLocaleString("en-IN")}`} delay={0.5} />
          </div>
        )}
      </motion.div>

      {/* Academic Year Modal */}
{showAcademicYearModal && (
  <motion.div
    className="modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setShowAcademicYearModal(false)}
  >
    <motion.div
      className="modal"
      style={{ maxWidth: "600px", maxHeight: "80vh", overflowY: "auto" }}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <h2>🎓 Start New Academic Year</h2>
        <button className="close-btn" onClick={() => setShowAcademicYearModal(false)}>✕</button>
      </div>
      
      <div className="modal-content">
        <div style={{
          padding: "16px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid var(--error)",
          borderRadius: "8px",
          marginBottom: "20px"
        }}>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--error)", marginBottom: "8px" }}>
            ⚠️ WARNING: This action will:
          </p>
          <ul style={{ fontSize: "13px", color: "var(--text-secondary)", paddingLeft: "20px" }}>
            <li>Delete ALL extra fees permanently</li>
            <li>Auto-promote ALL students to next class</li>
            <li>Reset ALL student fees and payments</li>
            <li>This CANNOT be undone</li>
          </ul>
        </div>

        <h4 style={{ marginBottom: "16px", fontSize: "16px" }}>Enter Total Fee for Each Class:</h4>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {Object.keys(classFees).map(cls => (
            <div key={cls} className="form-group">
              <label>{cls}</label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter fee amount"
                value={classFees[cls]}
                onChange={(e) => setClassFees({ ...classFees, [cls]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="modal-actions">
        <button
          className="btn btn-cancel"
          onClick={() => setShowAcademicYearModal(false)}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={startAcademicYear}
          disabled={ayLoading}
          style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
        >
          {ayLoading ? "Processing..." : "Start Academic Year"}
        </button>
      </div>
    </motion.div>
  </motion.div>
)}

{/* AI Chatbot */}
<AIChatbot />


      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </MainLayout>
  )
}