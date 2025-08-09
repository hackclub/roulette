import jwt from 'jsonwebtoken';
import { isWageredForCurrentRound, userWager, hasEnoughChips, decrementUserChips } from '../../lib/airtable.js';
import { getCurrentRound } from '../../lib/data.js';
import { getTokenFromCookies, verifyJwt } from '../../lib/auth.js';

export async function POST({ request }) {

  const token = getTokenFromCookies(request.headers);
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  let payload;

  try {
    payload = verifyJwt(token);
  } catch {
    return new Response('Invalid token', { status: 401 });
  }






  const { wagerChoice, wagerAmount } = await request.json();

  // Basic input validation
  const allowedChoices = new Set(['1.5x', '2x', '3x']);
  const amt = Number(wagerAmount);
  if (!allowedChoices.has(String(wagerChoice)) || !Number.isFinite(amt) || amt <= 0) {
    return new Response('Invalid wager input', { status: 400 });
  }

  const isWageredAlready = await isWageredForCurrentRound({ "userId": payload.userId })

  const hasEnough = await hasEnoughChips(payload.userId, amt)

  if (isWageredAlready) {
    return new Response('Wagered already', { status: 401 });
  } else if (!hasEnough){
    return new Response('Not enough chips', { status: 401 });
  }else {
    await userWager({
      'slackId': payload.userId,
      'wagerChoice': wagerChoice,
      'wagerAmount': amt

    })
    // Deduct chips immediately on wagering
    await decrementUserChips(payload.userId, amt);
  }

  return new Response(JSON.stringify("success"), { status: 200 });


  // go to spin wheel results, pull again from airtable.
}
