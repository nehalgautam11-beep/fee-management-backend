const mongoose = require("mongoose")

const installmentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  receiptUrl: {
    type: String
  },
  receiptNo: {
    type: String
  },
  paymentMode: {
    type: String,
    default: "Cash"
  },
  mode: {
    type: String,
    enum: ["Cash", "Online"],
    default: "Cash"
  }
}, { _id: true })

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Student name is required"],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"]
  },
  class: {
  type: String,
  required: [true, "Class is required"],
  enum: [
    "Playgroup",
    "Nursery",
    "KG-1",
    "KG-2",
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th"
  ]
}
,
  totalFee: {
    type: Number,
    required: [true, "Total fee is required"],
    min: [0, "Total fee cannot be negative"]
  },
  paidFee: {
    type: Number,
    default: 0,
    min: 0
  },
  dueFee: {
    type: Number,
    default: function() {
      return this.totalFee - this.paidFee
    }
  },
  installments: [installmentSchema],
  isActive: {
    type: Boolean,
    default: true
  },
admissionDate: {
  type: Date,
  default: Date.now
},
annualFeeLocked: {
  type: Boolean,
  default: false
},
studentCode: {
  type: String,
  unique: true,
  sparse: true
}

},


{
  timestamps: true // Adds createdAt and updatedAt
})

// Virtual for fee status
studentSchema.virtual("feeStatus").get(function() {
  if (this.dueFee === 0) return "Paid"
  if (this.paidFee === 0) return "Unpaid"
  return "Partial"
})

// Indexes for performance
studentSchema.index({ class: 1 })
studentSchema.index({ name: 1, phone: 1, class: 1 }, { unique: true })
studentSchema.index({ dueFee: -1 })
studentSchema.index({ studentCode: 1 }, { unique: true, sparse: true })

// Auto-generate an immutable studentCode on first save (PostgreSQL sync key)
studentSchema.pre("save", function () {

  if (this.importedFromERP && !this.studentCode) {
    throw new Error("ERP student must have a studentCode.");
  }

});

// Pre-save hook to calculate dueFee


// Method to add installment
studentSchema.methods.addInstallment = function(amount, receiptUrl, mode = "Cash") {
  this.installments.push({
    amount,
    date: new Date(),
    confirmed: true,
    receiptUrl,
    mode
  })
  this.paidFee += amount
  this.dueFee = this.totalFee - this.paidFee
  return this.save()
}
module.exports = mongoose.model("Student", studentSchema)