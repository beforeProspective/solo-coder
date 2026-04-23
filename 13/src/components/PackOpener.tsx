import React, { useState, useCallback } from 'react';
import { Player, Rarity, RARITY_WEIGHTS, RARITY_LABELS } from '../types';
import { ALL_PLAYERS, getPlayerById } from '../data/players';
import { spendCoins, addCardToCollection, updateLastPackOpened } from '../services/storage';
import Card from './Card';

interface PackOpenerProps {
  userCoins: number;
  onCoinsUpdate: (newCoins: number) => void;
  onCollectionUpdate: () => void;
}

const PACK_COST = 100;
const CARDS_PER_PACK = 3;

const PackOpener: React.FC<PackOpenerProps> = ({
  userCoins,
  onCoinsUpdate,
  onCollectionUpdate,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [drawnCards, setDrawnCards] = useState<Player[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [flyInIndex, setFlyInIndex] = useState<number>(-1);
  const [message, setMessage] = useState<string>('');

  const getRandomRarity = useCallback((): Rarity => {
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
      random -= weight;
      if (random <= 0) {
        return rarity as Rarity;
      }
    }
    return 'common';
  }, []);

  const getRandomPlayer = useCallback(
    (rarity: Rarity): Player => {
      const playersByRarity = ALL_PLAYERS.filter((p) => p.rarity === rarity);
      if (playersByRarity.length === 0) {
        const allCommon = ALL_PLAYERS.filter((p) => p.rarity === 'common');
        return allCommon[Math.floor(Math.random() * allCommon.length)];
      }
      return playersByRarity[Math.floor(Math.random() * playersByRarity.length)];
    },
    []
  );

  const drawCards = useCallback(() => {
    const cards: Player[] = [];
    for (let i = 0; i < CARDS_PER_PACK; i++) {
      const rarity = getRandomRarity();
      const player = getRandomPlayer(rarity);
      cards.push(player);
    }
    return cards;
  }, [getRandomRarity, getRandomPlayer]);

  const handleOpenPack = async () => {
    if (userCoins < PACK_COST) {
      setMessage('金币不足！');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setIsOpening(true);
    setMessage('');

    const success = await spendCoins(PACK_COST);
    if (!success) {
      setIsOpening(false);
      setMessage('金币不足！');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    onCoinsUpdate(userCoins - PACK_COST);
    setShaking(true);

    setTimeout(async () => {
      setShaking(false);
      const cards = drawCards();
      setDrawnCards(cards);
      setShowResults(true);

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        setTimeout(() => {
          setFlyInIndex(i);
        }, i * 500);

        await addCardToCollection(card.id, card.rarity);
      }

      await updateLastPackOpened();
      onCollectionUpdate();

      setFlyInIndex(-1);
    }, 1000);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setIsOpening(false);
    setDrawnCards([]);
  };

  const getRarityCounts = () => {
    const counts: Record<Rarity, number> = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };
    drawnCards.forEach((card) => {
      counts[card.rarity]++;
    });
    return counts;
  };

  const rarityCounts = getRarityCounts();

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-6">
      {/* 卡包展示 */}
      <div className="mb-8">
        <div
          className={`relative w-64 h-80 bg-gradient-to-br from-gold-dark via-gold to-gold-light rounded-xl shadow-2xl transform transition-all duration-300 cursor-pointer hover:scale-105 ${
            shaking ? 'pack-opening' : ''
          } ${isOpening && !showResults ? 'animate-pulse' : ''}`}
          onClick={handleOpenPack}
        >
          {/* 卡包图案 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* 篮球图标 */}
            <div className="w-32 h-32 mb-4 relative">
              <div className="absolute inset-0 bg-orange-500 rounded-full border-8 border-orange-700">
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-orange-700 transform -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-0.5 h-full bg-orange-700 transform -translate-x-1/2" />
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <path
                    d="M 50 0 Q 25 50 50 100"
                    fill="none"
                    stroke="#C2410C"
                    strokeWidth="4"
                  />
                  <path
                    d="M 50 0 Q 75 50 50 100"
                    fill="none"
                    stroke="#C2410C"
                    strokeWidth="4"
                  />
                </svg>
              </div>
            </div>

            {/* 文字 */}
            <h2 className="text-2xl font-bold text-navy-dark mb-2">篮球球星卡</h2>
            <p className="text-navy-dark font-semibold">每包 {CARDS_PER_PACK} 张卡片</p>
            <p className="text-navy-dark text-sm mt-1">费用: {PACK_COST} 金币</p>
          </div>

          {/* 光效 */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white via-transparent to-transparent opacity-20 transform rotate-45" />
          </div>
        </div>
      </div>

      {/* 开包按钮 */}
      <button
        onClick={handleOpenPack}
        disabled={isOpening || userCoins < PACK_COST}
        className={`px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
          userCoins >= PACK_COST && !isOpening
            ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-dark hover:scale-105 shadow-lg hover:shadow-xl'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isOpening ? '开包中...' : `开卡包 (${PACK_COST} 金币)`}
      </button>

      {/* 消息提示 */}
      {message && (
        <div className="mt-4 px-6 py-2 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400">
          {message}
        </div>
      )}

      {/* 概率说明 */}
      <div className="mt-8 text-center">
        <h3 className="text-gold font-semibold mb-2">抽卡概率</h3>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-400">普通: 60%</span>
          <span className="text-blue-400">稀有: 25%</span>
          <span className="text-purple-400">史诗: 12%</span>
          <span className="text-gold">传说: 3%</span>
        </div>
      </div>

      {/* 结果展示模态框 */}
      {showResults && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-navy rounded-2xl p-8 max-w-4xl w-full">
            <h2 className="text-2xl font-bold text-gold text-center mb-2">恭喜获得！</h2>

            {/* 稀有度统计 */}
            <div className="flex justify-center gap-4 mb-6 text-sm">
              {rarityCounts.common > 0 && (
                <span className="text-gray-400">普通 x{rarityCounts.common}</span>
              )}
              {rarityCounts.rare > 0 && (
                <span className="text-blue-400">稀有 x{rarityCounts.rare}</span>
              )}
              {rarityCounts.epic > 0 && (
                <span className="text-purple-400">史诗 x{rarityCounts.epic}</span>
              )}
              {rarityCounts.legendary > 0 && (
                <span className="text-gold font-bold">传说 x{rarityCounts.legendary}</span>
              )}
            </div>

            {/* 卡片展示 */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {drawnCards.map((card, index) => {
                const player = getPlayerById(card.id);
                if (!player) return null;
                return (
                  <div key={index} style={{ animationDelay: `${index * 200}ms` }}>
                    <Card
                      player={player}
                      rarity={card.rarity}
                      size="medium"
                      flyIn={true}
                    />
                    <p className="text-center mt-2 text-sm" style={{ color: card.rarity === 'legendary' ? '#D4AF37' : card.rarity === 'epic' ? '#9B59B6' : card.rarity === 'rare' ? '#3498DB' : '#7F8C8D' }}>
                      {RARITY_LABELS[card.rarity]}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 关闭按钮 */}
            <div className="flex justify-center">
              <button
                onClick={handleCloseResults}
                className="px-8 py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-navy-dark rounded-xl font-bold hover:scale-105 transition-transform"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackOpener;
