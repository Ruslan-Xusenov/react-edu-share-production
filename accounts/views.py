from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_POST, require_GET
from django.http import JsonResponse
from django.utils.html import escape
import json
import re
import logging
from .models import CustomUser
from .forms import ProfileForm

logger = logging.getLogger(__name__)

# ================================================================
# Input Validation Helpers
# ================================================================

def _validate_email(email):
    """Email formatini tekshirish"""
    if not email or not isinstance(email, str):
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email)) and len(email) <= 254

def _validate_password(password):
    """Parol kuchliligini tekshirish"""
    if not password or not isinstance(password, str):
        return False, "Parol bo'sh bo'lishi mumkin emas."
    if len(password) < 8:
        return False, "Parol kamida 8 ta belgidan iborat bo'lishi kerak."
    if len(password) > 128:
        return False, "Parol juda uzun."
    if not re.search(r'[A-Za-z]', password):
        return False, "Parolda kamida bitta harf bo'lishi kerak."
    if not re.search(r'\d', password):
        return False, "Parolda kamida bitta raqam bo'lishi kerak."
    return True, ""

def _sanitize_text(text, max_length=500):
    """Matnni sanitizatsiya qilish"""
    if not text or not isinstance(text, str):
        return ""
    text = text.strip()
    text = escape(text)
    return text[:max_length]

def _safe_json_parse(request):
    """JSON bodyni xavfsiz parse qilish"""
    try:
        if not request.body:
            return None, "So'rov tanasi bo'sh."
        if len(request.body) > 10240:  # 10KB max for JSON body
            return None, "So'rov tanasi juda katta."
        return json.loads(request.body), None
    except json.JSONDecodeError:
        return None, "Noto'g'ri JSON format."


# ================================================================
# Template Views
# ================================================================

@login_required
def profile(request):
    user = request.user
    context = {
        'user': user,
    }
    return render(request, 'accounts/profile.html', context)


@login_required
def edit_profile(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('accounts:profile')
    else:
        form = ProfileForm(instance=request.user)
    
    context = {
        'form': form,
    }
    return render(request, 'accounts/edit_profile.html', context)


# ================================================================
# API Views — @csrf_exempt faqat SPA frontend uchun kerak
# Shuning uchun session authentication + CORS himoyalaydi
# ================================================================

@csrf_exempt
def api_profile(request):
    if request.method != 'GET':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Not authenticated'}, status=401)
    user = request.user
    avatar_url = user.avatar.url if user.avatar else f"https://ui-avatars.com/api/?name={user.full_name}&background=f3f4f6&color=6366f1"
    if user.avatar:
        avatar_url = request.build_absolute_uri(user.avatar.url)

    return JsonResponse({
        'status': 'success',
        'user': {
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'username': user.username,
            'points': user.points,
            'is_staff': user.is_staff,
            'bio': user.bio,
            'school': user.school,
            'grade': user.grade,
            'phone_number': user.phone_number,
            'interests': user.interests,
            'avatar': avatar_url,
            'date_joined': user.date_joined.strftime('%B %Y'),
            'certificates_count': user.get_completed_courses_count(),
            'lessons_count': user.get_created_lessons_count(),
        }
    })


@csrf_exempt
def api_leaderboard(request):
    if request.method != 'GET':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)
    top_users = CustomUser.objects.filter(is_superuser=False).order_by('-points')[:10]
    users_data = []
    for user in top_users:
        users_data.append({
            'id': user.id,
            'full_name': user.full_name,
            'username': user.username,
            'points': user.points,
            'avatar': user.avatar.url if user.avatar else None,
        })
    return JsonResponse({
        'status': 'success',
        'results': users_data
    })


def user_profile(request, user_id):
    user = get_object_or_404(CustomUser, id=user_id)
    context = {
        'profile_user': user,
    }
    return render(request, 'accounts/profile.html', context)


from django.contrib.auth import authenticate, login

@csrf_exempt
def api_login(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)
    
    try:
        data, error = _safe_json_parse(request)
        if error:
            return JsonResponse({'status': 'error', 'message': error}, status=400)
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Input validation
        if not email or not password:
            return JsonResponse({'status': 'error', 'message': 'Email va parol kiritilishi shart.'}, status=400)
        
        if not _validate_email(email):
            return JsonResponse({'status': 'error', 'message': "Noto'g'ri email format."}, status=400)
        
        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)
            logger.info(f"User logged in: {user.email} from IP: {_get_client_ip(request)}")
            return JsonResponse({
                'status': 'success', 
                'user': {
                    'id': user.id,
                    'email': user.email, 
                    'full_name': user.full_name,
                    'username': user.username,
                    'is_staff': user.is_superuser
                }
            })
        
        # Login xatosi — hujumchiga qaysi field xato ekanini aytmaslik
        logger.warning(f"Failed login attempt for: {email} from IP: {_get_client_ip(request)}")
        return JsonResponse({'status': 'error', 'message': "Email yoki parol noto'g'ri."}, status=400)
    
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return JsonResponse({'status': 'error', 'message': "Ichki xatolik. Qayta urinib ko'ring."}, status=500)

