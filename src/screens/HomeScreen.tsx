import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../hooks/useBooks';
import { Book } from '../lib/types';
import { colors, typography, spacing, radius } from '../theme';

const XP_PER_LEVEL = 500;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function ContentTile({ book }: { book: Book }) {
  return (
    <TouchableOpacity style={styles.tile} activeOpacity={0.8}>
      <LinearGradient
        colors={[book.cover_color + 'cc', book.accent_color + '88']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tileOverlay} />
      <View style={styles.tileInner}>
        <View style={styles.typeChip}>
          <Text style={styles.typeChipText}>{book.type}</Text>
        </View>
        <View>
          <Text style={styles.tileTitle} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.tileAuthor}>{book.author}</Text>
          <View style={styles.tileBtn}>
            <Ionicons name="play" size={10} color="#fff" />
            <Text style={styles.tileBtnText}>Begin</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const { books, loading } = useBooks();

  const xp = profile?.xp ?? 0;
  const streak = profile?.streak ?? 0;
  const dailyGoal = (profile?.daily_minutes ?? 10) * 2;
  const xpPct = Math.min((xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100, 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greetingText}>{greeting()}</Text>
        <Text style={styles.nameText}>{profile?.name ?? 'Learner'}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#f9731620' }]}>
            <Ionicons name="flame" size={16} color="#f97316" />
          </View>
          <View>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="flash" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>{xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>
      </View>

      <View style={styles.xpCard}>
        <View style={styles.xpCardHeader}>
          <Text style={styles.xpCardLabel}>Today's goal</Text>
          <Text style={styles.xpCardValue}>0 / {dailyGoal} XP</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${xpPct}%` as any }]}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingSection}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <Text style={styles.sectionSub}>Handpicked for you</Text>
            <FlatList
              horizontal
              data={books.slice(0, 5)}
              keyExtractor={b => String(b.id)}
              renderItem={({ item }) => <ContentTile book={item} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Picks</Text>
            <Text style={styles.sectionSub}>Most popular this week</Text>
            <FlatList
              horizontal
              data={books.slice(2)}
              keyExtractor={b => String(b.id)}
              renderItem={({ item }) => <ContentTile book={item} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
            />
          </View>
        </>
      )}

      <TouchableOpacity style={styles.libraryBtn} activeOpacity={0.8}>
        <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="library" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.libraryBtnTitle}>Full Library</Text>
          <Text style={styles.libraryBtnSub}>{books.length} books, frameworks & more</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xl },
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },
  greetingText: { ...typography.small, color: colors.muted },
  nameText: { ...typography.h1, color: colors.text },
  statsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { ...typography.h3, color: colors.text },
  statLabel: { ...typography.tiny, color: colors.muted },
  xpCard: { marginHorizontal: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  xpCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  xpCardLabel: { ...typography.small, color: colors.muted },
  xpCardValue: { ...typography.small, color: colors.primary, fontWeight: '700' },
  progressTrack: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  loadingSection: { height: 224, alignItems: 'center', justifyContent: 'center' },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.body, color: colors.text, fontWeight: '700', paddingHorizontal: spacing.lg },
  sectionSub: { ...typography.tiny, color: colors.muted, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  hList: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  tile: { width: 176, height: 224, borderRadius: radius.lg, overflow: 'hidden' },
  tileOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  tileInner: { flex: 1, padding: spacing.md, justifyContent: 'space-between' },
  typeChip: { backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, alignSelf: 'flex-start' },
  typeChipText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
  tileTitle: { ...typography.small, color: '#fff', fontWeight: '700', lineHeight: 18, marginBottom: 2 },
  tileAuthor: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: spacing.sm },
  tileBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  tileBtnText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  libraryBtn: { marginHorizontal: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  libraryBtnTitle: { ...typography.small, color: colors.text, fontWeight: '600' },
  libraryBtnSub: { ...typography.tiny, color: colors.muted },
});
