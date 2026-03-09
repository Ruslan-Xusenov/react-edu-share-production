"""
Management command: Google OAuth SocialApp ni bazaga qo'shish.
Serverda ishlatish: python manage.py setup_google_oauth
"""
import os
from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site


class Command(BaseCommand):
    help = 'Google OAuth SocialApp ni bazaga qo\'shadi va Site domenini to\'g\'rilaydi'

    def add_arguments(self, parser):
        parser.add_argument(
            '--domain',
            type=str,
            default=None,
            help='Site domeni (default: ALLOWED_HOSTS dan olinadi)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Mavjud SocialApp ni ham yangilash',
        )

    def handle(self, *args, **options):
        from allauth.socialaccount.models import SocialApp

        client_id = os.getenv('GOOGLE_CLIENT_ID', '')
        secret = os.getenv('GOOGLE_CLIENT_SECRET', '')

        if not client_id or not secret:
            self.stdout.write(self.style.ERROR(
                '❌ GOOGLE_CLIENT_ID yoki GOOGLE_CLIENT_SECRET .env faylida topilmadi!'
            ))
            return

        # 1. Site domenini to'g'rilash
        site_id = getattr(__import__('django.conf', fromlist=['settings']).settings, 'SITE_ID', 1)
        domain = options.get('domain')
        if not domain:
            allowed_hosts = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')
            # localhost va IP lar ni chiqarib, asosiy domenni topish
            domain = next(
                (h.strip() for h in allowed_hosts
                 if h.strip() and not h.strip().startswith('127.')
                 and not h.strip() == 'localhost'
                 and not h.strip().startswith('www.')),
                'edushare.uz'
            )

        site, created = Site.objects.update_or_create(
            id=site_id,
            defaults={
                'domain': domain,
                'name': 'EduShare',
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Site yaratildi: {domain}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'✅ Site yangilandi: {domain}'))

        # 2. SocialApp yaratish yoki yangilash
        existing = SocialApp.objects.filter(provider='google').first()

        if existing and not options['force']:
            self.stdout.write(self.style.WARNING(
                f'⚠️  Google SocialApp allaqachon mavjud: {existing.name}\n'
                f'   Yangilash uchun --force flagini ishlating.'
            ))
            # Faqat sites ni tekshir
            if not existing.sites.filter(id=site_id).exists():
                existing.sites.add(site)
                self.stdout.write(self.style.SUCCESS(f'✅ Site SocialApp ga qo\'shildi'))
        else:
            if existing:
                existing.delete()
                self.stdout.write(self.style.WARNING('⚠️  Eski SocialApp o\'chirildi'))

            app = SocialApp.objects.create(
                provider='google',
                name='Google',
                client_id=client_id,
                secret=secret,
                key='',
            )
            app.sites.add(site)
            self.stdout.write(self.style.SUCCESS(
                f'✅ Google OAuth SocialApp yaratildi!\n'
                f'   Provider: google\n'
                f'   Client ID: {client_id[:30]}...\n'
                f'   Site: {domain}\n'
            ))

        self.stdout.write(self.style.SUCCESS('🎉 Google OAuth muvaffaqiyatli sozlandi!'))
