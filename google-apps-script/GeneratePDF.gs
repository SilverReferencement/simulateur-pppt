/**
 * Script Google Apps Script pour générer des PDF depuis template
 * À déployer comme Web App avec TES permissions
 */

// === CONFIGURATION ===
const TEMPLATE_ID = '1zVyvo0RIukOmF8L1PSthARQjyOSG8GA3S2Mr4wdtEMQ';
const DRIVE_FOLDER_ID = '1M4Ho1dU9qxPyDBEqXGplv8LTHHG-qIJI';

/**
 * Point d'entrée pour les requêtes POST
 */
function doPost(e) {
  try {
    // Parser les données reçues
    const data = JSON.parse(e.postData.contents);

    Logger.log('📥 Received data:', data);

    // Générer le PDF
    const pdfBlob = generatePdfFromTemplate(data);

    // Retourner le PDF en base64
    const base64Pdf = Utilities.base64Encode(pdfBlob.getBytes());

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        pdf: base64Pdf,
        message: 'PDF généré avec succès'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ Error:', error.toString());

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Génère le PDF depuis le template
 */
function generatePdfFromTemplate(quoteData) {
  Logger.log('🔧 Starting PDF generation...');

  // 1. Copier le template
  const template = DriveApp.getFileById(TEMPLATE_ID);
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const tempDoc = template.makeCopy(`Devis_${quoteData.quoteId}_temp`, folder);
  const docId = tempDoc.getId();

  Logger.log('✅ Template copied:', docId);

  // 2. Ouvrir le document et remplacer les variables
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();

  // Remplacements
  body.replaceText('{{quoteId}}', quoteData.quoteId || '');
  body.replaceText('{{date}}', quoteData.date || '');
  body.replaceText('{{clientName}}', quoteData.clientName || '');
  body.replaceText('{{clientEmail}}', quoteData.clientEmail || '');
  body.replaceText('{{clientPhone}}', quoteData.clientPhone || '');
  body.replaceText('{{address}}', quoteData.address || '');
  body.replaceText('{{totalPrice}}', quoteData.totalPrice || '');
  body.replaceText('{{budgetEC}}', quoteData.budgetEC || '');
  body.replaceText('{{budgetCE}}', quoteData.budgetCE || '');
  body.replaceText('{{lots}}', quoteData.lots || '');

  // Sauvegarder et fermer
  doc.saveAndClose();

  Logger.log('✅ Variables replaced');

  // 3. Exporter en PDF
  const pdfBlob = tempDoc.getAs('application/pdf');
  pdfBlob.setName(`Devis_${quoteData.quoteId}.pdf`);

  Logger.log('✅ PDF generated');

  // 4. Supprimer le document temporaire
  DriveApp.getFileById(docId).setTrashed(true);

  Logger.log('✅ Temp doc deleted');

  return pdfBlob;
}

/**
 * Fonction de test (optionnelle)
 */
function testGeneratePDF() {
  const testData = {
    quoteId: 'TEST-001',
    date: new Date().toLocaleDateString('fr-FR'),
    clientName: 'Test Client',
    clientEmail: 'test@example.com',
    clientPhone: '06 12 34 56 78',
    address: '123 Rue Test, 75001 Paris',
    totalPrice: '50 000 €',
    budgetEC: '30 000 €',
    budgetCE: '20 000 €',
    lots: 'Lot 1: Toiture\nLot 2: Façade'
  };

  const result = generatePdfFromTemplate(testData);
  Logger.log('✅ Test successful!');
  Logger.log('PDF size:', result.getBytes().length, 'bytes');
}
