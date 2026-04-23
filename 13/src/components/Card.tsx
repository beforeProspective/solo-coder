import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Player, Rarity, RARITY_LABELS, RARITY_COLORS } from '../types';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface CardProps {
  player: Player;
  rarity?: Rarity;
  isUnknown?: boolean;
  count?: number;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  flyIn?: boolean;
  synthesisAnimation?: boolean;
}

const Card: React.FC<CardProps> = ({
  player,
  rarity,
  isUnknown = false,
  count,
  size = 'medium',
  onClick,
  flyIn = false,
  synthesisAnimation = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRarity = rarity || player.rarity;

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'small':
        return 'w-48 h-72';
      case 'large':
        return 'w-80 h-[480px]';
      case 'medium':
      default:
        return 'w-64 h-96';
    }
  }, [size]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsFlipped(!isFlipped);
    }
  };

  const chartData = useMemo(() => {
    return {
      labels: ['得分', '篮板', '助攻', '抢断', '盖帽', '三分'],
      datasets: [
        {
          label: '能力值',
          data: [
            player.attributes.scoring,
            player.attributes.rebounding,
            player.attributes.assists,
            player.attributes.steals,
            player.attributes.blocks,
            player.attributes.threePoint,
          ],
          backgroundColor: `${RARITY_COLORS[cardRarity]}33`,
          borderColor: RARITY_COLORS[cardRarity],
          borderWidth: 2,
          pointBackgroundColor: RARITY_COLORS[cardRarity],
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: RARITY_COLORS[cardRarity],
        },
      ],
    };
  }, [player.attributes, cardRarity]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          angleLines: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          pointLabels: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: {
              size: size === 'small' ? 8 : 10,
            },
          },
          ticks: {
            display: false,
            beginAtZero: true,
            max: 100,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: RARITY_COLORS[cardRarity],
          borderWidth: 1,
        },
      },
    };
  }, [size, cardRarity]);

  const getRarityClass = (): string => {
    switch (cardRarity) {
      case 'legendary':
        return 'rarity-legendary';
      case 'epic':
        return 'rarity-epic';
      case 'rare':
        return 'rarity-rare';
      case 'common':
      default:
        return 'rarity-common';
    }
  };

  if (isUnknown) {
    return (
      <div
        className={`${sizeClasses} unknown-card rounded-xl cursor-pointer transform transition-transform hover:scale-105`}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className={`card-container ${sizeClasses} cursor-pointer ${flyIn ? 'card-fly-in' : ''} ${synthesisAnimation ? 'synthesis-animation' : ''}`}
      onClick={handleClick}
      style={{ perspective: '1000px' }}
    >
      <div
        className={`card-inner relative w-full h-full transition-transform duration-700 ${isFlipped ? 'flipped' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 卡片正面 */}
        <div
          className={`card-front ${getRarityClass()} p-4 flex flex-col`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* 稀有度标签 */}
          <div className="flex justify-between items-start mb-2">
            <span
              className="text-xs font-bold px-2 py-1 rounded"
              style={{
                backgroundColor: RARITY_COLORS[cardRarity],
                color: cardRarity === 'common' ? '#fff' : '#000',
              }}
            >
              {RARITY_LABELS[cardRarity]}
            </span>
            {count !== undefined && count > 0 && (
              <span className="text-xs bg-black bg-opacity-50 px-2 py-1 rounded text-white">
                x{count}
              </span>
            )}
          </div>

          {/* 球员信息 */}
          <div className="text-center mb-3">
            <h3 className="text-white font-bold text-lg mb-1">{player.name}</h3>
            <div className="flex justify-center items-center gap-2 text-sm text-gray-200">
              <span>{player.team}</span>
              <span>|</span>
              <span>{player.position}</span>
            </div>
            <div className="text-xs text-gray-300 mt-1">
              #{player.jerseyNumber} | {player.height} | {player.experience}年球龄
            </div>
          </div>

          {/* 雷达图 */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-full">
              <Radar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* 提示翻转 */}
          <div className="text-center mt-2">
            <span className="text-xs text-gray-300 opacity-70">点击翻转查看详情</span>
          </div>
        </div>

        {/* 卡片背面 */}
        <div
          className={`card-back ${getRarityClass()} p-4 flex flex-col`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* 标题 */}
          <div className="text-center mb-4">
            <h3 className="text-white font-bold text-lg mb-1">{player.name}</h3>
            <span
              className="text-xs font-bold px-2 py-1 rounded"
              style={{
                backgroundColor: RARITY_COLORS[cardRarity],
                color: cardRarity === 'common' ? '#fff' : '#000',
              }}
            >
              {RARITY_LABELS[cardRarity]}
            </span>
          </div>

          {/* 球员故事 */}
          <div className="flex-1 overflow-y-auto">
            <h4 className="text-white font-semibold text-sm mb-2">球员简介</h4>
            <p className="text-gray-200 text-sm leading-relaxed">{player.story}</p>
          </div>

          {/* 属性详情 */}
          <div className="mt-4 pt-3 border-t border-white border-opacity-20">
            <h4 className="text-white font-semibold text-sm mb-2">能力值详情</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">得分:</span>
                <span className="text-white font-bold">{player.attributes.scoring}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">篮板:</span>
                <span className="text-white font-bold">{player.attributes.rebounding}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">助攻:</span>
                <span className="text-white font-bold">{player.attributes.assists}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">抢断:</span>
                <span className="text-white font-bold">{player.attributes.steals}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">盖帽:</span>
                <span className="text-white font-bold">{player.attributes.blocks}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">三分:</span>
                <span className="text-white font-bold">{player.attributes.threePoint}</span>
              </div>
            </div>
          </div>

          {/* 提示翻转 */}
          <div className="text-center mt-3">
            <span className="text-xs text-gray-300 opacity-70">点击翻回正面</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
