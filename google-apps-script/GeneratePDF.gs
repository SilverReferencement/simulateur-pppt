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

  // Supprimer tous les éléments contenant "Onglet 1"
  const paragraphs = body.getParagraphs();
  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i].getText().trim();
    if (text === 'Onglet 1' || text.includes('Onglet 1')) {
      paragraphs[i].removeFromParent();
      break; // Arrêter après avoir supprimé le premier
    }
  }

  // Remplacements - Infos principales
  body.replaceText('{{quoteId}}', quoteData.quoteId || '');
  body.replaceText('{{date}}', quoteData.date || '');

  // Client (avec aliases pour compatibilité)
  body.replaceText('{{userFirstname}}', quoteData.userFirstname || '');
  body.replaceText('{{userLastname}}', quoteData.userLastname || '');
  body.replaceText('{{userName}}', (quoteData.userFirstname || '') + ' ' + (quoteData.userLastname || ''));
  body.replaceText('{{userEmail}}', quoteData.userEmail || '');
  body.replaceText('{{clientEmail}}', quoteData.userEmail || ''); // Alias pour template
  body.replaceText('{{userPhone}}', quoteData.userPhone || '');

  // Copropriété
  body.replaceText('{{propertyAddress}}', quoteData.propertyAddress || '');
  body.replaceText('{{postalCode}}', quoteData.postalCode || '');
  body.replaceText('{{department}}', quoteData.department || '');
  body.replaceText('{{region}}', quoteData.region || ''); // Région (IDF ou Hors IDF)

  // Devis
  body.replaceText('{{lots}}', quoteData.lots || '');
  body.replaceText('{{buildings}}', quoteData.buildings || '');
  body.replaceText('{{includeDPE}}', quoteData.includeDPE || 'Non');
  body.replaceText('{{dpeDate}}', quoteData.dpeDate || '');
  body.replaceText('{{price}}', quoteData.price || '');

  // Président
  body.replaceText('{{isPresident}}', quoteData.isPresident || 'Non');
  body.replaceText('{{presidentFirstname}}', quoteData.presidentFirstname || '');
  body.replaceText('{{presidentLastname}}', quoteData.presidentLastname || '');
  body.replaceText('{{presidentName}}', (quoteData.presidentFirstname || '') + ' ' + (quoteData.presidentLastname || ''));
  body.replaceText('{{presidentEmail}}', quoteData.presidentEmail || '');
  body.replaceText('{{presidentPhone}}', quoteData.presidentPhone || '');

  // Membres conseil syndical
  body.replaceText('{{councilMembers}}', quoteData.councilMembers || '');

  // Infos complémentaires
  body.replaceText('{{agDate}}', quoteData.agDate || '');
  body.replaceText('{{comment}}', quoteData.comment || '');

  // Informations entreprise
  body.replaceText('{{companyName}}', quoteData.companyName || 'Atlas PPPT');
  body.replaceText('{{companyEmail}}', quoteData.companyEmail || '');

  // Sauvegarder et fermer
  doc.saveAndClose();

  Logger.log('✅ Variables replaced');

  // 3. Nettoyer le document avant export
  const cleanedDoc = DocumentApp.openById(docId);
  const cleanedBody = cleanedDoc.getBody();

  // Supprime les paragraphes vides et tout ce qui contient "Onglet"
  const elements = cleanedBody.getParagraphs();
  for (let i = elements.length - 1; i >= 0; i--) {
    const text = elements[i].getText().trim();
    if (text === '' || text.match(/^Onglet\s*\d*/i)) {
      elements[i].removeFromParent();
    }
  }

  // Supprime aussi les sauts de page éventuels en tête
  while (
    cleanedBody.getChild(0) &&
    cleanedBody.getChild(0).getType() === DocumentApp.ElementType.PARAGRAPH &&
    cleanedBody.getChild(0).asParagraph().getText().trim() === ''
  ) {
    cleanedBody.removeChild(cleanedBody.getChild(0));
  }

  // Sauvegarder avant conversion
  cleanedDoc.saveAndClose();

  Logger.log('✅ Document cleaned');

  // Laisser le temps à Drive de rafraîchir
  Utilities.sleep(1000);

  // 4. Exporter en PDF
  const pdfBlob = tempDoc.getAs('application/pdf');
  pdfBlob.setName(`Devis_${quoteData.quoteId}.pdf`);

  Logger.log('✅ PDF generated');

  // 5. Supprimer le document temporaire
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
