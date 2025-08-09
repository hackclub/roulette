import jwt from 'jsonwebtoken';
import { isWageredForCurrentRound, userWager, hasEnoughChips } from '../../lib/airtable.js';
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

  const isWageredAlready = await isWageredForCurrentRound({ "userId": payload.userId })

  const hasEnough = await hasEnoughChips(payload.userId, wagerAmount)

  if (isWageredAlready) {
    return new Response('Wagered already', { status: 401 });
  } else if (!hasEnough){
    return new Response('Not enough chips', { status: 401 });
  }else {
    userWager({
      'slackId': payload.userId,
      'wagerChoice': wagerChoice,
      'wagerAmount': wagerAmount

    })
  }

  return new Response(JSON.stringify("success"), { status: 200 });


  // go to spin wheel results, pull again from airtable.
}
