import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import useAuthStore from '../../src/hooks/useAuthStore';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/utils/theme';
import Constants from 'expo-constants';

// WebBrowser sessiyasini yopish uchun
WebBrowser.maybeCompleteAuthSession();

// Google Client IDlar — app.json extra yoki Constants dan olinadi
const GOOGLE_EXPO_CLIENT_ID = Constants.expoConfig?.extra?.googleExpoClientId || '';
const GOOGLE_ANDROID_CLIENT_ID = Constants.expoConfig?.extra?.googleAndroidClientId || '';
const GOOGLE_IOS_CLIENT_ID = Constants.expoConfig?.extra?.googleIosClientId || '';
const GOOGLE_WEB_CLIENT_ID = Constants.expoConfig?.extra?.googleWebClientId || '';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const googleLogin = useAuthStore((s) => s.googleLogin);

  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_EXPO_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  // Google javob kuzatish
  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSuccess(response.authentication);
    } else if (response?.type === 'error') {
      setGoogleLoading(false);
      Toast.show({ type: 'error', text1: 'Google kirish bekor qilindi' });
    } else if (response?.type === 'dismiss') {
      setGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleSuccess = async (authentication) => {
    try {
      // Google dan id_token olish
      const idToken = authentication?.idToken;
      if (!idToken) {
        // id_token yo'q bo'lsa, access_token bilan userInfo olamiz va backendga yuboramiz
        // Bu holat Expo Go da bo'lishi mumkin
        Toast.show({
          type: 'error',
          text1: 'Google tokenini olishda xatolik',
          text2: 'Iltimos qayta urining yoki email bilan kiring',
        });
        setGoogleLoading(false);
        return;
      }

      await googleLogin(idToken);
      Toast.show({ type: 'success', text1: 'Google orqali muvaffaqiyatli kirdingiz! 🎉' });
      router.replace('/(tabs)');
    } catch (e) {
      const msg = e.response?.data?.message || 'Google kirish xatosi';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGooglePress = async () => {
    setGoogleLoading(true);
    await promptAsync();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Barcha maydonlarni to\'ldiring' });
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      Toast.show({ type: 'success', text1: 'Muvaffaqiyatli kirdingiz! 🎉' });
      router.replace('/(tabs)');
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.response?.data?.detail || 'Login xatosi';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Back */}
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          {/* Logo / Title */}
          <View style={styles.logoArea}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.logoCircle}>
              <Ionicons name="school" size={40} color={COLORS.background} />
            </LinearGradient>
            <Text style={styles.title}>EduShare</Text>
            <Text style={styles.subtitle}>Hisobingizga kiring</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parol</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Parolni kiriting"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.submitGradient}>
                {loading ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.submitText}>Kirish</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>yoki</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              style={[styles.googleBtn, (googleLoading || !request) && styles.googleBtnDisabled]}
              onPress={handleGooglePress}
              disabled={googleLoading || !request}
              activeOpacity={0.85}
            >
              {googleLoading ? (
                <ActivityIndicator color="#4285F4" size="small" />
              ) : (
                <>
                  {/* Google "G" SVG icon via text */}
                  <View style={styles.googleIconWrap}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                  <Text style={styles.googleBtnText}>Google bilan kiring</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Signup link */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.push('/(auth)/signup')}
            >
              <Text style={styles.secondaryText}>Hali hisobingiz yo'qmi? <Text style={{ color: COLORS.primary }}>Ro'yxatdan o'ting</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: SPACING.md },
  back: { marginBottom: SPACING.md, width: 40 },
  logoArea: { alignItems: 'center', gap: 8, marginBottom: SPACING.xl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.lg,
  },
  title: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.text },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  form: { gap: SPACING.md },
  inputGroup: { gap: 6 },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md },
  submitBtn: { borderRadius: RADIUS.full, overflow: 'hidden', ...SHADOWS.md },
  submitBtnDisabled: { opacity: 0.7 },
  submitGradient: { paddingVertical: 16, alignItems: 'center' },
  submitText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },

  // Google button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    gap: 10,
    ...SHADOWS.md,
  },
  googleBtnDisabled: { opacity: 0.6 },
  googleIconWrap: {
    width: 24, height: 24,
    backgroundColor: '#4285F4',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  googleBtnText: {
    color: '#1f1f1f',
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },

  secondaryBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  secondaryText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
});
