import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import openMap from 'react-native-open-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const HomePage = ({orderData}) => {
  const [confirmOrderId, setConfirmOrderId] = useState();
  const navigation = useNavigation();

  // Handler to open maps for navigation
  const navigateToLocation = async (latitude, longitude, _id) => {
    if (latitude && longitude) {
      navigation.navigate('Map', {
        latitude: latitude,
        longitude: longitude,
      });
      setConfirmOrderId(_id);
      await AsyncStorage.setItem('orderId', _id);
    }
  };

  // Navigate to ConfirmOrder page when confirmOrderId is set
  // useEffect(() => {
  //   if (confirmOrderId) {
  //     navigation.navigate('Confirm Order', {orderId: confirmOrderId});
  //   }
  // }, [confirmOrderId, navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.header}>Order Details</Text>
      </View>
      {orderData?.length > 0 ? (
        orderData.map(({_id, orderId}) => (
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
