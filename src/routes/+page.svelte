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
			errorMessage = 'Bitte gib einen API Key ein';
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
				// Redirect zur Hauptseite
				goto('/stories');
			} else {
				errorMessage = 'Ungültiger API Key. Bitte überprüfe deinen Key.';
				apiKeyStore.setError(errorMessage);
			}
		} catch (error) {
			errorMessage = 'Fehler beim Validieren des API Keys. Bitte versuche es erneut.';
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
			<h2 class="card-title justify-center text-2xl mb-4">GW2 Story Tracker</h2>
			<p class="text-center text-base-content/70 mb-6">
				Gib deinen Guild Wars 2 API Key ein, um deine Story-Fortschritte zu sehen.
			</p>

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">API Key</span>
					</label>
					<input
						type="password"
						placeholder="Dein GW2 API Key"
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
								API Key erstellen
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
							Validierung...
						{:else}
							Validieren
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
