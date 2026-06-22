const PDFDocument = require("pdfkit")
const streamifier = require("streamifier")
const cloudinary = require("./cloudinary")
const path = require("path")

const watermarkPath = path.join(__dirname, "../assets/logo-watermark.jpg")

/**
 * Generate professional fee receipt and upload to Cloudinary
 * @param {Object} student - Student object
 * @param {Number} amount - Payment amount
 * @returns {Promise<String>} - Cloudinary secure URL
 */
exports.generateReceipt = (student, amount) => {
  return new Promise((resolve, reject) => {
    try {
      // Mobile-friendly size: 420x750 (similar to a long receipt tape)
      const doc = new PDFDocument({ size: [420, 750], margin: 20 })
      const buffers = []

      doc.on("data", chunk => buffers.push(chunk))
      doc.on("error", err => reject(err))

      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers)

          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              format: "pdf",
              public_id: `school-receipts/receipt_${Date.now()}`,
              overwrite: true
            },
            (error, result) => {
              if (error) return reject(error)
              const pdfUrl = result.secure_url
              resolve(pdfUrl)
            }
          )

          streamifier.createReadStream(pdfBuffer).pipe(uploadStream)
        } catch (uploadError) {
          reject(uploadError)
        }
      })

      generatePDFContent(doc, student, amount)
      doc.end()

    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Generate PDF content - Mobile Optimized Layout
 */
function generatePDFContent(doc, student, amount) {
  const logoPath = path.join(__dirname, "../assets/logo.jpg")
  const receiptNo = `GIS-${Date.now()}`
  const currentDate = new Date().toLocaleDateString("en-GB")

  // WATERMARK LOGO (centered, behind content)
  try {
    doc.image(watermarkPath, 90, 250, { width: 240 })
  } catch (err) {
    console.warn("Watermark not found")
  }

  // LOGO CENTERED at top
  try {
    doc.image(logoPath, 170, 30, { width: 80 })
  } catch (err) {
    console.warn("Logo not found")
  }

  // School Name (centered)
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#1e3c72")
    .text("GLOBAL INNOVATIVE SCHOOL", 0, 130, { align: "center", width: 420 })

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#666666")
    .text("INNOVATE TO LEAD", 0, 155, { align: "center", width: 420 })

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#000000")
    .text("AY - 2026-27", 0, 170, { align: "center", width: 420 })

  // Border (fits mobile width)
  doc.rect(20, 200, 380, 520).lineWidth(2).strokeColor("#1e3c72").stroke()

  // Title
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor("#1e3c72")
    .text("OFFICIAL FEE RECEIPT", 0, 220, { align: "center", width: 420 })

  doc.moveTo(30, 245).lineTo(390, 245).strokeColor("#cccccc").stroke()

  // Details
  doc.font("Helvetica").fontSize(11).fillColor("#000000")

  let y = 260
  doc.font("Helvetica-Bold").text("Receipt No:", 40, y)
  doc.font("Helvetica").text(receiptNo, 120, y)
  y += 22

  doc.font("Helvetica-Bold").text("Date:", 40, y)
  doc.font("Helvetica").text(currentDate, 120, y)
  y += 22

  doc.font("Helvetica-Bold").text("Student:", 40, y)
  doc.font("Helvetica").text(student.name, 120, y)
  y += 22

  doc.font("Helvetica-Bold").text("Class:", 40, y)
  doc.font("Helvetica").text(student.class, 120, y)
  y += 22

  doc.font("Helvetica-Bold").text("Phone:", 40, y)
  doc.font("Helvetica").text(student.phone, 120, y)

  // Table
  const tableTop = 390
  doc.rect(30, tableTop, 360, 30).fillAndStroke("#1e3c72", "#1e3c72")

  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11)
  doc.text("Description", 40, tableTop + 10)
  doc.text("Amount (₹)", 300, tableTop + 10)

  const rowTop = tableTop + 30
  doc.rect(30, rowTop, 360, 40).strokeColor("#cccccc").stroke()

  doc.fillColor("#000000").font("Helvetica").fontSize(11)
  doc.text("School Fee Payment", 40, rowTop + 13)
  doc.text(String(amount.toFixed(2)), 300, rowTop + 13)

  // SUMMARY BOX
  const summaryTop = 490
  doc.rect(190, summaryTop, 190, 120).fillAndStroke("#f8f9fa", "#cccccc")

  doc.fillColor("#000000").font("Helvetica").fontSize(10)

  // Total Fee
  doc.text("Total Fee:", 200, summaryTop + 20)
  doc.text("Rs " + String(student.totalFee.toFixed(2)), 300, summaryTop + 20, { width: 70, align: "right" })

  // Amount Paid
  doc.text("Amount Paid:", 200, summaryTop + 45)
  doc.text("Rs " + String(amount.toFixed(2)), 300, summaryTop + 45, { width: 70, align: "right" })

  // Total Paid
  doc.text("Total Paid:", 200, summaryTop + 70)
  doc.text("Rs " + String((student.paidFee + amount).toFixed(2)), 300, summaryTop + 70, { width: 70, align: "right" })

  // Balance Due
  doc.font("Helvetica-Bold")
  doc.text("Balance Due:", 200, summaryTop + 95)
  doc.text("Rs " + String((student.dueFee - amount).toFixed(2)), 300, summaryTop + 95, { width: 70, align: "right" })

  // Footer
  doc.font("Helvetica").fontSize(8).fillColor("#666666")
  doc.text("This is a system-generated receipt. No physical signature required.", 0, 690, { align: "center", width: 420 })
}

