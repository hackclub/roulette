
const roundStartDates = {
  1: "2025-08-07",
  2: "2025-08-14",
  3: "2025-08-21",
  4: "2025-08-28",
}
export async function getProjectsSinceRoundNum(slackId, roundNum) {
  const roundStartDate = roundStartDates[roundNum];

  if (!roundStartDate) {
    throw new Error(`Invalid round number: ${roundNum}`);
  }

  try {
    // Fetch Hackatime data directly from their API
    const hackatimeUrl = `https://hackatime.hackclub.com/api/v1/users/${slackId}/stats?features=projects&start_date=${roundStartDate}`;
    console.log(`[DEBUG] Fetching Hackatime data for slackId: ${slackId}`);
    
    const hackatimeResponse = await fetch(hackatimeUrl, {
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

    console.log(
      "[DEBUG] Hackatime data projects:",
      JSON.stringify(hackatimeData.data.projects, null, 2),
    );

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
