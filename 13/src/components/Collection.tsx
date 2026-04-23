import React, { useState, useMemo } from 'react';
import { CollectedCard, TEAMS, POSITIONS, Rarity, RARITY_LABELS, RARITY_COLORS, getNextRarity } from '../types';
import { getPlayerById } from '../data/players';
import Card from './Card';

interface CollectionProps {
  collectedCards: CollectedCard[];
  onSynthesis: (playerId: string, currentRarity: Rarity) => void;
}

interface DisplayCard {
  playerId: string;
  rarity: Rarity;
  count: number;
  isOwned: boolean;
}

const Collection: React.FC<CollectionProps> = ({ collectedCards, onSynthesis }) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [showOnlyOwned, setShowOnlyOwned] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<{ playerId: string; playerName: string; rarity: Rarity; count: number } | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisSuccess, setSynthesisSuccess] = useState<{ show: boolean; newRarity: Rarity | null; bonusCoins: number } | null>(null);
  const [justSynthesized, setJustSynthesized] = useState<{ playerId: string; rarity: Rarity } | null>(null);

  const displayCards = useMemo((): DisplayCard[] => {
    const cards: DisplayCard[] = [];

    collectedCards.forEach((card) => {
      const player = getPlayerById(card.playerId);
      if (!player) return;

      const teamMatch = selectedTeam === 'all' || player.team === selectedTeam;
      const positionMatch = selectedPosition === 'all' || player.position === selectedPosition;
      const rarityMatch = selectedRarity === 'all' || card.rarity === selectedRarity;

      if (teamMatch && positionMatch && rarityMatch) {
        cards.push({
          playerId: card.playerId,
          rarity: card.rarity,
          count: card.count,
          isOwned: true,
        });
      }
    });

    const rarityPriority: Record<Rarity, number> = {
      legendary: 4,
      epic: 3,
      rare: 2,
      common: 1,
    };

    cards.sort((a, b) => {
      if (a.isOwned !== b.isOwned) {
        return a.isOwned ? -1 : 1;
      }
      if (a.rarity !== b.rarity) {
        return rarityPriority[b.rarity] - rarityPriority[a.rarity];
      }
      return a.playerId.localeCompare(b.playerId);
    });

    return cards;
  }, [collectedCards, selectedTeam, selectedPosition, selectedRarity]);

  const handleCardClick = (displayCard: DisplayCard) => {
    if (!displayCard.isOwned || isSynthesizing) return;
    
    const player = getPlayerById(displayCard.playerId);
    if (!player) return;

    setSelectedCard({
      playerId: displayCard.playerId,
      playerName: player.name,
      rarity: displayCard.rarity,
      count: displayCard.count,
    });
    setSynthesisSuccess(null);
  };

  const handleSynthesis = async () => {
    if (!selectedCard || selectedCard.count < 3 || isSynthesizing) return;
    
    setIsSynthesizing(true);

    const newRarity = getNextRarity(selectedCard.rarity);
    const bonusCoins = {
      common: 50,
      rare: 150,
      epic: 500,
      legendary: 0,
    }[selectedCard.rarity];

    await new Promise(resolve => setTimeout(resolve, 1000));

    onSynthesis(selectedCard.playerId, selectedCard.rarity);

    setSynthesisSuccess({
      show: true,
      newRarity,
      bonusCoins,
    });

    if (newRarity) {
      setJustSynthesized({ playerId: selectedCard.playerId, rarity: newRarity });
      setTimeout(() => setJustSynthesized(null), 3000);
    }

    setTimeout(() => {
      setIsSynthesizing(false);
      setSelectedCard(null);
      setSynthesisSuccess(null);
    }, 2500);
  };

  const canSynthesize = (playerId: string, rarity: Rarity, count: number): boolean => {
    return count >= 3 && rarity !== 'legendary';
  };

  const ownedCount = collectedCards.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="p-6">
      <div className="bg-navy-light rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gold mb-4">筛选条件</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">球队</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full bg-navy-dark text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-gold focus:outline-none"
            >
              <option value="all">全部球队</option>
              {TEAMS.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">位置</label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full bg-navy-dark text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-gold focus:outline-none"
            >
              <option value="all">全部位置</option>
              {POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">稀有度</label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full bg-navy-dark text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-gold focus:outline-none"
            >
              <option value="all">全部稀有度</option>
              {Object.entries(RARITY_LABELS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyOwned}
                onChange={(e) => setShowOnlyOwned(e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 text-gold focus:ring-gold bg-navy-dark"
              />
              <span className="ml-2 text-gray-300">仅显示已拥有</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400">
          共 <span className="text-gold font-bold">{displayCards.length}</span> 张卡片
        </p>
        <p className="text-gray-400">
          已收集 <span className="text-gold font-bold">{collectedCards.length}</span> 种（共 <span className="text-gold font-bold">{ownedCount}</span> 张）
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {displayCards.map((displayCard) => {
          const player = getPlayerById(displayCard.playerId);
          if (!player) return null;

          const canSynth = canSynthesize(displayCard.playerId, displayCard.rarity, displayCard.count);
          const key = `${displayCard.playerId}-${displayCard.rarity}`;
          const isJustSynthesized = justSynthesized?.playerId === displayCard.playerId && justSynthesized?.rarity === displayCard.rarity;

          return (
            <div key={key} className="relative">
              {displayCard.isOwned ? (
                <div
                  className={`cursor-pointer transform transition-transform hover:scale-105 ${
                    canSynth ? 'ring-2 ring-gold ring-opacity-50 rounded-xl' : ''
                  }`}
                  onClick={() => handleCardClick(displayCard)}
                >
                  <Card
                    player={player}
                    rarity={displayCard.rarity}
                    count={displayCard.count}
                    size="small"
                    synthesisAnimation={isJustSynthesized}
                  />
                  {canSynth && (
                    <div className="absolute top-2 right-2 bg-gold text-navy-dark text-xs font-bold px-2 py-1 rounded-full z-10">
                      可合成
                    </div>
                  )}
                  {isJustSynthesized && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="bg-green-500 bg-opacity-90 text-white px-4 py-2 rounded-lg font-bold text-sm animate-pulse">
                        ✨ 新获得！
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="w-48 h-72 unknown-card rounded-xl cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => handleCardClick(displayCard)}
                />
              )}
            </div>
          );
        })}
      </div>

      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-navy rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex flex-col items-center relative">
                <Card
                  player={getPlayerById(selectedCard.playerId)!}
                  rarity={selectedCard.rarity}
                  count={selectedCard.count}
                  size="large"
                  synthesisAnimation={isSynthesizing}
                />
                
                {isSynthesizing && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-gold font-bold">合成中...</p>
                    </div>
                  </div>
                )}

                {synthesisSuccess?.show && synthesisSuccess.newRarity && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-6 rounded-2xl text-center shadow-2xl transform scale-110">
                      <div className="text-4xl mb-2">🎉</div>
                      <p className="text-xl font-bold mb-2">合成成功！</p>
                      <p className="text-lg">
                        获得 <span className="font-bold" style={{ color: RARITY_COLORS[synthesisSuccess.newRarity] }}>
                          {RARITY_LABELS[synthesisSuccess.newRarity]}
                        </span> 卡片
                      </p>
                      {synthesisSuccess.bonusCoins > 0 && (
                        <p className="text-lg mt-1">
                          奖励 <span className="font-bold text-yellow-300">+{synthesisSuccess.bonusCoins}</span> 金币
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gold mb-2">
                      {selectedCard.playerName}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: RARITY_COLORS[selectedCard.rarity],
                          color: selectedCard.rarity === 'common' ? '#fff' : '#000',
                        }}
                      >
                        {RARITY_LABELS[selectedCard.rarity]}
                      </span>
                      <span className="text-gray-300">x{selectedCard.count}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!isSynthesizing) {
                        setSelectedCard(null);
                        setSynthesisSuccess(null);
                      }
                    }}
                    disabled={isSynthesizing}
                    className={`text-2xl transition-colors ${isSynthesizing ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                  >
                    ✕
                  </button>
                </div>

                {selectedCard.rarity !== 'legendary' && (
                  <div className="bg-navy-light rounded-xl p-4 mb-6">
                    <h3 className="text-gold font-semibold mb-3">卡片合成</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      消耗 3 张相同稀有度的卡片，可以合成 1 张更高稀有度的卡片（属性+15%）
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="text-gray-300">
                        当前拥有: <span className="text-gold font-bold">{selectedCard.count}</span> 张
                      </div>
                      <button
                        onClick={handleSynthesis}
                        disabled={selectedCard.count < 3 || isSynthesizing}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${
                          selectedCard.count >= 3 && !isSynthesizing
                            ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-dark hover:scale-105'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isSynthesizing ? '合成中...' : '合成升级'}
                      </button>
                    </div>
                    {selectedCard.count < 3 && (
                      <p className="text-red-400 text-sm mt-2">
                        需要 3 张卡片才能合成，当前还差 {3 - selectedCard.count} 张
                      </p>
                    )}
                  </div>
                )}

                {selectedCard.rarity === 'legendary' && (
                  <div className="bg-navy-light rounded-xl p-4">
                    <h3 className="text-gold font-semibold mb-3">卡片合成</h3>
                    <p className="text-gray-400 text-sm">
                      传说卡片已经是最高稀有度，无法继续合成。
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;
