import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingTrip, CartItem } from '../types';

const TRIPS_STORAGE_KEY = '@shopping_trips';

export const saveTrip = async (trip: ShoppingTrip): Promise<void> => {
  const existing = await loadTrips();
  const updated = [trip, ...existing];
  await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updated));
};

export const loadTrips = async (): Promise<ShoppingTrip[]> => {
  const raw = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  // Revive date strings to Date objects
  return parsed.map((t: any) => ({
    ...t,
    createdAt: new Date(t.createdAt),
    completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
  }));
};

export const clearTrips = async (): Promise<void> => {
  await AsyncStorage.removeItem(TRIPS_STORAGE_KEY);
};
