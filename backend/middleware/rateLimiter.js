const rateLimit = require('express-rate-limit');

/**
 * Auth Limiter: Pembatas jumlah percobaan request untuk pencegahan serangan Brute-Force.
 * Aturan: Maksimal 5 kali percobaan per 15 menit per IP.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 50, // Naikkan batas percobaan menjadi 50
    skipSuccessfulRequests: true, // Login yang sukses tidak akan mengurangi kuota
    message: {
        success: false,
        message: "Terlalu banyak percobaan gagal! Akses diblokir sementara selama 15 menit."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Public Form Submit Limiter: Membatasi pengiriman respon formulir publik per IP.
 */
const publicFormLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 100, // Maksimal 100 submit per IP per menit (Mendukung NAT / Wi-Fi bersama)
    message: {
        success: false,
        message: "Terlalu banyak permintaan pengiriman formulir, silakan coba beberapa saat lagi."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Upload Limiter: Membatasi unggahan file pada formulir publik agar tidak membanjiri disk/CPU.
 */
const uploadLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 150, // Maksimal 150 upload per IP per menit (Mendukung NAT / Wi-Fi bersama)
    message: {
        success: false,
        message: "Batas unggah berkas tercapai. Mohon tunggu sekitar 1 menit."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Public Form View Limiter: Mencegah spam refresh halaman formulir.
 */
const formViewLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 300, // Maksimal 300 kali muat halaman per IP per menit (Mendukung NAT / Wi-Fi bersama)
    message: {
        success: false,
        message: "Terlalu banyak permintaan akses halaman, silakan coba beberapa saat lagi."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, publicFormLimiter, uploadLimiter, formViewLimiter };

