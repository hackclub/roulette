import jwt from 'jsonwebtoken';
import { getUserPurchases, getUserBySlackId } from '../../lib/airtable.js';
import { getTokenFromCookies, verifyJwt } from '../../lib/auth.js';
import { getSecurityHeaders } from '../../lib/security.js';

export async function GET({ request }) {
  // Add security headers
  const headers = getSecurityHeaders();

  const token = getTokenFromCookies(request.headers);
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers
    });
  }

  let payload;
  try {
    payload = verifyJwt(token);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { 
      status: 401,
      headers
    });
  }

  try {
    // Get user's current chip balance
    const user = await getUserBySlackId(payload.userId);
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { 
        status: 404,
        headers
      });
    }

    // Get user's purchases
    const purchases = await getUserPurchases(payload.userId);

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        currentChips: user.fields.chips,
        purchases: purchases
      }
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch inventory' }), { 
      status: 500,
      headers
    });
  }
}
