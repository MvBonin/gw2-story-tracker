<script lang="ts">
	import { onMount } from 'svelte';

	let cookieConsent = $state<string | null>(null);

	onMount(() => {
		// Check if consent was already given
		if (typeof window !== 'undefined') {
			cookieConsent = localStorage.getItem('cookieConsent');
		}
	});

	function acceptCookies() {
		if (typeof window !== 'undefined') {
			localStorage.setItem('cookieConsent', 'accepted');
			cookieConsent = 'accepted';
		}
	}

	function rejectCookies() {
		if (typeof window !== 'undefined') {
			// Store rejection
			localStorage.setItem('cookieConsent', 'rejected');
			cookieConsent = 'rejected';
			// Note: The app will still use localStorage for essential functionality (API key storage)
			// but we've recorded the user's preference
		}
	}
</script>

{#if cookieConsent === null}
	<div class="fixed bottom-0 left-0 right-0 z-50 bg-base-100 shadow-2xl border-t border-base-300 p-4">
		<div class="container mx-auto max-w-4xl">
			<div class="flex flex-col md:flex-row items-start md:items-center gap-4">
				<div class="flex-1">
					<h3 class="font-semibold text-lg mb-2">Cookie Settings</h3>
					<p class="text-sm text-base-content/70">
						We use local storage to save your API keys and ensure the functionality of this application. 
						Your data is stored exclusively locally in your browser and is not shared with third parties.
					</p>
					<p class="text-xs text-base-content/60 mt-2">
						By using this application, you agree to local storage. 
						For more information, please see our 
						<a href="/privacy" class="link link-primary">Privacy Policy</a>.
					</p>
				</div>
				<div class="flex gap-2 flex-shrink-0">
					<button class="btn btn-sm btn-ghost" on:click={rejectCookies}>
						Reject
					</button>
					<button class="btn btn-sm btn-primary" on:click={acceptCookies}>
						Accept
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

