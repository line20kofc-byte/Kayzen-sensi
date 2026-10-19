/**
 * Kayzen V7 — Pesquisa de fontes públicas com TinyFish Search.
 * A chave TINYFISH_API_KEY existe exclusivamente no ambiente Netlify Functions.
 * A busca NÃO assiste vídeos do TikTok e NÃO promete DPI perfeito.
 */
const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};
const response = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
const clean = (x) => String(x ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const normalize = (x) => clean(x).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function modelAppears(content, model) {
  const text = normalize(content);
  const target = normalize(model).replace(/^(samsung|xiaomi|motorola|apple) /, '');
  return target.length >= 3 && (` ${text} `).includes(` ${target} `);
}
function extractDpis(content) {
  const found = [];
  const text = clean(content);
  const patterns = [
    /\b(?:dpi|menor largura)\s*(?:[:=–-]|de|em|é)?\s*(\d{3,4})\b/gi,
    /\b(\d{3,4})\s*(?:dpi|dp)\b/gi,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const value = Number(match[1]);
      if (value >= 250 && value <= 960 && !found.includes(value)) found.push(value);
    }
  }
  return found.slice(0, 5);
}
function extractSettings(content) {
  const text = clean(content);
  const patterns = {
    geral: /\bgeral\s*[:=–-]\s*(\d{1,3})\b/i,
    red_dot: /\b(?:red\s*dot|ponto\s*vermelho)\s*[:=–-]\s*(\d{1,3})\b/i,
    mira_2x: /\b(?:mira\s*)?2\s*x\s*[:=–-]\s*(\d{1,3})\b/i,
    mira_4x: /\b(?:mira\s*)?4\s*x\s*[:=–-]\s*(\d{1,3})\b/i,
    awm: /\b(?:awm|sniper)\s*[:=–-]\s*(\d{1,3})\b/i,
    olhadinha: /\b(?:olhadinha|free\s*look)\s*[:=–-]\s*(\d{1,3})\b/i,
  };
  const values = {};
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (!match) return null;
    const value = Number(match[1]);
    if (value < 0 || value > 200) return null;
    values[key] = value;
  }
  return values;
}
export default async function handler(request) {
  if (request.method !== 'GET') return response({ error: 'Método não permitido.' }, 405);
  const u = new URL(request.url);
  const model = (u.searchParams.get('model') || '').trim();
  const game = (u.searchParams.get('game') || 'Free Fire').trim();
  const platform = u.searchParams.get('platform') === 'ios' ? 'ios' : 'android';
  if (model.length < 3 || model.length > 85 || !/^[\p{L}\p{N} .+_()\/-]+$/u.test(model))
    return response({ error: 'Modelo de celular inválido.' }, 400);
  if (!['Free Fire', 'Free Fire MAX'].includes(game))
    return response({ error: 'Versão do jogo inválida.' }, 400);
  const key = process.env.TINYFISH_API_KEY;
  if (!key) return response({ error: 'Falta configurar TINYFISH_API_KEY nas variáveis de ambiente do Netlify.' }, 503);

  const query = `${model} ${game} sensibilidade dpi geral red dot mira 2x 4x TikTok`;
  const endpoint = new URL('https://api.search.tinyfish.ai/');
  endpoint.searchParams.set('query', query);
  let items;
  try {
    const api = await fetch(endpoint, {
      headers: { 'X-API-Key': key, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    if (!api.ok) {
      let message = api.status === 401 || api.status === 403
        ? 'Chave TinyFish inválida ou sem acesso à busca.'
        : api.status === 429
          ? 'Limite de buscas atingido. Tente novamente mais tarde.'
          : `Erro na API de pesquisa (HTTP ${api.status}).`;
      return response({ error: message }, api.status === 429 ? 429 : 502);
    }
    const json = await api.json();
    items = Array.isArray(json.results) ? json.results :
      Array.isArray(json.data?.results) ? json.data.results : [];
  } catch (_err) {
    return response({ error: 'Não foi possível consultar a TinyFish. Verifique a conexão e tente novamente.' }, 502);
  }

  const unique = new Map();
  for (const item of items.slice(0, 20)) {
    const title = clean(item.title).slice(0, 160);
    const snippet = clean(item.snippet || item.description).slice(0, 1600);
    let url = String(item.url || item.link || '').slice(0, 600);
    if (!/^https:\/\//i.test(url)) continue;
    if (unique.has(url)) continue;
    const matched = modelAppears(`${title} ${snippet}`, model);
    unique.set(url, {
      title,
      url,
      snippet,
      modelMatch: matched,
      dpis: matched && platform === 'android' ? extractDpis(`${title} ${snippet}`) : [],
      settings: matched ? extractSettings(`${title} ${snippet}`) : null,
    });
  }
  const sources = [...unique.values()]
    .sort((a, b) => Number(b.modelMatch) - Number(a.modelMatch))
    .slice(0, 14);
  return response({
    model, game, platform, sources,
    notice: 'Fontes da pesquisa na web. DPI e sensibilidade só são extraídos se estiverem explícitos nos trechos. O TikTok pode não mostrar os números no índice; confira os links originais.'
  });
}
export { extractDpis, extractSettings, modelAppears };
