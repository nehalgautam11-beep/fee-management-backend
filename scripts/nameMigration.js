const csv = require("csv-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

const Student = require("../models/Student");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

async function run() {

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "school_erp_db",
  });

  console.log("✅ MongoDB Connected");

  const rows = [];

  fs.createReadStream("./data/Mismatched_and_Unmatched_Students.csv")
    .pipe(csv())
    .on("data", row => rows.push(row))
    .on("end", async () => {

      let updated = 0;
      let skipped = 0;

      for (const row of rows) {

        const feeName = row.fee_name?.trim();
        const erpName = row.erp_name?.trim();
        const className = row.Class?.trim();
        const studentCode = row.student_code?.trim();

        // Skip invalid ERP rows
        if (
          !erpName ||
          erpName.toUpperCase() === "NOT FOUND" ||
          !studentCode ||
          studentCode.toUpperCase() === "NOT FOUND"
        ) {
          console.log(`⚠️ Skipping ${feeName} - Invalid ERP data`);
          skipped++;
          continue;
        }

        const student = await Student.findOne({
          name: feeName,
          class: className
        });

        if (!student) {
          console.log(`❌ Not Found : ${feeName}`);
          skipped++;
          continue;
        }

        // Already updated
        if (student.name === erpName) {
          console.log(`⏭️ Already Updated : ${erpName}`);
          continue;
        }

        // Check duplicate before renaming
        const duplicate = await Student.findOne({
          name: erpName,
          phone: student.phone,
          class: student.class
        });

        if (
          duplicate &&
          duplicate._id.toString() !== student._id.toString()
        ) {
          console.log(`⚠️ Duplicate exists. Skipping ${feeName}`);
          skipped++;
          continue;
        }

        student.name = erpName;

        try {

          await student.save();

          console.log(`✅ ${feeName} -> ${erpName}`);

          updated++;

        } catch (err) {

          console.log(`❌ Failed : ${feeName}`);
          console.log(err.message);

          skipped++;

        }

      }

      console.log("\n=======================");
      console.log(`Updated : ${updated}`);
      console.log(`Skipped : ${skipped}`);
      console.log("=======================");

      await mongoose.disconnect();

      console.log("✅ MongoDB Disconnected");

    });

}

run();