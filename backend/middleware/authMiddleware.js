const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware to verify JWT Token and attach the user payload to req.user.
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Akses ditolak: Token autentikasi tidak ditemukan! Silakan login kembali.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains id, username, role
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Akses ditolak (Error 403): Token autentikasi telah kadaluarsa atau tidak valid! Silakan login kembali.' 
        });
    }
};

module.exports = authMiddleware;
