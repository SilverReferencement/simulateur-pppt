const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const TRACKED_FILES = ['script.js', 'index.html', 'styles.css'];
const OLD_FOLDER = 'OLD';
const CURRENT_DIR = __dirname;

/**
 * Get the next version number for a specific file
 * @param {string} fileName - The file name (e.g., 'script.js')
 */
function getNextVersionNumber(fileName) {
    const oldFolderPath = path.join(CURRENT_DIR, OLD_FOLDER);

    // Ensure OLD folder exists
    if (!fs.existsSync(oldFolderPath)) {
        fs.mkdirSync(oldFolderPath);
        return 1;
    }

    // Extract base name and extension
    const baseName = path.parse(fileName).name;
    const extension = path.extname(fileName);

    // Read all files in OLD folder
    const files = fs.readdirSync(oldFolderPath);

    // Find all files matching pattern (e.g., script_1.js, script_2.js)
    const pattern = new RegExp(`^${baseName}_\\d+\\${extension}$`);
    const numbers = files
        .filter(file => pattern.test(file))
        .map(file => {
            const match = file.match(new RegExp(`${baseName}_(\\d+)\\${extension}`));
            return match ? parseInt(match[1]) : null;
        })
        .filter(num => num !== null);

    // Return next number
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}

/**
 * Get list of modified files using git
 */
function getModifiedFiles() {
    try {
        // Check if git is initialized
        execSync('git status', { cwd: CURRENT_DIR, stdio: 'pipe' });

        // Get modified and untracked files
        const status = execSync('git status --porcelain', {
            cwd: CURRENT_DIR,
            encoding: 'utf-8'
        });

        const modifiedFiles = [];

        status.split('\n').forEach(line => {
            if (!line.trim()) return;

            // Parse git status output
            const statusCode = line.substring(0, 2);
            const fileName = line.substring(3).trim();

            // Check if file is in our tracked files list
            if (TRACKED_FILES.includes(fileName)) {
                // M = modified, A = added, ?? = untracked
                if (statusCode.includes('M') || statusCode.includes('A') || statusCode.includes('?')) {
                    modifiedFiles.push(fileName);
                }
            }
        });

        return modifiedFiles;
    } catch (error) {
        console.log('⚠ Git not initialized or error checking status');
        return [];
    }
}

/**
 * Archive a specific file
 * @param {string} fileName - The file to archive
 */
function archiveFile(fileName) {
    const filePath = path.join(CURRENT_DIR, fileName);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠ ${fileName} not found, skipping...`);
        return false;
    }

    const nextVersion = getNextVersionNumber(fileName);
    const baseName = path.parse(fileName).name;
    const extension = path.extname(fileName);
    const archiveName = `${baseName}_${nextVersion}${extension}`;
    const archivePath = path.join(CURRENT_DIR, OLD_FOLDER, archiveName);

    // Copy file to OLD folder
    fs.copyFileSync(filePath, archivePath);
    console.log(`  ✓ Archived ${fileName} as ${archiveName}`);

    return true;
}

/**
 * Sync changes with GitHub repository
 * @param {string[]} modifiedFiles - List of modified files
 */
function syncWithGitHub(modifiedFiles) {
    if (modifiedFiles.length === 0) {
        console.log('\n✓ No changes to sync with GitHub');
        return;
    }

    try {
        // Check if git is initialized
        execSync('git status', { cwd: CURRENT_DIR, stdio: 'pipe' });

        // Add all modified files
        modifiedFiles.forEach(file => {
            execSync(`git add "${file}"`, { cwd: CURRENT_DIR, stdio: 'pipe' });
        });

        // Create commit message
        const timestamp = new Date().toISOString();
        const filesList = modifiedFiles.join(', ');
        const commitMessage = `Update ${filesList} - ${timestamp}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

        // Commit and push
        execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
            cwd: CURRENT_DIR,
            stdio: 'pipe'
        });
        execSync('git push', { cwd: CURRENT_DIR, stdio: 'pipe' });

        console.log('\n✓ Successfully synced with GitHub repository');
        console.log(`  Files updated: ${filesList}`);

    } catch (error) {
        const errorMessage = error.message || '';

        // Check if error is because there's nothing to commit
        if (errorMessage.includes('nothing to commit')) {
            console.log('\n✓ Repository already up to date');
            return;
        }

        console.log('\n⚠ Git sync failed. Error:', error.message);
        console.log('\nTo enable GitHub sync:');
        console.log('  1. Initialize git: git init');
        console.log('  2. Add remote: git remote add origin https://github.com/SilverReferencement/simulateur-pppt.git');
        console.log('  3. Configure credentials');
    }
}

/**
 * Main execution
 */
function main() {
    console.log('=== Automatic Archive and Sync System ===\n');
    console.log('📂 Tracked files:', TRACKED_FILES.join(', '));
    console.log('🔍 Checking for modifications...\n');

    // Get list of modified files
    const modifiedFiles = getModifiedFiles();

    if (modifiedFiles.length === 0) {
        console.log('✓ No modified files detected');
        console.log('  All tracked files are up to date\n');
        console.log('=== Process Complete ===');
        return;
    }

    console.log(`📝 Found ${modifiedFiles.length} modified file(s):`);
    modifiedFiles.forEach(file => console.log(`  - ${file}`));
    console.log('\n📦 Archiving modified files...\n');

    // Archive each modified file
    let archivedCount = 0;
    modifiedFiles.forEach(file => {
        if (archiveFile(file)) {
            archivedCount++;
        }
    });

    console.log(`\n✓ Archived ${archivedCount} file(s) to ${OLD_FOLDER}/ folder`);

    // Sync with GitHub
    console.log('\n🚀 Syncing with GitHub...');
    syncWithGitHub(modifiedFiles);

    console.log('\n=== Process Complete ===');
}

// Run main function
main();
