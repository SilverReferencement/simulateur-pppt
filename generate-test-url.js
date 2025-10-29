/**
 * Générateur d'URL de test pour le chargement de devis
 * Execute: node generate-test-url.js
 */

// Données de test pour DEVIS-1692
const testQuoteData = {
    id: 'DEVIS-1692',
    uf: 'Jean',
    ul: 'Dupont',
    e: 'jean.dupont@example.com',
    p: '06 12 34 56 78',
    pc: '75001',
    pa: '123 Rue de la Paix',
    l: 50,
    b: 2,
    d: '1', // includeDPE
    dd: '2023-01-15',
    pr: '5000',
    ip: '0', // isPresident
    pf: 'Marie',
    pl: 'Martin',
    pe: 'marie.martin@example.com',
    pp: '06 98 76 54 32',
    cm: JSON.stringify([
        {
            firstname: 'Pierre',
            lastname: 'Durand',
            email: 'pierre@example.com',
            phone: '06 11 22 33 44'
        }
    ]),
    ag: '2024-06-01',
    c: 'Commentaire de test'
};

// Encoder en base64
const encoded = Buffer.from(JSON.stringify(testQuoteData)).toString('base64');

// Générer les URLs
const vercelUrl = `https://simulateur-pppt.vercel.app/?data=${encoded}`;
const webflowUrl = `https://atlas-pppt.webflow.io/simulateur-pppt?data=${encoded}`;

console.log('\n🔗 URLs DE TEST GÉNÉRÉES:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📍 URL Vercel (directe):');
console.log(vercelUrl);
console.log('\n');

console.log('📍 URL Webflow (avec iframe):');
console.log(webflowUrl);
console.log('\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ DONNÉES DU DEVIS TEST:');
console.log('   - ID: DEVIS-1692');
console.log('   - Client: Jean Dupont');
console.log('   - Email: jean.dupont@example.com');
console.log('   - Téléphone: 06 12 34 56 78');
console.log('   - Code Postal: 75001');
console.log('   - Adresse: 123 Rue de la Paix');
console.log('   - Lots: 50');
console.log('   - Immeubles: 2');
console.log('   - DPE: Oui');
console.log('   - Prix: 5000€');
console.log('   - Président: Marie Martin');
console.log('   - Membres conseil: 1');
console.log('\n');

console.log('🧪 COMMENT TESTER:\n');
console.log('1. Copie l\'URL Vercel ci-dessus');
console.log('2. Ouvre-la dans un navigateur');
console.log('3. Ouvre la console (F12)');
console.log('4. Vérifie les logs: "Loading quote from encoded data"');
console.log('5. Vérifie que tous les champs sont pré-remplis');
console.log('\n');

console.log('🎯 POUR WEBFLOW:\n');
console.log('1. Copie l\'URL Webflow ci-dessus');
console.log('2. Ouvre-la dans un navigateur');
console.log('3. Le simulateur doit se charger dans l\'iframe');
console.log('4. Tous les champs doivent être pré-remplis');
console.log('\n');
