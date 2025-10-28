// Service Google Sheets
// Gestion de l'enregistrement des devis dans Google Sheets

const { google } = require('googleapis');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = 'Devis'; // Nom de l'onglet où enregistrer les devis

/**
 * Authentification avec Google Sheets API
 */
async function getAuthClient() {
    // Support pour Vercel : utiliser JSON depuis variable d'environnement
    // ou fichier local pour développement
    const authConfig = {
        scopes: SCOPES,
    };

    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        // Production (Vercel) : utiliser la variable d'environnement
        authConfig.credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Développement local : utiliser le fichier
        authConfig.keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    } else {
        throw new Error('Google credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS');
    }

    const auth = new google.auth.GoogleAuth(authConfig);
    return await auth.getClient();
}

/**
 * Obtenir l'instance Google Sheets
 */
async function getSheetsInstance() {
    const authClient = await getAuthClient();
    return google.sheets({ version: 'v4', auth: authClient });
}

/**
 * Générer un ID unique pour le devis
 */
async function generateUniqueId() {
    try {
        const sheets = await getSheetsInstance();

        // Récupérer tous les IDs existants
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:A`,  // A2 pour ignorer le header en ligne 1
        });

        const rows = response.data.values || [];

        // Extraire les numéros des IDs existants (format: DEVIS-001)
        const existingIds = rows
            .map(row => row[0])
            .filter(id => id && typeof id === 'string' && id.startsWith('DEVIS-'))
            .map(id => parseInt(id.replace('DEVIS-', ''), 10))
            .filter(num => !isNaN(num) && num > 0);

        console.log('IDs existants trouvés:', existingIds);

        // Trouver le prochain numéro
        const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

        // Formater avec des zéros (DEVIS-001, DEVIS-002, etc.)
        const newId = `DEVIS-${String(nextNumber).padStart(3, '0')}`;
        console.log(`Nouveau ID généré: ${newId}`);

        return newId;

    } catch (error) {
        console.error('Erreur génération ID:', error);
        // Fallback: utiliser UUID
        return `DEVIS-${uuidv4().substring(0, 8).toUpperCase()}`;
    }
}

/**
 * Sauvegarder un devis dans Google Sheets
 */
async function saveQuote(quoteData) {
    try {
        const sheets = await getSheetsInstance();

        // Préparer la ligne à ajouter
        const row = [
            quoteData.quoteId,                                          // A: ID
            new Date(quoteData.date).toLocaleString('fr-FR'),          // B: Date
            quoteData.email,                                             // C: Email
            quoteData.postalCode,                                        // D: Code Postal
            quoteData.department,                                        // E: Département
            quoteData.lots,                                              // F: Lots
            quoteData.buildings,                                         // G: Immeubles
            quoteData.includeDPE ? 'Oui' : 'Non',                       // H: DPE Inclus
            quoteData.price,                                             // I: Prix
            quoteData.isIDF ? 'Oui' : 'Non',                            // J: IDF
            quoteData.fileUrl || '',                                     // K: Lien fichier
            quoteData.fileName || '',                                    // L: Nom fichier
            quoteData.timestamp                                          // M: Timestamp
        ];

        // Ajouter la ligne au Sheet
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:M`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [row],
            },
        });

        console.log(`Devis ajouté à Google Sheets: ${quoteData.quoteId}`);

        return {
            success: true,
            quoteId: quoteData.quoteId,
            range: response.data.updates.updatedRange
        };

    } catch (error) {
        console.error('Erreur sauvegarde Google Sheets:', error);
        throw new Error(`Impossible de sauvegarder dans Google Sheets: ${error.message}`);
    }
}

/**
 * Récupérer tous les devis
 */
async function getAllQuotes() {
    try {
        const sheets = await getSheetsInstance();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:M`,
        });

        const rows = response.data.values || [];

        if (rows.length === 0) {
            return [];
        }

        // Convertir en objets
        const headers = rows[0];
        const quotes = rows.slice(1).map(row => {
            const quote = {};
            headers.forEach((header, index) => {
                quote[header] = row[index] || '';
            });
            return quote;
        });

        return quotes;

    } catch (error) {
        console.error('Erreur récupération devis:', error);
        throw new Error(`Impossible de récupérer les devis: ${error.message}`);
    }
}

/**
 * Récupérer un devis par ID
 */
async function getQuoteById(quoteId) {
    try {
        const allQuotes = await getAllQuotes();
        return allQuotes.find(quote => quote['ID'] === quoteId || quote['Quote ID'] === quoteId);
    } catch (error) {
        console.error('Erreur récupération devis par ID:', error);
        throw new Error(`Impossible de récupérer le devis: ${error.message}`);
    }
}

/**
 * Initialiser le Sheet avec les en-têtes si nécessaire
 */
async function initializeSheet() {
    try {
        const sheets = await getSheetsInstance();

        // Vérifier si le sheet existe et a des en-têtes
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1:M1`,
        });

        if (!response.data.values || response.data.values.length === 0) {
            // Ajouter les en-têtes
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

            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A1:M1`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [headers],
                },
            });

            console.log('En-têtes initialisés dans Google Sheets');
        }

        // Geler la première ligne (header)
        try {
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
                console.log('Première ligne gelée (frozen header)');
            }
        } catch (freezeError) {
            console.warn('Impossible de geler la première ligne:', freezeError.message);
        }

        return { success: true };

    } catch (error) {
        console.error('Erreur initialisation Sheet:', error);
        throw new Error(`Impossible d'initialiser le Sheet: ${error.message}`);
    }
}

module.exports = {
    generateUniqueId,
    saveQuote,
    getAllQuotes,
    getQuoteById,
    initializeSheet
};
