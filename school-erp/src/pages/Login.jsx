import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import API from "../services/api"
import { login } from "../hooks/useAuth"
import Toast from "../components/Toast"
import "../styles/login-professional.css"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setToast({ type: "error", message: "Please fill all fields" })
      return
    }

    try {
      setLoading(true)
      const res = await API.post("/auth/login", { email, password })
      
      login(res.data.token, res.data.admin)
      
      setToast({ type: "success", message: "Login Successful" })
      
      setTimeout(() => {
        navigate("/dashboard")
      }, 1000)
    } catch (err) {
      setToast({ type: "error", message: err.message || "Invalid credentials" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-professional">
      {/* Animated Background */}
      <div className="login-bg">
        <div className="grid-overlay" />
        <div className="glow-orb glow-1" />
        <div className="glow-orb glow-2" />
        <div className="glow-orb glow-3" />
      </div>

      {/* Floating Particles */}
      <div className="particles-container">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Login Container */}
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo Section */}
        <div className="login-logo">
          <motion.div
            className="logo-circle"
            animate={{
              boxShadow: [
                "0 0 20px rgba(99, 102, 241, 0.3)",
                "0 0 40px rgba(99, 102, 241, 0.6)",
                "0 0 20px rgba(99, 102, 241, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="logo-text">GIS</div>
          </motion.div>
        </div>

        {/* Header */}
        <motion.div
          className="login-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1>Administrator Access</h1>
          <p>Global Innovative School ERP</p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="login-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="form-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <motion.button
            type="submit"
            className="login-submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <div className="login-footer">
          <div className="security-indicator">
            <span className="secure-icon" />
            Secure Connection
          </div>
          <div className="version">v1.0.0</div>
        </div>
      </motion.div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}