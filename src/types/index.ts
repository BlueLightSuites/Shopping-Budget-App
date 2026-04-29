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
}

export interface ShoppingTrip {
  id: string;
  budget: number;
  spent: number;
  remaining: number;
  items: CartItem[];
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
  ScanView: { budget: number; zipCode: string; store: StoreId; existingItems?: CartItem[] };
  MainShopping: { budget: number; zipCode: string; store: StoreId; items: CartItem[] };
  Cart: { tripId: string };
  Settings: undefined;
  RecentTrips: undefined;
  StoreSelector: { locationId?: string, budget: number  };
};