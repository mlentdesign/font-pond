// Meaning-based matching inside the existing search (2026-10-04). Words the
// keyword engine cannot place are looked up in a precomputed table of nearest
// engine words. No model runs in the browser and nothing visible changes.
// Set to false to turn the whole tier off; searches then behave exactly as
// they did before it existed.
export const MEANING_MATCH_ENABLED = true;
