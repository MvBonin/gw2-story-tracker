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
 * Filtert Quests basierend auf allen Personal Story Story-IDs (nicht nur Story ID 1)
 */
export function createPersonalStoryProgress(
	characterQuests: Map<string, number[]>,
	questDetails: Quest[],
	questToStory: Map<number, number>,
	personalStoryStoryIds: Set<number>
): PersonalStoryPhaseProgress[] {
	// Erstelle Map: Quest ID -> Character Names
	const questToCharacters = new Map<number, string[]>();
	
	for (const [characterName, questIds] of characterQuests.entries()) {
		for (const questId of questIds) {
			// Nur Personal Story Quests (alle Story-IDs der Personal Story Season)
			const storyId = questToStory.get(questId);
			if (storyId !== undefined && personalStoryStoryIds.has(storyId)) {
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
		// Nur Personal Story Quests (alle Story-IDs der Personal Story Season)
		const storyId = questToStory.get(quest.id);
		if (storyId !== undefined && personalStoryStoryIds.has(storyId)) {
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

