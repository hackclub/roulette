import Airtable from 'airtable';
import dotenv from 'dotenv';
dotenv.config();


const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// OHH DATABASE get users based on slackid
export async function getUserBySlackId(slackId) {
  const records = await base('Users')
    .select({
      filterByFormula: `{slackId} = "${slackId}"`,
      maxRecords: 1,
    })
    .firstPage();

  return records[0];
}


export async function createOrUpdateUser({ slackId, name, avatar, chips = 10 }) {
  const existingUser = await getUserBySlackId(slackId);

  if (existingUser) {

    return base('Users').update(existingUser.id, {
      'name': name,
      'avatar': avatar,
      'chips': chips,
    });
  } else {
    return base('Users').create({
      'slackId': slackId,
      'name': name,
      'avatar': avatar,
      'chips': chips,
    });
  }
}
