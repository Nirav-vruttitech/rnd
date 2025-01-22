/* eslint-disable react-native/no-inline-styles */
import React from 'react';

import {Text, View} from 'react-native';
import TaskList from './screen/TaskList';
import PushNotification from './screen/PushNotification';

export default function App() {
  return (
    <View style={{flex: 1}}>
      <View
        style={{
          padding: 16,
          backgroundColor: 'black',
          alignItems: 'center',
        }}>
        <Text style={{color: 'white', fontSize: 20, fontWeight: 600}}>
          Todo App
        </Text>
      </View>
      <View style={{flex: 1, padding: 16}}>
        <TaskList />
        {/* <PushNotification /> */}
      </View>
    </View>
  );
}
