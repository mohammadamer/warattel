import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { getRecitationStatus } from '../services/api';

export function FeedbackScreen() {
  const navigation = useNavigation<any>();
  const result = useAppStore((state) => state.latestRecitation);
  const setLatestRecitation = useAppStore((state) => state.setLatestRecitation);

  useEffect(() => {
    if (!result || !result.id || result.status === 'complete') {
      return;
    }

    const pollStatus = async () => {
      try {
        const latest = await getRecitationStatus(result.id);
        setLatestRecitation(latest);
      } catch {
        // Ignore transient polling failures; the next retry will continue the status check.
      }
    };

    const timer = setInterval(pollStatus, 3000);
    void pollStatus();

    return () => clearInterval(timer);
  }, [result?.id, result?.status, setLatestRecitation]);

  if (!result) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.title}>No recitation yet</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Recitation')}>
          <Text style={styles.primaryButtonText}>Record a recitation</Text>
        </Pressable>
      </View>
    );
  }

  const pending = result.status !== 'complete';
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Feedback</Text>
      <Text style={styles.title}>{pending ? 'Your recording is saved' : 'Your recitation result'}</Text>
      <Text style={styles.summary}>{result.summary}</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.score}>{pending ? 'Pending' : `${result.accuracy}%`}</Text>
        <Text style={styles.scoreLabel}>{pending ? (result.status === 'processing' ? 'processing' : 'analysis') : 'accuracy'}</Text>
        <Text style={styles.confidence}>Confidence: {pending ? 'checking' : result.confidence}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{pending ? 'What happens next' : 'Review these moments'}</Text>
        <Text style={styles.bodyText}>
          {pending
            ? 'The audio is ready for server-side alignment. Once processed, word-level mistakes and confidence will appear here.'
            : 'Use each issue as a focused review target before your next attempt.'}
        </Text>
        {result.issues.map((issue) => (
          <View key={issue.id} style={styles.issueCard}>
            <Text style={styles.issueLabel}>{issue.label}</Text>
            <Text style={styles.bodyText}>{issue.detail}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Recitation')}>
        <Text style={styles.primaryButtonText}>Try another recitation</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edf4ee' },
  content: { padding: 20, paddingBottom: 40 },
  emptyState: { flex: 1, backgroundColor: '#edf4ee', justifyContent: 'center', padding: 20 },
  eyebrow: { color: '#2d6a4f', fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  title: { color: '#1b1b1b', fontSize: 30, fontWeight: '800', marginTop: 10 },
  summary: { color: '#57645f', fontSize: 16, lineHeight: 24, marginTop: 12 },
  scoreCard: { alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 16, marginTop: 22, padding: 24 },
  score: { color: '#2d6a4f', fontSize: 38, fontWeight: '800' },
  scoreLabel: { color: '#57645f', marginTop: 4 },
  confidence: { color: '#255f57', fontWeight: '700', marginTop: 14 },
  section: { marginTop: 24 },
  sectionTitle: { color: '#1b1b1b', fontSize: 20, fontWeight: '700', marginBottom: 10 },
  bodyText: { color: '#57645f', fontSize: 15, lineHeight: 22 },
  issueCard: { backgroundColor: '#ffffff', borderRadius: 12, marginTop: 12, padding: 14 },
  issueLabel: { color: '#1b1b1b', fontSize: 16, fontWeight: '700', marginBottom: 5 },
  primaryButton: { backgroundColor: '#2d6a4f', borderRadius: 12, marginTop: 24, paddingVertical: 14 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', textAlign: 'center' },
});