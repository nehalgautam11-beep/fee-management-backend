import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import API from "../services/api"
import Toast from "./Toast"

export default function AddStudentModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    class: "",
    totalFee: ""
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const classes = [
    "Playgroup", "Nursery", "KG-1", "KG-2",
    "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.phone || !formData.class || !formData.totalFee) {
      setToast({ type: "error", message: "All fields are required" })
      return
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setToast({ type: "error", message: "Invalid phone number (10 digits required)" })
      return
    }

    if (Number(formData.totalFee) <= 0) {
      setToast({ type: "error", message: "Total fee must be positive" })
      return
    }

    try {
      setLoading(true)
      await API.post("/students/add", {
        name: formData.name,
        phone: formData.phone,
        class: formData.class,
        totalFee: Number(formData.totalFee)
      })

      setToast({ type: "success", message: "Student added successfully!" })
      
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      setToast({ type: "error", message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal add-student-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>➕ Add New Student</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className="modal-content">
            <div className="form-group">
              <label>Student Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter student name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Parent Phone *</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Class *</label>
              <select
                name="class"
                className="form-input"
                value={formData.class}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Total Fee (₹) *</label>
              <input
                type="number"
                name="totalFee"
                className="form-input"
                placeholder="Enter total annual fee"
                value={formData.totalFee}
                onChange={handleChange}
                min="0"
                disabled={loading}
              />
            </div>

            <div className="modal-actions">
              <motion.button
                type="button"
                className="btn btn-cancel"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Student"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>

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