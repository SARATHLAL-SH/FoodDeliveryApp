import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {PERMISSIONS, request, check, RESULTS} from 'react-native-permissions';
import BackgroundService from 'react-native-background-actions';
import axios from 'axios';
import {API} from '../constants';
import {AppState, NativeModules} from 'react-native';
import {
  stopBackgroundLocationUpdates,
  startBackgroundLocationUpdates,
} from '../helper/helper';
import Background from '../helper/Background';
import OpenSettings from 'react-native-open-settings';

const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [location, setLocation] = useState({latitude: null, longitude: null});
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'background') {
        // startBackgroundLocationUpdates();
      } else if (nextAppState === 'active') {
        // stopBackgroundLocationUpdates();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const options = {
    taskName: 'Location Updates',
    taskTitle: 'Location Tracking',
    taskDesc: 'Tracking your location in the background.',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    parameters: {
      delay: 10000, // Update every 10 seconds
    },
  };

  const updateLocationOnServer = async (latitude, longitude) => {
    const userId = await AsyncStorage.getItem('boyId');
    try {
      await axios.put(`${API}/update/delivery/${userId}`, {
        latitude,
        longitude,
      });
      console.log('Location updated:', latitude, longitude);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleLocationUpdate = async () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          console.log('Location fetched in background:', {latitude, longitude});
          // You can call your API here to update the location on your server
          updateLocationOnServer(latitude, longitude); // replace with your server update function
          resolve();
        },
        error => {
          console.error('Error getting location:', error.message);
          reject(error);
        },
        {enableHighAccuracy: true, distanceFilter: 10},
      );
    });
  };

  const requestLocationPermission = async () => {
    try {
      let permissionResult;

      // Check and request location permission
      if (Platform.OS === 'android') {
        permissionResult = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        );
      } else if (Platform.OS === 'ios') {
        permissionResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      }

      if (permissionResult === RESULTS.GRANTED) {
        // Start watching the user's location
        const id = Geolocation.watchPosition(
          position => {
            const {latitude, longitude} = position.coords;
            setLocation({latitude, longitude});
            updateLocationOnServer(latitude, longitude);
          },
          error => {
            console.log('error', error);
            Alert.alert(
              'Permission Denied',
              'Location permission is required to use this feature. Please Turn On Location.',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Open Settings',
                  onPress: () => OpenSettings.openSettings(),
                },
              ],
            );
          },
          {enableHighAccuracy: true, distanceFilter: 10},
        );
        setWatchId(id);
      } else if (permissionResult === RESULTS.DENIED) {
        // If permission is denied, inform the user
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature. Please grant the permission.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => OpenSettings.openSettings()},
          ],
        );
      } else if (permissionResult === RESULTS.BLOCKED) {
        // If permission is permanently blocked, navigate to settings
        Alert.alert(
          'Permission Blocked',
          'Location permission is permanently denied. Please enable it from the settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => OpenSettings.openSettings()},
          ],
        );
      }
    } catch (error) {
      // Handle location-related errors
      if (error.code === 2) {
        // Location services disabled
        Alert.alert(
          'Enable Location Services',
          'Location services are disabled. Would you like to turn them on?',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => OpenSettings.openSettings()},
          ],
        );
      } else {
        console.error('Error requesting location permission:', error);
      }
    }
  };

  const toggleAvailability = async () => {
    const userId = await AsyncStorage.getItem('boyId');
    setIsAvailable(prevStatus => !prevStatus);

    const updatedStatus = !isAvailable ? 'Available' : 'Unavailable';
    try {
      await axios.put(`${API}/update/delivery/boy/status/${userId}`, {
        status: updatedStatus.toLowerCase(),
      });
      Alert.alert('Status Updated', `You are now ${updatedStatus}`);
      if (!isAvailable) {
        await requestLocationPermission();
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const fetchDeliveryBoyStatus = async () => {
    try {
      const userId = await AsyncStorage.getItem('boyId');
      const response = await axios.get(`${API}/delivery/boy/status/${userId}`);
      if (response.data.success) {
        setIsAvailable(response.data.status === 'available');
      }
    } catch (error) {
      Alert.alert('Error:', error?.response?.data?.message);
    }
  };
  useEffect(() => {
    const loadUserDataAndStatus = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
      await fetchDeliveryBoyStatus();
      await requestLocationPermission();
    };

    loadUserDataAndStatus();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  if (!userData) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  return (
    <View style={styles.navbar}>
      <View style={styles.profileSection}>
        <Image
          source={{uri: userData.uploadSelfie}}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{userData.name}</Text>
      </View>

      <View style={styles.toggleSection}>
        <Text
          style={[styles.statusText, {color: isAvailable ? 'green' : 'red'}]}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </Text>
        <Switch
          value={isAvailable}
          onValueChange={toggleAvailability}
          thumbColor={isAvailable ? '#4caf50' : '#f44336'}
          trackColor={{false: '#767577', true: '#81c784'}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#fcece3',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: '#ddd',
    borderWidth: 2,
    marginRight: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888',
    marginTop: 50,
  },
});

export default Navbar;
