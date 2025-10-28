import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  AppState,
  AppStateStatus,
  Alert,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import CustomText from "../components/CustomText";

type Props = {
  onAuthenticated: () => void;
};

export default function AuthScreen({ onAuthenticated }: Props) {
  const [passcode, setPasscode] = useState("");
  const [storedPasscode, setStoredPasscode] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const appState = useRef(AppState.currentState);
  const lastBackgroundTime = useRef<number | null>(null); // track background time

  useEffect(() => {
    initAuth();

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, []);

  interface AppStateChangeHandler {
    (nextAppState: AppStateStatus): Promise<void>;
  }

  const handleAppStateChange: AppStateChangeHandler = async (nextAppState) => {
    if (nextAppState === "background") {
      lastBackgroundTime.current = Date.now();
    }

    if (
      appState.current.match(/background/) &&
      nextAppState === "active" &&
      !isAuthenticating
    ) {
      const timeInBackground = Date.now() - (lastBackgroundTime.current || 0);

      // ✅ Only re-authenticate if app was backgrounded for >5 seconds
      if (timeInBackground > 5000) {
        console.log("App resumed after long background — checking biometrics...");
        setTimeout(() => {
          initAuth();
        }, 800);
      } else {
        console.log(
          "App briefly backgrounded (e.g., mic permissions) — skip biometrics."
        );
      }
    }

    appState.current = nextAppState;
  };

  const initAuth = async () => {
    if (isAuthenticating) return;
    if (!AppState.currentState.match(/active/)) return; // avoid auth while switching focus

    setIsAuthenticating(true);
    setLoading(true);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const savedPasscode = await SecureStore.getItemAsync("appPasscode");
      const useBiometrics = await SecureStore.getItemAsync("useBiometrics");

      setStoredPasscode(savedPasscode);
      setBiometricAvailable(hasHardware && isEnrolled);

      if (useBiometrics === "true" && hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Unlock Whisper Journal",
          fallbackLabel: "Use Passcode",
          cancelLabel: "Cancel",
        });

        if (result.success) {
          Toast.show({
            type: "success",
            text1: "Welcome back!",
            text2: "Your journal is unlocked.",
          });
          onAuthenticated();
          setLoading(false);
          setIsAuthenticating(false);
          return;
        } else {
          console.log("Biometric auth cancelled or failed.");
        }
      }
    } catch (err) {
      console.log("Error initializing auth:", err);
    }

    setLoading(false);
    setIsAuthenticating(false);
  };

  const handlePasscodeAuth = async () => {
    if (!storedPasscode) {
      await SecureStore.setItemAsync("appPasscode", passcode);
      Toast.show({
        type: "success",
        text1: "Passcode Set",
        text2: "You can now use this passcode to unlock your journal.",
      });
      onAuthenticated();
    } else if (passcode === storedPasscode) {
      Toast.show({
        type: "success",
        text1: "Welcome Back!",
        text2: "Your journal is unlocked.",
      });
      onAuthenticated();
    } else {
      Toast.show({
        type: "error",
        text1: "Incorrect Passcode",
        text2: "Please try again.",
      });
    }
    setPasscode("");
  };

  const enableBiometricAutoLogin = async () => {
    try {
      await SecureStore.setItemAsync("useBiometrics", "true");
      Toast.show({
        type: "success",
        text1: "Biometrics Enabled",
        text2: "Next time, you’ll unlock automatically using biometrics.",
      });
      await initAuth();
    } catch (error) {
      Alert.alert("Error", "Failed to enable biometrics. Try again.");
    }
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
        {storedPasscode ? "Enter your passcode" : "Set your 4 digit passcode"}
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
        <Button
          title={storedPasscode ? "Unlock" : "Set Passcode"}
          onPress={handlePasscodeAuth}
          color="#313d49ff"
        />
      </View>

      {biometricAvailable && storedPasscode && (
        <View style={styles.button2}>
          <Button
            title="Use Biometrics"
            onPress={enableBiometricAutoLogin}
            color="#313d49ff"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#b3b0b0ff",
  },
  passcode: {
    fontSize: 18,
    fontFamily: "CustomFont",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "#000",
    padding: 10,
    fontFamily: "CustomFont",
    width: "80%",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    marginTop: 10,
    width: "60%",
    backgroundColor: "#313d49ff",
  },
  button2: {
    marginTop: 20,
    backgroundColor: "#313d49ff",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
