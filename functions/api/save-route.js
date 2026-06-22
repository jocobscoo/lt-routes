export async function onRequest(context) {
  if (context.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { routeId, routeData } = await context.request.json();
    const token = context.env.GITHUB_TOKEN; // Cloudflare gizli kasasından şifreyi çeker

    if (!token) return new Response('GitHub token missing', { status: 500 });

    const owner = 'jocobscoo';
    const repo = 'lt-routes';
    const path = `data/routes/${routeId}.json`;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Cloudflare-Pages-LT-Routes'
    };

    // 1. GitHub'da bu dosya zaten var mı diye kontrol et (varsa SHA kodunu al)
    let sha = null;
    const getRes = await fetch(apiUrl, { headers });
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    // 2. Yeni JSON verisini hazırla ve şifrele (Base64)
    const contentString = JSON.stringify(routeData, null, 2);
    // Cloudflare Workers ortamında UTF-8 güvenli Base64 çevirisi
    const encodedContent = btoa(unescape(encodeURIComponent(contentString)));

    // 3. GitHub'a yeni dosyayı yükle / olanı güncelle
    const body = {
      message: `Update Route ${routeId} via Carrier Console`,
      content: encodedContent,
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (!putRes.ok) {
      const errorText = await putRes.text();
      throw new Error(`GitHub API error: ${errorText}`);
    }

    return Response.json({ success: true });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
