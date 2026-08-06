const mongoose = require("mongoose");
const csv = require("csv-parser");
const fs = require("fs");
const Student = require("../models/Student");

const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

console.log("✅ Environment Loaded");



console.log("Migration Started...");



async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "school_erp_db",
  });

  console.log("✅ MongoDB Connected");
}

async function migrate() {

  await connectDB();

  const rows = [];

  fs.createReadStream("./data/Updated_Mongo_Database_With_ERP_Names_v2.csv")
    .pipe(csv())
    .on("data", (row) => rows.push(row))
    .on("end", async () => {

      let updated = 0;
      let skipped = 0;

      for (const row of rows) {

        const student = await Student.findOne({
          name: new RegExp(`^${row["Name"].trim()}$`, "i"),
          class: row["Class"].trim()
        });

        if (!student) {

          console.log(`❌ Not Found : ${row["Name"]}`);
          skipped++;
          continue;
        }

        const studentCode = row["studentCode"]?.trim();

        // Invalid code in CSV
        if (!studentCode || studentCode.toUpperCase() === "NOT FOUND") {
          console.log(`⚠️ Skipping ${student.name} - Invalid studentCode`);
          const skippedStudents = [];
          skipped++;
          continue;
        }

        // Already migrated
        if (student.studentCode) {
          console.log(`⏭️ Already migrated: ${student.name}`);
          continue;
        }

        student.studentCode = studentCode;
        student.importedFromERP = true;

        try {

  await student.save();

  console.log(`✅ ${student.name} -> ${student.studentCode}`);

  updated++;

} catch (err) {

  if (err.code === 11000) {
    console.log(`⚠️ Duplicate record. Skipping ${student.name}`);
    skipped++;
    continue;
  }

  console.log(`❌ Failed : ${student.name}`);
  console.log(err.message);

  skipped++;
}
      }

      console.log("\n=========================");
      console.log(`Updated : ${updated}`);
      console.log(`Skipped : ${skipped}`);
      console.log("=========================");

      await mongoose.disconnect();
    });
}

migrate();