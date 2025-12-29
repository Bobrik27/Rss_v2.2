
/**
 * Initializes sticky behavior for the main navigation.
 * Adds/removes a class based on scroll position relative to the hero section.
 * @param {string} navSelector - Selector for the navigation element.
 * @param {string} triggerSelector - Selector for the element that triggers the sticky state (e.g., hero section).
 * @param {string} stickyClass - The class to toggle on the navigation element.
 */
export function initStickyHeader(navSelector = '.main-nav', triggerSelector = '.hero-section', stickyClass = 'is-sticky') {
    const navElement = document.querySelector(navSelector);
    const triggerElement = document.querySelector(triggerSelector);

    if (!navElement) {
        console.warn(`Sticky header: Navigation element ("${navSelector}") not found.`);
        return;
    }
    if (!triggerElement) {
        console.warn(`Sticky header: Trigger element ("${triggerSelector}") not found.`);
        return;
    }

    ScrollTrigger.create({
        trigger: triggerElement,
        // Когда НИЗ триггера (hero-section) достигает ВЕРХА вьюпорта
        start: "bottom top",
        // Можно добавить небольшой offset, если нужно прилипание чуть раньше/позже
        // start: "bottom top+=50", // Пример: прилипнет, когда 50px секции hero еще видны
        end: "max", // Триггер активен до конца страницы

        toggleClass: { // Удобный способ добавить/убрать класс
            targets: navElement,
            className: stickyClass
        },
        // markers: true, // Раскомментируйте для отладки
    });

    console.log("Sticky header initialized.");
}