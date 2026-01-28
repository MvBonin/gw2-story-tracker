import { getPhaseForLevel, PERSONAL_STORY_SEASON_ID } from './personalStoryPhases';
import type { Quest } from '$lib/api/gw2';

export interface PersonalStoryPhaseProgress {
	phaseLevel: number;
	phaseName: string;
	quests: Array<{
		questId: number;
		questName: string;
		completedBy: string[];
	}>;
}

/**
 * Erstellt Personal Story Fortschritt gruppiert nach Phasen
 * Nur für Quests mit story === 1 (Personal Story)
 */
export function createPersonalStoryProgress(
	characterQuests: Map<string, number[]>,
	questDetails: Quest[],
	questToStory: Map<number, number>
): PersonalStoryPhaseProgress[] {
	// Erstelle Map: Quest ID -> Character Names
	const questToCharacters = new Map<number, string[]>();
	
	for (const [characterName, questIds] of characterQuests.entries()) {
		for (const questId of questIds) {
			// Nur Personal Story Quests (Story ID 1)
			if (questToStory.get(questId) === 1) {
				if (!questToCharacters.has(questId)) {
					questToCharacters.set(questId, []);
				}
				questToCharacters.get(questId)!.push(characterName);
			}
		}
	}
	
	// Erstelle Map: Quest ID -> Quest Detail (nur Personal Story Quests)
	const questDetailMap = new Map<number, Quest>();
	for (const quest of questDetails) {
		// Nur Personal Story Quests (Story ID 1)
		if (questToStory.get(quest.id) === 1) {
			questDetailMap.set(quest.id, quest);
		}
	}
	
	// Gruppiere Quests nach Phase
	const phaseMap = new Map<number, PersonalStoryPhaseProgress>();
	
	for (const [questId, quest] of questDetailMap.entries()) {
		const { phaseLevel, phaseName } = getPhaseForLevel(quest.level);
		
		if (!phaseMap.has(phaseLevel)) {
			phaseMap.set(phaseLevel, {
				phaseLevel,
				phaseName,
				quests: []
			});
		}
		
		const phase = phaseMap.get(phaseLevel)!;
		const completedBy = questToCharacters.get(questId) || [];
		
		phase.quests.push({
			questId,
			questName: quest.name,
			completedBy
		});
	}
	
	// Sortiere Phasen nach Level
	return Array.from(phaseMap.values()).sort((a, b) => a.phaseLevel - b.phaseLevel);
}

