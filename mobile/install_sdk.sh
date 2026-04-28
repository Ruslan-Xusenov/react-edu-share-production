#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
echo kali | sudo -S apt-get update
echo kali | sudo -S apt-get install -y default-jdk wget unzip

mkdir -p /home/kali/Android/cmdline-tools
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip
unzip -q cmdline-tools.zip -d /home/kali/Android/cmdline-tools
mv /home/kali/Android/cmdline-tools/cmdline-tools /home/kali/Android/cmdline-tools/latest
rm cmdline-tools.zip

export ANDROID_HOME=/home/kali/Android
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

yes | sdkmanager --licenses > /dev/null
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" > /dev/null
echo "Android SDK Setup Complete"
