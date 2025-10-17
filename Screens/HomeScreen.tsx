import React, { useState, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";
import { useJournal } from "../context/JournalContext";
import { Entry } from "../context/JournalContext";
import { useNavigation } from "@react-navigation/native";
import CustomText from "../components/CustomText";

export default function HomeScreen() {
  const { addEntry } = useJournal();
  const navigation = useNavigation<any>();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [levels, setLevels] = useState<number[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
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
      setAudioUri(uri ?? null);

      // 🎤 Open modal to ask for title
      setShowTitleModal(true);
    } catch (err) {
      console.error("Error stopping recording:", err);
    }
  };

  const saveAudioEntry = async () => {
    if (!audioUri) return;
    const now = new Date();

    const newEntry: Entry = {
      id: Date.now().toString(),
      type: "audio",
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      title: title.trim() || `Recording ${now.toLocaleTimeString()}`,
      audioUri,
      duration,
    };

    await addEntry(newEntry);
    setShowTitleModal(false);
    setTitle("");
    setAudioUri(null);
    Alert.alert("Saved!", "Recording saved to your Library.");
  };

  return (
  <SafeAreaView
    style={styles.container}
  >
    <CustomText style={styles.title}>Whisper Journal 🎙️</CustomText>

    <SafeAreaView style={styles.waveformContainer}>
      {levels.map((level, i) => (
        <SafeAreaView key={i} style={[styles.bar, { height: level * 60 + 10 }]} />
      ))}
    </SafeAreaView>

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

    <CustomText style={styles.status}>
      {isRecording
        ? `Recording... ${Math.floor(duration / 60)}:${String(duration % 60).padStart(
            2,
            "0"
          )}`
        : "Tap to Record"}
    </CustomText>

    {/* ✏️ Floating Write Button */}
    <TouchableOpacity
      style={styles.writeButton}
      onPress={() => navigation.navigate("Write")}
    >
      <FontAwesome name="pencil" size={24} color="#fff" />
    </TouchableOpacity>

    {/* 🎧 Title Input Modal */}
    <Modal visible={showTitleModal} transparent animationType="fade">
      <SafeAreaView style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalBox}>
          <CustomText style={styles.modalTitle}>Enter Audio Title</CustomText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="My recording..."
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <SafeAreaView style={styles.modalActions}>
            <TouchableOpacity
              onPress={() => {
                setShowTitleModal(false);
                setTitle("");
                setAudioUri(null);
              }}
              style={[styles.modalButton, { backgroundColor: "#ccc" }]}
            >
              <CustomText style={{ color: "#000" }}>Cancel</CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={saveAudioEntry}
              style={[styles.modalButton, { backgroundColor: "#313d49ff" }]}
            >
              <CustomText style={{ color: "#fff" }}>Save</CustomText>
            </TouchableOpacity>
          </SafeAreaView>
        </SafeAreaView>
      </SafeAreaView>
    </Modal>
  </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#b3b0b0ff", 
    alignItems: "center", 
   justifyContent: "center" 
  },
  title: { 
    color: "#000", 
    fontSize: 25, 
    marginBottom: 40 
  },
  waveformContainer: { 
    flexDirection: "row", 
    alignItems: "flex-end", 
    height: 80, 
    marginBottom: 40 
  },
  bar: { 
    width: 4, 
    backgroundColor: "#313d49ff", 
    marginHorizontal: 2, 
    borderRadius: 2,
    bottom: 25, 
  },
  recordButton: { 
    width: 130, 
    height: 130,
    bottom: 50, 
    backgroundColor: "#313d49ff", 
    borderRadius: 50, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  recording: { 
    backgroundColor: "#313d49ff" 
  },
  status: { 
    color: "#444", 
    marginTop: 20,
    bottom: 40, 
    fontSize: 16 
  },
  writeButton: {
    position: "absolute",
    bottom: 120,
    right: 30,
    backgroundColor: "#313d49ff",
    borderRadius: 30,
    padding: 15,
    elevation: 5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontFamily: "CustomFont",
    color: "#000",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
  },
});
