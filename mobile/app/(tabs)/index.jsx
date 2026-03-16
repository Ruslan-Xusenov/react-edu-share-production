import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Image, FlatList, ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient, { API_ENDPOINTS, BASE_URL } from '../../src/api/client';
import useAuthStore from '../../src/hooks/useAuthStore';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/utils/theme';

const { width } = Dimensions.get('window');

// Kurs kartasi
function CourseCard({ item }) {
  const imageUrl = item.thumbnail
    ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${BASE_URL}${item.thumbnail}`)
    : null;

  return (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => router.push(`/course/${item.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.courseImageWrapper}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.courseImage} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={[COLORS.surface, COLORS.surfaceLight]}
            style={styles.courseImagePlaceholder}
          >
            <Ionicons name="book-outline" size={32} color={COLORS.textMuted} />
          </LinearGradient>
        )}
        {item.is_free === false && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={10} color="#FFD700" />
            <Text style={styles.premiumText}>PRO</Text>
          </View>
        )}
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseCat}>{item.subcategory?.category?.name || 'Kurs'}</Text>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.courseStats}>
          <Ionicons name="people-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.statText}>{item.enrolled_count || 0} o'quvchi</Text>
          <Ionicons name="star" size={13} color="#FFD700" style={{ marginLeft: 8 }} />
          <Text style={styles.statText}>{item.rating ? Number(item.rating).toFixed(1) : '5.0'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);

  const { data: lessonsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['lessons', 'home'],
    queryFn: () => apiClient.get(API_ENDPOINTS.LESSONS).then(r => r.data),
  });

  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient.get('/stats/').then(r => r.data),
  });

  const lessons = lessonsData?.results || lessonsData || [];
  const featured = lessons.slice(0, 5);
  const recent = lessons.slice(0, 10);

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <LinearGradient colors={[COLORS.surface, COLORS.background]} style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Salom, ${user.first_name || user.username}! 👋` : "EduShare'ga xush kelibsiz! 👋"}
            </Text>
            <Text style={styles.subGreeting}>Bugun nima o'rganasiz?</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}${user.avatar}` }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={22} color={COLORS.textMuted} />
              </View>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats qatorlar */}
        {statsData && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{statsData.total_lessons || 0}</Text>
              <Text style={styles.statLabel}>Kurslar</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxMid]}>
              <Text style={styles.statNum}>{statsData.total_students || 0}</Text>
              <Text style={styles.statLabel}>O'quvchilar</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{statsData.total_certificates || 0}</Text>
              <Text style={styles.statLabel}>Sertifikatlar</Text>
            </View>
          </View>
        )}

        {/* Tezkor navigatsiya */}
        <View style={styles.quickNav}>
          {[
            { icon: 'book', label: 'Kurslar', path: '/courses' },
            { icon: 'school', label: "O'rganish", path: '/my-learning' },
            { icon: 'trophy', label: 'Reyting', path: '/leaderboard' },
            { icon: 'person', label: 'Profil', path: '/profile' },
          ].map((item) => (
            <TouchableOpacity
              key={item.path}
              style={styles.quickNavItem}
              onPress={() => router.push(item.path)}
            >
              <View style={styles.quickNavIcon}>
                <Ionicons name={item.icon} size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickNavLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tavsiya etilgan kurslar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Tavsiya etilgan</Text>
            <TouchableOpacity onPress={() => router.push('/courses')}>
              <Text style={styles.seeAll}>Barchasini ko'r</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={featured}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <CourseCard item={item} />}
              contentContainerStyle={{ paddingLeft: SPACING.md, paddingRight: SPACING.sm }}
            />
          )}
        </View>

        {/* Yangi kurslar */}
        <View style={[styles.section, { marginBottom: SPACING.xxl }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ Yangi kurslar</Text>
            <TouchableOpacity onPress={() => router.push('/courses')}>
              <Text style={styles.seeAll}>Barchasini ko'r</Text>
            </TouchableOpacity>
          </View>

          {recent.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.listCard}
              onPress={() => router.push(`/course/${item.id}`)}
            >
              {item.thumbnail ? (
                <Image
                  source={{ uri: item.thumbnail.startsWith('http') ? item.thumbnail : `${BASE_URL}${item.thumbnail}` }}
                  style={styles.listCardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.listCardImage, styles.listCardImagePlaceholder]}>
                  <Ionicons name="book" size={20} color={COLORS.textMuted} />
                </View>
              )}
              <View style={styles.listCardInfo}>
                <Text style={styles.listCardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.listCardSub}>{item.instructor_name || 'EduShare'}</Text>
                <View style={styles.listCardStats}>
                  <Ionicons name="people-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.listStatText}>{item.enrolled_count || 0}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  greeting: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
  subGreeting: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: COLORS.primary },
  avatarPlaceholder: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center', alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md },
  statBoxMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  statNum: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  quickNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quickNavItem: { alignItems: 'center', gap: 6 },
  quickNavIcon: {
    width: 52, height: 52, borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.sm,
  },
  quickNavLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '500' },
  section: { marginBottom: SPACING.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  // Course Card (horizontal)
  courseCard: {
    width: width * 0.65,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  courseImageWrapper: { position: 'relative' },
  courseImage: { width: '100%', height: 130 },
  courseImagePlaceholder: { width: '100%', height: 130, justifyContent: 'center', alignItems: 'center' },
  premiumBadge: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  premiumText: { fontSize: 9, color: '#FFD700', fontWeight: '800' },
  courseInfo: { padding: SPACING.sm },
  courseCat: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '600', marginBottom: 4 },
  courseTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  courseStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  // List Card (vertical)
  listCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.sm, ...SHADOWS.sm,
  },
  listCardImage: { width: 64, height: 64, borderRadius: RADIUS.sm, marginRight: SPACING.sm, backgroundColor: COLORS.surfaceLight },
  listCardImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  listCardInfo: { flex: 1 },
  listCardTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  listCardSub: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  listCardStats: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  listStatText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
});
