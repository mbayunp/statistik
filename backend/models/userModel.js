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
    }, 

    // Mengupdate password user (Untuk fitur Ganti/Reset Password)
    updatePassword: async (username, hashedPassword) => {
        const query = 'UPDATE users SET password = ? WHERE username = ?';
        const [result] = await db.execute(query, [hashedPassword, username]);
        return result;
    },

    // Mengambil seluruh user
    getAllUsers: async () => {
        const query = 'SELECT id, username, role FROM users ORDER BY username ASC';
        const [rows] = await db.execute(query);
        return rows;
    }
};

module.exports = User;