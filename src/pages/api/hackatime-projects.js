import { requireUser } from '../../lib/auth.js';
import { getCurrentRound } from '../../lib/data.js';
import { getSecurityHeaders } from '../../lib/security.js';

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

    // Return user info and round data for client-side hackatime API call
    return new Response(JSON.stringify({ 
      slackId,
      currentRound,
      roundStartDate: getRoundStartDate(currentRound)
    }), {
      status: 200,
      headers: getSecurityHeaders()
    });

  } catch (error) {
    console.error('Error in hackatime-projects API:', error);
    
    if (error.message.includes('redirect')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: getSecurityHeaders()
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Failed to get user data',
      details: error.message
    }), {
      status: 500,
      headers: getSecurityHeaders()
    });
  }
}

// Helper function to get round start date
function getRoundStartDate(roundNum) {
  const roundStartDates = {
    1: "2025-08-07",
    2: "2025-08-14", 
    3: "2025-08-21",
    4: "2025-08-28"
  };
  return roundStartDates[roundNum] || null;
}
