// js/mobile-menu.js

/**
 * Handles the functionality of the mobile navigation toggle (hamburger menu).
 */
function setupMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navWrapper = document.querySelector('.nav-links-wrapper');
    const navLinks = document.querySelectorAll('.nav-links-wrapper a[href^="#"]'); // Ссылки внутри меню

    // Проверяем наличие кнопки и обертки меню
    if (!navToggle || !navWrapper) {
        console.warn('Mobile navigation toggle or wrapper not found.');
        return;
    }

    // Функция для переключения состояния меню
    function toggleMenu() {
        const isOpened = navToggle.getAttribute('aria-expanded') === 'true';
        document.body.classList.toggle('nav-open'); // Переключаем класс на body
        navToggle.setAttribute('aria-expanded', !isOpened); // Обновляем ARIA атрибут

        // Опционально: Ловушка фокуса внутри открытого меню (для доступности)
        // Эта часть более сложная, можно добавить позже если нужно
        // if (!isOpened) { // Если меню открывается
        //     // Установить фокус на первый элемент меню
        // } else { // Если меню закрывается
        //     // Вернуть фокус на кнопку гамбургера
        //     navToggle.focus();
        // }
    }

    // Переключение меню по клику на кнопку гамбургера
    navToggle.addEventListener('click', toggleMenu);

    // Закрытие меню при клике на ссылку внутри него
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Проверяем, открыто ли меню перед закрытием
            if (document.body.classList.contains('nav-open')) {
                toggleMenu(); // Закрываем меню
                // Важно: Плавный скролл к якорю будет обработан скриптом smooth-scroll.js
                // Нам здесь не нужно вызывать scrollTo снова.
            }
        });
    });

    // Опционально: Закрытие меню по клику вне его области (на оверлей)
    navWrapper.addEventListener('click', (event) => {
        // Закрываем, только если клик был непосредственно по обертке (оверлею),
        // а не по её содержимому (например, ссылкам)
        if (event.target === navWrapper) {
            if (document.body.classList.contains('nav-open')) {
                toggleMenu();
            }
        }
    });

    // Опционально: Закрытие меню по нажатию клавиши Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
            toggleMenu();
        }
    });


}

// --- Initialize ---
// Инициализируем после загрузки DOM, т.к. работаем с элементами страницы
document.addEventListener('DOMContentLoaded', setupMobileMenu);