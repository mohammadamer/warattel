import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type StatCardProps = {
  label: string;
  value: string;
  accent?: string;
};

export function StatCard({ label, value, accent = '#2d6a4f' }: StatCardProps) {
  return (
    <View style={[styles.card, { borderColor: accent }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    minHeight: 92,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#5d5d5d',
    marginBottom: 6,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1b1b1b',
  },
});
