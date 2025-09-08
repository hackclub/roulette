import jwt from 'jsonwebtoken';
import { createPurchase, getAvailableStickers } from '../../lib/airtable.js';
import { getTokenFromCookies, verifyJwt } from '../../lib/auth.js';
import { getSecurityHeaders, sanitizeString } from '../../lib/security.js';

export async function POST({ request }) {
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

  // Validate request body
  let requestData;
  try {
    requestData = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { 
      status: 400,
      headers
    });
  }

  const { itemName, itemType, chipsSpent } = requestData;

  // Input validation
  if (!itemName || !itemType || chipsSpent === undefined) {
    return new Response(JSON.stringify({ error: 'Missing required fields: itemName, itemType, chipsSpent' }), { 
      status: 400,
      headers
    });
  }

  // Sanitize string inputs
  const sanitizedItemName = sanitizeString(itemName, 200);
  const sanitizedItemType = sanitizeString(itemType, 50);
  
  if (!sanitizedItemName || !sanitizedItemType) {
    return new Response(JSON.stringify({ error: 'Invalid item name or type' }), { 
      status: 400,
      headers
    });
  }

  if (typeof chipsSpent !== 'number' || chipsSpent <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid chips amount' }), { 
      status: 400,
      headers
    });
  }

  try {
    // Handle sticker purchases with random selection
    let finalItemName = sanitizedItemName;
    if (sanitizedItemType === 'sticker' && sanitizedItemName === 'spin for a sticker') {
      // Get available stickers and pick one randomly
      const availableStickers = await getAvailableStickers();
      if (availableStickers.length > 0) {
        const randomSticker = availableStickers[Math.floor(Math.random() * availableStickers.length)];
        finalItemName = randomSticker.stickerName;
      } else {
        finalItemName = 'Random Sticker'; // fallback
      }
    }
    
    // Create the purchase with the final item name
    const purchase = await createPurchase(payload.userId, finalItemName, sanitizedItemType, chipsSpent);

    return new Response(JSON.stringify({ 
      success: true, 
      purchase: {
        id: purchase.id,
        itemName: purchase.fields.itemName,
        itemType: purchase.fields.itemType,
        chipsSpent: purchase.fields.chipsSpent,
        status: purchase.fields.status
      }
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error creating purchase:', error);
    return new Response(JSON.stringify({ error: error.message || 'Purchase failed' }), { 
      status: 400,
      headers
    });
  }
}
