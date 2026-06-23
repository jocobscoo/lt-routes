export async function onRequest(context) {
  if (context.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { routeId } = await context.request.json();
    const token = context.env.GITHUB_TOKEN; // Aynı şifreyi kullanıyoruz

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

    // 1. Dosyayı silmek için GitHub bizden dosyanın mevcut SHA (kimlik) kodunu ister
    let sha = null;
    const getRes = await fetch(apiUrl, { headers });
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    } else if (getRes.status === 404) {
      // Eğer GitHub'da zaten yoksa (sadece yerel eklenip silinmek isteniyorsa) başarılı say
      return Response.json({ success: true });
    } else {
      throw new Error('Failed to fetch file info from GitHub.');
    }

    // 2. Silme komutunu GitHub'a gönder
    const body = {
      message: `Delete Route ${routeId} via Carrier Console`,
      sha: sha
    };

    const delRes = await fetch(apiUrl, {
      method: 'DELETE',
      headers,
      body: JSON.stringify(body)
    });

    if (!delRes.ok) {
      const errorText = await delRes.text();
      throw new Error(`GitHub API error: ${errorText}`);
    }

    return Response.json({ success: true });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}