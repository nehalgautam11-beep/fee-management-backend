const express = require("express")
const Student = require("../models/Student")
const verifyToken = require("../middleware/authMiddleware")


const router = express.Router()

/* =====================
   SUMMARY REPORT
===================== */
router.get("/summary", verifyToken, async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })

    const totalStudents = students.length
    const totalCollected = students.reduce((s, x) => s + x.paidFee, 0)
    const totalDue = students.reduce((s, x) => s + x.dueFee, 0)

    res.json({
      totalStudents,
      totalCollected,
      totalDue
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* =====================
   CLASS WISE REPORT
===================== */
router.get("/class-wise", verifyToken, async (req, res) => {
  try {
    const data = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$class",
          collected: { $sum: "$paidFee" },
          due: { $sum: "$dueFee" }
        }
      },
      {
        $project: {
          _id: 0,
          class: "$_id",
          collected: 1,
          due: 1
        }
      }
    ])

    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* =====================
   TOP DEFAULTERS
===================== */
router.get("/defaulters", verifyToken, async (req, res) => {
  try {
    const data = await Student.find({ isActive: true })
      .sort({ dueFee: -1 })
      .limit(5)
      .select("name class dueFee")

    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router