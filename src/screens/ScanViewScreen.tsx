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
import { walmartApiService } from '../services/walmart-api';

import ItemConfirmationModal from '../components/ItemConfirmationModal/ItemConfirmationModal';
import UnrecognizedBarcodeModal from '../components/UnrecognizedBarcodeModal/UnrecognizedBarcodeModal';

type ScanViewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ScanView'>;
type ScanViewScreenRouteProp = RouteProp<RootStackParamList, 'ScanView'>;

const { width, height } = Dimensions.get('window');

export default function ScanViewScreen() {
  const navigation = useNavigation<ScanViewScreenNavigationProp>();
  const route = useRoute<ScanViewScreenRouteProp>();
  const toast = useToast();

  const { budget, zipCode, store, existingItems = [], visitedStores = [] } = route.params;
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
  // Separate state for the resolved/formatted barcode to display in the modal.
  // Must NOT be in the useEffect deps — updating it should not re-trigger a scan.
  const [resolvedBarcode, setResolvedBarcode] = useState<string>('');

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Pre-fetch the location/store ID as soon as the screen mounts so the
  // first scan has zero extra latency waiting on a location lookup.
  useEffect(() => {
    if (store === 'walmart') {
      walmartApiService.getStoreIdByZip(zipCode);
    } else {
      apiService.getLocationIdByZip(zipCode);
    }
  }, [zipCode, store]);

  const handleBarCodeScanned = (scanningResult: BarcodeScanningResult) => {
    if (scanned || loading) return;

    let { data } = scanningResult;
    if (!data) return;

    console.log('Raw barcode scanned:', data);

    // Strip whitespace/null bytes and non-digit characters
    const cleaned = data.replace(/[\s\0]/g, '').replace(/\D/g, '');

    let formattedBarcode: string;
    if (store === 'walmart') {
      // Walmart expects the raw UPC (typically 12-digit UPC-A)
      formattedBarcode = cleaned;
    } else {
      // Kroger / Smith's: pass the cleaned barcode as-is.
      // api.ts will automatically retry with the alternate 12/13 digit format if needed.
      formattedBarcode = cleaned;
    }

    console.log('Formatted barcode:', formattedBarcode);

    // Set state synchronously — React re-renders and shows the loading modal
    // BEFORE the API call starts (handled in the useEffect below)
    setScanned(true);
    setLoading(true);
    setScannedBarcode(formattedBarcode);
  };

  // Fires the API lookup only after React has committed the loading state to the UI
  useEffect(() => {
    if (!scannedBarcode) return;

    const doSearch = async () => {
      try {
        console.log('Searching for barcode:', scannedBarcode);

        let result;
        if (store === 'walmart') {
          result = await walmartApiService.searchProductByBarcode(scannedBarcode);
        } else {
          const locationId = await apiService.getLocationIdByZip(zipCode);
          console.log('Got location ID:', locationId);
          result = await apiService.searchProductByBarcode(scannedBarcode, locationId);
        }
        console.log('Search result:', result);
        // Store the resolved barcode format for display in the modal
        // (uses setResolvedBarcode, NOT setScannedBarcode, to avoid re-triggering this effect)
        setResolvedBarcode(result.barcode || scannedBarcode);
        if (result.success && result.product) {
          setScannedProduct(result.product);
          setTimeout(() => setShowItemModal(true), 50);
        } else {
          toast.show('Product not found. Please enter manually.', {
            type: 'warning',
            duration: 3000,
          });
          setShowUnrecognizedModal(true);
        }
      } catch (error: any) {
        console.error('Scan error:', error);
        toast.show('Error searching for product. Please try again.', {
          type: 'danger',
          duration: 3000,
        });
        setShowUnrecognizedModal(true);
      } finally {
        setLoading(false);
      }
    };

    doSearch();
  }, [scannedBarcode]); // scannedBarcode changes only when a new scan occurs

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
          storeId: store,
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
        storeId: store,
      },
    ]);
    // Reset scanned state after a short delay to allow scanning again
    setTimeout(() => {
      setScanned(false);
      setScannedBarcode('');
      setResolvedBarcode('');
    }, 1000);
  };

  // Navigate to MainShoppingScreen with budget and items
  const handleGoToMainShopping = () => {
    const updatedStores = Array.from(new Set([...visitedStores, store])) as typeof visitedStores;
    navigation.navigate('MainShopping', { budget, zipCode, store, stores: updatedStores, items });
  };

  const handleUnrecognizedDismissed = () => {
    setShowUnrecognizedModal(false);
    // Reset scanned state after a short delay to allow scanning again
    setTimeout(() => {
      setScanned(false);
      setScannedBarcode('');
      setResolvedBarcode('');
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
            <View style={[styles.cornerTL, loading && styles.cornerLoading]} />
            <View style={[styles.cornerTR, loading && styles.cornerLoading]} />
            <View style={[styles.cornerBL, loading && styles.cornerLoading]} />
            <View style={[styles.cornerBR, loading && styles.cornerLoading]} />
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
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
        barcode={resolvedBarcode || scannedBarcode}
        onAdd={handleUnrecognizedItemAdded}
        onDismiss={handleUnrecognizedDismissed}
      />

      {/* Loading overlay — rendered as a Modal so it sits above the camera */}
      <Modal visible={loading} transparent animationType="none" statusBarTranslucent>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingCardTitle}>Looking up product…</Text>
            <Text style={styles.loadingCardSubtitle}>Please hold still</Text>
          </View>
        </View>
      </Modal>
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
  // Modal loading overlay — covers the entire screen above the camera
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingCardTitle: {
    color: '#F1F5F9',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  loadingCardSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
  },
  // Corner brackets turn amber while loading
  cornerLoading: {
    borderColor: '#F59E0B',
  },
  itemsCountText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 4,
  },
}); 