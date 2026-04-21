import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ShoppingTrip } from '../types';
import { AdBanner } from '../components/AdBanner';

type RecentTripsNavigationProp = StackNavigationProp<RootStackParamList, 'RecentTrips'>;

const RecentTripsScreen = () => {
  const navigation = useNavigation<RecentTripsNavigationProp>();
  const [trips, setTrips] = useState<ShoppingTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch recent trips from local storage or database
    // For now, we'll use mock data
    const mockTrips: ShoppingTrip[] = [
      {
        id: '1',
        budget: 100,
        spent: 87.50,
        remaining: 12.50,
        items: [],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        budget: 75,
        spent: 65.25,
        remaining: 9.75,
        items: [],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        budget: 120,
        spent: 95.00,
        remaining: 25.00,
        items: [],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    ];

    setTrips(mockTrips);
    setLoading(false);
  }, []);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const renderTripItem = ({ item, index }: { item: ShoppingTrip; index: number }) => (
    <View key={item.id}>
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => {
          // TODO: Navigate to trip details or allow resuming the trip
        }}
        activeOpacity={0.7}
      >
        <View style={styles.tripHeader}>
          <View style={styles.tripInfo}>
            <Text style={styles.tripDate}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.tripBudget}>Budget: ${item.budget.toFixed(2)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#4A90E2" />
        </View>
        <View style={styles.tripStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={styles.statValue}>${item.spent.toFixed(2)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              ${item.remaining.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Saved</Text>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              {(((item.budget - item.spent) / item.budget) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Show ad after every 2 trips */}
      {(index + 1) % 2 === 0 && <AdBanner size="medium" style={{ marginVertical: 8 }} />}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
        <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.gradient}>
          <ActivityIndicator size="large" color="white" />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recent Trips</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Content */}
        {trips.length > 0 ? (
          <ScrollView
            style={styles.listContent}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {trips.map((trip, index) => renderTripItem({ item: trip, index }))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyText}>No shopping trips yet</Text>
            <Text style={styles.emptySubtext}>
              Start a new shopping trip to get started
            </Text>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tripBudget: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default RecentTripsScreen;
