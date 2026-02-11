const mongoose = require("mongoose")

const extraFeePaymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  studentName: String,
  studentClass: String,
  paid: {
    type: Boolean,
    default: false
  },
  paidDate: Date,
  receiptUrl: String
})

const extraFeeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  createdByName: String,
  payments: [extraFeePaymentSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Virtual for total collected
extraFeeSchema.virtual("totalCollected").get(function() {
  return this.payments.filter(p => p.paid).length * this.amount
})

// Virtual for total pending
extraFeeSchema.virtual("totalPending").get(function() {
  return this.payments.filter(p => !p.paid).length * this.amount
})

module.exports = mongoose.model("ExtraFee", extraFeeSchema)