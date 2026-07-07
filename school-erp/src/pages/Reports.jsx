import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "../layout/MainLayout"
import API from "../services/api"
import Toast from "../components/Toast"

export default function Reports() {
  const [summary, setSummary] = useState(null)
  const [classWise, setClassWise] = useState([])
  const [defaulters, setDefaulters] = useState([])
  const [dailyReports, setDailyReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const [summaryRes, classRes, defaultersRes, dailyRes] = await Promise.all([
        API.get("/reports/summary"),
        API.get("/reports/class-wise"),
        API.get("/reports/defaulters"),
        API.get("/reports/daily")
      ])

      setSummary(summaryRes.data)
      setClassWise(classRes.data)
      setDefaulters(defaultersRes.data)
      setDailyReports(dailyRes.data)
    } catch (err) {
      setToast({ type: "error", message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{
          fontSize: "32px",
          fontWeight: "700",
          background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "30px"
        }}>
          📊 Reports & Analytics
        </h1>

        {loading ? (
          <div className="loading-container"><div className="loading-spinner" /><p>Loading...</p></div>
        ) : (
          <>
            {/* Summary */}
            {summary && (
              <motion.div className="card" style={{ marginBottom: "30px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3>Summary Report</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "20px" }}>
                  <div><p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Total Students</p><h2>{summary.totalStudents}</h2></div>
                  <div><p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Total Collected</p><h2 style={{ color: "var(--success)" }}>₹{summary.totalCollected.toLocaleString()}</h2></div>
                  <div><p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Total Due</p><h2 style={{ color: "var(--warning)" }}>₹{summary.totalDue.toLocaleString()}</h2></div>
                </div>
              </motion.div>
            )}

            {/* Class Wise */}
            <motion.div className="card" style={{ marginBottom: "30px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h3>Class-wise Report</h3>
              <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>Class</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>Collected</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {classWise.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px" }}>{item.class}</td>
                      <td style={{ padding: "12px", textAlign: "right", color: "var(--success)" }}>₹{item.collected.toLocaleString()}</td>
                      <td style={{ padding: "12px", textAlign: "right", color: "var(--warning)" }}>₹{item.due.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Top Defaulters */}
            <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <h3>Top 5 Defaulters</h3>
              <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Class</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>Due Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {defaulters.map((student, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px" }}>{student.name}</td>
                      <td style={{ padding: "12px" }}>{student.class}</td>
                      <td style={{ padding: "12px", textAlign: "right", color: "var(--error)", fontWeight: "600" }}>₹{student.dueFee.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Daily Reports */}
            <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginTop: "30px" }}>
              <h3>Daily Collection Reports (Last 30 Days)</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse", minWidth: "500px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Cash Collected</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Online Collected</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Total Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyReports.map((report, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px", fontWeight: "600", color: "var(--text-primary)" }}>
                          {new Date(report._id).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", color: "var(--text-secondary)" }}>
                          ₹{report.cash.toLocaleString()}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", color: "var(--text-secondary)" }}>
                          ₹{report.online.toLocaleString()}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", color: "var(--success)", fontWeight: "bold" }}>
                          ₹{report.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {dailyReports.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                          No recent payment history available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </MainLayout>
  )
}