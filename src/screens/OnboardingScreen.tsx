import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, radius } from '../theme';

const ROLES = ['Student', 'Professional', 'Entrepreneur', 'Creator', 'Researcher', 'Other'];

const GOALS = [
  { id: 'productivity', label: 'Productivity' },
  { id: 'focus', label: 'Focus & Deep Work' },
  { id: 'confidence', label: 'Confidence' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'mindset', label: 'Mindset' },
  { id: 'health', label: 'Health & Habits' },
  { id: 'finance', label: 'Finance' },
  { id: 'creativity', label: 'Creativity' },
];

const DURATIONS = [
  { value: 5, label: '5 min / day', sub: 'Quick wins' },
  { value: 10, label: '10 min / day', sub: 'Steady progress' },
  { value: 20, label: '20 min / day', sub: 'Deep learner' },
  { value: 30, label: '30 min / day', sub: 'Committed' },
];

const STEPS = [
  { title: 'What should we call you?', subtitle: 'Personalise your experience' },
  { title: 'What best describes you?', subtitle: "We'll tailor your content" },
  { title: 'What do you want to improve?', subtitle: 'Select all that apply' },
  { title: 'How much time can you commit?', subtitle: "We'll design your daily sessions" },
];

export default function OnboardingScreen() {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [dailyMinutes, setDailyMinutes] = useState(10);
  const [loading, setLoading] = useState(false);

  const canProceed = [name.trim().length > 0, role.length > 0, goals.length > 0, true];

  function toggleGoal(id: string) {
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  }

  async function handleFinish() {
    if (!user) return;
    setLoading(true);
    await supabase.from('profiles').update({
      name: name.trim(),
      role: role.toLowerCase(),
      goals,
      daily_minutes: dailyMinutes,
      onboarding_complete: true,
    }).eq('id', user.id);
    await refreshProfile();
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, { width: i === step ? 24 : 8 }, i <= step ? styles.dotActive : styles.dotInactive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{STEPS[step].title}</Text>
        <Text style={styles.subtitle}>{STEPS[step].subtitle}</Text>

        {step === 0 && (
          <TextInput
            style={styles.nameInput}
            placeholder="Your name"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        )}

        {step === 1 && (
          <View style={styles.pills}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.pill, role === r && styles.pillActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.pillText, role === r && styles.pillTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 2 && (
          <View style={styles.pills}>
            {GOALS.map(g => (
              <TouchableOpacity
                key={g.id}
                style={[styles.pill, goals.includes(g.id) && styles.pillActive]}
                onPress={() => toggleGoal(g.id)}
              >
                <Text style={[styles.pillText, goals.includes(g.id) && styles.pillTextActive]}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 3 && (
          <View style={styles.durationList}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d.value}
                style={[styles.durationCard, dailyMinutes === d.value && styles.durationCardActive]}
                onPress={() => setDailyMinutes(d.value)}
              >
                <Text style={[styles.durationLabel, dailyMinutes === d.value && styles.durationLabelActive]}>{d.label}</Text>
                <Text style={styles.durationSub}>{d.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, !canProceed[step] && styles.btnDisabled]}
          disabled={!canProceed[step] || loading}
          onPress={step < STEPS.length - 1 ? () => setStep(s => s + 1) : handleFinish}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>{step < STEPS.length - 1 ? 'Continue' : "Let's go →"}</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  dots: { flexDirection: 'row', gap: 6, paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: colors.primary },
  dotInactive: { backgroundColor: colors.border },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 120, flexGrow: 1 },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.muted, marginBottom: spacing.xl },
  nameInput: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, ...typography.h3, color: colors.text },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { ...typography.small, color: colors.muted, fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  durationList: { gap: spacing.sm },
  durationCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  durationCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  durationLabel: { ...typography.body, color: colors.text, fontWeight: '600' },
  durationLabelActive: { color: colors.primary },
  durationSub: { ...typography.small, color: colors.muted, marginTop: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.bg },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { ...typography.body, color: '#fff', fontWeight: '700' },
});
