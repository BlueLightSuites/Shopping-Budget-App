import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useToast } from 'react-native-toast-notifications';
import { RootStackParamList, CartItem } from '../types';
import { apiService } from '../services/api';

import ItemConfirmationModal from '../components/ItemConfirmationModal/ItemConfirmationModal';
import UnrecognizedBarcodeModal from '../components/UnrecognizedBarcodeModal/UnrecognizedBarcodeModal';

type ScanViewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ScanView'>;
type ScanViewScreenRouteProp = RouteProp<RootStackParamList, 'ScanView'>;

const { width, height } = Dimensions.get('window');

export default function ScanViewScreen() {
  const navigation = useNavigation<ScanViewScreenNavigationProp>();
  const route = useRoute<ScanViewScreenRouteProp>();
  const toast = useToast();

  const { budget, zipCode, existingItems = [] } = route.params;
  const [items, setItems] = useState<CartItem[]>(existingItems); // Shopping list state

  // Sync items when returning from MainShoppingScreen (e.g. after a deletion)
  useFocusEffect(
    React.useCallback(() => {
      setItems(route.params.existingItems ?? []);
    }, [route.params.existingItems])
  );

  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );
  const remaining = budget - cartTotal;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showUnrecognizedModal, setShowUnrecognizedModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string>('');

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async (scanningResult: BarcodeScanningResult) => {
    if (scanned || loading) return;
    
    let { data } = scanningResult;
    if (!data) return;

    console.log('Raw barcode scanned:', data);
    
    // Format barcode: remove trailing character (check digit), then pad to 13 digits for Kroger API
    let formattedBarcode = data.slice(0, -1);
    // let formattedBarcode = '0011110823540';
    while (formattedBarcode.length < 13) {
      formattedBarcode = formattedBarcode.padStart(13, '0');
    }
    
    console.log('Formatted barcode:', formattedBarcode);
    
    setScanned(true);
    setLoading(true);
    setScannedBarcode(formattedBarcode);
    
    // Trigger haptic feedback (commented out for now)
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      console.log('Searching for barcode:', formattedBarcode);
      const locationId = await apiService.getLocationIdByZip(zipCode);
      console.log('Got location ID:', locationId);
      const result = await apiService.searchProductByBarcode(formattedBarcode, locationId);
      
      console.log('Search result:', result);
      if (result.success && result.product) {
        setScannedProduct(result.product);
        setShowItemModal(true);
      } else {
        toast.show('Product not found. Please enter manually.', { 
          type: 'warning', 
          duration: 3000 
        });
        setShowUnrecognizedModal(true);
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      toast.show('Error searching for product. Please try again.', { 
        type: 'danger', 
        duration: 3000 
      });
      setShowUnrecognizedModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFlashToggle = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  const handleManualEntry = () => {
    setShowUnrecognizedModal(true);
  };


  const handleItemConfirmed = (quantity: number) => {
    setShowItemModal(false);
    if (scannedProduct) {
      setItems((prev) => [
        ...prev,
        {
          product: scannedProduct,
          quantity,
          totalPrice: scannedProduct.price * quantity,
        },
      ]);
    }
    // Reset scanned state after a short delay to allow scanning again
    setTimeout(() => {
      setScanned(false);
      setScannedProduct(null);
    }, 1000);
  };

  const handleItemDismissed = () => {
    setShowItemModal(false);
    // Reset scanned state after a short delay to allow scanning again
    setTimeout(() => {
      setScanned(false);
      setScannedProduct(null);
    }, 500);
  };


  const handleUnrecognizedItemAdded = (itemName: string, price: number, quantity: number) => {
    setShowUnrecognizedModal(false);
    const manualProduct = {
      id: Math.random().toString(),
      // name: itemName,
      price,
      barcode: scannedBarcode,
      image: undefined,
      description: itemName,
      brand: undefined,
      category: undefined,
    };
    setItems((prev) => [
      ...prev,
      {
        product: manualProduct,
        quantity,
        totalPrice: price * quantity,
      },
    ]);
    // Reset scanned state after a short delay to allow scanning again
    setTimeout(() => {
      setScanned(false);
      setScannedBarcode('');
    }, 1000);
  };

  // Navigate to MainShoppingScreen with budget and items
  const handleGoToMainShopping = () => {
    navigation.navigate('MainShopping', { budget, zipCode, items });
  };

  const handleUnrecognizedDismissed = () => {
    setShowUnrecognizedModal(false);
    // Reset scanned state after a short delay to allow scanning again
    setTimeout(() => {
      setScanned(false);
      setScannedBarcode('');
    }, 500);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flash}
        enableTorch={flash === 'on'}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Barcode</Text>
            <TouchableOpacity
              style={styles.flashButton}
              onPress={handleFlashToggle}
            >
              <Ionicons
                name={flash === 'off' ? "flash-off" : "flash"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {/* Scanning Frame */}
          <View style={styles.scanFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4A90E2" />
                <Text style={styles.loadingText}>Searching for product...</Text>
              </View>
            )}
            {!loading && (
              <Text style={styles.instructionText}>
                Position barcode in the frame
              </Text>
            )}
            
            <Text style={styles.budgetText}>
              Remaining: ${remaining.toFixed(2)}
            </Text>
            {items.length > 0 && (
              <Text style={styles.itemsCountText}>
                {items.length} item{items.length !== 1 ? 's' : ''} in cart
              </Text>
            )}
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.manualButton}
              onPress={handleManualEntry}
            >
              <Ionicons name="create" size={20} color="white" />
              <Text style={styles.manualButtonText}>Manual Entry</Text>
            </TouchableOpacity>
            {items.length > 0 && (
              <TouchableOpacity
                style={[styles.manualButton, { marginTop: 12, backgroundColor: '#4CAF50' }]}
                onPress={handleGoToMainShopping}
              >
                <Ionicons name="cart" size={20} color="white" />
                <Text style={styles.manualButtonText}>View Shopping List</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>

      {/* Item Confirmation Modal */}
      <ItemConfirmationModal
        visible={showItemModal}
        product={scannedProduct}
        onConfirm={handleItemConfirmed}
        onDismiss={handleItemDismissed}
      />

      {/* Unrecognized Barcode Modal */}
      <UnrecognizedBarcodeModal
        visible={showUnrecognizedModal}
        barcode={scannedBarcode}
        onAdd={handleUnrecognizedItemAdded}
        onDismiss={handleUnrecognizedDismissed}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  flashButton: {
    padding: 8,
  },
  scanFrame: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 250,
    height: 250,
    marginLeft: -125,
    marginTop: -125,
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#10B981',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#10B981',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#10B981',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#10B981',
  },
  instructions: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  budgetText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  manualButtonText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  permissionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
  },
  itemsCountText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 4,
  },
}); 