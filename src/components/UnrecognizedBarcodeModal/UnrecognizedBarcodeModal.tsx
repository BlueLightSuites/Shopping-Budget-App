import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface UnrecognizedBarcodeModalProps {
  visible: boolean;
  barcode: string;
  onAdd: (itemName: string, price: number, quantity: number) => void;
  onDismiss: () => void;
}

export default function UnrecognizedBarcodeModal({
  visible,
  barcode,
  onAdd,
  onDismiss,
}: UnrecognizedBarcodeModalProps) {
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handlePriceChange = (text: string) => {
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
    
    setPrice(cleaned);
  };

  const handleQuantityChange = (text: string) => {
    const newQuantity = parseInt(text) || 1;
    if (newQuantity > 0 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleQuantityIncrement = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  const handleQuantityDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAdd = () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter an item name.');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Error', 'Please enter a valid price.');
      return;
    }

    onAdd(itemName.trim(), priceValue, quantity);
    
    // Reset form
    setItemName('');
    setPrice('');
    setQuantity(1);
  };

  const handleDismiss = () => {
    // Reset form
    setItemName('');
    setPrice('');
    setQuantity(1);
    onDismiss();
  };

  const totalPrice = (parseFloat(price) || 0) * quantity;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <LinearGradient
              colors={['#0F172A', '#1E3A5F']}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <Ionicons name="warning" size={24} color="white" />
                <Text style={styles.headerTitle}>Barcode Not Recognized</Text>
                <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Barcode Info */}
              <View style={styles.barcodeInfo}>
                <Text style={styles.barcodeLabel}>Barcode:</Text>
                <Text style={styles.barcodeText}>{barcode}</Text>
              </View>

              {/* Input Fields */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Item Name:</Text>
                <TextInput
                  style={styles.textInput}
                  value={itemName}
                  onChangeText={setItemName}
                  placeholder="Enter item name"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                />

                <Text style={styles.inputLabel}>Price:</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={price}
                    onChangeText={handlePriceChange}
                    placeholder="0.00"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    keyboardType="decimal-pad"
                  />
                </View>

                <Text style={styles.inputLabel}>Quantity:</Text>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={handleQuantityDecrement}
                  >
                    <Ionicons name="remove" size={20} color="white" />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.quantityInput}
                    value={quantity.toString()}
                    onChangeText={handleQuantityChange}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={handleQuantityIncrement}
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Total Price */}
              {price && (
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleDismiss}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAdd}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.addButtonGradient}
                  >
                    <Ionicons name="add-circle" size={20} color="white" />
                    <Text style={styles.addButtonText}>Add to Cart</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxWidth: 350,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalGradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  barcodeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  barcodeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  barcodeText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 16,
    color: 'white',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    width: 50,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: 'white',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 