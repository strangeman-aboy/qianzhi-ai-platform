const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || 'dist/member-demo');
const port = Number(process.argv[3] || 8120);
const host = '127.0.0.1';
const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.txt': 'text/plain; charset=utf-8'
};

function resolveRequestPath(url) {
    const pathname = decodeURIComponent((url || '/').split('?')[0]);
    const normalized = path.normalize(pathname).replace(/^[/\\]+/, '');
    const safePath = normalized === '.' ? 'index.html' : normalized || 'index.html';
    const filePath = path.resolve(root, safePath);
    const relative = path.relative(root, filePath);
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative) ? filePath : null;
}

const server = http.createServer((request, response) => {
    const filePath = resolveRequestPath(request.url);
    if (!filePath) {
        response.writeHead(403);
        response.end('forbidden');
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            response.writeHead(404);
            response.end('not found');
            return;
        }

        response.writeHead(200, {
            'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream'
        });
        response.end(data);
    });
});

server.listen(port, host, () => {
    console.log(`Serving ${root} at http://${host}:${port}`);
});
