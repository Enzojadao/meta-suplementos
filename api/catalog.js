import { readCatalog } from './_lib.js';

// Catálogo público lido pela loja. Sem catálogo salvo, o site usa os produtos padrão.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  try {
    const catalog = await readCatalog();
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=60');
    res.status(200).json(catalog || { products: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Não foi possível carregar o catálogo.' });
  }
}
