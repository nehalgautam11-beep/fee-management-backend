import { motion } from "framer-motion"
import { getAdmin } from "../hooks/useAuth"

export default function Sidebar({ currentPath, onNavigate, onLogout, isOpen, setIsOpen }) {
  const admin = getAdmin()

 const menuItems = [
  { icon: "📊", label: "Dashboard", path: "/dashboard" },
  { icon: "👥", label: "Students", path: "/students" },
  { icon: "💰", label: "Extra Fees", path: "/extra-fees" },
  { icon: "📄", label: "Reports", path: "/reports" },
  { icon: "⚙️", label: "Settings", path: "/settings" }
]
  

  return (
    <motion.div 
      className={`sidebar ${isOpen ? "open" : "closed"}`}
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">🎓</div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="logo-text">GIS ERP</h2>
              <p className="logo-subtitle">Fee Management</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Admin Info */}
      {isOpen && admin && (
        <motion.div 
          className="admin-card"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="admin-avatar">
            {admin.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="admin-info">
            <p className="admin-name">{admin.name || "Admin"}</p>
            <p className="admin-role">{admin.role || "Administrator"}</p>
          </div>
        </motion.div>
      )}

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.path}
            className={`nav-btn ${currentPath === item.path ? "active" : ""} ${item.disabled ? "disabled" : ""}`}
            onClick={() => !item.disabled && onNavigate(item.path)}
            disabled={item.disabled}
            whileHover={!item.disabled ? { scale: 1.02, x: 5 } : {}}
            whileTap={!item.disabled ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <span className="nav-icon">{item.icon}</span>
            {isOpen && <span className="nav-label">{item.label}</span>}
            {item.disabled && isOpen && (
              <span className="coming-soon">Soon</span>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Logout Button */}
      <motion.button
        className="logout-btn"
        onClick={onLogout}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="nav-icon">🚪</span>
        {isOpen && <span className="nav-label">Logout</span>}
      </motion.button>

      {/* Collapse Toggle */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "◀" : "▶"}
      </button>
    </motion.div>
  )
}