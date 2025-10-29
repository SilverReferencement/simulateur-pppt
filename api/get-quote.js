/**
 * API Endpoint: GET /api/get-quote?id=DEVIS-XXX
 * Récupère les données d'un devis depuis Google Sheets
 */

const { google } = require('googleapis');

// Configuration Google Sheets
const SPREADSHEET_ID = '1CcWz0gqy8b91f3HdQc7BU9fwShsN0z9IbQcIdMC2o5Q';
const SHEET_NAME = 'Devis';

/**
 * Handler principal
 */
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Quote ID is required'
            });
        }

        console.log('🔍 Fetching quote:', id);

        // Récupérer le devis
        const quoteData = await getQuoteFromSheet(id);

        if (!quoteData) {
            return res.status(404).json({
                success: false,
                error: 'Quote not found'
            });
        }

        console.log('✅ Quote found:', id);

        return res.status(200).json({
            success: true,
            quote: quoteData
        });

    } catch (error) {
        console.error('❌ Error fetching quote:', error);

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
};

/**
 * Récupérer un devis depuis Google Sheets
 */
async function getQuoteFromSheet(quoteId) {
    try {
        // Authentification Google
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Récupérer toutes les données
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:Z`
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return null;
        }

        // Trouver la ligne avec le quoteId
        const headerRow = rows[0];
        const dataRows = rows.slice(1);

        const quoteRow = dataRows.find(row => row[0] === quoteId);

        if (!quoteRow) {
            return null;
        }

        // Parser les membres du conseil syndical
        let councilMembers = [];
        const councilMembersText = quoteRow[20] || '';

        if (councilMembersText) {
            // Format: "Membre 1: Prénom Nom | email | phone\nMembre 2: ..."
            councilMembers = councilMembersText.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const parts = line.split('|').map(p => p.trim());
                    if (parts.length >= 3) {
                        // Extraire prénom et nom de "Membre X: Prénom Nom"
                        const namePart = parts[0].split(':')[1]?.trim() || '';
                        const names = namePart.split(' ');
                        const firstname = names[0] || '-';
                        const lastname = names.slice(1).join(' ') || '-';

                        return {
                            firstname: firstname === '-' ? '' : firstname,
                            lastname: lastname === '-' ? '' : lastname,
                            email: parts[1] === '-' ? '' : parts[1],
                            phone: parts[2] === '-' ? '' : parts[2]
                        };
                    }
                    return null;
                })
                .filter(m => m !== null);
        }

        // Construire l'objet devis
        const quoteData = {
            quoteId: quoteRow[0] || '',
            date: quoteRow[1] || '',
            userFirstname: quoteRow[2] || '',
            userLastname: quoteRow[3] || '',
            email: quoteRow[4] || '',
            userPhone: quoteRow[5] || '',
            propertyAddress: quoteRow[6] || '',
            postalCode: quoteRow[7] || '',
            department: quoteRow[8] || '',
            isIDF: quoteRow[9] === 'Oui',
            lots: parseInt(quoteRow[10]) || 1,
            buildings: parseInt(quoteRow[11]) || 1,
            includeDPE: quoteRow[12] === 'Oui',
            dpeDate: quoteRow[13] || '',
            price: quoteRow[14] || '',
            isPresident: quoteRow[15] === 'Oui',
            presidentFirstname: quoteRow[16] || '',
            presidentLastname: quoteRow[17] || '',
            presidentEmail: quoteRow[18] || '',
            presidentPhone: quoteRow[19] || '',
            councilMembers: councilMembers,
            agDate: quoteRow[21] || '',
            comment: quoteRow[22] || ''
        };

        return quoteData;

    } catch (error) {
        console.error('Error fetching from Sheet:', error);
        throw error;
    }
}
