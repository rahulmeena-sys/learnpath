import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { colors, typography, spacing, radius } from '../theme';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

type ContentSection = {
  type: string;
  content?: string;
  text?: string;
  author?: string;
  prompt?: string;
};

type ContentQuiz = {
  question: string;
  options: string[];
  correct: number;
};

type ContentPackage = {
  book: {
    type: string;
    title: string;
    author: string;
    cover_color: string;
    accent_color: string;
    description: string;
    difficulty: Difficulty;
    estimated_minutes: number;
    xp_reward: number;
    goals: string[];
    is_premium: boolean;
  };
  lessons: {
    title: string;
    order_index: number;
    type: string;
    estimated_minutes: number;
    xp_reward: number;
    body: {
      key_idea: string;
      sections: ContentSection[];
      quiz?: ContentQuiz;
      summary: string;
    };
  }[];
};

type Status = { tone: 'error' | 'success' | 'info'; text: string };

const SAMPLE_PACKAGE = JSON.stringify(
  {
    book: {
      type: 'book',
      title: 'Example Book',
      author: 'Author Name',
      cover_color: '#6366f1',
      accent_color: '#818cf8',
      description: 'A short practical description for the Library screen.',
      difficulty: 'beginner',
      estimated_minutes: 20,
      xp_reward: 200,
      goals: ['productivity', 'mindset'],
      is_premium: false,
    },
    lessons: [
      {
        title: 'One Useful Idea',
        order_index: 1,
        type: 'text',
        estimated_minutes: 5,
        xp_reward: 30,
        body: {
          key_idea: 'One clear idea the user can apply today.',
          sections: [
            { type: 'text', content: 'Explain the idea in a short mobile-friendly paragraph.' },
            { type: 'challenge', content: 'Give the user one small action to take today.' },
          ],
          quiz: {
            question: 'What should this lesson teach?',
            options: ['One idea', 'Every chapter', 'A long essay', 'Only quotes'],
            correct: 0,
          },
          summary: 'Short recap of the lesson.',
        },
      },
    ],
  },
  null,
  2
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

function normalizePackage(value: unknown): { data: ContentPackage | null; error: string | null } {
  if (!isRecord(value) || !isRecord(value.book) || !Array.isArray(value.lessons)) {
    return { data: null, error: 'JSON must include a book object and lessons array.' };
  }

  const book = value.book;
  const title = stringValue(book.title);
  const author = stringValue(book.author);
  const description = stringValue(book.description);

  if (!title || !author || !description) {
    return { data: null, error: 'Book title, author, and description are required.' };
  }

  const difficulty = stringValue(book.difficulty, 'intermediate');
  const normalizedDifficulty: Difficulty = ['beginner', 'intermediate', 'advanced'].includes(difficulty)
    ? difficulty as Difficulty
    : 'intermediate';

  const goals = Array.isArray(book.goals)
    ? book.goals.map(goal => stringValue(goal)).filter(Boolean)
    : [];

  const lessons = value.lessons.map((lessonValue, index) => {
    if (!isRecord(lessonValue) || !isRecord(lessonValue.body)) {
      throw new Error(`Lesson ${index + 1} must include a body object.`);
    }

    const body = lessonValue.body;
    const lessonTitle = stringValue(lessonValue.title);
    const keyIdea = stringValue(body.key_idea);
    const summary = stringValue(body.summary);

    if (!lessonTitle || !keyIdea || !summary) {
      throw new Error(`Lesson ${index + 1} needs title, key_idea, and summary.`);
    }

    if (!Array.isArray(body.sections) || body.sections.length === 0) {
      throw new Error(`Lesson ${index + 1} needs at least one section.`);
    }

    const sections = body.sections.map((sectionValue, sectionIndex) => {
      if (!isRecord(sectionValue)) {
        throw new Error(`Lesson ${index + 1}, section ${sectionIndex + 1} must be an object.`);
      }

      const type = stringValue(sectionValue.type, 'text');
      const section: ContentSection = { type };
      const content = stringValue(sectionValue.content);
      const text = stringValue(sectionValue.text);
      const authorName = stringValue(sectionValue.author);
      const prompt = stringValue(sectionValue.prompt);

      if (content) section.content = content;
      if (text) section.text = text;
      if (authorName) section.author = authorName;
      if (prompt) section.prompt = prompt;

      if (!section.content && !section.text && !section.prompt) {
        throw new Error(`Lesson ${index + 1}, section ${sectionIndex + 1} needs content, text, or prompt.`);
      }

      return section;
    });

    let quiz: ContentQuiz | undefined;
    if (isRecord(body.quiz)) {
      const options = Array.isArray(body.quiz.options)
        ? body.quiz.options.map(option => stringValue(option)).filter(Boolean)
        : [];
      const correct = Number(body.quiz.correct);

      if (stringValue(body.quiz.question) && options.length === 4 && Number.isInteger(correct) && correct >= 0 && correct < 4) {
        quiz = {
          question: stringValue(body.quiz.question),
          options,
          correct,
        };
      }
    }

    return {
      title: lessonTitle,
      order_index: numberValue(lessonValue.order_index, index + 1),
      type: stringValue(lessonValue.type, 'text'),
      estimated_minutes: numberValue(lessonValue.estimated_minutes, 5),
      xp_reward: numberValue(lessonValue.xp_reward, 30),
      body: {
        key_idea: keyIdea,
        sections,
        ...(quiz ? { quiz } : {}),
        summary,
      },
    };
  });

  if (lessons.length === 0) {
    return { data: null, error: 'Add at least one lesson before publishing.' };
  }

  return {
    data: {
      book: {
        type: stringValue(book.type, 'book'),
        title,
        author,
        cover_color: stringValue(book.cover_color, '#6366f1'),
        accent_color: stringValue(book.accent_color, '#818cf8'),
        description,
        difficulty: normalizedDifficulty,
        estimated_minutes: numberValue(book.estimated_minutes, lessons.length * 5),
        xp_reward: numberValue(book.xp_reward, lessons.length * 35),
        goals,
        is_premium: Boolean(book.is_premium),
      },
      lessons,
    },
    error: null,
  };
}

function parseContent(raw: string): { data: ContentPackage | null; error: string | null } {
  if (!raw.trim()) return { data: null, error: 'Paste a content package first.' };

  try {
    return normalizePackage(JSON.parse(raw));
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Invalid JSON.' };
  }
}

export default function AdminScreen() {
  const [rawJson, setRawJson] = useState('');
  const [content, setContent] = useState<ContentPackage | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [publishing, setPublishing] = useState(false);

  const totalMinutes = useMemo(
    () => content?.lessons.reduce((sum, lesson) => sum + lesson.estimated_minutes, 0) ?? 0,
    [content]
  );

  function handleValidate() {
    const result = parseContent(rawJson);
    if (result.error) {
      setContent(null);
      setStatus({ tone: 'error', text: result.error });
      return null;
    }

    setContent(result.data);
    setStatus({ tone: 'success', text: 'Content package is ready to publish.' });
    return result.data;
  }

  async function handlePublish() {
    const packageToPublish = content ?? handleValidate();
    if (!packageToPublish) return;

    setPublishing(true);
    setStatus({ tone: 'info', text: 'Publishing content...' });

    const { data, error: bookError } = await supabase
      .from('books')
      .insert({ ...packageToPublish.book, status: 'published' })
      .select('id')
      .single();

    const insertedBook = data as { id: number } | null;

    if (bookError || !insertedBook) {
      setPublishing(false);
      setStatus({ tone: 'error', text: bookError?.message ?? 'Book could not be created.' });
      return;
    }

    const lessonRows = packageToPublish.lessons.map(lesson => ({
      ...lesson,
      book_id: insertedBook.id,
    }));

    const { error: lessonsError } = await supabase.from('lessons').insert(lessonRows);

    if (lessonsError) {
      await supabase.from('books').delete().eq('id', insertedBook.id);
      setPublishing(false);
      setStatus({ tone: 'error', text: lessonsError.message });
      return;
    }

    setPublishing(false);
    setRawJson('');
    setContent(null);
    setStatus({ tone: 'success', text: `${packageToPublish.book.title} published with ${packageToPublish.lessons.length} lessons.` });
    Alert.alert('Published', `${packageToPublish.book.title} is now in the Library.`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.title}>Admin</Text>
          <Text style={styles.subtitle}>Content ingest</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Book JSON</Text>
          <TouchableOpacity style={styles.ghostButton} onPress={() => setRawJson(SAMPLE_PACKAGE)} activeOpacity={0.8}>
            <Ionicons name="document-text-outline" size={14} color={colors.primary} />
            <Text style={styles.ghostButtonText}>Sample</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          value={rawJson}
          onChangeText={text => {
            setRawJson(text);
            setContent(null);
            setStatus(null);
          }}
          placeholder="Paste Claude JSON here"
          placeholderTextColor={colors.muted}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          textAlignVertical="top"
        />

        {status && (
          <View style={[styles.status, styles[status.tone]]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleValidate} activeOpacity={0.8}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.text} />
            <Text style={styles.secondaryButtonText}>Validate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, publishing && styles.buttonDisabled]}
            onPress={handlePublish}
            activeOpacity={0.8}
            disabled={publishing}
          >
            {publishing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>Publish</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {content && (
        <View style={styles.preview}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewTitle}>{content.book.title}</Text>
              <Text style={styles.previewSub}>{content.book.author}</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{content.lessons.length} lessons</Text>
            </View>
          </View>

          <Text style={styles.description}>{content.book.description}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{content.book.difficulty}</Text>
            <Text style={styles.metaDot}>.</Text>
            <Text style={styles.metaText}>{totalMinutes} min</Text>
            <Text style={styles.metaDot}>.</Text>
            <Text style={styles.metaText}>{content.book.xp_reward} XP</Text>
          </View>

          {content.lessons.map(lesson => (
            <View key={`${lesson.order_index}-${lesson.title}`} style={styles.lessonRow}>
              <Text style={styles.lessonIndex}>{lesson.order_index}</Text>
              <View style={styles.lessonBody}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonIdea}>{lesson.body.key_idea}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingTop: 60, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  headerIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '20' },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.small, color: colors.muted },
  panel: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  panelTitle: { ...typography.label, color: colors.text },
  ghostButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  ghostButtonText: { ...typography.tiny, color: colors.primary, fontWeight: '700' },
  input: { minHeight: 260, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.text, ...typography.small, lineHeight: 19 },
  status: { borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.sm, borderWidth: 1 },
  error: { backgroundColor: '#ef444415', borderColor: '#ef444455' },
  success: { backgroundColor: '#22c55e15', borderColor: '#22c55e55' },
  info: { backgroundColor: colors.primary + '15', borderColor: colors.primary + '55' },
  statusText: { ...typography.tiny, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  secondaryButton: { flex: 1, minHeight: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  secondaryButtonText: { ...typography.small, color: colors.text, fontWeight: '700' },
  primaryButton: { flex: 1, minHeight: 44, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  primaryButtonText: { ...typography.small, color: '#fff', fontWeight: '700' },
  buttonDisabled: { opacity: 0.6 },
  preview: { marginTop: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  previewTitle: { ...typography.h3, color: colors.text },
  previewSub: { ...typography.small, color: colors.muted },
  countBadge: { backgroundColor: colors.primary + '20', borderWidth: 1, borderColor: colors.primary + '40', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  countText: { ...typography.tiny, color: colors.primary, fontWeight: '700' },
  description: { ...typography.small, color: colors.muted, lineHeight: 19, marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  metaText: { ...typography.tiny, color: colors.muted, textTransform: 'capitalize' },
  metaDot: { ...typography.tiny, color: colors.muted },
  lessonRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  lessonIndex: { width: 24, height: 24, borderRadius: 8, backgroundColor: colors.border, color: colors.text, textAlign: 'center', lineHeight: 24, fontWeight: '700' },
  lessonBody: { flex: 1 },
  lessonTitle: { ...typography.small, color: colors.text, fontWeight: '700' },
  lessonIdea: { ...typography.tiny, color: colors.muted, lineHeight: 16, marginTop: 2 },
});
