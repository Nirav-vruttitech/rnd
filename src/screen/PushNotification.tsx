import notifee, {EventType} from '@notifee/react-native';
import React, {useEffect} from 'react';
import {Button, SafeAreaView, StyleSheet, View} from 'react-native';

const PushNotification = () => {
  // Request permission for notifications (needed for iOS)
  const requestPermission = async () => {
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus >= 1) {
      console.log('Permission granted');
    } else {
      console.log('Permission denied');
    }
  };

  // Function to display notification
  const onDisplayNotification = async () => {
    // Request permissions (iOS only)
    await requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: 'Notification Title',
      body: 'Main body content of the notification',
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: 'Yes',
            pressAction: {
              id: 'yes-action',
            },
          },
          {
            title: 'No',
            pressAction: {
              id: 'no-action',
            },
          },
        ],
      },
    });
  };

  // Set up background notification listener (optional)
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(async ({type, detail}) => {
      console.log('Foreground event received:', type, detail);

      if (type === EventType.ACTION_PRESS) {
        const {pressAction} = detail;
        if (pressAction && pressAction.id === 'yes-action') {
          console.log('User pressed Yes');
        } else if (pressAction && pressAction.id === 'no-action') {
          console.log('User pressed No');
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Button title="Display Notification" onPress={onDisplayNotification} />
      </View>
    </SafeAreaView>
  );
};

export default PushNotification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
