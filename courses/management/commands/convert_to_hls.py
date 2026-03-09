"""
Mavjud barcha video fayllarni HLS formatiga o'tkazish management command.

Ishlatish:
    python manage.py convert_to_hls           # barcha videolar
    python manage.py convert_to_hls --id 5   # faqat lesson id=5
    python manage.py convert_to_hls --force  # 'ready' bo'lganlarni ham qayta qilish
"""
from django.core.management.base import BaseCommand
from courses.models import Lesson


class Command(BaseCommand):
    help = 'Mavjud video fayllarni HLS formatiga o\'tkazish'

    def add_arguments(self, parser):
        parser.add_argument(
            '--id', type=int, default=None,
            help='Faqat shu ID dagi lesson ni konvertatsiya qilish'
        )
        parser.add_argument(
            '--force', action='store_true',
            help='Allaqachon \'ready\' bo\'lganlarni ham qayta konvertatsiya qilish'
        )

    def handle(self, *args, **options):
        import os
        from courses.hls_converter import convert_to_hls

        lesson_id = options.get('id')
        force = options.get('force')

        if lesson_id:
            queryset = Lesson.objects.filter(id=lesson_id, video_file__isnull=False).exclude(video_file='')
        else:
            queryset = Lesson.objects.filter(video_file__isnull=False).exclude(video_file='')

        if not force:
            queryset = queryset.exclude(hls_status='ready')

        total = queryset.count()
        if total == 0:
            self.stdout.write(self.style.WARNING('Konvertatsiya qilinadigan video topilmadi.'))
            return

        self.stdout.write(f'🎬 {total} ta video konvertatsiya qilinadi...\n')

        success_count = 0
        error_count = 0

        for lesson in queryset:
            video_path = lesson.video_file.path
            if not os.path.exists(video_path):
                self.stdout.write(self.style.ERROR(
                    f'  ❌ [{lesson.id}] {lesson.title} — fayl topilmadi: {video_path}'
                ))
                Lesson.objects.filter(id=lesson.id).update(hls_status='error')
                error_count += 1
                continue

            self.stdout.write(f'  ⏳ [{lesson.id}] {lesson.title} ...')

            # Status ni yangilash
            Lesson.objects.filter(id=lesson.id).update(hls_status='processing')

            try:
                result = convert_to_hls(lesson.id, video_path)
                if result:
                    self.stdout.write(self.style.SUCCESS(f'  ✅ [{lesson.id}] {lesson.title} — tayyor!'))
                    success_count += 1
                else:
                    self.stdout.write(self.style.ERROR(f'  ❌ [{lesson.id}] {lesson.title} — xatolik!'))
                    error_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ❌ [{lesson.id}] {lesson.title} — {e}'))
                Lesson.objects.filter(id=lesson.id).update(hls_status='error')
                error_count += 1

        self.stdout.write(f'\n📊 Natija: {success_count} muvaffaqiyatli, {error_count} xatolik')
