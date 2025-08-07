import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

import { jwtVerify, createRemoteJWKSet } from 'jose';
import { createOrUpdateUser } from '../../../../lib/airtable.js';


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

  // const userInfoRes = await fetch('https://slack.com/api/openid.connect.userInfo', {
  //   headers: { Authorization: `Bearer ${tokenData.access_token}` }
  // });
  // console.log(userInfoRes);
  // const userInfo = await userInfoRes.json();
  // console.log(userInfo);

  const profileRes = await fetch('https://slack.com/api/users.profile.get', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
    }
  });
  const profileData = await profileRes.json();
  const profile = profileData.profile;

  const displayName = profile.display_name || profile.real_name;
  const avatar = profile.image_192 || profile.image_72;




  const decoded = jwt.decode(tokenData.id_token, { complete: true });


  // verify the thing
  const { payload } = await jwtVerify(tokenData.id_token, JWKS, {
    issuer: 'https://slack.com',
    audience: process.env.SLACK_CLIENT_ID,
  });


  createOrUpdateUser(
    { "slackId": payload.sub,
      "name": displayName,
      "avatar": avatar,
    });
  console.log(payload.sub, displayName, avatar);


  const yourSignedJwt = jwt.sign({ userId: payload.sub }, process.env.JWT_SECRET, { expiresIn: '1h' });


  // return new Response(`Hello, ${decoded.payload.name || 'user'}!`, {
  // status: 200,
  // headers: {
  //   'Set-Cookie': `token=${yourSignedJwt}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`,
  //   'Content-Type': 'text/plain',
  //   },
  // });


  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': `token=${yourSignedJwt}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`,
      'Location': '/spin'
    },
  });


}
