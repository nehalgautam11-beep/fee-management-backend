import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import ConfirmModal from "./ConfirmModal"
import API from "../services/api"
import Toast from "./Toast"

export default function PayModal({ student, onClose, onSuccess }) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [toast, setToast] = useState(null)
  const [receiptData, setReceiptData] = useState(null)

  const handleSubmit = () => {
    const payAmount = Number(amount)

    // Validation
    if (!amount || payAmount <= 0) {
      setToast({ type: "error", message: "Please enter a valid amount" })
      return
    }

    if (payAmount > student.dueFee) {
      setToast({ type: "error", message: `Amount cannot exceed due fee (₹${student.dueFee})` })
      return
    }

    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    try {
      setLoading(true)
      setShowConfirm(false)

      const res = await API.post(`/students/${student._id}/installment`, {
  amount: Number(amount)
})

      setReceiptData(res.data)
      setToast({ type: "success", message: "Payment successful!" })

      // Auto-close after showing receipt
      setTimeout(() => {
        onSuccess()
      }, 3000)
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
          className="modal pay-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {!receiptData ? (
            <>
              {/* Payment Form */}
              <div className="modal-header">
                <h2>💰 Pay Fee</h2>
                <button className="close-btn" onClick={onClose}>✕</button>
              </div>

              <div className="modal-content">
                {/* Student Info */}
                <div className="payment-student-info">
                  <p><strong>Student:</strong> {student.name}</p>
                  <p><strong>Class:</strong> {student.class}</p>
                  <p><strong>Total Fee:</strong> ₹{student.totalFee}</p>
                  <p><strong>Paid:</strong> ₹{student.paidFee}</p>
                  <p className="due-highlight"><strong>Due:</strong> ₹{student.dueFee}</p>
                </div>

                {/* Amount Input */}
                <div className="form-group">
                  <label>Enter Payment Amount</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={student.dueFee}
                    min="1"
                  />
                  <div className="quick-amounts">
                    <button onClick={() => setAmount(String(student.dueFee))}>
                      Full ({student.dueFee})
                    </button>
                    <button onClick={() => setAmount(String(Math.round(student.dueFee / 2)))}>
                      Half ({Math.round(student.dueFee / 2)})
                    </button>
                  </div>
                </div>

                {/* Preview */}
                {amount && Number(amount) > 0 && (
                  <motion.div
                    className="payment-preview"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p>After Payment:</p>
                    <p><strong>Paid:</strong> ₹{student.paidFee + Number(amount)}</p>
                    <p><strong>Remaining:</strong> ₹{student.dueFee - Number(amount)}</p>
                  </motion.div>
                )}
              </div>

              <div className="modal-actions">
                <motion.button
                  className="btn btn-cancel"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? "Processing..." : "Proceed to Pay"}
                </motion.button>
              </div>
            </>
          ) : (
            <>
              {/* Success Screen */}
              <div className="modal-header success">
                <motion.div
                  className="success-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  ✓
                </motion.div>
                <h2>Payment Successful!</h2>
              </div>

              <div className="modal-content">
                <div className="receipt-info">
                  <p>Amount Paid: <strong>₹{amount}</strong></p>
                  <p>Receipt generated and ready to download</p>
                </div>

                <div className="receipt-actions">
                  <motion.a
  href={receiptData.receiptUrl}
  target="_blank"
  rel="noopener noreferrer"
  download="receipt.pdf"
  className="btn btn-download"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  📄 Download Receipt
</motion.a>

                  <motion.a
                    href={receiptData.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                     download
                  >
                    📱 Send via WhatsApp
                  </motion.a>
                </div>

                <p className="receipt-note">
                  ⚠️ Receipt link expires in 24 hours
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      {showConfirm && (
        <ConfirmModal
          title="Confirm Payment"
          message={`Once confirmed, payment details cannot be modified. Are you sure you want to pay ₹${amount}?`}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
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