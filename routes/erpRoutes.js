const express = require("express")
const Student = require("../models/Student")
const verifyErpSecret = require("../middleware/erpAuthMiddleware")
const { syncStudentCreate, syncStudentUpdate } = require("../utils/pgSync")

const router = express.Router()

/* -------------------------------------------------------
   HELPER — find a student by whichever identifier the ERP has:
   erpStudentId (preferred, assigned by the ERP itself) or
   studentCode (assigned by Fee Management and returned on import).
------------------------------------------------------- */
async function findByErpIdentifier(identifier) {
  return Student.findOne({
    $or: [{ erpStudentId: identifier }, { studentCode: identifier }]
  })
}

/* =======================
   STUDENT ADMISSION (ERP -> Fee Management)
   Called by the ERP when a new student is admitted.
   Creates the student with feeStructureStatus = "Pending" and
   NO fee amounts — Finance fills those in later via "Assign Fee".
   This is the only way imported students get created; there is
   no manual-creation step for them in Fee Management.
======================= */



console.log({
  verifyErpSecret: typeof verifyErpSecret,
  syncStudentCreate: typeof syncStudentCreate,
  syncStudentUpdate: typeof syncStudentUpdate,
});



router.post("/students/import", verifyErpSecret, async (req, res) => {
  try {
    const { name, phone, class: cls, erpStudentId } = req.body

    if (!name || !phone || !cls) {
      return res.status(400).json({ message: "name, phone, and class are required" })
    }




    if (erpStudentId) {
      const existing = await Student.findOne({ erpStudentId })
      if (existing) {
        return res.status(200).json({
          message: "Student already imported",
          studentCode: existing.studentCode,
          student: existing
        })
      }
    }

    console.log("verifyErpSecret =", typeof verifyErpSecret);

    const student = await Student.create({
      name,
      phone,
      class: cls,
      totalFee: 0,
      paidFee: 0,
      dueFee: 0,
      isActive: true,
      importedFromERP: true,
      erpStudentId: erpStudentId || undefined,
      feeStructureStatus: "Pending",
      installments: []
    })

    // Sync PostgreSQL fee_summary right away (totalFee 0, status "Pending")
    // so the ERP can show the "🟠 Pending" fee status immediately.
    syncStudentCreate(student)

    res.status(201).json({
      message: "Student imported successfully — fee structure pending",
      studentCode: student.studentCode,
      student
    })
  } catch (err) {
    console.error("ERP IMPORT ERROR:", err)
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   PROFILE UPDATE (ERP -> Fee Management)
   Called when the ERP updates a student's profile.
   Only name/phone/class are touched — fee data is never modified.
======================= */
router.put("/students/:identifier", verifyErpSecret, async (req, res) => {
  try {
    const student = await findByErpIdentifier(req.params.identifier)
    if (!student) return res.status(404).json({ message: "Student not found" })

    const { name, phone, class: cls } = req.body

    if (name !== undefined) student.name = name
    if (phone !== undefined) student.phone = phone
    if (cls !== undefined) student.class = cls

    await student.save()

    // Sync PostgreSQL fee_summary (studentCode is the integration key).
    // Fee fields are untouched, so only name/class propagate.
    syncStudentUpdate(student)

    res.json({ message: "Student profile updated", student })
  } catch (err) {
    console.error("ERP PROFILE UPDATE ERROR:", err)
    res.status(500).json({ message: err.message })
  }
})

/* =======================
   STUDENT LEAVES SCHOOL (ERP -> Fee Management)
   Marks the student inactive. Fee history (installments, receipts,
   totals) is preserved exactly as-is — nothing is deleted or reset.
======================= */
router.put("/students/:identifier/inactive", verifyErpSecret, async (req, res) => {
  try {
    const student = await findByErpIdentifier(req.params.identifier)
    if (!student) return res.status(404).json({ message: "Student not found" })

    student.isActive = false
    await student.save()

    // Sync PostgreSQL fee_summary (studentCode is the integration key).
    // The last known fee snapshot stays in fee_summary — history preserved.
    syncStudentUpdate(student)

    res.json({ message: "Student marked inactive, fee history preserved", student })
  } catch (err) {
    console.error("ERP MARK INACTIVE ERROR:", err)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router