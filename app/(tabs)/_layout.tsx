import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide tab bar completely
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pomodoro',
        }}
      />
    </Tabs>
  );
}
