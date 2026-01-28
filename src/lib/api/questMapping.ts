/**
 * Quest-zu-Story-Mapping
 * 
 * Erstellt automatisch ein Mapping von Quest-IDs zu Story-IDs basierend auf
 * den Quest-Details von der GW2 API. Jede Quest hat ein optionales "story" Feld,
 * das die zugehörige Story-ID angibt.
 */

import { cached } from '$lib/utils/cache';


/**
 * Erstellt ein vollständiges Quest-zu-Story-Mapping aus ALLEN verfügbaren Quests
 * (ohne statischen Fallback - vollständig API-basiert)
 * 
 * @param forceRefresh - Wenn true, wird der Cache ignoriert
 * @returns Map von Quest-ID zu Story-ID
 */
export async function getQuestToStoryMap(forceRefresh = false): Promise<Map<number, number>> {
	const { getAllQuestIds, getAllQuestDetails } = await import('./gw2');
	
	return cached(
		'quest_to_story_map',
		async () => {
			const questIds = await getAllQuestIds(forceRefresh);
			const questDetails = await getAllQuestDetails(questIds, forceRefresh);
			
			const map = new Map<number, number>();
			for (const q of questDetails) {
				if (q && q.story !== undefined && q.story !== null) {
					map.set(q.id, q.story);
				}
			}
			return Object.fromEntries(map);
		},
		forceRefresh
	).then((record) => new Map(Object.entries(record).map(([k, v]) => [Number(k), Number(v)])));
}

/**
 * @deprecated Verwende getQuestToStoryMap() stattdessen
 */
export async function buildCompleteQuestToStoryMapping(forceRefresh = false): Promise<Map<number, number>> {
	return getQuestToStoryMap(forceRefresh);
}

/**
 * Findet alle Story-IDs, die ein Charakter basierend auf seinen Quests abgeschlossen hat
 * Verwendet das vollständige Quest-zu-Story-Mapping
 * 
 * @param characterQuestIds - Array von Quest-IDs, die der Charakter abgeschlossen hat
 * @returns Array von Story-IDs, die der Charakter abgeschlossen hat
 */
export async function getCompletedStoryIdsFromQuestsLive(
	characterQuestIds: number[]
): Promise<number[]> {
	const completedStoryIds = new Set<number>();
	
	if (characterQuestIds.length === 0) {
		return [];
	}
	
	// Verwende vollständiges Mapping (holt alle Quests, nicht nur abgeschlossene)
	const questToStoryMap = await getQuestToStoryMap();

	for (const questId of characterQuestIds) {
		const storyId = questToStoryMap.get(questId);
		if (storyId) {
			completedStoryIds.add(storyId);
		}
	}

	return Array.from(completedStoryIds);
}


