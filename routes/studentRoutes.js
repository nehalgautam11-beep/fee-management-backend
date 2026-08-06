const express = require("express")
const Student = require("../models/Student")
const Admin = require("../models/Admin")
const AdminLog = require("../models/AdminLog")
const verifyToken = require("../middleware/authMiddleware")
const { createWhatsAppLink } = require("../utils/whatsapp")
const {generateReceipt}  = require("../utils/pdfGenerator")
const {
  syncStudentUpdate,
  syncPayment,
  syncFeeUpdate
} = require("../utils/pgSync")
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
      if (existing.isActive) {
        return res.status(409).json({ message: "Student already exists" });
      } else {
        // Reactivate the inactive student
        existing.isActive = true;
        
        // Update the fee to the new one provided during re-addition, 
        // but ensure we recalculate dueFee based on their previous paidFee (so we don't lose data)
        existing.totalFee = fee;
        existing.dueFee = fee - existing.paidFee;
        
        await existing.save();
        
        return res.status(201).json({
          message: "Student reactivated successfully",
          student: existing
        });
      }
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
    const mode = req.body.mode || "Cash"
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
      receiptUrl,
      mode
    })
    student.paidFee += payAmount
    student.dueFee = student.totalFee - student.paidFee
    await student.save()

    await syncPayment(student);

    // Log action
    const admin = await Admin.findById(req.user.id)
    await AdminLog.create({
      adminId: req.user.id,
      adminName: admin?.name || "Admin",
      action: "Fee payment",
      studentName: student.name,
      details: { amount: payAmount, mode },
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

    if (totalFee !== undefined) {
      await syncFeeUpdate(student);
    } else {
      await syncStudentUpdate(student);
    }

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

    // Hard delete
    await student.deleteOne()

    // Also remove this student from any associated Extra Fees
    const ExtraFee = require("../models/ExtraFee")
    await ExtraFee.updateMany(
      {},
      { $pull: { payments: { studentId: student._id } } }
    )

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
    "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"
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
      "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"
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
        await syncStudentUpdate(student);
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
        await syncFeeUpdate(student);
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
      "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"
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

/* =======================
   ASSIGN FEE STRUCTURE (for students imported from ERP)
   Finance fills Annual Fee for a student that was imported from
   ERP with feeStructureStatus = "Pending".
   Student identity fields (name/phone/class) are already imported
   and are NOT editable here.
======================= */
router.post("/:id/assign-fee", verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ message: "Student not found" })

    const { annualFee } = req.body

    if (annualFee === undefined || annualFee === null || Number(annualFee) < 0) {
      return res.status(400).json({ message: "Annual Fee is required and must be a positive number" })
    }

    const numAnnual = Number(annualFee) || 0

    const computedTotal = Math.max(0, numAnnual)

    student.totalFee = computedTotal
    student.dueFee = computedTotal - (student.paidFee || 0)
    student.feeStructureStatus = "Assigned"

    await student.save()

    // Sync PostgreSQL fee_summary (studentCode is the integration key).
    // This is also what flips the student out of the "Pending" list and
    // makes the ERP show the assigned fee immediately.
    await syncFeeUpdate(student)

    // Log action
    const admin = await Admin.findById(req.user.id)
    await AdminLog.create({
      adminId: req.user.id,
      adminName: admin?.name || "Admin",
      action: "Assigned fee structure",
      studentName: student.name,
      details: {
        annualFee: numAnnual,
        totalFee: computedTotal
      },
      ipAddress: req.ip
    })

    res.json({ message: "Fee structure assigned successfully", student })
  } catch (err) {
    console.error("ASSIGN FEE ERROR:", err)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router