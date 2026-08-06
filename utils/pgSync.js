const pool = require("./pgPool")

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

    const result = await pool.query(
      `INSERT INTO fee_summary (
        student_code,
        student_name,
        class_name,
        active,
        total_fee,
        paid_amount,
        pending_amount,
        payment_history,
        fee_structure_assigned,
        updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,NOW())
      ON CONFLICT (student_code) DO UPDATE SET
        student_name           = EXCLUDED.student_name,
        class_name              = EXCLUDED.class_name,
        active                  = EXCLUDED.active,
        total_fee               = EXCLUDED.total_fee,
        paid_amount             = EXCLUDED.paid_amount,
        pending_amount          = EXCLUDED.pending_amount,
        payment_history         = EXCLUDED.payment_history,
        fee_structure_assigned  = EXCLUDED.fee_structure_assigned,
        updated_at              = NOW()`,
      [
        student.studentCode,
        student.name,
        student.class,
        student.isActive,
        student.totalFee,
        student.paidFee,
        student.dueFee,
        JSON.stringify(paymentHistory),
        student.feeStructureStatus === "Assigned"
      ]
    )
    console.log(`✅ [pgSync] Student synced: ${student.studentCode}`)
    console.log("Rows affected:", result.rowCount)
  } catch (err) {
    console.error(`❌ [pgSync] syncStudentCreate failed (${student.studentCode}):`, err.message)
  }
}

/* -------------------------------------------------------
   syncStudentUpdate
   Called after student name / class is edited.
   Only touches studentName, className, updatedAt.
   Uses UPSERT so it never silently no-ops if the row hasn't
   been created yet.
------------------------------------------------------- */
async function syncStudentUpdate(student) {
  try {
    const result = await pool.query(
      `INSERT INTO fee_summary (
  student_code,
  student_name,
  class_name,
  active,
  total_fee,
  paid_amount,
  pending_amount,
  payment_history,
  fee_structure_assigned,
  updated_at
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,NOW())
      ON CONFLICT (student_code) DO UPDATE SET
        student_name           = EXCLUDED.student_name,
        class_name              = EXCLUDED.class_name,
        fee_structure_assigned  = EXCLUDED.fee_structure_assigned,
        active                  = EXCLUDED.active,
        updated_at              = NOW()`,
      [
        [
  student.studentCode,
  student.name,
  student.class,
  student.isActive,
  student.totalFee,
  student.paidFee,
  student.dueFee,
  JSON.stringify(buildPaymentHistory(student)),
  student.feeStructureStatus === "Assigned"
]
      ]
    )
    console.log(`✅ [pgSync] Student info updated: ${student.studentCode}`)
    console.log("Rows affected:", result.rowCount)
  } catch (err) {
    console.error(`❌ [pgSync] syncStudentUpdate failed (${student.studentCode}):`, err.message)
  }
}

/* -------------------------------------------------------
   syncPayment
   Called after a successful fee payment is saved to MongoDB.
   Updates paidAmount, pendingAmount, paymentHistory, updatedAt.
   Uses UPSERT so it never silently no-ops if the row hasn't
   been created yet.
------------------------------------------------------- */
async function syncPayment(student) {
  try {
    const paymentHistory = buildPaymentHistory(student)

    const result = await pool.query(
      `INSERT INTO fee_summary (
  student_code,
  student_name,
  class_name,
  active,
  total_fee,
  paid_amount,
  pending_amount,
  payment_history,
  fee_structure_assigned,
  updated_at
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,NOW())
      ON CONFLICT (student_code) DO UPDATE SET
        paid_amount      = EXCLUDED.paid_amount,
        pending_amount   = EXCLUDED.pending_amount,
        payment_history  = EXCLUDED.payment_history,
        updated_at       = NOW()`,
      [
        [
  student.studentCode,
  student.name,
  student.class,
  student.isActive,
  student.totalFee,
  student.paidFee,
  student.dueFee,
  JSON.stringify(paymentHistory),
  student.feeStructureStatus === "Assigned"
]
      ]
    )
    console.log(`✅ [pgSync] Payment synced: ${student.studentCode}`)
    console.log("Rows affected:", result.rowCount)
  } catch (err) {
    console.error(`❌ [pgSync] syncPayment failed (${student.studentCode}):`, err.message)
  }
}

/* -------------------------------------------------------
   syncFeeUpdate
   Called when totalFee, paidFee, or dueFee changes
   (e.g. fee edit, academic-year start fee reset).
   Updates all fee columns.
   Uses UPSERT so it never silently no-ops if the row hasn't
   been created yet.
------------------------------------------------------- */
async function syncFeeUpdate(student) {
  try {
    const paymentHistory = buildPaymentHistory(student)

    const result = await pool.query(
      `INSERT INTO fee_summary (
  student_code,
  student_name,
  class_name,
  active,
  total_fee,
  paid_amount,
  pending_amount,
  payment_history,
  fee_structure_assigned,
  updated_at
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,NOW())
      ON CONFLICT (student_code) DO UPDATE SET
        total_fee               = EXCLUDED.total_fee,
        paid_amount              = EXCLUDED.paid_amount,
        pending_amount           = EXCLUDED.pending_amount,
        payment_history          = EXCLUDED.payment_history,
        fee_structure_assigned   = EXCLUDED.fee_structure_assigned,
        updated_at               = NOW()`,
      [
        [
  student.studentCode,
  student.name,
  student.class,
  student.isActive,
  student.totalFee,
  student.paidFee,
  student.dueFee,
  JSON.stringify(paymentHistory),
  student.feeStructureStatus === "Assigned"
]
      ]
    )
    console.log(`✅ [pgSync] Fee updated: ${student.studentCode}`)
    console.log("Rows affected:", result.rowCount)
  } catch (err) {
    console.error(`❌ [pgSync] syncFeeUpdate failed (${student.studentCode}):`, err.message)
  }
}

module.exports = { syncStudentCreate, syncStudentUpdate, syncPayment, syncFeeUpdate }