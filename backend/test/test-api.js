// Test Script pour l'API Backend PPPT
// Teste tous les endpoints de l'API

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_FILE_PATH = path.join(__dirname, 'test-dpe.pdf'); // Optionnel

// Couleurs pour le terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

// Fonction helper pour les requêtes HTTP
function request(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

// Fonction helper pour les requêtes multipart/form-data
function multipartRequest(url, fields = {}, file = null) {
    return new Promise((resolve, reject) => {
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36);
        const protocol = url.startsWith('https') ? https : http;

        let body = '';

        // Ajouter les champs texte
        for (const [key, value] of Object.entries(fields)) {
            body += `--${boundary}\r\n`;
            body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
            body += `${value}\r\n`;
        }

        // Ajouter le fichier si présent
        if (file && fs.existsSync(file)) {
            const fileData = fs.readFileSync(file);
            const fileName = path.basename(file);
            body += `--${boundary}\r\n`;
            body += `Content-Disposition: form-data; name="dpeFile"; filename="${fileName}"\r\n`;
            body += `Content-Type: application/pdf\r\n\r\n`;
            body += fileData.toString('binary') + '\r\n';
        }

        body += `--${boundary}--\r\n`;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = protocol.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        req.write(body, 'binary');
        req.end();
    });
}

