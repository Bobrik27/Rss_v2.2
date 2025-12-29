// File: js/gsap-init-automations.js
window.smootherAutomations = null; // Используем уникальное имя для экземпляра ScrollSmoother
let gsapAutomationsReady = false;

function initializeAutomationsGsap() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error("Automations Page: GSAP or ScrollTrigger not loaded!");
        return false;
    }
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    if (!ScrollTrigger.isTouch && typeof ScrollSmoother !== 'undefined') {
        console.log("Automations Page: ScrollSmoother initializing...");
        window.smootherAutomations = ScrollSmoother.create({
            wrapper: '.wrapper',
            content: '.content',
            smooth: 1.5,
            effects: true, // Оставляем, если вдруг захочешь data-speed/lag
        });
        console.log("Automations Page: ScrollSmoother initialized.", window.smootherAutomations);
    } else {
        if (ScrollTrigger.isTouch) {
            console.log("Automations Page: ScrollSmoother disabled (touch device).");
        }
        if (typeof ScrollSmoother === 'undefined') {
            console.log("Automations Page: ScrollSmoother disabled (library not found).");
        }
    }
    return true;
}

gsapAutomationsReady = initializeAutomationsGsap();

window.addEventListener('load', () => {
    if (gsapAutomationsReady && typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
        gsap.delayedCall(0.3, () => { // Та же задержка, что и на других страницах
            console.log("Automations Page: Executing ScrollTrigger.refresh(true) on window load.");
            ScrollTrigger.refresh(true);
        });
    }
});

// Сюда можно будет добавить вызов функций для анимации появления карточек, если понадобится
/*
document.addEventListener('DOMContentLoaded', () => {
    if (gsapAutomationsReady && typeof setupYourCardEntranceAnimations === 'function') {
        setupYourCardEntranceAnimations(); // Пример
    }
});
*/