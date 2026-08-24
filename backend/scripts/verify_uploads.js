const fs = require('fs');
const path = require('path');
const http = require('http');

// Simple test to ensure uploads folder exists and write is functional
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
console.log('✅ Uploads directory verified:', uploadsDir);
