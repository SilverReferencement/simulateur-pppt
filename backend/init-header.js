// Script pour initialiser le header dans Google Sheets
require('dotenv').config();
const { google } = require('googleapis');

async function initHeader() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
        const SHEET_NAME = 'Devis';

        // Créer le header
        const headers = [
            'Quote ID',
            'Date',
            'Email',
            'Code Postal',
            'Département',
            'Lots',
            'Immeubles',
            'DPE Inclus',
            'Prix',
            'IDF',
            'Fichier URL',
            'Fichier Nom',
            'Timestamp'
        ];

        console.log('Création du header en ligne 1...');

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1:M1`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [headers],
            },
        });

        console.log('✅ Header créé en A1:M1');

        // Geler la première ligne
        const sheetMetadata = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const sheet = sheetMetadata.data.sheets.find(
            s => s.properties.title === SHEET_NAME
        );

        if (sheet) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: [{
                        updateSheetProperties: {
                            properties: {
                                sheetId: sheet.properties.sheetId,
                                gridProperties: {
                                    frozenRowCount: 1
                                }
                            },
                            fields: 'gridProperties.frozenRowCount'
                        }
                    }]
                }
            });
            console.log('✅ Première ligne gelée');
        }

        console.log('\n✅ Initialisation complète !');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

initHeader();
