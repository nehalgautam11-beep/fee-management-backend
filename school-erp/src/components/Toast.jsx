import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"

export default function Toast({ type, message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ"
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`toast toast-${type}`}
        initial={{ opacity: 0, y: -50, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        exit={{ opacity: 0, y: -50, x: "-50%" }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="toast-icon">{icons[type]}</div>
        <p className="toast-message">{message}</p>
        <button className="toast-close" onClick={onClose}>✕</button>
      </motion.div>
    </AnimatePresence>
  )
}