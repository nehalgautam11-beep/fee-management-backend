const pool = require("./pgPool")

/* -------------------------------------------------------
   ensurePgTables
   Makes sure the two ERP-integration tables exist in the
   shared Neon PostgreSQL database. Uses CREATE TABLE IF NOT
   EXISTS only, so it NEVER touches or overwrites tables that
   already exist (e.g. ones created by the ERP side).

   This does not run any business logic and does not touch
   MongoDB. It is purely a safety net so a fresh Neon database
   still works out of the box.
------------------------------------------------------- */
async function ensurePgTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fee_summary (
        student_code            TEXT PRIMARY KEY,
        student_name            TEXT,
        class_name              TEXT,
        active                  BOOLEAN DEFAULT true,
        total_fee               NUMERIC DEFAULT 0,
        paid_amount             NUMERIC DEFAULT 0,
        pending_amount          NUMERIC DEFAULT 0,
        payment_history         JSONB DEFAULT '[]'::jsonb,
        fee_structure_assigned  BOOLEAN DEFAULT false,
        notification_blocked    BOOLEAN DEFAULT false,
        updated_at              TIMESTAMP DEFAULT NOW()
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS fee_settings (
        id              INTEGER PRIMARY KEY DEFAULT 1,
        qr_code_url     TEXT,
        upi_id          TEXT,
        fee_portal_url  TEXT,
        updated_at      TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fee_settings_single_row CHECK (id = 1)
      );
    `)

    console.log("✅ [pgInit] PostgreSQL tables verified (fee_summary, fee_settings)")
  } catch (err) {
    // Never block server startup or MongoDB operations because of this.
    console.error("❌ [pgInit] Could not verify/create PostgreSQL tables:", err.message)
  }
}

module.exports = { ensurePgTables }