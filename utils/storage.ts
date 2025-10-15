import AsyncStorage from '@react-native-async-storage/async-storage';

const ENTRIES_KEY = '@whisper_entries';

export const saveEntry = async (entry: any) => {
  try {
    const stored = await AsyncStorage.getItem(ENTRIES_KEY);
    const entries = stored ? JSON.parse(stored) : [];
    entries.push(entry);
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entry:', error);
  }
};

export const getEntries = async () => {
  try {
    const stored = await AsyncStorage.getItem(ENTRIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading entries:', error);
    return [];
  }
};
