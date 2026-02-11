const mongoose = require("mongoose")

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
enum: [
  "Added student",
  "Fee payment",
  "Deleted student",
  "Edited student",
  "Promoted student",
  "Sent reminder",
  "Login",
  "Logout",
  "Deleted extra fee",
  "Started new academic year",
  "Removed student from extra fee"
]

  },
  studentName: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index for faster queries
adminLogSchema.index({ adminId: 1, timestamp: -1 })
adminLogSchema.index({ action: 1 })

module.exports = mongoose.model("AdminLog", adminLogSchema)