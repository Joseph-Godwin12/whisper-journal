import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Entry {
  id: string;
  type: "audio" | "text";
  date: string;
  time: string;
  title: string;
  content?: string;
  audioUri?: string;
  duration?: number;
  text?: string;
}

interface JournalContextType {
  entries: Entry[];
  addEntry: (entry: Entry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, updatedData: Partial<Entry>) => Promise<void>;
}

const JournalContext = createContext<JournalContextType>({
  entries: [],
  addEntry: async () => {},
  deleteEntry: async () => {},
  updateEntry: async () => {},
});

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const saved = await AsyncStorage.getItem("entries");
        if (saved) setEntries(JSON.parse(saved));
      } catch (err) {
        console.error("Error loading entries:", err);
      }
    };
    loadEntries();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  const addEntry = async (entry: Entry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  const deleteEntry = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEntry = async (id: string, updatedData: Partial<Entry>) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updatedData } : entry))
    );
  };

  return (
    <JournalContext.Provider value={{ entries, addEntry, deleteEntry, updateEntry }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => useContext(JournalContext);
