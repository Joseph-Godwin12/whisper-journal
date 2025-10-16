import React from "react";
import { Text, StyleSheet, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";

// Define proper route type
type NoteDetailsRouteParams = {
  title: string;
  content: string;
  date: string;
  time: string;
};

// Use RouteProp correctly with your param type
type NoteDetailsRouteProp = RouteProp<{ NoteDetails: NoteDetailsRouteParams }, "NoteDetails">;

export default function NoteDetailsScreen() {
  const route = useRoute<NoteDetailsRouteProp>();
  const { title, content, date, time } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>{title || "Untitled Note"}</Text>
          <Text style={styles.meta}>
            {date} • {time}
          </Text>
          <Text style={styles.content}>{content || "No content available"}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2e86de",
    marginBottom: 10,
  },
  meta: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    color: "#333",
    lineHeight: 26,
  },
});
