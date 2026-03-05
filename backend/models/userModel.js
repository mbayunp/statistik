const db = require('../config/db');

const User = {
    // Mencari user berdasarkan username
    findByUsername: async (username) => {
        const query = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await db.execute(query, [username]);
        return rows[0]; // Mengembalikan baris pertama jika ada
    },

    // Membuat admin baru (Register)
    create: async (username, hashedPassword) => {
        const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, "admin")';
        const [result] = await db.execute(query, [username, hashedPassword]);
        return result;
    }
};

module.exports = User;