
export async function GET() {
  return new Response('Logged out', {
    headers: {
      'Set-Cookie': 'token=; Max-Age=0; Path=/; HttpOnly',
      'Location': '/',
    },
    status: 302,
  });
}
