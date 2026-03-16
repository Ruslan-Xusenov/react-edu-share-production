import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import apiClient, { API_ENDPOINTS, BASE_URL } from '../../src/api/client';
import useAuthStore from '../../src/hooks/useAuthStore';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/utils/theme';

function StatBadge({ icon, value, label }) {
  return (
    <View style={styles.statBadge}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const avatarUrl = user?.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}${user.avatar}`)
    : null;

  const handleLogout = () => {
    Alert.alert(
      'Chiqish',
      'Hisobdan chiqmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Chiqish', style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
            setLoggingOut(false);
            Toast.show({ type: 'success', text1: 'Muvaffaqiyatli chiqildi' });
          },
        },
      ]
    );
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <LinearGradient colors={[COLORS.surface, COLORS.background]} style={styles.authGradient}>
            <Ionicons name="person-circle-outline" size={80} color={COLORS.textMuted} />
            <Text style={styles.authTitle}>Profilingizga kiring</Text>
            <Text style={styles.authDesc}>Hisobingizga kirish uchun tizimga kiring</Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginBtnText}>Kirish</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signupBtn} onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupBtnText}>Ro'yxatdan o'tish</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    { icon: 'school-outline', label: "O'rganishlarim", path: '/my-learning' },
    { icon: 'trophy-outline', label: 'Reyting', path: '/leaderboard' },
    { icon: 'ribbon-outline', label: 'Sertifikatlarim', path: null },
    { icon: 'settings-outline', label: 'Sozlamalar', path: null },
    { icon: 'information-circle-outline', label: 'Ilova haqida', path: null },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <LinearGradient colors={[COLORS.surface, COLORS.background]} style={styles.hero}>
          <View style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.onlineDot} />
          </View>

          <Text style={styles.name}>
            {user?.first_name && user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : user?.username}
          </Text>
          {user?.telegram_username && (
            <Text style={styles.username}>@{user.telegram_username}</Text>
          )}
          <Text style={styles.role}>{user?.role === 'teacher' ? '👨‍🏫 O\'qituvchi' : '👨‍🎓 O\'quvchi'}</Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBadge icon="flash" value={user?.xp_points || 0} label="XP" />
          <View style={styles.statDivider} />
          <StatBadge icon="flame" value={user?.streak_days || 0} label="Seriya" />
          <View style={styles.statDivider} />
          <StatBadge icon="ribbon" value={user?.certificates_count || 0} label="Sertifikat" />
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuItem}
              onPress={() => item.path ? router.push(item.path) : Toast.show({ type: 'info', text1: 'Tez kunda...' })}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color={COLORS.error} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={styles.logoutText}>Chiqish</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.version}>EduShare v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // Auth states
  authPrompt: { flex: 1 },
  authGradient: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: SPACING.xl, gap: 12,
  },
  authTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  authDesc: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, textAlign: 'center' },
  loginBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl, paddingVertical: 14, width: '100%', alignItems: 'center',
  },
  loginBtnText: { color: COLORS.background, fontWeight: '800', fontSize: FONTS.sizes.md },
  signupBtn: {
    borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl, paddingVertical: 14, width: '100%', alignItems: 'center',
  },
  signupBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.md },
  // Profile
  hero: { alignItems: 'center', padding: SPACING.xl, paddingBottom: SPACING.lg },
  avatarWrap: { position: 'relative', marginBottom: SPACING.sm },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: COLORS.primary },
  avatarFallback: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: COLORS.primary,
  },
  avatarInitial: { fontSize: 40, fontWeight: '800', color: COLORS.text },
  onlineDot: {
    position: 'absolute', bottom: 4, right: 4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.background,
  },
  name: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  username: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: 2 },
  role: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 4 },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg, overflow: 'hidden', ...SHADOWS.sm,
  },
  statBadge: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, gap: 4 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  statVal: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.primary },
  statLbl: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  menu: { marginHorizontal: SPACING.md, marginBottom: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(74,222,128,0.1)', justifyContent: 'center',
    alignItems: 'center', marginRight: SPACING.sm,
  },
  menuLabel: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.error, borderRadius: RADIUS.full,
    paddingVertical: 14, gap: 8,
  },
  logoutText: { color: COLORS.error, fontSize: FONTS.sizes.md, fontWeight: '700' },
  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginBottom: SPACING.xxl },
});
