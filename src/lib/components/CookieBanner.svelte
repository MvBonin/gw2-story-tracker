<script lang="ts">
	import { onMount } from 'svelte';

	let cookieConsent = $state<string | null>(null);
	let showBanner = $state(true);

	onMount(() => {
		// Check if consent was already given
		if (typeof window !== 'undefined') {
			cookieConsent = localStorage.getItem('cookieConsent');
			showBanner = cookieConsent === null;
			
			// Listen for showCookieSettings event
			const handleShowCookieSettings = () => {
				showCookieSettings();
			};
			
			window.addEventListener('showCookieSettings', handleShowCookieSettings);
			
			return () => {
				window.removeEventListener('showCookieSettings', handleShowCookieSettings);
			};
		}
	});

	function acceptCookies() {
		if (typeof window !== 'undefined') {
			// Update state first, then dispatch event
			showBanner = false;
			cookieConsent = 'accepted';
			localStorage.setItem('cookieConsent', 'accepted');
			// Dispatch custom event immediately
			window.dispatchEvent(new CustomEvent('cookieConsentUpdate', { detail: 'accepted' }));
		}
	}

	function rejectCookies() {
		if (typeof window !== 'undefined') {
			// Update state first, then dispatch event
			showBanner = false;
			cookieConsent = 'rejected';
			localStorage.setItem('cookieConsent', 'rejected');
			// Dispatch custom event immediately
			window.dispatchEvent(new CustomEvent('cookieConsentUpdate', { detail: 'rejected' }));
		}
	}

	export function showCookieSettings() {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('cookieConsent');
			cookieConsent = null;
			showBanner = true;
			window.dispatchEvent(new CustomEvent('cookieConsentUpdate', { detail: null }));
		}
	}
</script>

{#if showBanner}
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
					<button class="btn btn-sm btn-ghost" onclick={rejectCookies}>
						Reject
					</button>
					<button class="btn btn-sm btn-primary" onclick={acceptCookies}>
						Accept
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

