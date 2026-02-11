import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import MainLayout from "../layout/MainLayout"
import API from "../services/api"
import Toast from "../components/Toast"
 
export default function ExtraFees() {
  const [extraFees, setExtraFees] = useState([])
  const [selectedFee, setSelectedFee] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newFee, setNewFee] = useState({ title: "", amount: "" })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [stats, setStats] = useState(null)

  const removeStudent = async (feeId, studentId) => {
    try {
      await API.delete(`/extra-fees/${feeId}/student/${studentId}`)
      setToast({ type: "success", message: "Student removed" })
      loadExtraFees()
      if (selectedFee) {
        const updated = await API.get(`/extra-fees/${selectedFee._id}`)
        setSelectedFee(updated.data)
      }
    } catch (err) {
      setToast({ type: "error", message: err.message })
    }
  }

  const loadExtraFeeStats = async () => {
    try {
      const res = await API.get("/extra-fees/stats")
      setStats(res.data)
    } catch (err) {
      console.error("Failed to load extra fee stats")
    }
  }

  const handleExtraReminder = async (extraFeeId, studentId) => {
    try {
      const res = await API.get(
        `/extra-fees/reminder-link/${extraFeeId}/${studentId}`
      )
      window.open(res.data.whatsappLink, "_blank")
    } catch (err) {
      alert("Failed to send reminder")
    }
  }

  useEffect(() => {
    loadExtraFees()
  }, [])

  useEffect(() => {
    loadExtraFeeStats()
  }, [])

  const loadExtraFees = async () => {
    try {
      setLoading(true)
      const res = await API.get("/extra-fees")
      setExtraFees(res.data)
    } catch (err) {
      setToast({ type: "error", message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const createExtraFee = async () => {
    if (!newFee.title || !newFee.amount) {
      setToast({ type: "error", message: "All fields required" })
      return
    }

    try {
      setLoading(true)
      await API.post("/extra-fees/create", {
        title: newFee.title,
        amount: Number(newFee.amount)
      })
      setToast({ type: "success", message: "Extra fee created!" })
      setShowCreateModal(false)
      setNewFee({ title: "", amount: "" })
      loadExtraFees()
    } catch (err) {
      setToast({ type: "error", message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const markAsPaid = async (feeId, studentId) => {
    try {
      const res = await API.post(`/extra-fees/${feeId}/pay/${studentId}`)
      setToast({ type: "success", message: "Payment recorded!" })
      
      // Open WhatsApp
      if (res.data.whatsappLink) {
        window.open(res.data.whatsappLink, "_blank")
      }
      
      loadExtraFees()
      if (selectedFee) {
        const updated = await API.get(`/extra-fees/${feeId}`)
        setSelectedFee(updated.data)
      }
    } catch (err) {
      setToast({ type: "error", message: err.message })
    }
  }

  const deleteExtraFee = async () => {
    try {
      await API.delete(`/extra-fees/${selectedFee._id}`)
      setToast({ type: "success", message: "Extra fee deleted" })
      setShowDeleteConfirm(false)
      setSelectedFee(null)
      loadExtraFees()
    } catch (err) {
      setToast({ type: "error", message: err.message })
    }
  }

  return (
    <MainLayout>
      <div className="extra-fees-page">
        {/* Header */}
        <motion.div
          className="page-header"
          style={{ marginBottom: "30px" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{
                fontSize: "32px",
                fontWeight: "700",
                background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "8px"
              }}>
                💰 Extra Fee Management
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                Create and manage additional fees
              </p>
            </div>

<motion.button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ➕ Create Extra Fee
            </motion.button>
          </div>
        </motion.div>

        {stats && (
          <motion.div
            style={{
              marginBottom: "30px",
              padding: "20px",
              background: "var(--bg-card)",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px"
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p style={{ color: "var(--text-secondary)" }}>Total Extra Fee</p>
              <h2>₹{stats.total.toLocaleString("en-IN")}</h2>
            </div>

            <div>
              <p style={{ color: "var(--text-secondary)" }}>Collected</p>
              <h2 style={{ color: "var(--success)" }}>
                ₹{stats.collected.toLocaleString("en-IN")}
              </h2>
            </div>

            <div>
              <p style={{ color: "var(--text-secondary)" }}>Pending</p>
              <h2 style={{ color: "var(--warning)" }}>
                ₹{stats.pending.toLocaleString("en-IN")}
              </h2>
            </div>
          </motion.div>
        )}
     
        {/* Extra Fees Grid */}
        {loading && !selectedFee ? (
          <div className="loading-container"><div className="loading-spinner" /><p>Loading...</p></div>
        ) : extraFees.length === 0 ? (
          <motion.div className="no-data" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="no-data-icon">💰</div>
            <h4>No extra fees created</h4>
            <p>Create your first extra fee to get started</p>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {extraFees.map((fee, i) => (
              <motion.div
                key={fee._id}
                className="card"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedFee(fee)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>{fee.title}</h3>
                <p style={{ fontSize: "28px", fontWeight: "700", color: "var(--accent)", marginBottom: "16px" }}>
                  ₹{fee.amount.toLocaleString()}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
                  <div>
                    <p style={{ color: "var(--text-secondary)" }}>Paid</p>
                    <p style={{ color: "var(--success)", fontWeight: "600" }}>
                      {fee.payments?.filter(p => p.paid).length || 0}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-secondary)" }}>Pending</p>
                    <p style={{ color: "var(--warning)", fontWeight: "600" }}>
                      {fee.payments?.filter(p => !p.paid).length || 0}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Fee Details Drawer */}
        <AnimatePresence>
          {selectedFee && (
            <motion.div
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFee(null)}
            >
              <motion.div
                className="drawer"
                style={{ width: "700px" }}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="drawer-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2>{selectedFee.title}</h2>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <motion.button
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        color: "var(--error)",
                        border: "1px solid var(--error)",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🗑️ Delete Fee
                    </motion.button>
                    <button className="close-btn" onClick={() => setSelectedFee(null)}>✕</button>
                  </div>
                </div>
                

                <div className="drawer-content">
                  <div style={{ marginBottom: "24px", padding: "20px", background: "var(--bg-card)", borderRadius: "12px" }}>
                    <h4 style={{ marginBottom: "12px" }}>Fee Amount</h4>
                    <p style={{ fontSize: "32px", fontWeight: "700", color: "var(--accent)" }}>
                      ₹{selectedFee.amount.toLocaleString()}
                    </p>
                  </div>

                  <h4 style={{ marginBottom: "16px" }}>Student Payment Status</h4>
                  <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead style={{ position: "sticky", top: 0, background: "var(--bg-secondary)", zIndex: 1 }}>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                          <th style={{ padding: "12px", textAlign: "left" }}>Student</th>
                          <th style={{ padding: "12px", textAlign: "left" }}>Class</th>
                          <th style={{ padding: "12px", textAlign: "center" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedFee.payments?.map((payment, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "12px" }}>{payment.studentName}</td>
                            <td style={{ padding: "12px" }}>{payment.studentClass}</td>
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              {payment.paid ? (
                                <span style={{
                                  padding: "6px 12px",
                                  background: "rgba(16, 185, 129, 0.2)",
                                  color: "var(--success)",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: "600"
                                }}>
                                  ✓ Paid
                                </span>
                              ) : (
                                <>
                                  <motion.button
                                    onClick={() => markAsPaid(selectedFee._id, payment.studentId)}
                                    style={{
                                      padding: "6px 16px",
                                      background: "var(--accent)",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                      fontSize: "12px",
                                      fontWeight: "600"
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Mark as Paid
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleExtraReminder(selectedFee._id, payment.studentId)}
                                    whileHover={{ scale: 1.05 }}
                                    style={{
                                      marginLeft: "8px",
                                      padding: "8px 14px",
                                      background: "#22c55e",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "8px",
                                      cursor: "pointer"
                                    }}
                                  >
                                    📱 Send Reminder
                                  </motion.button>
                                </>
                              )}

                              <motion.button
                                onClick={() => removeStudent(selectedFee._id, payment.studentId)}
                                style={{
                                  marginLeft: "8px",
                                  background: "rgba(239,68,68,0.1)",
                                  color: "var(--error)",
                                  border: "1px solid var(--error)",
                                  padding: "4px 10px",
                                  borderRadius: "6px"
                                }}
                              >
                                Remove
                              </motion.button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)}>
              <motion.div className="modal" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Create Extra Fee</h2>
                  <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
                </div>
                <div className="modal-content">
                  <div className="form-group">
                    <label>Fee Title *</label>
                    <input
                      className="form-input"
                      placeholder="e.g., Annual Day Fee, Sports Fee"
                      value={newFee.title}
                      onChange={(e) => setNewFee({ ...newFee, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter amount"
                      value={newFee.amount}
                      onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                    />
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "12px" }}>
                    This fee will be applied to all active students
                  </p>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={createExtraFee} disabled={loading}>
                    {loading ? "Creating..." : "Create Fee"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(false)}>
              <motion.div className="modal" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Delete Extra Fee</h2>
                  <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>✕</button>
                </div>
                <div className="modal-content">
                  <p>Are you sure you want to delete this extra fee? This action cannot be undone.</p>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={deleteExtraFee} style={{ background: "var(--error)" }}>
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </MainLayout>
  )
}