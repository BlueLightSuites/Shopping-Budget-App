
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, CartItem } from '../types';
import { saveTrip } from '../utilities/tripStorage';

// ShoppingItem type for local use
type ShoppingItem = {
  id: string;
  name?: string;
  price: number;
  quantity: number;
  description: string;
};
type MainShoppingScreenRouteProp = RouteProp<RootStackParamList, 'MainShopping'>;
type MainShoppingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainShopping'>;

const BUDGET_MILESTONES = [0.75, 1];


const MainShoppingScreen: React.FC = () => {
  const route = useRoute<MainShoppingScreenRouteProp>();
  const navigation = useNavigation<MainShoppingScreenNavigationProp>();
  const { budget = 0, zipCode = '', items: initialItems = [] } = route.params ?? {};
  const [items, setItems] = useState(initialItems);
  const [shownMilestones, setShownMilestones] = useState<number[]>([]);
  const [tripFinished, setTripFinished] = useState(false);

  // Sync items when route params are updated (e.g. returning from ScanViewScreen)
  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);
  const toast = useToast();

  const total = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [items]);
  const remaining = budget - total;
  const percentUsed = budget > 0 ? total / budget : 0;

  // Budget color logic
  let budgetColor = '#4CAF50'; // green
  if (percentUsed >= 0.75 && percentUsed < 1) budgetColor = '#FFC107'; // yellow
  if (percentUsed >= 1) budgetColor = '#F44336'; // red

  // Toast notifications for budget milestones
  useEffect(() => {
    BUDGET_MILESTONES.forEach((milestone) => {
      if (percentUsed >= milestone && !shownMilestones.includes(milestone)) {
        if (milestone === 0.75) {
          toast.show("You've used 75% of your budget!", { type: 'warning' });
        } else if (milestone === 1) {
          toast.show('You are now over budget!', { type: 'danger' });
        }
        setShownMilestones((prev) => [...prev, milestone]);
      }
    });
  }, [percentUsed, shownMilestones, toast]);

  // Remove item handler
  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== id));
  };

  // Quantity change handler — removes the item if quantity reaches 0
  const handleQuantityChange = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.product.id === id
            ? { ...item, quantity: item.quantity + delta, totalPrice: item.product.price * (item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.description}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.qtyControls}>
        <TouchableOpacity onPress={() => handleQuantityChange(item.id, -1)} style={styles.qtyBtn}>
          <Ionicons name="remove" size={18} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.itemQty}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => handleQuantityChange(item.id, 1)} style={styles.qtyBtn}>
          <Ionicons name="add" size={18} color="#4A90E2" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
        <Ionicons name="trash" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.budgetBlock}>
          <Text style={styles.label}>Budget</Text>
          <Text style={styles.value}>${budget.toFixed(2)}</Text>
        </View>
        <View style={styles.budgetBlock}>
          <Text style={styles.label}>{remaining < 0 ? 'Over Budget' : 'Remaining'}</Text>
          <Text style={[styles.remaining, { color: budgetColor }]}>
            {remaining < 0 ? '-' : ''}${Math.abs(remaining).toFixed(2)}
          </Text>
        </View>
        <View style={styles.budgetBlock}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.value}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Shopping List Area */}
      <FlatList
        data={items.map(item => ({
          id: item.product.id,
          description: item.product.description,
          price: item.product.price,
          quantity: item.quantity,
        }))}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {budget > 0 ? 'No items yet' : 'No active shopping trip'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {budget > 0
                ? 'Go back to scan items and add them to your list'
                : 'Start a new trip from the Home tab to set a budget and scan items'}
            </Text>
          </View>
        }
      />

      {/* Bottom Action Buttons */}
      {budget > 0 && (
        <View style={styles.bottomActions}>
          {tripFinished ? (
            <TouchableOpacity
              style={styles.newTripBtn}
              onPress={() => {
                setItems([]);
                setShownMilestones([]);
                navigation.setParams({ items: [], budget: 0, zipCode: '' } as any);
                navigation.getParent()?.navigate('HomeTab');
              }}
            >
              <Ionicons name="add-circle" size={20} color="#4A90E2" />
              <Text style={styles.scanMoreText}>Start New Trip</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.scanMoreBtn}
              onPress={() => navigation.navigate('ScanView', { budget, zipCode, existingItems: items })}
            >
              <Ionicons name="scan" size={20} color="#4A90E2" />
              <Text style={styles.scanMoreText}>Scan More</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.finishBtn, (items.length === 0 || tripFinished) && styles.finishBtnDisabled]}
            onPress={async () => {
              if (items.length === 0 || tripFinished) return;
              setTripFinished(true);
              const now = new Date();
              const trip = {
                id: now.getTime().toString(),
                budget,
                spent: total,
                remaining,
                items,
                createdAt: now,
                completedAt: now,
              };
              await saveTrip(trip);
              setItems([]);
              setTripFinished(false);
              navigation.setParams({ items: [] } as any);
              navigation.getParent()?.navigate('RecentTripsTab');
            }}
            disabled={items.length === 0 || tripFinished}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.finishText}>Finish Trip</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  budgetBlock: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  remaining: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 2,
    color: '#222',
  },
  itemPrice: {
    fontSize: 16,
    flex: 1,
    color: '#666',
    textAlign: 'right',
  },
  itemQty: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  qtyBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#D1FAE5',
  },
  removeBtn: {
    marginLeft: 16,
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  scanMoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    gap: 8,
  },
  newTripBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    gap: 8,
  },
  scanMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  finishBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
    gap: 8,
  },
  finishBtnDisabled: {
    backgroundColor: '#aaa',
  },
  finishText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default MainShoppingScreen;
