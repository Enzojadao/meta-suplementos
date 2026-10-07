import { requireAdmin, readCatalog, writeCatalog, sanitizeCatalog, CATEGORIES } from '../_lib.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const catalog = await readCatalog();
      return res.status(200).json({ products: catalog ? catalog.products : null, updatedAt: catalog && catalog.updatedAt, categories: CATEGORIES });
    }
    if (req.method === 'PUT') {
      let catalog;
      try {
        catalog = sanitizeCatalog(req.body);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
      await writeCatalog(catalog);
      return res.status(200).json(catalog);
    }
    res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao acessar o armazenamento. Tente de novo.' });
  }
}
