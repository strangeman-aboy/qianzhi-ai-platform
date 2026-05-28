const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distRoot = path.join(rootDir, 'dist');
const outputDir = path.join(distRoot, 'member-demo');
const requiredEntries = [
    'index.html',
    'styles',
    'scripts',
    'images'
];

function assertInside(parent, child) {
    const relative = path.relative(parent, child);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`Unsafe output path: ${child}`);
    }
}

function copyRecursive(source, target) {
    const stat = fs.statSync(source);
    if (stat.isDirectory()) {
        fs.mkdirSync(target, { recursive: true });
        for (const entry of fs.readdirSync(source)) {
            copyRecursive(path.join(source, entry), path.join(target, entry));
        }
        return;
    }

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
}

function writeRobotsTxt() {
    const content = [
        'User-agent: *',
        'Disallow: /',
        ''
    ].join('\n');
    fs.writeFileSync(path.join(outputDir, 'robots.txt'), content, 'utf8');
}

function build() {
    assertInside(rootDir, outputDir);
    assertInside(distRoot, outputDir);

    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir, { recursive: true });

    for (const entry of requiredEntries) {
        const source = path.join(rootDir, entry);
        const target = path.join(outputDir, entry);
        if (!fs.existsSync(source)) {
            throw new Error(`Missing required demo asset: ${entry}`);
        }
        copyRecursive(source, target);
    }

    writeRobotsTxt();

    console.log(`Member demo built at ${path.relative(rootDir, outputDir)}`);
    console.log('Publish only this directory. Do not publish server.py, data/, docs/, or tools/.');
}

build();
