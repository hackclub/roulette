import { getAvailableStickers } from '../../lib/airtable.js';
import { getSecurityHeaders } from '../../lib/security.js';
import { getTokenFromCookies, verifyJwt } from '../../lib/auth.js';

export async function GET({ request }) {
  // Add security headers
  const headers = getSecurityHeaders();

  // Require authentication
  const token = getTokenFromCookies(request.headers);
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers
    });
  }

  try {
    verifyJwt(token);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { 
      status: 401,
      headers
    });
  }

  try {
    const stickers = await getAvailableStickers();

    return new Response(JSON.stringify({ 
      success: true, 
      stickers: stickers
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error fetching stickers:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch stickers' }), { 
      status: 500,
      headers
    });
  }
}
