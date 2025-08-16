import Airtable from 'airtable';
import dotenv from 'dotenv';
import { getCurrentRound } from './data.js';
dotenv.config();



const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export async function getUserBySlackId(slackId) {
  const records = await base('Users')
    .select({
      filterByFormula: `{slackId} = "${slackId}"`,
      maxRecords: 1,
    })
    .firstPage();

  return records[0];
}

export async function getUserRound(slackId, roundNumber) {
  const userRoundId = slackId + roundNumber;

  const records = await base('UserRounds')
    .select({
      filterByFormula: `{userRoundId} = "${userRoundId}"`,
      maxRecords: 1,
    })
    .firstPage();

    return records[0];
}

export async function createOrUpdateUser({ slackId, name, avatar, email}) {
  const existingUser = await getUserBySlackId(slackId);

  if (existingUser) {
    return base('Users').update(existingUser.id, {
      'name': name,
      'avatar': avatar,
      'email': email
    });
  } else {
    return base('Users').create({
      'slackId': slackId,
      'name': name,
      'avatar': avatar,
      'chips': 10,
      'email': email
    });
  }
}

export async function isWageredForCurrentRound({ userId }) {
  const currentRound = getCurrentRound();
  const userRound = await getUserRound(userId, currentRound);
  if (!userRound) return false;
  const f = userRound.fields || {};
  return Boolean(f.wagerChoice && f.wagerAmount);
}

// this assumes that it has already checked that the wager is not yet done for the current round
export async function userWager({ slackId, wagerChoice, wagerAmount }) {

  const currentRound = getCurrentRound();

  const user = await getUserBySlackId(slackId);

  return base('UserRounds').create({
    'slackId': slackId,
    'roundNumber': currentRound,
    'userRecord': [user.id],
    'wagerChoice': wagerChoice,
    'wagerAmount': wagerAmount
  });
}

export async function resetRoundWithRespin(slackId) {
  // expects: Users table has a numeric field `respinTokens`
  const currentRound = getCurrentRound();
  const user = await getUserBySlackId(slackId);
  if (!user) throw new Error('user not found');
  const tokens = Number(user.fields.respinTokens || 0);
  if (tokens <= 0) {
    throw new Error('No respin tokens');
  }

  const userRound = await getUserRound(slackId, currentRound);
  if (!userRound) throw new Error('No round to reset');

  // refund wager chips
  const wagerAmount = Number(userRound.fields.wagerAmount || 0);
  const currentChips = Number(user.fields.chips || 0);
  const currentRespins = Number(user.fields.numberOfRespins || 0);

  // decrement token, increment numberOfRespins, and optionally refund chips
  await base('Users').update(user.id, {
    respinTokens: tokens - 1,
    numberOfRespins: currentRespins + 1,
    chips: currentChips + wagerAmount,
  });

  // remove the round entry entirely
  await base('UserRounds').destroy(userRound.id);

  return { success: true, remainingTokens: tokens - 1, refunded: wagerAmount };
}


export async function isSpunForCurrentWheelRound(slackId, wheelOption) {
  const userRound = await getUserRound(slackId, getCurrentRound());
  if (!userRound) return false;
  
  const fieldName = `spin${wheelOption.charAt(0).toUpperCase() + wheelOption.slice(1)}`;
  return userRound.fields[fieldName] || false;
}

export async function updateUserRewards(slackId, newChips, newRespins) {
  const user = await getUserBySlackId(slackId);
  if (!user) throw new Error('user not found');
  
  const updateData = {};
  if (newChips !== undefined) {
    updateData.chips = newChips;
  }
  if (newRespins !== undefined) {
    updateData.respinTokens = newRespins;
  }
  
  if (Object.keys(updateData).length > 0) {
    await base('Users').update(user.id, updateData);
  }
  
  return { chips: newChips, respinTokens: newRespins };
}

export async function hasEnoughChips(slackId, wageredChips) {
  const user = await getUserBySlackId(slackId);
  return user.fields.chips >= wageredChips;
}

export async function decrementUserChips(slackId, amount) {
  const user = await getUserBySlackId(slackId);
  if (!user) throw new Error('user not found');
  const current = Number(user.fields.chips || 0);
  const next = Math.max(0, current - Number(amount || 0));
  await base('Users').update(user.id, { chips: next });
  return next;
}


export async function userSpinWheel(slackId, selectedOptions, wheelOption) {
  const wheelOptionName = `spin${capitalise(wheelOption)}`
  const spinResult = choose(selectedOptions);
  const currentRound = getCurrentRound();

  const userRound = await getUserRound(slackId, currentRound);


  const updateSpin = await base('UserRounds').update(userRound.id, {
    [wheelOptionName]: spinResult,
  });

  return spinResult;

}


function capitalise(word){
  return word[0].toUpperCase() + word.slice(1).toLowerCase();


}


function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

export async function updateUserDetails(slackId, formData) {
  const user = await getUserBySlackId(slackId);
  if (!user) throw new Error('user not found');
  
  // Update user details in Airtable
  await base('Users').update(user.id, {
    firstname: formData.firstname,
    lastname: formData.lastname,
    doingwell: formData.doingwell,
    improve: formData.improve,
    hearabout: formData.hearabout,
    addr1: formData.addr1,
    addr2: formData.addr2,
    city: formData.city,
    state: formData.state,
    country: formData.country,
    zipcode: formData.zipcode,
    githubusername: formData.githubusername,
    birthday: formData.birthday
  });
  
  return { success: true };
}

