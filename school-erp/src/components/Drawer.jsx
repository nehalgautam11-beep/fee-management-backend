import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import PayModal from "./PayModal"
import ConfirmModal from "./ConfirmModal"
import API from "../services/api"
import Toast from "./Toast"

export default function Drawer({ student, onClose, onUpdate }) {
  const [showPayModal, setShowPayModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({
    name: "",
    class: "",
    phone: "",
    totalFee: ""
  })
  const [showInstallmentEditModal, setShowInstallmentEditModal] = useState(false)
  const [installmentEditData, setInstallmentEditData] = useState({
    installmentId: "",
    amount: "",
    date: ""
  })
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  const classes = [
    "Playgroup", "Nursery", "KG-1", "KG-2",
    "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"
  ]

  // Initialize edit data when drawer opens
  useEffect(() => {
    if (student) {
      setEditData({
        name: student.name,
        class: student.class,
        phone: student.phone,
        totalFee: student.totalFee ?? 0
      })
    }
  }, [student])

  const handlePromote = async () => {
    if (!window.confirm(`Promote ${student.name} to next class?`)) return

    try {
      setLoading(true)
      const res = await API.post(`/students/auto-promote/${student._id}`)
      setToast({ type: "success", message: `Promoted to ${res.data.newClass}` })
      setTimeout(() => {
        onUpdate()
        onClose()
      }, 1500)
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      await API.delete(`/students/${student._id}`)
      setToast({ type: "success", message: "Student deleted successfully" })
      setTimeout(() => {
        onUpdate()
        onClose()
      }, 1500)
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {

    if (!editData.name || !editData.class || !editData.phone) {
      setToast({
        type: "error",
        message: "Name, class and phone are required"
      })
      return
    }

    if (!/^[0-9]{10}$/.test(editData.phone)) {
      setToast({
        type: "error",
        message: "Invalid phone number (10 digits required)"
      })
      return
    }

    const totalFee = Number(editData.totalFee)

    if (Number.isNaN(totalFee) || totalFee < 0) {
      setToast({
        type: "error",
        message: "Invalid total fee"
      })
      return
    }

    if (totalFee < student.paidFee) {
      setToast({
        type: "error",
        message:
          `Total fee cannot be less than paid amount ₹${student.paidFee}`
      })
      return
    }

    try {

      setLoading(true)

      await API.put(
        `/students/edit/${student._id}`,
        {
          name: editData.name,
          class: editData.class,
          phone: editData.phone,
          totalFee
        }
      )

      setToast({
        type: "success",
        message: "Student and fee updated successfully"
      })

      setShowEditModal(false)

      setTimeout(() => {
        onUpdate()
      }, 500)

    } catch (err) {

      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          err.message
      })

    } finally {
      setLoading(false)
    }
  }

  const handleEditInstallment = async () => {

    const { installmentId, amount, date } =
      installmentEditData

    const newAmount = Number(amount)

    if (
      !installmentId ||
      Number.isNaN(newAmount) ||
      newAmount <= 0 ||
      !date
    ) {
      setToast({
        type: "error",
        message: "Enter a valid amount and date"
      })
      return
    }

    try {

      setLoading(true)

      await API.put(
        `/students/${student._id}/installment/${installmentId}`,
        {
          amount: newAmount,
          date
        }
      )

      setToast({
        type: "success",
        message: "Installment updated successfully"
      })

      setShowInstallmentEditModal(false)

      onUpdate()

    } catch (err) {

      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          err.message
      })

    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInstallment = async (installmentId) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this installment?"
      )
    ) {
      return
    }

    try {

      setLoading(true)

      await API.delete(
        `/students/${student._id}/installment/${installmentId}`
      )

      setToast({
        type: "success",
        message: "Installment deleted successfully"
      })

      onUpdate()

    } catch (err) {

      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          err.message
      })

    } finally {
      setLoading(false)
    }
  }

  const paidPercent = student.totalFee > 0
    ? Math.round((student.paidFee / student.totalFee) * 100)
    : 0

  return (
    <AnimatePresence>
      <motion.div
        className="drawer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="drawer"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="drawer-header">
            <h2>Student Details</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {/* Content */}
          <div className="drawer-content">
            {/* Student Info Card */}
            <div className="info-card">
              <div className="student-avatar-large">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <h3>{student.name}</h3>
              <p className="student-phone">Phone: {student.phone}</p>
              <p className="student-class-large">Class {student.class}</p>
            </div>

            {/* Fee Summary */}
            <div className="fee-summary-card">
              <h4>Fee Summary</h4>
              <div className="fee-grid">
                <div className="fee-item">
                  <span className="fee-label">Total Fee</span>
                  <span className="fee-value total">₹{student.totalFee}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-label">Paid</span>
                  <span className="fee-value paid">₹{student.paidFee}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-label">Due</span>
                  <span className="fee-value due">₹{student.dueFee}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="fee-progress">
                <div 
                  className="fee-progress-bar"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
              <p className="progress-text">
                {paidPercent}% Paid
              </p>
            </div>

            {/* Installment History */}
            <div className="installments-card">
              <h4>Payment History</h4>
              {student.installments && student.installments.length > 0 ? (
                <div className="installments-list">
                  {student.installments.map((inst, index) => (
                    <motion.div
                      key={index}
                      className="installment-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "10px" }}
                    >
                      <div>
                        <div className="installment-date">
                          {new Date(inst.date).toLocaleDateString("en-GB")}
                        </div>
                        <div className="installment-amount" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          ₹{inst.amount}
                          {inst.confirmed && (
                            <span className="installment-badge" style={{ position: "static", display: "inline-flex" }}>✓</span>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap"
                        }}>
                        <button
                          className="btn"
                          style={{
                            padding: "6px 10px",
                            fontSize: "12px",
                            borderRadius: "6px",
                            background: "rgba(59, 130, 246, 0.1)",
                            color: "#3b82f6",
                            border: "1px solid #3b82f6",
                            cursor: "pointer"
                          }}
                          disabled={loading}
                          onClick={() => {

                            setInstallmentEditData({
                              installmentId: inst._id,
                              amount: inst.amount,
                              date: new Date(inst.date)
                                .toISOString()
                                .split("T")[0]
                            })

                            setShowInstallmentEditModal(true)
                          }}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="btn"
                          style={{
                            padding: "6px 10px",
                            fontSize: "12px",
                            borderRadius: "6px",
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                            border: "1px solid #ef4444",
                            cursor: "pointer"
                          }}
                          disabled={loading}
                          onClick={() =>
                            handleDeleteInstallment(inst._id)
                          }
                        >
                          🗑️ Delete
                        </button></div>
                      
                      {inst.receiptUrl && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <a 
                            href={inst.receiptUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-download"
                            style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            📄 Receipt
                          </a>
                          <a 
                            href={`https://wa.me/91${student.phone}?text=${encodeURIComponent(`GLOBAL INNOVATIVE SCHOOL\n\nPayment Successful!\n\nStudent: ${student.name}\nClass: ${student.class}\nAmount Paid: ₹${inst.amount}\nDate: ${new Date(inst.date).toLocaleDateString("en-GB")}\n\nDownload Receipt:\n${inst.receiptUrl}\n\nThank you!\n- GIS Fee Department`)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-whatsapp"
                            style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            📱 WhatsApp
                          </a>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No payment history</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="drawer-actions">
            <motion.button
              className="btn btn-edit"
              onClick={() => setShowEditModal(true)}
              disabled={loading}
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                color: "#3b82f6",
                border: "1px solid #3b82f6"
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Edit Details
            </motion.button>

            <motion.button
              className="btn btn-pay"
              onClick={() => setShowPayModal(true)}
              disabled={student.dueFee === 0 || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Pay Fee
            </motion.button>

            <motion.button
              className="btn btn-promote"
              onClick={handlePromote}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Promote
            </motion.button>

            <motion.button
              className="btn btn-delete"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Delete
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Edit Modal */}
      {showEditModal && (
        <motion.div 
          className="modal-overlay" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowEditModal(false)}
        >
          <motion.div 
            className="modal"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit Student</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  className="form-input"
                  placeholder="Enter student name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Class *</label>
                <select
                  className="form-input"
                  value={editData.class}
                  onChange={(e) => setEditData({ ...editData, class: e.target.value })}
                  disabled={loading}
                >
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  className="form-input"
                  placeholder="10-digit mobile number"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  maxLength="10"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Total Fee *</label>

                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter total fee"
                  min="0"
                  value={editData.totalFee}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      totalFee: e.target.value
                    })
                  }
                  disabled={loading}
                />

                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    marginTop: "6px"
                  }}
                >
                  Paid amount: ₹{student.paidFee}
                </p></div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>
                Name, Class, Phone, and Total Fee can be edited.
                Installments can be edited separately.
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-cancel" 
                onClick={() => setShowEditModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleEdit}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showInstallmentEditModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() =>
            setShowInstallmentEditModal(false)
          }
        >
          <motion.div
            className="modal"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <h2>Edit Installment</h2>

              <button
                className="close-btn"
                onClick={() =>
                  setShowInstallmentEditModal(false)
                }
              >
                ✕
              </button>

            </div>

            <div className="modal-content">

              <div className="form-group">

                <label>Amount *</label>

                <input
                  type="number"
                  className="form-input"
                  min="1"
                  value={installmentEditData.amount}
                  onChange={(e) =>
                    setInstallmentEditData({
                      ...installmentEditData,
                      amount: e.target.value
                    })
                  }
                  disabled={loading}
                />

              </div>

              <div className="form-group">

                <label>Date *</label>

                <input
                  type="date"
                  className="form-input"
                  value={installmentEditData.date}
                  onChange={(e) =>
                    setInstallmentEditData({
                      ...installmentEditData,
                      date: e.target.value
                    })
                  }
                  disabled={loading}
                />

              </div>

            </div>

            <div className="modal-actions">

              <button
                className="btn btn-cancel"
                onClick={() =>
                  setShowInstallmentEditModal(false)
                }
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={handleEditInstallment}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save Installment"}
              </button>

            </div>

          </motion.div>
        </motion.div>
      )}

      {showPayModal && (
        <PayModal
          student={student}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => {
            setShowPayModal(false)
            onUpdate()
            onClose()
          }}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Student"
          message={`Are you sure you want to delete ${student.name}? This action cannot be undone.`}
          onConfirm={() => {
            setShowDeleteConfirm(false)
            handleDelete()
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </AnimatePresence>
  )
}