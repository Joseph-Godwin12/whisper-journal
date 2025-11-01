import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🧩 Define Entry type
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

// 🧠 Define the context type
interface JournalContextType {
  entries: Entry[];
  addEntry: (entry: Entry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, updatedData: Partial<Entry>) => Promise<void>;
}

// 🪄 Create the context
const JournalContext = createContext<JournalContextType>({
  entries: [],
  addEntry: async () => {},
  deleteEntry: async () => {},
  updateEntry: async () => {},
});

// 💾 Provider Component
export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  // Load saved entries on mount
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

  // Save entries whenever they change
  useEffect(() => {
    AsyncStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  // Add new entry
  const addEntry = async (entry: Entry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  // Delete entry
  const deleteEntry = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Update entry
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

// 🧭 Hook for easy access
export const useJournal = () => useContext(JournalContext);
