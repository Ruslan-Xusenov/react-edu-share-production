import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient, { API_ENDPOINTS, BASE_URL } from '../../src/api/client';
import useAuthStore from '../../src/hooks/useAuthStore';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/utils/theme';

function EnrolledCourseCard({ item }) {
  const lesson = item.lesson || item;
  const progress = item.progress || 0;
  const imageUrl = lesson.thumbnail
    ? (lesson.thumbnail.startsWith('http') ? lesson.thumbnail : `${BASE_URL}${lesson.thumbnail}`)
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/course/${lesson.id}`)}
      activeOpacity={0.85}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <LinearGradient colors={[COLORS.surface, COLORS.surfaceLight]} style={[styles.cardImage, styles.cardImageFallback]}>
          <Ionicons name="book" size={28} color={COLORS.textMuted} />
        </LinearGradient>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{lesson.title}</Text>
        <Text style={styles.cardSub}>{lesson.instructor_name || 'EduShare'}</Text>
        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

export default function MyLearningScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['enrolled'],
    queryFn: () => apiClient.get(API_ENDPOINTS.LESSON_ENROLLED).then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: savedData } = useQuery({
    queryKey: ['saved'],
    queryFn: () => apiClient.get(API_ENDPOINTS.LESSON_SAVED).then(r => r.data),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <Ionicons name="school-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.authTitle}>Kirish talab etiladi</Text>
          <Text style={styles.authDesc}>O'rganishlaringizni ko'rish uchun tizimga kiring</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Kirish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const enrolled = Array.isArray(data) ? data : data?.results || [];
  const saved = Array.isArray(savedData) ? savedData : savedData?.results || [];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>🎓 O'rganishlarim</Text>
            </View>

            {/* Statistika */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{enrolled.length}</Text>
                <Text style={styles.statLabel}>Qo'shilgan</Text>
              </View>
              <View style={[styles.statBox, styles.statMid]}>
                <Text style={styles.statNum}>{saved.length}</Text>
                <Text style={styles.statLabel}>Saqlangan</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>
                  {enrolled.filter(e => (e.progress || 0) >= 100).length}
                </Text>
                <Text style={styles.statLabel}>Tugatilgan</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>📖 Davom etayotganlar</Text>
          </>
        }
        data={enrolled}
        keyExtractor={(item, i) => String(item.id || i)}
        renderItem={({ item }) => <EnrolledCourseCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="book-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Hali hech qanday kursga qo'shilmadingiz</Text>
              <TouchableOpacity style={styles.browsBtn} onPress={() => router.push('/courses')}>
                <Text style={styles.browsBtnText}>Kurslarni ko'rish</Text>
              </TouchableOpacity>
            </View>
          )
        }
        ListFooterComponent={
          saved.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>🔖 Saqlangan kurslar</Text>
              {saved.map((item, i) => (
                <EnrolledCourseCard key={item.id || i} item={item} />
              ))}
            </>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, marginBottom: SPACING.lg,
    overflow: 'hidden', ...SHADOWS.sm,
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md },
  statMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  statNum: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  // Card
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    marginBottom: SPACING.sm, padding: SPACING.sm,
    ...SHADOWS.sm,
  },
  cardImage: { width: 72, height: 72, borderRadius: RADIUS.sm, marginRight: SPACING.sm },
  cardImageFallback: { justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  cardSub: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  progressBg: { flex: 1, height: 4, backgroundColor: COLORS.border, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  progressText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, width: 32 },
  // Auth prompt
  authPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: 12 },
  authTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
  authDesc: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, textAlign: 'center' },
  loginBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl, paddingVertical: 12, marginTop: SPACING.sm,
  },
  loginBtnText: { color: COLORS.background, fontWeight: '700', fontSize: FONTS.sizes.md },
  // Empty state
  empty: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textMuted, textAlign: 'center' },
  browsBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg, paddingVertical: 10, marginTop: SPACING.sm,
  },
  browsBtnText: { color: COLORS.background, fontWeight: '700', fontSize: FONTS.sizes.sm },
});
