import { openDB, IDBPDatabase } from 'idb';
import { UserData, CollectedCard, Rarity, getNextRarity, SYNTHESIS_COST } from '../types';

const DB_NAME = 'BasketballCardCollector';
const DB_VERSION = 1;
const STORE_NAME = 'userData';

let db: IDBPDatabase<unknown> | null = null;

const getDB = async (): Promise<IDBPDatabase<unknown>> => {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return db;
};

const DEFAULT_USER_DATA: UserData = {
  id: 'default',
  coins: 1000,
  collectedCards: [],
  lastPackOpened: '',
};

export const getUserData = async (): Promise<UserData> => {
  const database = await getDB();
  const data = await database.get(STORE_NAME, 'default');
  return data || { ...DEFAULT_USER_DATA };
};

export const saveUserData = async (userData: UserData): Promise<void> => {
  const database = await getDB();
  await database.put(STORE_NAME, userData);
};

export const addCardToCollection = async (playerId: string, rarity: Rarity): Promise<CollectedCard> => {
  const userData = await getUserData();
  const existingCard = userData.collectedCards.find(
    (card) => card.playerId === playerId && card.rarity === rarity
  );

  let updatedCard: CollectedCard;

  if (existingCard) {
    updatedCard = { ...existingCard, count: existingCard.count + 1 };
    userData.collectedCards = userData.collectedCards.map((card) =>
      card.playerId === playerId && card.rarity === rarity ? updatedCard : card
    );
  } else {
    updatedCard = {
      playerId,
      rarity,
      count: 1,
      obtainedAt: new Date().toISOString(),
    };
    userData.collectedCards = [...userData.collectedCards, updatedCard];
  }

  await saveUserData(userData);
  return updatedCard;
};

export const removeCardFromCollection = async (playerId: string, rarity: Rarity): Promise<void> => {
  const userData = await getUserData();
  const cardIndex = userData.collectedCards.findIndex(
    (card) => card.playerId === playerId && card.rarity === rarity
  );

  if (cardIndex !== -1) {
    const card = userData.collectedCards[cardIndex];
    if (card.count > 1) {
      userData.collectedCards[cardIndex] = { ...card, count: card.count - 1 };
    } else {
      userData.collectedCards.splice(cardIndex, 1);
    }
    await saveUserData(userData);
  }
};

export const getCardCount = async (playerId: string, rarity: Rarity): Promise<number> => {
  const userData = await getUserData();
  const card = userData.collectedCards.find(
    (card) => card.playerId === playerId && card.rarity === rarity
  );
  return card?.count || 0;
};

export const getTotalCardCount = async (playerId: string): Promise<number> => {
  const userData = await getUserData();
  return userData.collectedCards
    .filter((card) => card.playerId === playerId)
    .reduce((total, card) => total + card.count, 0);
};

export const getCollectedPlayers = async (): Promise<string[]> => {
  const userData = await getUserData();
  const playerIds = new Set<string>();
  userData.collectedCards.forEach((card) => playerIds.add(card.playerId));
  return Array.from(playerIds);
};

export const getCoins = async (): Promise<number> => {
  const userData = await getUserData();
  return userData.coins;
};

export const setCoins = async (coins: number): Promise<void> => {
  const userData = await getUserData();
  userData.coins = Math.max(0, coins);
  await saveUserData(userData);
};

export const addCoins = async (amount: number): Promise<number> => {
  const userData = await getUserData();
  userData.coins = Math.max(0, userData.coins + amount);
  await saveUserData(userData);
  return userData.coins;
};

export const spendCoins = async (amount: number): Promise<boolean> => {
  const userData = await getUserData();
  if (userData.coins >= amount) {
    userData.coins -= amount;
    await saveUserData(userData);
    return true;
  }
  return false;
};

export const updateLastPackOpened = async (): Promise<void> => {
  const userData = await getUserData();
  userData.lastPackOpened = new Date().toISOString();
  await saveUserData(userData);
};

export const resetUserData = async (): Promise<void> => {
  await saveUserData({ ...DEFAULT_USER_DATA });
};

export const canSynthesize = async (playerId: string, rarity: Rarity): Promise<boolean> => {
  const count = await getCardCount(playerId, rarity);
  const nextRarity = getNextRarity(rarity);
  return count >= SYNTHESIS_COST && nextRarity !== null;
};

export const synthesizeCards = async (
  playerId: string,
  currentRarity: Rarity
): Promise<{ success: boolean; newRarity: Rarity | null; bonusCoins: number }> => {
  const userData = await getUserData();
  const currentCardIndex = userData.collectedCards.findIndex(
    (card) => card.playerId === playerId && card.rarity === currentRarity
  );

  if (currentCardIndex === -1) {
    return { success: false, newRarity: null, bonusCoins: 0 };
  }

  const currentCard = userData.collectedCards[currentCardIndex];
  if (currentCard.count < SYNTHESIS_COST) {
    return { success: false, newRarity: null, bonusCoins: 0 };
  }

  const nextRarity = getNextRarity(currentRarity);
  if (!nextRarity) {
    return { success: false, newRarity: null, bonusCoins: 0 };
  }

  if (currentCard.count > SYNTHESIS_COST) {
    userData.collectedCards[currentCardIndex] = {
      ...currentCard,
      count: currentCard.count - SYNTHESIS_COST,
    };
  } else {
    userData.collectedCards.splice(currentCardIndex, 1);
  }

  const existingNewCardIndex = userData.collectedCards.findIndex(
    (card) => card.playerId === playerId && card.rarity === nextRarity
  );

  if (existingNewCardIndex !== -1) {
    userData.collectedCards[existingNewCardIndex] = {
      ...userData.collectedCards[existingNewCardIndex],
      count: userData.collectedCards[existingNewCardIndex].count + 1,
    };
  } else {
    userData.collectedCards.push({
      playerId,
      rarity: nextRarity,
      count: 1,
      obtainedAt: new Date().toISOString(),
    });
  }

  const bonusCoins = {
    common: 50,
    rare: 150,
    epic: 500,
    legendary: 0,
  }[currentRarity];

  userData.coins += bonusCoins;

  await saveUserData(userData);

  return { success: true, newRarity: nextRarity, bonusCoins };
};
