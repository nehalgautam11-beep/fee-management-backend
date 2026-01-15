require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const studentRoutes = require("./routes/studentRoutes")

const app = express()

/* =======================
   MIDDLEWARE
======================= */
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

/* =======================
   ROUTES
======================= */
app.use("/students", studentRoutes)

app.get("/", (req, res) => {
  res.send("SERVER OK")
})

/* =======================
   MONGODB CONNECTION
======================= */
mongoose.connect(
  "mongodb+srv://feeadmin:fee12345@feeadmin.q6sku7b.mongodb.net/?retryWrites=true&w=majority"
)
.then(() => {
  console.log("MongoDB Connected")
})
.catch(err => {
  console.log("MongoDB Error:", err.message)
})

/* =======================
   SERVER
======================= */
const PORT = 3001
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})
