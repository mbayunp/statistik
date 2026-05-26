const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Cek apakah username sudah ada
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username sudah digunakan!' });
        }

        // Enkripsi password (hashing)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan ke database
        await User.create(username, hashedPassword);

        res.status(201).json({ success: true, message: 'Admin berhasil didaftarkan!' });
    } catch (error) {
        console.error('Error register:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Cari user di database
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Username tidak ditemukan!' });
        }

        // Cek kecocokan password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Password salah!' });
        }

        // Buat JWT Token (Berlaku 1 hari)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login berhasil!',
            token: token
        });
    } catch (error) {
        console.error('Error login:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
};

exports.verifyPin = (req, res) => {
    const { pin } = req.body;
    // Tambahkan .trim() untuk menghindari error spasi tersembunyi
    const SECRET_PIN = process.env.REGISTER_PIN ? process.env.REGISTER_PIN.trim() : null;

    if (pin === SECRET_PIN) {
        return res.status(200).json({ success: true, message: 'PIN Valid, akses dibuka.' });
    } else {
        return res.status(403).json({ success: false, message: 'PIN Keamanan salah!' });
    }
};

exports.resetPasswordViaPin = async (req, res) => {
    try {
        const { username, newPassword, pin } = req.body;
        // Tambahkan .trim() juga di sini
        const SECRET_PIN = process.env.REGISTER_PIN ? process.env.REGISTER_PIN.trim() : null;

        // 1. Validasi PIN (Keamanan Ganda di Backend)
        if (pin !== SECRET_PIN) {
            return res.status(403).json({ success: false, message: 'Aksi ditolak: PIN Keamanan salah!' });
        }

        // 2. Cari user di database
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Username tidak ditemukan!' });
        }

        // 3. Enkripsi password baru
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update ke database
        await User.updatePassword(username, hashedNewPassword);

        res.status(200).json({ success: true, message: 'Password berhasil direset!' });
    } catch (error) {
        console.error('Error reset password:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
};