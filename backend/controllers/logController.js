const db = require('../config/db');

/**
 * Controller for retrieving activity logs.
 */
exports.getActivityLogs = async (req, res) => {
    try {
        const { module, period } = req.query;
        
        let query = `
            SELECT al.id, al.user_id, al.module, al.action, al.description, al.created_at, u.username
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
        `;
        const conditions = [];
        const values = [];

        if (module) {
            conditions.push('al.module = ?');
            values.push(module);
        }

        if (period === 'weekly') {
            conditions.push('al.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
        } else if (period === 'monthly') {
            conditions.push('al.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY al.created_at DESC, al.id DESC';

        const [rows] = await db.execute(query, values);
        
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ Error in getActivityLogs:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil log aktivitas.' 
        });
    }
};