@csrf_exempt
def api_signup(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)
    
    try:
        data, error = _safe_json_parse(request)
        if error:
            return JsonResponse({'status': 'error', 'message': error}, status=400)
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        full_name = _sanitize_text(data.get('full_name', ''), max_length=150)
        
        # Email validation
        if not _validate_email(email):
            return JsonResponse({'status': 'error', 'message': "Noto'g'ri email format."}, status=400)
        
        # Password validation
        is_valid, pwd_error = _validate_password(password)
        if not is_valid:
            return JsonResponse({'status': 'error', 'message': pwd_error}, status=400)
        
        # Username generation (sanitized)
        username = data.get('username', '')
        if not username and email:
            username = re.sub(r'[^a-zA-Z0-9_]', '', email.split('@')[0])
        username = re.sub(r'[^a-zA-Z0-9_]', '', username)[:30]
        
        if not username:
            username = 'user'
        
        import random
        base_username = username
        while CustomUser.objects.filter(username=username).exists():
            username = f"{base_username}{random.randint(100, 9999)}"

        if not full_name:
            full_name = username
        
        if CustomUser.objects.filter(email=email).exists():
            return JsonResponse({'status': 'error', 'message': 'Bu email allaqachon ro\'yxatdan o\'tgan.'}, status=400)
        
        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            full_name=full_name
        )
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        
        logger.info(f"New user registered: {user.email} from IP: {_get_client_ip(request)}")
        
        return JsonResponse({
            'status': 'success',
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'username': user.username,
                'is_staff': user.is_superuser
            }
        })
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        return JsonResponse({'status': 'error', 'message': "Ro'yxatdan o'tishda xatolik. Qayta urinib ko'ring."}, status=500)

@csrf_exempt
def api_update_profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Not authenticated'}, status=401)
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)
    
    try:
        user = request.user
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            data = request.POST
            if 'avatar' in request.FILES:
                avatar_file = request.FILES['avatar']
                if avatar_file.size > 5 * 1024 * 1024:
                    return JsonResponse({'status': 'error', 'message': "Rasm hajmi 5MB dan kichik bo'lishi kerak."}, status=400)
                allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                if avatar_file.content_type not in allowed_types:
                    return JsonResponse({'status': 'error', 'message': "Faqat JPG, PNG, GIF, WEBP rasmlar."}, status=400)
                import os
                ext = os.path.splitext(avatar_file.name)[1].lower()
                if ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                    return JsonResponse({'status': 'error', 'message': "Noto'g'ri fayl formati."}, status=400)
                user.avatar = avatar_file
        else:
            data, error = _safe_json_parse(request)
            if error:
                return JsonResponse({'status': 'error', 'message': error}, status=400)
        
        if 'full_name' in data:
            user.full_name = _sanitize_text(data['full_name'], max_length=150)
        if 'school' in data:
            user.school = _sanitize_text(data['school'], max_length=200)
        if 'grade' in data:
            user.grade = _sanitize_text(data['grade'], max_length=50)
        if 'phone_number' in data:
            phone = data['phone_number'].strip()
            if phone and not re.match(r'^\+?[\d\s\-()]{7,20}$', phone):
                return JsonResponse({'status': 'error', 'message': "Noto'g'ri telefon raqam formati."}, status=400)
            user.phone_number = phone[:20]
        if 'bio' in data:
            user.bio = _sanitize_text(data['bio'], max_length=1000)
            
        user.save()
        
        avatar_url = user.avatar.url if user.avatar else None
        if user.avatar:
            avatar_url = request.build_absolute_uri(user.avatar.url)

        return JsonResponse({
            'status': 'success', 
            'message': 'Profile updated successfully',
            'avatar_url': avatar_url
        })
    except Exception as e:
        logger.error(f"Profile update error for user {request.user.id}: {str(e)}")
        return JsonResponse({'status': 'error', 'message': "Profilni yangilashda xatolik."}, status=500)

@csrf_exempt
def api_change_password(request):
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Not authenticated'}, status=401)
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)
    
    try:
        data, error = _safe_json_parse(request)
        if error:
            return JsonResponse({'status': 'error', 'message': error}, status=400)
        
        user = request.user
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        
        if not old_password or not new_password:
            return JsonResponse({'status': 'error', 'message': "Eski va yangi parol kiritilishi shart."}, status=400)
        
        if not user.check_password(old_password):
            logger.warning(f"Failed password change attempt for user {user.email} from IP: {_get_client_ip(request)}")
            return JsonResponse({'status': 'error', 'message': "Eski parol noto'g'ri."}, status=400)
        
        is_valid, pwd_error = _validate_password(new_password)
        if not is_valid:
            return JsonResponse({'status': 'error', 'message': pwd_error}, status=400)
        
        if old_password == new_password:
            return JsonResponse({'status': 'error', 'message': "Yangi parol eskisidan farq qilishi kerak."}, status=400)
        
        user.set_password(new_password)
        user.save()
        from django.contrib.auth import update_session_auth_hash
        update_session_auth_hash(request, user)
        
        logger.info(f"Password changed for user {user.email}")
        return JsonResponse({'status': 'success', 'message': 'Parol muvaffaqiyatli o\'zgartirildi.'})
    except Exception as e:
        logger.error(f"Password change error for user {request.user.id}: {str(e)}")
        return JsonResponse({'status': 'error', 'message': "Parolni o'zgartirishda xatolik."}, status=500)

@csrf_exempt
def api_logout(request):
    from django.contrib.auth import logout
    logout(request)
    return JsonResponse({'status': 'success'})


def _get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '0.0.0.0')