import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { RecitationResult } from '../types';
import { queueRecitation } from '../services/api';

export function RecitationScreen() {
  const navigation = useNavigation<any>();
  const { setLatestRecitation } = useAppStore();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!recording) {
      return;
    }

    const timer = setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  useEffect(() => () => {
    if (recording) {
      recording.stopAndUnloadAsync().catch(() => undefined);
    }
  }, [recording]);

  const startRecording = async () => {
    setIsStarting(true);
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Microphone access needed', 'Allow microphone access to record your recitation.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const result = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setElapsedSeconds(0);
      setRecording(result.recording);
    } catch {
      Alert.alert('Recording unavailable', 'The recording could not be started on this device.');
    } finally {
      setIsStarting(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      return;
    }

    await recording.stopAndUnloadAsync();
    const audioUri = recording.getURI() ?? undefined;
    const localResult: RecitationResult = {
      id: `recitation-${Date.now()}`,
      title: 'Latest recitation',
      accuracy: 0,
      confidence: 'low',
      summary: 'Audio captured. Analysis is pending until the recitation service processes this recording.',
      audioUri,
      issues: [],
    };

    setRecording(null);
    try {
      if (!audioUri) {
        throw new Error('Recording did not produce an audio file');
      }
      const serverResult = await queueRecitation({ passage: 'Assigned passage', audioUri });
      setLatestRecitation(serverResult);
    } catch {
      setLatestRecitation(localResult);
    }
    navigation.navigate('Feedback');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Recitation check</Text>
      <Text style={styles.title}>Recite your assigned passage</Text>
      <Text style={styles.description}>
        Record one uninterrupted attempt. You can review the captured session while analysis is pending.
      </Text>

      <View style={styles.timerCard}>
        <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>
        <Text style={styles.timerLabel}>{recording ? 'Recording in progress' : 'Ready when you are'}</Text>
      </View>

      <Pressable
        style={[styles.recordButton, recording && styles.stopButton]}
        disabled={isStarting}
        onPress={recording ? stopRecording : startRecording}
      >
        <Text style={styles.recordButtonText}>
          {isStarting ? 'Preparing microphone...' : recording ? 'Stop and view feedback' : 'Start recording'}
        </Text>
      </Pressable>
    </View>
  );
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60)
    .toString()
    .padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edf4ee', padding: 20 },
  eyebrow: { color: '#2d6a4f', fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  title: { color: '#1b1b1b', fontSize: 30, fontWeight: '800', marginTop: 10 },
  description: { color: '#57645f', fontSize: 16, lineHeight: 24, marginTop: 12 },
  timerCard: { alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 16, marginTop: 28, padding: 28 },
  timer: { color: '#1b1b1b', fontSize: 48, fontWeight: '800' },
  timerLabel: { color: '#57645f', marginTop: 8 },
  recordButton: { backgroundColor: '#2d6a4f', borderRadius: 12, marginTop: 20, paddingVertical: 15 },
  stopButton: { backgroundColor: '#a33b3b' },
  recordButtonText: { color: '#ffffff', fontWeight: '700', textAlign: 'center' },
});