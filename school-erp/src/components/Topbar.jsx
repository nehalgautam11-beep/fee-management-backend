import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function Topbar({ toggleSidebar }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [theme, setTheme] = useState(localStorage.getItem("erp-theme") || "theme-dark")

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    document.body.className = theme
    localStorage.setItem("erp-theme", theme)
  }, [theme])

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
  }

  return (
    <motion.div 
      className="topbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      {/* Left Section */}
      <div className="topbar-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <div className="page-title">
          <h3>Dashboard</h3>
          <p className="breadcrumb">Home / Dashboard</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="topbar-right">
        {/* Live Clock */}
        <div className="live-clock">
          <span className="time">
            {currentTime.toLocaleTimeString("en-IN", { 
              hour: "2-digit", 
              minute: "2-digit" 
            })}
          </span>
          <span className="date">
            {currentTime.toLocaleDateString("en-IN", { 
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}
          </span>
        </div>

        {/* Theme Selector */}
        <div className="theme-selector-wrapper">
          <select 
            className="theme-selector"
            value={theme}
            onChange={(e) => changeTheme(e.target.value)}
          >
            <option value="theme-dark">🌙 Dark</option>
            <option value="theme-light">☀️ Light</option>
            <option value="theme-purple">💜 Purple</option>
            <option value="theme-ocean">🌊 Ocean</option>
          </select>
        </div>

        {/* Notification Bell */}
        <button className="notification-btn">
          <span className="bell-icon">🔔</span>
          <span className="notification-badge">3</span>
        </button>
      </div>
    </motion.div>
  )
}