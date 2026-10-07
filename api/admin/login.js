import { isAuthorized } from '../_lib.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD não está configurada na Vercel.' });
  }
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Senha incorreta.' });
  res.status(200).json({ ok: true });
}
