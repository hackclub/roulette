

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
  try {
    const token = getTokenFromCookies(headers);
    if (!token) {
      throw new Error('No token provided');
    }
    
    const decoded = verifyJwt(token);
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid token payload');
    }
    
    const user = await getUserBySlackId(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Authentication error:', error.message);
    throw new Error('Authentication failed');
  }
}


export function redirectToLogin() {
  return new Response(null, {
    status: 302,
    headers: { Location: '/' },
  });
}
