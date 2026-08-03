const rateLimit = require('express-rate-limit');

/**
 * Auth Limiter: Pembatas jumlah percobaan request untuk pencegahan serangan Brute-Force.
 * Aturan: Maksimal 5 kali percobaan per 15 menit per IP.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5, // maksimal 5 kali percobaan
    message: {
        success: false,
        message: "Terlalu banyak percobaan gagal! Akses diblokir sementara selama 15 menit."
    },
    standardHeaders: true, // Kembalikan informasi rate limit pada header `RateLimit-*`
    legacyHeaders: false, // Nonaktifkan header `X-RateLimit-*`
});

module.exports = { authLimiter };
