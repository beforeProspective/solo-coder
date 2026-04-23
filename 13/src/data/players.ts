import { Player, Rarity } from '../types';

const generateAttributes = (baseStats: number[], rarity: Rarity): { scoring: number; rebounding: number; assists: number; steals: number; blocks: number; threePoint: number } => {
  const multiplier = {
    common: 1,
    rare: 1.15,
    epic: 1.3,
    legendary: 1.5,
  };

  return {
    scoring: Math.round(baseStats[0] * multiplier[rarity]),
    rebounding: Math.round(baseStats[1] * multiplier[rarity]),
    assists: Math.round(baseStats[2] * multiplier[rarity]),
    steals: Math.round(baseStats[3] * multiplier[rarity]),
    blocks: Math.round(baseStats[4] * multiplier[rarity]),
    threePoint: Math.round(baseStats[5] * multiplier[rarity]),
  };
};

const createPlayer = (
  id: string,
  name: string,
  position: string,
  team: string,
  rarity: Rarity,
  baseStats: number[],
  story: string,
  jerseyNumber: number,
  height: string,
  weight: string,
  experience: number
): Player => ({
  id,
  name,
  position,
  team,
  rarity,
  attributes: generateAttributes(baseStats, rarity),
  story,
  jerseyNumber,
  height,
  weight,
  experience,
});

