import logging
from celery import shared_task
from .models import Lesson
from .hls_converter import convert_to_hls

logger = logging.getLogger(__name__)

@shared_task
def convert_video_to_hls_task(lesson_id, input_video_path):
    """
    Celery orqali asinxron ravishda video faylni HLS formatiga o'tkazish.
    """
    logger.info(f"🎬 [Celery] HLS konvertatsiya boshlandi: lesson_id={lesson_id}")
    try:
        Lesson.objects.filter(id=lesson_id).update(hls_status='processing')
    except Exception as e:
        logger.error(f"[Celery] Lesson statusini o'zgartirishda xato: {e}")
        pass

    result = convert_to_hls(lesson_id, input_video_path)
    logger.info(f"🏁 [Celery] HLS konvertatsiya tugadi: lesson_id={lesson_id}, success={result}")
    return result
