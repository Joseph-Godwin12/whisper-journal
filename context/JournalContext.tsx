import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Entry {
  id: string;
  type: "audio" | "text";
  date: string;
  time: string;
  title: string;
  audioUri?: string;
  duration?: number;
  text?: string;
}

interface JournalContextType {
  entries: Entry[];
  addEntry: (entry: Entry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

const JournalContext = createContext<JournalContextType>({
  entries: [],
  addEntry: async () => {},
  deleteEntry: async () => {},
});

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  // ✅ Load saved entries when app starts
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const saved = await AsyncStorage.getItem("entries");
        if (saved) {
          setEntries(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Error loading entries:", err);
      }
    };
    loadEntries();
  }, []);

  // ✅ Save entries automatically whenever updated
  useEffect(() => {
    AsyncStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  const addEntry = async (entry: Entry) => {
   setEntries((prev) => [entry, ...prev]);

  };

  const deleteEntry = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <JournalContext.Provider value={{ entries, addEntry, deleteEntry }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => useContext(JournalContext);
