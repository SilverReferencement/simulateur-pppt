// Test SendGrid
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

async function testSendGrid() {
    console.log('\n🔍 Test SendGrid...\n');

    // Vérifier la clé API
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
        console.error('❌ SENDGRID_API_KEY non défini');
        process.exit(1);
    }

    console.log('✅ SENDGRID_API_KEY:', apiKey.substring(0, 15) + '...');
    console.log('✅ EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('✅ EMAIL_INTERNAL:', process.env.EMAIL_INTERNAL);

    // Configurer SendGrid
    sgMail.setApiKey(apiKey);

    // Préparer l'email de test
    const msg = {
        to: process.env.EMAIL_INTERNAL,
        from: {
            email: process.env.EMAIL_FROM,
            name: process.env.COMPANY_NAME
        },
        subject: '🧪 Test SendGrid - Atlas PPPT',
        html: `
            <h2>✅ Test réussi !</h2>
            <p>La configuration SendGrid fonctionne correctement.</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
            <p><strong>Configuration:</strong></p>
            <ul>
                <li>FROM: ${process.env.EMAIL_FROM}</li>
                <li>TO: ${process.env.EMAIL_INTERNAL}</li>
                <li>Company: ${process.env.COMPANY_NAME}</li>
            </ul>
        `
    };

    console.log('\n📨 Envoi de l\'email de test...');
    console.log('   De:', msg.from.email);
    console.log('   À:', msg.to);
    console.log('   Sujet:', msg.subject);

    try {
        await sgMail.send(msg);
        console.log('\n✅ EMAIL ENVOYÉ AVEC SUCCÈS !');
        console.log('   Vérifiez votre boîte mail:', process.env.EMAIL_INTERNAL);
        console.log('\n🎉 SENDGRID FONCTIONNE PARFAITEMENT !');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        if (error.response) {
            console.error('\nDétails:', error.response.body);
        }
        process.exit(1);
    }
}

testSendGrid();
