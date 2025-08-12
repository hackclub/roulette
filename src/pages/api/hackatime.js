import { getProjectsSinceRoundNum } from '../../lib/hackatime.js';
import { getCurrentRound } from '../../lib/data.js';

import { requireUser } from '../../lib/auth.js';

export async function GET(request) {
  try {
    // Get user data from auth
    const user = await requireUser(request.headers);
    const slackId = user.slackId;
    
    if (!slackId) {
      return new Response(JSON.stringify({ error: 'Slack ID not found in user data' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get current round from data.js
    const roundNum = getCurrentRound();
    
    // Fetch hackatime projects
    const projects = await getProjectsSinceRoundNum(slackId, roundNum);
    
    return new Response(JSON.stringify({ success: true, projects }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching hackatime projects:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch projects' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
