import { browser } from '$app/environment';

/**
 * Checks if the user has accepted cookie consent
 */
export function hasAcceptedCookies(): boolean {
	if (!browser) return true; // Server-side: assume accepted
	
	const consent = localStorage.getItem('cookieConsent');
	return consent === 'accepted';
}

/**
 * Checks if the user has rejected cookie consent
 */
export function hasRejectedCookies(): boolean {
	if (!browser) return false;
	
	const consent = localStorage.getItem('cookieConsent');
	return consent === 'rejected';
}

/**
 * Gets the current cookie consent status
 */
export function getCookieConsent(): 'accepted' | 'rejected' | null {
	if (!browser) return null;
	
	const consent = localStorage.getItem('cookieConsent');
	if (consent === 'accepted' || consent === 'rejected') {
		return consent;
	}
	return null;
}




