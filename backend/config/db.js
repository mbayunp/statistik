const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Koneksi Database Gagal:', err.message);
    } else {
        console.log('✅ Terhubung ke MySQL Database');
        connection.release();
    }
});

module.exports = db.promise();