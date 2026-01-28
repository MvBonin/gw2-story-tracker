import { cached, getCache, setCache } from '$lib/utils/cache';

const GW2_API_BASE = 'https://api.guildwars2.com/v2';

export interface TokenInfo {
	id: string;
	name: string;
	permissions: string[];
}

export interface Character {
	name: string;
	race: string;
	gender: string;
	profession: string;
	level: number;
	created: string;
}

export interface Achievement {
	id: number;
	name: string;
	description?: string;
	requirement?: string;
	locked_text?: string;
	type?: string;
	flags?: string[];
	tiers?: Array<{
		count: number;
		points: number;
	}>;
	prerequisites?: number[];
	rewards?: Array<{
		type: string;
		id: number;
		count?: number;
	}>;
}

export interface AccountAchievement {
	id: number;
	current?: number;
	max?: number;
	done?: boolean;
	bits?: number[];
	repeated?: number;
	unlocked?: boolean;
}

/**
 * Validiert einen GW2 API Key
 */
export async function validateApiKey(apiKey: string): Promise<TokenInfo | null> {
	try {
		const response = await fetch(`${GW2_API_BASE}/tokeninfo?access_token=${apiKey}`);
		
		if (!response.ok) {
			return null;
		}

		const data: TokenInfo = await response.json();
		return data;
	} catch (error) {
		console.error('Error validating API key:', error);
		return null;
	}
}

/**
 * Holt Account-Informationen
 */
