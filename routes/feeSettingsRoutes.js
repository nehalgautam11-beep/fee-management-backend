const express = require("express")
const pool = require("../utils/pgPool")
const cloudinary = require("../utils/cloudinary")
const verifyToken = require("../middleware/authMiddleware")
const { syncFeeSettings } = require("../utils/pgSync")

const router = express.Router()

/* -------------------------------------------------------
   Defaults — used only the very first time, when no
   fee_settings row exists yet in PostgreSQL.
------------------------------------------------------- */
const DEFAULT_QR_CODE_URL =
  "https://res.cloudinary.com/dtknsy5zm/image/upload/v1785738016/gis/documents/ihofaieucfvfot8akn2m.jpg"
const DEFAULT_UPI_ID = "merchant1583410.augp@aubank"
const DEFAULT_FEE_PORTAL_URL = "https://fee-management-backend-fawn.vercel.app/"

/* =======================
   GET FEE SETTINGS
   Returns the single Fee Settings record, creating it
   with defaults the first time it's requested.
======================= */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM fee_settings WHERE id = 1`)

    if (rows.length > 0) {
      return res.json(rows[0])
    }

    // No record yet — create the first one using the defaults.
    const settings = {
      qrCodeUrl: DEFAULT_QR_CODE_URL,
      upiId: DEFAULT_UPI_ID,
      feePortalUrl: DEFAULT_FEE_PORTAL_URL,
    }
    const saved = await syncFeeSettings(settings)

    res.json(
      saved || {
        qr_code_url: DEFAULT_QR_CODE_URL,
        upi_id: DEFAULT_UPI_ID,
        fee_portal_url: DEFAULT_FEE_PORTAL_URL,
      }
    )
  } catch (err) {
    console.error("❌ [feeSettings] GET failed:", err.message)
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   SAVE / UPDATE FEE SETTINGS
   There is only ever ONE Fee Settings record for the whole
   school (id = 1). If it exists it is updated, otherwise it
   is created. Never creates a second record.
======================= */
router.put("/", verifyToken, async (req, res) => {
  try {
    const { upiId, feePortalUrl, qrCodeBase64 } = req.body

    // ---- Validation ----
    if (upiId !== undefined && !String(upiId).trim()) {
      return res.status(400).json({ message: "UPI ID cannot be empty" })
    }

    if (feePortalUrl !== undefined && feePortalUrl !== null && feePortalUrl !== "") {
      try {
        new URL(feePortalUrl)
      } catch {
        return res.status(400).json({ message: "Fee Portal URL is not a valid URL" })
      }
    }

    // ---- Existing record (if any) ----
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM fee_settings WHERE id = 1`
    )
    const current = existingRows[0] || {
      qr_code_url: DEFAULT_QR_CODE_URL,
      upi_id: DEFAULT_UPI_ID,
      fee_portal_url: DEFAULT_FEE_PORTAL_URL,
    }

    // ---- Upload new QR code to Cloudinary, if provided ----
    let qrCodeUrl = current.qr_code_url
    if (qrCodeBase64) {
      try {
        const uploadResult = await cloudinary.uploader.upload(qrCodeBase64, {
          folder: "gis/documents",
          public_id: `fee_settings_qr_${Date.now()}`,
          overwrite: true,
        })
        qrCodeUrl = uploadResult.secure_url
      } catch (uploadErr) {
        console.error("❌ [feeSettings] QR code upload failed:", uploadErr.message)
        return res.status(500).json({ message: "QR code upload failed" })
      }
    }

    const settings = {
      qrCodeUrl,
      upiId: upiId !== undefined ? upiId : current.upi_id,
      feePortalUrl: feePortalUrl !== undefined ? feePortalUrl : current.fee_portal_url,
    }

    const saved = await syncFeeSettings(settings)

    if (!saved) {
      return res.status(500).json({ message: "Failed to save Fee Settings" })
    }

    res.json({ message: "Fee settings saved successfully", settings: saved })
  } catch (err) {
    console.error("❌ [feeSettings] SAVE failed:", err.message)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router