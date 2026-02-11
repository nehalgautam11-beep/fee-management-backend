const express = require("express")
const AdminLog = require("../models/AdminLog")
const verifyToken = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/", verifyToken, async (req, res) => {
  const logs = await AdminLog.find().sort({ date: -1 })
  res.json(logs)
})

module.exports = router
