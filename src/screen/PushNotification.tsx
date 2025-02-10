import notifee, {EventType} from '@notifee/react-native';
import React, {useEffect, useState} from 'react';
import {
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {push_notification} from '../query/todo';
import {createTable, fetchData, insertData} from '../service/database';

const PushNotification = () => {
  const [notificationResponse, setNotificationResponse] = useState<any[]>([]);
  console.log('notificationResponse: ', notificationResponse);

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

  const loadNotifiactionResponse = async (): Promise<void> => {
    const notificationResponseFromDb = await fetchData(
      push_notification.fetchResponseNotification,
    );
    setNotificationResponse(notificationResponseFromDb);
  };

  useEffect(() => {
    (async () => {
      await createTable(push_notification.crateTbl);
      await loadNotifiactionResponse();
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(async ({type, detail}) => {
      console.log('Foreground event received:', type, detail);

      if (type === EventType.ACTION_PRESS) {
        const {pressAction} = detail;
        if (pressAction && pressAction.id === 'yes-action') {
          await insertData(push_notification.insertData, [1, new Date()]);
        } else if (pressAction && pressAction.id === 'no-action') {
          await insertData(push_notification.insertData, [0, new Date()]);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View>
          <Button
            title="Display Notification"
            onPress={onDisplayNotification}
          />
        </View>
      </SafeAreaView>
      <FlatList
        data={notificationResponse}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.taskContainer}>
            <View style={styles.taskDetails}>
              <Text
                style={[
                  styles.taskTitle,
                  item.completed ? styles.taskCompleted : null,
                ]}>
                {item.notification_time}
              </Text>
              <Text style={styles.taskDescription}>{item.response_status}</Text>
            </View>
          </View>
        )}
      />
    </>
  );
};

export default PushNotification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  taskDetails: {flex: 1, marginLeft: 8},
  taskTitle: {fontSize: 16, fontWeight: 'bold'},
  taskDescription: {fontSize: 14, color: '#555'},
  taskCompleted: {textDecorationLine: 'line-through', color: 'gray'},
});
