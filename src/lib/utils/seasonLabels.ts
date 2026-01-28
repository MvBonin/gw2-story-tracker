import type { Season } from '$lib/api/stories';

/**
 * Mapping von Season-IDs zu Mastery-Icon URLs
 */
export const SEASON_MASTERY_ICON: Record<string, string> = {
	// Personal Story
	'215AAA0F-CDAC-4F93-86DA-C155A99B5784':
		'https://wiki.guildwars2.com/wiki/Special:FilePath/Mastery_point_(Central_Tyria).png',

	// Living World Season 1
	'A49D0CD7-E725-4141-8E10-180F1CED7CAF':
		'https://wiki.guildwars2.com/wiki/Special:FilePath/Mastery_point_(Central_Tyria).png',

	// Living World Season 2
	'A515A1D3-4BD7-4594-AE30-2C5D05FF5960':
		'https://wiki.guildwars2.com/wiki/Special:FilePath/Mastery_point_(Central_Tyria).png',

	// Heart of Thorns
	'B8901E58-DC9D-4525-ADB2-79C93593291E':
		'https://wiki.guildwars2.com/wiki/Special:FilePath/Mastery_point_(Heart_of_Thorns).png',

	// Living World Season 3 (HoT mastery region)
	'09766A86-D88D-4DF2-9385-259E9A8CA583':
		'https://wiki.guildwars2.com/wiki/Special:FilePath/Mastery_point_(Heart_of_Thorns).png',

	// Path of Fire
	'EAB597C0-C484-4FD3-9430-31433BAC81B6':
		'https://wiki.guildwars2.com/wiki/Special:FilePath/Mastery_point_(Path_of_Fire).png',

	// Living World Season 4 (PoF mastery region)
	'C22AFD21-667A-4AA8-8210-AC74EAEE58BB':
		'https://wiki.guildwars2.com/wiki/Special:FilePath/Mastery_point_(Path_of_Fire).png',

	// Icebrood Saga
	'EDCAE800-302A-4D9B-8331-3CC769ADA0B3':
		'https://wiki.guildwars2.com/wiki/Special:FilePath/Mastery_point_(Icebrood_Saga).png',

	// End of Dragons
	'D1B709AB-92B6-4EE9-8B40-2B7C628E5022':
		'https://wiki.guildwars2.com/wiki/Special:FilePath/Mastery_point_(End_of_Dragons).png',

	// Secrets of the Obscure
	'AEE99452-D323-4ABB-8F49-D7C0A752CBD1':
		'https://wiki.guildwars2.com/wiki/Special:FilePath/Mastery_point_(Secrets_of_the_Obscure).png',

	// Janthir Wilds
	'5EFFBB71-7C6D-4594-A87D-88B8CF38FDA3':
		'https://wiki.guildwars2.com/wiki/Special:FilePath/Mastery_point_(Janthir_Wilds).png',

	// Visions of Eternity
	'5F35F25C-AE33-4D92-A061-227CE54FA5DC':
		'https://wiki.guildwars2.com/wiki/Special:FilePath/Mastery_point_(Visions_of_Eternity).png'
};

/**
 * Gibt die Mastery-Icon URL für eine Season zurück
 */
export function getSeasonMasteryIcon(seasonId: string): string | null {
	return SEASON_MASTERY_ICON[seasonId] || null;
}

/**
 * Mappt Season-Namen zu kurzen Badge-Labels
 */
export function getSeasonBadgeLabel(season: Season): string {
	const name = season.name.toLowerCase();
	
	// Living World Seasons
	if (name.includes('living world season 1') || name.includes('season 1')) {
		return 'LW S1';
	}
	if (name.includes('living world season 2') || name.includes('season 2')) {
		return 'LW S2';
	}
	if (name.includes('living world season 3') || name.includes('season 3')) {
		return 'LW S3';
	}
	if (name.includes('living world season 4') || name.includes('season 4')) {
		return 'LW S4';
	}
	if (name.includes('icebrood saga') || name.includes('season 5')) {
		return 'IBS';
	}
	
	// Expansions
	if (name.includes('heart of thorns')) {
		return 'HoT';
	}
	if (name.includes('path of fire')) {
		return 'PoF';
	}
	if (name.includes('end of dragons')) {
		return 'EoD';
	}
	if (name.includes('secrets of the obscure')) {
		return 'SotO';
	}
	if (name.includes('visions of eternity')) {
		return 'VoE';
	}
	if (name.includes('janthir wilds')) {
		return 'JW';
	}
	
	// Personal Story
	if (name.includes('personal story') || name.includes('my story')) {
		return 'Personal';
	}
	
	// Fallback: Erste Wörter des Namens
	const words = season.name.split(' ');
	if (words.length >= 2) {
		return words.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
	}
	
	return season.name.substring(0, 8);
}

