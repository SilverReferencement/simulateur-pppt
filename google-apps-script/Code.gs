/**
 * BACKEND PPPT - Google Apps Script
 * Remplace le backend Node.js Render pour une exécution instantanée et gratuite
 *
 * Fonctionnalités :
 * - Réception des données du formulaire
 * - Génération d'ID unique incrémental (DEVIS-001, DEVIS-002...)
 * - Sauvegarde dans Google Sheets
 * - Upload fichier DPE dans Google Drive
 * - Génération PDF depuis Google Docs template
 * - Envoi d'emails (interne + client avec PDF)
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
  SHEET_ID: '1GiPN9N2rb4vRqdGamQLPNoC0i7wRQaXAon5D9slf4og',
  SHEET_NAME: 'Devis',
  DRIVE_FOLDER_ID: '1M4Ho1dU9qxPyDBEqXGplv8LTHHG-qIJI',
  DOCS_TEMPLATE_ID: '1N1kwk5j0gRhgI55AkR2wB_NTGemD0HkscpSNQTBpSwQ',
  EMAIL_FROM: 'contact@atlas-pppt.fr',
  EMAIL_INTERNAL: 'contact@atlas-pppt.fr',
  COMPANY_NAME: 'Atlas PPPT'
};

// ==================== ENDPOINT PRINCIPAL ====================

/**
 * Point d'entrée pour les requêtes POST
 */
function doPost(e) {
  try {
    // Gérer CORS
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    // Parser les données du formulaire
    const data = parseFormData(e);

    Logger.log('Données reçues: ' + JSON.stringify(data));

    // 1. Générer ID unique
    const quoteId = generateUniqueId();
    Logger.log('ID généré: ' + quoteId);

    // 2. Upload fichier DPE si présent
    let fileUrl = null;
    if (data.dpeFile) {
      fileUrl = uploadFileToDrive(data.dpeFile, quoteId);
      Logger.log('Fichier uploadé: ' + fileUrl);
    }

    // 3. Préparer les données du devis
    const quoteData = {
      quoteId: quoteId,
      date: new Date().toISOString(),
      email: data.email,
      postalCode: data.postalCode,
      department: data.department || data.postalCode.substring(0, 2),
      lots: parseInt(data.lots),
      buildings: parseInt(data.buildings),
      includeDPE: data.includeDPE === 'true',
      price: parseFloat(data.price),
      isIDF: data.isIDF === 'true',
      fileUrl: fileUrl,
      fileName: data.dpeFile ? data.dpeFile.getName() : '',
      timestamp: Date.now()
    };

    // 4. Sauvegarder dans Google Sheets
    saveToSheet(quoteData);
    Logger.log('Sauvegardé dans Sheets');

    // 5. Générer PDF du devis
    let pdfBlob = null;
    try {
      pdfBlob = generatePdfFromTemplate(quoteData);
      Logger.log('PDF généré');
    } catch (pdfError) {
      Logger.log('Erreur PDF (non bloquant): ' + pdfError);
    }

    // 6. Envoyer emails
    try {
      sendInternalEmail(quoteData, fileUrl);
      Logger.log('Email interne envoyé');
    } catch (emailError) {
      Logger.log('Erreur email interne: ' + emailError);
    }

    try {
      sendClientEmail(quoteData, pdfBlob);
      Logger.log('Email client envoyé');
    } catch (emailError) {
      Logger.log('Erreur email client: ' + emailError);
    }

    // 7. Retourner succès
    const response = {
      success: true,
      quoteId: quoteId,
      message: 'Devis enregistré avec succès',
      fileUploaded: !!fileUrl,
      pdfGenerated: !!pdfBlob
    };

    output.setContent(JSON.stringify(response));
    return output;

  } catch (error) {
    Logger.log('ERREUR: ' + error);
    const errorResponse = {
      success: false,
      error: error.toString()
    };
    const output = ContentService.createTextOutput(JSON.stringify(errorResponse));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

/**
 * Point d'entrée pour les requêtes GET (CORS preflight)
 */
function doGet(e) {
  const output = ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'PPPT Backend - Google Apps Script',
    timestamp: new Date().toISOString()
  }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ==================== PARSING DES DONNÉES ====================

function parseFormData(e) {
  const data = {};

  // Récupérer les paramètres
  if (e.parameter) {
    for (let key in e.parameter) {
      data[key] = e.parameter[key];
    }
  }

  // Récupérer le fichier uploadé
  if (e.parameters && e.parameters.dpeFile && e.parameters.dpeFile.length > 0) {
    const fileBlob = e.parameters.dpeFile[0];
    data.dpeFile = fileBlob;
  }

  return data;
}

// ==================== GÉNÉRATION ID UNIQUE ====================

function generateUniqueId() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
  const data = sheet.getRange('A2:A').getValues();

  // Trouver le dernier ID
  const existingIds = data
    .map(row => row[0])
    .filter(id => id && String(id).startsWith('DEVIS-'))
    .map(id => parseInt(String(id).replace('DEVIS-', '')))
    .filter(num => !isNaN(num) && num > 0);

  const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

  return 'DEVIS-' + String(nextNumber).padStart(3, '0');
}

// ==================== SAUVEGARDE GOOGLE SHEETS ====================

function saveToSheet(quoteData) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);

  // Trouver la prochaine ligne vide
  const lastRow = sheet.getLastRow();
  const nextRow = lastRow + 1;

  // Préparer la ligne
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

  // Écrire la ligne
  sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

  Logger.log('Ligne ajoutée à la ligne ' + nextRow);
}

