
const roundStartDates = {
  1: "2025-08-07",
  2: "2025-08-14",
  3: "2025-08-21",
  4: "2025-08-28",
}

// Ensure we have a fetch function available
const fetchFunction = globalThis.fetch || fetch;

export async function getProjectsSinceRoundNum(slackId, roundNum) {
  // Input validation
  if (!slackId || typeof slackId !== 'string' || slackId.trim() === '') {
    throw new Error('Invalid slackId: must be a non-empty string');
  }
  
  if (!roundNum || typeof roundNum !== 'number' || roundNum < 1 || roundNum > 4) {
    throw new Error('Invalid roundNum: must be a number between 1 and 4');
  }
  
  const roundStartDate = roundStartDates[roundNum];

  if (!roundStartDate) {
    throw new Error(`Invalid round number: ${roundNum}`);
  }

  try {
    // Fetch Hackatime data directly from their API
    const hackatimeUrl = `https://hackatime.hackclub.com/api/v1/users/${slackId}/stats?features=projects&start_date=${roundStartDate}`;
    
    // Use the available fetch function
    const hackatimeResponse = await fetchFunction(hackatimeUrl, {
      headers: { Accept: "application/json" },
    });

    if (!hackatimeResponse.ok) {
      const text = await hackatimeResponse.text();
      console.error(
        `[ERROR] Hackatime API responded with status: ${hackatimeResponse.status}, body: ${text}`,
      );
      throw new Error(`Hackatime API responded with status: ${hackatimeResponse.status}`);
    }

    const hackatimeData = await hackatimeResponse.json();

    if (!hackatimeData?.data?.projects) {
      console.error(
        `[ERROR] No projects found in Hackatime data. Full response:`,
        hackatimeData,
      );
      return [];
    }

    // Return the projects data
    return hackatimeData.data.projects || [];
    
  } catch (error) {
    console.error(
      "[FATAL ERROR] Unexpected error in getProjectsSinceRoundNum:",
      error,
    );
    throw error;
  }
}
