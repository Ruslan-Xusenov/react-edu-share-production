import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edushare_project.settings')
django.setup()

from core.models import AllowedIP, IPBlocklist

def add_ip(ip_address, description="Admin Access"):
    try:
        # 1. Add to AllowedIP
        obj, created = AllowedIP.objects.get_or_create(
            ip_address=ip_address,
            defaults={'description': description, 'is_active': True}
        )
        if not created:
            obj.is_active = True
            obj.description = description
            obj.save()
            print(f"✅ IP {ip_address} AllowedIP ro'yxatida yangilandi.")
        else:
            print(f"✅ IP {ip_address} AllowedIP ro'yxatiga qo'shildi.")
            
        # 2. Clear from IPBlocklist (Muvaffaqiyatli unblock qilish uchun)
        deleted_count, _ = IPBlocklist.objects.filter(ip_address=ip_address).delete()
        if deleted_count > 0:
            print(f"🔓 IP {ip_address} blokdan chiqarildi.")
        
        print("\n☝️ MUHIM: Brauzeringizdagi kesh va cookie-larni tozalang (yoki Incognito oynada oching)!")
            
    except Exception as e:
        print(f"❌ Xatolik yuz berdi: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Foydalanish: python3 add_admin_ip.py <IP_MANZIL>")
        print("Misol: python3 add_admin_ip.py 123.456.78.90")
    else:
        add_ip(sys.argv[1])