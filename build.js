// Cloudflare Pages build step — data/routes/ klasörünü tarar, data/manifest.json üretir.
// Bagimliligi yok; sadece Node.js. Cloudflare build command: node build.js
const fs = require('fs');
const path = require('path');

const routesDir = path.join('data', 'routes');
const out = path.join('data', 'manifest.json');

let files = [];
try {
  files = fs.readdirSync(routesDir).filter(f => f.toLowerCase().endsWith('.json'));
} catch (e) {
  console.error('data/routes/ bulunamadi:', e.message);
  process.exit(1);
}

const valid = [];
for (const f of files) {
  try {
    const obj = JSON.parse(fs.readFileSync(path.join(routesDir, f), 'utf8'));
    if (obj && obj.id && Array.isArray(obj.stops)) valid.push(f);
    else console.warn('atlandi (id/stops eksik):', f);
  } catch (e) {
    console.warn('atlandi (bozuk JSON):', f);
  }
}

valid.sort((a, b) => {
  const na = parseInt(a, 10), nb = parseInt(b, 10);
  if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
  return a.localeCompare(b);
});

fs.writeFileSync(out, JSON.stringify(valid, null, 1));
console.log(`manifest.json olusturuldu — ${valid.length} rota: ${valid.join(', ')}`);