// Fonctions de test
async function testHealthCheck() {
    console.log(`\n${colors.cyan}[TEST 1] Health Check${colors.reset}`);
    try {
        const result = await request(`${API_BASE_URL}/health`);
        if (result.status === 200 && result.data.status === 'ok') {
            console.log(`${colors.green}✓ Health check passed${colors.reset}`);
            console.log(`  Status: ${result.data.status}`);
            console.log(`  Timestamp: ${result.data.timestamp}`);
            console.log(`  Environment: ${result.data.environment}`);
            return true;
        } else {
            console.log(`${colors.red}✗ Health check failed${colors.reset}`);
            console.log(`  Status code: ${result.status}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
        return false;
    }
}

async function testGetAllQuotes() {
    console.log(`\n${colors.cyan}[TEST 2] Get All Quotes${colors.reset}`);
    try {
        const result = await request(`${API_BASE_URL}/api/quotes`);
        if (result.status === 200 && result.data.success) {
            console.log(`${colors.green}✓ Get all quotes passed${colors.reset}`);
            console.log(`  Total quotes: ${result.data.count}`);
            if (result.data.count > 0) {
                console.log(`  Latest quote: ${JSON.stringify(result.data.data[0], null, 2)}`);
            }
            return true;
        } else {
            console.log(`${colors.red}✗ Get all quotes failed${colors.reset}`);
            console.log(`  Status code: ${result.status}`);
            console.log(`  Response: ${JSON.stringify(result.data)}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
        return false;
    }
}

async function testSaveQuoteWithoutFile() {
    console.log(`\n${colors.cyan}[TEST 3] Save Quote (without file)${colors.reset}`);
    try {
        const testData = {
            email: `test${Date.now()}@example.com`,
            postalCode: '75001',
            lots: '50',
            buildings: '1',
            includeDPE: 'true',
            price: '1990',
            department: '75',
            isIDF: 'true'
        };

        const result = await multipartRequest(`${API_BASE_URL}/api/save-quote`, testData);

        if (result.status === 200 && result.data.success) {
            console.log(`${colors.green}✓ Save quote passed${colors.reset}`);
            console.log(`  Quote ID: ${result.data.quoteId}`);
            console.log(`  File uploaded: ${result.data.fileUploaded}`);
            return result.data.quoteId;
        } else {
            console.log(`${colors.red}✗ Save quote failed${colors.reset}`);
            console.log(`  Status code: ${result.status}`);
            console.log(`  Response: ${JSON.stringify(result.data, null, 2)}`);
            return null;
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
        return null;
    }
}

async function testSaveQuoteWithFile() {
    console.log(`\n${colors.cyan}[TEST 4] Save Quote (with file)${colors.reset}`);

    if (!fs.existsSync(TEST_FILE_PATH)) {
        console.log(`${colors.yellow}⊘ Skipped (no test file at ${TEST_FILE_PATH})${colors.reset}`);
        return null;
    }

    try {
        const testData = {
            email: `test-file${Date.now()}@example.com`,
            postalCode: '92100',
            lots: '100',
            buildings: '2',
            includeDPE: 'true',
            price: '2990',
            department: '92',
            isIDF: 'true'
        };

        const result = await multipartRequest(`${API_BASE_URL}/api/save-quote`, testData, TEST_FILE_PATH);

        if (result.status === 200 && result.data.success) {
            console.log(`${colors.green}✓ Save quote with file passed${colors.reset}`);
            console.log(`  Quote ID: ${result.data.quoteId}`);
            console.log(`  File uploaded: ${result.data.fileUploaded}`);
            return result.data.quoteId;
        } else {
            console.log(`${colors.red}✗ Save quote with file failed${colors.reset}`);
            console.log(`  Status code: ${result.status}`);
            console.log(`  Response: ${JSON.stringify(result.data, null, 2)}`);
            return null;
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
        return null;
    }
}

async function testGetQuoteById(quoteId) {
    console.log(`\n${colors.cyan}[TEST 5] Get Quote by ID${colors.reset}`);

    if (!quoteId) {
        console.log(`${colors.yellow}⊘ Skipped (no quote ID to test)${colors.reset}`);
        return false;
    }

    try {
        const result = await request(`${API_BASE_URL}/api/quotes/${quoteId}`);

        if (result.status === 200 && result.data.success) {
            console.log(`${colors.green}✓ Get quote by ID passed${colors.reset}`);
            console.log(`  Quote data: ${JSON.stringify(result.data.data, null, 2)}`);
            return true;
        } else {
            console.log(`${colors.red}✗ Get quote by ID failed${colors.reset}`);
            console.log(`  Status code: ${result.status}`);
            console.log(`  Response: ${JSON.stringify(result.data)}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
        return false;
    }
}

async function testInvalidRequest() {
    console.log(`\n${colors.cyan}[TEST 6] Invalid Request (validation)${colors.reset}`);
    try {
        const invalidData = {
            email: 'invalid-email', // Email invalide
            postalCode: '123', // Code postal invalide
            lots: '-5', // Négatif
            buildings: '15', // Trop élevé
            includeDPE: 'maybe', // Pas un booléen
            price: 'abc' // Pas un nombre
        };

        const result = await multipartRequest(`${API_BASE_URL}/api/save-quote`, invalidData);

        if (result.status === 400) {
            console.log(`${colors.green}✓ Validation test passed (correctly rejected)${colors.reset}`);
            console.log(`  Errors caught: ${result.data.errors ? result.data.errors.length : 'N/A'}`);
            return true;
        } else {
            console.log(`${colors.red}✗ Validation test failed (should have rejected)${colors.reset}`);
            console.log(`  Status code: ${result.status}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
        return false;
    }
}

async function test404() {
    console.log(`\n${colors.cyan}[TEST 7] 404 Handler${colors.reset}`);
    try {
        const result = await request(`${API_BASE_URL}/non-existent-route`);
        if (result.status === 404) {
            console.log(`${colors.green}✓ 404 handler passed${colors.reset}`);
            return true;
        } else {
            console.log(`${colors.red}✗ 404 handler failed${colors.reset}`);
            console.log(`  Expected 404, got: ${result.status}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
        return false;
    }
}

// Exécution des tests
async function runAllTests() {
    console.log(`${colors.bright}${colors.blue}
╔═══════════════════════════════════════════════════╗
║   PPPT Backend API - Test Suite                  ║
║   Target: ${API_BASE_URL.padEnd(36)}║
╚═══════════════════════════════════════════════════╝
${colors.reset}`);

    const results = [];

    // Test 1: Health Check
    results.push(await testHealthCheck());

    // Test 2: Get All Quotes
    results.push(await testGetAllQuotes());

    // Test 3: Save Quote (without file)
    const quoteId = await testSaveQuoteWithoutFile();
    results.push(quoteId !== null);

    // Test 4: Save Quote (with file)
    const quoteIdWithFile = await testSaveQuoteWithFile();
    results.push(quoteIdWithFile !== null);

    // Test 5: Get Quote by ID
    results.push(await testGetQuoteById(quoteId || quoteIdWithFile));

    // Test 6: Invalid Request
    results.push(await testInvalidRequest());

    // Test 7: 404 Handler
    results.push(await test404());

    // Résumé
    const passed = results.filter(r => r === true).length;
    const failed = results.filter(r => r === false).length;
    const total = results.length;

    console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}Test Summary:${colors.reset}`);
    console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`  Total: ${total}`);
    console.log(`  Success Rate: ${((passed / total) * 100).toFixed(2)}%`);
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);

    if (failed === 0) {
        console.log(`${colors.green}${colors.bright}✅ All tests passed!${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`${colors.red}${colors.bright}❌ Some tests failed.${colors.reset}\n`);
        process.exit(1);
    }
}

// Lancer les tests
runAllTests().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
});
