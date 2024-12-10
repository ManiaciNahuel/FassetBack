const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST || 'localhost',        // Host de la base de datos
    port: process.env.PGPORT || 5432,              // Puerto
    user: process.env.PGUSER || 'postgres',        // Usuario
    password: process.env.PGPASSWORD || 'password', // Contraseña
    database: process.env.PGDATABASE || 'database', // Base de datos
    ssl: {
        rejectUnauthorized: false,   // Importante para Railway
    },
});

module.exports = pool;
