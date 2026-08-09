import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import AssignFeeModal from "./AssignFeeModal"

export default function PendingFeeStructureModal({ students, onClose, onUpdate }) {
  const [assigningStudent, setAssigningStudent] = useState(null)

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
          style={{ maxWidth: "640px", maxHeight: "85vh", overflowY: "auto" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>🟠 Pending Fee Structure ({students.length})</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="modal-content">
            {students.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>
                No students are waiting on a fee structure right now 🎉
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {students.map((student) => (
                  <div
                    key={student._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-card)"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAssigningStudent(student)}
                      style={{
                        padding: "10px 16px",
                        background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      💰 Assign Fee
                    </motion.button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {assigningStudent && (
        <AssignFeeModal
          student={assigningStudent}
          onClose={() => setAssigningStudent(null)}
          onSuccess={() => {
            setAssigningStudent(null)
            onUpdate()
          }}
        />
      )}
    </AnimatePresence>
  )
}