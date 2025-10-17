import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { JournalProvider } from './context/JournalContext';
import SplashScreen from './Screens/SplashScreen';
import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Load fonts using Expo hook
  const [fontsLoaded] = useFonts({
    CustomFont: require('./assets/fonts/Quicksand-Regular.ttf'), // Replace with your font file
  });

  

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <JournalProvider>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      )}
    </JournalProvider>
  );
}
