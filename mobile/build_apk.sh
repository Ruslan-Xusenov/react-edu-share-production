#!/bin/bash
export ANDROID_HOME=/home/kali/Android
export JAVA_HOME=/home/kali/Desktop/projects/Django/edushare.uz/mobile/jdk-17.0.14+7
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

echo "Starting APK build for EduShare..."
cd /home/kali/Desktop/projects/Django/edushare.uz/mobile/android
chmod +x gradlew

./gradlew clean assembleRelease

if [ $? -eq 0 ]; then
  echo "============================================="
  echo "✅ Build successful!"
  echo "APK tayyor! Uni quyidagi manzildan topasiz:"
  echo "mobile/android/app/build/outputs/apk/release/app-release.apk"
  echo "============================================="
else
  echo "❌ Build failed. Iltimos terminaldagi xatolikni tekshiring."
fi