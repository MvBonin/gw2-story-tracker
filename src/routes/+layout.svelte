<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>GW2 Story Tracker</title>
	<link rel="icon" href={favicon} />
</svelte:head>
<div class="min-h-screen flex flex-col">
	{@render children()}
	<Footer />
</div>
<CookieBanner />
