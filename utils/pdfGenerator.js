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
      const doc = new PDFDocument({ margin: 50 })
      const buffers = []

      doc.on("data", chunk => buffers.push(chunk))
      doc.on("error", err => reject(err))

      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers)
          //const expireTime = Math.floor(Date.now() / 1000) + 86400

const uploadStream = cloudinary.uploader.upload_stream(
  {
    resource_type: "raw",
    public_id: `school-receipts/receipt_${Date.now()}`,
    overwrite: true
  },
  (error, result) => {
    if (error) return reject(error)
    const pdfUrl = result.secure_url.replace(
      "/upload/",
      "/upload/fl_attachment:false/"
    )

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
 * Generate PDF content - FIXED VERSION
 */
function generatePDFContent(doc, student, amount) {
  const logoPath = path.join(__dirname, "../assets/logo.jpg")
  const receiptNo = `GIS-${Date.now()}`
  const currentDate = new Date().toLocaleDateString("en-GB")

  // WATERMARK LOGO (centered, behind content)

try {
  doc.image(watermarkPath, 150, 300, { width: 300 })
} catch (err) {
  console.warn("Watermark not found")
}

  // LOGO CENTERED at top
  try {
    doc.image(logoPath, 250, 40, { width: 100 })
  } catch (err) {
    console.warn("Logo not found")
  }

  // School Name (centered)
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#1e3c72")
    .text("GLOBAL INNOVATIVE SCHOOL", 0, 160, { align: "center" })

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#666666")
    .text("INNOVATE TO LEAD", 0, 185, { align: "center" })

  // Border
  doc.rect(40, 220, 520, 540).lineWidth(2).strokeColor("#1e3c72").stroke()

  // Title
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#1e3c72")
    .text("OFFICIAL FEE RECEIPT", 0, 240, { align: "center" })

  doc.moveTo(60, 265).lineTo(540, 265).strokeColor("#cccccc").stroke()

  // Details
  doc.font("Helvetica").fontSize(11).fillColor("#000000")

  let y = 290
  doc.font("Helvetica-Bold").text("Receipt No:", 70, y)
  doc.font("Helvetica").text(receiptNo, 170, y)
  y += 22

  doc.font("Helvetica-Bold").text("Date:", 70, y)
  doc.font("Helvetica").text(currentDate, 170, y)
  y += 22

  doc.font("Helvetica-Bold").text("Student:", 70, y)
  doc.font("Helvetica").text(student.name, 170, y)
  y += 22

  doc.font("Helvetica-Bold").text("Class:", 70, y)
  doc.font("Helvetica").text(student.class, 170, y)
  y += 22

  doc.font("Helvetica-Bold").text("Phone:", 70, y)
  doc.font("Helvetica").text(student.phone, 170, y)

  // Table
  const tableTop = 430
  doc.rect(60, tableTop, 480, 35).fillAndStroke("#1e3c72", "#1e3c72")

  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(12)
  doc.text("Description", 80, tableTop + 11)
  doc.text("Amount (₹)", 450, tableTop + 11)

  const rowTop = tableTop + 35
  doc.rect(60, rowTop, 480, 40).strokeColor("#cccccc").stroke()

  doc.fillColor("#000000").font("Helvetica").fontSize(11)
  doc.text("School Fee Payment", 80, rowTop + 13)
  doc.text(String(amount.toFixed(2)), 450, rowTop + 13)

  // FIXED SUMMARY BOX - Proper alignment
  const summaryTop = 530
  doc.rect(350, summaryTop, 190, 130).fillAndStroke("#f8f9fa", "#cccccc")

  doc.fillColor("#000000").font("Helvetica").fontSize(11)

  // Total Fee
  doc.text("Total Fee:", 365, summaryTop + 20)
  doc.text("Rs " + String(student.totalFee.toFixed(2)), 480, summaryTop + 20, { width: 50, align: "right" })

  // Amount Paid
  doc.text("Amount Paid:", 365, summaryTop + 45)
  doc.text("Rs " + String(amount.toFixed(2)), 480, summaryTop + 45, { width: 50, align: "right" })

  // Total Paid
  doc.text("Total Paid:", 365, summaryTop + 70)
  doc.text("Rs " + String((student.paidFee + amount).toFixed(2)), 480, summaryTop + 70, { width: 50, align: "right" })

  // Balance Due
  doc.font("Helvetica-Bold")
  doc.text("Balance Due:", 365, summaryTop + 95)
  doc.text("Rs " + String((student.dueFee - amount).toFixed(2)), 480, summaryTop + 95, { width: 50, align: "right" })

  // Footer
  doc.font("Helvetica").fontSize(9).fillColor("#666666")
  doc.text("This is a system-generated receipt. No physical signature required.", 0, 720, { align: "center" })
}
/**
 * Generate extra fee receipt
 */
exports.generateExtraFeeReceipt = (student, feeTitle, amount) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const buffers = []

      doc.on("data", chunk => buffers.push(chunk))
      doc.on("error", err => reject(err))

      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers)
          //const expireTime = Math.floor(Date.now() / 1000) + 86400

const uploadStream = cloudinary.uploader.upload_stream(
  {
    resource_type: "raw",
    public_id: `school-receipts/extra_receipt_${Date.now()}`,
    overwrite: true
  },
  (error, result) => {
    if (error) return reject(error)
    const pdfUrl = result.secure_url.replace(
      "/upload/",
      "/upload/fl_attachment:false/"
    )

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
 * Generate extra fee PDF content - FIXED
 */
function generateExtraFeePDFContent(doc, student, feeTitle, amount) {
  const logoPath = path.join(__dirname, "../assets/logo.jpg")
  const receiptNo = `GIS-EXTRA-${Date.now()}`
  const currentDate = new Date().toLocaleDateString("en-GB")

  // WATERMARK LOGO (centered, behind content)
try {
  doc.image(watermarkPath, 150, 300, { width: 300 })
} catch (err) {
  console.warn("Watermark not found")
}


  // LOGO CENTERED at top
  try {
    doc.image(logoPath, 250, 40, { width: 100 })
  } catch (err) {
    console.warn("Logo not found")
  }

  // School Name (centered)
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#1e3c72")
    .text("GLOBAL INNOVATIVE SCHOOL", 0, 160, { align: "center" })

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#666666")
    .text("INNOVATE TO LEAD", 0, 185, { align: "center" })

  // Border
  doc.rect(40, 220, 520, 540).lineWidth(2).strokeColor("#1e3c72").stroke()

  // Title
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#1e3c72")
    .text("EXTRA FEE RECEIPT", 0, 240, { align: "center" })

  doc.moveTo(60, 265).lineTo(540, 265).strokeColor("#cccccc").stroke()

  // Details
  doc.font("Helvetica").fontSize(11).fillColor("#000000")

  let y = 290
  doc.font("Helvetica-Bold").text("Receipt No:", 70, y)
  doc.font("Helvetica").text(receiptNo, 170, y)
  y += 22

  doc.font("Helvetica-Bold").text("Date:", 70, y)
  doc.font("Helvetica").text(currentDate, 170, y)
  y += 22

  doc.font("Helvetica-Bold").text("Student:", 70, y)
  doc.font("Helvetica").text(student.name, 170, y)
  y += 22

  doc.font("Helvetica-Bold").text("Class:", 70, y)
  doc.font("Helvetica").text(student.class, 170, y)
  y += 22

  doc.font("Helvetica-Bold").text("Fee Type:", 70, y)
  doc.font("Helvetica").text(feeTitle, 170, y)

  // Table
  const tableTop = 430
  doc.rect(60, tableTop, 480, 35).fillAndStroke("#1e3c72", "#1e3c72")

  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(12)
  doc.text("Description", 80, tableTop + 11)
  doc.text("Amount (₹)", 450, tableTop + 11)

  const rowTop = tableTop + 35
  doc.rect(60, rowTop, 480, 40).strokeColor("#cccccc").stroke()

  doc.fillColor("#000000").font("Helvetica").fontSize(11)
  doc.text(feeTitle, 80, rowTop + 13)
  doc.text(String(amount.toFixed(2)), 450, rowTop + 13)

  // Amount Box (centered display)
  const amountBoxTop = 530
  doc.rect(200, amountBoxTop, 200, 80).fillAndStroke("#f8f9fa", "#cccccc")

  doc.fillColor("#000000").font("Helvetica-Bold").fontSize(14)
  doc.text("Total Amount Paid", 0, amountBoxTop + 20, { align: "center" })
  
  doc.fontSize(24).fillColor("#1e3c72")
  doc.text("Rs " + String(amount.toFixed(2)), 0, amountBoxTop + 45, { align: "center" })

  // Footer
  doc.font("Helvetica").fontSize(9).fillColor("#666666")
  doc.text("This is a system-generated receipt. No physical signature required.", 0, 720, { align: "center" })
  
}