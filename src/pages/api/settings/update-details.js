import { requireUser } from '../../../lib/auth.js';
import { updateUserDetails } from '../../../lib/airtable.js';
import { getSecurityHeaders, sanitizeString } from '../../../lib/security.js';

// Test GET endpoint to verify the route is working
export async function GET() {
  return new Response(JSON.stringify({ success: true, message: 'API route is working' }), {
    status: 200,
    headers: getSecurityHeaders()
  });
}

export async function POST({ request }) {
  try {
    if (!request || !request.headers) {
      return new Response(JSON.stringify({ error: 'Invalid request object' }), {
        status: 400,
        headers: getSecurityHeaders()
      });
    }
    
    // Get authenticated user
    const user = await requireUser(request.headers);
    const slackId = user.fields.slackId;
    
    if (!slackId) {
      return new Response(JSON.stringify({ error: 'Slack ID not found in user data' }), {
        status: 401,
        headers: getSecurityHeaders()
      });
    }

    // Get form data from request body
    const formData = await request.json();
    
    // Validate and sanitize required fields
    const requiredFields = [
      'firstname', 'lastname', 'birthday', 'githubusername', 
      'hearabout', 'doingwell', 'improve', 'addr1', 
      'city', 'state', 'country', 'zipcode'
    ];
    
    const sanitizedData = {};
    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
          headers: getSecurityHeaders()
        });
      }
      // Sanitize string inputs
      sanitizedData[field] = sanitizeString(value, 200);
    }

    // Handle optional fields
    sanitizedData.addr2 = sanitizeString(formData.addr2 || '', 200);

    // Update user details in Airtable
    await updateUserDetails(slackId, sanitizedData);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: getSecurityHeaders()
    });
    
  } catch (error) {
    console.error('Error updating user details:', error);
    return new Response(JSON.stringify({ error: 'Failed to update details' }), {
      status: 500,
      headers: getSecurityHeaders()
    });
  }
}
