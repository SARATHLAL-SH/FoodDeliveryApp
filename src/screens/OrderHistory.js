import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {API} from '../constants';

// const API_URL = '${API}/get/all/delivered/order/by/';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const boyId = await AsyncStorage.getItem('boyId');
        if (!boyId) {
          Alert.alert('Error', 'Delivery boy ID not found in storage.');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${API}/get/all/delivered/order/by/${boyId}`,
        );
        if (response.data.success) {
          setOrders(response.data?.data);
        } else {
          Alert.alert('Error', 'Failed to fetch order history.');
        }
      } catch (error) {
        Alert.alert('Orders', error.response?.data?.message);
        console.log("order history erro",error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDateTime = dateString => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {orders.map(order => (
        <View key={order._id} style={styles.orderCard}>
          <Text style={styles.orderId}>Order ID: {order.orderId?.orderId}</Text>
          <Text style={styles.date}>
            Date: {formatDateTime(order.orderId?.createdAt)}
          </Text>
          <Text style={styles.status}>Status: {order.status}</Text>
          <Text style={styles.totalPrice}>
            Total Price: ₹{order.orderId?.totalPrice}
          </Text>

          <View style={styles.deliveryBoyContainer}>
            <Image
              source={{uri: order.develeryBoyId?.uploadSelfie}}
              style={styles.deliveryBoyImage}
            />
            <View style={styles.deliveryBoyInfo}>
              <Text style={styles.deliveryBoyName}>
                Delivery Boy: {order.develeryBoyId?.name}
              </Text>
              <Text>Contact: {order?.develeryBoyId?.mobileNo}</Text>
            </View>
          </View>

          <View style={styles.itemContainer}>
            {order?.orderId?.addToCart?.cartIds.map(item => (
              <View key={item._id} style={styles.item}>
                <Image source={{uri: item.image}} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.itemName}</Text>
                  <Text>Category: {item.itemCategory}</Text>
                  <Text>Quantity: {item.count}</Text>
                  <Text>Rate: ₹{item?.itemRate}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 10,
  },
  deliveryBoyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  deliveryBoyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  deliveryBoyInfo: {
    flex: 1,
  },
  deliveryBoyName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 10,
    paddingTop: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default OrderHistory;
