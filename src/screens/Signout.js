// src/screens/SignOut.js
import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Button, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLogin} from '../context/LoginContext'; // Import the login context
import axios from 'axios';
import {API} from '../constants';

const SignOut = ({navigation}) => {
  const {setIsLoggedIn} = useLogin();

  const handleSignOut = async () => {
    const userId = await AsyncStorage.getItem('boyId');
    try {
      const response = await axios.put(
        `${API}/update/delivery/boy/status/${userId}`,
        {
          status: 'unavailable',
        },
      );
     
      if (response.data) {
        
        await AsyncStorage.removeItem('userData');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Confirm Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Sign out cancelled'),
          style: 'cancel',
        },
        {text: 'OK', onPress: handleSignOut},
      ],
      {cancelable: false},
    );
  };
  useEffect(() => {
    confirmSignOut();
  }, []);

  return (
    <View style={styles.container}>
      <Text onPress={confirmSignOut}>Sign out</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignOut;
