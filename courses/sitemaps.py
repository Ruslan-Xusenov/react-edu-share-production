from django.contrib.sitemaps import Sitemap
from .models import Lesson, Category
from community.models import Article


class LessonSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.9
    protocol = 'https'

    def items(self):
        return Lesson.objects.filter(is_published=True).order_by('-created_at')

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        # React frontend URL format
        return f'/courses/{obj.id}'


class CategorySitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.7
    protocol = 'https'

    def items(self):
        return Category.objects.all()

    def location(self, obj):
        # React frontend uses query params for category filtering
        return f'/courses?category={obj.slug}'


# ✅ SEO FIX: Maqolalar sitemap'ga qo'shildi — Google blog kontent topadi
class ArticleSitemap(Sitemap):
    changefreq = "daily"
    priority = 0.8
    protocol = 'https'

    def items(self):
        return Article.objects.filter(is_published=True).order_by('-created_at')

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        # React frontend blog article URL
        return f'/community/articles/{obj.slug}'


class StaticViewSitemap(Sitemap):
    changefreq = 'daily'
    protocol = 'https'

    _pages = {
        '/': 1.0,
        '/courses': 0.9,
        '/about': 0.8,
        '/leaderboard': 0.7,
        # Blog sahifasi — raqobatchilar kabi organik trafik uchun
        '/community/news': 0.85,
        '/community/books': 0.6,
        '/community/events': 0.6,
        '/login': 0.3,
        '/signup': 0.3,
    }

    def items(self):
        return list(self._pages.keys())

    def location(self, item):
        return item

    def priority(self, item):
        return self._pages.get(item, 0.5)
