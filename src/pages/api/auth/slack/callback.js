import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

export const prerender = false;


export async function GET({ request }) {
  const base = process.env.URI_REDIRECT || 'http://localhost:4321';
  const url = new URL(request.url, base);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) return new Response('No code provided', { status: 400 });

  // exchange code for tokens
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

  // verify id_token (JWT)
  // for full security, fetch Slack JWKs and verify signature.
  // for dev/demo, you can decode without verifying:
  const decoded = jwt.decode(tokenData.id_token, { complete: true });

  const yourSignedJwt = jwt.sign({ userId: decoded.payload.sub }, process.env.JWT_SECRET, { expiresIn: '1h' });

  console.log('Decoded ID Token:', decoded);

  // You now have user info in decoded.payload

  // return new Response(`Hello, ${decoded.payload.name || 'user'}!`, {
  //   status: 200,
  //   headers: {
  //     'Set-Cookie': `token=${yourSignedJwt}; HttpOnly; Path=/; Max-Age=3600`
  //   }
  // );

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
      'Location': '/', // or wherever your main site lives
    },
  });


}
