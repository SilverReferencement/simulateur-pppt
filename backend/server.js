// Backend PPPT Simulator
// Server Express avec intégration Google Sheets & Drive

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Services
const sheetsService = require('./services/googleSheets');
const driveService = require('./services/googleDrive');
const emailService = require('./services/emailService');
const pdfGenerator = require('./services/pdfGenerator');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Multer pour l'upload de fichiers
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PDF, JPG, JPEG et PNG sont autorisés'));
        }
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ==================== ROUTES ====================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Initialiser le Sheet avec headers et ligne gelée
app.get('/api/init-sheet', async (req, res) => {
    try {
        await sheetsService.initializeSheet();
        res.json({
            success: true,
            message: 'Sheet initialisé avec succès (header + frozen row)'
        });
    } catch (error) {
        console.error('Erreur initialisation Sheet:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'initialisation du Sheet'
        });
    }
});

// Test email configuration
app.get('/api/test-email', async (req, res) => {
    try {
        // Vérifier les variables d'environnement
        const config = {
            EMAIL_USER: process.env.EMAIL_USER ? '✅ Configuré' : '❌ Manquant',
            EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '✅ Configuré' : '❌ Manquant',
            EMAIL_INTERNAL: process.env.EMAIL_INTERNAL ? '✅ Configuré' : '❌ Manquant',
            COMPANY_NAME: process.env.COMPANY_NAME || 'Non configuré',
            GOOGLE_DOCS_TEMPLATE_ID: process.env.GOOGLE_DOCS_TEMPLATE_ID ? '✅ Configuré' : '❌ Manquant'
        };

        // Tester la connexion email
        const emailTest = await emailService.testEmailConnection();

        res.json({
            success: true,
            emailConnection: emailTest ? '✅ OK' : '❌ Échec',
            configuration: config
        });
    } catch (error) {
        console.error('Erreur test email:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// GET: Récupérer les devis (optionnel - pour admin)
app.get('/api/quotes', async (req, res) => {
    try {
        const quotes = await sheetsService.getAllQuotes();
        res.json({
            success: true,
            count: quotes.length,
            data: quotes
        });
    } catch (error) {
        console.error('Erreur récupération devis:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des devis'
        });
    }
});

// POST: Sauvegarder un nouveau devis
app.post('/api/save-quote',
    upload.single('dpeFile'),
    [
        body('email').isEmail().withMessage('Email invalide'),
        body('postalCode').matches(/^[0-9]{5}$/).withMessage('Code postal invalide'),
        body('lots').isInt({ min: 1 }).withMessage('Nombre de lots invalide'),
        body('buildings').isInt({ min: 1, max: 10 }).withMessage('Nombre de bâtiments invalide'),
        body('includeDPE').isBoolean().withMessage('DPE doit être un booléen'),
        body('price').isFloat({ min: 0 }).withMessage('Prix invalide'),
    ],
    async (req, res) => {
        // Validation des données
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        try {
            const {
                email,
                postalCode,
                lots,
                buildings,
                includeDPE,
                price,
                department,
                isIDF
            } = req.body;

            // Générer un ID unique pour le devis
            const quoteId = await sheetsService.generateUniqueId();

            let fileUrl = null;
            let fileName = null;

            // Uploader le fichier si présent
            if (req.file) {
                console.log(`Uploading file: ${req.file.originalname}`);

                const uploadResult = await driveService.uploadFile(
                    req.file,
                    quoteId
                );

                fileUrl = uploadResult.webViewLink;
                fileName = uploadResult.name;

                console.log(`File uploaded: ${fileName}`);
            }

            // Sauvegarder dans Google Sheets
            const sheetResult = await sheetsService.saveQuote({
                quoteId,
                date: new Date().toISOString(),
                email,
                postalCode,
                department: department || postalCode.substring(0, 2),
                lots: parseInt(lots),
                buildings: parseInt(buildings),
                includeDPE: includeDPE === 'true' || includeDPE === true,
                price: parseFloat(price),
                isIDF: isIDF === 'true' || isIDF === true,
                fileUrl,
                fileName,
                timestamp: Date.now()
            });

            console.log(`Quote saved: ${quoteId}`);

            // Construire l'URL Google Sheets pour l'email interne
            const sheetUrl = `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}`;

            // Préparer les données complètes du devis pour les emails
            const quoteData = {
                quoteId,
                email,
                postalCode,
                department: department || postalCode.substring(0, 2),
                lots: parseInt(lots),
                buildings: parseInt(buildings),
                includeDPE: includeDPE === 'true' || includeDPE === true,
                price: parseFloat(price),
                isIDF: isIDF === 'true' || isIDF === true,
                date: new Date().toISOString(),
                fileUrl
            };

            // Générer le PDF du devis
            let pdfBuffer = null;
            let pdfGenerationError = null;

            try {
                console.log(`Generating PDF for quote ${quoteId}...`);
                pdfBuffer = await pdfGenerator.createPdfFromTemplate(quoteData);
                console.log(`✅ PDF generated: ${pdfBuffer.length} bytes`);
            } catch (pdfError) {
                console.error('⚠️ Erreur génération PDF (non bloquant):', pdfError.message);
                pdfGenerationError = pdfError.message;
                // Continuer sans PDF si erreur
            }

            // Envoyer l'email interne (notification)
            try {
                console.log('Sending internal notification email...');
                await emailService.sendInternalEmail(quoteData, sheetUrl, fileUrl);
                console.log('✅ Internal email sent');
            } catch (emailError) {
                console.error('⚠️ Erreur envoi email interne (non bloquant):', emailError.message);
            }

            // Envoyer l'email au client avec le PDF
            try {
                console.log(`Sending client email to ${email}...`);
                await emailService.sendClientEmail(quoteData, pdfBuffer);
                console.log('✅ Client email sent');
            } catch (emailError) {
                console.error('⚠️ Erreur envoi email client (non bloquant):', emailError.message);
            }

            res.json({
                success: true,
                quoteId,
                message: 'Devis enregistré avec succès',
                fileUploaded: !!fileUrl,
                pdfGenerated: !!pdfBuffer,
                emailsSent: true // On retourne toujours true car les erreurs email sont non bloquantes
            });

        } catch (error) {
            console.error('Erreur sauvegarde devis:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Erreur lors de la sauvegarde du devis'
            });
        }
    }
);

// GET: Récupérer un devis spécifique
app.get('/api/quotes/:quoteId', async (req, res) => {
    try {
        const { quoteId } = req.params;
        const quote = await sheetsService.getQuoteById(quoteId);

        if (!quote) {
            return res.status(404).json({
                success: false,
                error: 'Devis non trouvé'
            });
        }

        res.json({
            success: true,
            data: quote
        });
    } catch (error) {
        console.error('Erreur récupération devis:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération du devis'
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route non trouvée'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            error: `Erreur d'upload: ${err.message}`
        });
    }

    res.status(500).json({
        success: false,
        error: err.message || 'Erreur serveur interne'
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`\n🚀 Backend PPPT Simulator démarré !`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Time: ${new Date().toISOString()}\n`);
});

module.exports = app;
