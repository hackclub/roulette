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

  console.log("CHECKING ")
  console.log(userId);
  const user = await getUserBySlackId(userId);

  if (user) {
    console.log(user.fields);
    console.log(user.fields.UserRounds)
    if (!user.fields.UserRounds) {
      return false;
    }
    else {
      return true
    }
  }
}

// this assumes that it has already checked that the wager is not yet done for the current round
export async function userWager({ slackId, wagerChoice, wagerAmount }) {

  console.log("airtable wager log attempted")

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




export async function userSpinWheel({ slackId }) {
  const userRecord = await requireUser(slackId);

  if (userRecord) {
    if (userRecord.UserRounds) {

    }else {
      const spin = await base('Spins').create([
        {
          fields: {
            roundNumber: currentRound,
            userRecord: [userRecord.id]
          }
        }
      ]);
    }
  }



}
