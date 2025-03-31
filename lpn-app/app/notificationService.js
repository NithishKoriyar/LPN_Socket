import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Check if the app is running on the web
const isWeb = Platform.OS === 'web';

// Configure notification handler (only for mobile)
if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// Function to request notification permissions for mobile
async function requestMobileNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for notifications!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo Push Token:', token);
  return token;
}

// Function to request notification permissions for web
async function requestWebNotificationPermissions() {
  if (!('Notification' in window)) {
    alert('This browser does not support notifications.');
    return;
  }

  if (Notification.permission === 'granted') {
    console.log('Notification permission already granted');
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Notification permission denied.');
    }
  }
}

// Function to request notification permissions
export async function requestNotificationPermissions() {
  if (isWeb) {
    await requestWebNotificationPermissions();
  } else {
    await requestMobileNotificationPermissions();
  }
}

function handleWebNotification(title, body) {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }
  
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, {
            body: body,
          });
        }
      });
    }
  }
  
  async function handleMobileNotification(title, body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: { data: 'goes here' },
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Failed to schedule mobile notification:', error);
    }
  }
  
  

// Function to schedule a local notification
export async function triggerLocalNotification(title, body) {
    if (isWeb) {
      handleWebNotification(title, body);
    } else {
      await handleMobileNotification(title, body);
    }
  }
  