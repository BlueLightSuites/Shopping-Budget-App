export interface Product {
  id: string;
  name?: string;
  price: number;
  barcode: string;
  image?: string;
  description: string;
  brand?: string;
  category?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  totalPrice: number;
  storeId?: StoreId; // which store this item was scanned at
}

export interface ShoppingTrip {
  id: string;
  budget: number;
  spent: number;
  remaining: number;
  items: CartItem[];
  stores?: StoreId[]; // all stores visited in this trip
  createdAt: Date;
  completedAt?: Date;
}

export interface ScanResult {
  success: boolean;
  barcode?: string;
  product?: Product;
  error?: string;
}

export interface BudgetSettings {
  defaultBudget: number;
  currency: string;
  notifications: boolean;
}

export type StoreId = 'kroger' | 'walmart';

export type RootStackParamList = {
  Home: undefined;
  BudgetInput: undefined;
  ScanView: { budget: number; zipCode: string; store: StoreId; existingItems?: CartItem[]; visitedStores?: StoreId[] };
  MainShopping: { budget: number; zipCode: string; store: StoreId; stores?: StoreId[]; items: CartItem[] };
  Cart: { tripId: string };
  Settings: undefined;
  Profile: undefined;
  HelpSupport: undefined;
  RecentTrips: undefined;
  TripDetail: { tripId: string };
  StoreSelector: { locationId?: string; budget: number; existingItems?: CartItem[]; visitedStores?: StoreId[] };
};