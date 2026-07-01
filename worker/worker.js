/*
 * Proxy sécurisé pour "Mon carnet" (Cloudflare Worker).
 *
 * Rôle :
 *  - garder la clé JSONBin secrète (côté serveur, jamais dans le navigateur) ;
 *  - protéger l'accès aux données par un code PIN.
 *
 * Variables/secrets à définir dans Cloudflare (voir worker/README.md) :
 *  - JSONBIN_KEY : la clé d'accès (X-Access-Key) de JSONBin      [secret]
 *  - BIN_ID      : l'identifiant du bin JSONBin                  [variable]
 *  - APP_PIN     : le code PIN attendu                           [secret]
 *  - ALLOW_ORIGIN: (optionnel) l'origine autorisée, ex. https://audreyoakwood.github.io
 */

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-App-Pin',
    'Access-Control-Max-Age': '86400',
  };
}

function json(body, status, env) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });
}

export default {
  async fetch(request, env) {
    // Préflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    // Vérification du code PIN
    const pin = request.headers.get('X-App-Pin') || '';
    if (!env.APP_PIN || pin !== env.APP_PIN) {
      return json({ error: 'PIN invalide' }, 401, env);
    }

    const base = 'https://api.jsonbin.io/v3/b/' + env.BIN_ID;

    try {
      if (request.method === 'GET') {
        const r = await fetch(base + '/latest', {
          headers: { 'X-Access-Key': env.JSONBIN_KEY },
        });
        const j = await r.json();
        const data = (j.record && j.record.data) ? j.record.data : {};
        return json({ data: data }, 200, env);
      }

      if (request.method === 'PUT') {
        const body = await request.text();
        await fetch(base, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': env.JSONBIN_KEY,
          },
          body: body,
        });
        return json({ ok: true }, 200, env);
      }

      return json({ error: 'Méthode non autorisée' }, 405, env);
    } catch (e) {
      return json({ error: 'Erreur proxy' }, 502, env);
    }
  },
};
