import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login, register, restoreAccessToken } from '../services/api';

export function AuthScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    restoreAccessToken().then((hasToken) => {
      if (hasToken) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    });
  }, [navigation]);

  const submit = async () => {
    if (!email.trim() || password.length < 8) {
      Alert.alert('Check your details', 'Enter an email and a password with at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegistering) {
        await register(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch {
      Alert.alert('Connection unavailable', 'You can continue offline, or try again when the API is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Warattel</Text>
      <Text style={styles.title}>{isRegistering ? 'Create your account' : 'Welcome back'}</Text>
      <Text style={styles.description}>Sync goals and recitation uploads across your devices.</Text>

      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Pressable style={styles.primaryButton} onPress={submit} disabled={isSubmitting}>
        <Text style={styles.primaryButtonText}>{isSubmitting ? 'Connecting...' : isRegistering ? 'Register' : 'Sign in'}</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => setIsRegistering((value) => !value)}>
        <Text style={styles.secondaryButtonText}>{isRegistering ? 'Use existing account' : 'Create an account'}</Text>
      </Pressable>
      <Pressable style={styles.offlineButton} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}>
        <Text style={styles.offlineButtonText}>Continue offline</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edf4ee', justifyContent: 'center', padding: 20 },
  eyebrow: { color: '#2d6a4f', fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  title: { color: '#1b1b1b', fontSize: 30, fontWeight: '800', marginTop: 10 },
  description: { color: '#57645f', fontSize: 16, lineHeight: 24, marginBottom: 24, marginTop: 12 },
  input: { backgroundColor: '#ffffff', borderRadius: 12, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 13 },
  primaryButton: { backgroundColor: '#2d6a4f', borderRadius: 12, marginTop: 4, paddingVertical: 14 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', textAlign: 'center' },
  secondaryButton: { borderColor: '#2d6a4f', borderRadius: 12, borderWidth: 1, marginTop: 10, paddingVertical: 13 },
  secondaryButtonText: { color: '#2d6a4f', fontWeight: '700', textAlign: 'center' },
  offlineButton: { marginTop: 18, paddingVertical: 10 },
  offlineButtonText: { color: '#57645f', textAlign: 'center' },
});