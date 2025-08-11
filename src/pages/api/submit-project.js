import { requireUser } from '../../lib/auth.js';
import { submitProjectToAirtable } from '../../lib/airtable.js';
import { getCurrentRound } from '../../lib/data.js';
import { getSecurityHeaders, sanitizeString, isValidUrl, validateNumber, validateArray } from '../../lib/security.js';

export async function POST({ request }) {
  try {
    // Authenticate user
    const userData = await requireUser(request.headers);
    if (!userData) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: getSecurityHeaders()
      });
    }

    // Parse form data
    const formData = await request.json();
    
    // Input validation and sanitization using security utilities
    const gameName = sanitizeString(formData.gameName, 200);
    const gameDescription = sanitizeString(formData.gameDescription, 2000);
    const githubUrl = sanitizeString(formData.githubUrl, 500);
    const playableUrl = sanitizeString(formData.playableUrl, 500);
    const screenshotUrl = sanitizeString(formData.screenshotUrl, 500);
    const hackatimeProjects = validateArray(formData.hackatimeProjects, 50);
    const additionalHours = validateNumber(formData.additionalHours, 0, 1000);
    const hoursDescription = sanitizeString(formData.hoursDescription, 1000);
    const totalHours = sanitizeString(formData.totalHours, 100);
    const justificationLinks = validateArray(formData.justificationLinks, 20).map(link => sanitizeString(link, 500));
    
    // Validate required fields
    const requiredFields = [
      'gameName', 'gameDescription', 'githubUrl', 'playableUrl'
    ];
    
    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), { 
          status: 400,
          headers: getSecurityHeaders()
        });
      }
    }

    // Validate URLs
    const urlFields = { githubUrl, playableUrl };
    for (const [fieldName, url] of Object.entries(urlFields)) {
      if (url && !isValidUrl(url)) {
        return new Response(JSON.stringify({ error: `Invalid ${fieldName}: must be a valid URL` }), { 
          status: 400,
          headers: getSecurityHeaders()
        });
      }
    }

    // Validate that user has either hackatime projects OR additional hours
    const hasHackatimeProjects = hackatimeProjects && hackatimeProjects.length > 0;
    const hasAdditionalHours = additionalHours > 0;
    
    if (!hasHackatimeProjects && !hasAdditionalHours) {
      return new Response(JSON.stringify({ error: 'You must have either hackatime projects OR additional hours to submit' }), { 
        status: 400,
        headers: getSecurityHeaders()
      });
    }

    // Only require hours description if additional hours are entered
    if (hasAdditionalHours && (!hoursDescription || !hoursDescription.trim())) {
      return new Response(JSON.stringify({ error: 'Hours description is required when entering additional hours' }), { 
        status: 400,
        headers: getSecurityHeaders()
      });
    }

    // Validate additional hours is reasonable
    if (additionalHours > 1000) {
      return new Response(JSON.stringify({ error: 'Additional hours cannot exceed 1000' }), { 
        status: 400,
        headers: getSecurityHeaders()
      });
    }

    // Get user details from the authenticated user data
    const user = userData.fields;
    const currentRound = getCurrentRound();
    
    // Prepare project submission data
    const projectData = {
      slackId: user.slackId,
      userName: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
      userEmail: user.email || '',
      githubUsername: user.githubusername || '',
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      birthday: user.birthday || '',
      
      // Project details
      gameName: gameName,
      gameDescription: gameDescription,
      githubUrl: githubUrl,
      playableUrl: playableUrl,
      screenshotUrl: screenshotUrl,
      
      // Hours and projects
      hackatimeProjects: hackatimeProjects,
      additionalHours: additionalHours,
      hoursDescription: hoursDescription,
      totalHours: totalHours,
      justificationLinks: justificationLinks,
      
      // User details for shipping
      address: {
        line1: user.addr1 || '',
        line2: user.addr2 || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        zipcode: user.zipcode || ''
      },
      
      // Feedback
      howHeard: user.hearabout || '',
      doingWell: user.doingwell || '',
      improve: user.improve || '',
      
      // Metadata
      submissionDate: new Date().toISOString(),
      roundNumber: currentRound,
      status: 'submitted'
    };

    // Submit to Airtable
    const result = await submitProjectToAirtable(projectData);
    
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: getSecurityHeaders()
    });
    
  } catch (error) {
    console.error('Error submitting project:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit project' }), {
      status: 500,
      headers: getSecurityHeaders()
    });
  }
}
