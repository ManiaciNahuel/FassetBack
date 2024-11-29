const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // O process.env.DATABASE_PUBLIC_URL
    ssl: {
        rejectUnauthorized: false, // Habilita SSL si Railway lo requiere
    },
});

module.exports = pool;