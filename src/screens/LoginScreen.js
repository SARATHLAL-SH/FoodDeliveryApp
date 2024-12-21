import React, {useState} from 'react';
import {View, TextInput, Button, Text, StyleSheet, Alert} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLogin} from '../context/LoginContext';
import { API } from '../constants';

const LoginScreen = ({navigation}) => {
  const [mobileNo, setMobileNo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const {setIsLoggedIn} = useLogin(); // Get the setIsLoggedIn function from context

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API}/login/delivery/boy`, {
        mobileNo: mobileNo,
      });

      if (response.data.success) {
        await AsyncStorage.setItem(
          'userData',
          JSON.stringify(response.data.data),
          console.log(
            'User data stored in AsyncStorage:',
            response.data.data._id,
          ),
        );
        setIsLoggedIn(true); // Update login status
        await AsyncStorage.setItem('boyId', response.data.data._id);
        
      } else {
        setErrorMessage('Login failed');
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message);
      console.log('Error logging in:', error);
      Alert.alert('Error', error?.response?.data?.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter mobile number"
        value={mobileNo}
        onChangeText={setMobileNo}
        keyboardType="numeric"
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    color: 'orange',
    fontWeight:'900'
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
});

export default LoginScreen;
