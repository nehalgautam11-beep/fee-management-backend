const mongoose = require("mongoose")

const installmentSchema = new mongoose.Schema({
  amount: Number,
  date: Date
})

const studentSchema = new mongoose.Schema({
  name: String,
  phone: String,
  class: String,
  totalFee: Number,
  paidFee: { type: Number, default: 0 },
  dueFee: Number,
  installments: [installmentSchema]
})

module.exports = mongoose.model("Student", studentSchema)
