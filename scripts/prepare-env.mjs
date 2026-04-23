import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const envFilePath = path.join(rootDir, '.env');

const defaults = {
  FRONTEND_BACKEND_BASE_URL_DEV: 'http://localhost:8000',
  FRONTEND_BACKEND_BASE_URL_PROD: 'https://pasameloaexcel-core-production.up.railway.app',
};

function parseEnvFile(rawContent) {
  const output = {};
  const lines = rawContent.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    output[key] = value;
  }

  return output;
}

function resolveConfigValue(key, parsedEnv) {
  const processValue = process.env[key];
  if (processValue && processValue.trim()) {
    return processValue.trim();
  }

  const fileValue = parsedEnv[key];
  if (fileValue && fileValue.trim()) {
    return fileValue.trim();
  }

  return defaults[key];
}

function buildEnvironmentFileContent(production, backendBaseUrl) {
  return (
    `export const environment = {\n` +
    `  production: ${production},\n` +
    `  backendBaseUrl: ${JSON.stringify(backendBaseUrl)},\n` +
    `};\n`
  );
}

function writeEnvironmentFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

const parsedEnv = fs.existsSync(envFilePath)
  ? parseEnvFile(fs.readFileSync(envFilePath, 'utf8'))
  : {};

const backendDevUrl = resolveConfigValue('FRONTEND_BACKEND_BASE_URL_DEV', parsedEnv);
const backendProdUrl = resolveConfigValue('FRONTEND_BACKEND_BASE_URL_PROD', parsedEnv);

const environmentPath = path.join(rootDir, 'src', 'environments', 'environment.ts');
const environmentProdPath = path.join(rootDir, 'src', 'environments', 'environment.prod.ts');

writeEnvironmentFile(environmentPath, buildEnvironmentFileContent(false, backendDevUrl));
writeEnvironmentFile(environmentProdPath, buildEnvironmentFileContent(true, backendProdUrl));

console.log(`[prepare:env] environment.ts -> ${backendDevUrl}`);
console.log(`[prepare:env] environment.prod.ts -> ${backendProdUrl}`);
