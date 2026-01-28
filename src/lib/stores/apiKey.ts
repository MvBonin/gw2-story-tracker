import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getApiKey, saveApiKey, clearApiKey } from '$lib/utils/cookies';

interface ApiKeyState {
	key: string | null;
	isValid: boolean;
	isValidating: boolean;
	error: string | null;
}

function createApiKeyStore() {
	const { subscribe, set, update } = writable<ApiKeyState>({
		key: null,
		isValid: false,
		isValidating: false,
		error: null
	});

	// Lade API Key aus Cookie beim Initialisieren
	if (browser) {
		const savedKey = getApiKey();
		if (savedKey) {
			set({
				key: savedKey,
				isValid: true,
				isValidating: false,
				error: null
			});
		}
	}

	return {
		subscribe,
		setKey: (key: string) => {
			saveApiKey(key);
			update((state) => ({
				...state,
				key,
				error: null
			}));
		},
		setValid: (isValid: boolean) => {
			update((state) => ({
				...state,
				isValid,
				isValidating: false,
				error: isValid ? null : state.error
			}));
		},
		setValidating: (isValidating: boolean) => {
			update((state) => ({
				...state,
				isValidating,
				error: null
			}));
		},
		setError: (error: string | null) => {
			update((state) => ({
				...state,
				error,
				isValidating: false,
				isValid: false
			}));
		},
		clear: () => {
			clearApiKey();
			set({
				key: null,
				isValid: false,
				isValidating: false,
				error: null
			});
		}
	};
}

export const apiKeyStore = createApiKeyStore();

