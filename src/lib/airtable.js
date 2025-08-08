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

  const user = await getUserBySlackId(userId);

  if (user) {
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


export async function isSpunForCurrentWheelRound({ slackId, wheelOption }) {
  console.log(slackId, wheelOption)
  const currentRound = getCurrentRound();
  const wheelOptionCaps = capitalise(wheelOption);



  const userRound = await getUserRound(slackId, currentRound);


  if (userRound) {
    var userRoundInfo = userRound.fields;

    if (userRoundInfo[`spin${wheelOptionCaps}`]) {
      return true

    }
    else {
      return false
    }
    console.log(userRoundInfo);
    console.log("CHECKINGCHECKING")
  }
  return true

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
