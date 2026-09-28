// Busca as abas publicadas da planilha no servidor, para que os links
// nunca apareçam no navegador. Os links ficam nas variáveis de ambiente:
//   META_CSV_URL    -> link CSV publicado da aba "bd meta"
//   GOOGLE_CSV_URL  -> link CSV publicado da aba "bd google ads"
export default async function handler(req, res) {
  const sources = {
    meta: process.env.META_CSV_URL,
    google: process.env.GOOGLE_CSV_URL,
  };
  const out = { fetchedAt: new Date().toISOString(), errors: {} };

  await Promise.all(
    Object.entries(sources).map(async ([key, url]) => {
      out[key] = null;
      if (!url) {
        out.errors[key] = 'Link nao configurado na Vercel';
        return;
      }
      try {
        const r = await fetch(url, { redirect: 'follow' });
        if (!r.ok) throw new Error('A planilha respondeu com erro ' + r.status);
        const text = await r.text();
        if (text.trim().startsWith('<')) {
          throw new Error('O link nao devolveu CSV. Confira se a aba foi publicada como .csv');
        }
        out[key] = text;
      } catch (e) {
        out.errors[key] = String(e.message || e);
      }
    })
  );

  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json(out);
}
