import crypto from 'node:crypto';
import { list, put, del } from '@vercel/blob';

const CATALOG_PREFIX = 'catalog/';
const KEEP_VERSIONS = 10;

export const CATEGORIES = [
  'Whey Protein', 'Creatina', 'Pré-Treino', 'Hipercalórico',
  'Aminoácidos', 'Vitaminas', 'Barra Proteica',
];

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest();
}

// Compara a senha enviada com ADMIN_PASSWORD (variável de ambiente na Vercel).
export function isAuthorized(req) {
  const expected = process.env.ADMIN_PASSWORD;
  const given = req.headers['x-admin-password'];
  if (!expected || typeof given !== 'string' || !given) return false;
  return crypto.timingSafeEqual(digest(given), digest(expected));
}

export function requireAdmin(req, res) {
  if (isAuthorized(req)) return true;
  res.status(401).json({ error: 'Senha incorreta.' });
  return false;
}

// Cada salvamento vira um arquivo novo (catalog/<data>-<sufixo>.json), então a
// CDN nunca entrega uma versão antiga. Guardamos as últimas versões como backup.
async function catalogVersions() {
  const { blobs } = await list({ prefix: CATALOG_PREFIX, limit: 1000 });
  return blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

export async function readCatalog() {
  const versions = await catalogVersions();
  if (!versions.length) return null;
  const r = await fetch(versions[0].url, { cache: 'no-store' });
  if (!r.ok) throw new Error('Falha ao ler o catálogo: ' + r.status);
  return r.json();
}

export async function writeCatalog(catalog) {
  const body = JSON.stringify(catalog);
  const name = CATALOG_PREFIX + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
  await put(name, body, {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'application/json',
  });
  const old = (await catalogVersions()).slice(KEEP_VERSIONS).map((b) => b.url);
  if (old.length) await del(old);
}

export async function uploadImage(buffer, contentType, baseName) {
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[contentType];
  const blob = await put('produtos/' + baseName + '.' + ext, buffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType,
  });
  return blob.url;
}

function str(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function money(v) {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 && n < 1e6 ? Math.round(n * 100) / 100 : null;
}

function photoUrl(v) {
  const s = str(v, 2000);
  return /^(https:\/\/|\/img\/)/.test(s) ? s : '';
}

// Valida e normaliza o catálogo enviado pelo painel, no mesmo formato que o site usa.
export function sanitizeCatalog(input) {
  if (!input || !Array.isArray(input.products)) throw new Error('Catálogo inválido.');
  if (input.products.length > 300) throw new Error('Produtos demais (máximo 300).');
  const ids = new Set();
  const products = input.products.map((raw, i) => {
    const name = str(raw.name, 120);
    if (!name) throw new Error('O produto ' + (i + 1) + ' está sem nome.');
    const price = money(raw.price);
    if (price === null) throw new Error('Preço inválido em "' + name + '".');
    let id = str(raw.id, 80).toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!id || ids.has(id)) id = 'p-' + crypto.randomBytes(5).toString('hex');
    ids.add(id);

    const flavors = Array.isArray(raw.flavors)
      ? raw.flavors.map((f) => str(f, 60)).filter(Boolean).slice(0, 30)
      : [];
    const p = {
      id,
      cat: CATEGORIES.includes(raw.cat) ? raw.cat : CATEGORIES[0],
      name,
      price,
      oldPrice: raw.oldPrice === null || raw.oldPrice === '' ? null : money(raw.oldPrice),
      macroLabel: str(raw.macroLabel, 40),
      macroVal: str(raw.macroVal, 20),
      tag: str(raw.tag, 20) || null,
      photo: photoUrl(raw.photo),
      active: raw.active !== false,
    };
    if (flavors.length > 1) {
      p.flavors = flavors;
      const prices = {};
      const photos = {};
      flavors.forEach((f) => {
        const fp = raw.pricesByFlavor && money(raw.pricesByFlavor[f]);
        if (fp !== null && fp !== undefined && raw.pricesByFlavor[f] !== '') prices[f] = fp;
        const ph = raw.photosByFlavor && photoUrl(raw.photosByFlavor[f]);
        if (ph) photos[f] = ph;
      });
      if (Object.keys(prices).length) p.pricesByFlavor = prices;
      if (Object.keys(photos).length) p.photosByFlavor = photos;
    } else if (flavors.length === 1) {
      p.flavor = flavors[0];
    }
    return p;
  });
  return { products, updatedAt: new Date().toISOString() };
}
