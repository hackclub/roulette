import jwt from 'jsonwebtoken';
import { recordSpin, isWageredForCurrentRound, userWager } from '../../lib/airtable.js';
import { getCurrentRound, isSelectedCountOk } from '../../lib/data.js';
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



  const { selectedOptions, wheelOption } = await request.json();

  var selectedOk = isSelectedCountOk(selectedOptions, wheelOption);

  if (selectedOk) {
    // do the spinning
  } else {
    return new Response('Invalid selection', { status: 401 });
  }
  //
  //
  //
  // const { wagerChoice, wagerAmount } = await request.json();
  //
  // const isWageredAlready = await isWageredForCurrentRound({ "userId": payload.userId })
  //
  // if (isWageredAlready) {
  //   console.log("BOO")
  // } else {
  //   userWager({
  //     'slackId': payload.userId,
  //     'wagerChoice': wagerChoice,
  //     'wagerAmount': wagerAmount
  //
  //   })
  // }
  //
  // console.log(wagerChoice, wagerAmount);
  // console.log("WAGER.JS POST");



  //
  // const spin = await recordWager(payload.userId, result);

  return new Response(JSON.stringify("yay"), { status: 200 });
}
