import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();


export async function GET() {

  // const clientId = process.env.SLACK_CLIENT_ID;
  const siteOrigin = process.env.URI_REDIRECT || process.env.SITE_ORIGIN || 'http://localhost:4321';

  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${siteOrigin}/api/auth/slack/callback`);
  const scope = encodeURIComponent('openid profile email'); // openid scopes
  const state = crypto.randomBytes(16).toString('hex');

  const url = `https://slack.com/openid/connect/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&response_type=code&state=${state}`;


  // const redirectUri = encodeURIComponent(`${siteOrigin}/api/auth/slack/callback`);
  // const scope = encodeURIComponent('profile');
  //
  // console.log(clientId);
  // console.log(siteOrigin);
  //
  // const url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&user_scope=${scope}&redirect_uri=${redirectUri}`;

  return Response.redirect(url, 302);
}
