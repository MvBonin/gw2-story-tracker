<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { apiKeyStore } from '$lib/stores/apiKey';
	import { getCharacters, getAllCharacterQuests, getAllCharacterDetails, type Character } from '$lib/api/gw2';
	import { getStoriesAndSeasons, type Season } from '$lib/api/stories';
	import { mapStoryProgress } from '$lib/utils/storyProgress';
	import { loadingProgressStore } from '$lib/stores/loadingProgress';
	import type { StoryProgress } from '$lib/utils/storyProgress';
	import StoryAccordion from '$lib/components/StoryAccordion.svelte';
	import LoadingProgress from '$lib/components/LoadingProgress.svelte';

	let storyProgress: StoryProgress[] = [];
	let seasons: Season[] = [];
	let allCharacters: string[] = [];
	let characterDetails: Map<string, Character> = new Map();
	let isLoading = true;
	let error: string | null = null;

	onMount(async () => {
		// Prüfe ob API Key vorhanden ist
		let apiKey: string | null = null;
		let isValid = false;
		
		const unsubscribe = apiKeyStore.subscribe((state) => {
			apiKey = state.key;
			isValid = state.isValid;
		});

		// Warte kurz, damit der Store initialisiert wird
		await new Promise((resolve) => setTimeout(resolve, 100));

		if (!apiKey || !isValid) {
			unsubscribe();
			goto('/');
			return;
		}

		// Starte Loading Progress
		loadingProgressStore.start();

		try {
			// Schritt 1: Lade Character-Namen und Details (inkl. Profession)
			loadingProgressStore.setStepLoading('characters');
			const characterNames = await getCharacters(apiKey);
			allCharacters = characterNames;
			const characters = await getAllCharacterDetails(apiKey);
			characterDetails = new Map(characters.map((c) => [c.name, c]));
			loadingProgressStore.setStepCompleted('characters');

			// Schritt 2: Lade Quests für alle Charaktere (Character-spezifische Story-Completion)
			loadingProgressStore.setStepLoading('achievements');
			const characterQuests = await getAllCharacterQuests(apiKey, characterNames);
			loadingProgressStore.setStepCompleted('achievements');

			// Schritt 3: Lade Story- und Season-Details live von der API
			loadingProgressStore.setStepLoading('stories');
			const { stories, seasons: loadedSeasons } = await getStoriesAndSeasons();
			seasons = loadedSeasons;
			loadingProgressStore.setStepCompleted('stories');

			// Schritt 4: Mappe Story-Fortschritt basierend auf Character-Quests (live)
			loadingProgressStore.setStepLoading('mapping');
			storyProgress = await mapStoryProgress(apiKey, characterQuests);
			loadingProgressStore.setStepCompleted('mapping');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Fehler beim Laden der Daten';
			console.error('Error loading story data:', err);
			console.error('Error details:', {
				message: err instanceof Error ? err.message : String(err),
				stack: err instanceof Error ? err.stack : undefined
			});
			loadingProgressStore.reset();
		} finally {
			isLoading = false;
			unsubscribe();
		}
	});

	function handleLogout() {
		apiKeyStore.clear();
		goto('/');
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-base-200 via-base-200 to-base-300">
	<!-- Navbar -->
	<div class="navbar bg-base-100/80 backdrop-blur-sm shadow-lg border-b border-base-300">
		<div class="flex-1">
			<span class="btn btn-ghost text-xl font-semibold">GW2 Story Tracker</span>
		</div>
		<div class="flex-none">
			<button class="btn btn-ghost" on:click={handleLogout}>Logout</button>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-6 max-w-[1000px]">
		{#if isLoading}
			<div class="bg-base-100/50 backdrop-blur-sm rounded-lg shadow-lg p-6 mt-4 border border-base-300">
				<h2 class="text-2xl font-bold mb-4">Lade Story-Daten...</h2>
				<LoadingProgress />
			</div>
		{:else if error}
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
				<span>{error}</span>
				<div class="flex-1"></div>
				<button class="btn btn-sm btn-ghost" on:click={() => window.location.reload()}>
					Erneut versuchen
				</button>
			</div>
		{:else}
			<div class="bg-base-100/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-base-300">
				<h2 class="text-2xl font-bold mb-6 text-base-content">Stories</h2>
				<StoryAccordion {storyProgress} {seasons} {allCharacters} {characterDetails} />
			</div>
		{/if}
	</div>
</div>
