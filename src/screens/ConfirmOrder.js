// ConfirmOrder.js
import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {API} from '../constants';

const ConfirmOrder = ({navigation}) => {
  const confirmImg = require('../assets/images/confirm.jpg');
  // const navigate = useNavigate();
  const handleConfirmOrder = async () => {
    try {
      const orderId = await AsyncStorage.getItem('orderId');

      if (!orderId) {
        Alert.alert('Error', 'Order ID not found.');
        return;
      }

      const apiUrl = `${API}/update/confirm/order/status/${orderId}`;

      const response = await axios.put(apiUrl);

      if (response.data) {
        Alert.alert('Success', 'Order confirmed successfully.');
        navigation.goBack();
        // navigate("/Home")
      } else {
        Alert.alert('Error', 'Failed to confirm the order.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while confirming the order.');
      console.log(error.response.data);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirm Order</Text>
      <Image source={confirmImg} style={styles.confirmImage} />

      <Button title="Confirm Order" onPress={handleConfirmOrder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  confirmImage: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height * 0.7,
    marginBottom: 20,
  },
});

export default ConfirmOrder;
