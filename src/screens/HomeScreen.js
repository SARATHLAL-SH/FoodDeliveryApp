import React, {useEffect, useState, useCallback} from 'react';
import {View, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useFocusEffect} from '@react-navigation/native';
import HomePage from './HomePage';
import {API} from '../constants';

const HomeScreen = () => {
  const [orderData, setOrderData] = useState();
  const [loading, setLoading] = useState(true);

  const fetchOrderData = async () => {
    try {
      const userId = await AsyncStorage.getItem('boyId');
      if (!userId) {
        console.error('User ID not found in AsyncStorage');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API}/get/confirm/order/${userId}`);
      
      if (response.data?.data?.length < 1) {
        setOrderData([]);
      } else {
        setOrderData(response.data?.data);
        
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setOrderData([]); // Clear orders if status code is 404
      } else {
        console.log('Error fetching data: ', error);
        // Optional: Clear orders in case of other errors
        setOrderData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Call fetchOrderData every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchOrderData();
      const intervalId = setInterval(fetchOrderData, 10000);
      return () => clearInterval(intervalId);
    }, []),
  );

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <HomePage orderData={orderData} />;
};

export default HomeScreen;
