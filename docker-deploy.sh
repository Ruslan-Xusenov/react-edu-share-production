#!/bin/bash

# docker-deploy.sh - Avtomatlashtirilgan Docker deploy skripti
# Ushbu skript yangi kodlarni yuklab oladi, Docker image larni noldan yig'adi,
# eski konteynerlarni tozalaydi va yangisini ko'taradi.

echo "====================================="
echo "🚀 EduShare Docker Deploy boshlanmoqda"
echo "====================================="

# Agar Git orqali ishlayotgan bo'lsangiz:
# echo "📥 Oxirgi kodlar yuklab olinmoqda..."
# git pull origin main

echo "📦 Yangi Docker image yig'ilmoqda (Build)..."
docker compose build --no-cache

echo "🔄 Konteynerlar yangilanmoqda va eskilar o'chirilmoqda..."
docker compose up -d --force-recreate --remove-orphans

echo "🧹 Eski va ishlatilmayotgan image'lar tozalanmoqda..."
docker system prune -af

echo "====================================="
echo "✅ Deploy muvaffaqiyatli yakunlandi!"
echo "Tizim holatini tekshirish uchun: docker compose logs -f"
echo "====================================="
