import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT) || 8080;
const distDir = join(process.cwd(), 'dist', 'pasamelo-front');
const indexFilePath = join(distDir, 'index.html');

const mimeByExtension = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!existsSync(indexFilePath)) {
  console.error('No se encontro dist/pasamelo-front/index.html. Ejecuta "npm run build" antes de "npm start".');
  process.exit(1);
}

function streamFile(filePath, response) {
  const extension = extname(filePath).toLowerCase();
  const mimeType = mimeByExtension[extension] || 'application/octet-stream';
  response.statusCode = 200;
  response.setHeader('Content-Type', mimeType);
  createReadStream(filePath).pipe(response);
}

function resolveSafePath(basePath, requestedPath) {
  const sanitizedPath = requestedPath.replace(/^\/+/, '');
  const resolvedPath = normalize(join(basePath, sanitizedPath));

  if (!resolvedPath.startsWith(basePath)) {
    return null;
  }

  return resolvedPath;
}

createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  const requestedPath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
  const safePath = resolveSafePath(distDir, requestedPath);

  if (safePath && existsSync(safePath) && statSync(safePath).isFile()) {
    streamFile(safePath, response);
    return;
  }

  streamFile(indexFilePath, response);
}).listen(port, '0.0.0.0', () => {
  console.log(`Servidor web listo en http://0.0.0.0:${port}`);
});
