// Test de la configuration email en local
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('\n🔍 Test de configuration email...\n');

    // Vérifier les variables
    console.log('Variables d\'environnement:');
    console.log('  EMAIL_USER:', process.env.EMAIL_USER || '❌ NON DÉFINI');
    console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Défini (masqué)' : '❌ NON DÉFINI');
    console.log('  EMAIL_INTERNAL:', process.env.EMAIL_INTERNAL || '❌ NON DÉFINI');
    console.log('  COMPANY_NAME:', process.env.COMPANY_NAME || '❌ NON DÉFINI');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('\n❌ Variables manquantes !');
        process.exit(1);
    }

    // Créer le transporteur
    console.log('\n📧 Création du transporteur Gmail...');
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Test de connexion
    try {
        console.log('🔌 Test de connexion...');
        await transporter.verify();
        console.log('✅ Connexion Gmail OK !');
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        console.error('\nDétails:', error);
        process.exit(1);
    }

    // Envoi d'un email de test
    try {
        console.log('\n📨 Envoi d\'un email de test...');
        const info = await transporter.sendMail({
            from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_INTERNAL,
            subject: '🧪 Test - Configuration Email Backend PPPT',
            html: `
                <h2>Test réussi !</h2>
                <p>La configuration email fonctionne correctement.</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
            `
        });

        console.log('✅ Email envoyé avec succès !');
        console.log('   Message ID:', info.messageId);
        console.log('   Destinataire:', process.env.EMAIL_INTERNAL);
        console.log('\n✅ TOUT FONCTIONNE !');

    } catch (error) {
        console.error('❌ Erreur d\'envoi:', error.message);
        console.error('\nDétails:', error);
        process.exit(1);
    }

    process.exit(0);
}

testEmail();
