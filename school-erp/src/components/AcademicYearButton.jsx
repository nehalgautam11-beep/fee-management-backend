import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import API from "../services/api"
import Toast from "./Toast"

export default function AcademicYearButton({ onComplete }) {
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState(1) // 1: confirm, 2: fee setup
  const [defaultFee, setDefaultFee] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const handleStart = async () => {
    try {
      setLoading(true)
      
      // Step 1: Delete all extra fees
      const extraFees = await API.get("/extra-fees")
      for (const fee of extraFees.data) {
        await API.delete(`/extra-fees/${fee._id}`)
      }
      
      // Step 2: Promote all students
      const students = await API.get("/students")
      for (const student of students.data) {
        await API.post(`/students/auto-promote/${student._id}`)
      }
      
      setStep(2) // Move to fee setup
    } catch (err) {
      setToast({ type: "error", message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleFeeSetup = async () => {
    try {
      setLoading(true)
      
      // Apply default fee to all students
      const students = await API.get("/students")
      for (const student of students.data) {
        await API.put(`/students/edit/${student._id}`, {
          totalFee: Number(defaultFee),
          paidFee: 0,
          dueFee: Number(defaultFee)
        })
      }
      
      setToast({ type: "success", message: "Academic year started successfully!" })
      setShowModal(false)
      onComplete()
    } catch (err) {
      setToast({ type: "error", message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setShowModal(true)}
        style={{
          padding: "14px 24px",
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          color: "white",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: "600"
        }}
        whileHover={{ scale: 1.05 }}
      >
        Start Next Academic Year
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" onClick={() => !loading && setShowModal(false)}>
            <motion.div className="modal" onClick={(e) => e.stopPropagation()}>
              {step === 1 ? (
                <>
                  <div className="modal-header"><h2>Start Academic Year</h2></div>
                  <div className="modal-content">
                    <p>This will:</p>
                    <ul>
                      <li>Delete all extra fees</li>
                      <li>Promote all students to next class</li>
                      <li>Reset fee collections</li>
                    </ul>
                    <p style={{ color: "var(--error)", fontWeight: "600" }}>This action cannot be undone!</p>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="btn btn-confirm" onClick={handleStart} disabled={loading}>
                      {loading ? "Processing..." : "Confirm"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="modal-header"><h2>Set Default Fee</h2></div>
                  <div className="modal-content">
                    <div className="form-group">
                      <label>Default Annual Fee (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={defaultFee}
                        onChange={(e) => setDefaultFee(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-primary" onClick={handleFeeSetup} disabled={loading || !defaultFee}>
                      {loading ? "Applying..." : "Complete Setup"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </>
  )
}