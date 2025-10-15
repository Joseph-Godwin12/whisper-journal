// src/Screens/HomeScreen.tsx
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Whisper Journal</Text>

      {/* Record button */}
      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => navigation.navigate("Record" as never)}
      >
        <Ionicons name="mic" size={60} color="#fff" />
      </TouchableOpacity>

      {/* Pencil button for text entry */}
      <TouchableOpacity
        style={styles.textButton}
        onPress={() => navigation.navigate("Write" as never)}
      >
        <Ionicons name="pencil" size={30} color="#007bff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
  },
  recordButton: {
    backgroundColor: "#007bff",
    borderRadius: 100,
    padding: 40,
    marginBottom: 20,
  },
  textButton: {
    position: 'absolute',
    right: 25,
    bottom: 90,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    elevation: 3,

  },
});
