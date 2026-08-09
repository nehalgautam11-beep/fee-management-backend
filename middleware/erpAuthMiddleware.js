module.exports = function verifyErpSecret(req, res, next) {
  const provided = req.headers["x-erp-secret"];
  const expected = process.env.ERP_SYNC_SECRET;

  console.log("Provided:", JSON.stringify(provided));
  console.log("Expected:", JSON.stringify(expected));
  console.log("Provided Length:", provided ? provided.length : 0);
  console.log("Expected Length:", expected ? expected.length : 0);
  console.log("Equal:", provided === expected);

  if (!expected) {
    return res.status(500).json({
      message: "ERP integration is not configured"
    });
  }

  if (!provided || provided !== expected) {
    return res.status(401).json({
      message: "Invalid or missing ERP credentials"
    });
  }

  next();
};