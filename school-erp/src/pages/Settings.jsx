import { useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "../layout/MainLayout"
import { getAdmin } from "../hooks/useAuth"
import Toast from "../components/Toast"

export default function Settings() {
  const admin = getAdmin()
  const [toast, setToast] = useState(null)

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{
          fontSize: "32px",
          fontWeight: "700",
          background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "30px"
        }}>
          ⚙️ Settings
        </h1>

        {/* Profile */}
        <motion.div className="card" style={{ marginBottom: "30px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3>Profile Information</h3>
          <div style={{ marginTop: "20px" }}>
            <p><strong>Name:</strong> {admin?.name || "N/A"}</p>
            <p><strong>Email:</strong> {admin?.email || "N/A"}</p>
            <p><strong>Role:</strong> {admin?.role || "admin"}</p>
          </div>
        </motion.div>

        {/* Theme */}
        <motion.div className="card" style={{ marginBottom: "30px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3>Appearance</h3>
          <p style={{ marginTop: "10px", color: "var(--text-secondary)", fontSize: "14px" }}>Theme can be changed from the top bar dropdown</p>
        </motion.div>

        {/* About */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h3>About</h3>
          <p style={{ marginTop: "10px", color: "var(--text-secondary)", fontSize: "14px" }}>Global Innovative School ERP v1.0.0</p>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Fee Management System</p>
        </motion.div>
      </motion.div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </MainLayout>
  )
}