export const ALL_PLAYERS: Player[] = [
  // 传说球员 (Legendary)
  createPlayer(
    'l-001',
    '勒布朗·詹姆斯',
    '小前锋',
    '洛杉矶湖人',
    'legendary',
    [92, 80, 88, 65, 55, 60],
    '勒布朗·詹姆斯，NBA历史上最伟大的球员之一，拥有4次总冠军、4次MVP和4次总决赛MVP。他以其全面的技术和出色的领导力著称，能够在任何球队产生立竿见影的影响。',
    23,
    '6\'9" (2.06m)',
    '250 lbs (113 kg)',
    21
  ),
  createPlayer(
    'l-002',
    '斯蒂芬·库里',
    '控球后卫',
    '金州勇士',
    'legendary',
    [95, 45, 90, 75, 20, 98],
    '斯蒂芬·库里，三分球历史第一人，改变了现代篮球的打法。他拥有4次总冠军、2次MVP和1次总决赛MVP。他的投篮能力和球场视野使他成为联盟中最具威胁的球员之一。',
    30,
    '6\'3" (1.91m)',
    '185 lbs (84 kg)',
    16
  ),
  createPlayer(
    'l-003',
    '凯文·杜兰特',
    '小前锋',
    '菲尼克斯太阳',
    'legendary',
    [96, 75, 85, 70, 60, 88],
    '凯文·杜兰特，联盟中最顶级的得分手之一，拥有无可匹敌的身高和投篮组合。他曾获得2次总冠军、2次总决赛MVP和1次常规赛MVP。他的中距离和三分球让防守者束手无策。',
    35,
    '6\'11" (2.11m)',
    '240 lbs (109 kg)',
    17
  ),
  createPlayer(
    'l-004',
    '扬尼斯·阿德托昆博',
    '大前锋',
    '密尔沃基雄鹿',
    'legendary',
    [94, 92, 80, 70, 85, 65],
    '扬尼斯·阿德托昆博，被称为"希腊怪兽"，以其惊人的身体素质和全能表现著称。他拥有1次总冠军、1次总决赛MVP和2次常规赛MVP。他的冲击力和防守能力让他成为联盟中最具统治力的球员之一。',
    34,
    '6\'11" (2.11m)',
    '243 lbs (110 kg)',
    12
  ),

  // 史诗球员 (Epic)
  createPlayer(
    'e-001',
    '吉米·巴特勒',
    '小前锋',
    '迈阿密热火',
    'epic',
    [88, 70, 80, 85, 40, 65],
    '吉米·巴特勒，联盟中最坚韧的球员之一，以其顽强的防守和关键时刻的表现著称。他曾5次入选最佳防守阵容，并带领热火队进入过总决赛。',
    22,
    '6\'7" (2.01m)',
    '230 lbs (104 kg)',
    13
  ),
  createPlayer(
    'e-002',
    '卢卡·东契奇',
    '控球后卫',
    '达拉斯独行侠',
    'epic',
    [90, 70, 92, 70, 30, 80],
    '卢卡·东契奇，联盟中最年轻的超级巨星之一，以其成熟的比赛感觉和出色的组织能力著称。他曾多次入选全明星阵容，并带领独行侠队在季后赛中取得佳绩。',
    77,
    '6\'7" (2.01m)',
    '230 lbs (104 kg)',
    7
  ),
  createPlayer(
    'e-003',
    '尼古拉·约基奇',
    '中锋',
    '丹佛掘金',
    'epic',
    [85, 90, 85, 55, 70, 60],
    '尼古拉·约基奇，被称为"小丑"，是联盟中最独特的中锋之一，以其出色的传球能力和篮球智商著称。他曾获得1次MVP，并带领掘金队取得了出色的成绩。',
    15,
    '7\'0" (2.13m)',
    '284 lbs (129 kg)',
    10
  ),
  createPlayer(
    'e-004',
    '乔尔·恩比德',
    '中锋',
    '费城76人',
    'epic',
    [92, 85, 70, 50, 88, 70],
    '乔尔·恩比德，被称为"过程"，是联盟中最具统治力的中锋之一，以其全面的进攻技巧和出色的防守能力著称。他曾获得1次得分王和多次入选全明星阵容。',
    21,
    '7\'0" (2.13m)',
    '280 lbs (127 kg)',
    8
  ),

  // 稀有球员 (Rare)
  createPlayer(
    'r-001',
    '杰伦·布朗',
    '得分后卫',
    '波士顿凯尔特人',
    'rare',
    [80, 65, 60, 70, 40, 75],
    '杰伦·布朗，凯尔特人队的重要得分手，以其出色的运动能力和三分球著称。他曾帮助凯尔特人队多次进入东部决赛。',
    7,
    '6\'6" (1.98m)',
    '223 lbs (101 kg)',
    8
  ),
  createPlayer(
    'r-002',
    '德文·布克',
    '得分后卫',
    '菲尼克斯太阳',
    'rare',
    [85, 50, 70, 65, 30, 82],
    '德文·布克，太阳队的核心得分手，以其出色的得分能力和关键时刻的表现著称。他曾单场砍下70分，并带领太阳队进入过总决赛。',
    1,
    '6\'5" (1.96m)',
    '206 lbs (93 kg)',
    9
  ),
  createPlayer(
    'r-003',
    '达米安·利拉德',
    '控球后卫',
    '布鲁克林篮网',
    'rare',
    [88, 45, 80, 60, 30, 85],
    '达米安·利拉德，被称为" Dame时间"，以其冷血的关键球和出色的得分能力著称。他曾多次入选全明星阵容，并在季后赛中表现出色。',
    0,
    '6\'2" (1.88m)',
    '195 lbs (88 kg)',
    12
  ),
  createPlayer(
    'r-004',
    '杰森·塔图姆',
    '小前锋',
    '波士顿凯尔特人',
    'rare',
    [85, 70, 65, 70, 45, 78],
    '杰森·塔图姆，凯尔特人队的头号球星，以其出色的得分能力和全面的技术著称。他曾多次入选全明星阵容，并带领凯尔特人队取得了出色的成绩。',
    0,
    '6\'8" (2.03m)',
    '210 lbs (95 kg)',
    7
  ),
  createPlayer(
    'r-005',
    '安东尼·戴维斯',
    '大前锋',
    '洛杉矶湖人',
    'rare',
    [82, 85, 70, 55, 80, 65],
    '安东尼·戴维斯，被称为"浓眉哥"，以其出色的防守和内线得分能力著称。他曾获得1次总冠军，并多次入选最佳防守阵容。',
    3,
    '6\'10" (2.08m)',
    '253 lbs (115 kg)',
    12
  ),

  // 普通球员 (Common)
  createPlayer(
    'c-001',
    '凯尔·洛瑞',
    '控球后卫',
    '迈阿密热火',
    'common',
    [70, 45, 80, 75, 30, 70],
    '凯尔·洛瑞，一名经验丰富的控球后卫，以其出色的组织能力和三分球著称。他曾帮助猛龙队获得NBA总冠军。',
    7,
    '6\'0" (1.83m)',
    '196 lbs (89 kg)',
    18
  ),
  createPlayer(
    'c-002',
    '弗雷德·范弗利特',
    '控球后卫',
    '布鲁克林篮网',
    'common',
    [72, 40, 75, 70, 25, 75],
    '弗雷德·范弗利特，一名出色的三分射手和防守者，以其坚韧的比赛风格著称。他曾帮助猛龙队获得NBA总冠军。',
    23,
    '6\'1" (1.85m)',
    '197 lbs (89 kg)',
    8
  ),
  createPlayer(
    'c-003',
    '克莱·汤普森',
    '得分后卫',
    '金州勇士',
    'common',
    [75, 45, 55, 65, 30, 85],
    '克莱·汤普森，NBA历史上最出色的三分射手之一，以其精准的投篮和出色的防守著称。他曾帮助勇士队获得4次NBA总冠军。',
    11,
    '6\'6" (1.98m)',
    '215 lbs (98 kg)',
    14
  ),
  createPlayer(
    'c-004',
    '德安德烈·艾顿',
    '中锋',
    '菲尼克斯太阳',
    'common',
    [70, 80, 50, 40, 70, 30],
    '德安德烈·艾顿，一名出色的内线球员，以其篮板和盖帽能力著称。他曾帮助太阳队进入总决赛。',
    22,
    '7\'0" (2.13m)',
    '250 lbs (113 kg)',
    6
  ),
  createPlayer(
    'c-005',
    '克里斯·米德尔顿',
    '小前锋',
    '密尔沃基雄鹿',
    'common',
    [75, 55, 65, 60, 30, 75],
    '克里斯·米德尔顿，一名出色的三分射手和全面的球员，以其关键时刻的表现著称。他曾帮助雄鹿队获得NBA总冠军。',
    22,
    '6\'7" (2.01m)',
    '222 lbs (101 kg)',
    12
  ),
  createPlayer(
    'c-006',
    '朱·霍勒迪',
    '控球后卫',
    '波士顿凯尔特人',
    'common',
    [70, 50, 70, 80, 40, 65],
    '朱·霍勒迪，联盟中最出色的防守后卫之一，以其坚韧的防守和出色的组织能力著称。他曾帮助雄鹿队获得NBA总冠军。',
    4,
    '6\'4" (1.93m)',
    '205 lbs (93 kg)',
    15
  ),
  createPlayer(
    'c-007',
    '保罗·乔治',
    '小前锋',
    '费城76人',
    'common',
    [78, 60, 60, 70, 45, 70],
    '保罗·乔治，一名出色的双向球员，以其出色的防守和得分能力著称。他曾多次入选最佳防守阵容和全明星阵容。',
    24,
    '6\'8" (2.03m)',
    '220 lbs (100 kg)',
    14
  ),
  createPlayer(
    'c-008',
    '凯里·欧文',
    '控球后卫',
    '达拉斯独行侠',
    'common',
    [80, 40, 70, 60, 30, 75],
    '凯里·欧文，联盟中技术最出色的控球后卫之一，以其华丽的运球和出色的得分能力著称。他曾帮助骑士队获得NBA总冠军。',
    11,
    '6\'2" (1.88m)',
    '180 lbs (82 kg)',
    13
  ),
];

export const getPlayerById = (id: string): Player | undefined => {
  return ALL_PLAYERS.find(player => player.id === id);
};

export const getPlayersByRarity = (rarity: Rarity): Player[] => {
  return ALL_PLAYERS.filter(player => player.rarity === rarity);
};

export const getPlayersByTeam = (team: string): Player[] => {
  return ALL_PLAYERS.filter(player => player.team === team);
};

export const getPlayersByPosition = (position: string): Player[] => {
  return ALL_PLAYERS.filter(player => player.position === position);
};
