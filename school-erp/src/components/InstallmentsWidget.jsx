import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import API from "../services/api"

export default function InstallmentsWidget() {
  const [stats, setStats] = useState({ total: 0, collected: 0, pending: 0, overdue: 0 })
  const [showDrawer, setShowDrawer] = useState(false)
  const [installments, setInstallments] = useState([])

  useEffect(() => {
    loadInstallments()
  }, [])

  const loadInstallments = async () => {
    try {
      const res = await API.get("/students")
      const students = res.data
      
      let allInstallments = []
      students.forEach(student => {
        student.installments?.forEach(inst => {
          allInstallments.push({
            ...inst,
            studentName: student.name,
            studentClass: student.class
          })
        })
      })

      const total = allInstallments.length
      const collected = allInstallments.filter(i => i.confirmed).length
      const pending = total - collected

      setStats({ total, collected, pending, overdue: 0 })
      setInstallments(allInstallments.sort((a, b) => new Date(b.date) - new Date(a.date)))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <motion.div
        className="installments-widget"
        style={{
          padding: "16px",
          background: "var(--bg-card)",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          cursor: "pointer",
          margin: "16px"
        }}
        onClick={() => setShowDrawer(true)}
        whileHover={{ scale: 1.02 }}
      >
        <h4 style={{ fontSize: "14px", marginBottom: "12px" }}>Installments Monitor</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
          <div><span style={{ color: "var(--text-secondary)" }}>Total:</span> <strong>{stats.total}</strong></div>
          <div><span style={{ color: "var(--text-secondary)" }}>Collected:</span> <strong style={{ color: "var(--success)" }}>{stats.collected}</strong></div>
          <div><span style={{ color: "var(--text-secondary)" }}>Pending:</span> <strong style={{ color: "var(--warning)" }}>{stats.pending}</strong></div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDrawer && (
          <motion.div className="drawer-overlay" onClick={() => setShowDrawer(false)}>
            <motion.div
              className="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="drawer-header">
                <h2>Installment Timeline</h2>
                <button className="close-btn" onClick={() => setShowDrawer(false)}>✕</button>
              </div>
              <div className="drawer-content">
                {installments.map((inst, i) => (
                  <div key={i} style={{
                    padding: "12px",
                    background: inst.confirmed ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                    borderRadius: "8px",
                    marginBottom: "12px"
                  }}>
                    <p style={{ fontWeight: "600" }}>{inst.studentName}</p>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      Class {inst.studentClass} • ₹{inst.amount} • {new Date(inst.date).toLocaleDateString()}
                    </p>
                    <span style={{
                      display: "inline-block",
                      marginTop: "4px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      background: inst.confirmed ? "var(--success)" : "var(--warning)",
                      color: "white"
                    }}>
                      {inst.confirmed ? "Paid" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}