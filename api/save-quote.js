// Vercel Serverless Function - Sauvegarder un devis
const sgMail = require('@sendgrid/mail');
const { google } = require('googleapis');

// Configuration SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configuration Google
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
// Fix escaped newlines in private key
if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
}

const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/documents'
    ]
});

const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });
const docs = google.docs({ version: 'v1', auth });

// IDs Google
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Devis';
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const DOCS_TEMPLATE_ID = process.env.GOOGLE_DOCS_TEMPLATE_ID;

// ==================== HELPER FUNCTIONS ====================

/**
 * Générer un ID unique incrémental
 */
async function generateUniqueId() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:A`
        });

        const rows = response.data.values || [];
        const existingIds = rows
            .map(row => row[0])
            .filter(id => id && typeof id === 'string' && id.startsWith('DEVIS-'))
            .map(id => parseInt(id.replace('DEVIS-', ''), 10))
            .filter(num => !isNaN(num) && num > 0);

        const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
        return `DEVIS-${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
        console.error('Error generating ID:', error);
        return `DEVIS-${Date.now()}`;
    }
}

/**
 * Sauvegarder dans Google Sheets
 */
async function saveToSheet(quoteData) {
    const existingData = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:A`
    });

    const rows = existingData.data.values || [];
    const nextRow = rows.length + 1;

    const row = [
        quoteData.quoteId,
        new Date(quoteData.date).toLocaleString('fr-FR'),
        quoteData.email,
        quoteData.postalCode,
        quoteData.department,
        quoteData.lots,
        quoteData.buildings,
        quoteData.includeDPE ? 'Oui' : 'Non',
        quoteData.price,
        quoteData.isIDF ? 'Oui' : 'Non',
        quoteData.fileUrl || '',
        quoteData.fileName || '',
        quoteData.timestamp
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${nextRow}:M${nextRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [row]
        }
    });

    console.log('✅ Saved to Sheets at row', nextRow);
}

/**
 * Générer PDF depuis Google Docs template
 */
async function generatePdfFromTemplate(quoteData) {
    try {
        console.log('🔧 Generating PDF with template ID:', DOCS_TEMPLATE_ID);

        // Copier le template
        const copy = await drive.files.copy({
            fileId: DOCS_TEMPLATE_ID,
            requestBody: {
                name: `Devis_${quoteData.quoteId}_temp`,
                parents: [DRIVE_FOLDER_ID]
            }
        });

        console.log('✅ Template copied, doc ID:', copy.data.id);

        const docId = copy.data.id;

        // Remplacer les variables
        await docs.documents.batchUpdate({
            documentId: docId,
            requestBody: {
                requests: [
                    {
                        replaceAllText: {
                            containsText: { text: '{{quoteId}}', matchCase: true },
                            replaceText: quoteData.quoteId
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: { text: '{{clientEmail}}', matchCase: true },
                            replaceText: quoteData.email
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: { text: '{{postalCode}}', matchCase: true },
                            replaceText: quoteData.postalCode
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: { text: '{{lots}}', matchCase: true },
                            replaceText: quoteData.lots.toString()
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: { text: '{{buildings}}', matchCase: true },
                            replaceText: quoteData.buildings.toString()
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: { text: '{{includeDPE}}', matchCase: true },
                            replaceText: quoteData.includeDPE ? 'Oui' : 'Non'
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: { text: '{{price}}', matchCase: true },
                            replaceText: quoteData.price + ' €'
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: { text: '{{date}}', matchCase: true },
                            replaceText: new Date(quoteData.date).toLocaleDateString('fr-FR')
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: { text: '{{companyName}}', matchCase: true },
                            replaceText: process.env.COMPANY_NAME
                        }
                    }
                ]
            }
        });

        // Exporter en PDF
        const pdfResponse = await drive.files.export({
            fileId: docId,
            mimeType: 'application/pdf'
        }, { responseType: 'arraybuffer' });

        // Supprimer le document temporaire
        await drive.files.delete({ fileId: docId });

        console.log('✅ PDF generated successfully');
        return Buffer.from(pdfResponse.data);
    } catch (error) {
        console.error('❌ PDF generation error:', error.message);
        console.error('Stack:', error.stack);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        return null;
    }
}

/**
 * Envoyer email interne
 */
async function sendInternalEmail(quoteData) {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`;

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3DA280 0%, #2D7A5F 100%); color: white; padding: 20px; border-radius: 8px;">
                <h2>🆕 Nouveau Devis Généré</h2>
                <p>Référence: <strong>${quoteData.quoteId}</strong></p>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3>📋 Détails du Devis</h3>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Client:</strong> ${quoteData.email}
                </div>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Code Postal:</strong> ${quoteData.postalCode} (${quoteData.department})
                    ${quoteData.isIDF ? '<strong>- Île-de-France</strong>' : '<strong>- Hors IDF</strong>'}
                </div>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Nombre de lots:</strong> ${quoteData.lots}
                </div>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Nombre d'immeubles:</strong> ${quoteData.buildings}
                </div>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">DPE inclus:</strong> ${quoteData.includeDPE ? '✅ Oui' : '❌ Non'}
                </div>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Prix calculé:</strong> <strong style="font-size: 1.2em; color: #3DA280;">${quoteData.price} €</strong>
                </div>

                <div style="margin-top: 20px;">
                    <a href="${sheetUrl}" style="display: inline-block; padding: 12px 24px; background: #3DA280; color: white; text-decoration: none; border-radius: 6px;">📊 Voir dans Google Sheets</a>
                </div>
            </div>
        </div>
    `;

    await sgMail.send({
        to: process.env.EMAIL_INTERNAL,
        from: { email: process.env.EMAIL_FROM, name: process.env.COMPANY_NAME },
        subject: `🆕 Nouveau devis PPPT #${quoteData.quoteId}`,
        html: htmlBody
    });

    console.log('✅ Internal email sent');
}

