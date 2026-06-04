import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, typography, spacing, radius } from '../theme';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>📚</Text>
          </View>
          <Text style={styles.logoTitle}>LearnPath</Text>
          <Text style={styles.logoSub}>Build knowledge, build habits.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
            <Text style={styles.switchText}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchLink}>{mode === 'login' ? 'Sign up' : 'Sign in'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, justifyContent: 'center', padding: spacing.lg * 1.5 },
  logoArea: { alignItems: 'center', marginBottom: spacing.xl * 2 },
  logoIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  logoEmoji: { fontSize: 32 },
  logoTitle: { ...typography.h1, color: colors.text },
  logoSub: { ...typography.small, color: colors.muted, marginTop: 6 },
  form: { gap: spacing.md },
  formTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.text, ...typography.body },
  error: { ...typography.small, color: '#ef4444' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnText: { ...typography.body, color: '#fff', fontWeight: '600' },
  switchText: { ...typography.small, color: colors.muted, textAlign: 'center', marginTop: spacing.sm },
  switchLink: { color: colors.primary, fontWeight: '600' },
});
