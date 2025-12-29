// File: js/gsap-init-portfolio.js
window.smootherPortfolio = null; // Используем другое имя, чтобы не конфликтовать с window.smoother главной страницы, если скрипты как-то пересекутся (маловероятно, но для чистоты)
let gsapPortfolioReady = false;

function initializePortfolioGsap() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error("Portfolio Page: GSAP or ScrollTrigger not loaded!");
        return false;
    }
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    if (!ScrollTrigger.isTouch && typeof ScrollSmoother !== 'undefined') {
        console.log("Portfolio Page: ScrollSmoother initializing...");
        window.smootherPortfolio = ScrollSmoother.create({
            wrapper: '.wrapper', // Используем те же классы оберток
            content: '.content',
            smooth: 1.5,       // Настрой плавность по желанию
            effects: true,     // Если будешь использовать data-speed/data-lag на этой странице
        });
        console.log("Portfolio Page: ScrollSmoother initialized.", window.smootherPortfolio);
    } else {
        if (ScrollTrigger.isTouch) {
            console.log("Portfolio Page: ScrollSmoother disabled (touch device).");
        }
        if (typeof ScrollSmoother === 'undefined') {
            console.log("Portfolio Page: ScrollSmoother disabled (library not found).");
        }
    }
    return true;
}

gsapPortfolioReady = initializePortfolioGsap();

// Вызываем ScrollTrigger.refresh() после полной загрузки всех ресурсов окна
// Это важно для правильного расчета высоты страницы, особенно с изображениями
window.addEventListener('load', () => {
    if (gsapPortfolioReady && typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
        gsap.delayedCall(0.3, () => { // Небольшая задержка для надежности
            console.log("Portfolio Page: Executing ScrollTrigger.refresh(true) on window load.");
            ScrollTrigger.refresh(true);
        });
    }
});

// Если ты захочешь добавить анимацию появления секций на этой странице:
// 1. Раскомментируй подключение section-animations.js в HTML.
// 2. Убери DOMContentLoaded из section-animations.js (оставь только функцию setupSectionAnimations).
// 3. Добавь вызов setupSectionAnimations() здесь, внутри DOMContentLoaded, если нужно,
//    или после инициализации ScrollSmoother, если анимации должны с ним взаимодействовать.
/*
document.addEventListener('DOMContentLoaded', () => {
    if (gsapPortfolioReady && typeof setupSectionAnimations === 'function') {
        setupSectionAnimations();
    }
});
*/