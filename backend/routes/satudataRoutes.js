const express = require('express');
const router = express.Router();
const https = require('https');

// Helper function untuk mengambil data dari Satu Data API (Server-to-Server)
function fetchFromSatuData(path) {
    return new Promise((resolve, reject) => {
        const url = `https://satudata-api.garutkab.go.id/api${path}`;
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://satudata.garutkab.go.id/'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// 1. Endpoint Count (Jumlah Dataset, Data, Visualisasi, Infografis)
router.get('/count', async (req, res) => {
    try {
        const result = await fetchFromSatuData('/count');
        res.status(result.status || 200).json(result.data);
    } catch (error) {
        console.error('Error satudata proxy count:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Endpoint Pengaturan (Jumlah Penduduk, KK, Gender)
router.get('/pengaturan', async (req, res) => {
    try {
        const result = await fetchFromSatuData('/pengaturan');
        res.status(result.status || 200).json(result.data);
    } catch (error) {
        console.error('Error satudata proxy pengaturan:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Endpoint Popular Datasets
router.get('/popular-datasets', async (req, res) => {
    try {
        const result = await fetchFromSatuData('/popular-datasets');
        res.status(result.status || 200).json(result.data);
    } catch (error) {
        console.error('Error satudata proxy popular-datasets:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Endpoint Request Data Total
router.get('/request-data/total', async (req, res) => {
    try {
        const result = await fetchFromSatuData('/request-data/total');
        res.status(result.status || 200).json(result.data);
    } catch (error) {
        console.error('Error satudata proxy request-data:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
