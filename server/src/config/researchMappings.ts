/**
 * Shared constants and mappings for research benefits
 * 
 * This module handles the mapping between exercise names in the database
 * and the keys used in the RESEARCH_BENEFITS configuration.
 * 
 * @fileoverview Research benefit key mapping utilities
 */

/**
 * Maps exercise names to research benefit keys
 * 
 * Handles special cases where database names don't match config keys.
 * For example, "Jump Rope" in database maps to "jumprope" in research config.
 * 
 * @type {Record<string, string>}
 */
export const RESEARCH_EXERCISE_MAPPINGS: Record<string, string> = {
  'jump_rope': 'jumprope',
  'pullups': 'pull_ups',
  'hip_flexor_stretch': 'hip_flexor',
  'shoulder_roll_stretch': 'shoulder_roll',
  'catcow_stretch': 'cat_cow',
};

/**
 * Converts exercise name to research benefit key
 * 
 * This function standardizes exercise names from the database into keys
 * that match the RESEARCH_BENEFITS configuration. It handles:
 * - Converting to lowercase
 * - Replacing spaces with underscores
 * - Removing special characters
 * - Applying special mappings for known discrepancies
 * 
 * @param {string} exerciseName - The exercise name from database (e.g., "Jump Rope", "Pull-ups")
 * @returns {string} The key to use for RESEARCH_BENEFITS lookup (e.g., "jumprope", "pull_ups")
 * 
 * @example
 * ```typescript
 * getResearchKey("Jump Rope") // returns "jumprope"
 * getResearchKey("Pull-ups") // returns "pull_ups"
 * getResearchKey("Bench Press") // returns "bench_press"
 * ```
 */
export function getResearchKey(exerciseName: string): string {
  // Standardize the name: lowercase, replace spaces with underscores, remove special chars
  let nameKey = exerciseName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  
  // Apply special mappings if needed
  return RESEARCH_EXERCISE_MAPPINGS[nameKey] || nameKey;
}
