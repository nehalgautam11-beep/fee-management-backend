const express = require("express")
const Student = require("../models/Student")
const Admin = require("../models/Admin")
const AdminLog = require("../models/AdminLog")
const verifyToken = require("../middleware/authMiddleware")
const { createWhatsAppLink } = require("../utils/whatsapp")
const {generateReceipt}  = require("../utils/pdfGenerator")
const router = express.Router()

/* =======================
   GET ALL STUDENTS
======================= */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { class: classFilter, status } = req.query
    
    let query = { isActive: true }
    if (classFilter) query.class = classFilter
    if (status === "paid") query.dueFee = 0
    if (status === "pending") query.dueFee = { $gt: 0 }
    
    const students = await Student.find(query)
      .select("-__v")
      .sort({ class: 1, name: 1 })
      .lean()
    
    res.json(students)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   GET SINGLE STUDENT
======================= */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean()
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }
    res.json(student)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   ADD STUDENT
======================= */
/*router.post("/add", verifyToken, async (req, res) => {
  try {
    const { name, phone, class: cls, totalFee } = req.body;

    // Basic validation
    if (!name || !phone || !cls || totalFee === undefined) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const fee = Number(totalFee);
    if (isNaN(fee) || fee <= 0) {
      return res.status(400).json({ message: "Total fee must be positive" });
    }

    // Check duplicate
    const existing = await Student.findOne({ name, phone, class: cls });
    if (existing) {
      return res.status(409).json({ message: "Student already exists" });
    }

    const student = await Student.create({
      name,
      phone,
      class: cls,
      totalFee: fee,
      paidFee: 0,
      dueFee: fee,
      installments: []
    });

    return res.status(201).json({
      message: "Student added successfully",
      student
    });

  } catch (err) {
    console.error("❌ ADD STUDENT ERROR:", err);
    return res.status(500).json({
      message: "Failed to add student",
      error: err.message
    });
  }
});*/


