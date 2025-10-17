import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useJournal } from "../context/JournalContext";
import CustomText from "../components/CustomText";

type NoteDetailsRouteParams = {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
};

type NoteDetailsRouteProp = RouteProp<{ NoteDetails: NoteDetailsRouteParams }, "NoteDetails">;

export default function NoteDetailsScreen() {
  const route = useRoute<NoteDetailsRouteProp>();
  const navigation = useNavigation();
  const { updateEntry } = useJournal();
  const { id, title, content, date, time } = route.params;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);

  const handleSaveEdit = async () => {
    if (!editedTitle.trim() || !editedContent.trim()) {
      Alert.alert("Error", "Please fill both title and content before saving.");
      return;
    }

    await updateEntry(id, { title: editedTitle, text: editedContent });
    Alert.alert("Saved", "Note updated successfully!");
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <CustomText style={styles.meta}>
            {date} • {time}
          </CustomText>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <CustomText style={styles.editButton}>{isEditing ? "Cancel" : "Edit"}</CustomText>
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <>
            <TextInput
              style={styles.titleInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Enter title..."
            />
            <TextInput
              style={styles.contentInput}
              value={editedContent}
              onChangeText={setEditedContent}
              multiline
              placeholder="Edit your content..."
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <CustomText style={styles.saveText}>Save Changes</CustomText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <CustomText style={styles.title}>{title || "Untitled Note"}</CustomText>
            <CustomText style={styles.content}>{content || "No content available"}</CustomText>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#b3b0b0ff",
  },
  container: {
    padding: 20,
    fontFamily: "CustomFont",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  meta: {
    fontSize: 14,
    color: "#777",
  },
  editButton: {
    fontSize: 16,
    color: "#313d49ff",
    fontWeight: "600",
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "600",
    fontFamily: "CustomFont",
    color: "#000",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    color: "#333",
    lineHeight: 26,
  },
  contentInput: {
    fontSize: 16,
    fontFamily: "CustomFont",
    color: "#000",
    textAlignVertical: "top",
    padding: 10,
    height: 200,
    minHeight: 570
  },
  saveButton: {
    backgroundColor: "#313d49ff",
    fontFamily: "CustomFont",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
