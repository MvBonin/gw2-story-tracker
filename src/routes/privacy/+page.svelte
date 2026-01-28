<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<div class="min-h-screen bg-base-200 p-4">
	<div class="container mx-auto max-w-4xl py-8">
		<div class="bg-base-100 rounded-lg shadow-lg p-8">
			<div class="mb-6">
				<button class="btn btn-ghost btn-sm mb-4" onclick={() => goto('/')}>
					← Back to Login
				</button>
				<h1 class="text-4xl font-bold mb-2">Privacy Policy</h1>
				<p class="text-base-content/70">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
			</div>

			<div class="prose prose-lg max-w-none">
				<section class="mb-8">
					<h2 class="text-2xl font-semibold mb-4">1. Introduction</h2>
					<p class="mb-4">
						This application is a <strong>client-side tool</strong> designed to help you track your Guild Wars 2 story progress. 
						It is <strong>not a service</strong> and does not collect, transmit, or store any personal data on external servers.
					</p>
					<p class="mb-4">
						This tool is provided as-is for personal use. The source code is publicly available on 
						<a href="https://github.com" class="link link-primary" target="_blank" rel="noopener noreferrer">GitHub</a> 
						as open-source software, allowing you to review, verify, and modify the code as needed.
					</p>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-semibold mb-4">2. Data Storage</h2>
					<p class="mb-4">
						<strong>All data is stored exclusively on your device</strong> using your browser's local storage mechanisms. 
						No data is transmitted to external servers, third parties, or cloud services.
					</p>
					<p class="mb-4">
						The following data may be stored locally in your browser:
					</p>
					<ul class="list-disc list-inside mb-4 space-y-2">
						<li><strong>API Key:</strong> Your Guild Wars 2 API key is stored locally using browser cookies for session persistence.</li>
						<li><strong>Cache Data:</strong> API responses (stories, quests, character data) are cached locally to improve performance and reduce API calls.</li>
						<li><strong>Cookie Consent:</strong> Your cookie consent preference is stored locally.</li>
					</ul>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-semibold mb-4">3. API Key Usage</h2>
					<p class="mb-4">
						Your Guild Wars 2 API key is used <strong>exclusively</strong> to:
					</p>
					<ul class="list-disc list-inside mb-4 space-y-2">
						<li>Fetch your character information from the official Guild Wars 2 API</li>
						<li>Retrieve your character's completed quests to determine story progress</li>
						<li>Access story and season metadata from the official Guild Wars 2 API</li>
					</ul>
					<p class="mb-4">
						Your API key is <strong>never transmitted</strong> to any server other than the official Guild Wars 2 API endpoints 
						(<code class="bg-base-200 px-1 rounded">api.guildwars2.com</code>). 
						It is stored locally in your browser and only used for direct API communication.
					</p>
					<p class="mb-4">
						<strong>Important:</strong> Your API key is stored in your browser's local storage. 
						You can delete it at any time by clicking the "Logout" button, which will clear all stored data including your API key.
					</p>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-semibold mb-4">4. Data Deletion</h2>
					<p class="mb-4">
						You have full control over your data:
					</p>
					<ul class="list-disc list-inside mb-4 space-y-2">
						<li><strong>Logout:</strong> Clicking the "Logout" button will immediately delete your API key and clear all cached data.</li>
						<li><strong>Browser Settings:</strong> You can clear your browser's local storage and cookies at any time through your browser settings.</li>
						<li><strong>No Server-Side Data:</strong> Since no data is stored on external servers, there is no server-side data to delete.</li>
					</ul>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
					<p class="mb-4">
						This application communicates with the following external services:
					</p>
					<ul class="list-disc list-inside mb-4 space-y-2">
						<li><strong>Guild Wars 2 Official API:</strong> All API requests are made directly to <code class="bg-base-200 px-1 rounded">api.guildwars2.com</code>. 
							Your API key is only sent to this official endpoint.</li>
						<li><strong>Guild Wars 2 Wiki:</strong> Static image resources (profession icons, mastery icons) are loaded from the official GW2 Wiki. 
							No personal data is transmitted to the wiki.</li>
					</ul>
					<p class="mb-4">
						No analytics, tracking, or advertising services are used. No third-party cookies are set.
					</p>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-semibold mb-4">6. Open Source</h2>
					<p class="mb-4">
						This application is open-source software. The complete source code is publicly available on GitHub, 
						allowing you to:
					</p>
					<ul class="list-disc list-inside mb-4 space-y-2">
						<li>Review the code to verify how your data is handled</li>
						<li>Audit the security and privacy practices</li>
						<li>Modify the code for your own use</li>
						<li>Contribute improvements to the project</li>
					</ul>
					<p class="mb-4">
						You can find the source code repository at: 
						<a href="https://github.com" class="link link-primary" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
					</p>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-semibold mb-4">7. Disclaimer</h2>
					<p class="mb-4">
						This tool is provided <strong>"as-is"</strong> without any warranties. It is a personal utility tool, not a commercial service. 
						The developers are not responsible for any data loss, security issues, or misuse of your API key.
					</p>
					<p class="mb-4">
						<strong>Important Security Note:</strong> Never share your Guild Wars 2 API key with anyone. 
						This tool stores it locally in your browser, but you should still treat it as sensitive information.
					</p>
				</section>

				<section class="mb-8">
					<h2 class="text-2xl font-semibold mb-4">8. Contact</h2>
					<p class="mb-4">
						If you have questions or concerns about this privacy policy or how your data is handled, 
						please review the source code on GitHub or open an issue in the repository.
					</p>
				</section>

				<div class="mt-8 pt-6 border-t border-base-300">
					<p class="text-sm text-base-content/60">
						By using this application, you acknowledge that you have read and understood this privacy policy. 
						All data processing occurs locally on your device, and you maintain full control over your information.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

