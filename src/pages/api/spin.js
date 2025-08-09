import jwt from 'jsonwebtoken';
import { isSpunForCurrentWheelRound, userSpinWheel } from '../../lib/airtable.js';
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

  // first check if user has spinned already.



  var check = await isSpunForCurrentWheelRound({
    "slackId": payload.userId,
    "wheelOption": wheelOption });

  if (check == true) {
    return new Response('Already spun', { status: 401 });

  }

  var selectedOk = isSelectedCountOk(selectedOptions, wheelOption);


  if (!selectedOk) {
    return new Response('Invalid selection', { status: 401 });
  }

  var spinResult = await userSpinWheel(payload.userId, selectedOptions, wheelOption);

  return new Response(JSON.stringify(spinResult), { status: 200 });


}
