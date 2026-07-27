import os
from django.contrib import admin

from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap
from django.views.generic import TemplateView
from django.views.static import serve
from django.shortcuts import render
import posixpath
from pathlib import Path

from courses.sitemaps import LessonSitemap, CategorySitemap, StaticViewSitemap, ArticleSitemap

sitemaps = {
    'lessons': LessonSitemap,
    'categories': CategorySitemap,
    'static': StaticViewSitemap,
    'articles': ArticleSitemap,   # ✅ Blog maqolalari sitemap'da
}

# ─── Known React frontend routes ───────────────────────────────────────────────
# Any path NOT in this list (and not an API/static route) → HTTP 404
# This fixes the "Soft 404" SEO issue: crawlers get a real 404 status.
KNOWN_REACT_PATHS = {
    '',           # /
    'courses',    # /courses
    'about',      # /about
    'leaderboard',
    'login',
    'signup',
    'profile',
    'my-learning',
    'create-lesson',
    'community',   # /community/*
    'certificate', # /certificate/:id
}

def serve_react_or_404(request, path=''):
    """
    Serve the React SPA for known routes (HTTP 200).
    Return HTTP 404 for unknown routes — fixes Soft 404 SEO issue.
    Search engines will correctly mark unknown URLs as 404.
    """
    clean = path.strip('/')
    # Get the first path segment (e.g. 'courses' from 'courses/10')
    first_segment = clean.split('/')[0] if clean else ''

    if first_segment in KNOWN_REACT_PATHS:
        return render(request, 'index.html', status=200)

    # Unknown route → real HTTP 404 (React will render its own 404 UI)
    return render(request, 'index.html', status=404)


urlpatterns = [
    path(os.getenv('ADMIN_URL', 'admin/'), admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path("ckeditor5/", include('django_ckeditor_5.urls')),

    path('api/', include('courses.api_urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/community/', include('community.urls')),
    path('api/ai-chat/', __import__('core.views', fromlist=['ai_chat']).ai_chat, name='ai-chat'),
    path('api/stats/', __import__('core.views', fromlist=['api_stats']).api_stats, name='api-stats'),
    path('api/team/', __import__('core.views', fromlist=['api_team']).api_team, name='api-team'),
    path('api-auth/', include('rest_framework.urls')),

    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', TemplateView.as_view(template_name="robots.txt", content_type="text/plain")),
    path('google94bc4a68fc393c2a.html', TemplateView.as_view(template_name="google94bc4a68fc393c2a.html", content_type="text/html")),

    # ✅ SEO FIX: Smart catch-all — known routes → 200, unknown routes → 404
    re_path(
        r'^(?!api|edushare-boshqaruv-2026|admin|media|static|assets|accounts|sitemap\.xml|robots\.txt|google94bc4a68fc393c2a\.html|favicon\.ico|logo\.png|.*?\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|map))(?P<path>.*)$',
        serve_react_or_404,
        name='react-app',
    ),

    # 📁 Legacy Django Views (Faqat 'reverse' ishlashi uchun qoldirildi)
    path('courses/', include('courses.urls')),
    path('core/', include('core.urls')),
]

if settings.DEBUG:
    from core.media_view import protected_media
    
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', protected_media),
    ]
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    from core.media_view import protected_media
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', protected_media),
    ]