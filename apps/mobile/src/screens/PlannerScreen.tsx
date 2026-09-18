import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { goalDrafts } from '../data/goalDrafts';
import { DailyPlanItem } from '../types';
import { useAppStore } from '../store/useAppStore';
import { createGoalAndPlan } from '../services/api';

export function PlannerScreen() {
  const { setDailyPlan } = useAppStore();
  const navigation = useNavigation<any>();
  const [goalTitle, setGoalTitle] = useState('Memorize Surah Al-Fatihah');
  const [targetRange, setTargetRange] = useState('Ayah 1-10');
  const [duration, setDuration] = useState('15 min');
  const [isGenerating, setIsGenerating] = useState(false);
  const [planMessage, setPlanMessage] = useState('');

  const generateLocalPlan = (): DailyPlanItem[] => {
    const durationMinutes = Number(duration.replace(/\D/g, '')) || 15;
    const generatedPlan: DailyPlanItem[] = [
      {
        id: 'plan-1',
        title: `${goalTitle}: ${targetRange}`,
        type: 'memorize',
        durationMinutes,
        status: 'in-progress',
      },
      {
        id: 'plan-2',
        title: 'Review previous ayah set',
        type: 'review',
        durationMinutes: 10,
        status: 'pending',
      },
      {
        id: 'plan-3',
        title: 'Recitation check',
        type: 'test',
        durationMinutes: 12,
        status: 'pending',
      },
    ];

    return generatedPlan;
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    setPlanMessage('');
    const durationMinutes = Number(duration.replace(/\D/g, '')) || 15;

    try {
      const serverPlan = await createGoalAndPlan({
        title: goalTitle,
        type: 'verse-range',
        target: targetRange,
        durationMinutes,
      });
      setDailyPlan(serverPlan);
      setPlanMessage('Plan synced with Warattel.');
    } catch {
      setDailyPlan(generateLocalPlan());
      setPlanMessage('Plan saved on this device and will sync when the API is available.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Planner</Text>
      <Text style={styles.title}>Create a Hifz goal</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Goal title</Text>
        <TextInput
          value={goalTitle}
          onChangeText={setGoalTitle}
          style={styles.input}
          placeholder="e.g. Memorize Surah Al-Fatihah"
        />

        <Text style={styles.label}>Target range</Text>
        <TextInput
          value={targetRange}
          onChangeText={setTargetRange}
          style={styles.input}
          placeholder="Ayah 1-10"
        />

        <Text style={styles.label}>Daily duration</Text>
        <TextInput
          value={duration}
          onChangeText={setDuration}
          style={styles.input}
          placeholder="15 min"
        />

        <Pressable style={styles.primaryButton} onPress={generatePlan}>
          <Text style={styles.primaryButtonText}>
            {isGenerating ? 'Generating plan...' : 'Generate today’s plan'}
          </Text>
        </Pressable>

        {planMessage ? <Text style={styles.planMessage}>{planMessage}</Text> : null}

        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Recitation')}>
          <Text style={styles.secondaryButtonText}>Start a recitation check</Text>
        </Pressable>
      </View>

      {goalDrafts.map((goal) => (
        <View key={goal.id} style={styles.goalCard}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={styles.goalMeta}>
            {goal.type} · {goal.target}
          </Text>
          <Text style={styles.goalDuration}>{goal.duration}</Text>
          <Text style={styles.goalAction}>Add to today’s plan</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf4ee',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  eyebrow: {
    color: '#2d6a4f',
    fontWeight: '700',
    letterSpacing: 2,
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1b1b1b',
    marginBottom: 18,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  label: {
    fontWeight: '700',
    color: '#1b1b1b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f6f4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    color: '#1b1b1b',
  },
  primaryButton: {
    backgroundColor: '#2d6a4f',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  planMessage: {
    color: '#57645f',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  secondaryButton: {
    borderColor: '#2d6a4f',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#2d6a4f',
    fontWeight: '700',
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b1b1b',
  },
  goalMeta: {
    color: '#57645f',
    marginTop: 8,
  },
  goalDuration: {
    marginTop: 10,
    color: '#2d6a4f',
    fontWeight: '700',
  },
  goalAction: {
    marginTop: 12,
    color: '#255f57',
    fontWeight: '700',
  },
});