export async function submitProjectToAirtable(projectData) {
  const description = projectData.gameName + " - " + projectData.gameDescription;
  
  // Parse total hours to number for calculations
  const totalHoursNum = parseFloat(projectData.totalHours.replace('h', '').replace('min', '')) || 0;
  
  // Build theme justification combining spins and explanation
  const themeJustification = `Camera: ${projectData.spinCamera}\nGameplay: ${projectData.spinGameplay}\nSetting: ${projectData.spinSetting}\n\nTheme Explanation: ${projectData.themeExplanation}`;
  
  // Build comprehensive justification with all wager and chip information
  let justification = `=== WAGER & CHIP INFORMATION ===\n`;
  justification += `Initial chips: ${projectData.initialChips || 0}\n`;
  justification += `Wager choice: ${projectData.wagerChoice || 'N/A'}\n`;
  justification += `Wager amount: ${projectData.wagerAmount || 0} chips\n`;
  justification += `Target hours: ${projectData.targetHours || 0}h\n`;
  justification += `Total hours submitted: ${projectData.totalHours}\n`;
  justification += `Hours vs target: ${totalHoursNum >= projectData.targetHours ? 'MET' : 'NOT MET'}\n`;
  
  // Calculate and show chip rewards
  let chipsGained = 0;
  let finalChips = 0;
  
  if (totalHoursNum >= projectData.targetHours) {
    // Normal wager multiplier chips
    const multiplierValues = { '1.5x': 1.5, '2x': 2, '3x': 3 };
    const multiplier = multiplierValues[projectData.wagerChoice] || 1.5;
    chipsGained = Math.round((projectData.wagerAmount || 0) * multiplier);
    justification += `Chips gained (wager multiplier): +${chipsGained}\n`;
  } else {
    // Lifeline chips
    const currentChips = projectData.initialChips || 0;
    chipsGained = Math.max(0, 10 - currentChips);
    justification += `Chips gained (lifeline): +${chipsGained}\n`;
  }
  
  finalChips = (projectData.initialChips || 0) + chipsGained;
  justification += `Final chips: ${finalChips}\n\n`;
  
  // Add project details
  justification += `=== PROJECT DETAILS ===\n`;
  
  // Add hackatime projects with their times
  if (projectData.hackatimeProjects && projectData.hackatimeProjects.length > 0) {
    justification += `Hackatime projects:\n`;
    projectData.hackatimeProjects.forEach((project, index) => {
      const projectDetails = projectData.hackatimeProjectDetails?.[index] || {};
      const hours = projectDetails.hours || 0;
      const minutes = projectDetails.minutes || 0;
      const timeString = hours > 0 || minutes > 0 ? ` (${hours}h ${minutes}min)` : '';
      justification += `  - ${project}${timeString}\n`;
    });
  } else {
    justification += `Hackatime projects: None selected\n`;
  }
  
  justification += `Additional hours: ${projectData.additionalHours}\n`;
  justification += `Self-reported justification: ${projectData.hoursDescription}\n`;
  
  if (projectData.justificationLinks && projectData.justificationLinks.length > 0) {
    justification += `Justification links: ${projectData.justificationLinks.join(', ')}\n`;
  }
  
  // Add lifeline information to justification
  if (totalHoursNum < projectData.targetHours) {
    justification += `\nLIFELINE: User did not meet target hours but received lifeline chips to maintain minimum 10 chips.`;
  }
  
  try {
    // Create record in YSWS Project Submission table
    const record = await base('YSWS Project Submission').create({
      'SlackId': projectData.slackId,
      'Email': projectData.userEmail,
      'GitHub Username': projectData.githubUsername,
      'First Name': projectData.firstname,
      'Last Name': projectData.lastname,
      'Birthday': projectData.birthday,
      'Screenshot': [ { "url": projectData.screenshotUrl } ],
      
      // Project details
      'Description': description,
      'Code URL': projectData.githubUrl,
      'Playable URL': projectData.playableUrl,
      // Screenshot URL is now included in the justification field
      
      // Hours and projects
      'Self-reported hours': projectData.totalHours,
      'Justification': justification,
      'Theme Justification': themeJustification,
      
      // Address fields
      'Address (Line 1)': projectData.address.line1,
      'Address (Line 2)': projectData.address.line2,
      'City': projectData.address.city,
      'State / Province': projectData.address.state,
      'Country': projectData.address.country,
      'ZIP / Postal Code': projectData.address.zipcode,
      
      // Feedback
      'How did you hear about this?': projectData.howHeard,
      'What are we doing well?': projectData.doingWell,
      'How can we improve?': projectData.improve,
      
      // Metadata
      'Round': projectData.roundNumber
    });
    
    // Now link this submission to the UserRounds record
    try {
      const currentRound = getCurrentRound();
      const userRound = await getUserRound(projectData.slackId, currentRound);
      
      if (userRound) {
        // Update the UserRounds record to link to this project submission
        await base('UserRounds').update(userRound.id, {
          'projectSubmission': [record.id] // Link to the project submission record
        });
      }
    } catch (linkError) {
      console.error('Failed to link project submission to UserRounds:', linkError);
      // Continue even if linking fails - the project submission was still created
    }
    
    return record;
  } catch (error) {
    console.error('Error submitting project to Airtable:', error);
    throw new Error(`Failed to submit project: ${error.message}`);
  }
}
