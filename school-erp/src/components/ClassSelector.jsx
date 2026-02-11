import { motion } from "framer-motion"

export default function ClassSelector({ selected, onSelect }) {
  const classes = [
    "Playgroup", "Nursery", "KG-1", "KG-2",
    "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th","9th"
  ]

  return (
    <div className="class-selector-container">
      <motion.h3
        className="section-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Select Class
      </motion.h3>

      <div className="class-pills-grid">
        {classes.map((cls, index) => (
          <motion.button
            key={cls}
            className={`class-pill ${selected === cls ? "active" : ""}`}
            onClick={() => onSelect(cls)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="pill-content">
              <span className="pill-icon">🎓</span>
              <span className="pill-text">{cls}</span>
            </div>
            {selected === cls && (
              <motion.div
                className="pill-glow"
                layoutId="activeClass"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}