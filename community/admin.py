from django.contrib import admin
from django.db import models
from django_ckeditor_5.widgets import CKEditor5Widget
from .models import BookReview, Article, Announcement

@admin.register(BookReview)
class BookReviewAdmin(admin.ModelAdmin):
    list_display = ['book_title', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['book_title', 'book_author', 'user__full_name', 'review_content']

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'is_published', 'views', 'created_at']
    list_filter = ['is_published', 'created_at']
    search_fields = ['title', 'content', 'author__full_name']
    prepopulated_fields = {'slug': ('title',)}
    formfield_overrides = {
        models.TextField: {'widget': CKEditor5Widget(config_name='extends')}
    }

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer', 'location', 'event_date', 'is_active', 'created_at']
    list_filter = ['is_active', 'location', 'event_date', 'created_at']
    search_fields = ['title', 'description', 'location', 'organizer__full_name']
