import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const engineBaseUrl = (process.env.AIDEN_ENGINE_BASE_URL ?? '').trim().replace(/\/+$/, '');
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const outputPath = path.join(repoRoot, 'config.js');

const content = `window.AIDEN_CONFIG = Object.assign({}, window.AIDEN_CONFIG, {
  engineBaseUrl: ${JSON.stringify(engineBaseUrl)},
});
`;

fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Wrote ${outputPath} with engineBaseUrl=${engineBaseUrl || '(empty)'}`);
