import os, re

def replace_in_file(path, pattern, replacement):
    with open(path, 'r') as f:
        content = f.read()
    content = re.sub(pattern, replacement, content)
    with open(path, 'w') as f:
        f.write(content)

# AIChatBot.jsx
replace_in_file('src/components/AIChatBot/AIChatBot.jsx', r'catch\s*\(\s*_\s*\)', 'catch')

# VideoPlayer.jsx
replace_in_file('src/components/VideoPlayer/VideoPlayer.jsx', r'const\s+handleSeek\s*=\s*.*?;\n?', '')
replace_in_file('src/components/VideoPlayer/VideoPlayer.jsx', r'catch\s*\(\s*e\s*\)', 'catch')

# YouTubePlayer.jsx
replace_in_file('src/components/YouTubePlayer/YouTubePlayer.jsx', r'const\s+startTracking\s*=\s*.*?;\n?', '')
replace_in_file('src/components/YouTubePlayer/YouTubePlayer.jsx', r'catch\s*\(\s*e\s*\)', 'catch')

# AboutPage.jsx
replace_in_file('src/pages/AboutPage/AboutPage.jsx', r'const\s*\[\s*loading\s*,\s*setLoading\s*\]\s*=\s*useState\(true\);?\n?', '')

# AnnouncementsPage.jsx, ArticleDetailPage.jsx, ArticlesPage.jsx, BookReviewsPage.jsx
for page in ['AnnouncementsPage/AnnouncementsPage.jsx', 'ArticleDetailPage/ArticleDetailPage.jsx', 'ArticlesPage/ArticlesPage.jsx', 'BookReviewsPage/BookReviewsPage.jsx']:
    replace_in_file(f'src/pages/{page}', r'catch\s*\(\s*err\s*\)', 'catch')

# CreateLessonPage.jsx
replace_in_file('src/pages/CreateLessonPage/CreateLessonPage.jsx', r'const\s+addQuestion\s*=\s*[\s\S]*?(?=const\s+removeQuestion)', '')
replace_in_file('src/pages/CreateLessonPage/CreateLessonPage.jsx', r'const\s+removeQuestion\s*=\s*[\s\S]*?(?=const\s+updateQuestion)', '')
replace_in_file('src/pages/CreateLessonPage/CreateLessonPage.jsx', r'const\s+updateQuestion\s*=\s*[\s\S]*?(?=const\s+handleSubmit)', '')

# ProfilePage.jsx
replace_in_file('src/pages/ProfilePage/ProfilePage.jsx', r'const\s*\[\s*editMode\s*,\s*setEditMode\s*\]\s*=\s*useState\(false\);?\n?', '')
replace_in_file('src/pages/ProfilePage/ProfilePage.jsx', r'const\s+handleChangePassword\s*=\s*[\s\S]*?(?=const\s+handleFileChange)', '')
replace_in_file('src/pages/ProfilePage/ProfilePage.jsx', r'catch\s*\(\s*error\s*\)', 'catch')

# SignupPage.jsx
replace_in_file('src/pages/SignupPage/SignupPage.jsx', r'const\s+navigate\s*=\s*useNavigate\(\);\n?', '')

# CourseDetailPage.jsx - fix warnings
replace_in_file('src/pages/CourseDetailPage/CourseDetailPage.jsx', r'\}, \[\s*id,\s*quizAutoOpened\s*\]\);\s*//.*', '}, [id]);')
replace_in_file('src/pages/CourseDetailPage/CourseDetailPage.jsx', r'\}, \[\s*course\?\.id.*\]\);', '}, [course, handleVideoProgress, isAuthenticated]);')

# CoursesPage.jsx - fix warnings
replace_in_file('src/pages/CoursesPage/CoursesPage.jsx', r'\}, \[\s*category,\s*level\s*\]\);', '}, [category, level, searchParams]);')
replace_in_file('src/pages/CoursesPage/CoursesPage.jsx', r'\}, \[\s*categories\s*\]\);', '}, [categories, selectedCategory, selectedSubCategory]);')

# sw.js
replace_in_file('public/sw.js', r'clients\.claim\(\);', 'self.clients.claim();')
replace_in_file('public/sw.js', r'clients\.matchAll\(', 'self.clients.matchAll(')

