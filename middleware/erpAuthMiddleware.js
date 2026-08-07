module.exports = function verifyErpSecret(req, res, next) {
  const provided = req.headers["x-erp-secret"];

  console.log("Provided:", JSON.stringify(provided));
  console.log("Expected:", JSON.stringify(process.env.ERP_SYNC_SECRET));
  console.log("Equal:", provided === process.env.ERP_SYNC_SECRET);

  if (!process.env.ERP_SYNC_SECRET) {
    return res.status(500).json({ message: "ERP integration is not configured" });
  }

  if (!provided || provided !== process.env.ERP_SYNC_SECRET) {
    return res.status(401).json({ message: "Invalid or missing ERP credentials" });
  }

  next();
};