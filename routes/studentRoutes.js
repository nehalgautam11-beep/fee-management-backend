const express = require("express")
const Student = require("../models/Student")

const router = express.Router()

// ✅ GET ALL STUDENTS
router.get("/", async (req, res) => {
  try {
    const students = await Student.find()
    res.json(students)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ✅ ADD STUDENT
router.post("/add", async (req, res) => {
  try {
    const { name, phone, class: cls, totalFee } = req.body

    if (!name || !phone || !cls || !totalFee) {
      return res.status(400).json({ message: "All fields required" })
    }

    const existing = await Student.findOne({ name, phone, class: cls })
    if (existing) {
      return res.status(409).json({ message: "Student already exists" })
    }

    const student = new Student({
      name,
      phone,
      class: cls,
      totalFee,
      paidFee: 0,
      dueFee: totalFee,
      installments: []
    })

    await student.save()
    res.json({ message: "Student added successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ✅ PAY INSTALLMENT
router.post("/pay/:id", async (req, res) => {
  try {
    const { amount } = req.body
    const student = await Student.findById(req.params.id)

    if (!student) return res.status(404).json({ message: "Student not found" })

    student.installments.push({
      amount,
      date: new Date()
    })

    student.paidFee += Number(amount)
    student.dueFee = student.totalFee - student.paidFee

    await student.save()
    res.json({ message: "Payment added" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ✅ DELETE STUDENT
router.delete("/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id)
    res.json({ message: "Student deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ✅ EDIT STUDENT
router.put("/edit/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.json(student)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ✅ AUTO PROMOTE
router.post("/auto-promote/:id", async (req, res) => {
  const order = ["Playgroup","Nursery","KG-1","KG-2","1st","2nd","3rd","4th","5th","6th","7th","8th"]

  try {
    const student = await Student.findById(req.params.id)
    const idx = order.indexOf(student.class)
    if (idx === -1 || idx === order.length - 1) {
      return res.json({ newClass: student.class })
    }

    student.class = order[idx + 1]
    await student.save()

    res.json({ newClass: student.class })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
