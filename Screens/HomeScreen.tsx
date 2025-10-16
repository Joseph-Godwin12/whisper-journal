import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { Audio } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";
import { useJournal } from "../context/JournalContext";
import { Entry } from "../context/JournalContext";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const { addEntry } = useJournal();
  const navigation = useNavigation<any>();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [levels, setLevels] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const durationRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission required", "Microphone permission is needed to record.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setDuration(0);

      intervalRef.current = setInterval(() => {
        setLevels((prev) => [...prev.slice(-30), Math.random()]);
      }, 100);

      durationRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      if (intervalRef.current) clearInterval(intervalRef.current);
      if (durationRef.current) clearInterval(durationRef.current);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();
      const durationMillis = status.durationMillis ?? 0;

      setIsRecording(false);
      setRecording(null);
      setLevels([]);

      const now = new Date();
      const newEntry: Entry = {
        id: Date.now().toString(),
        type: "audio",
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        title: `Recording ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
        audioUri: uri ?? undefined,
        duration: Math.floor(durationMillis / 1000),
      };

      await addEntry(newEntry);
      Alert.alert("Saved!", "Recording saved to your Library.");
    } catch (err) {
      console.error("Error stopping recording:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Whisper Journal 🎙️</Text>

      <View style={styles.waveformContainer}>
        {levels.map((level, i) => (
          <View key={i} style={[styles.bar, { height: level * 60 + 10 }]} />
        ))}
      </View>

      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        style={[styles.recordButton, isRecording && styles.recording]}
      >
        <FontAwesome
          name={isRecording ? "stop" : "microphone"}
          size={30}
          color="#fff"
        />
      </TouchableOpacity>

      <Text style={styles.status}>
        {isRecording
          ? `Recording... ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`
          : "Tap to Record"}
      </Text>

      {/* ✏️ Floating Write Button */}
      <TouchableOpacity
        style={styles.writeButton}
        onPress={() => navigation.navigate("Write")}
      >
        <FontAwesome name="pencil" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  title: { color: "#000", fontSize: 22, marginBottom: 40 },
  waveformContainer: { flexDirection: "row", alignItems: "flex-end", height: 80, marginBottom: 40 },
  bar: { width: 4, backgroundColor: "#00e0ff", marginHorizontal: 2, borderRadius: 2 },
  recordButton: { width: 80, height: 80, backgroundColor: "#2e86de", borderRadius: 50, justifyContent: "center", alignItems: "center" },
  recording: { backgroundColor: "#e74c3c" },
  status: { color: "#444", marginTop: 20, fontSize: 16 },
  writeButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#2e86de",
    borderRadius: 30,
    padding: 15,
    elevation: 5,
  },
});
