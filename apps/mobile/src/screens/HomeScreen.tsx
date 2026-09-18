import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { StatCard } from '../components/StatCard';

export function HomeScreen() {
  const { dailyPlan, recentRecitations, weakPassages, streak, retentionScore } = useAppStore();
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Warattel</Text>
      <Text style={styles.title}>Your Hifz progress</Text>

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Planner')}>
        <Text style={styles.primaryButtonText}>Create or review a goal</Text>
      </Pressable>

      <View style={styles.statsRow}>
        <StatCard label="Streak" value={`${streak} days`} accent="#2d6a4f" />
        <StatCard label="Retention" value={`${retentionScore}%`} accent="#3a6ea5" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today’s plan</Text>
        {dailyPlan.map((item) => (
          <View key={item.id} style={styles.planItem}>
            <View>
              <Text style={styles.planTitle}>{item.title}</Text>
              <Text style={styles.planMeta}>
                {item.type} · {item.durationMinutes} min
              </Text>
            </View>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent recitations</Text>
        {recentRecitations.map((result) => (
          <View key={result.id} style={styles.card}>
            <Text style={styles.cardTitle}>{result.title}</Text>
            <Text style={styles.accuracy}>{result.accuracy}% accuracy</Text>
            <Text style={styles.summary}>{result.summary}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weak passages</Text>
        {weakPassages.map((passage) => (
          <View key={passage.id} style={styles.card}>
            <Text style={styles.cardTitle}>{passage.title}</Text>
            <Text style={styles.summary}>
              {passage.risk} risk · {passage.issueCount} issue(s)
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f3',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  eyebrow: {
    color: '#2d6a4f',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    color: '#1b1b1b',
  },
  primaryButton: {
    backgroundColor: '#2d6a4f',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  section: {
    marginTop: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1b1b1b',
    marginBottom: 12,
  },
  planItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b1b1b',
  },
  planMeta: {
    marginTop: 4,
    color: '#5f6c66',
    fontSize: 12,
  },
  status: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#2d6a4f',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b1b1b',
    marginBottom: 4,
  },
  accuracy: {
    color: '#204a4a',
    fontWeight: '700',
    marginBottom: 6,
  },
  summary: {
    color: '#4b544f',
    lineHeight: 20,
  },
});
