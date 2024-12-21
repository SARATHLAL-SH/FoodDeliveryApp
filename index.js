/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import BackgroundFetch from 'react-native-background-fetch';
import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid, Platform, Linking} from 'react-native';

AppRegistry.registerComponent(appName, () => App);

const requestBackgroundLocationPermission = async () => {
  try {
    // Step 1: Request FOREGROUND permission
    const fineLocationGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Access Required',
        message:
          'This app requires access to your location for background updates.',
        buttonPositive: 'OK',
      },
    );

    if (fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('[Permissions] Foreground location permission granted.');

      // Step 2: Request BACKGROUND permission on Android 10+ (API 29+)
      if (Platform.Version >= 29) {
        const backgroundLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location Access',
            message:
              'This app needs background location permission to work correctly.',
            buttonPositive: 'OK',
          },
        );

        if (backgroundLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('[Permissions] Background location permission granted.');
        } else {
          console.log(
            '[Permissions] Background location permission denied. Please enable it in settings.',
          );
          openAppSettings(); 
        }
      }
    } else {
      console.error('[Permissions] Foreground location permission denied.');
    }
  } catch (err) {
    console.error('[Permissions] Error requesting location permission:', err);
  }
};

const fetchLocation = () => {
  Geolocation.getCurrentPosition(
    position => {
      console.log('[BackgroundFetch] Location fetched:', position.coords);
      // Send location to server or save it locally
    },
    error => {
      console.error(
        '[BackgroundFetch] Error fetching location:',
        error.message,
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    },
  );
};

// Background task for location fetching
const backgroundLocationTask = async taskId => {
  console.log('BackgroundFetch Task started:', taskId);

  // Fetch location
  fetchLocation();

  // Mark the task as completed
  BackgroundFetch.finish(taskId);
};

// Start background fetch configuration
export const startBackgroundLocationUpdates = async () => {
  try {
    // Request permissions for background location (Android only)
    if (Platform.OS === 'android') {
      await requestBackgroundLocationPermission();
    }

    // Configure BackgroundFetch
    await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // Task execution interval in minutes (minimum for production)
        stopOnTerminate: false, // Continue running after app is terminated
        startOnBoot: true, // Start after device reboot
        enableHeadless: true, // Allow execution in headless mode
        requiresCharging: false, // Task can run without charging
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // No network constraints
      },
      backgroundLocationTask, // Task to execute
      error => {
        console.error('[BackgroundFetch] Failed to configure:', error);
      },
    );

    console.log('[BackgroundFetch] Background location updates configured.');
    BackgroundFetch.start(); // Start BackgroundFetch service
    console.log('[BackgroundFetch] Background location updates started.');
  } catch (error) {
    console.error(
      '[BackgroundFetch] Error starting background location updates:',
      error,
    );
  }
};

// Permission request for Android background location
const openAppSettings = () => {
  Linking.openSettings().catch(() => {
    console.warn('Unable to open app settings');
  });
};
// Register the Headless Task
AppRegistry.registerHeadlessTask(
  'BackgroundFetch',
  () => backgroundLocationTask,
);
