<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { apiKeyStore } from '$lib/stores/apiKey';
	import { validateApiKey } from '$lib/api/gw2';
	import { browser } from '$app/environment';
	import { getCookieConsent } from '$lib/utils/cookieConsent';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import favicon from '$lib/assets/favicon.png';

	let apiKeyInput = '';
	let errorMessage = '';
	let isLoading = false;
	let cookieBannerRef: CookieBanner | null = null;
	let cookieConsent = $state<'accepted' | 'rejected' | null>(null);
	let showBanner = $state(false);

	// Check cookie consent status
	onMount(() => {
		if (browser) {
			const updateConsent = () => {
				const consent = getCookieConsent();
				cookieConsent = consent;
				showBanner = consent === null;
			};
			
			updateConsent();
			
			apiKeyStore.subscribe((state) => {
				if (state.isValid && state.key) {
					// Redirect to main page if already validated
					goto(`${base}/stories`, { invalidateAll: true });
				}
			});
			
			// Listen for storage changes (when cookie consent is updated)
			const handleStorageChange = (e: StorageEvent) => {
				if (e.key === 'cookieConsent') {
					updateConsent();
				}
			};
			
			window.addEventListener('storage', handleStorageChange);
			
			// Also check periodically for same-tab changes
			const interval = setInterval(updateConsent, 200);
			
			return () => {
				window.removeEventListener('storage', handleStorageChange);
				clearInterval(interval);
			};
		}
	});

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

		isLoading = true;
		errorMessage = '';
		apiKeyStore.setValidating(true);

		try {
			const tokenInfo = await validateApiKey(apiKeyInput.trim());

			if (tokenInfo) {
				apiKeyStore.setKey(apiKeyInput.trim());
				apiKeyStore.setValid(true);
				// Redirect to main page
				goto(`${base}/stories`, { invalidateAll: true });
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

	function showCookieSettings() {
		if (cookieBannerRef) {
			cookieBannerRef.showCookieSettings();
		}
		showBanner = true;
		cookieConsent = null;
	}

</script>

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
					<label class="label">
						<span class="label-text">API Key</span>
					</label>
					<input
						type="password"
						placeholder="Your GW2 API Key"
						class="input input-bordered w-full"
						bind:value={apiKeyInput}
						disabled={isLoading || cookieConsent !== 'accepted'}
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
					{#if showBanner}
						<button type="button" class="btn btn-primary w-full" disabled>
							Please Accept Cookies first
						</button>
					{:else if cookieConsent === 'rejected'}
						<button type="button" class="btn btn-primary w-full" onclick={showCookieSettings}>
							Show Cookie Settings again
						</button>
					{:else}
						<button type="submit" class="btn btn-primary w-full" disabled={isLoading || cookieConsent !== 'accepted'}>
							{#if isLoading}
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
	<CookieBanner bind:this={cookieBannerRef} />
</div>
