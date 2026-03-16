import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient, { API_ENDPOINTS, BASE_URL } from '../../src/api/client';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/utils/theme';

function CourseListItem({ item }) {
  const imageUrl = item.thumbnail
    ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${BASE_URL}${item.thumbnail}`)
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/course/${item.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.cardImageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <LinearGradient colors={[COLORS.surface, COLORS.surfaceLight]} style={styles.cardImage}>
            <Ionicons name="book-outline" size={36} color={COLORS.textMuted} />
          </LinearGradient>
        )}
        {item.level && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        {item.subcategory?.name && (
          <Text style={styles.catLabel}>{item.subcategory.name}</Text>
        )}
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardStat}>
            <Ionicons name="people-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.cardStatText}>{item.enrolled_count || 0}</Text>
          </View>
          <View style={styles.cardStat}>
            <Ionicons name="star" size={13} color="#FFD700" />
            <Text style={styles.cardStatText}>
              {item.rating ? Number(item.rating).toFixed(1) : '5.0'}
            </Text>
          </View>
          <View style={styles.cardStat}>
            <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.cardStatText}>{item.duration || '—'}</Text>
          </View>
        </View>

        <View style={styles.cardAction}>
          <Text style={styles.freeTag}>
            {item.is_free === false ? '💎 Premium' : '✅ Bepul'}
          </Text>
          <TouchableOpacity
            style={styles.enrollBtn}
            onPress={() => router.push(`/course/${item.id}`)}
          >
            <Text style={styles.enrollBtnText}>Ko'rish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CoursesScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get(API_ENDPOINTS.CATEGORIES).then(r => r.data),
  });

  const { data: lessonsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: () => apiClient.get(API_ENDPOINTS.LESSONS).then(r => r.data),
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.results || [];
  const allLessons = Array.isArray(lessonsData) ? lessonsData : lessonsData?.results || [];

  const filtered = allLessons.filter((lesson) => {
    const matchSearch = !search ||
      lesson.title?.toLowerCase().includes(search.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory ||
      lesson.subcategory?.category?.id === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Kurslar</Text>
        <Text style={styles.headerCount}>{filtered.length} ta kurs</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Kurs qidirish..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <FlatList
          data={[{ id: null, name: 'Hammasi' }, ...categories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          style={styles.catList}
          contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.catChip, selectedCategory === item.id && styles.catChipActive]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text style={[styles.catChipText, selectedCategory === item.id && styles.catChipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* List */}
      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ flex: 1, marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <CourseListItem item={item} />}
          contentContainerStyle={{ padding: SPACING.md, gap: SPACING.md }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Kurs topilmadi</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  headerCount: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
    marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md, height: 46,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md },
  catList: { maxHeight: 48, marginBottom: SPACING.sm },
  catChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 7,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  catChipTextActive: { color: COLORS.background },
  // Course card
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    overflow: 'hidden', ...SHADOWS.md,
  },
  cardImageWrap: { position: 'relative' },
  cardImage: { width: '100%', height: 160, justifyContent: 'center', alignItems: 'center' },
  levelBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  levelText: { color: COLORS.text, fontSize: FONTS.sizes.xs, fontWeight: '600' },
  cardBody: { padding: SPACING.md },
  catLabel: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '700', marginBottom: 4 },
  cardTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  cardDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 12, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  cardStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardStatText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  cardAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  freeTag: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  enrollBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  enrollBtnText: { color: COLORS.background, fontSize: FONTS.sizes.sm, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textMuted },
});