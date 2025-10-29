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
 * Mettre à jour les en-têtes du Google Sheet
 */
async function updateSheetHeaders() {
    try {
        const headers = [
            'ID Devis',
            'Date',
            'Prénom Client',
            'Nom Client',
            'Email Client',
            'Téléphone Client',
            'Adresse Copropriété',
            'Code Postal',
            'Département',
            'Île-de-France',
            'Nombre de Lots',
            'Nombre d\'Immeubles',
            'DPE Collectif',
            'Date Dernier DPE Collectif',
            'Prix',
            'Demandeur = Président',
            'Prénom Président',
            'Nom Président',
            'Email Président',
            'Téléphone Président',
            'Membres Conseil Syndical',
            'Prochaine Date AG',
            'Commentaire',
            'Fichier URL',
            'Fichier Nom',
            'Timestamp'
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1:Z1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [headers]
            }
        });

        console.log('✅ Headers updated');
    } catch (error) {
        console.error('⚠️ Error updating headers:', error.message);
    }
}

/**
 * Sauvegarder dans Google Sheets
 */
async function saveToSheet(quoteData) {
    // Mettre à jour les en-têtes (ne fait rien si déjà à jour)
    await updateSheetHeaders();

    const existingData = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:A`
    });

    const rows = existingData.data.values || [];
    const nextRow = rows.length + 1;

    // Formatter les membres du conseil
    const councilMembersText = quoteData.councilMembers && quoteData.councilMembers.length > 0
        ? quoteData.councilMembers.map((m, i) =>
            `Membre ${i+1}: ${m.firstname || '-'} ${m.lastname || '-'} | ${m.email || '-'} | ${m.phone || '-'}`
          ).join('\n')
        : '';

    const row = [
        quoteData.quoteId,
        new Date(quoteData.date).toLocaleString('fr-FR'),
        quoteData.userFirstname,
        quoteData.userLastname,
        quoteData.email,
        quoteData.userPhone,
        quoteData.propertyAddress,
        quoteData.postalCode,
        quoteData.department,
        quoteData.isIDF ? 'Oui' : 'Non',
        quoteData.lots,
        quoteData.buildings,
        quoteData.includeDPE ? 'Oui' : 'Non',
        quoteData.dpeDate,
        quoteData.price,
        quoteData.isPresident ? 'Oui' : 'Non',
        quoteData.presidentFirstname,
        quoteData.presidentLastname,
        quoteData.presidentEmail,
        quoteData.presidentPhone,
        councilMembersText,
        quoteData.agDate,
        quoteData.comment,
        quoteData.fileUrl || '',
        quoteData.fileName || '',
        quoteData.timestamp
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${nextRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [row]
        }
    });

    console.log('✅ Saved to Sheets at row', nextRow);
}

/**
 * Générer PDF via Apps Script Webhook
 */
async function generatePdfFromTemplate(quoteData) {
    try {
        const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error('❌ APPS_SCRIPT_WEBHOOK_URL not configured');
            return null;
        }

        console.log('📤 Calling Apps Script webhook for PDF generation...');

        // Formatter les membres du conseil pour le PDF
        const councilMembersText = quoteData.councilMembers && quoteData.councilMembers.length > 0
            ? quoteData.councilMembers.map((m, i) =>
                `Membre ${i+1}: ${m.firstname || '-'} ${m.lastname || '-'} | ${m.email || '-'} | ${m.phone || '-'}`
              ).join('\n')
            : '';

        // Préparer les données pour le webhook
        const payload = {
            quoteId: quoteData.quoteId,
            date: new Date(quoteData.date).toLocaleDateString('fr-FR'),

            // Client
            userFirstname: quoteData.userFirstname,
            userLastname: quoteData.userLastname,
            userEmail: quoteData.email,
            userPhone: quoteData.userPhone,

            // Copropriété
            propertyAddress: quoteData.propertyAddress,
            postalCode: quoteData.postalCode,
            department: quoteData.department,

            // Devis
            lots: quoteData.lots.toString(),
            buildings: quoteData.buildings.toString(),
            includeDPE: quoteData.includeDPE ? 'Oui' : 'Non',
            dpeDate: quoteData.dpeDate,
            price: quoteData.price + ' €',

            // Président
            isPresident: quoteData.isPresident ? 'Oui' : 'Non',
            presidentFirstname: quoteData.presidentFirstname,
            presidentLastname: quoteData.presidentLastname,
            presidentEmail: quoteData.presidentEmail,
            presidentPhone: quoteData.presidentPhone,

            // Membres conseil
            councilMembers: councilMembersText,

            // Infos complémentaires
            agDate: quoteData.agDate,
            comment: quoteData.comment
        };

        // Appeler le webhook
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Unknown error from webhook');
        }

        console.log('✅ PDF received from Apps Script');

        // Décoder le PDF depuis base64
        const pdfBuffer = Buffer.from(result.pdf, 'base64');

        console.log('✅ PDF decoded, size:', pdfBuffer.length, 'bytes');

        return pdfBuffer;

    } catch (error) {
        console.error('❌ PDF generation error:', error.message);
        console.error('Stack:', error.stack);
        return null;
    }
}

/**
 * Envoyer email interne
 */
async function sendInternalEmail(quoteData) {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`;

    // Formatter les membres du conseil
    const councilMembersHTML = quoteData.councilMembers && quoteData.councilMembers.length > 0
        ? quoteData.councilMembers.map((m, i) => `
            <li><strong>Membre ${i+1}:</strong> ${m.name || '-'} | ${m.email || '-'} | ${m.phone || '-'}</li>
        `).join('')
        : '<li><em>Aucun membre ajouté</em></li>';

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3DA280 0%, #2D7A5F 100%); color: white; padding: 20px; border-radius: 8px;">
                <h2>🆕 Nouveau Devis Généré</h2>
                <p>Référence: <strong>${quoteData.quoteId}</strong></p>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3>👤 Informations Client</h3>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Nom:</strong> ${quoteData.userName}
                </div>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Email:</strong> ${quoteData.email}
                </div>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Téléphone:</strong> ${quoteData.userPhone}
                </div>

                <h3 style="margin-top: 25px;">🏢 Copropriété</h3>

                ${quoteData.propertyAddress ? `
                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Adresse:</strong> ${quoteData.propertyAddress}
                </div>
                ` : ''}

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Code Postal:</strong> ${quoteData.postalCode} (${quoteData.department})
                    ${quoteData.isIDF ? '<strong>- Île-de-France</strong>' : '<strong>- Hors IDF</strong>'}
                </div>

                <h3 style="margin-top: 25px;">📋 Détails du Devis</h3>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Nombre de lots:</strong> ${quoteData.lots}
                </div>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Nombre d'immeubles:</strong> ${quoteData.buildings}
                </div>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">DPE Collectif:</strong> ${quoteData.includeDPE ? '✅ Oui' : '❌ Non'}
                    ${quoteData.dpeDate ? `<br><small>Date du dernier DPE: ${quoteData.dpeDate}</small>` : ''}
                </div>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Prix calculé:</strong> <strong style="font-size: 1.2em; color: #3DA280;">${quoteData.price} €</strong>
                </div>

                <h3 style="margin-top: 25px;">🏛️ Conseil Syndical</h3>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Président:</strong> ${quoteData.isPresident ? '✅ Le demandeur' : quoteData.presidentName || '-'}
                    ${!quoteData.isPresident && quoteData.presidentEmail ? `<br><small>Email: ${quoteData.presidentEmail}</small>` : ''}
                    ${!quoteData.isPresident && quoteData.presidentPhone ? `<br><small>Tél: ${quoteData.presidentPhone}</small>` : ''}
                </div>

                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Membres du conseil:</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        ${councilMembersHTML}
                    </ul>
                </div>

                ${quoteData.agDate || quoteData.comment ? `
                <h3 style="margin-top: 25px;">📝 Informations complémentaires</h3>
                ` : ''}

                ${quoteData.agDate ? `
                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Prochaine AG:</strong> ${quoteData.agDate}
                </div>
                ` : ''}

                ${quoteData.comment ? `
                <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
                    <strong style="color: #3DA280;">Commentaire:</strong><br>${quoteData.comment}
                </div>
                ` : ''}

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
                        <a href="${process.env.SIMULATOR_URL || 'https://charles-dupin44.github.io/Automatisation-Creation-simulateur-Prix-PPPT'}/?quoteId=${quoteData.quoteId}"
                           style="display: inline-block; background: linear-gradient(135deg, #3DA280 0%, #2D7A5F 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(61, 162, 128, 0.3);">
                            Valider le devis et payer la prestation
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
        if (!data.email || !data.postalCode || !data.lots || !data.buildings || !data.price || !data.userFirstname || !data.userLastname || !data.userPhone) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Générer ID unique
        const quoteId = await generateUniqueId();
        console.log('🆔 Generated ID:', quoteId);

        // Parser council members si c'est une string JSON
        let councilMembers = [];
        if (data.councilMembers) {
            try {
                councilMembers = typeof data.councilMembers === 'string'
                    ? JSON.parse(data.councilMembers)
                    : data.councilMembers;
            } catch (e) {
                console.error('Error parsing council members:', e);
            }
        }

        // Préparer les données
        const quoteData = {
            quoteId,
            date: new Date().toISOString(),

            // Infos utilisateur
            userFirstname: data.userFirstname,
            userLastname: data.userLastname,
            email: data.email,
            userPhone: data.userPhone,

            // Infos copropriété
            propertyAddress: data.propertyAddress || '',
            postalCode: data.postalCode,
            department: data.department || data.postalCode.substring(0, 2),
            isIDF: data.isIDF === 'true' || data.isIDF === true,

            // Détails devis
            lots: parseInt(data.lots),
            buildings: parseInt(data.buildings),
            includeDPE: data.includeDPE === 'true' || data.includeDPE === true,
            dpeDate: data.dpeDate || '',
            price: parseFloat(data.price),

            // Président
            isPresident: data.isPresident === 'true' || data.isPresident === true,
            presidentFirstname: data.presidentFirstname || '',
            presidentLastname: data.presidentLastname || '',
            presidentEmail: data.presidentEmail || '',
            presidentPhone: data.presidentPhone || '',

            // Membres conseil
            councilMembers: councilMembers,

            // Infos complémentaires
            agDate: data.agDate || '',
            comment: data.comment || '',

            // Fichier
            fileUrl: null,
            fileName: null,
            timestamp: Date.now()
        };

        // ⚡ PARALLÉLISATION : Sheets + PDF en même temps (gain de temps ~30-40%)
        console.log('⚡ Starting parallel operations...');
        const [, pdfBuffer] = await Promise.all([
            saveToSheet(quoteData),
            generatePdfFromTemplate(quoteData)
        ]);
        console.log('✅ Sheets saved and PDF generated in parallel');

        // ⚡ PARALLÉLISATION : Emails en même temps
        console.log('⚡ Sending emails in parallel...');
        await Promise.allSettled([
            sendInternalEmail(quoteData).catch(e => {
                console.error('⚠️ Internal email error (non-blocking):', e.message);
            }),
            sendClientEmail(quoteData, pdfBuffer).catch(e => {
                console.error('⚠️ Client email error (non-blocking):', e.message);
            })
        ]);
        console.log('✅ Emails sent in parallel');

        // Retour succès
        res.status(200).json({
            success: true,
            quoteId,
            message: 'Devis enregistré avec succès',
            pdfGenerated: pdfBuffer !== null
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur serveur'
        });
    }
};
