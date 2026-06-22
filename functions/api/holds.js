// functions/api/holds.js

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Get the authenticated user's email from Cloudflare Access Zero Trust
  // Fallback to 'unknown' for local testing
  const userEmail = request.headers.get('Cf-Access-Authenticated-User-Email') || 'unknown';

  // GET: Fetch holds for a specific route
  if (request.method === 'GET') {
    const routeId = url.searchParams.get('routeId');
    if (!routeId) return new Response('Missing routeId', { status: 400 });
    
    try {
      const { results } = await env.DB.prepare('SELECT * FROM holds WHERE route_id = ?').bind(routeId).all();
      return Response.json(results);
    } catch (e) {
      return new Response('Database error', { status: 500 });
    }
  }

  // POST: Add or Update a hold
  if (request.method === 'POST') {
    try {
      const data = await request.json();
      
      await env.DB.prepare(
        `INSERT INTO holds (id, route_id, house, start_date, end_date, created_by, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET 
            house=excluded.house, 
            start_date=excluded.start_date, 
            end_date=excluded.end_date, 
            updated_at=excluded.updated_at`
      ).bind(
        data.id, 
        data.routeId, 
        data.house, 
        data.start, 
        data.end, 
        userEmail, 
        Date.now()
      ).run();
      
      return Response.json({ success: true, user: userEmail });
    } catch (e) {
      return new Response('Failed to save hold', { status: 500 });
    }
  }

  // DELETE: Remove a hold
  if (request.method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (!id) return new Response('Missing id', { status: 400 });

    try {
      await env.DB.prepare('DELETE FROM holds WHERE id = ?').bind(id).run();
      return Response.json({ success: true });
    } catch (e) {
      return new Response('Failed to delete hold', { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
