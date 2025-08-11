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

const currentRound = 1;


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


export async function isSpunForCurrentWheelRound({ slackId, wheelOption }) {
  const currentRound = getCurrentRound();
  const wheelOptionCaps = capitalise(wheelOption);

  const userRound = await getUserRound(slackId, currentRound);

  if (userRound) {
    var userRoundInfo = userRound.fields;

    if (userRoundInfo[`spin${wheelOptionCaps}`]) {
      return true
    } else {
      return false
    }
  }
  return true
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
  
  // Build justification with links and screenshot
  let justification = "Hackatime projects: " + projectData.hackatimeProjects.join(', ') + "\nAdditional hours: " + projectData.additionalHours + "\nSelf-reported justification: " + projectData.hoursDescription;

  
  if (projectData.justificationLinks && projectData.justificationLinks.length > 0) {
    justification += "\nJustification links: " + projectData.justificationLinks.join(', ');
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
