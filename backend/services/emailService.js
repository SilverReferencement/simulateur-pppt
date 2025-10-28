// Service d'envoi d'emails
// Utilise SendGrid pour envoyer les emails automatiques

const sgMail = require('@sendgrid/mail');

// Configuration SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Envoyer email de notification interne
 * @param {Object} quoteData - Données du devis
 * @param {String} sheetUrl - URL du devis dans Google Sheets
 * @param {String} pdfUrl - URL du PDF généré (optionnel)
 */
async function sendInternalEmail(quoteData, sheetUrl, pdfUrl = null) {
    const { quoteId, email, postalCode, department, lots, buildings, includeDPE, price, date, fileUrl } = quoteData;

    const msg = {
        to: process.env.EMAIL_INTERNAL,
        from: {
            email: process.env.EMAIL_FROM,
            name: process.env.COMPANY_NAME
        },
        subject: `🆕 Nouveau devis PPPT #${quoteId}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3DA280 0%, #2D7A5F 100%); color: white; padding: 20px; border-radius: 8px; }
                    .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
                    .detail { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280; }
                    .label { font-weight: bold; color: #3DA280; }
                    .links { margin-top: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background: #3DA280; color: white; text-decoration: none; border-radius: 6px; margin: 5px; }
                    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🆕 Nouveau Devis Généré</h2>
                        <p style="margin: 0;">Référence: <strong>${quoteId}</strong></p>
                    </div>

                    <div class="content">
                        <h3>📋 Détails du Devis</h3>

                        <div class="detail">
                            <span class="label">Client:</span> ${email}
                        </div>

                        <div class="detail">
                            <span class="label">Code Postal:</span> ${postalCode} ${department ? `(Département ${department})` : ''}
                            ${quoteData.isIDF ? ' - <strong>Île-de-France</strong>' : ' - <strong>Hors IDF</strong>'}
                        </div>

                        <div class="detail">
                            <span class="label">Nombre de lots:</span> ${lots}
                        </div>

                        <div class="detail">
                            <span class="label">Nombre d'immeubles:</span> ${buildings}
                        </div>

                        <div class="detail">
                            <span class="label">DPE inclus:</span> ${includeDPE ? '✅ Oui' : '❌ Non'}
                        </div>

                        <div class="detail">
                            <span class="label">Prix calculé:</span> <strong style="font-size: 1.2em; color: #3DA280;">${price} €</strong>
                        </div>

                        <div class="detail">
                            <span class="label">Date:</span> ${new Date(date).toLocaleString('fr-FR')}
                        </div>

                        ${fileUrl ? `
                        <div class="detail">
                            <span class="label">Fichier DPE client:</span> <a href="${fileUrl}" target="_blank">📎 Télécharger</a>
                        </div>
                        ` : ''}

                        <div class="links">
                            <h3>🔗 Liens Rapides</h3>
                            <a href="${sheetUrl}" class="button">📊 Voir dans Google Sheets</a>
                            ${pdfUrl ? `<a href="${pdfUrl}" class="button">📄 Télécharger le PDF</a>` : ''}
                        </div>
                    </div>

                    <div class="footer">
                        <p>Simulateur PPPT - Automatisation<br>
                        ${process.env.COMPANY_NAME}</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`✅ Email interne envoyé à ${process.env.EMAIL_INTERNAL}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Erreur envoi email interne:', error);
        if (error.response) {
            console.error('Détails:', error.response.body);
        }
        throw error;
    }
}

/**
 * Envoyer email au client avec le PDF du devis
 * @param {Object} quoteData - Données du devis
 * @param {Buffer} pdfBuffer - Buffer du PDF (optionnel)
 */
async function sendClientEmail(quoteData, pdfBuffer = null) {
    const { quoteId, email, lots, buildings, includeDPE, price } = quoteData;

    const msg = {
        to: email,
        from: {
            email: process.env.EMAIL_FROM,
            name: process.env.COMPANY_NAME
        },
        subject: `Votre devis PPPT - Référence ${quoteId}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3DA280 0%, #2D7A5F 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
                    .content { padding: 30px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
                    .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3DA280; }
                    .price { font-size: 2em; color: #3DA280; font-weight: bold; text-align: center; margin: 20px 0; }
                    .detail-line { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 0.9em; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">✅ Votre Devis PPPT</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Référence: ${quoteId}</p>
                    </div>

                    <div class="content">
                        <p>Bonjour,</p>

                        <p>Merci pour votre demande de devis !</p>

                        <p>Vous trouverez ci-dessous le récapitulatif de votre devis personnalisé pour la prestation PPPT.</p>

                        <div class="summary">
                            <h3 style="margin-top: 0; color: #3DA280;">📋 Récapitulatif</h3>

                            <div class="detail-line">
                                <strong>Nombre de lots:</strong> ${lots}
                            </div>

                            <div class="detail-line">
                                <strong>Nombre d'immeubles:</strong> ${buildings}
                            </div>

                            <div class="detail-line">
                                <strong>Prestation DPE:</strong> ${includeDPE ? '✅ Incluse' : '❌ Non incluse'}
                            </div>

                            <div class="price">
                                ${price} € TTC
                            </div>
                        </div>

                        ${pdfBuffer ? '<p>📎 <strong>Votre devis détaillé est en pièce jointe (PDF).</strong></p>' : ''}

                        <p>Pour toute question ou pour confirmer votre commande, n'hésitez pas à nous contacter en répondant directement à cet email.</p>

                        <p style="margin-top: 30px;">Cordialement,<br>
                        <strong>L'équipe ${process.env.COMPANY_NAME}</strong></p>
                    </div>

                    <div class="footer">
                        <p>${process.env.COMPANY_NAME}<br>
                        Email: ${process.env.EMAIL_FROM}</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    // Ajouter le PDF en pièce jointe si fourni
    if (pdfBuffer) {
        msg.attachments = [{
            content: pdfBuffer.toString('base64'),
            filename: `Devis_${quoteId}_Atlas_PPPT.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
        }];
    }

    try {
        await sgMail.send(msg);
        console.log(`✅ Email client envoyé à ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Erreur envoi email client:', error);
        if (error.response) {
            console.error('Détails:', error.response.body);
        }
        throw error;
    }
}

/**
 * Tester la configuration email
 */
async function testEmailConnection() {
    try {
        if (!process.env.SENDGRID_API_KEY) {
            console.error('❌ SENDGRID_API_KEY non configuré');
            return false;
        }

        // SendGrid n'a pas de méthode verify(), on teste juste si la clé existe
        console.log('✅ Configuration SendGrid présente');
        return true;
    } catch (error) {
        console.error('❌ Erreur configuration email:', error);
        return false;
    }
}

module.exports = {
    sendInternalEmail,
    sendClientEmail,
    testEmailConnection
};
