import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBooks } from '../hooks/useBooks';
import { Book } from '../lib/types';
import { colors, typography, spacing, radius } from '../theme';

const FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Books', value: 'book' },
  { label: 'Philosophy', value: 'philosophy' },
  { label: 'Frameworks', value: 'framework' },
  { label: 'Courses', value: 'course' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#facc15',
  advanced: '#f87171',
};

function LibraryCard({ book }: { book: Book }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <LinearGradient
        colors={[book.cover_color + 'cc', book.accent_color + '77']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardOverlay} />
      <View style={styles.cardInner}>
        <View style={styles.cardTop}>
          <View style={styles.typeChip}>
            <Text style={styles.typeChipText}>{book.type}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.cardTitle} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.cardAuthor}>{book.author}</Text>
          <View style={styles.cardMeta}>
            <Text style={[styles.difficulty, { color: DIFFICULTY_COLORS[book.difficulty] }]}>{book.difficulty}</Text>
            <Text style={styles.duration}>{book.estimated_minutes}m</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const { books, loading, error } = useBooks();
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');

  const filtered = books.filter(b => {
    const matchType = filter == null || b.type === filter;
    const matchSearch = search.trim() === '' ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.title}>Library</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={colors.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, authors..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={f => f.label}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
              onPress={() => setFilter(f.value)}
            >
              <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search" size={32} color={colors.muted} />
          <Text style={styles.emptyTitle}>No results</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={b => String(b.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <LibraryCard book={item} />}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerArea: { paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.md },
  filterList: { gap: spacing.sm, paddingBottom: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { ...typography.tiny, color: colors.muted, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  grid: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  card: { flex: 1, height: 208, borderRadius: radius.lg, overflow: 'hidden' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  cardInner: { flex: 1, padding: spacing.md, justifyContent: 'space-between' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  typeChip: { backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  typeChipText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
  cardTitle: { ...typography.small, color: '#fff', fontWeight: '700', lineHeight: 18, marginBottom: 2 },
  cardAuthor: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  difficulty: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  duration: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  errorText: { ...typography.small, color: '#ef4444' },
});
