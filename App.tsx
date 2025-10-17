import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, AppState, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { JournalProvider } from './context/JournalContext';
import SplashScreen from './Screens/SplashScreen';
import { useFonts } from 'expo-font';
import * as LocalAuthentication from 'expo-local-authentication';
import AuthScreen from './Screens/AuthScreen';
import ToastMessage from './components/ToastMessage';
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  // Load custom font
  const [fontsLoaded] = useFonts({
    CustomFont: require('./assets/fonts/Quicksand-Regular.ttf'),
  });

  // Global override for Text
  if (fontsLoaded) {
    (Text as any).defaultProps = (Text as any).defaultProps || {};
    (Text as any).defaultProps.style = { fontFamily: 'CustomFont' };
  }

  // Lock app when it goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/active/) && nextAppState.match(/inactive|background/)) {
        setIsAuthenticated(false); // lock app
      }
      setAppState(nextAppState);
    });
    return () => subscription.remove();
  }, [appState]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <JournalProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <ToastMessage />
    </JournalProvider>
  );
}
