import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import useAuthStore from '../../src/hooks/useAuthStore';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/utils/theme';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Barcha maydonlarni to\'ldiring' });
      return;
    }
    setLoading(true);
    try {
      await login(phone.trim(), password);
      Toast.show({ type: 'success', text1: 'Muvaffaqiyatli kirdingiz! 🎉' });
      router.replace('/(tabs)');
    } catch (e) {
      const msg = e.response?.data?.error || e.response?.data?.detail || 'Login xatosi';
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
            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon raqam</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="call-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+998 90 123 45 67"
                  placeholderTextColor={COLORS.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
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
  secondaryBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  secondaryText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
});
