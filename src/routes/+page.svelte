<script lang="ts">
	import { onMount } from 'svelte';
	import { apiKeyStore } from '$lib/stores/apiKey';
	import { validateApiKey, getCharacters, getAllCharacterQuests, getAllCharacterDetails, type Character } from '$lib/api/gw2';
	import { getStoriesAndSeasons, type Season } from '$lib/api/stories';
	import { mapStoryProgress } from '$lib/utils/storyProgress';
	import { loadingProgressStore } from '$lib/stores/loadingProgress';
	import type { StoryProgress } from '$lib/utils/storyProgress';
	import StoryAccordion from '$lib/components/StoryAccordion.svelte';
	import LoadingProgress from '$lib/components/LoadingProgress.svelte';
	import { browser } from '$app/environment';
	import { getCookieConsent } from '$lib/utils/cookieConsent';
	import { clearPersonalStoryCache } from '$lib/utils/personalStoryLoader';
	import { getProfessionIcon } from '$lib/utils/professionIcons';
	import favicon from '$lib/assets/favicon.png';

	// Login state
	let apiKeyInput = $state('');
	let errorMessage = $state('');
	let isLoginLoading = $state(false);
	let cookieConsent = $state<'accepted' | 'rejected' | null>(null);
	let showBanner = $state(false);

	// Stories state
	let storyProgress = $state<StoryProgress[]>([]);
	let seasons = $state<Season[]>([]);
	let allCharacters = $state<string[]>([]);
	let characterDetails = $state<Map<string, Character>>(new Map());
	let characterQuests = $state<Map<string, number[]>>(new Map());
	let isStoriesLoading = $state(true);
	let storiesError = $state<string | null>(null);
	let currentApiKey = $state<string | null>(null);
	let lastSuccessfulLoadAt = $state<number | null>(null);
	let selectedCharacter = $state<string | null>(null);
	let showFilterPanel = $state(false);

	const getLastLoadStorageKey = (apiKey: string) => `gw2_last_success_load_${apiKey}`;
	const readLastSuccessfulLoad = (apiKey: string) => {
		if (!browser) return null;
		const raw = localStorage.getItem(getLastLoadStorageKey(apiKey));
		if (!raw) return null;
		const num = Number(raw);
		return Number.isFinite(num) ? num : null;
	};

	const persistLastSuccessfulLoad = (apiKey: string, ts: number) => {
		if (!browser) return;
		try {
			localStorage.setItem(getLastLoadStorageKey(apiKey), String(ts));
		} catch (error) {
			console.warn('Failed to persist last load timestamp:', error);
		}
	};

	// Reactive API key state
	let hasValidApiKey = $state(false);

	// Check cookie consent status and API key status
	onMount(() => {
		if (browser) {
			const updateConsent = () => {
				const consent = getCookieConsent();
				cookieConsent = consent;
				showBanner = consent === null;
			};
			
			updateConsent();

			// Subscribe to API key store to reactively update UI
			const unsubscribe = apiKeyStore.subscribe((state) => {
				hasValidApiKey = state.isValid && !!state.key;
				currentApiKey = state.key;
				lastSuccessfulLoadAt = state.key ? readLastSuccessfulLoad(state.key) : null;
				
				// If API key becomes valid, load stories
				if (hasValidApiKey && state.key) {
					loadStories(state.key);
				} else {
					// Reset stories state when API key is removed
					storyProgress = [];
					seasons = [];
					allCharacters = [];
					characterDetails = new Map();
					characterQuests = new Map();
					isStoriesLoading = false;
					storiesError = null;
					lastSuccessfulLoadAt = null;
				}
			});
			
			// Listen for storage changes (when cookie consent is updated in other tabs)
			const handleStorageChange = (e: StorageEvent) => {
				if (e.key === 'cookieConsent') {
					updateConsent();
				}
			};
			
			// Listen for custom events (when cookie consent is updated in same tab)
			const handleCookieConsentUpdate = (e: CustomEvent) => {
				cookieConsent = e.detail;
				showBanner = e.detail === null;
			};
			
			window.addEventListener('storage', handleStorageChange);
			window.addEventListener('cookieConsentUpdate', handleCookieConsentUpdate as EventListener);
			
			return () => {
				unsubscribe();
				window.removeEventListener('storage', handleStorageChange);
				window.removeEventListener('cookieConsentUpdate', handleCookieConsentUpdate as EventListener);
			};
		}
	});

	async function loadStories(apiKey: string, forceRefresh = false) {
		isStoriesLoading = true;
		storiesError = null;

		// Starte Loading Progress
		loadingProgressStore.start();

		try {
			if (forceRefresh) {
				clearPersonalStoryCache();
			}
			// Schritt 1: Lade Character-Namen und Details (inkl. Profession)
			loadingProgressStore.setStepLoading('characters');
			const characterNames = await getCharacters(apiKey, forceRefresh);
			allCharacters = characterNames;
			const characters = await getAllCharacterDetails(
				apiKey,
				forceRefresh,
				(current, total) => {
					loadingProgressStore.setStepProgress('characters', current, total);
				}
			);
			characterDetails = new Map(characters.map((c) => [c.name, c]));
			loadingProgressStore.setStepCompleted('characters');

			// Schritt 2: Lade Quests für alle Charaktere (Character-spezifische Story-Completion)
			loadingProgressStore.setStepLoading('achievements');
			characterQuests = await getAllCharacterQuests(
				apiKey,
				characterNames,
				forceRefresh,
				(current, total) => {
					loadingProgressStore.setStepProgress('achievements', current, total);
				}
			);
			loadingProgressStore.setStepCompleted('achievements');

			// Schritt 3: Lade Story- und Season-Details live von der API
			loadingProgressStore.setStepLoading('stories');
			const { stories, seasons: loadedSeasons } = await getStoriesAndSeasons(forceRefresh);
			seasons = loadedSeasons;
			loadingProgressStore.setStepCompleted('stories');

			// Schritt 4: Mappe Story-Fortschritt basierend auf Character-Quests (live)
			// Personal Story wird jetzt lazy geladen beim Aufklappen einer Phase
			loadingProgressStore.setStepLoading('mapping');
			storyProgress = await mapStoryProgress(apiKey, characterQuests, forceRefresh);
			loadingProgressStore.setStepCompleted('mapping');

			// Timestamp nach erfolgreichem Load speichern
			const ts = Date.now();
			lastSuccessfulLoadAt = ts;
			persistLastSuccessfulLoad(apiKey, ts);
		} catch (err) {
			storiesError = err instanceof Error ? err.message : 'Error loading data';
			console.error('Error loading story data:', err);
			console.error('Error details:', {
				message: err instanceof Error ? err.message : String(err),
				stack: err instanceof Error ? err.stack : undefined
			});
			loadingProgressStore.reset();
		} finally {
			isStoriesLoading = false;
		}
	}

	function formatLastLoad(ts: number | null): string {
		if (!ts) return '—';
		try {
			return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts));
		} catch {
			return new Date(ts).toLocaleString();
		}
	}

	function handleReload() {
		if (!currentApiKey || isStoriesLoading) return;
		loadStories(currentApiKey, true);
	}

	async function handleSubmit() {
		if (!apiKeyInput.trim()) {
			errorMessage = 'Please enter an API key';
			return;
		}

		// Check if cookies are accepted
		if (cookieConsent !== 'accepted') {
			errorMessage = 'Please accept cookies to continue';
			return;
		}

		isLoginLoading = true;
		errorMessage = '';
		apiKeyStore.setValidating(true);

		try {
			const tokenInfo = await validateApiKey(apiKeyInput.trim());

			if (tokenInfo) {
				apiKeyStore.setKey(apiKeyInput.trim());
				apiKeyStore.setValid(true);
				// No redirect needed - the store subscription will trigger the stories view
			} else {
				errorMessage = 'Invalid API key. Please check your key.';
				apiKeyStore.setError(errorMessage);
			}
		} catch (error) {
			errorMessage = 'Error validating API key. Please try again.';
			apiKeyStore.setError(errorMessage);
			console.error('API Key validation error:', error);
		} finally {
			isLoginLoading = false;
		}
	}

	function showCookieSettings() {
		// Dispatch event to show cookie settings
		window.dispatchEvent(new CustomEvent('showCookieSettings'));
		showBanner = true;
		cookieConsent = null;
	}

	function handleLogout() {
		apiKeyStore.clear();
		// No redirect needed - the store subscription will trigger the login view
	}

	// Filtered story progress based on selected character
	let filteredStoryProgress = $derived(
		storyProgress.filter((sp) => !selectedCharacter || sp.completedBy.includes(selectedCharacter))
	);
