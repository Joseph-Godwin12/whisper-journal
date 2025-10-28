import React, { useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useJournal, Entry } from "../context/JournalContext";
import CustomText from "../components/CustomText";
import Toast from "react-native-toast-message";

export default function WriteScreen() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const navigation = useNavigation();
  const { addEntry } = useJournal();

  const saveText = async () => {
    if (!title.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Title",
        text2: "Please enter a title for your note.",
      });
      return;
    }

    if (!text.trim()) {
      Toast.show({
        type: "error",
        text1: "Empty Note",
        text2: "Please write something before saving.",
      });
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
      await addEntry(newEntry);

      const stored = await AsyncStorage.getItem("journalEntries");
      const entries = stored ? JSON.parse(stored) : [];
      const updated = [newEntry, ...entries];
      await AsyncStorage.setItem("journalEntries", JSON.stringify(updated));

      Toast.show({
        type: "success",
        text1: "Saved!",
        text2: "Your note has been added to the library.",
      });

      navigation.goBack();
    } catch (error) {
      console.error("Error saving entry:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not save your note. Please try again.",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Keeps screen above keyboard */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter title..."
              placeholderTextColor="#777"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />

            <TextInput
              style={styles.textInput}
              placeholder="Write your thoughts..."
              placeholderTextColor="#999"
              value={text}
              onChangeText={setText}
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>


        <TouchableOpacity style={styles.saveButton} onPress={saveText}>
          <CustomText style={styles.saveText}>Save</CustomText>
        </TouchableOpacity>
        <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#b3b0b0ff", 
    padding: 20 
  },
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
  saveText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
});
