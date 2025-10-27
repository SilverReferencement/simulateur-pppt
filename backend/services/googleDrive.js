// Service Google Drive
// Gestion de l'upload des fichiers DPE

const { google } = require('googleapis');
const stream = require('stream');

// Configuration
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

/**
 * Authentification avec Google Drive API
 */
async function getAuthClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: SCOPES,
    });

    return await auth.getClient();
}

/**
 * Obtenir l'instance Google Drive
 */
async function getDriveInstance() {
    const authClient = await getAuthClient();
    return google.drive({ version: 'v3', auth: authClient });
}

/**
 * Upload un fichier vers Google Drive
 * @param {Object} file - Fichier Multer (buffer, mimetype, originalname)
 * @param {String} quoteId - ID du devis pour nommer le fichier
 * @returns {Object} - Informations du fichier uploadé
 */
async function uploadFile(file, quoteId) {
    try {
        const drive = await getDriveInstance();

        // Créer un stream à partir du buffer
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);

        // Nom du fichier avec le quoteId
        const fileName = `${quoteId}_${file.originalname}`;

        // Métadonnées du fichier
        const fileMetadata = {
            name: fileName,
            parents: [DRIVE_FOLDER_ID], // Dossier de destination
        };

        // Configuration de l'upload
        const media = {
            mimeType: file.mimetype,
            body: bufferStream,
        };

        console.log(`Uploading file to Drive: ${fileName}`);

        // Upload vers Drive
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, mimeType, webViewLink, webContentLink, size',
        });

        const uploadedFile = response.data;

        // Rendre le fichier accessible (lecture seule pour tous ceux qui ont le lien)
        await drive.permissions.create({
            fileId: uploadedFile.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        console.log(`File uploaded successfully: ${uploadedFile.id}`);

        return {
            id: uploadedFile.id,
            name: uploadedFile.name,
            mimeType: uploadedFile.mimeType,
            webViewLink: uploadedFile.webViewLink,
            webContentLink: uploadedFile.webContentLink,
            size: uploadedFile.size,
        };

    } catch (error) {
        console.error('Erreur upload Google Drive:', error);
        throw new Error(`Impossible d'uploader le fichier: ${error.message}`);
    }
}

/**
 * Supprimer un fichier de Google Drive
 * @param {String} fileId - ID du fichier à supprimer
 */
async function deleteFile(fileId) {
    try {
        const drive = await getDriveInstance();

        await drive.files.delete({
            fileId: fileId,
        });

        console.log(`File deleted: ${fileId}`);
        return { success: true };

    } catch (error) {
        console.error('Erreur suppression fichier:', error);
        throw new Error(`Impossible de supprimer le fichier: ${error.message}`);
    }
}

/**
 * Obtenir les informations d'un fichier
 * @param {String} fileId - ID du fichier
 */
async function getFileInfo(fileId) {
    try {
        const drive = await getDriveInstance();

        const response = await drive.files.get({
            fileId: fileId,
            fields: 'id, name, mimeType, webViewLink, webContentLink, size, createdTime',
        });

        return response.data;

    } catch (error) {
        console.error('Erreur récupération info fichier:', error);
        throw new Error(`Impossible de récupérer les infos du fichier: ${error.message}`);
    }
}

/**
 * Lister tous les fichiers du dossier
 */
async function listFiles() {
    try {
        const drive = await getDriveInstance();

        const response = await drive.files.list({
            q: `'${DRIVE_FOLDER_ID}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, webViewLink, size, createdTime)',
            orderBy: 'createdTime desc',
        });

        return response.data.files || [];

    } catch (error) {
        console.error('Erreur liste fichiers:', error);
        throw new Error(`Impossible de lister les fichiers: ${error.message}`);
    }
}

module.exports = {
    uploadFile,
    deleteFile,
    getFileInfo,
    listFiles
};
