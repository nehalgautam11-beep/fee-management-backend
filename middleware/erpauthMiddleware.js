// Verifies that a request genuinely came from the ERP backend (server-to-server),
// not from a logged-in Fee Management admin. Uses a shared secret instead of the
// admin JWT flow in authMiddleware.js, since the ERP has no admin login session.
module.exports = function verifyErpSecret(req, res, next) {
  const provided = req.headers["x-erp-secret"];

  if (!process.env.ERP_SYNC_SECRET) {
    console.error("❌ [erpAuth] ERP_SYNC_SECRET is not configured on the server");
    return res.status(500).json({ message: "ERP integration is not configured" });
  }

  if (!provided || provided !== process.env.ERP_SYNC_SECRET) {
    return res.status(401).json({ message: "Invalid or missing ERP credentials" });
  }

  next();
};