

import jwt from 'jsonwebtoken';
import { getUserBySlackId } from './airtable.js';

import dotenv from 'dotenv';
dotenv.config();


export function getTokenFromCookies(headers) {
  const cookieHeader = headers.get('cookie') || '';
  const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => {
    const [key, ...v] = c.split('=');
    return [key, v.join('=')];
  }));
  return cookies.token;
}

export function verifyJwt(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}


export async function requireUser(headers) {
  const token = getTokenFromCookies(headers);
  const decoded = verifyJwt(token);


  const user = await getUserBySlackId(decoded.userId);

  if (!user) throw new Error('user not found');
  return user;
}


export function redirectToLogin() {
  return new Response(null, {
    status: 302,
    headers: { Location: '/' },
  });
}