/**
 * Envoyer email client avec NOUVEAU TEMPLATE AMÉLIORÉ
 */
async function sendClientEmail(quoteData, pdfBuffer) {
    const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

                <!-- Header avec gradient -->
                <div style="background: linear-gradient(135deg, #3DA280 0%, #2D7A5F 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 40px; font-weight: 700; letter-spacing: -0.5px;">
                        Atlas PPPT
                    </h1>
                    <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.95); font-size: 19px; font-weight: 500;">
                        Votre Plan Pluriannuel de Travaux
                    </p>
                </div>

                <!-- Corps de l'email -->
                <div style="padding: 40px 30px;">

                    <!-- Message d'accueil -->
                    <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                        Bonjour,
                    </p>

                    <p style="margin: 0 0 25px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                        Merci de nous avoir sollicités pour votre Plan Pluriannuel de Travaux. Votre devis personnalisé est prêt.
                    </p>

                    <!-- Référence en badge -->
                    <div style="background: #E8F5F1; border-left: 4px solid #3DA280; padding: 12px 16px; margin-bottom: 30px; border-radius: 4px;">
                        <p style="margin: 0; color: #2D7A5F; font-size: 14px; font-weight: 600;">
                            Référence : ${quoteData.quoteId}
                        </p>
                    </div>

                    <!-- Card récapitulatif -->
                    <div style="background: #f9fafb; border-radius: 6px; padding: 25px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
                        <h2 style="margin: 0 0 20px 0; color: #3DA280; font-size: 18px; font-weight: 600;">
                            Votre projet en bref
                        </h2>

                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 15px;">
                                    Nombre de lots
                                </td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937; font-size: 15px; font-weight: 600;">
                                    ${quoteData.lots}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 15px;">
                                    Nombre d'immeubles
                                </td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937; font-size: 15px; font-weight: 600;">
                                    ${quoteData.buildings}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 15px;">
                                    Prestation DPE
                                </td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937; font-size: 15px; font-weight: 600;">
                                    ${quoteData.includeDPE ? 'Incluse' : 'Non incluse'}
                                </td>
                            </tr>
                        </table>

                        <!-- Prix en grand -->
                        <div style="margin-top: 25px; padding: 20px; background: white; border-radius: 8px; text-align: center; border: 2px solid #3DA280;">
                            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                Tarif personnalisé
                            </p>
                            <p style="margin: 0; color: #3DA280; font-size: 36px; font-weight: 700; line-height: 1.2;">
                                ${quoteData.price} €
                            </p>
                            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
                                TTC
                            </p>
                        </div>
                    </div>

                    <!-- PDF attaché -->
                    ${pdfBuffer ? `
                    <div style="background: #E8F5F1; padding: 16px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
                        <p style="margin: 0; color: #2D7A5F; font-size: 15px;">
                            📎 <strong>Devis détaillé joint en pièce jointe</strong> (PDF)
                        </p>
                    </div>
                    ` : ''}

                    <!-- Timeline -->
                    <div style="margin-bottom: 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                            Et maintenant ?
                        </h2>

                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #1f2937; font-size: 15px; vertical-align: top;">
                                    Validation de votre devis
                                </td>
                                <td style="padding: 10px 0; text-align: right; vertical-align: top;">
                                    <span style="display: inline-block; background: #3DA280; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                        J
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #1f2937; font-size: 15px; vertical-align: top;">
                                    Prise de rendez-vous
                                </td>
                                <td style="padding: 10px 0; text-align: right; vertical-align: top;">
                                    <span style="display: inline-block; background: #E8F5F1; color: #2D7A5F; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                        J+2
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #1f2937; font-size: 15px; vertical-align: top;">
                                    Intervention sur site
                                </td>
                                <td style="padding: 10px 0; text-align: right; vertical-align: top;">
                                    <span style="display: inline-block; background: #E8F5F1; color: #2D7A5F; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                        J+7
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #1f2937; font-size: 15px; vertical-align: top;">
                                    Livraison de votre PPPT
                                </td>
                                <td style="padding: 10px 0; text-align: right; vertical-align: top;">
                                    <span style="display: inline-block; background: #E8F5F1; color: #2D7A5F; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                        J+15
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="mailto:${process.env.EMAIL_FROM}?subject=Validation devis ${quoteData.quoteId}"
                           style="display: inline-block; background: linear-gradient(135deg, #3DA280 0%, #2D7A5F 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(61, 162, 128, 0.3);">
                            Valider le devis
                        </a>
                    </div>

                    <!-- Message de clôture -->
                    <p style="margin: 30px 0 10px 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                        Une question ? Besoin d'un ajustement ? Répondez simplement à cet email, nous sommes là pour vous accompagner.
                    </p>

                    <p style="margin: 25px 0 0 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                        Cordialement,<br>
                        <strong style="color: #3DA280;">L'équipe Atlas PPPT</strong>
                    </p>

                </div>

                <!-- Réassurance -->
                <div style="background: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
                    <div style="text-align: center;">
                        <p style="margin: 0 0 8px 0; color: #3DA280; font-size: 14px; font-weight: 600;">
                            ✓ Conforme à la réglementation
                        </p>
                        <p style="margin: 0; color: #3DA280; font-size: 14px; font-weight: 600;">
                            ✓ +500 copropriétés accompagnées
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background: #1f2937; padding: 25px 30px; text-align: center;">
                    <p style="margin: 0 0 5px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                        Atlas PPPT
                    </p>
                    <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px;">
                        ${process.env.EMAIL_FROM}
                    </p>
                </div>

            </div>
        </body>
        </html>
    `;

    const emailData = {
        to: quoteData.email,
        from: { email: process.env.EMAIL_FROM, name: process.env.COMPANY_NAME },
        subject: `Votre devis PPPT - Référence ${quoteData.quoteId}`,
        html: htmlBody
    };

    if (pdfBuffer) {
        emailData.attachments = [{
            content: pdfBuffer.toString('base64'),
            filename: `Devis_${quoteData.quoteId}_Atlas_PPPT.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
        }];
    }

    await sgMail.send(emailData);
    console.log('✅ Client email sent with NEW improved template');
}

