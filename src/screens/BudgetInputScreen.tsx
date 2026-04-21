import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AdBanner } from '../components/AdBanner';

type BudgetInputScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BudgetInput'>;

export default function BudgetInputScreen() {
  const navigation = useNavigation<BudgetInputScreenNavigationProp>();
  const [budget, setBudget] = useState('100.00');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  useEffect(() => {
    // Get local currency symbol (simplified - in real app, use a proper currency library)
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale.includes('en')) {
      setCurrencySymbol('$');
    } else if (locale.includes('eu')) {
      setCurrencySymbol('€');
    } else if (locale.includes('gb')) {
      setCurrencySymbol('£');
    }
  }, []);

  const handleBudgetChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }
    
    setBudget(cleaned);
  };

  const handleChooseStore = () => {
    const budgetAmount = parseFloat(budget);
    
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid budget amount.');
      return;
    }

    // if (budgetAmount > 10000) {
    //   Alert.alert('High Budget', 'Are you sure you want to set such a high budget?', [
    //     { text: 'Cancel', style: 'cancel' },
    //     // { text: 'Continue', onPress: () => navigation.navigate('ScanView', { budget: budgetAmount }) },
    //   ]);
    //   return;
    // }

    navigation.navigate('StoreSelector', {budget: budgetAmount });
  };

  const handleQuickBudget = (amount: number) => {
    setBudget(amount.toFixed(2));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Your Budget</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Main Content */}
            <View style={styles.mainContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="wallet" size={48} color="white" />
              </View>
              
              <Text style={styles.title}>Set Your Budget for This Trip</Text>
              <Text style={styles.subtitle}>
                Enter the amount you want to spend on this shopping trip
              </Text>

              {/* Budget Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                <TextInput
                  style={styles.budgetInput}
                  value={budget}
                  onChangeText={handleBudgetChange}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  autoFocus
                  selectTextOnFocus
                />
              </View>

              {/* Quick Budget Options */}
              <View style={styles.quickBudgetContainer}>
                <Text style={styles.quickBudgetTitle}>Quick Budget Options:</Text>
                <View style={styles.quickBudgetButtons}>
                  <TouchableOpacity
                    style={styles.quickBudgetButton}
                    onPress={() => handleQuickBudget(50)}
                  >
                    <Text style={styles.quickBudgetText}>{currencySymbol}50</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickBudgetButton}
                    onPress={() => handleQuickBudget(100)}
                  >
                    <Text style={styles.quickBudgetText}>{currencySymbol}100</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickBudgetButton}
                    onPress={() => handleQuickBudget(200)}
                  >
                    <Text style={styles.quickBudgetText}>{currencySymbol}200</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Ad Banner - Before Confirm Button */}
              <AdBanner size="medium" style={{ marginVertical: 16 }} />

              {/* Start Scanning Button */}
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleChooseStore}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="storefront" size={24} color="white" />
                  <Text style={styles.buttonText}>Choose Store</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 30,
    width: '100%',
    maxWidth: 280,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
  },
  budgetInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  quickBudgetContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  quickBudgetTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
  },
  quickBudgetButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  quickBudgetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  quickBudgetText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    borderRadius: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
}); 