router.post("/add", verifyToken, async (req, res) => {
  try {
    const { name, phone, class: cls, totalFee } = req.body;

    if (!name || !phone || !cls || totalFee === undefined) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const fee = Number(totalFee);
    if (isNaN(fee) || fee <= 0) {
      return res.status(400).json({ message: "Total fee must be positive" });
    }

    const existing = await Student.findOne({ name, phone, class: cls });
    if (existing) {
      return res.status(409).json({ message: "Student already exists" });
    }

    const student = await Student.create({
      name,
      phone,
      class: cls,
      totalFee: fee,
      paidFee: 0,
      dueFee: fee,
      installments: []
    });

    return res.status(201).json({
      message: "Student added successfully",
      student
    });
  } catch (err) {
    console.error("ADD STUDENT ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});


/* =======================
   PAY INSTALLMENT
======================= */
router.post("/:id/installment", verifyToken, async (req, res) => {
  try {
    const payAmount = Number(req.body.amount)
    const student = await Student.findById(req.params.id)

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Validation
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" })
    }

    if (student.paidFee + payAmount > student.totalFee) {
      return res.status(400).json({ 
        message: "Payment exceeds total fee",
        maxAllowed: student.dueFee
      })
    }

    // Generate PDF receipt and upload to Cloudinary
    let receiptUrl = ""
    try {
      receiptUrl = await generateReceipt(student, payAmount)
    } catch (err) {
      console.error("Receipt generation failed:", err)
      receiptUrl = ""
    }

    // Update student
    student.installments.push({
      amount: payAmount,
      date: new Date(),
      confirmed: true,
      receiptUrl
    })
    student.paidFee += payAmount
    student.dueFee = student.totalFee - student.paidFee
    await student.save()

    // Log action
    const admin = await Admin.findById(req.user.id)
    await AdminLog.create({
      adminId: req.user.id,
      adminName: admin?.name || "Admin",
      action: "Fee payment",
      studentName: student.name,
      details: { amount: payAmount },
      ipAddress: req.ip
    })

    // WhatsApp message
    const msg = `GLOBAL INNOVATIVE SCHOOL

Payment Successful!

Student: ${student.name}
Class: ${student.class}
Amount Paid: ₹${payAmount}
Date: ${new Date().toLocaleDateString("en-GB")}

Download Receipt (Valid for 24 hours):
${receiptUrl}

Payment Summary:
Total Fee: ₹${student.totalFee}
Total Paid: ₹${student.paidFee}
Remaining: ₹${student.dueFee}

Thank you!
- GIS Fee Department`

    const whatsappLink = createWhatsAppLink(student.phone, msg)

    res.json({
      success: true,
      message: "Payment successful",
      receiptUrl,
      whatsappLink,
      student: {
        name: student.name,
        class: student.class,
        paidFee: student.paidFee,
        dueFee: student.dueFee
      }
    })
  } catch (err) {
    console.error("Payment error:", err)
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   EDIT STUDENT
======================= */

router.put("/edit/:id", verifyToken, async (req, res) => {
  try {
    const { name, phone, class: cls, totalFee } = req.body

    if (!name || !phone || !cls) {
      return res.status(400).json({ message: "All fields required" })
    }

    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ message: "Student not found" })

    if (totalFee !== undefined) {
      if (student.annualFeeLocked) {
        return res.status(400).json({
          message: "Annual fee can be updated only once per academic year"
        })
      }

      student.totalFee = Number(totalFee)
      student.dueFee = student.totalFee - student.paidFee
      student.annualFeeLocked = true
    }

    student.name = name
    student.phone = phone
    student.class = cls

    await student.save()
    res.json(student)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
 
/* =======================
   DELETE STUDENT
======================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    const studentName = student.name

    // Soft delete
    student.isActive = false
    await student.save()

    // Log action
    const admin = await Admin.findById(req.user.id)
    await AdminLog.create({
      adminId: req.user.id,
      adminName: admin?.name || "Admin",
      action: "Deleted student",
      studentName,
      ipAddress: req.ip
    })

    res.json({ message: "Student deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   AUTO PROMOTE
======================= */
router.post("/auto-promote/:id", verifyToken, async (req, res) => {
  const classOrder = [
    "Playgroup", "Nursery", "KG-1", "KG-2",
    "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"
  ]

  try {
    const student = await Student.findById(req.params.id)
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    const currentIndex = classOrder.indexOf(student.class)
    
    if (currentIndex === -1) {
      return res.status(400).json({ message: "Invalid current class" })
    }

    if (currentIndex === classOrder.length - 1) {
      return res.status(400).json({ 
        message: "Student is already in final class" 
      })
    }

    const newClass = classOrder[currentIndex + 1]
    student.class = newClass
    await student.save()

    // Log action
    const admin = await Admin.findById(req.user.id)
    await AdminLog.create({
      adminId: req.user.id,
      adminName: admin?.name || "Admin",
      action: "Promoted student",
      studentName: student.name,
      details: { newClass },
      ipAddress: req.ip
    })

    res.json({ 
      message: "Student promoted successfully",
      newClass,
      student 
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   REMINDER LINK
======================= */
router.get("/reminder-link/:id", verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    if (student.dueFee === 0) {
      return res.status(400).json({ 
        message: "No pending fee for this student" 
      })
    }

    const msg = `GLOBAL INNOVATIVE SCHOOL

Dear Parent,

This is a gentle reminder regarding pending school fee.

Student: ${student.name}
Class: ${student.class}
Pending Amount: ₹${student.dueFee}
Total Fee: ₹${student.totalFee}
Paid: ₹${student.paidFee}

Please ensure payment is completed at the earliest to avoid any inconvenience.

Thank you for your cooperation.

Regards,
GIS Fee Department`

    const whatsappLink = createWhatsAppLink(student.phone, msg)

    // Log action
    const admin = await Admin.findById(req.user.id)
    await AdminLog.create({
      adminId: req.user.id,
      adminName: admin?.name || "Admin",
      action: "Sent reminder",
      studentName: student.name,
      ipAddress: req.ip
    })

    res.json({ whatsappLink })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   START NEW ACADEMIC YEAR
======================= */
router.post("/academic-year/start", verifyToken, async (req, res) => {
  try {
    const { classFees } = req.body // { "1st": 25000, "2nd": 28000, ... }

    if (!classFees || Object.keys(classFees).length === 0) {
      return res.status(400).json({ message: "Class fees required" })
    }


    const classOrder = [
      "Playgroup", "Nursery", "KG-1", "KG-2",
      "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"
    ]

    const ExtraFee = require("../models/ExtraFee")

    // 1. Delete all extra fees
    await ExtraFee.deleteMany({})

    // 2. Get all active students
    const students = await Student.find({ isActive: true })

    // 3. Auto-promote and update fees
for (const student of students) {
  if (student.class === "8th") {
    student.isActive = false
    await student.save()
    continue
  }

  const idx = classOrder.indexOf(student.class)
  if (idx !== -1 && idx < classOrder.length - 1) {
    const nextClass = classOrder[idx + 1]

    student.class = nextClass
    student.paidFee = 0
    student.totalFee = classFees[nextClass]
    student.dueFee = classFees[nextClass]
    student.annualFeeLocked = false
    student.installments = []

    await student.save()
  }
}


    // Log action
    const admin = await Admin.findById(req.user.id)
    await AdminLog.create({
      adminId: req.user.id,
      adminName: admin?.name || "Admin",
      action: "Started new academic year",
      details: { studentsPromoted: students.length },
      ipAddress: req.ip
    })

    res.json({
      success: true,
      message: "Academic year started successfully",
      studentsPromoted: students.length
    })
  } catch (err) {
    console.error("Academic year error:", err)
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   GET ACADEMIC YEAR STATS
======================= */
router.get("/academic-year/stats", verifyToken, async (req, res) => {
  try {
    const classOrder = [
      "Playgroup", "Nursery", "KG-1", "KG-2",
      "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"
    ]

    const students = await Student.find({ isActive: { $ne: false } })
    
    const classStats = {}
    classOrder.forEach(cls => {
      const classStudents = students.filter(s => s.class === cls)
      classStats[cls] = classStudents.length
    })

    res.json({
      totalStudents: students.length,
      classStats
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router