const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")

const router = express.Router()

// =======================
// REGISTER ADMIN (ONE TIME)
// =======================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" })
    }

    const exists = await Admin.findOne({ email })
    if (exists) {
      return res.status(409).json({ message: "Admin already exists" })
    }

    const hashed = await bcrypt.hash(password, 10)

    const admin = new Admin({
      name,
      email,
      password: hashed
    })

    await admin.save()
    res.json({ message: "Admin registered successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// =======================
// LOGIN ADMIN
// =======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" })
    }

    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
