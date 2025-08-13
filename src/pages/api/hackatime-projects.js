import { requireUser } from '../../lib/auth.js';
import { getCurrentRound } from '../../lib/data.js';
import { getProjectsSinceRoundNum } from '../../lib/hackatime.js';
import { getSecurityHeaders, validateArray } from '../../lib/security.js';

// Rate limiter instance - 10 requests per minute per user
const rateLimiter = new Map();

function isRateLimited(slackId) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;
  
  if (!rateLimiter.has(slackId)) {
    rateLimiter.set(slackId, [now]);
    return false;
  }
  
  const requests = rateLimiter.get(slackId);
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return true;
  }
  
  recentRequests.push(now);
  rateLimiter.set(slackId, recentRequests);
  return false;
}

export async function GET({ request }) {
  try {
    // Get user data from auth
    const userData = await requireUser(request.headers);
    const currentRound = getCurrentRound();
    const slackId = userData.fields.slackId;

    if (!slackId) {
      return new Response(JSON.stringify({ error: 'No Slack ID found' }), {
        status: 400,
        headers: getSecurityHeaders()
      });
    }

    // Check rate limiting
    if (isRateLimited(slackId)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: getSecurityHeaders()
      });
    }

    // Fetch hackatime projects for this user
    const projects = await getProjectsSinceRoundNum(slackId, currentRound);

    // Validate and sanitize projects data
    const validatedProjects = validateArray(projects, 100);

    return new Response(JSON.stringify({ projects: validatedProjects }), {
      status: 200,
      headers: getSecurityHeaders()
    });

  } catch (error) {
    console.error('Error fetching hackatime projects:', error);
    
    if (error.message.includes('redirect')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: getSecurityHeaders()
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Failed to fetch projects',
      details: error.message
    }), {
      status: 500,
      headers: getSecurityHeaders()
    });
  }
}