// ==================== UPLOAD FICHIER DRIVE ====================

function uploadFileToDrive(fileBlob, quoteId) {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);

  // Renommer le fichier
  const fileName = 'DPE_' + quoteId + '_' + fileBlob.getName();

  // Créer le fichier
  const file = folder.createFile(fileBlob);
  file.setName(fileName);
  file.setDescription('Fichier DPE pour le devis ' + quoteId);

  // Retourner l'URL de visualisation
  return file.getUrl();
}

// ==================== GÉNÉRATION PDF ====================

function generatePdfFromTemplate(quoteData) {
  try {
    // Ouvrir le template
    const template = DriveApp.getFileById(CONFIG.DOCS_TEMPLATE_ID);

    // Créer une copie
    const tempName = 'Devis_' + quoteData.quoteId + '_temp';
    const tempDoc = template.makeCopy(tempName, DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID));
    const tempDocId = tempDoc.getId();

    // Ouvrir le document et remplacer les variables
    const doc = DocumentApp.openById(tempDocId);
    const body = doc.getBody();

    // Remplacements
    body.replaceText('{{quoteId}}', quoteData.quoteId);
    body.replaceText('{{clientEmail}}', quoteData.email);
    body.replaceText('{{postalCode}}', quoteData.postalCode);
    body.replaceText('{{department}}', quoteData.department);
    body.replaceText('{{region}}', quoteData.isIDF ? 'Île-de-France' : 'Hors Île-de-France');
    body.replaceText('{{lots}}', quoteData.lots.toString());
    body.replaceText('{{buildings}}', quoteData.buildings.toString());
    body.replaceText('{{includeDPE}}', quoteData.includeDPE ? 'Oui' : 'Non');
    body.replaceText('{{price}}', quoteData.price + ' €');
    body.replaceText('{{date}}', new Date(quoteData.date).toLocaleDateString('fr-FR'));
    body.replaceText('{{companyName}}', CONFIG.COMPANY_NAME);
    body.replaceText('{{companyEmail}}', CONFIG.EMAIL_FROM);

    doc.saveAndClose();

    // Exporter en PDF
    const pdfBlob = tempDoc.getAs('application/pdf');
    pdfBlob.setName('Devis_' + quoteData.quoteId + '_Atlas_PPPT.pdf');

    // Supprimer le document temporaire
    DriveApp.getFileById(tempDocId).setTrashed(true);

    return pdfBlob;

  } catch (error) {
    Logger.log('Erreur génération PDF: ' + error);
    return null;
  }
}

// ==================== ENVOI EMAILS ====================

function sendInternalEmail(quoteData, fileUrl) {
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/' + CONFIG.SHEET_ID;

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

        ${fileUrl ? `<div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #3DA280;">
          <strong style="color: #3DA280;">Fichier DPE:</strong> <a href="${fileUrl}">📎 Télécharger</a>
        </div>` : ''}

        <div style="margin-top: 20px;">
          <a href="${sheetUrl}" style="display: inline-block; padding: 12px 24px; background: #3DA280; color: white; text-decoration: none; border-radius: 6px;">📊 Voir dans Google Sheets</a>
        </div>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: CONFIG.EMAIL_INTERNAL,
    subject: '🆕 Nouveau devis PPPT #' + quoteData.quoteId,
    htmlBody: htmlBody
  });
}

function sendClientEmail(quoteData, pdfBlob) {
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3DA280 0%, #2D7A5F 100%); color: white; padding: 30px; text-align: center; border-radius: 8px;">
        <h1>✅ Votre Devis PPPT</h1>
        <p>Référence: ${quoteData.quoteId}</p>
      </div>

      <div style="padding: 30px; background: #f9fafb; border-radius: 8px; margin-top: 20px;">
        <p>Bonjour,</p>
        <p>Merci pour votre demande de devis !</p>
        <p>Vous trouverez ci-dessous le récapitulatif de votre devis personnalisé pour la prestation PPPT.</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3DA280;">
          <h3 style="color: #3DA280;">📋 Récapitulatif</h3>

          <div style="margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Nombre de lots:</strong> ${quoteData.lots}
          </div>

          <div style="margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Nombre d'immeubles:</strong> ${quoteData.buildings}
          </div>

          <div style="margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Prestation DPE:</strong> ${quoteData.includeDPE ? '✅ Incluse' : '❌ Non incluse'}
          </div>

          <div style="font-size: 2em; color: #3DA280; font-weight: bold; text-align: center; margin: 20px 0;">
            ${quoteData.price} € TTC
          </div>
        </div>

        ${pdfBlob ? '<p>📎 <strong>Votre devis détaillé est en pièce jointe (PDF).</strong></p>' : ''}

        <p>Pour toute question ou pour confirmer votre commande, n'hésitez pas à nous contacter en répondant directement à cet email.</p>

        <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe ${CONFIG.COMPANY_NAME}</strong></p>
      </div>
    </div>
  `;

  const emailOptions = {
    to: quoteData.email,
    subject: 'Votre devis PPPT - Référence ' + quoteData.quoteId,
    htmlBody: htmlBody
  };

  // Ajouter PDF si disponible
  if (pdfBlob) {
    emailOptions.attachments = [pdfBlob];
  }

  MailApp.sendEmail(emailOptions);
}
