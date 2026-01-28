<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import CookieBanner from '$lib/components/CookieBanner.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>GW2 Story Tracker</title>
	<link rel="icon" href={favicon} />
</svelte:head>
{@render children()}
<CookieBanner />
