import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '../../types';

interface ItemConfirmationModalProps {
  visible: boolean;
  product: Product | null;
  onConfirm: (quantity: number) => void;
  onDismiss: () => void;
}

export default function ItemConfirmationModal({
  visible,
  product,
  onConfirm,
  onDismiss,
}: ItemConfirmationModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (visible) {
      setQuantity(1);
    }
  }, [visible]);

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

  const handleConfirm = () => {
    onConfirm(quantity);
  };

  if (!product) return null;

  const totalPrice = product.price * quantity;
  const productImage = product.image;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <LinearGradient
            colors={['#4A90E2', '#357ABD']}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Item Found!</Text>
              <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <View style={styles.productImage}>
                <Ionicons name="basket" size={48} color="#4A90E2" />     
              </View>
              
              <Text style={styles.productName}>{product.description}</Text>
              
              {product.brand && (
                <Text style={styles.productBrand}>{product.brand}</Text>
              )}
              
              <Text style={styles.productPrice}>
                ${product.price.toFixed(2)}
              </Text>
            </View>

            {/* Quantity Selector */}
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={handleQuantityDecrement}
                >
                  <Ionicons name="remove" size={20} color="#4A90E2" />
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
                  <Ionicons name="add" size={20} color="#4A90E2" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Total Price */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onDismiss}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.confirmButtonGradient}
                >
                  <Ionicons name="add-circle" size={20} color="white" />
                  <Text style={styles.confirmButtonText}>Add to Cart</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  productInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    width: 60,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
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
  confirmButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 