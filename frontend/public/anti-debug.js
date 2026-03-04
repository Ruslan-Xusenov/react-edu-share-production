/**
 * EduShare Anti-Debug Protection (Lightweight)
 * Faqat DevTools ochilganda ishlaydi — performance ta'sir qilmaydi
 */
(function () {
    'use strict';

    // F12, Ctrl+Shift+I, Ctrl+U bloklash
    document.addEventListener('keydown', function (e) {
        if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) { e.preventDefault(); return false; }
        if (e.ctrlKey && (e.keyCode === 85)) { e.preventDefault(); return false; }
    }, true);

    // Drag bloklash
    document.addEventListener('dragstart', function (e) { e.preventDefault(); }, true);
})();
