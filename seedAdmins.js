require("dotenv").config()
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const Admin = require("./models/Admin")

const admins = [
  {
    name: "Nehal",
    email: "gautam.nehal@gis.com",
    password: "Gi@24/7s.com",
    role: "admin"
  },
  {
    name: "Rupali",
    email: "gautam.rupali@gis.com",
    password: "Gi@24/7s.com",
    role: "admin"
  },
  {
    name: "Rahul",
    email: "gautam.rahulsingh@gis.com",
    password: "Gi@24/7s.com",
    role: "admin"
  },
  {
    name: "Jyoti",
    email: "patel.jyoti@gis.com",
    password: "Gi@24/7s.com",
    role: "admin"
  }
]

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "school_erp_db"
    })

    console.log("✅ MongoDB Connected")

    // Clear existing admins
    await Admin.deleteMany({})
    console.log("🗑️  Cleared existing admins")

    // Create new admins
    for (const admin of admins) {
      const hashedPassword = await bcrypt.hash(admin.password, 10)
      await Admin.create({
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        role: admin.role
      })
      console.log(`✅ Created admin: ${admin.name} (${admin.email})`)
    }

    console.log("\n🎉 All admins seeded successfully!\n")
    console.log("📋 Login Credentials:")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    admins.forEach(admin => {
      console.log(`👤 ${admin.name}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Password: ${admin.password}`)
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    })

    process.exit(0)
  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  }
}

seedAdmins()