// ==================== MAIN HANDLER ====================

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        console.log('📥 New quote request received');

        // Parser les données (Vercel parse automatiquement le JSON)
        const data = req.body;

        // Validation basique
        if (!data.email || !data.postalCode || !data.lots || !data.buildings || !data.price) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Générer ID unique
        const quoteId = await generateUniqueId();
        console.log('🆔 Generated ID:', quoteId);

        // Préparer les données
        const quoteData = {
            quoteId,
            date: new Date().toISOString(),
            email: data.email,
            postalCode: data.postalCode,
            department: data.department || data.postalCode.substring(0, 2),
            lots: parseInt(data.lots),
            buildings: parseInt(data.buildings),
            includeDPE: data.includeDPE === 'true' || data.includeDPE === true,
            price: parseFloat(data.price),
            isIDF: data.isIDF === 'true' || data.isIDF === true,
            fileUrl: null,
            fileName: null,
            timestamp: Date.now()
        };

        // Sauvegarder dans Sheets
        await saveToSheet(quoteData);

        // Générer PDF depuis template Google Docs
        const pdfBuffer = await generatePdfFromTemplate(quoteData);

        // Envoyer email interne
        try {
            await sendInternalEmail(quoteData);
        } catch (e) {
            console.error('⚠️ Internal email error (non-blocking):', e.message);
        }

        // Envoyer email client avec PDF
        try {
            await sendClientEmail(quoteData, pdfBuffer);
        } catch (e) {
            console.error('⚠️ Client email error (non-blocking):', e.message);
        }

        // Retour succès
        res.status(200).json({
            success: true,
            quoteId,
            message: 'Devis enregistré avec succès',
            makeWebhookCalled: makeWebhookSuccess
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur serveur'
        });
    }
};
