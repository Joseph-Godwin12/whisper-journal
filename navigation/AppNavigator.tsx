import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../Screens/HomeScreen';
import LibraryScreen from '../Screens/LibraryScreen';
import NoteDetails from '../Screens/NoteDetailsScreen';
import WriteScreen from '../Screens/WriteScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 60,
          left: 20,
          right: 20,
          borderRadius: 25,
          bottom: 20,
          padding: 12,
          paddingBottom: 5,
          paddingTop: 5,
          backgroundColor: '#313d49ff',
          borderWidth: 1,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          position: 'absolute',
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: any;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else {
            iconName = focused ? 'library' : 'library-outline';
          }
          return (
            <Ionicons
              name={iconName}
              size={23}
              color={color}
              style={{ transform: [{ scale: focused ? 1.1 : 1 }] }}
            />
          );
        },
        tabBarActiveTintColor: '#e3eefaff',
        tabBarInactiveTintColor: '#8c8c8c',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          fontFamily: 'CustomFont', // <-- your custom font here
          marginTop: 0,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTitleStyle: { fontFamily: 'CustomFont' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="NoteDetails" component={NoteDetails} />
      <Stack.Screen name="Write" component={WriteScreen} />
    </Stack.Navigator>
  );
}
