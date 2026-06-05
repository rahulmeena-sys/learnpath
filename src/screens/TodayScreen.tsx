import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../hooks/useBooks';
import { colors, typography, spacing, radius } from '../theme';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type FeedItem = {
  id: string;
  type: 'task' | 'challenge' | 'reflection' | 'new-content' | 'streak-reminder';
  title: string;
  description: string;
  xpReward: number;
  done: boolean;
};

const ITEM_COLORS: Record<string, string> = {
  task: colors.primary,
  challenge: '#f97316',
  reflection: '#3b82f6',
  'new-content': colors.accent,
  'streak-reminder': '#f97316',
};

const ITEM_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  task: 'checkmark-circle',
  challenge: 'flash',
  reflection: 'book',
  'new-content': 'play-circle',
  'streak-reminder': 'flame',
};

function buildFeed(streak: number, dailyMinutes: number, bookTitle = 'your next book'): FeedItem[] {
  const feed: FeedItem[] = [];

  feed.push({
    id: '1', type: 'new-content',
    title: `Start: ${bookTitle}`,
    description: 'Pick up where you left off or start something new.',
    xpReward: 50, done: false,
  });

  feed.push({
    id: '2', type: 'task',
    title: `Read for ${dailyMinutes} minutes`,
    description: 'Your daily reading goal. Consistency compounds.',
    xpReward: 30, done: false,
  });

  if (streak > 0) {
    feed.push({
      id: '3', type: 'streak-reminder',
      title: `Keep your ${streak}-day streak alive`,
      description: 'Complete at least one lesson today to maintain it.',
      xpReward: 20, done: false,
    });
  }

  feed.push({
    id: '4', type: 'reflection',
    title: 'Daily reflection',
    description: 'What is one thing you learned yesterday that you can apply today?',
    xpReward: 10, done: false,
  });

  feed.push({
    id: '5', type: 'challenge',
    title: 'Challenge: Teach it back',
    description: 'Explain a concept from your last lesson to someone (or write it down).',
    xpReward: 40, done: false,
  });

  return feed;
}

export default function TodayScreen() {
  const { profile } = useAuth();
  const { books } = useBooks();
  const streak = profile?.streak ?? 0;
  const xp = profile?.xp ?? 0;
  const dailyGoal = (profile?.daily_minutes ?? 10) * 2;
  const xpPct = Math.min((xp % 500) / 500 * 100, 100);

  const suggestedTitle = books.length > 0 ? books[Math.floor(Math.random() * books.length)].title : 'your next book';
  const [feed, setFeed] = useState<FeedItem[]>(() => buildFeed(streak, profile?.daily_minutes ?? 10, suggestedTitle));

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const todayDow = new Date().getDay();
  const weekDays = DAYS.map((d, i) => ({ label: d, active: i < (streak % 7) || i === (todayDow === 0 ? 6 : todayDow - 1) }));

  function toggleDone(id: string) {
    setFeed(f => f.map(item => item.id === id ? { ...item, done: !item.done } : item));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Text style={styles.date}>{today.toUpperCase()}</Text>
      <Text style={styles.greeting}>
        {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'} 👋
      </Text>

      {/* Streak card */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Ionicons name="flame" size={16} color="#f97316" />
          <Text style={styles.streakTitle}>{streak} day streak</Text>
        </View>
        <View style={styles.weekRow}>
          {weekDays.map((d, i) => (
            <View key={i} style={[styles.daySquare, d.active && styles.daySquareActive]}>
              <Text style={[styles.dayLabel, d.active && styles.dayLabelActive]}>{d.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* XP bar */}
      <View style={styles.xpCard}>
        <View style={styles.xpRow}>
          <View style={styles.xpLabel}>
            <Ionicons name="flash" size={14} color={colors.primary} />
            <Text style={styles.xpLabelText}>Daily XP Goal</Text>
          </View>
          <Text style={styles.xpValue}>0 / {dailyGoal}</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${xpPct}%` as any }]}
          />
        </View>
      </View>

      {/* Feed */}
      <Text style={styles.agendaLabel}>TODAY'S AGENDA</Text>

      {feed.map(item => {
        const iconColor = ITEM_COLORS[item.type];
        const iconName = ITEM_ICONS[item.type];
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.feedCard, { borderColor: iconColor + '40', backgroundColor: iconColor + '08' }, item.done && styles.feedCardDone]}
            onPress={() => toggleDone(item.id)}
            activeOpacity={0.75}
          >
            <View style={styles.feedInner}>
              <View style={[styles.feedIcon, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={iconName} size={16} color={iconColor} />
              </View>
              <View style={styles.feedBody}>
                <Text style={[styles.feedTitle, item.done && styles.feedTitleDone]}>{item.title}</Text>
                <Text style={styles.feedDesc}>{item.description}</Text>
              </View>
              {item.xpReward > 0 && (
                <View style={styles.xpBadge}>
                  <Ionicons name="flash" size={10} color={colors.primary} />
                  <Text style={styles.xpBadgeText}>{item.xpReward}</Text>
                </View>
              )}
            </View>
            {item.type === 'task' && !item.done && (
              <TouchableOpacity style={styles.completeBtn} onPress={() => toggleDone(item.id)}>
                <Text style={styles.completeBtnText}>Mark Complete</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingTop: 60, paddingBottom: spacing.xl },
  date: { ...typography.tiny, color: colors.muted, letterSpacing: 2, marginBottom: 4 },
  greeting: { ...typography.h1, color: colors.text, marginBottom: spacing.lg },
  streakCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  streakHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  streakTitle: { ...typography.small, color: colors.text, fontWeight: '700' },
  weekRow: { flexDirection: 'row', gap: 6 },
  daySquare: { flex: 1, height: 36, borderRadius: 8, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  daySquareActive: { backgroundColor: '#f97316' },
  dayLabel: { fontSize: 10, fontWeight: '700', color: colors.muted },
  dayLabelActive: { color: '#fff' },
  xpCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  xpLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  xpLabelText: { ...typography.small, color: colors.muted },
  xpValue: { ...typography.small, color: colors.primary, fontWeight: '700' },
  progressTrack: { height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  agendaLabel: { ...typography.tiny, color: colors.muted, letterSpacing: 2, marginBottom: spacing.sm },
  feedCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  feedCardDone: { opacity: 0.4 },
  feedInner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  feedIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  feedBody: { flex: 1 },
  feedTitle: { ...typography.small, color: colors.text, fontWeight: '600', marginBottom: 2 },
  feedTitleDone: { textDecorationLine: 'line-through', color: colors.muted },
  feedDesc: { ...typography.tiny, color: colors.muted, lineHeight: 16 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, flexShrink: 0 },
  xpBadgeText: { ...typography.tiny, color: colors.primary, fontWeight: '700' },
  completeBtn: { marginTop: spacing.sm, backgroundColor: colors.primary + '20', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  completeBtnText: { ...typography.tiny, color: colors.primary, fontWeight: '700' },
});
