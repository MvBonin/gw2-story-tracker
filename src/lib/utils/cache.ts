import { browser } from '$app/environment';

const CACHE_PREFIX = 'gw2_cache_';
const CACHE_DURATION = 1000 * 60 * 60; // 1 Stunde

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

/**
 * Speichert Daten im LocalStorage mit Timestamp
 */
export function setCache<T>(key: string, data: T): void {
	if (!browser) return;

	try {
		const entry: CacheEntry<T> = {
			data,
			timestamp: Date.now()
		};
		localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
	} catch (error) {
		console.warn('Failed to set cache:', error);
	}
}

/**
 * Liest Daten aus dem LocalStorage, wenn noch gültig
 */
export function getCache<T>(key: string): T | null {
	if (!browser) return null;

	try {
		const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
		if (!cached) return null;

		const entry: CacheEntry<T> = JSON.parse(cached);
		const age = Date.now() - entry.timestamp;

		// Prüfe ob Cache noch gültig ist
		if (age > CACHE_DURATION) {
			localStorage.removeItem(`${CACHE_PREFIX}${key}`);
			return null;
		}

		return entry.data;
	} catch (error) {
		console.warn('Failed to get cache:', error);
		return null;
	}
}

/**
 * Löscht einen Cache-Eintrag
 */
export function clearCache(key: string): void {
	if (!browser) return;

	localStorage.removeItem(`${CACHE_PREFIX}${key}`);
}

/**
 * Löscht alle Cache-Einträge
 */
export function clearAllCache(): void {
	if (!browser) return;

	const keys = Object.keys(localStorage);
	keys.forEach((key) => {
		if (key.startsWith(CACHE_PREFIX)) {
			localStorage.removeItem(key);
		}
	});
}

/**
 * Cache-Wrapper für async Funktionen
 */
export async function cached<T>(
	key: string,
	fetcher: () => Promise<T>,
	forceRefresh = false
): Promise<T> {
	// Prüfe Cache zuerst (wenn nicht erzwungen)
	if (!forceRefresh) {
		const cached = getCache<T>(key);
		if (cached !== null) {
			return cached;
		}
	}

	// Hole frische Daten
	const data = await fetcher();
	setCache(key, data);
	return data;
}

