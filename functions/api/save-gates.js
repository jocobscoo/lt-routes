export async function onRequest(context) {
  if (context.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  try {
    const { gatesData } = await context.request.json();
    const token = context.env.GITHUB_TOKEN;
    if (!token) return new Response('GitHub token missing', { status: 500 });

    const apiUrl = `https://api.github.com/repos/jocobscoo/lt-routes/contents/data/gates.json`;
    const headers = { 'Accept': 'application/vnd.github.v3+json', 'Authorization': `Bearer ${token}`, 'User-Agent': 'Cloudflare-Pages' };

    let sha = null;
    const getRes = await fetch(apiUrl, { headers });
    if (getRes.ok) sha = (await getRes.json()).sha;

    const contentString = JSON.stringify(gatesData, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(contentString)));

    const body = { message: `Update Gates & Codes via Console`, content: encodedContent };
    if (sha) body.sha = sha;

    const putRes = await fetch(apiUrl, { method: 'PUT', headers, body: JSON.stringify(body) });
    if (!putRes.ok) throw new Error(await putRes.text());
    return Response.json({ success: true });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}