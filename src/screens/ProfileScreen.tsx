import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { colors, typography, spacing, radius } from '../theme';

const XP_PER_LEVEL = 500;

function StatCard({ label, value, icon, iconColor }: { label: string; value: string | number; icon: keyof typeof Ionicons.glyphMap; iconColor: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { profile, loading } = useAuth();

  if (loading || !profile) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  const level = Math.floor(profile.xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = profile.xp % XP_PER_LEVEL;
  const xpPct = (xpIntoLevel / XP_PER_LEVEL) * 100;
  const initial = profile.name?.[0]?.toUpperCase() ?? '?';

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.profileHeader}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </LinearGradient>
        <Text style={styles.name}>{profile.name}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Level {level}</Text>
        </View>
      </View>

      {/* XP bar */}
      <View style={styles.xpCard}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>XP Progress</Text>
          <Text style={styles.xpValue}>{xpIntoLevel} / {XP_PER_LEVEL}</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${xpPct}%` as any }]}
          />
        </View>
        <Text style={styles.xpTotal}>{profile.xp} total XP</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard label="Day streak" value={profile.streak} icon="flame" iconColor="#f97316" />
        <StatCard label="Best streak" value={profile.longest_streak} icon="star" iconColor="#facc15" />
        <StatCard label="Books done" value={profile.content_completed} icon="library" iconColor={colors.accent} />
        <StatCard label="Lessons done" value={profile.lessons_completed} icon="checkmark-circle" iconColor="#4ade80" />
      </View>

      {/* Daily goal */}
      <View style={styles.infoCard}>
        <Ionicons name="time-outline" size={16} color={colors.muted} />
        <Text style={styles.infoText}>Daily goal: {profile.daily_minutes} min / day</Text>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingTop: 60, paddingBottom: spacing.xl },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  profileHeader: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 34, fontWeight: '800', color: '#fff' },
  name: { ...typography.h2, color: colors.text },
  levelBadge: { marginTop: spacing.sm, backgroundColor: colors.primary + '20', paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: colors.primary + '40' },
  levelText: { ...typography.small, color: colors.primary, fontWeight: '700' },
  xpCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  xpLabel: { ...typography.label, color: colors.text },
  xpValue: { ...typography.small, color: colors.muted },
  progressTrack: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  xpTotal: { ...typography.tiny, color: colors.muted, marginTop: spacing.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 6 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { ...typography.h2, color: colors.text },
  statLabel: { ...typography.tiny, color: colors.muted, textAlign: 'center' },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  infoText: { ...typography.small, color: colors.muted },
  signOutBtn: { borderWidth: 1, borderColor: '#ef444440', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  signOutText: { ...typography.small, color: '#ef4444', fontWeight: '600' },
});
