/**
 * API Endpoint de TEST: GET /api/test-get-quote
 * Version de diagnostic pour identifier les problèmes
 */

const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Devis';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const diagnostics = {
            timestamp: new Date().toISOString(),
            spreadsheetId: SPREADSHEET_ID ? 'Configured ✅' : 'Missing ❌',
            googleCredentials: {
                clientEmail: process.env.GOOGLE_CLIENT_EMAIL ? 'Configured ✅' : 'Missing ❌',
                privateKey: process.env.GOOGLE_PRIVATE_KEY ? 'Configured ✅' : 'Missing ❌'
            }
        };

        // Tenter l'authentification
        console.log('🔑 Testing authentication...');

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        diagnostics.authentication = 'Success ✅';

        // Tenter de lire le sheet
        console.log('📊 Testing sheet access...');

        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1:C5`
        });

        const rows = response.data.values || [];

        diagnostics.sheetAccess = 'Success ✅';
        diagnostics.rowsFound = rows.length;
        diagnostics.sampleData = {
            headers: rows[0] || [],
            firstRow: rows[1] ? [rows[1][0], rows[1][1], rows[1][2]] : []
        };

        return res.status(200).json({
            success: true,
            message: 'All diagnostics passed! ✅',
            diagnostics
        });

    } catch (error) {
        console.error('❌ Diagnostic error:', error);

        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
            diagnostics: {
                spreadsheetId: SPREADSHEET_ID ? 'Configured' : 'Missing',
                hasGoogleCredentials: !!(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)
            }
        });
    }
};
