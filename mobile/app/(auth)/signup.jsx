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

export default function SignupScreen() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '',
    phone: '', password: '', confirm_password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const signup = useAuthStore((s) => s.signup);
  const login = useAuthStore((s) => s.login);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSignup = async () => {
    if (!form.first_name || !form.username || !form.phone || !form.password) {
      Toast.show({ type: 'error', text1: 'Barcha majburiy maydonlarni to\'ldiring' });
      return;
    }
    if (form.password !== form.confirm_password) {
      Toast.show({ type: 'error', text1: 'Parollar mos kelmadi' });
      return;
    }
    if (form.password.length < 8) {
      Toast.show({ type: 'error', text1: 'Parol kamida 8 belgidan iborat bo\'lishi kerak' });
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      // Auto login after signup
      await login(form.phone, form.password);
      Toast.show({ type: 'success', text1: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz! 🎉' });
      router.replace('/(tabs)');
    } catch (e) {
      const data = e.response?.data;
      const msg = typeof data === 'string' ? data :
        Object.values(data || {}).flat().join(', ') || 'Ro\'yxatdan o\'tishda xato';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'first_name', label: 'Ism *', icon: 'person-outline', placeholder: 'Ismingizni kiriting', keyboard: 'default' },
    { key: 'last_name', label: 'Familiya', icon: 'person-outline', placeholder: 'Familiyangizni kiriting', keyboard: 'default' },
    { key: 'username', label: 'Foydalanuvchi nomi *', icon: 'at-outline', placeholder: 'username', keyboard: 'default' },
    { key: 'phone', label: 'Telefon *', icon: 'call-outline', placeholder: '+998 90 123 45 67', keyboard: 'phone-pad' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Back */}
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleArea}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.logoCircle}>
              <Ionicons name="person-add" size={36} color={COLORS.background} />
            </LinearGradient>
            <Text style={styles.title}>Ro'yxatdan o'tish</Text>
            <Text style={styles.subtitle}>EduShare'ga qo'shiling</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {fields.map(({ key, label, icon, placeholder, keyboard }) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={icon} size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={form[key]}
                    onChangeText={(v) => update(key, v)}
                    keyboardType={keyboard}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ))}

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parol *</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Kamida 8 belgi"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.password}
                  onChangeText={(v) => update('password', v)}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parolni takrorlash *</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Parolni takrorlang"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.confirm_password}
                  onChangeText={(v) => update('confirm_password', v)}
                  secureTextEntry={!showPass}
                />
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.submitGradient}>
                {loading ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.submitText}>Ro'yxatdan o'tish</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login link */}
            <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLinkText}>
                Hisobingiz bormi? <Text style={{ color: COLORS.primary }}>Kirish</Text>
              </Text>
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
  titleArea: { alignItems: 'center', gap: 8, marginBottom: SPACING.xl },
  logoCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', ...SHADOWS.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  form: { gap: SPACING.sm },
  inputGroup: { gap: 6 },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md },
  submitBtn: { borderRadius: RADIUS.full, overflow: 'hidden', marginTop: SPACING.sm, ...SHADOWS.md },
  submitGradient: { paddingVertical: 16, alignItems: 'center' },
  submitText: { color: COLORS.background, fontSize: FONTS.sizes.md, fontWeight: '800' },
  loginLink: { alignItems: 'center', paddingVertical: SPACING.sm },
  loginLinkText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
});
