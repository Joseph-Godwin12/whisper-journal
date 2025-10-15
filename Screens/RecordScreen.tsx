import React, { useState, useEffect, useRef } from 'react';
import 'react-native-get-random-values';
import { View, Button, Text, Alert, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import Svg, { Rect } from 'react-native-svg';
import { v4 as uuidv4 } from 'uuid';
import { useNavigation } from '@react-navigation/native';
import { useJournal } from '../context/JournalContent';
import { Entry } from '../context/JournalContent';

export default function RecordScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [levels, setLevels] = useState<number[]>([]); // store volume levels
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { addEntry } = useJournal();
  const navigation = useNavigation();

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Microphone permission is needed to record.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);

      // Start metering updates every 100ms
      intervalRef.current = setInterval(async () => {
        const status = await recording.getStatusAsync();
      if (status.isRecording) {
        const level = typeof status.metering === 'number' ? status.metering : 0;
        setLevels((prev: number[]) => [...prev.slice(-25), level]);
      }

      }, 100);
    } catch (err) {
      console.error('Error starting recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const now = new Date();
      const newEntry: Entry = {
        id: uuidv4(),
        type: 'audio',
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        audioUri: uri!,
      };

      await addEntry(newEntry);

      setRecording(null);
      setIsRecording(false);
      setLevels([]);
      navigation.goBack();
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {isRecording ? 'Recording in progress...' : 'Press to start recording'}
      </Text>

      {/* 🎵 Waveform Visualization */}
      <Svg height="80" width="320" style={{ marginBottom: 20 }}>
        {levels.map((level, i) => (
          <Rect
            key={i}
            x={i * 12}
            y={40 - Math.abs(level / 3)}
            width="8"
            height={Math.abs(level / 1.5)}
            fill="#2e86de"
            rx="3"
          />
        ))}
      </Svg>

      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
        color={isRecording ? 'red' : '#2e86de'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginBottom: 20, fontSize: 18 },
});