export async function getAccountInfo(apiKey: string): Promise<any> {
	try {
		const response = await fetch(`${GW2_API_BASE}/account?access_token=${apiKey}`);
		
		if (!response.ok) {
			throw new Error('Failed to fetch account info');
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching account info:', error);
		throw error;
	}
}

/**
 * Holt die Liste aller Charaktere (mit Caching)
 */
export async function getCharacters(apiKey: string, forceRefresh = false): Promise<string[]> {
	return cached(
		`characters_${apiKey}`,
		async () => {
			try {
				const response = await fetch(`${GW2_API_BASE}/characters?access_token=${apiKey}`);
				
				if (!response.ok) {
					throw new Error('Failed to fetch characters');
				}

				return await response.json();
			} catch (error) {
				console.error('Error fetching characters:', error);
				throw error;
			}
		},
		forceRefresh
	);
}

/**
 * Holt Details eines spezifischen Charakters
 */
export async function getCharacterDetails(apiKey: string, characterName: string): Promise<Character> {
	try {
		const encodedName = encodeURIComponent(characterName);
		const response = await fetch(
			`${GW2_API_BASE}/characters/${encodedName}?access_token=${apiKey}`
		);
		
		if (!response.ok) {
			throw new Error(`Failed to fetch character details for ${characterName}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error fetching character details for ${characterName}:`, error);
		throw error;
	}
}

/**
 * Holt alle Charakter-Details (mit Caching)
 */
export async function getAllCharacterDetails(apiKey: string, forceRefresh = false): Promise<Character[]> {
	return cached(
		`character_details_${apiKey}`,
		async () => {
			try {
				const characterNames = await getCharacters(apiKey, forceRefresh);
				
				// Rate limiting: Warte 100ms zwischen Requests
				const characters: Character[] = [];
				for (const name of characterNames) {
					const character = await getCharacterDetails(apiKey, name);
					characters.push(character);
					await new Promise((resolve) => setTimeout(resolve, 100));
				}

				return characters;
			} catch (error) {
				console.error('Error fetching all character details:', error);
				throw error;
			}
		},
		forceRefresh
	);
}

/**
 * Holt Account-Achievements (mit Caching)
 */
export async function getAccountAchievements(apiKey: string, forceRefresh = false): Promise<AccountAchievement[]> {
	return cached(
		`account_achievements_${apiKey}`,
		async () => {
			try {
				const response = await fetch(`${GW2_API_BASE}/account/achievements?access_token=${apiKey}`);
				
				if (!response.ok) {
					throw new Error('Failed to fetch account achievements');
				}

				return await response.json();
			} catch (error) {
				console.error('Error fetching account achievements:', error);
				throw error;
			}
		},
		forceRefresh
	);
}

/**
 * Holt Achievement-Details für gegebene IDs
 */
export async function getAchievementDetails(achievementIds: number[]): Promise<Achievement[]> {
	try {
		if (achievementIds.length === 0) return [];

		const idsParam = achievementIds.join(',');
		const response = await fetch(`${GW2_API_BASE}/achievements?ids=${idsParam}`);
		
		if (!response.ok) {
			throw new Error('Failed to fetch achievement details');
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching achievement details:', error);
		throw error;
	}
}

/**
 * Holt abgeschlossene Quests für einen Charakter
 * GW2 API Endpoint: /v2/characters/{name}/quests
 * Gibt eine Liste von Quest-IDs zurück, die der Charakter abgeschlossen hat
 */
export async function getCharacterQuests(
	apiKey: string,
	characterName: string,
	forceRefresh = false
): Promise<number[]> {
	const cacheKey = `character_quests_${characterName}_${apiKey}`;
	
	return cached(
		cacheKey,
		async () => {
			try {
				const encodedName = encodeURIComponent(characterName);
				const response = await fetch(
					`${GW2_API_BASE}/characters/${encodedName}/quests?access_token=${apiKey}`
				);
				
				if (!response.ok) {
					if (response.status === 404) {
						return [];
					}
					throw new Error(`Failed to fetch quests for ${characterName}`);
				}

				return await response.json();
			} catch (error) {
				console.error(`Error fetching quests for ${characterName}:`, error);
				return [];
			}
		},
		forceRefresh
	);
}

/**
 * Holt Quests für alle Charaktere
 */
export async function getAllCharacterQuests(
	apiKey: string,
	characterNames: string[],
	forceRefresh = false
): Promise<Map<string, number[]>> {
	const cacheKey = `all_character_quests_${apiKey}`;
	
	// Prüfe Cache (als Record für JSON-Serialisierung)
	if (!forceRefresh) {
		const cached = getCache<Record<string, number[]>>(cacheKey);
		if (cached) {
			return new Map(Object.entries(cached));
		}
	}

	const quests = new Map<string, number[]>();

	// Rate limiting: Warte 100ms zwischen Requests
	for (const name of characterNames) {
		const characterQuests = await getCharacterQuests(apiKey, name, forceRefresh);
		quests.set(name, characterQuests);
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	// Speichere im Cache als Record (für JSON-Serialisierung)
	const questsRecord: Record<string, number[]> = Object.fromEntries(quests);
	setCache(cacheKey, questsRecord);

	return quests;
}

/**
 * Holt alle verfügbaren Quest-IDs von der API
 * GW2 API Endpoint: /v2/quests (ohne Parameter)
 * Gibt eine Liste aller verfügbaren Quest-IDs zurück
 */
export async function getAllQuestIds(forceRefresh = false): Promise<number[]> {
	return cached(
		'all_quest_ids',
		async () => {
			try {
				const response = await fetch(`${GW2_API_BASE}/quests`);

				if (!response.ok) {
					throw new Error('Failed to fetch all quest IDs');
				}

				return await response.json();
			} catch (error) {
				console.error('Error fetching all quest IDs:', error);
				throw error;
			}
		},
		forceRefresh
	);
}

/**
 * Holt Quest-Details für alle angegebenen Quest-IDs
 * Optimiert für Batch-Requests (bis zu 200 IDs pro Request)
 */
export async function getAllQuestDetails(
	questIds: number[],
	forceRefresh = false
): Promise<Quest[]> {
	if (questIds.length === 0) return [];

	const cacheKey = `all_quest_details_${questIds.slice(0, 10).join(',')}_${questIds.length}`;

	return cached(
		cacheKey,
		async () => {
			const allQuestDetails: Quest[] = [];
			const batchSize = 200;

			for (let i = 0; i < questIds.length; i += batchSize) {
				const batch = questIds.slice(i, i + batchSize);
				try {
					const response = await fetch(`${GW2_API_BASE}/quests?ids=${batch.join(',')}`);

					if (!response.ok) {
						console.warn(`Failed to fetch quest batch ${i}-${i + batchSize}`);
						continue;
					}

					const batchDetails = await response.json();
					allQuestDetails.push(...batchDetails);

					// Rate limiting: Warte 100ms zwischen Batches
					if (i + batchSize < questIds.length) {
						await new Promise((resolve) => setTimeout(resolve, 100));
					}
				} catch (error) {
					console.error(`Error fetching quest batch ${i}-${i + batchSize}:`, error);
				}
			}

			return allQuestDetails;
		},
		forceRefresh
	);
}

