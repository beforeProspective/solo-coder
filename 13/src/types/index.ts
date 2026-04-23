export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface PlayerAttributes {
  scoring: number;
  rebounding: number;
  assists: number;
  steals: number;
  blocks: number;
  threePoint: number;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  rarity: Rarity;
  attributes: PlayerAttributes;
  story: string;
  jerseyNumber: number;
  height: string;
  weight: string;
  experience: number;
}

export interface CollectedCard {
  playerId: string;
  rarity: Rarity;
  count: number;
  obtainedAt: string;
}

export interface UserData {
  id: string;
  coins: number;
  collectedCards: CollectedCard[];
  lastPackOpened: string;
}

export type TabType = 'pack' | 'collection' | 'stats';

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  rare: 25,
  epic: 12,
  legendary: 3,
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#7F8C8D',
  rare: '#3498DB',
  epic: '#9B59B6',
  legendary: '#D4AF37',
};

export const TEAMS = [
  '洛杉矶湖人',
  '金州勇士',
  '迈阿密热火',
  '布鲁克林篮网',
  '波士顿凯尔特人',
  '菲尼克斯太阳',
  '密尔沃基雄鹿',
  '费城76人',
  '达拉斯独行侠',
  '丹佛掘金',
];

export const POSITIONS = ['控球后卫', '得分后卫', '小前锋', '大前锋', '中锋'];

export const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

export const getNextRarity = (rarity: Rarity): Rarity | null => {
  const index = RARITY_ORDER.indexOf(rarity);
  if (index < RARITY_ORDER.length - 1) {
    return RARITY_ORDER[index + 1];
  }
  return null;
};

export const SYNTHESIS_COST = 3;
export const SYNTHESIS_ATTRIBUTE_BONUS = 1.15;
