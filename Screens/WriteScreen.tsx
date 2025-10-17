import React, { useState, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useJournal, Entry } from "../context/JournalContext";
import CustomText from "../components/CustomText";

export default function WriteScreen() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const navigation = useNavigation();
  const { addEntry } = useJournal();

  // Save entry both to context and AsyncStorage
  const saveText = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a title for your note.");
      return;
    }
    if (!text.trim()) {
      Alert.alert("Empty Note", "Please write something before saving.");
      return;
    }

    const now = new Date();
    const newEntry: Entry = {
      id: Date.now().toString(),
      type: "text",
      title: title.trim(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      text: text.trim(),
    };

    try {
      // Save to context
      await addEntry(newEntry);

      // Save to AsyncStorage (offline)
      const stored = await AsyncStorage.getItem("journalEntries");
      const entries = stored ? JSON.parse(stored) : [];
      const updated = [newEntry, ...entries]; // new entry appears on top
      await AsyncStorage.setItem("journalEntries", JSON.stringify(updated));

      Alert.alert("Saved!", "Your note has been saved to the library.");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving entry:", error);
      Alert.alert("Error", "Could not save your note. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TextInput
          style={styles.titleInput}
          placeholder="Enter title..."
          placeholderTextColor="#777"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.textInput}
          placeholder="Write your thoughts..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          multiline
        />
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={saveText}>
        <CustomText style={styles.saveText}>Save</CustomText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#b3b0b0ff", 
    padding: 20 },
  titleInput: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "CustomFont",
    color: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
    marginBottom: 15,
  },
  textInput: {
    fontSize: 18,
    fontFamily: "CustomFont",
    color: "#000",
    textAlignVertical: "top",
    padding: 10,
    minHeight: 250,
  },
  saveButton: {
    backgroundColor: "#313d49ff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
