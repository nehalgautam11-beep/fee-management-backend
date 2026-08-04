const { Pool } = require("pg")

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on("error", (err) => {
  console.error("❌ [pgPool] Unexpected PostgreSQL error:", err.message)
})

module.exports = pool
