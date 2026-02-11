const express = require("express")
const ExtraFee = require("../models/ExtraFee")
const Student = require("../models/Student")
const Admin = require("../models/Admin")
const AdminLog = require("../models/AdminLog")
const verifyToken = require("../middleware/authMiddleware")
const {generateExtraFeeReceipt}  = require("../utils/pdfGenerator")
const {createWhatsAppLink} = require("../utils/whatsapp")
const router = express.Router()

/* =======================
   CREATE EXTRA FEE
======================= */
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { title, amount } = req.body

    if (!title || !amount) {
      return res.status(400).json({ message: "Title and amount required" })
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" })
    }

    // Get all active students
    const students = await Student.find({ isActive: true })

    if (students.length === 0) {
      return res.status(400).json({ message: "No students found" })
    }

    // Create payments array for all students
    const payments = students.map(student => ({
      studentId: student._id,
      studentName: student.name,
      studentClass: student.class,
      paid: false
    }))

    const admin = await Admin.findById(req.user.id)
    
    const extraFee = new ExtraFee({
      title,
      amount,
      createdBy: req.user.id,
      createdByName: admin?.name || "Admin",
      payments
    })

    await extraFee.save()

    // Log action
    await AdminLog.create({
      adminId: req.user.id,
      adminName: admin?.name || "Admin",
      action: "Added student",
      details: { title, amount, studentCount: students.length },
      ipAddress: req.ip
    })

    res.status(201).json({
      message: "Extra fee created successfully",
      extraFee
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   GET ALL EXTRA FEES
======================= */
router.get("/", verifyToken, async (req, res) => {
  try {
    const extraFees = await ExtraFee.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean()

    res.json(extraFees)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   GET SINGLE EXTRA FEE
======================= */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const extraFee = await ExtraFee.findById(req.params.id).lean()
    
    if (!extraFee) {
      return res.status(404).json({ message: "Extra fee not found" })
    }

    res.json(extraFee)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})


router.get("/dashboard/stats", verifyToken, async (req, res) => {
  const fees = await ExtraFee.find({ isActive: true })

  let collected = 0
  let pending = 0

  fees.forEach(fee => {
    collected += fee.payments.filter(p => p.paid).length * fee.amount
    pending += fee.payments.filter(p => !p.paid).length * fee.amount
  })

  res.json({
    totalExtraFees: fees.length,
    collected,
    pending
  })
})


router.get("/reminder-link/:extraFeeId/:studentId", verifyToken, async (req, res) => {
  try {
    const { extraFeeId, studentId } = req.params

    const extraFee = await ExtraFee.findById(extraFeeId)
    const student = await Student.findById(studentId)

    if (!extraFee || !student) {
      return res.status(404).json({ message: "Data not found" })
    }

    const msg = `GLOBAL INNOVATIVE SCHOOL

Extra Fee Reminder

Student: ${student.name}
Class: ${student.class}
Fee Type: ${extraFee.title}
Amount: ₹${extraFee.amount}

Please complete the payment at the earliest.

Thank you
GIS Fee Department`

    const whatsappLink = createWhatsAppLink(student.phone, msg)

    res.json({ whatsappLink })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/chatbot-summary", verifyToken, async (req, res) => {
  try {
    const extraFees = await ExtraFee.find()

    let collected = 0
    let pending = 0

    extraFees.forEach(fee => {
      fee.payments.forEach(p => {
        if (p.paid) collected += fee.amount
        else pending += fee.amount
      })
    })

    res.json({
      extraCollected: collected,
      extraPending: pending
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})



/* =======================
   MARK AS PAID
======================= */
router.post("/:id/pay/:studentId", verifyToken, async (req, res) => {
  try {
    const extraFee = await ExtraFee.findById(req.params.id)
    
    if (!extraFee) {
      return res.status(404).json({ message: "Extra fee not found" })
    }

    const payment = extraFee.payments.find(
      p => p.studentId.toString() === req.params.studentId
    )

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" })
    }

    if (payment.paid) {
      return res.status(400).json({ message: "Already paid" })
    }

    const student = await Student.findById(req.params.studentId)
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Generate receipt
    const receiptUrl = await generateExtraFeeReceipt(
      student,
      extraFee.title,
      extraFee.amount
    )

    // Update payment
    payment.paid = true
    payment.paidDate = new Date()
    payment.receiptUrl = receiptUrl

    await extraFee.save()

    // Log action
    const admin = await Admin.findById(req.user.id)
    await AdminLog.create({
      adminId: req.user.id,
      adminName: admin?.name || "Admin",
      action: "Fee payment",
      studentName: student.name,
      details: { extraFeeTitle: extraFee.title, amount: extraFee.amount },
      ipAddress: req.ip
    })

    // WhatsApp message
    const msg = `🎓 GLOBAL INNOVATIVE SCHOOL

✅ Extra Fee Payment Successful!

Student: ${student.name}
Class: ${student.class}
Fee Type: ${extraFee.title}
Amount Paid: ₹${extraFee.amount}
Date: ${new Date().toLocaleDateString()}

📄 Download Receipt (Valid for 24 hours):
${receiptUrl}

Thank you!
- GIS Fee Department`

    const whatsappLink = createWhatsAppLink(student.phone, msg)

    res.json({
      success: true,
      message: "Payment successful",
      receiptUrl,
      whatsappLink
    })
  } catch (err) {
    console.error("Extra fee payment error:", err)
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   DELETE EXTRA FEE
======================= */


router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const extraFee = await ExtraFee.findById(req.params.id)
    
    if (!extraFee) {
      return res.status(404).json({ message: "Extra fee not found" })
    }

    const admin = await Admin.findById(req.user.id)
    
    extraFee.isActive = false
    await extraFee.save()

await AdminLog.create({
  adminId: req.user.id,
  adminName: admin?.name || "Admin",
  action: "Deleted student", // ✅ MUST MATCH ENUM
  details: { extraFeeTitle: extraFee.title },
  ipAddress: req.ip
})


    res.json({ message: "Extra fee deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// REMOVE STUDENT FROM EXTRA FEE
router.delete("/:feeId/student/:studentId", verifyToken, async (req, res) => {
  try {
    const { feeId, studentId } = req.params

    const extraFee = await ExtraFee.findById(feeId)
    if (!extraFee) return res.status(404).json({ message: "Extra fee not found" })

    extraFee.payments = extraFee.payments.filter(
      p => p.studentId.toString() !== studentId
    )

    await extraFee.save()
    res.json({ message: "Student removed from extra fee" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})



module.exports = router