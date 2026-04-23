import React, { useMemo } from 'react';
import { CollectedCard, TEAMS, Rarity, RARITY_LABELS, RARITY_COLORS } from '../types';
import { ALL_PLAYERS, getPlayerById } from '../data/players';

interface StatisticsProps {
  collectedCards: CollectedCard[];
  coins: number;
}

const Statistics: React.FC<StatisticsProps> = ({ collectedCards, coins }) => {
  const getCardCount = (playerId: string, rarity: Rarity): number => {
    const card = collectedCards.find(
      (c) => c.playerId === playerId && c.rarity === rarity
    );
    return card?.count || 0;
  };

  const isPlayerOwned = (playerId: string): boolean => {
    return collectedCards.some((c) => c.playerId === playerId && c.count > 0);
  };

  const stats = useMemo(() => {
    const totalPlayers = ALL_PLAYERS.length;
    const ownedPlayers = new Set<string>();
    const rarityCounts: Record<Rarity, { total: number; owned: number }> = {
      common: { total: 0, owned: 0 },
      rare: { total: 0, owned: 0 },
      epic: { total: 0, owned: 0 },
      legendary: { total: 0, owned: 0 },
    };

    const teamStats: Record<string, { total: number; owned: number }> = {};
    TEAMS.forEach((team) => {
      teamStats[team] = { total: 0, owned: 0 };
    });

    ALL_PLAYERS.forEach((player) => {
      rarityCounts[player.rarity].total++;
      if (teamStats[player.team]) {
        teamStats[player.team].total++;
      }

      if (isPlayerOwned(player.id)) {
        ownedPlayers.add(player.id);
        rarityCounts[player.rarity].owned++;
        if (teamStats[player.team]) {
          teamStats[player.team].owned++;
        }
      }
    });

    let rarestCards: { playerId: string; rarity: Rarity }[] = [];
    const rarityOrder: Rarity[] = ['legendary', 'epic', 'rare', 'common'];
    
    for (const rarity of rarityOrder) {
      const cardsOfRarity = collectedCards.filter(
        (c) => c.rarity === rarity && c.count > 0
      );
      if (cardsOfRarity.length > 0) {
        rarestCards = cardsOfRarity.map((c) => ({ playerId: c.playerId, rarity: c.rarity }));
        break;
      }
    }

    return {
      totalPlayers,
      ownedPlayers: ownedPlayers.size,
      rarityCounts,
      teamStats,
      rarestCards,
    };
  }, [collectedCards]);

  const progressPercentage = (stats.ownedPlayers / stats.totalPlayers) * 100;

  const getRarityIcon = (rarity: Rarity): string => {
    switch (rarity) {
      case 'legendary':
        return '🏆';
      case 'epic':
        return '💎';
      case 'rare':
        return '⭐';
      case 'common':
      default:
        return '📦';
    }
  };

  return (
    <div className="p-6">
      {/* 总体统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 金币 */}
        <div className="bg-navy-light rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">💰</div>
          <h3 className="text-gray-400 text-sm mb-2">当前金币</h3>
          <p className="text-3xl font-bold text-gold">{coins.toLocaleString()}</p>
        </div>

        {/* 收集进度 */}
        <div className="bg-navy-light rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">📚</div>
          <h3 className="text-gray-400 text-sm mb-2">收集进度</h3>
          <p className="text-3xl font-bold text-gold">
            {stats.ownedPlayers} / {stats.totalPlayers}
          </p>
          <div className="mt-3 h-3 bg-navy-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-1">{progressPercentage.toFixed(1)}%</p>
        </div>

        {/* 卡片总数 */}
        <div className="bg-navy-light rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">🎴</div>
          <h3 className="text-gray-400 text-sm mb-2">卡片总数</h3>
          <p className="text-3xl font-bold text-gold">
            {collectedCards.reduce((total, c) => total + c.count, 0)}
          </p>
        </div>
      </div>

      {/* 稀有度统计 */}
      <div className="bg-navy-light rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gold mb-6">稀有度统计</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.entries(stats.rarityCounts) as [Rarity, typeof stats.rarityCounts[Rarity]][]).map(
            ([rarity, data]) => {
              const percentage = data.total > 0 ? (data.owned / data.total) * 100 : 0;
              return (
                <div
                  key={rarity}
                  className="bg-navy-dark rounded-lg p-4"
                  style={{ borderLeft: `4px solid ${RARITY_COLORS[rarity]}` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getRarityIcon(rarity)}</span>
                      <span
                        className="font-bold"
                        style={{ color: RARITY_COLORS[rarity] }}
                      >
                        {RARITY_LABELS[rarity]}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {data.owned}/{data.total}
                    </span>
                  </div>
                  <div className="h-2 bg-navy rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: RARITY_COLORS[rarity],
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{percentage.toFixed(1)}%</p>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* 各队收集情况 */}
      <div className="bg-navy-light rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gold mb-6">各队收集情况</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(stats.teamStats).map(([team, data]) => {
            const percentage = data.total > 0 ? (data.owned / data.total) * 100 : 0;
            return (
              <div key={team} className="bg-navy-dark rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{team}</span>
                  <span className="text-gray-400 text-sm">
                    {data.owned}/{data.total} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-navy rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 最稀有卡片 */}
      {stats.rarestCards.length > 0 && (
        <div className="bg-navy-light rounded-xl p-6">
          <h2 className="text-xl font-bold text-gold mb-6">
            {getRarityIcon(stats.rarestCards[0].rarity)} 你拥有的最稀有卡片
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.rarestCards.map((card, index) => {
              const player = getPlayerById(card.playerId);
              if (!player) return null;
              const count = getCardCount(card.playerId, card.rarity);
              return (
                <div
                  key={`${card.playerId}-${card.rarity}-${index}`}
                  className="bg-navy-dark rounded-lg p-4"
                  style={{ borderLeft: `4px solid ${RARITY_COLORS[card.rarity]}` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-bold text-lg">{player.name}</h3>
                      <p className="text-gray-400 text-sm">{player.team}</p>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{
                        backgroundColor: RARITY_COLORS[card.rarity],
                        color: card.rarity === 'common' ? '#fff' : '#000',
                      }}
                    >
                      {RARITY_LABELS[card.rarity]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{player.position}</span>
                    <span className="text-gold font-bold">x{count}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-gray-400">得分</p>
                      <p className="text-white font-bold">{player.attributes.scoring}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">篮板</p>
                      <p className="text-white font-bold">{player.attributes.rebounding}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">助攻</p>
                      <p className="text-white font-bold">{player.attributes.assists}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 暂无稀有卡片提示 */}
      {stats.rarestCards.length === 0 && (
        <div className="bg-navy-light rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🎴</div>
          <h3 className="text-xl text-gray-400 mb-2">还没有收集到任何卡片</h3>
          <p className="text-gray-500">快去开卡包吧！</p>
        </div>
      )}
    </div>
  );
};

export default Statistics;
