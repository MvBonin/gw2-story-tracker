# GW2 Story Tracker

A modern, client-side web application for tracking your Guild Wars 2 story progress across all your characters. Built with SvelteKit and powered by the official Guild Wars 2 API.

🌐 **Live Application:** [https://mvbonin.github.io/gw2-story-tracker/](https://mvbonin.github.io/gw2-story-tracker/)

## Overview

GW2 Story Tracker helps you keep track of which story chapters you've completed across all your characters. Unlike other tools that rely on achievements, this application uses quest-based tracking for more accurate, character-specific progress monitoring.

### Key Features

- **Character-Specific Tracking**: See which characters have completed which story chapters
- **Quest-Based Progress**: Uses the official GW2 quest system for accurate completion tracking
- **Visual Progress Overview**: 
  - Season-level accordion cards with completion counts
  - Profession icons next to character names
  - Mastery icons for each expansion/season
  - Color-coded status badges (Completed, Not completed, Undetectable, Not yet available)
- **Personal Story Support**: Special phase-based grouping for Personal Story (Origins, Orders of Tyria, etc.) TODO
- **Privacy-First**: All data is stored locally in your browser - no server-side storage
- **Open Source**: Full source code available on GitHub for transparency and customization

## How It Works

1. **Enter Your API Key**: Get your Guild Wars 2 API key from [ArenaNet's official site](https://account.arena.net/applications)
2. **Automatic Data Fetching**: The app fetches:
   - Your character list and their professions
   - Character-specific completed quests
   - Story and season metadata from the GW2 API
3. **Progress Mapping**: Stories are matched to quests to determine completion status per character
4. **Visual Display**: Your progress is displayed in an organized, easy-to-scan format

## Story Status Types

- **✅ Done**: Story completed by at least one character
- **Not completed**: Story not yet completed by any character
- **⚠️ Undetectable**: Story completion cannot be detected per character (e.g., HoT Episode 15 "Bitter Harvest")
- **⏳ Not yet available**: Story quests not yet released in the API (e.g., some Visions of Eternity content)

## Technical Details

### Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) with Svelte 5
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Language**: TypeScript
- **API**: Official [Guild Wars 2 API](https://wiki.guildwars2.com/wiki/API:Main)

### Architecture

- **Client-Side Only**: No backend server required
- **Local Storage**: API keys and cached data stored in browser localStorage
- **Dynamic Data**: All story/season data fetched live from GW2 API
- **Quest Mapping**: Automatic quest-to-story mapping from API data

### Data Privacy

- **100% Local**: All data stored exclusively in your browser
- **No Tracking**: No analytics, cookies, or third-party services
- **API Key Security**: Your API key is only sent to official GW2 API endpoints
- **Easy Deletion**: Logout button clears all stored data

See the [Privacy Policy](/privacy) for detailed information.

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd gw2story

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── lib/
│   ├── api/          # GW2 API integration
│   ├── components/   # Svelte components
│   ├── stores/       # Svelte stores
│   └── utils/        # Utility functions
└── routes/           # SvelteKit routes
    ├── +page.svelte  # Login page
    └── stories/      # Main story tracking page
```

## Contributing

This is an open-source project. Contributions are welcome! Please feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Review the code

## License

This project is licensed under the MIT License.

Copyright (c) 2024 Markwart v. Bonin

See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with the official [Guild Wars 2 API](https://wiki.guildwars2.com/wiki/API:Main)
- Icons from [Guild Wars 2 Wiki](https://wiki.guildwars2.com/)
- Inspired by tools like GW2Efficiency and GW2Toolkit

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Note**: This is a personal utility tool, not an official Guild Wars 2 service. All game data is provided by ArenaNet's official API.
