import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  AppState,
  AppStateStatus,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message'; // ✅ Import toast

export default function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [passcode, setPasscode] = useState('');
  const [storedPasscode, setStoredPasscode] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    initAuth();

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App resumed — rechecking biometrics...');
      await initAuth();
    }
    appState.current = nextAppState;
  };

  const initAuth = async () => {
    setLoading(true);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const savedPasscode = await SecureStore.getItemAsync('appPasscode');
      const useBiometrics = await SecureStore.getItemAsync('useBiometrics');

      setStoredPasscode(savedPasscode);
      setBiometricAvailable(hasHardware && isEnrolled);

      // Automatically trigger biometrics if enabled
      if (useBiometrics === 'true' && hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock Whisper Journal',
          fallbackLabel: 'Use Passcode',
        });

        if (result.success) {
          Toast.show({
            type: 'success',
            text1: 'Welcome back!',
            text2: 'Your journal is unlocked.',
          });
          onAuthenticated();
          setLoading(false);
          return;
        } else {
          console.log('Biometric auth cancelled or failed.');
        }
      }
    } catch (err) {
      console.log('Error initializing auth:', err);
    }

    setLoading(false);
  };

  const handlePasscodeAuth = async () => {
    if (!storedPasscode) {
      await SecureStore.setItemAsync('appPasscode', passcode);
      Toast.show({
        type: 'success',
        text1: 'Passcode Set',
        text2: 'You can now use this passcode to unlock your journal.',
      });
      onAuthenticated();
    } else if (passcode === storedPasscode) {
      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'Your journal is unlocked.',
      });
      onAuthenticated();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Incorrect Passcode',
        text2: 'Please try again.',
      });
    }
    setPasscode('');
  };

  const enableBiometricAutoLogin = async () => {
    await SecureStore.setItemAsync('useBiometrics', 'true');
    Toast.show({
      type: 'success',
      text1: 'Biometrics Enabled',
      text2: 'Next time, you’ll unlock automatically using biometrics.',
    });
    await initAuth();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.passcode}>
        {storedPasscode ? 'Enter your passcode' : 'Set your 4 digit passcode'}
      </Text>

      <TextInput
        value={passcode}
        onChangeText={setPasscode}
        secureTextEntry
        keyboardType="number-pad"
        placeholder="Enter passcode"
        style={styles.input}
      />

      <View style={styles.button}>
        <Button title={storedPasscode ? 'Unlock' : 'Set Passcode'} onPress={handlePasscodeAuth} />
      </View>

      {biometricAvailable && storedPasscode && (
        <View style={{ marginTop: 20 }}>
          <Button title="Use Biometrics" onPress={enableBiometricAutoLogin} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  passcode: {
    fontSize: 18,
    fontFamily: 'CustomFont',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'CustomFont',
    width: '80%',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
    width: '60%',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
