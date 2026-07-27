import os

def fix_file(path, replacements):
    with open(path, 'r') as f:
        c = f.read()
    for old, new in replacements:
        c = c.replace(old, new)
    with open(path, 'w') as f:
        f.write(c)

fix_file('src/components/AIChatBot/AIChatBot.jsx', [('catch (_)', 'catch')])
fix_file('src/components/VideoPlayer/VideoPlayer.jsx', [('catch (e)', 'catch')])
fix_file('src/components/YouTubePlayer/YouTubePlayer.jsx', [('catch (e)', 'catch')])
fix_file('src/pages/AnnouncementsPage/AnnouncementsPage.jsx', [('catch (err)', 'catch')])
fix_file('src/pages/ArticleDetailPage/ArticleDetailPage.jsx', [('catch (err)', 'catch')])
fix_file('src/pages/ArticlesPage/ArticlesPage.jsx', [('catch (err)', 'catch')])
fix_file('src/pages/BookReviewsPage/BookReviewsPage.jsx', [('catch (err)', 'catch')])
fix_file('src/pages/ProfilePage/ProfilePage.jsx', [('catch (error)', 'catch')])

fix_file('src/pages/AboutPage/AboutPage.jsx', [('const [loading, setLoading] = useState(true);', '')])
fix_file('src/pages/SignupPage/SignupPage.jsx', [('const navigate = useNavigate();', '')])

# CourseDetailPage
c_rep = [
    ('}, [course?.id, course?.video_url, course?.video_file_url, course?.thumbnail_url, handleVideoProgress, isAuthenticated]);', '}, [course, handleVideoProgress, isAuthenticated]);'),
    ('<meta name="keywords" content={`${course.title}, bepul dars, EduShare, onlayn o\'rganish, ${course.category?.display_name || "ta\'lim"}`} />', '<meta name="keywords" content={`${course.title}, bepul dars O\'zbekiston, onlayn kurslar Toshkent, IT kurslari bepul o\'rganish, dasturlashni noldan o\'rganish, EduShare, onlayn o\'rganish, bepul sertifikat, ${course.category?.display_name || "ta\'lim"} kurslari`} />')
]
fix_file('src/pages/CourseDetailPage/CourseDetailPage.jsx', c_rep)

# CoursesPage
c_rep2 = [
    ('}, [category, level]);', '}, [category, level, searchParams]);'),
    ('}, [categories]);', '}, [categories, selectedCategory, selectedSubCategory]);')
]
fix_file('src/pages/CoursesPage/CoursesPage.jsx', c_rep2)

# PWA
pwa_rep = [
    ('const [isIOS, setIsIOS] = useState(false);', ''),
    ('const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;', 'const isIOSDevice = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;'),
    ('setIsIOS(isIOSDevice);', ''),
    ('const [isInstalled, setIsInstalled] = useState', 'const [isInstalled] = useState'),
    ('{isIOS ?', '{isIOSDevice ?'),
    ('!isIOS &&', '!isIOSDevice &&'),
    ('}, []);', '}, [isInstalled, isIOSDevice]);')
]
fix_file('src/components/PWAInstallBanner/PWAInstallBanner.jsx', pwa_rep)

# Splash
sp_rep = [
    ('Math.random()', '0.5')
]
fix_file('src/components/SplashScreen/SplashScreen.jsx', sp_rep)

