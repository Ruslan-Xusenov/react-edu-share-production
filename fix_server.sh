#!/bin/bash
# Saytni jonlantirish (fix) skripti
# Foydalanish: sudo ./fix_server.sh

PROJECT_DIR="/home/react-edu-share-production"
USER="www-data"
GROUP="www-data"

echo "1. Kerakli papkalarni yaratish..."
mkdir -p $PROJECT_DIR/logs
mkdir -p $PROJECT_DIR/staticfiles
mkdir -p $PROJECT_DIR/media

echo "2. Ruxsatlarni o'rnatish..."
chown -R $USER:$GROUP $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

echo "3. Xizmatlarni sozlash..."
# Service faylini nusxalash
cp $PROJECT_DIR/edushare.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable edushare

# Nginx sozlamasini nusxalash
cp $PROJECT_DIR/nginx_config.conf /etc/nginx/sites-available/edushare
ln -sf /etc/nginx/sites-available/edushare /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "4. Xizmatlarni ishga tushirish..."
systemctl start redis-server
systemctl enable redis-server

if nginx -t; then
    systemctl restart nginx
    systemctl enable nginx
else
    echo "Xato: Nginx konfiguratsiyasida xatolik bor!"
    exit 1
fi

systemctl restart edushare

echo "5. Holatni tekshirish..."
systemctl status edushare --no-pager
systemctl status nginx --no-pager

echo ""
echo "Tayyor! Agar hammasi to'g'ri bo'lsa, saytingiz ishga tushishi kerak."