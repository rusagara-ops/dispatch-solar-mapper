import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const serverRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const sitesPath = join(serverRoot, 'data', 'sites.json');

let cache;

function loadSites() {
  if (!cache) {
    const raw = readFileSync(sitesPath, 'utf-8');
    cache = JSON.parse(raw);
  }
  return cache;
}

export function listSites() {
  return loadSites();
}

export function getSiteById(id) {
  return loadSites().find((s) => s.id === id) ?? null;
}
