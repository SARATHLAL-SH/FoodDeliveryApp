/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';

AppRegistry.registerComponent(appName, () => App);


messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  
  // Display notification (in case the background handler doesn't automatically show notifications)
  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'Background Notification',
    body: remoteMessage.notification?.body || 'You have a new message.',
    android: {
      channelId: 'default',
      smallIcon: 'yacht', // Ensure this matches your app's launcher icon
    },
  });
});

// Handle background notification events (like tap actions)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('Background event received:', type, detail);

  if (type === EventType.PRESS) {
    console.log('Notification pressed:', detail.notification);
  } else if (type === EventType.ACTION_PRESS) {
    console.log('Notification action pressed:', detail.pressAction);
  }
});
