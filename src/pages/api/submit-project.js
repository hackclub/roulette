import { requireUser } from '../../lib/auth.js';
import { submitProjectToAirtable } from '../../lib/airtable.js';
import { getCurrentRound } from '../../lib/data.js';

export async function POST({ request }) {
  try {
    // Authenticate user
    const userData = await requireUser(request.headers);
    if (!userData) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse form data
    const formData = await request.json();
    
    // Extract fields
    const gameName = formData.gameName;
    const gameDescription = formData.gameDescription;
    const githubUrl = formData.githubUrl;
    const playableUrl = formData.playableUrl;
    const screenshotUrl = formData.screenshotUrl;
    const hackatimeProjects = formData.hackatimeProjects;
    const additionalHours = parseFloat(formData.additionalHours) || 0;
    const hoursDescription = formData.hoursDescription;
    const totalHours = formData.totalHours;
    const justificationLinks = formData.justificationLinks || [];
    
    // Validate required fields
    const requiredFields = [
      'gameName', 'gameDescription', 'githubUrl', 'playableUrl'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        return new Response(`Missing required field: ${field}`, { status: 400 });
      }
    }

    // Validate that user has either hackatime projects OR additional hours
    const hasHackatimeProjects = hackatimeProjects && hackatimeProjects.length > 0;
    const hasAdditionalHours = additionalHours > 0;
    
    if (!hasHackatimeProjects && !hasAdditionalHours) {
      return new Response('You must have either hackatime projects OR additional hours to submit', { status: 400 });
    }

    // Only require hours description if additional hours are entered
    if (hasAdditionalHours && (!hoursDescription || !hoursDescription.trim())) {
      return new Response('Hours description is required when entering additional hours', { status: 400 });
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
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Project submitted successfully',
      projectId: result.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error submitting project:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to submit project' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