/**
 * Generate extra fee receipt
 */
exports.generateExtraFeeReceipt = (student, feeTitle, amount) => {
  return new Promise((resolve, reject) => {
    try {
      // Mobile-friendly size
      const doc = new PDFDocument({ size: [420, 750], margin: 20 })
      const buffers = []

      doc.on("data", chunk => buffers.push(chunk))
      doc.on("error", err => reject(err))

      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers)

          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              format: "pdf",
              public_id: `school-receipts/extra_receipt_${Date.now()}`,
              overwrite: true
            },
            (error, result) => {
              if (error) return reject(error)
              const pdfUrl = result.secure_url
              resolve(pdfUrl)
            }
          )

          streamifier.createReadStream(pdfBuffer).pipe(uploadStream)
        } catch (uploadError) {
          reject(uploadError)
        }
      })

      generateExtraFeePDFContent(doc, student, feeTitle, amount)
      doc.end()

    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Generate extra fee PDF content - Mobile Optimized
 */
function generateExtraFeePDFContent(doc, student, feeTitle, amount) {
  const logoPath = path.join(__dirname, "../assets/logo.jpg")
  const receiptNo = `GIS-EXTRA-${Date.now()}`
  const currentDate = new Date().toLocaleDateString("en-GB")

  // WATERMARK LOGO
  try {
    doc.image(watermarkPath, 90, 250, { width: 240 })
  } catch (err) {
    console.warn("Watermark not found")
  }

  // LOGO CENTERED
  try {
    doc.image(logoPath, 170, 30, { width: 80 })
  } catch (err) {
    console.warn("Logo not found")
  }

  // School Name
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#1e3c72")
    .text("GLOBAL INNOVATIVE SCHOOL", 0, 130, { align: "center", width: 420 })

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#666666")
    .text("INNOVATE TO LEAD", 0, 155, { align: "center", width: 420 })

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#000000")
    .text("AY - 2026-27", 0, 170, { align: "center", width: 420 })

  // Border
  doc.rect(20, 200, 380, 520).lineWidth(2).strokeColor("#1e3c72").stroke()

  // Title
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor("#1e3c72")
    .text("EXTRA FEE RECEIPT", 0, 220, { align: "center", width: 420 })

  doc.moveTo(30, 245).lineTo(390, 245).strokeColor("#cccccc").stroke()

  // Details
  doc.font("Helvetica").fontSize(11).fillColor("#000000")

  let y = 260
  doc.font("Helvetica-Bold").text("Receipt No:", 40, y)
  doc.font("Helvetica").text(receiptNo, 120, y)
  y += 22

  doc.font("Helvetica-Bold").text("Date:", 40, y)
  doc.font("Helvetica").text(currentDate, 120, y)
  y += 22

  doc.font("Helvetica-Bold").text("Student:", 40, y)
  doc.font("Helvetica").text(student.name, 120, y)
  y += 22

  doc.font("Helvetica-Bold").text("Class:", 40, y)
  doc.font("Helvetica").text(student.class, 120, y)
  y += 22

  doc.font("Helvetica-Bold").text("Fee Type:", 40, y)
  doc.font("Helvetica").text(feeTitle, 120, y)

  // Table
  const tableTop = 390
  doc.rect(30, tableTop, 360, 30).fillAndStroke("#1e3c72", "#1e3c72")

  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11)
  doc.text("Description", 40, tableTop + 10)
  doc.text("Amount (₹)", 300, tableTop + 10)

  const rowTop = tableTop + 30
  doc.rect(30, rowTop, 360, 40).strokeColor("#cccccc").stroke()

  doc.fillColor("#000000").font("Helvetica").fontSize(11)
  doc.text(feeTitle, 40, rowTop + 13)
  doc.text(String(amount.toFixed(2)), 300, rowTop + 13)

  // Amount Box
  const amountBoxTop = 490
  doc.rect(110, amountBoxTop, 200, 80).fillAndStroke("#f8f9fa", "#cccccc")

  doc.fillColor("#000000").font("Helvetica-Bold").fontSize(14)
  doc.text("Total Amount Paid", 0, amountBoxTop + 20, { align: "center", width: 420 })
  
  doc.fontSize(22).fillColor("#1e3c72")
  doc.text("Rs " + String(amount.toFixed(2)), 0, amountBoxTop + 45, { align: "center", width: 420 })

  // Footer
  doc.font("Helvetica").fontSize(8).fillColor("#666666")
  doc.text("This is a system-generated receipt. No physical signature required.", 0, 690, { align: "center", width: 420 })
}