const db = require('../config/db');

/**
 * Log user activity to the database.
 * @param {number|string} userId - The ID of the user performing the action (Foreign Key to users.id).
 * @param {string} module - The module name where the action occurred (e.g. 'REKAPAN_INTERNAL').
 * @param {string} action - The action type (e.g. 'CREATE', 'UPDATE', 'DELETE').
 * @param {string} description - The description of the activity.
 * @returns {Promise<void>}
 */
const logActivity = async (userId, module, action, description) => {
    try {
        const query = `
            INSERT INTO activity_logs (user_id, module, action, description) 
            VALUES (?, ?, ?, ?)
        `;
        // Use userId or null if not authenticated/anonymous action
        const values = [userId || null, module, action, description];
        await db.execute(query, values);
    } catch (error) {
        console.error('❌ Failed to write activity log:', error.message);
    }
};

module.exports = { logActivity };
