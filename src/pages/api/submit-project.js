import { requireUser } from '../../lib/auth.js';
import { submitProjectToAirtable, getUserRound, updateUserRewards } from '../../lib/airtable.js';
import { getCurrentRound } from '../../lib/data.js';
import { getSecurityHeaders, sanitizeString, isValidUrl, validateNumber, validateArray } from '../../lib/security.js';

// Helper function to calculate target hours from wager choice
function getTargetHours(wagerChoice) {
  const multiplierToHours = { '1.5x': 5, '2x': 10, '3x': 25 };
  return multiplierToHours[wagerChoice] || 0;
}

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
    const hackatimeProjectDetails = validateArray(formData.hackatimeProjectDetails, 50);
    const additionalHours = validateNumber(formData.additionalHours, 0, 1000);
    const hoursDescription = sanitizeString(formData.hoursDescription, 1000);
    const totalHours = sanitizeString(formData.totalHours, 100);
    const justificationLinks = validateArray(formData.justificationLinks, 20).map(link => sanitizeString(link, 500));
    const themeExplanation = sanitizeString(formData.themeExplanation, 2000);
    const spinCamera = sanitizeString(formData.spinCamera, 100);
    const spinGameplay = sanitizeString(formData.spinGameplay, 100);
    const spinSetting = sanitizeString(formData.spinSetting, 100);
    
    // Validate required fields
    const requiredFields = [
      'gameName', 'gameDescription', 'githubUrl', 'playableUrl', 'themeExplanation'
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
    
    // Get user's wager data to calculate target hours and get wager details
    let targetHours = 0;
    let wagerChoice = 'N/A';
    let wagerAmount = 0;
    try {
      const userRound = await getUserRound(user.slackId, currentRound);
      if (userRound && userRound.fields.wagerChoice) {
        wagerChoice = userRound.fields.wagerChoice;
        wagerAmount = userRound.fields.wagerAmount || 0;
        targetHours = getTargetHours(wagerChoice);
      }
    } catch (error) {
      console.error('Failed to fetch user round for target hours:', error);
    }
    
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
      
      // Theme information
      spinCamera: spinCamera,
      spinGameplay: spinGameplay,
      spinSetting: spinSetting,
      themeExplanation: themeExplanation,
      
      // Wager information
      wagerChoice: wagerChoice,
      wagerAmount: wagerAmount,
      initialChips: Number(user.chips || 0),
      
      // Hours and projects
      hackatimeProjects: hackatimeProjects,
      hackatimeProjectDetails: hackatimeProjectDetails,
      additionalHours: additionalHours,
      hoursDescription: hoursDescription,
      totalHours: totalHours,
      targetHours: targetHours,
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
    
    // Calculate and award rewards automatically
    try {
      // Get user's current wager data to calculate rewards
      const userRound = await getUserRound(user.slackId, currentRound);
      if (userRound) {
        const wagerChoice = userRound.fields.wagerChoice;
        const wagerAmount = userRound.fields.wagerAmount;
        const targetHours = getTargetHours(wagerChoice);
        
        // Calculate total hours from submission
        const totalHoursNum = parseFloat(totalHours.replace('h', '').replace('min', '')) || 0;
        
        // Calculate expected chips (only if hours meet target)
        let chipsToAward = 0;
        if (totalHoursNum >= targetHours) {
          const multiplierValues = { '1.5x': 1.5, '2x': 2, '3x': 3 };
          const multiplier = multiplierValues[wagerChoice] || 1.5;
          chipsToAward = Math.round(wagerAmount * multiplier);
        }
        
        // Calculate respin tokens (1 for every 3 hours above target)
        const hoursAboveTarget = Math.max(0, totalHoursNum - targetHours);
        const respinTokensToAward = Math.floor(hoursAboveTarget / 3);
        
        // Calculate lifeline chips (bring user up to 10 chips minimum if they didn't hit target)
        let lifelineChips = 0;
        if (totalHoursNum < targetHours) {
          const currentChips = Number(user.chips || 0);
          lifelineChips = Math.max(0, 10 - currentChips);
        }
        
        // Update user's chips and respin tokens in database
        const totalChipsToAward = chipsToAward + lifelineChips;
        if (totalChipsToAward > 0 || respinTokensToAward > 0) {
          const currentChips = Number(user.chips || 0);
          const currentRespins = Number(user.respinTokens || 0);
          
          const newChips = currentChips + totalChipsToAward;
          const newRespins = currentRespins + respinTokensToAward;
          
          await updateUserRewards(user.slackId, newChips, newRespins);
        }
      }
    } catch (rewardError) {
      console.error('Error awarding rewards:', rewardError);
      // Don't fail the submission if reward calculation fails
    }
    
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
