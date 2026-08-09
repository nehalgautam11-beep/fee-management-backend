import { motion } from "framer-motion"
import { useState } from "react"
import Drawer from "./Drawer"
import API from "../services/api"
import Toast from "./Toast"
import AssignFeeModal from "./AssignFeeModal"

export default function StudentRow({ data, onUpdate }) {
  const [showDrawer, setShowDrawer] = useState(false)
  const [toast, setToast] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAssignFeeModal, setShowAssignFeeModal] = useState(false)
  const isPendingFeeStructure = data.feeStructureStatus === "Pending"

  const handleReminder = async () => {
    try {
      const res = await API.get(`/students/reminder-link/${data._id}`)
      window.open(res.data.whatsappLink, "_blank")
      setToast({ type: "success", message: "Reminder link opened!" })
    } catch (err) {
      setToast({ type: "error", message: err.message })
    }
  }

  const confirmDelete = async () => {
    try {
      await API.delete(`/students/${data._id}`)
      setShowDeleteModal(false)
      onUpdate()
      setToast({ type: "success", message: "Student deleted successfully" })
    } catch (err) {
      setToast({ type: "error", message: err.message })
    }
  }

  return (
    <>
      <motion.div
        className="student-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}
      >
        <div className="student-card-header">
          <div className="student-avatar">
            {data.name.charAt(0).toUpperCase()}
          </div>
          <div className="student-info">
            <h4 className="student-name">{data.name}</h4>
            <p className="student-class">Class: {data.class}</p>
            <div style={{ display: "flex", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
              {data.importedFromERP && (
                <span style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "rgba(99, 102, 241, 0.15)",
                  color: "var(--accent)"
                }}>
                  Imported from ERP
                </span>
              )}
              <span style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "999px",
                background: isPendingFeeStructure ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                color: isPendingFeeStructure ? "#f59e0b" : "#10b981"
              }}>
                {isPendingFeeStructure ? "🟠 Fee Pending" : "🟢 Fee Assigned"}
              </span>
            </div>
          </div>
          <div className={`status-badge ${data.dueFee === 0 ? "paid" : "pending"}`}>
            {data.dueFee === 0 ? "✓ Paid" : "⚠ Pending"}
          </div>
        </div>

        <div className="student-card-actions">
          {isPendingFeeStructure ? (
            <motion.button
              className="btn-details"
              onClick={() => setShowAssignFeeModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff" }}
            >
              💰 Assign Fee
            </motion.button>
          ) : (
            <motion.button
              className="btn-reminder"
              onClick={handleReminder}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={data.dueFee === 0}
            >
              📱 Send Reminder
            </motion.button>
          )}

          <motion.button
            className="btn-details"
            onClick={() => setShowDrawer(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            👁️ View Details
          </motion.button>

        </div>
      </motion.div>

      {showDrawer && (
        <Drawer
          student={data}
          onClose={() => setShowDrawer(false)}
          onUpdate={onUpdate}
        />
      )}

      {showAssignFeeModal && (
        <AssignFeeModal
          student={data}
          onClose={() => setShowAssignFeeModal(false)}
          onSuccess={onUpdate}
        />
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Delete Student</h3>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-content">
              <p>
                Are you sure you want to delete <b>{data.name}</b>?
              </p>
              <p style={{ color: "var(--error)", fontSize: "13px", marginTop: "8px" }}>
                This action cannot be undone.
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}