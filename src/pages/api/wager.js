import jwt from 'jsonwebtoken';
import { isWageredForCurrentRound, userWager, hasEnoughChips, decrementUserChips, getUserRound, getUserBySlackId } from '../../lib/airtable.js';
import { getCurrentRound } from '../../lib/data.js';
import { getTokenFromCookies, verifyJwt } from '../../lib/auth.js';
import { getSecurityHeaders, validateNumber } from '../../lib/security.js';

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
    const currentRound = getCurrentRound();
    const userRound = await getUserRound(payload.userId, currentRound);
    const user = await getUserBySlackId(payload.userId);

    if (!userRound || !user) {
      return new Response(JSON.stringify({ error: 'No wager found for current round' }), { 
        status: 404,
        headers
      });
    }

    const wagerData = {
      wagerChoice: userRound.fields.wagerChoice,
      wagerAmount: userRound.fields.wagerAmount,
      currentChips: user.fields.chips,
      currentRespins: user.fields.respinTokens || 0,
      targetHours: getTargetHours(userRound.fields.wagerChoice)
    };

    return new Response(JSON.stringify(wagerData), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error fetching wager data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch wager data' }), { 
      status: 500,
      headers
    });
  }
}

function getTargetHours(wagerChoice) {
  const multiplierToHours = { '1.5x': 5, '2x': 10, '3x': 25 };
  return multiplierToHours[wagerChoice] || 0;
}

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

  const { wagerChoice, wagerAmount } = requestData;

  // Basic input validation
  const allowedChoices = new Set(['1.5x', '2x', '3x']);
  if (!allowedChoices.has(String(wagerChoice))) {
    return new Response(JSON.stringify({ error: 'Invalid wager choice' }), { 
      status: 400,
      headers
    });
  }

  const amt = validateNumber(wagerAmount, 1, 10000);
  if (amt === null) {
    return new Response(JSON.stringify({ error: 'Invalid wager amount' }), { 
      status: 400,
      headers
    });
  }

  const isWageredAlready = await isWageredForCurrentRound({ "userId": payload.userId })

  const hasEnough = await hasEnoughChips(payload.userId, amt)

  if (isWageredAlready) {
    return new Response(JSON.stringify({ error: 'Wagered already' }), { 
      status: 401,
      headers
    });
  } else if (!hasEnough){
    return new Response(JSON.stringify({ error: 'Not enough chips' }), { 
      status: 401,
      headers
    });
  } else {
    await userWager({
      'slackId': payload.userId,
      'wagerChoice': wagerChoice,
      'wagerAmount': amt
    })
    // Deduct chips immediately on wagering
    await decrementUserChips(payload.userId, amt);
  }

  return new Response(JSON.stringify({ success: true }), { 
    status: 200,
    headers
  });
}
