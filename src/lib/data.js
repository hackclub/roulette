
export function getCurrentRound(){
  return 1;
}



export const choices = {
  "camera":
    ["2d top down", "2d side scrolling", "2d isometric", "3d first person", "3d free camera", "2.5d", "interface-based"],
  "gameplay":
    ["puzzle", "platformer", "arcade", "rhythm", "story-based", "survival", "management", "combat", "stealth", "exploration", "deckbuilder", "clicker"],
  "setting":
    ["nature", "urban", "futuristic", "dystopian", "surreal", "digital", "fantasy", "non-world"]
}


export function isSelectedCountOk(selectedOptions, wheelOption ) {
  const totalCount = choices[wheelOption].length;
  const limit = Math.ceil(0.33 * totalCount);
  const totalLeft = totalCount - limit;
  if (selectedOptions.length > totalLeft) {
    return false
  }
  else {
    return true
  }


}
