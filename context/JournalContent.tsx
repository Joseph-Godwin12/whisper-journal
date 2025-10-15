import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { v4 as uuidv4 } from 'uuid';

// Define the Entry type
export interface Entry {
  id: string;
  type: 'audio' | 'text';
  date: string;
  time: string;
  content?: string; 
  audioUri?: string;
  duration?: number; 
}

// Define the context type
interface JournalContextType {
  entries: Entry[];
  addEntry: (entry: Entry) => Promise<void>;
  loadEntries: () => Promise<void>;
}

// Create context
const JournalContext = createContext<JournalContextType | undefined>(undefined);

// Provider
export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await AsyncStorage.getItem('journalEntries');
      if (data) setEntries(JSON.parse(data));
    } catch (e) {
      console.log('Error loading entries', e);
    }
  };

  const addEntry = async (entry: Entry) => {
    const newEntries = [entry, ...entries];
    setEntries(newEntries);
    await AsyncStorage.setItem('journalEntries', JSON.stringify(newEntries));
  };

  return (
    <JournalContext.Provider value={{ entries, addEntry, loadEntries }}>
      {children}
    </JournalContext.Provider>
  );
};

// Custom hook
export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournal must be used within a JournalProvider');
  return context;
};
