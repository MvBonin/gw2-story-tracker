import { browser } from '$app/environment';

const API_KEY_COOKIE_NAME = 'gw2_api_key';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 Jahr

/**
 * Setzt einen Cookie im Browser
 */
export function setCookie(name: string, value: string, maxAge: number = COOKIE_MAX_AGE): void {
	if (!browser) return;

	document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Strict`;
}

/**
 * Liest einen Cookie aus dem Browser
 */
export function getCookie(name: string): string | null {
	if (!browser) return null;

	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);

	if (parts.length === 2) {
		return parts.pop()?.split(';').shift() || null;
	}

	return null;
}

/**
 * Löscht einen Cookie
 */
export function deleteCookie(name: string): void {
	if (!browser) return;

	document.cookie = `${name}=; max-age=0; path=/`;
}

/**
 * Speichert den API Key in einem Cookie
 */
export function saveApiKey(apiKey: string): void {
	setCookie(API_KEY_COOKIE_NAME, apiKey);
}

/**
 * Liest den API Key aus dem Cookie
 */
export function getApiKey(): string | null {
	return getCookie(API_KEY_COOKIE_NAME);
}

/**
 * Löscht den gespeicherten API Key
 */
export function clearApiKey(): void {
	deleteCookie(API_KEY_COOKIE_NAME);
}

