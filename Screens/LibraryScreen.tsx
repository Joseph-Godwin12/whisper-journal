import React, { useEffect, useState } from "react";
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useJournal } from "../context/JournalContext";

type RootStackParamList = {
  NoteDetails: {
    title: string;
    content: string;
    date: string;
    time: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { entries, deleteEntry } = useJournal();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playTime, setPlayTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [allEntries, setAllEntries] = useState(entries);
  const [filter, setFilter] = useState<"audio" | "text">("audio"); // 🔘 Filter toggle

  // ✅ Load entries from AsyncStorage (offline)
  useEffect(() => {
    const loadOfflineEntries = async () => {
      try {
        const stored = await AsyncStorage.getItem("journalEntries");
        const offlineEntries = stored ? JSON.parse(stored) : [];
        const merged = [...offlineEntries, ...entries];

        // Remove duplicates by ID
        const unique = merged.filter(
          (item, index, self) => index === self.findIndex((t) => t.id === item.id)
        );

        // Sort newest first
        unique.sort((a, b) => Number(b.id) - Number(a.id));
        setAllEntries(unique);
      } catch (error) {
        console.error("Error loading offline entries:", error);
      }
    };
    loadOfflineEntries();
  }, [entries]);

  // ✅ Unload sound when screen unmounts
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const formatTime = (seconds: number) => {
    if (!seconds || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const playAudio = async (item: any) => {
    try {
      if (playingId === item.id) {
        await sound?.stopAsync();
        setPlayingId(null);
        setPlayTime(0);
        return;
      }

      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri: item.audioUri });
      setSound(newSound);
      setPlayingId(item.id);

      const status = await newSound.getStatusAsync();
      if (status.isLoaded) setDuration(status.durationMillis! / 1000);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.isPlaying) setPlayTime(status.positionMillis / 1000);
        if (status.didJustFinish) {
          setPlayingId(null);
          setPlayTime(0);
        }
      });

      await newSound.playAsync();
    } catch (err) {
      console.error("Error playing audio:", err);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEntry(id);
            const stored = await AsyncStorage.getItem("journalEntries");
            const offline = stored ? JSON.parse(stored) : [];
            const updated = offline.filter((item: any) => item.id !== id);
            await AsyncStorage.setItem("journalEntries", JSON.stringify(updated));
            setAllEntries((prev) => prev.filter((item) => item.id !== id));
          } catch (e) {
            console.error("Error deleting entry:", e);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        if (item.type === "text") {
          navigation.navigate("NoteDetails", {
            title: item.title,
            content:  item.text || item.content || "",
            date: item.date,
            time: item.time,
          });
        }
      }}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        {item.type === "audio" ? (
          <>
            <Text style={styles.text}>🎙️ {item.date} - {item.time}</Text>
            {playingId === item.id ? (
              <Text style={styles.subText}>
                {formatTime(playTime)} / {formatTime(duration)}
              </Text>
            ) : (
              <Text style={styles.subText}>
                Duration: {formatTime(item.duration ?? 0)}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.text}>📝 {item.title || "Untitled Note"}</Text>
            <Text style={styles.subText}>{item.date} - {item.time}</Text>
          </>
        )}
      </View>

      {item.type === "audio" && (
        <TouchableOpacity onPress={() => playAudio(item)}>
          <FontAwesome
            name={playingId === item.id ? "pause" : "play"}
            size={22}
            color="#fff"
            style={{ marginRight: 15 }}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <FontAwesome name="trash" size={22} color="#ff6b6b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const filteredEntries = allEntries.filter((e) => e.type === filter);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Library 📚</Text>

      {/* 🔘 Filter Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, filter === "audio" && styles.activeToggle]}
          onPress={() => setFilter("audio")}
        >
          <Text style={[styles.toggleText, filter === "audio" && styles.activeText]}>
            🎙️ Audio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, filter === "text" && styles.activeToggle]}
          onPress={() => setFilter("text")}
        >
          <Text style={[styles.toggleText, filter === "text" && styles.activeText]}>
            📝 Notes
          </Text>
        </TouchableOpacity>
      </View>

      {filteredEntries.length === 0 ? (
        <Text style={styles.empty}>No {filter === "audio" ? "recordings" : "notes"} yet</Text>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: {
    color: "#000",
    fontSize: 22,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  toggleButton: {
    backgroundColor: "#aaa",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  activeToggle: { backgroundColor: "#2e86de" },
  toggleText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  activeText: { color: "#fff" },
  empty: { color: "#666", textAlign: "center", marginTop: 40 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2e86de",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: { color: "#fff", fontSize: 16, fontWeight: "600" },
  subText: { color: "#cce7ff", fontSize: 13, marginTop: 4 },
});
