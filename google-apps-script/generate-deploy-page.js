const fs = require('fs');
const path = require('path');

console.log('🔧 Génération de la page de déploiement...\n');

// Lire le code Apps Script
const codePath = path.join(__dirname, 'Code.js');
const code = fs.readFileSync(codePath, 'utf8');

// Lire le template HTML
const templatePath = path.join(__dirname, 'deploy-helper.html');
let html = fs.readFileSync(templatePath, 'utf8');

// Échapper les backticks et backslashes pour JavaScript
const escapedCode = code
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

// Injecter le code dans le HTML
html = html.replace('CODE_PLACEHOLDER', escapedCode);

// Écrire le fichier final
const outputPath = path.join(__dirname, 'deploy.html');
fs.writeFileSync(outputPath, html, 'utf8');

console.log('✅ Page de déploiement générée : deploy.html');
console.log('📊 Taille du code : ' + (code.length / 1024).toFixed(2) + ' KB');
console.log('\n🚀 Ouvrez deploy.html dans votre navigateur pour déployer !\n');
