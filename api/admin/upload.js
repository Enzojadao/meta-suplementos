import { requireAdmin, uploadImage } from '../_lib.js';

const MAX_BYTES = 3 * 1024 * 1024;

// Recebe { dataUrl, name } com a foto já reduzida pelo painel e devolve a URL pública.
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const { dataUrl, name } = req.body || {};
  const m = typeof dataUrl === 'string' && dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m) return res.status(400).json({ error: 'Envie uma imagem JPG, PNG ou WEBP.' });
  const buffer = Buffer.from(m[2], 'base64');
  if (buffer.length > MAX_BYTES) return res.status(413).json({ error: 'Imagem grande demais (máx. 3 MB).' });
  const base = String(name || 'foto').toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'foto';
  try {
    const url = await uploadImage(buffer, m[1], base);
    res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Não foi possível enviar a foto.' });
  }
}
