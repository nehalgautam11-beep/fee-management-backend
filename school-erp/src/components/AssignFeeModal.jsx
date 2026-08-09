import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import API from "../services/api"
import Toast from "./Toast"

export default function AssignFeeModal({ student, onClose, onSuccess }) {
  const [form, setForm] = useState({
    annualFee: "",
    admissionFee: "",
    transportFee: "",
    hostelFee: "",
    discount: ""
  })
  const [installments, setInstallments] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const addInstallmentRow = () => {
    setInstallments([...installments, { label: "", amount: "", dueDate: "" }])
  }

  const updateInstallmentRow = (index, field, value) => {
    const next = [...installments]
    next[index] = { ...next[index], [field]: value }
    setInstallments(next)
  }

  const removeInstallmentRow = (index) => {
    setInstallments(installments.filter((_, i) => i !== index))
  }

  const computedTotal = Math.max(
    0,
    (Number(form.annualFee) || 0) +
      (Number(form.admissionFee) || 0) +
      (Number(form.transportFee) || 0) +
      (Number(form.hostelFee) || 0) -
      (Number(form.discount) || 0)
  )

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.annualFee || Number(form.annualFee) < 0) {
      setToast({ type: "error", message: "Annual Fee is required" })
      return
    }

    try {
      setLoading(true)
      await API.post(`/students/${student._id}/assign-fee`, {
        annualFee: Number(form.annualFee),
        admissionFee: Number(form.admissionFee) || 0,
        transportFee: Number(form.transportFee) || 0,
        hostelFee: Number(form.hostelFee) || 0,
        discount: Number(form.discount) || 0,
        installmentPlan: installments
          .filter(i => i.amount)
          .map(i => ({
            label: i.label,
            amount: Number(i.amount),
            dueDate: i.dueDate || undefined
          }))
      })

      setToast({ type: "success", message: "Fee structure assigned successfully!" })

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1200)
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || err.message })
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
          className="modal"
          style={{ maxWidth: "560px", maxHeight: "85vh", overflowY: "auto" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>💰 Assign Fee Structure</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className="modal-content">
            {/* Imported student details — read only */}
            <div style={{
              padding: "14px",
              borderRadius: "10px",
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid var(--border)",
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <strong>{student.name}</strong>
                {student.importedFromERP && (
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
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Class: {student.class} • Phone: {student.phone}
              </p>
            </div>

            <div className="form-group">
              <label>Annual Fee (₹) *</label>
              <input
                type="number" name="annualFee" className="form-input" min="0"
                placeholder="Enter annual fee" value={form.annualFee}
                onChange={handleChange} disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Admission Fee (₹)</label>
              <input
                type="number" name="admissionFee" className="form-input" min="0"
                placeholder="0" value={form.admissionFee}
                onChange={handleChange} disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Transport Fee (₹)</label>
              <input
                type="number" name="transportFee" className="form-input" min="0"
                placeholder="0" value={form.transportFee}
                onChange={handleChange} disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Hostel Fee (₹)</label>
              <input
                type="number" name="hostelFee" className="form-input" min="0"
                placeholder="0" value={form.hostelFee}
                onChange={handleChange} disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Discount (₹)</label>
              <input
                type="number" name="discount" className="form-input" min="0"
                placeholder="0" value={form.discount}
                onChange={handleChange} disabled={loading}
              />
            </div>

            {/* Installments plan (optional) */}
            <div className="form-group">
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Installments (optional)</span>
                <button
                  type="button"
                  onClick={addInstallmentRow}
                  disabled={loading}
                  style={{
                    fontSize: "13px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--accent)",
                    cursor: "pointer"
                  }}
                >
                  ➕ Add Installment
                </button>
              </label>

              {installments.map((inst, idx) => (
                <div key={idx} style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Label (e.g. Term 1)"
                    value={inst.label}
                    onChange={(e) => updateInstallmentRow(idx, "label", e.target.value)}
                    disabled={loading}
                    style={{ flex: 2 }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Amount"
                    min="0"
                    value={inst.amount}
                    onChange={(e) => updateInstallmentRow(idx, "amount", e.target.value)}
                    disabled={loading}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="date"
                    className="form-input"
                    value={inst.dueDate}
                    onChange={(e) => updateInstallmentRow(idx, "dueDate", e.target.value)}
                    disabled={loading}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeInstallmentRow(idx)}
                    disabled={loading}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--error)",
                      cursor: "pointer",
                      fontSize: "16px"
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: "16px",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid var(--success, #10b981)",
              fontWeight: 600
            }}>
              Total Fee: ₹{computedTotal.toLocaleString("en-IN")}
            </div>

            <div className="modal-actions">
              <motion.button
                type="button" className="btn btn-cancel" onClick={onClose}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={loading}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit" className="btn btn-primary"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={loading}
              >
                {loading ? "Saving..." : "Save Fee Structure"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
    </AnimatePresence>
  )
}