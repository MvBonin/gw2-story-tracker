<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { apiKeyStore } from '$lib/stores/apiKey';
	import { validateApiKey } from '$lib/api/gw2';
	import { browser } from '$app/environment';

	let apiKeyInput = '';
	let errorMessage = '';
	let isLoading = false;

	// Prüfe beim Laden, ob bereits ein API Key vorhanden ist
	onMount(() => {
		if (browser) {
			apiKeyStore.subscribe((state) => {
				if (state.isValid && state.key) {
					// Redirect zur Hauptseite wenn bereits validiert
					goto('/stories');
				}
			});
		}
	});

	async function handleSubmit() {
		if (!apiKeyInput.trim()) {
			errorMessage = 'Please enter an API key';
			return;
		}

		isLoading = true;
		errorMessage = '';
		apiKeyStore.setValidating(true);

		try {
			const tokenInfo = await validateApiKey(apiKeyInput.trim());

			if (tokenInfo) {
				apiKeyStore.setKey(apiKeyInput.trim());
				apiKeyStore.setValid(true);
				// Redirect to main page
				goto('/stories');
			} else {
				errorMessage = 'Invalid API key. Please check your key.';
				apiKeyStore.setError(errorMessage);
			}
		} catch (error) {
			errorMessage = 'Error validating API key. Please try again.';
			apiKeyStore.setError(errorMessage);
			console.error('API Key validation error:', error);
		} finally {
			isLoading = false;
		}
	}

</script>

	<div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="flex items-center justify-center gap-3 mb-4">
				<img
					src="https://wiki.guildwars2.com/wiki/Special:FilePath/Storyline_(interface).png"
					alt="GW2 Storyline"
					class="w-10 h-10"
				/>
				<h2 class="card-title text-2xl">GW2 Story Tracker</h2>
			</div>
			<p class="text-center text-base-content/70 mb-6">
				Enter your Guild Wars 2 API key to view your story progress.
			</p>

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">API Key</span>
					</label>
					<input
						type="password"
						placeholder="Your GW2 API Key"
						class="input input-bordered w-full"
						bind:value={apiKeyInput}
						disabled={isLoading}
					/>
					<label class="label">
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
					<button type="submit" class="btn btn-primary w-full" disabled={isLoading}>
						{#if isLoading}
							<span class="loading loading-spinner loading-sm"></span>
							Validating...
						{:else}
							Validate
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
