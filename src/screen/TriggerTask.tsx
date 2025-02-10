import notifee, {
  EventType,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {push_notification} from '../query/todo';
import {
  createTable,
  deleteTask,
  fetchData,
  insertData,
} from '../service/database';

const TriggerTask = () => {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [notificationResponse, setNotificationResponse] = useState<any[]>([]);

  console.log('notificationResponse: ', notificationResponse);

  const requestPermission = async () => {
    const settings = await notifee.requestPermission();
    if (Platform.OS === 'android') {
      if (settings.authorizationStatus !== 1) {
        // 1 represents AUTHORIZED
        console.log('User denied notifications permissions!');
      } else {
        console.log('Notification permissions granted!');
      }
    }
  };

  async function onCreateTriggerNotification() {
    await requestPermission();

    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);

    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(0);

    // add alert if user wrong time input and 24 hour format
    if (isNaN(date.getTime()) || hour > 23 || minute > 59) {
      Alert.alert('Please enter valid time');
      return;
    }

    Alert.alert('Notification scheduled for today at ' + hour + ':' + minute);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      alarmManager: true,
    };

    const channelId = await notifee.createChannel({
      id: '1',
      name: 'Default Channel',
    });

    await notifee.createTriggerNotification(
      {
        title: 'Meeting Reminder',
        body: `Scheduled for today at ${hour}:${minute}`,
        android: {
          channelId: channelId,
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
      },
      trigger,
    );

    await loadNotifiactionResponse();
  }

  const loadNotifiactionResponse = async (): Promise<void> => {
    const notificationResponseFromDb = await fetchData(
      push_notification.fetchResponseNotification,
    );
    setNotificationResponse(notificationResponseFromDb);
  };

  const handleTaskDelete = async (id: number): Promise<void> => {
    console.log('id: ', id);
    await deleteTask(id, 'notification');
    loadNotifiactionResponse();
  };

  function convertToIOSTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {hour12: false}); // 24-hour format
  }

  useEffect(() => {
    (async () => {
      await createTable(push_notification.crateTbl);
      await loadNotifiactionResponse();
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(async ({type, detail}) => {
      if (type === EventType.ACTION_PRESS) {
        const {pressAction} = detail;
        if (pressAction && pressAction.id === 'yes-action') {
          await insertData(push_notification.insertData, [1, new Date()]);
          await loadNotifiactionResponse();
        } else if (pressAction && pressAction.id === 'no-action') {
          await insertData(push_notification.insertData, [0, new Date()]);
          await loadNotifiactionResponse();
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Hour (0-23)"
        keyboardType="numeric"
        value={hours}
        onChangeText={setHours}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Minute (0-59)"
        keyboardType="numeric"
        value={minutes}
        onChangeText={setMinutes}
      />
      <Button
        title="Trigger Notification"
        onPress={onCreateTriggerNotification}
      />

      <FlatList
        data={notificationResponse}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.taskContainer}>
            <View style={styles.taskDetails}>
              <Text style={styles.taskDescription}>
                {item?.response_status === 1 ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.taskDescription}>
                {convertToIOSTime(item.notification_time)}
              </Text>
            </View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity onPress={() => handleTaskDelete(item.id)}>
                <Text style={styles.buttonText}>clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default TriggerTask;

// create a style
const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, gap: 20},
  input: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    color: 'black',
    padding: 10,
  },
  button: {
    backgroundColor: 'black',
    padding: 5,
    borderRadius: 8,
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    backgroundColor: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 5,
    borderRadius: 4,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  taskDetails: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  taskTitle: {fontSize: 16, fontWeight: 'bold'},
  taskDescription: {fontSize: 20, color: 'black'},
  taskCompleted: {textDecorationLine: 'line-through', color: 'gray'},
  buttonsContainer: {flexDirection: 'row', marginLeft: 10, gap: 10},
});