</script>

{#if !hasValidApiKey}
	<!-- Login View -->
	<div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
		<div class="card w-full max-w-md bg-base-100 shadow-xl">
			<div class="card-body">
				<div class="flex flex-col items-center mb-6">
					<img
						src={favicon}
						alt="GW2 Story Tracker"
						class="w-56 h-56 mb-4"
					/>
					<h2 class="card-title text-2xl mb-2">GW2 Story Tracker</h2>
					<p class="text-center text-base-content/70">
						Enter your Guild Wars 2 API key to view your story progress.
					</p>
				</div>

				<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
					<div class="form-control">
						<label for="api-key-input" class="label">
							<span class="label-text">API Key</span>
						</label>
						<input
							id="api-key-input"
							type="password"
							placeholder="Your GW2 API Key"
							class="input input-bordered w-full"
							bind:value={apiKeyInput}
							disabled={isLoginLoading || cookieConsent !== 'accepted'}
						/>
						<label for="api-key-input" class="label">
							<span class="label-text-alt">
								<a
									href="https://account.arena.net/applications"
									target="_blank"
									rel="noopener noreferrer"
									class="link link-primary"
								>
									Create API Key
								</a>
							</span>
						</label>
					</div>

					{#if errorMessage}
						<div class="alert alert-error">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="stroke-current shrink-0 h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>{errorMessage}</span>
						</div>
					{/if}

					<div class="card-actions justify-end">
						{#if showBanner}
							<button type="button" class="btn btn-primary w-full" disabled>
								Please Accept Cookies first
							</button>
						{:else if cookieConsent === 'rejected'}
							<button type="button" class="btn btn-primary w-full" onclick={showCookieSettings}>
								Show Cookie Settings again
							</button>
						{:else}
							<button type="submit" class="btn btn-primary w-full" disabled={isLoginLoading || cookieConsent !== 'accepted'}>
								{#if isLoginLoading}
									<span class="loading loading-spinner loading-sm"></span>
									Validating...
								{:else}
									Validate
								{/if}
							</button>
						{/if}
					</div>
				</form>
			</div>
		</div>
	</div>
{:else}
	<!-- Stories View -->
	<div class="min-h-screen bg-gradient-to-b from-base-200 via-base-200 to-base-300">
		<!-- Navbar -->
		<div class="navbar bg-base-100/80 backdrop-blur-sm shadow-lg border-b border-base-300">
			<div class="flex-1">
				<div class="flex items-center gap-3">
					<img
						src={favicon}
						alt="GW2 Story Tracker"
						class="w-8 h-8"
					/>
					<span class="btn btn-ghost text-xl font-semibold">GW2 Story Tracker</span>
				</div>
			</div>
			<div class="flex-none">
				<button class="btn btn-ghost" onclick={handleLogout}>Logout</button>
			</div>
		</div>

		<!-- Main Content -->
		<div class="container mx-auto px-4 py-6 max-w-[1000px]">
			{#if isStoriesLoading}
				<div class="bg-base-100/50 backdrop-blur-sm rounded-lg shadow-lg p-6 mt-4 border border-base-300">
					<h2 class="text-2xl font-bold mb-4">Loading story data...</h2>
					<LoadingProgress />
				</div>
			{:else if storiesError}
				<div class="alert alert-error mt-4 shadow-lg">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{storiesError}</span>
					<div class="flex-1"></div>
					<button class="btn btn-sm btn-ghost" onclick={handleReload} disabled={!currentApiKey || isStoriesLoading}>
						Try again
					</button>
				</div>
			{:else}
				<div class="bg-base-100/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-base-300 relative">
					<div class="flex items-start justify-between mb-6">
						<div class="flex items-center gap-3">
							<img
								src="https://wiki.guildwars2.com/wiki/Special:FilePath/Storyline_(interface).png"
								alt="GW2 Storyline"
								class="w-8 h-8"
							/>
							<div>
								<h2 class="text-2xl font-bold text-base-content">Stories</h2>
								<p class="text-sm text-base-content/70 mt-1">
									Zuletzt geladen: {formatLastLoad(lastSuccessfulLoadAt)}
								</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<button class="btn btn-ghost btn-sm" onclick={() => (showFilterPanel = !showFilterPanel)}>
								Filter
							</button>
							<button class="btn btn-ghost btn-sm" onclick={handleReload} disabled={!currentApiKey || isStoriesLoading}>
								{#if isStoriesLoading}
									<span class="loading loading-spinner loading-sm"></span>
								{:else}
									Reload
								{/if}
							</button>
						</div>
					</div>
					{#if showFilterPanel}
						<div class="w-full mt-4 pt-4 border-t border-base-300 mb-4">
							<form class="filter">
								<label class="btn btn-sm">
									<input
										type="radio"
										name="character-filter"
										checked={selectedCharacter === null}
										onclick={() => (selectedCharacter = null)}
									/>
									Alle
								</label>
								{#each allCharacters as characterName (characterName)}
									{@const character = characterDetails.get(characterName)}
									{@const professionIcon = character ? getProfessionIcon(character.profession) : null}
									<label class="btn btn-sm flex items-center gap-2">
										<input
											type="radio"
											name="character-filter"
											checked={selectedCharacter === characterName}
											onclick={() => (selectedCharacter = characterName)}
										/>
										{#if professionIcon}
											<img src={professionIcon} alt={character?.profession || ''} class="w-4 h-4" />
										{/if}
										<span>{characterName}</span>
									</label>
								{/each}
							</form>
						</div>
					{/if}
					<StoryAccordion storyProgress={filteredStoryProgress} {seasons} {allCharacters} {characterDetails} {characterQuests} />
				</div>
			{/if}
		</div>
	</div>
{/if}







