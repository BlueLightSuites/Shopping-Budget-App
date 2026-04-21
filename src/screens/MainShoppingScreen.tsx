
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';

// ShoppingItem type for local use
type ShoppingItem = {
  id: string;
  name?: string;
  price: number;
  quantity: number;
  description: string;
};
type MainShoppingScreenRouteProp = RouteProp<RootStackParamList, 'MainShopping'>;

const BUDGET_MILESTONES = [0.75, 1];


const MainShoppingScreen: React.FC = () => {
  const route = useRoute<MainShoppingScreenRouteProp>();
  const navigation = useNavigation();
  const { budget, items: initialItems } = route.params;
  const [items, setItems] = useState(initialItems);
  const [shownMilestones, setShownMilestones] = useState<number[]>([]);
  const toast = useToast();

  const total = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [items]);
  const remaining = budget - total;
  const percentUsed = total / budget;

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

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.description}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        <Text style={styles.itemQty}>x{item.quantity}</Text>
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
          <Text style={styles.label}>Current Budget</Text>
          <Text style={styles.value}>${budget.toFixed(2)}</Text>
        </View>
        <View style={styles.budgetBlock}>
          <Text style={styles.label}>Remaining Budget</Text>
          <Text style={[styles.remaining, { color: budgetColor }]}>
            ${remaining.toFixed(2)}
          </Text>
        </View>
        <View style={styles.budgetBlock}>
          <Text style={styles.label}>Current Total</Text>
          <Text style={styles.value}>${total.toFixed(2)}</Text>
        </View>
      </View>
      {/* Shopping List Area */}
      <FlatList
        data={items.map(item => ({
          id: item.product.id,
          // name: item.product.name,
          description: item.product.description,
          price: item.product.price,
          quantity: item.quantity,
        }))}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />
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
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  budgetBlock: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#888',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    paddingBottom: 32,
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
    flex: 1,
    color: '#666',
    textAlign: 'right',
    marginLeft: 8,
  },
  removeBtn: {
    marginLeft: 16,
    padding: 4,
  },
});

export default MainShoppingScreen;
