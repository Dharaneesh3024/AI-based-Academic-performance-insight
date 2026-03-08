const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
    const ext = path.extname(filePath);
    if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) return;
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('useState')) {
            const lines = content.split('\n');
            const hasImport = lines.some(line => line.includes('import') && line.includes('useState') && line.includes('react'));
            if (!hasImport) {
                console.log('MISSING IMPORT in:', filePath);
            }
        }
    } catch (e) { }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === 'dist' || file === '.git') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else {
            checkFile(fullPath);
        }
    }
}

walk('d:/AI-insight/Frontend/src');
console.log('Script done.');
