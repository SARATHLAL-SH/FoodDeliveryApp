import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

const HomePage = ({orderData}) => {
  const [confirmOrderId, setConfirmOrderId] = useState(null);
  const navigation = useNavigation();
  const previousOrderLength = useRef(orderData?.length || 0);

  
  // Request Notification Permissions
  const requestPermissions = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted:', authStatus);
        const fcmToken = await messaging().getToken();
        console.log('FCM Token:', fcmToken);
      } else {
        console.warn('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  // Create Notification Channel
  useEffect(() => {
    const createNotificationChannel = async () => {
      try {
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
        });
        console.log('Notification channel created successfully');
      } catch (error) {
        console.error('Error creating notification channel:', error);
      }
    };

    createNotificationChannel();
  }, []);

  // Handle Foreground Notifications
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);

      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || 'You have a new message.',
        android: {
          channelId: 'default',
          smallIcon: 'yacht', // Ensure this matches your app's launcher icon
        },
      });
    });

    return unsubscribe; // Cleanup the listener
  }, []);

  // Handle Background Notifications
  useEffect(() => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message received:', remoteMessage);

      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || 'You have a new message.',
        android: {
          channelId: 'default',
          smallIcon: 'yacht', // Ensure this matches your app's launcher icon
        },
      });
    });
  }, []);

  // Trigger Notification for New Orders
  useEffect(() => {
    if (orderData?.length > previousOrderLength.current) {
      const newOrders = orderData.length - previousOrderLength.current;
      console.log("previousOrderLength start",newOrders)
      // Display a notification for new orders
      notifee.displayNotification({
        title: 'New Orders Alert!',
        body: `You have ${newOrders} new order(s).`,
        android: {
          channelId: 'default',
          smallIcon: 'yacht',
        },
      });

      // Update previous order length after notifying
      previousOrderLength.current = orderData.length;
      console.log("previousOrderLength",previousOrderLength)
    }
  }, [orderData]);

  // Navigate to Delivery Location
  const navigateToLocation = async (latitude, longitude, _id) => {
    if (latitude && longitude) {
      navigation.navigate('Map', {latitude, longitude});
      setConfirmOrderId(_id);
      await AsyncStorage.setItem('orderId', _id);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.header}>Order Details</Text>
      </View>
      {orderData?.length > 0 ? (
        orderData.reverse().map(({_id, orderId}) => (
          <View style={styles.card} key={_id}>
            <Text style={styles.label}>Order ID: {orderId?.orderId}</Text>
            <Text style={styles.label}>
              Customer Name: {orderId?.userAddress?.name || 'N/A'}
            </Text>
            <Text style={[styles.label, {fontWeight: '700'}]}>
              Mobile: {orderId?.userAddress?.mobile || 'N/A'}
            </Text>
            <Text style={styles.label}>
              Address: {orderId?.userAddress?.address || 'N/A'}
            </Text>
            <Text style={styles.label}>
              Total Price: ₹{orderId?.totalPrice || 'N/A'}
            </Text>

            <View>
              <Text style={styles.subHeader}>Items:</Text>
              {orderId?.addToCart?.cartIds?.length > 0 ? (
                orderId.addToCart.cartIds.map(item => (
                  <View key={item._id} style={styles.itemCard}>
                    <Image
                      source={{uri: item.image}}
                      style={styles.itemImage}
                    />
                    <View>
                      <Text style={styles.itemName}>{item.itemName}</Text>
                      <Text style={styles.itemDetails}>
                        {item.itemCategory}
                      </Text>
                      <Text style={styles.itemDetails}>
                        Quantity: {item.count} {item.unit}
                      </Text>
                      <Text style={styles.itemDetails}>
                        Price: ₹{item.itemRate}
                      </Text>
                      <Text style={styles.itemDetails}>
                        CGST: {item.cgst} %, SGST: {item.sgst} %
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{color: 'red', fontWeight: 700}}>
                  No items in the cart
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigateToLocation(
                  orderId?.userAddress?.latitude,
                  orderId?.userAddress?.longitude,
                  _id,
                )
              }>
              <Text style={styles.buttonText}>
                Navigate to Delivery Location
              </Text>
            </TouchableOpacity>
            
          </View>
        ))
      ) : (
        <Text style={styles.noOrdersText}>No Orders</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  notificationButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#444',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#f7e1d5',
    borderRadius: 10,
    padding: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noOrdersText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomePage;
