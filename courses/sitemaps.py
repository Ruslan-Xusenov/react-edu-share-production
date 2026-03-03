from django.contrib.sitemaps import Sitemap
from .models import Lesson, Category


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


class StaticViewSitemap(Sitemap):
    changefreq = 'daily'
    protocol = 'https'

    _pages = {
        '/': 1.0,
        '/courses': 0.9,
        '/about': 0.8,
        '/leaderboard': 0.7,
        '/login': 0.3,
        '/signup': 0.3,
    }

    def items(self):
        return list(self._pages.keys())

    def location(self, item):
        return item

    def priority(self, item):
        return self._pages.get(item, 0.5)
