import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import MainLayout from "../layout/MainLayout"
import { getAdmin } from "../hooks/useAuth"
import Toast from "../components/Toast"
import API from "../services/api"

export default function Settings() {
  const admin = getAdmin()
  const [toast, setToast] = useState(null)

  /* =======================
     FEE SETTINGS (school-wide, single record, synced to PostgreSQL for the ERP)
  ======================= */
  const [feeSettings, setFeeSettings] = useState({
    qr_code_url: "",
    upi_id: "",
    fee_portal_url: ""
  })
  const [qrPreview, setQrPreview] = useState("")
  const [qrBase64, setQrBase64] = useState(null)
  const [feeSettingsLoading, setFeeSettingsLoading] = useState(true)
  const [savingFeeSettings, setSavingFeeSettings] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const loadFeeSettings = async () => {
      try {
        const res = await API.get("/fee-settings")
        setFeeSettings(res.data)
        setQrPreview(res.data.qr_code_url || "")
      } catch (err) {
        setToast({ type: "error", message: err.message })
      } finally {
        setFeeSettingsLoading(false)
      }
    }
    loadFeeSettings()
  }, [])

  const handleQrFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setQrBase64(reader.result)
      setQrPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveFeeSettings = async () => {
    try {
      setSavingFeeSettings(true)
      const payload = {
        upiId: feeSettings.upi_id,
        feePortalUrl: feeSettings.fee_portal_url
      }
      if (qrBase64) {
        payload.qrCodeBase64 = qrBase64
      }

      const res = await API.put("/fee-settings", payload)
      setFeeSettings(res.data.settings)
      setQrPreview(res.data.settings.qr_code_url || "")
      setQrBase64(null)
      setToast({ type: "success", message: "Fee settings saved successfully" })
    } catch (err) {
      setToast({ type: "error", message: err.message })
    } finally {
      setSavingFeeSettings(false)
    }
  }

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

        {/* Fee Settings (school-wide, synced to PostgreSQL for the ERP) */}
        <motion.div className="card" style={{ marginBottom: "30px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <h3>💳 Fee Settings</h3>
          <p style={{ marginTop: "6px", color: "var(--text-secondary)", fontSize: "14px" }}>
            School-wide payment information shown to parents and read directly by the ERP.
          </p>

          {feeSettingsLoading ? (
            <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>Loading...</p>
          ) : (
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "18px", maxWidth: "480px" }}>

              {/* QR Code */}
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "8px" }}>QR Code</label>
                {qrPreview && (
                  <img
                    src={qrPreview}
                    alt="Payment QR Code"
                    style={{ width: "140px", height: "140px", objectFit: "contain", borderRadius: "8px", border: "1px solid var(--border, #ddd)", marginBottom: "10px", display: "block" }}
                  />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQrFileChange}
                />
              </div>

              {/* UPI ID */}
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "8px" }}>UPI ID</label>
                <input
                  type="text"
                  value={feeSettings.upi_id || ""}
                  onChange={(e) => setFeeSettings({ ...feeSettings, upi_id: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border, #ccc)" }}
                />
              </div>

              {/* Fee Portal URL */}
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "8px" }}>Fee Portal URL</label>
                <input
                  type="text"
                  value={feeSettings.fee_portal_url || ""}
                  onChange={(e) => setFeeSettings({ ...feeSettings, fee_portal_url: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border, #ccc)" }}
                />
              </div>

              <button
                onClick={handleSaveFeeSettings}
                disabled={savingFeeSettings}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: savingFeeSettings ? "not-allowed" : "pointer",
                  opacity: savingFeeSettings ? 0.7 : 1,
                  width: "fit-content"
                }}
              >
                {savingFeeSettings ? "Saving..." : "Save"}
              </button>
            </div>
          )}
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