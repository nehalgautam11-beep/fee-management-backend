const mongoose = require("mongoose");
const path = require("path");

const Student = require("../models/Student");
const pool = require("../utils/pgPool");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

async function run() {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "school_erp_db",
  });

  console.log("✅ MongoDB Connected");

  const students = await Student.find({
    studentCode: { $exists: true, $ne: null }
  });

  console.log(`Found ${students.length} students`);

  let synced = 0;

  for (const student of students) {

    const paymentHistory = (student.installments || []).map(inst => ({
      receiptNo: inst.receiptNo || "",
      date: inst.date,
      amount: inst.amount,
      paymentMode: inst.paymentMode || inst.mode || "Cash",
      receiptUrl: inst.receiptUrl || ""
    }));

    await pool.query(
      `
      INSERT INTO fee_summary (
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
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,NOW()
      )
      ON CONFLICT (student_code)
      DO UPDATE SET
        student_name = EXCLUDED.student_name,
        class_name = EXCLUDED.class_name,
        active = EXCLUDED.active,
        total_fee = EXCLUDED.total_fee,
        paid_amount = EXCLUDED.paid_amount,
        pending_amount = EXCLUDED.pending_amount,
        payment_history = EXCLUDED.payment_history,
        fee_structure_assigned = EXCLUDED.fee_structure_assigned,
        updated_at = NOW()
      `,
      [
        student.studentCode,
        student.name,
        student.class,
        student.isActive,
        student.totalFee,
        student.paidFee,
        student.dueFee,
        JSON.stringify(paymentHistory),
        student.totalFee > 0
      ]
    );

    console.log(`✅ ${student.studentCode} synced`);
    synced++;
  }

  console.log("\n=======================");
  console.log(`Students Synced : ${synced}`);
  console.log("=======================\n");

  await mongoose.disconnect();
  await pool.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});