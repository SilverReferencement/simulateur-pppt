// Service de génération de PDF à partir d'un template Google Docs
// Remplace les variables dynamiques et exporte en PDF

const { google } = require('googleapis');
const path = require('path');

// Configuration Google Docs API
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '..', 'credentials.json'),
    scopes: [
        'https://www.googleapis.com/auth/documents.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
    ]
});

const docs = google.docs({ version: 'v1', auth });
const drive = google.drive({ version: 'v3', auth });

/**
 * Créer un PDF à partir du template Google Docs
 * @param {Object} quoteData - Données du devis
 * @returns {Promise<Buffer>} - Buffer du PDF généré
 */
async function createPdfFromTemplate(quoteData) {
    try {
        const templateId = process.env.GOOGLE_DOCS_TEMPLATE_ID;

        if (!templateId) {
            throw new Error('GOOGLE_DOCS_TEMPLATE_ID non configuré dans .env');
        }

        // 1. Copier le template pour créer un document temporaire
        const authClient = await auth.getClient();
        const driveService = google.drive({ version: 'v3', auth: authClient });

        const copyResponse = await driveService.files.copy({
            fileId: templateId,
            requestBody: {
                name: `Devis_${quoteData.quoteId}_temp`,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
            }
        });

        const newDocId = copyResponse.data.id;

        // 2. Préparer les remplacements de variables
        const replacements = prepareReplacements(quoteData);

        // 3. Lire le document copié
        const docsService = google.docs({ version: 'v1', auth: authClient });
        const doc = await docsService.documents.get({
            documentId: newDocId
        });

        // 4. Créer les requêtes de remplacement
        const requests = createReplaceRequests(doc.data, replacements);

        // 5. Appliquer les remplacements
        if (requests.length > 0) {
            await docsService.documents.batchUpdate({
                documentId: newDocId,
                requestBody: {
                    requests: requests
                }
            });
        }

        // 6. Exporter le document en PDF
        const pdfResponse = await driveService.files.export({
            fileId: newDocId,
            mimeType: 'application/pdf'
        }, {
            responseType: 'arraybuffer'
        });

        // 7. Supprimer le document temporaire
        await driveService.files.delete({
            fileId: newDocId
        });

        console.log(`✅ PDF généré pour le devis ${quoteData.quoteId}`);
        return Buffer.from(pdfResponse.data);

    } catch (error) {
        console.error('❌ Erreur génération PDF:', error);
        throw error;
    }
}

/**
 * Préparer les remplacements de variables
 */
function prepareReplacements(quoteData) {
    const { quoteId, email, postalCode, department, lots, buildings, includeDPE, price, date, isIDF } = quoteData;

    return {
        '{{quoteId}}': quoteId,
        '{{clientEmail}}': email,
        '{{postalCode}}': postalCode,
        '{{department}}': department || 'N/A',
        '{{region}}': isIDF ? 'Île-de-France' : 'Hors Île-de-France',
        '{{lots}}': lots.toString(),
        '{{buildings}}': buildings.toString(),
        '{{includeDPE}}': includeDPE ? 'Oui' : 'Non',
        '{{price}}': `${price} €`,
        '{{date}}': new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }),
        '{{companyName}}': process.env.COMPANY_NAME || 'Atlas PPPT',
        '{{companyEmail}}': process.env.EMAIL_USER || 'contact@atlas-pppt.fr'
    };
}

/**
 * Créer les requêtes de remplacement pour Google Docs API
 */
function createReplaceRequests(document, replacements) {
    const requests = [];

    // Pour chaque variable à remplacer
    for (const [placeholder, value] of Object.entries(replacements)) {
        requests.push({
            replaceAllText: {
                containsText: {
                    text: placeholder,
                    matchCase: true
                },
                replaceText: value
            }
        });
    }

    return requests;
}

/**
 * Tester la configuration du générateur PDF
 */
async function testPdfGeneration() {
    try {
        // Données de test
        const testData = {
            quoteId: 'TEST-001',
            email: 'test@example.com',
            postalCode: '75001',
            department: '75',
            isIDF: true,
            lots: 10,
            buildings: 1,
            includeDPE: false,
            price: 990,
            date: new Date().toISOString()
        };

        console.log('🧪 Test de génération PDF...');
        const pdfBuffer = await createPdfFromTemplate(testData);
        console.log(`✅ PDF test généré: ${pdfBuffer.length} bytes`);
        return true;
    } catch (error) {
        console.error('❌ Erreur test PDF:', error);
        return false;
    }
}

module.exports = {
    createPdfFromTemplate,
    testPdfGeneration
};
