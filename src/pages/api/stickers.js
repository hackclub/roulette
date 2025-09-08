import { getAvailableStickers } from '../../lib/airtable.js';
import { getSecurityHeaders } from '../../lib/security.js';

export async function GET() {
  // Add security headers
  const headers = getSecurityHeaders();

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
