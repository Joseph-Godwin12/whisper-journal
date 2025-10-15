// src/Screens/WriteEntryScreen.tsx
import React, { useState } from 'react';
import 'react-native-get-random-values';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useJournal } from '../context/JournalContent';
import { v4 as uuidv4 } from 'uuid';
import { Entry } from '../context/JournalContent';

export default function WriteEntryScreen() {
  const [text, setText] = useState('');
  const { addEntry } = useJournal();
  const navigation = useNavigation();

  const saveEntry = async () => {
    if (!text.trim()) {
      Alert.alert('Empty note', 'Please write something before saving.');
      return;
    }

    const now = new Date();
   const newEntry: Entry = {
    id: uuidv4(),
    type: 'text',
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    content: text,
  };

  await addEntry(newEntry);
  setText('');
  navigation.goBack();
};

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Start writing your thoughts..."
        multiline
        value={text}
        onChangeText={setText}
      />
      <Button title="Save" onPress={saveEntry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
});
