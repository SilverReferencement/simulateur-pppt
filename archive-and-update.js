const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SCRIPT_FILE = 'script.js';
const OLD_FOLDER = 'OLD';
const CURRENT_DIR = __dirname;

/**
 * Get the next version number by checking existing files in OLD folder
 */
function getNextVersionNumber() {
    const oldFolderPath = path.join(CURRENT_DIR, OLD_FOLDER);

    // Ensure OLD folder exists
    if (!fs.existsSync(oldFolderPath)) {
        fs.mkdirSync(oldFolderPath);
        return 1;
    }

    // Read all files in OLD folder
    const files = fs.readdirSync(oldFolderPath);

    // Find all script_*.js files and extract numbers
    const numbers = files
        .filter(file => file.match(/^script_\d+\.js$/))
        .map(file => parseInt(file.match(/script_(\d+)\.js/)[1]))
        .filter(num => !isNaN(num));

    // Return next number
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}

/**
 * Archive the current script.js file
 */
function archiveCurrentScript() {
    const scriptPath = path.join(CURRENT_DIR, SCRIPT_FILE);

    if (!fs.existsSync(scriptPath)) {
        console.log(`No ${SCRIPT_FILE} found to archive.`);
        return false;
    }

    const nextVersion = getNextVersionNumber();
    const archiveName = `script_${nextVersion}.js`;
    const archivePath = path.join(CURRENT_DIR, OLD_FOLDER, archiveName);

    // Copy current script to OLD folder
    fs.copyFileSync(scriptPath, archivePath);
    console.log(`✓ Archived ${SCRIPT_FILE} as ${archiveName}`);

    return true;
}

/**
 * Sync with GitHub repository (optional)
 */
function syncWithGitHub() {
    const scriptPath = path.join(CURRENT_DIR, SCRIPT_FILE);

    if (!fs.existsSync(scriptPath)) {
        console.log('No script.js to sync with GitHub.');
        return;
    }

    try {
        // Check if git is initialized
        execSync('git status', { cwd: CURRENT_DIR, stdio: 'pipe' });

        // Add, commit and push
        execSync(`git add ${SCRIPT_FILE}`, { cwd: CURRENT_DIR });
        const timestamp = new Date().toISOString();
        execSync(`git commit -m "Update script.js - ${timestamp}"`, { cwd: CURRENT_DIR });
        execSync('git push', { cwd: CURRENT_DIR });

        console.log('✓ Synced with GitHub repository');
    } catch (error) {
        console.log('⚠ Git sync not configured or failed. To enable GitHub sync:');
        console.log('  1. Initialize git: git init');
        console.log('  2. Add remote: git remote add origin https://github.com/SilverReferencement/simulateur-pppt.git');
        console.log('  3. Configure credentials');
    }
}

// Main execution
console.log('=== Script Archive and Update System ===\n');

// Archive current version
archiveCurrentScript();

// Attempt to sync with GitHub
syncWithGitHub();

console.log('\n=== Process Complete ===');
