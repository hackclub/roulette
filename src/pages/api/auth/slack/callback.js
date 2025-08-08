import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

import { jwtVerify, createRemoteJWKSet } from 'jose';
import { createOrUpdateUser } from '../../../../lib/airtable.js';

import { WebClient } from '@slack/web-api';

const web = new WebClient(process.env.SLACK_BOT_TOKEN);



const JWKS = createRemoteJWKSet(new URL('https://slack.com/openid/connect/keys'));

import dotenv from 'dotenv';
dotenv.config();

export const prerender = false;


export async function GET({ request }) {
  const base = process.env.URI_REDIRECT || 'http://localhost:4321';
  const url = new URL(request.url, base);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) return new Response('No code provided', { status: 400 });


  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    code,
    redirect_uri: `${base}/api/auth/slack/callback`,
    grant_type: 'authorization_code',
  });

  const tokenRes = await fetch('https://slack.com/api/openid.connect.token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.id_token) {
    return new Response('Failed to get id_token', { status: 400 });
  }





  // const profileRes = await fetch('https://slack.com/api/users.profile.get', {
  //   headers: {
  //     Authorization: `Bearer ${tokenData.access_token}`,
  //     'Content-Type': 'application/json',
  //   }
  // });
  // console.log(profileRes);
  // const profileData = await profileRes.json();
  // const profile = profileData.profile;
  //
  // const displayName = profile.display_name || profile.real_name;
  // const avatar = profile.image_192 || profile.image_72;
  //
  // console.log("got user data of ", displayName, avatar)
  //


  const decoded = jwt.decode(tokenData.id_token, { complete: true });


  // verify the thing
  const { payload } = await jwtVerify(tokenData.id_token, JWKS, {
    issuer: 'https://slack.com',
    audience: process.env.SLACK_CLIENT_ID,
  });

  const slackUserId = payload.sub;



  const response = await web.users.info({ user: slackUserId });

  if (!response.ok) {
    // handle error
    console.error('Slack users.info failed:', response.error);
  }



  const userProfile = response.user.profile;
  console.log(userProfile);
  const displayName = userProfile.display_name || userProfile.real_name;
  const avatar = userProfile.image_192 || userProfile.image_72;
  const email = userProfile.email;



  await createOrUpdateUser(
    { "slackId": payload.sub,
      "name": displayName,
      "avatar": avatar,
      "email": email
    });


  const yourSignedJwt = jwt.sign({ userId: payload.sub }, process.env.JWT_SECRET, { expiresIn: '1h' });



  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': `token=${yourSignedJwt}; HttpOnly; Path=/; Max-Age=3024000; SameSite=Lax`,
      'Location': '/spin'
    },
  });


}
