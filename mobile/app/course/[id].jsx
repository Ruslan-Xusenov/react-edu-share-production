import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, FlatList, TextInput, Alert,
  Dimensions, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Toast from 'react-native-toast-message';
import apiClient, { API_ENDPOINTS, BASE_URL } from '../../src/api/client';
import useAuthStore from '../../src/hooks/useAuthStore';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/utils/theme';

const { width } = Dimensions.get('window');

// YouTube ID extraction
function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// Comment item
function CommentItem({ item }) {
  const avatarUrl = item.user?.avatar
    ? (item.user.avatar.startsWith('http') ? item.user.avatar : `${BASE_URL}${item.user.avatar}`)
    : null;

  return (
    <View style={styles.comment}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.commentAvatar} />
      ) : (
        <View style={[styles.commentAvatar, styles.commentAvatarFallback]}>
          <Text style={styles.commentAvatarText}>
            {(item.user?.first_name?.[0] || item.user?.username?.[0] || '?').toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.commentBody}>
        <Text style={styles.commentName}>{item.user?.first_name || item.user?.username}</Text>
        <Text style={styles.commentText}>{item.content}</Text>
        <Text style={styles.commentDate}>{new Date(item.created_at).toLocaleDateString('uz')}</Text>
      </View>
    </View>
  );
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [commentText, setCommentText] = useState('');
  const [tab, setTab] = useState('about'); // 'about' | 'comments' | 'quiz'
  const queryClient = useQueryClient();

  // Fetch lesson detail
  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => apiClient.get(API_ENDPOINTS.LESSON_DETAIL(id)).then(r => r.data),
  });

  // Fetch comments
  const { data: commentsData } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => apiClient.get(API_ENDPOINTS.LESSON_COMMENTS(id)).then(r => r.data),
    enabled: tab === 'comments',
  });

  // Fetch quiz
  const { data: quizData } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => apiClient.get(API_ENDPOINTS.LESSON_QUIZ(id)).then(r => r.data),
    enabled: tab === 'quiz',
  });

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: () => apiClient.post(API_ENDPOINTS.LESSON_ENROLL(id)),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Kursga muvaffaqiyatli qo\'shildingiz! 🎉' });
      queryClient.invalidateQueries(['lesson', id]);
      queryClient.invalidateQueries(['enrolled']);
    },
    onError: (e) => Toast.show({ type: 'error', text1: e.response?.data?.error || 'Xato yuz berdi' }),
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => apiClient.post(API_ENDPOINTS.LESSON_LIKE(id)),
    onSuccess: () => queryClient.invalidateQueries(['lesson', id]),
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => apiClient.post(API_ENDPOINTS.LESSON_SAVE(id)),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Saqlandi!' });
      queryClient.invalidateQueries(['lesson', id]);
      queryClient.invalidateQueries(['saved']);
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (text) => apiClient.post(API_ENDPOINTS.LESSON_ADD_COMMENT(id), { content: text }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries(['comments', id]);
      Toast.show({ type: 'success', text1: 'Izoh qo\'shildi!' });
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Kurs topilmadi</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Ortga qaytish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const ytId = getYouTubeId(lesson.video_url);
  const imageUrl = lesson.thumbnail
    ? (lesson.thumbnail.startsWith('http') ? lesson.thumbnail : `${BASE_URL}${lesson.thumbnail}`)
    : null;
  const isEnrolled = lesson.is_enrolled;
  const comments = Array.isArray(commentsData) ? commentsData : commentsData?.results || [];
  const quizQuestions = Array.isArray(quizData) ? quizData : quizData?.results || [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Video / Thumbnail */}
        <View style={styles.videoWrap}>
          {ytId ? (
            <WebView
              style={styles.video}
              source={{ uri: `https://www.youtube.com/embed/${ytId}?autoplay=0&playsinline=1` }}
              allowsFullscreenVideo
              javaScriptEnabled
            />
          ) : imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.video} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[COLORS.surface, COLORS.surfaceLight]} style={[styles.video, styles.videoFallback]}>
              <Ionicons name="play-circle" size={64} color={COLORS.textMuted} />
            </LinearGradient>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoWrap}>
          {lesson.subcategory?.name && (
            <Text style={styles.catLabel}>{lesson.subcategory.name}</Text>
          )}
          <Text style={styles.lessonTitle}>{lesson.title}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.statItemText}>{lesson.enrolled_count || 0} o'quvchi</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.statItemText}>{lesson.rating ? Number(lesson.rating).toFixed(1) : '5.0'}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.statItemText}>{lesson.duration || '—'}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="bar-chart-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.statItemText}>{lesson.level || 'Boshlang\'ich'}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            {isAuthenticated && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, lesson.is_liked && styles.actionBtnActive]}
                  onPress={() => likeMutation.mutate()}
                >
                  <Ionicons
                    name={lesson.is_liked ? 'heart' : 'heart-outline'}
                    size={20}
                    color={lesson.is_liked ? COLORS.error : COLORS.textMuted}
                  />
                  <Text style={styles.actionBtnText}>{lesson.likes_count || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, lesson.is_saved && styles.actionBtnActive]}
                  onPress={() => saveMutation.mutate()}
                >
                  <Ionicons
                    name={lesson.is_saved ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={lesson.is_saved ? COLORS.primary : COLORS.textMuted}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Enroll button */}
          {!isEnrolled ? (
            <TouchableOpacity
              style={styles.enrollBtn}
              onPress={() => {
                if (!isAuthenticated) {
                  router.push('/(auth)/login');
                  return;
                }
                enrollMutation.mutate();
              }}
              disabled={enrollMutation.isPending}
            >
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.enrollGradient}>
                {enrollMutation.isPending ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.enrollText}>
                    {lesson.is_free === false ? '💎 Premium kursga yozilish' : '✅ Kursga yozilish'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.enrolledBadge}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              <Text style={styles.enrolledText}>Kursga yozilgansiz</Text>
            </View>
          )}

          {/* Instructor */}
          {lesson.instructor_name && (
            <View style={styles.instructor}>
              <Ionicons name="person-circle-outline" size={24} color={COLORS.textMuted} />
              <Text style={styles.instructorText}>O'qituvchi: <Text style={{ color: COLORS.text, fontWeight: '600' }}>{lesson.instructor_name}</Text></Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[
            { key: 'about', label: 'Haqida' },
            { key: 'comments', label: `Izohlar (${lesson.comments_count || 0})` },
            { key: 'quiz', label: 'Test' },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, tab === t.key && styles.tabActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {tab === 'about' && (
            <View>
              <Text style={styles.desc}>{lesson.description || 'Tavsif mavjud emas'}</Text>
              {lesson.tags?.length > 0 && (
                <View style={styles.tags}>
                  {lesson.tags.map((tag, i) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {tab === 'comments' && (
            <View>
              {/* Add comment */}
              {isAuthenticated && (
                <View style={styles.addComment}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Izoh yozish..."
                    placeholderTextColor={COLORS.textMuted}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={() => commentText.trim() && addCommentMutation.mutate(commentText.trim())}
                    disabled={addCommentMutation.isPending || !commentText.trim()}
                  >
                    <Ionicons name="send" size={20} color={COLORS.background} />
                  </TouchableOpacity>
                </View>
              )}
              {comments.length === 0 ? (
                <Text style={styles.emptyComments}>Hali izoh yo'q. Birinchi bo'ling!</Text>
              ) : (
                comments.map((c, i) => <CommentItem key={c.id || i} item={c} />)
              )}
            </View>
          )}

          {tab === 'quiz' && (
            <View>
              {!isEnrolled ? (
                <View style={styles.quizLocked}>
                  <Ionicons name="lock-closed-outline" size={40} color={COLORS.textMuted} />
                  <Text style={styles.quizLockedText}>Testni ko'rish uchun kursga yoziling</Text>
                </View>
              ) : quizQuestions.length === 0 ? (
                <Text style={styles.emptyComments}>Bu kurs uchun test mavjud emas</Text>
              ) : (
                quizQuestions.map((q, i) => (
                  <View key={q.id || i} style={styles.quizItem}>
                    <Text style={styles.quizQ}>{i + 1}. {q.question}</Text>
                    {q.options?.map((opt, oi) => (
                      <TouchableOpacity key={oi} style={styles.quizOpt}>
                        <View style={styles.quizOptDot} />
                        <Text style={styles.quizOptText}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  videoWrap: { width: '100%', height: 220, backgroundColor: '#000' },
  video: { width: '100%', height: 220 },
  videoFallback: { justifyContent: 'center', alignItems: 'center' },
  infoWrap: { padding: SPACING.md },
  catLabel: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '700', marginBottom: 6 },
  lessonTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: SPACING.md },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statItemText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  actionBtnActive: { borderColor: COLORS.primary },
  actionBtnText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  enrollBtn: { borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.md, ...SHADOWS.md },
  enrollGradient: { paddingVertical: 16, alignItems: 'center' },
  enrollText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: '800' },
  enrolledBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(74,222,128,0.1)', borderRadius: RADIUS.md,
    padding: SPACING.sm, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.primary,
  },
  enrolledText: { color: COLORS.primary, fontWeight: '600', fontSize: FONTS.sizes.md },
  instructor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  instructorText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  // Tabs
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: COLORS.primary },
  tabText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  tabContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  desc: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 24 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: SPACING.md },
  tag: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  tagText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.xs },
  // Comments
  addComment: {
    flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.sm, color: COLORS.text,
    fontSize: FONTS.sizes.md, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  comment: {
    flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm,
  },
  commentAvatar: { width: 40, height: 40, borderRadius: 20 },
  commentAvatarFallback: { backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { color: COLORS.text, fontWeight: '700' },
  commentBody: { flex: 1 },
  commentName: { fontWeight: '700', color: COLORS.text, fontSize: FONTS.sizes.sm },
  commentText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 },
  commentDate: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 4 },
  emptyComments: { color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.lg },
  // Quiz
  quizLocked: { alignItems: 'center', paddingVertical: SPACING.xl, gap: 12 },
  quizLockedText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
  quizItem: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  quizQ: { color: COLORS.text, fontWeight: '700', fontSize: FONTS.sizes.md, marginBottom: SPACING.sm },
  quizOpt: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  quizOptDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.border },
  quizOptText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  // Error
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: SPACING.xl },
  errorText: { fontSize: FONTS.sizes.lg, color: COLORS.text, fontWeight: '600' },
  backLink: { color: COLORS.primary, fontSize: FONTS.sizes.md },
});
