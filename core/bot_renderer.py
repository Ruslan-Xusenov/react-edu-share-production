"""
edushare.uz — Dynamic Rendering (Bot Prerender) Middleware
============================================================
Google va Yandex rasman tavsiya etgan yondashuv:
  - Oddiy foydalanuvchilar → React SPA (index.html)
  - Qidiruv botlari → Django'dan to'liq HTML kontent

Bu SSR migratsiyasisiz (Next.js'siz) indeksatsiya muammosini hal qiladi.
Manba: https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering
"""

import re
import logging
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.core.cache import cache

logger = logging.getLogger('django')

# ─── Qidiruv boti user-agent ro'yxati ────────────────────────────────────────
BOT_USER_AGENTS = re.compile(
    r'(googlebot|google-inspectiontool|bingbot|yandexbot|yandex|yahoo|duckduckbot'
    r'|baiduspider|sogou|exabot|facebot|ia_archiver|twitterbot|linkedinbot'
    r'|whatsapp|telegrambot|applebot|semrushbot|ahrefsbot|dotbot'
    r'|mj12bot|rogerbot|screaming.frog|sitebulb|lighthouse|chrome-lighthouse'
    r'|google-structured-data-testing|richsnippets|schemamarkup|facebookexternalhit)',
    re.IGNORECASE,
)

# ─── Bot uchun render qilinadigan URL patternlari ─────────────────────────────
BOT_ROUTES = [
    (re.compile(r'^/$'),                              'bot_home'),
    (re.compile(r'^/courses/?$'),                     'bot_courses'),
    (re.compile(r'^/courses/(\d+)/?$'),               'bot_course_detail'),
    (re.compile(r'^/about/?$'),                       'bot_about'),
    (re.compile(r'^/leaderboard/?$'),                 'bot_leaderboard'),
    (re.compile(r'^/community/news/?$'),              'bot_articles'),
    (re.compile(r'^/community/articles/([^/]+)/?$'), 'bot_article_detail'),
]

CACHE_TIMEOUT = 60 * 15  # 15 daqiqa


def is_bot(user_agent: str) -> bool:
    return bool(BOT_USER_AGENTS.search(user_agent or ''))


def render_bot_page(request, route_name, match):
    from courses.models import Lesson, Category
    from courses.models import Certificate
    from community.models import Article
    from accounts.models import CustomUser

    cache_key = f'bot_render_{request.path}'
    cached = cache.get(cache_key)
    if cached:
        return HttpResponse(cached, content_type='text/html; charset=utf-8')

    ctx = {'request': request, 'site_url': 'https://edushare.uz'}

    try:
        if route_name == 'bot_home':
            ctx.update({
                'categories':         Category.objects.all()[:8],
                'recent_lessons':     Lesson.objects.filter(is_published=True).order_by('-created_at')[:8],
                'popular_lessons':    Lesson.objects.filter(is_published=True).order_by('-views')[:6],
                'total_lessons':      Lesson.objects.filter(is_published=True).count(),
                'total_users':        CustomUser.objects.count(),
                'total_certificates': Certificate.objects.count(),
                'recent_articles':    Article.objects.filter(is_published=True).order_by('-created_at')[:3],
            })
            template = 'seo/bot_home.html'

        elif route_name == 'bot_courses':
            ctx.update({
                'lessons':    Lesson.objects.filter(is_published=True).select_related('category').order_by('-created_at')[:30],
                'categories': Category.objects.all(),
            })
            template = 'seo/bot_courses.html'

        elif route_name == 'bot_course_detail':
            lesson_id = match.group(1)
            try:
                lesson = Lesson.objects.select_related('category', 'instructor').get(
                    id=lesson_id, is_published=True
                )
                ctx['lesson'] = lesson
            except Lesson.DoesNotExist:
                return None
            template = 'seo/bot_course_detail.html'

        elif route_name == 'bot_about':
            ctx.update({
                'total_lessons':      Lesson.objects.filter(is_published=True).count(),
                'total_users':        CustomUser.objects.count(),
                'total_certificates': Certificate.objects.count(),
            })
            template = 'seo/bot_about.html'

        elif route_name == 'bot_leaderboard':
            ctx['top_users'] = CustomUser.objects.filter(
                is_superuser=False
            ).order_by('-points')[:20]
            template = 'seo/bot_leaderboard.html'

        elif route_name == 'bot_articles':
            ctx['articles'] = Article.objects.filter(
                is_published=True
            ).order_by('-created_at')[:20]
            template = 'seo/bot_articles.html'

        elif route_name == 'bot_article_detail':
            slug = match.group(1)
            try:
                article = Article.objects.select_related('author').get(
                    slug=slug, is_published=True
                )
                ctx['article'] = article
            except Article.DoesNotExist:
                return None
            template = 'seo/bot_article_detail.html'

        else:
            return None

        html = render_to_string(template, ctx, request=request)
        cache.set(cache_key, html, CACHE_TIMEOUT)
        return HttpResponse(html, content_type='text/html; charset=utf-8')

    except Exception as e:
        logger.error(f'[BotRenderer] Error rendering {route_name}: {e}')
        return None


class BotRenderMiddleware:
    """
    Dynamic Rendering Middleware.
    Bot aniqlansa → Django'dan to'liq HTML.
    Oddiy foydalanuvchi → React SPA.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        if request.method == 'GET' and is_bot(user_agent):
            path = request.path
            for pattern, route_name in BOT_ROUTES:
                m = pattern.match(path)
                if m:
                    logger.info(
                        f'[BotRenderer] Bot: UA="{user_agent[:60]}" → {route_name} ({path})'
                    )
                    response = render_bot_page(request, route_name, m)
                    if response:
                        response['X-Robots-Tag'] = 'index, follow'
                        return response
                    break

        return self.get_response(request)
