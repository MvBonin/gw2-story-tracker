/**
 * Personal Story Phasen-Mapping
 * Gruppiert Quests nach Story-Level (level-Feld in Quest-Details)
 */

export const PERSONAL_STORY_PHASES: Record<number, string> = {
	1: 'Origins',
	10: 'Early Life',
	20: 'Orders of Tyria',
	30: 'Claw Island',
	40: 'The Pact',
	50: 'Further Steps',
	60: 'The Battle for Orr',
	70: 'Victory or Death',
	80: 'Zhaitan'
};

/**
 * Gibt den Phasen-Namen für ein Level zurück
 */
export function getPhaseName(level: number): string {
	return PERSONAL_STORY_PHASES[level] || `Level ${level}`;
}

/**
 * Gruppiert Level in Phasen-Bereiche
 * Gibt den Phasen-Namen für den niedrigsten Level in diesem Bereich zurück
 */
export function getPhaseForLevel(level: number): { phaseLevel: number; phaseName: string } {
	// Finde die passende Phase (niedrigster Level, der <= level ist)
	const phaseLevels = Object.keys(PERSONAL_STORY_PHASES)
		.map(Number)
		.sort((a, b) => a - b);
	
	let phaseLevel = 1;
	for (const pl of phaseLevels) {
		if (pl <= level) {
			phaseLevel = pl;
		} else {
			break;
		}
	}
	
	return {
		phaseLevel,
		phaseName: PERSONAL_STORY_PHASES[phaseLevel]
	};
}

/**
 * Personal Story Season ID
 */
export const PERSONAL_STORY_SEASON_ID = '215AAA0F-CDAC-4F93-86DA-C155A99B5784';

