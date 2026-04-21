import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AdBanner } from '../components/AdBanner';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type KrogerStoreLocatorNavigationProp = StackNavigationProp<RootStackParamList, 'StoreSelector'>;

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

/** TODO - Home Screen Flow
 * User will then be prompted to enter zip code and have them confirm the store location
 * The zip code will be used to fetch location ID to retreive product pricing from Kroger API (i.e., https://api.kroger.com/v1/products/0001111083776?filter.locationId=01400335)
 */

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleStartShopping = () => {
    /*
    * TODO - Upon clicking Start New Shopping Trip, navigate to Store Selector first 
    */

    // navigation.navigate('StoreSelector');
    navigation.navigate('BudgetInput');
  };

  const handleRecentTrips = () => {
    navigation.navigate('RecentTrips');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      <LinearGradient
        colors={['#4A90E2', '#357ABD', '#2E5A8A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="scan" size={32} color="white" />
          <Text style={styles.headerTitle}>Price Scanner</Text>
          <Text style={styles.headerSubtitle}>Smart Shopping Made Easy</Text>
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Shopping Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="wallet" size={24} color="#4A90E2" />
              <Text style={styles.statNumber}>$0</Text>
              <Text style={styles.statLabel}>Total Saved</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="basket" size={24} color="#4A90E2" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Trips This Month</Text>
            </View>
          </View>

          {/* Top Ad Banner */}
          <AdBanner size="medium" style={{ marginVertical: 16 }} />

          {/* Main Action Button */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleStartShopping}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.buttonGradient}
            >
              <Ionicons name="add-circle" size={32} color="white" />
              <Text style={styles.buttonText}>Start New Shopping Trip</Text>
              <Text style={styles.buttonSubtext}>Set budget and start scanning</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={handleRecentTrips}
            >
              <Ionicons name="time" size={24} color="#4A90E2" />
              <Text style={styles.quickActionText}>Recent Trips</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={handleSettings}
            >
              <Ionicons name="settings" size={24} color="#4A90E2" />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Ad Banner */}
          <AdBanner size="medium" style={{ marginVertical: 16 }} />

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="scan-circle" size={20} color="#4A90E2" />
              <Text style={styles.featureText}>Scan barcodes instantly</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="calculator" size={20} color="#4A90E2" />
              <Text style={styles.featureText}>Track your budget</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="trending-up" size={20} color="#4A90E2" />
              <Text style={styles.featureText}>Save money on groceries</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  mainButton: {
    marginBottom: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  buttonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
  },
  quickActionText: {
    fontSize: 14,
    color: 'white',
    marginTop: 8,
  },
  features: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 12,
  },
}); 