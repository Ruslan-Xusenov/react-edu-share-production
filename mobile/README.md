# 📱 EduShare Mobile App

React Native + Expo bilan Android, iOS va Desktop uchun yaratilgan EduShare mobil ilovasi.

## 🏗️ Texnologiyalar

| Texnologiya | Versiya | Maqsad |
|---|---|---|
| **Expo** | ~52.0.0 | Cross-platform framework |
| **React Native** | 0.76.5 | UI layer |
| **Expo Router** | ~4.0.0 | File-based navigation |
| **Zustand** | ^5.0.0 | Global state management |
| **TanStack Query** | ^5.0.0 | Server state, caching |
| **Axios** | ^1.7.0 | HTTP client |
| **Expo SecureStore** | ~14.0.0 | Token saqlash |

## 📂 Loyiha tuzilmasi

```
mobile/
├── app/                          # Expo Router pages
│   ├── _layout.jsx               # Root layout (providers)
│   ├── (tabs)/                   # Tab bar ekranlar
│   │   ├── _layout.jsx           # Tab navigator
│   │   ├── index.jsx             # 🏠 Bosh sahifa
│   │   ├── courses.jsx           # 📚 Kurslar ro'yxati
│   │   ├── my-learning.jsx       # 🎓 O'rganishlarim
│   │   ├── leaderboard.jsx       # 🏆 Reyting
│   │   └── profile.jsx           # 👤 Profil
│   ├── (auth)/                   # Auth ekranlar
│   │   ├── _layout.jsx
│   │   ├── login.jsx             # 🔐 Kirish
│   │   └── signup.jsx            # 📝 Ro'yxatdan o'tish
│   └── course/
│       └── [id].jsx              # 📖 Kurs detail
└── src/
    ├── api/
    │   └── client.js             # Axios + endpoints
    ├── hooks/
    │   └── useAuthStore.js       # Zustand auth store
    └── utils/
        └── theme.js              # Design tokens
```

## 🚀 Ishga tushirish

### Talablar
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Android Studio (Android uchun) yoki Xcode (iOS uchun)
- Jismoniy qurilmada: **Expo Go** ilovasi

### O'rnatish

```bash
cd mobile
npm install --legacy-peer-deps
```

### Development serverni ishga tushirish

```bash
# Barcha platformalar uchun
npm start

# Faqat Android
npm run android

# Faqat iOS (macOS kerak)
npm run ios

# Web brauzer
npm run web
```

### Telefoningizda test qilish

1. [Expo Go](https://expo.dev/go) ilovasini Android yoki iOS'ga o'rnating
2. `npm start` komandasi QR kod ko'rsatadi
3. QR kodni Expo Go bilan skanlang
4. Ilova yuklanadi ✅

## 📦 APK/IPA build qilish

EAS (Expo Application Services) yordamida:

```bash
# EAS o'rnatish
npm install -g eas-cli

# Login
eas login

# Android APK (test uchun)
eas build --platform android --profile preview

# iOS (macOS + Apple Developer Account kerak)
eas build --platform ios --profile preview

# Ikkala platforma
eas build --platform all --profile production
```

## 🖥️ Desktop (Electron)

Web versiyani Desktop'ga aylantirish uchun:

```bash
# Web versiyani build qiling
npm run web -- --platform web

# Electron o'rnating
npm install electron electron-builder --save-dev
```

## 🔑 Muhim feature'lar

### ✅ Amalga oshirilgan
- [x] Bosh sahifa — kurslar, statistika, tezkor navigatsiya
- [x] Kurslar ro'yxati — qidiruv, kategoriya filtrlash
- [x] Kurs detail — YouTube video, izohlar, quiz, yozilish
- [x] Login / Signup ekranlari
- [x] Profil ekrani — avatar, XP, sertifikatlar
- [x] Leaderboard — podium ko'rinishi
- [x] O'rganishlarim — progress tracking
- [x] Expo SecureStore — xavfsiz token saqlash
- [x] TanStack Query — caching va data fetching
- [x] Cross-platform (Android, iOS, Web)

### 🔜 Keyingi versiyada
- [ ] Push notifications
- [ ] Offline mode
- [ ] Video progress saqlash
- [ ] AI Chatbot integratsiyasi
- [ ] Dark/Light mode toggle
- [ ] Ko'p tilli qo'llab-quvvatlash (uz/ru/en)
- [ ] Sertifikat PDF yuklab olish

## 🌐 API

Ilova `https://edushare.uz/api` ga ulanadi — bu xuddi
veb saytning backend API'si. Hech qanday backend o'zgarishi
talab etilmaydi.

## 📱 Ekranlar namunasi

```
📱 Tab Bar
├── 🏠 Home        — Featured kurslar, statistika
├── 📚 Courses     — Qidiruv + filtr + ro'yxat
├── 🎓 Learning    — Enrolled + Saved kurslar
├── 🏆 Leaderboard — XP reyting + Podium
└── 👤 Profile     — Avatar, stats, logout
```
