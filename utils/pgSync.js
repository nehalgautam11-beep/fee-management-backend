const pool = require("./pgInit")

/* -------------------------------------------------------
   HELPER — build paymentHistory array from installments
------------------------------------------------------- */
function buildPaymentHistory(student) {
  return (student.installments || []).map((inst) => ({
    receiptNo: inst.receiptNo || `GIS-${new Date(inst.date).getTime()}`,
    date: inst.date,
    amount: inst.amount,
    paymentMode: inst.paymentMode || "Cash",
    receiptUrl: inst.receiptUrl || "",
  }))
}

/* -------------------------------------------------------
   syncStudentCreate
   Called after a student is successfully created in MongoDB.
   Uses UPSERT so it is safe to call for existing students too
   (e.g. during academic-year reset).
   Never overwrites notificationBlocked.
------------------------------------------------------- */
async function syncStudentCreate(student) {
  try {
    const paymentHistory = buildPaymentHistory(student)

    await pool.query(
      `INSERT INTO fee_summary (
        "studentCode", "studentName", "className",
        "totalFee", "paidAmount", "pendingAmount",
        "paymentHistory", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
      ON CONFLICT ("studentCode") DO UPDATE SET
        "studentName"    = EXCLUDED."studentName",
        "className"      = EXCLUDED."className",
        "totalFee"       = EXCLUDED."totalFee",
        "paidAmount"     = EXCLUDED."paidAmount",
        "pendingAmount"  = EXCLUDED."pendingAmount",
        "paymentHistory" = EXCLUDED."paymentHistory",
        "updatedAt"      = NOW()`,
      [
        student.studentCode,
        student.name,
        student.class,
        student.totalFee,
        student.paidFee,
        student.dueFee,
        JSON.stringify(paymentHistory),
      ]
    )
    console.log(`✅ [pgSync] Student synced: ${student.studentCode}`)
  } catch (err) {
    console.error(`❌ [pgSync] syncStudentCreate failed (${student.studentCode}):`, err.message)
  }
}

/* -------------------------------------------------------
   syncStudentUpdate
   Called after student name / class is edited.
   Only touches studentName, className, updatedAt.
------------------------------------------------------- */
async function syncStudentUpdate(student) {
  try {
    await pool.query(
      `UPDATE fee_summary SET
        "studentName" = $2,
        "className"   = $3,
        "updatedAt"   = NOW()
       WHERE "studentCode" = $1`,
      [student.studentCode, student.name, student.class]
    )
    console.log(`✅ [pgSync] Student info updated: ${student.studentCode}`)
  } catch (err) {
    console.error(`❌ [pgSync] syncStudentUpdate failed (${student.studentCode}):`, err.message)
  }
}

/* -------------------------------------------------------
   syncPayment
   Called after a successful fee payment is saved to MongoDB.
   Updates paidAmount, pendingAmount, paymentHistory, updatedAt.
------------------------------------------------------- */
async function syncPayment(student) {
  try {
    const paymentHistory = buildPaymentHistory(student)

    await pool.query(
      `UPDATE fee_summary SET
        "paidAmount"     = $2,
        "pendingAmount"  = $3,
        "paymentHistory" = $4::jsonb,
        "updatedAt"      = NOW()
       WHERE "studentCode" = $1`,
      [
        student.studentCode,
        student.paidFee,
        student.dueFee,
        JSON.stringify(paymentHistory),
      ]
    )
    console.log(`✅ [pgSync] Payment synced: ${student.studentCode}`)
  } catch (err) {
    console.error(`❌ [pgSync] syncPayment failed (${student.studentCode}):`, err.message)
  }
}

/* -------------------------------------------------------
   syncFeeUpdate
   Called when totalFee, paidFee, or dueFee changes
   (e.g. fee edit, academic-year start fee reset).
   Updates all fee columns.
------------------------------------------------------- */
async function syncFeeUpdate(student) {
  try {
    const paymentHistory = buildPaymentHistory(student)

    await pool.query(
      `UPDATE fee_summary SET
        "totalFee"       = $2,
        "paidAmount"     = $3,
        "pendingAmount"  = $4,
        "paymentHistory" = $5::jsonb,
        "updatedAt"      = NOW()
       WHERE "studentCode" = $1`,
      [
        student.studentCode,
        student.totalFee,
        student.paidFee,
        student.dueFee,
        JSON.stringify(paymentHistory),
      ]
    )
    console.log(`✅ [pgSync] Fee updated: ${student.studentCode}`)
  } catch (err) {
    console.error(`❌ [pgSync] syncFeeUpdate failed (${student.studentCode}):`, err.message)
  }
}

module.exports = { syncStudentCreate, syncStudentUpdate, syncPayment, syncFeeUpdate }
