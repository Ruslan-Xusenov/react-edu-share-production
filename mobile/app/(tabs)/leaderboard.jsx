import React from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient, { API_ENDPOINTS, BASE_URL } from '../../src/api/client';
import useAuthStore from '../../src/hooks/useAuthStore';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/utils/theme';

const MEDALS = ['🥇', '🥈', '🥉'];
const TROPHY_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

function LeaderItem({ item, index, currentUserId }) {
  const isMe = item.id === currentUserId;
  const avatarUrl = item.avatar
    ? (item.avatar.startsWith('http') ? item.avatar : `${BASE_URL}${item.avatar}`)
    : null;

  return (
    <View style={[styles.item, isMe && styles.itemMe, index < 3 && styles.itemTop]}>
      {/* Rank */}
      <View style={styles.rankWrap}>
        {index < 3 ? (
          <Text style={styles.medal}>{MEDALS[index]}</Text>
        ) : (
          <Text style={[styles.rank, isMe && styles.rankMe]}>#{index + 1}</Text>
        )}
      </View>

      {/* Avatar */}
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback, isMe && styles.avatarMe]}>
          <Text style={styles.avatarText}>
            {(item.first_name?.[0] || item.username?.[0] || '?').toUpperCase()}
          </Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, isMe && styles.nameMe]} numberOfLines={1}>
          {item.first_name && item.last_name
            ? `${item.first_name} ${item.last_name}`
            : item.username}
          {isMe ? ' (Siz)' : ''}
        </Text>
        {item.telegram_username && (
          <Text style={styles.username}>@{item.telegram_username}</Text>
        )}
      </View>

      {/* XP */}
      <View style={styles.xpWrap}>
        <Text style={[styles.xp, index < 3 && { color: TROPHY_COLORS[index] }]}>
          {item.xp_points || 0}
        </Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => apiClient.get(API_ENDPOINTS.LEADERBOARD).then(r => r.data),
  });

  const leaders = Array.isArray(data) ? data : data?.results || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero */}
      <LinearGradient colors={[COLORS.surface, COLORS.background]} style={styles.hero}>
        <Text style={styles.heroTitle}>🏆 Reyting jadvali</Text>
        <Text style={styles.heroSub}>Eng faol o'quvchilar</Text>

        {/* Top 3 podium */}
        {!isLoading && leaders.length >= 3 && (
          <View style={styles.podium}>
            {/* 2nd */}
            <View style={[styles.podiumItem, styles.podiumSecond]}>
              {leaders[1]?.avatar ? (
                <Image
                  source={{ uri: leaders[1].avatar.startsWith('http') ? leaders[1].avatar : `${BASE_URL}${leaders[1].avatar}` }}
                  style={[styles.podiumAvatar, { borderColor: '#C0C0C0' }]}
                />
              ) : (
                <View style={[styles.podiumAvatarFallback, { borderColor: '#C0C0C0', backgroundColor: '#3a3a3a' }]}>
                  <Text style={styles.podiumAvatarText}>
                    {(leaders[1]?.first_name?.[0] || leaders[1]?.username?.[0] || '?').toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.podiumMedal}>🥈</Text>
              <Text style={styles.podiumName} numberOfLines={1}>
                {leaders[1]?.first_name || leaders[1]?.username}
              </Text>
              <Text style={[styles.podiumXp, { color: '#C0C0C0' }]}>{leaders[1]?.xp_points} XP</Text>
              <View style={[styles.podiumBar, { height: 60, backgroundColor: '#C0C0C0' }]} />
            </View>

            {/* 1st */}
            <View style={[styles.podiumItem, styles.podiumFirst]}>
              {leaders[0]?.avatar ? (
                <Image
                  source={{ uri: leaders[0].avatar.startsWith('http') ? leaders[0].avatar : `${BASE_URL}${leaders[0].avatar}` }}
                  style={[styles.podiumAvatar, { borderColor: '#FFD700', width: 72, height: 72, borderRadius: 36 }]}
                />
              ) : (
                <View style={[styles.podiumAvatarFallback, { borderColor: '#FFD700', backgroundColor: '#2a2a1a', width: 72, height: 72, borderRadius: 36 }]}>
                  <Text style={[styles.podiumAvatarText, { fontSize: 28 }]}>
                    {(leaders[0]?.first_name?.[0] || leaders[0]?.username?.[0] || '?').toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.podiumMedal}>🥇</Text>
              <Text style={[styles.podiumName, { fontWeight: '800', color: '#FFD700' }]} numberOfLines={1}>
                {leaders[0]?.first_name || leaders[0]?.username}
              </Text>
              <Text style={[styles.podiumXp, { color: '#FFD700' }]}>{leaders[0]?.xp_points} XP</Text>
              <View style={[styles.podiumBar, { height: 90, backgroundColor: '#FFD700' }]} />
            </View>

            {/* 3rd */}
            <View style={[styles.podiumItem, styles.podiumThird]}>
              {leaders[2]?.avatar ? (
                <Image
                  source={{ uri: leaders[2].avatar.startsWith('http') ? leaders[2].avatar : `${BASE_URL}${leaders[2].avatar}` }}
                  style={[styles.podiumAvatar, { borderColor: '#CD7F32' }]}
                />
              ) : (
                <View style={[styles.podiumAvatarFallback, { borderColor: '#CD7F32', backgroundColor: '#2a1a0a' }]}>
                  <Text style={styles.podiumAvatarText}>
                    {(leaders[2]?.first_name?.[0] || leaders[2]?.username?.[0] || '?').toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.podiumMedal}>🥉</Text>
              <Text style={styles.podiumName} numberOfLines={1}>
                {leaders[2]?.first_name || leaders[2]?.username}
              </Text>
              <Text style={[styles.podiumXp, { color: '#CD7F32' }]}>{leaders[2]?.xp_points} XP</Text>
              <View style={[styles.podiumBar, { height: 45, backgroundColor: '#CD7F32' }]} />
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Full list */}
      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={leaders.slice(3)}
          keyExtractor={(item, i) => String(item.id || i)}
          renderItem={({ item, index }) => (
            <LeaderItem item={item} index={index + 3} currentUserId={user?.id} />
          )}
          contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />
          }
          ListHeaderComponent={
            <Text style={styles.listHeader}>Qolgan o'rinlar</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: { padding: SPACING.md, paddingBottom: 0 },
  heroTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  heroSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: SPACING.md },
  // Podium
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 220, marginBottom: SPACING.sm },
  podiumItem: { alignItems: 'center', width: 100 },
  podiumFirst: { zIndex: 3 },
  podiumSecond: { marginRight: -10 },
  podiumThird: { marginLeft: -10 },
  podiumAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, marginBottom: 4 },
  podiumAvatarFallback: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 3,
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  podiumAvatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  podiumMedal: { fontSize: 20, marginBottom: 2 },
  podiumName: { fontSize: FONTS.sizes.xs, color: COLORS.text, fontWeight: '600', textAlign: 'center' },
  podiumXp: { fontSize: FONTS.sizes.xs, fontWeight: '700', marginBottom: 4 },
  podiumBar: { width: 80, borderRadius: 4, opacity: 0.6 },
  listHeader: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.sm, marginTop: SPACING.md },
  // List item
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    marginBottom: SPACING.sm, padding: SPACING.sm,
    ...SHADOWS.sm,
  },
  itemMe: { borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: 'rgba(74,222,128,0.08)' },
  itemTop: { backgroundColor: COLORS.surfaceLight },
  rankWrap: { width: 36, alignItems: 'center' },
  rank: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textMuted },
  rankMe: { color: COLORS.primary },
  medal: { fontSize: 22 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: SPACING.sm },
  avatarFallback: {
    backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center',
  },
  avatarMe: { borderWidth: 2, borderColor: COLORS.primary },
  avatarText: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  nameMe: { color: COLORS.primary },
  username: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  xpWrap: { alignItems: 'center' },
  xp: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.primary },
  xpLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
});
