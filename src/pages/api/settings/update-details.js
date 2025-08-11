import { requireUser } from '../../../lib/auth.js';
import { updateUserDetails } from '../../../lib/airtable.js';

// Test GET endpoint to verify the route is working
export async function GET() {
  return new Response(JSON.stringify({ message: 'API route is working' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    console.log('API called with request:', request);
    console.log('Request headers:', request?.headers);
    
    if (!request || !request.headers) {
      return new Response(JSON.stringify({ error: 'Invalid request object' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get authenticated user
    const user = await requireUser(request.headers);
    const slackId = user.fields.slackId;
    
    if (!slackId) {
      return new Response(JSON.stringify({ error: 'Slack ID not found in user data' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get form data from request body
    const formData = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'firstname', 'lastname', 'birthday', 'githubusername', 
      'hearabout', 'doingwell', 'improve', 'addr1', 
      'city', 'state', 'country', 'zipcode'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Update user details in Airtable
    await updateUserDetails(slackId, formData);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error updating user details:', error);
    return new Response(JSON.stringify({ error: 'Failed to update details' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
