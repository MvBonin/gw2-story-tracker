export type Profession =
	| 'Guardian'
	| 'Warrior'
	| 'Revenant'
	| 'Ranger'
	| 'Thief'
	| 'Engineer'
	| 'Mesmer'
	| 'Elementalist'
	| 'Necromancer';

/**
 * Mapping von Profession-Namen zu GW2 Wiki Icon URLs
 * Verwendet Special:FilePath für stabile, hotlink-safe PNGs
 */
export const PROFESSION_ICON: Record<Profession, string> = {
	Guardian: 'https://wiki.guildwars2.com/wiki/Special:FilePath/Guardian_icon.png',
	Warrior: 'https://wiki.guildwars2.com/wiki/Special:FilePath/Warrior_icon.png',
	Revenant: 'https://wiki.guildwars2.com/wiki/Special:FilePath/Revenant_icon.png',
	Ranger: 'https://wiki.guildwars2.com/wiki/Special:FilePath/Ranger_icon.png',
	Thief: 'https://wiki.guildwars2.com/wiki/Special:FilePath/Thief_icon.png',
	Engineer: 'https://wiki.guildwars2.com/wiki/Special:FilePath/Engineer_icon.png',
	Mesmer: 'https://wiki.guildwars2.com/wiki/Special:FilePath/Mesmer_icon.png',
	Elementalist: 'https://wiki.guildwars2.com/wiki/Special:FilePath/Elementalist_icon.png',
	Necromancer: 'https://wiki.guildwars2.com/wiki/Special:FilePath/Necromancer_icon.png'
};

/**
 * Gibt die Icon-URL für eine Profession zurück
 */
export function getProfessionIcon(profession: string): string | null {
	return PROFESSION_ICON[profession as Profession] || null;
}

