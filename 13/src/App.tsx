import React, { useState, useEffect, useCallback } from 'react';
import { TabType, Rarity, RARITY_LABELS } from './types';
import { getUserData, resetUserData, synthesizeCards } from './services/storage';
import PackOpener from './components/PackOpener';
import Collection from './components/Collection';
import Statistics from './components/Statistics';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pack');
  const [coins, setCoins] = useState<number>(1000);
  const [collectedCards, setCollectedCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [synthesisMessage, setSynthesisMessage] = useState<string>('');
  const [synthesisSuccess, setSynthesisSuccess] = useState<boolean>(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const data = await getUserData();
      setCoins(data.coins);
      setCollectedCards(data.collectedCards);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoinsUpdate = useCallback((newCoins: number) => {
    setCoins(newCoins);
  }, []);

  const handleCollectionUpdate = useCallback(async () => {
    const data = await getUserData();
    setCollectedCards(data.collectedCards);
    setCoins(data.coins);
  }, []);

  const handleSynthesis = async (playerId: string, currentRarity: Rarity) => {
    try {
      const result = await synthesizeCards(playerId, currentRarity);
      if (result.success && result.newRarity) {
        setSynthesisSuccess(true);
        setSynthesisMessage(
          `合成成功！获得 ${RARITY_LABELS[result.newRarity]} 卡片，奖励 ${result.bonusCoins} 金币！`
        );
        await handleCollectionUpdate();
      } else {
        setSynthesisSuccess(false);
        setSynthesisMessage('合成失败，请检查是否拥有足够的卡片。');
      }
      setTimeout(() => {
        setSynthesisMessage('');
      }, 3000);
    } catch (error) {
      setSynthesisSuccess(false);
      setSynthesisMessage('合成过程中发生错误。');
      setTimeout(() => {
        setSynthesisMessage('');
      }, 3000);
    }
  };

  const handleReset = async () => {
    try {
      await resetUserData();
      await loadUserData();
      setShowResetConfirm(false);
    } catch (error) {
      console.error('Failed to reset data:', error);
    }
  };

  const getTabClass = (tab: TabType): string => {
    const baseClass =
      'px-6 py-3 rounded-t-xl font-semibold transition-all duration-300';
    if (activeTab === tab) {
      return `${baseClass} bg-navy-light text-gold shadow-lg`;
    }
    return `${baseClass} bg-navy-dark text-gray-400 hover:text-gray-200 hover:bg-navy-light`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gold text-xl">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      {/* 顶部导航栏 */}
      <header className="bg-navy-light shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🏀</div>
              <div>
                <h1 className="text-2xl font-bold text-gold">篮球球星卡收集</h1>
                <p className="text-gray-400 text-sm">Basketball Card Collector</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-navy-dark px-4 py-2 rounded-xl">
                <span className="text-2xl">💰</span>
                <span className="text-gold font-bold text-xl">{coins.toLocaleString()}</span>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm"
              >
                重置数据
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 标签页导航 */}
      <nav className="bg-navy border-b border-navy-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('pack')}
              className={getTabClass('pack')}
            >
              🎴 开卡包
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={getTabClass('collection')}
            >
              📚 收藏册
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={getTabClass('stats')}
            >
              📊 统计
            </button>
          </div>
        </div>
      </nav>

      {/* 合成消息提示 */}
      {synthesisMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`px-6 py-3 rounded-xl shadow-lg ${
              synthesisSuccess
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {synthesisMessage}
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'pack' && (
          <PackOpener
            userCoins={coins}
            onCoinsUpdate={handleCoinsUpdate}
            onCollectionUpdate={handleCollectionUpdate}
          />
        )}
        {activeTab === 'collection' && (
          <Collection
            collectedCards={collectedCards}
            onSynthesis={handleSynthesis}
          />
        )}
        {activeTab === 'stats' && (
          <Statistics collectedCards={collectedCards} coins={coins} />
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-navy-dark border-t border-navy-light mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-500 text-sm">
            🏀 篮球球星卡收集应用 | 共 {collectedCards.length} 种卡片已收集
          </p>
        </div>
      </footer>

      {/* 重置确认模态框 */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-navy rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-500 mb-4">⚠️ 确认重置</h2>
            <p className="text-gray-300 mb-6">
              此操作将删除所有收集的卡片和金币，恢复到初始状态。此操作无法撤销，确定要继续吗？
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
