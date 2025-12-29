// File: js/gsap-init.js
window.smoother = null;
let gsapReady = false;

function initializeCoreGsap() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error("GSAP или ScrollTrigger не подключены! Анимации не будут работать.");
        return false;
    }
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    if (!ScrollTrigger.isTouch && typeof ScrollSmoother !== 'undefined') {
        console.log("ScrollSmoother initializing...");
        window.smoother = ScrollSmoother.create({
            wrapper: '.wrapper',
            content: '.content',
            smooth: 1.5,
            effects: true,
            smoothTouch: 0.1,
        });
        console.log("ScrollSmoother initialized:", window.smoother);
    } else {
        if (ScrollTrigger.isTouch) {
            console.log("ScrollSmoother disabled: Touch device.");
        }
        if (typeof ScrollSmoother === 'undefined') {
            console.log("ScrollSmoother disabled: ScrollSmoother library not found/loaded.");
        }
    }
    return true;
}

gsapReady = initializeCoreGsap();

// --- SCROLLTRIGGER DEBUG EVENT LISTENERS ---
if (gsapReady && typeof ScrollTrigger !== 'undefined') {
    console.log("Setting up ScrollTrigger event listeners for debugging refresh.");
    ScrollTrigger.addEventListener("refreshInit", (self) => {
        console.groupCollapsed(`ScrollTrigger Event: refreshInit (triggered by: ${self ? 'specific ST instance' : 'global/smoother'})`);
        console.log("Document scrollHeight BEFORE refresh logic:", document.documentElement.scrollHeight);
        console.log("Body scrollHeight BEFORE refresh logic:", document.body.scrollHeight);
        const contentEl = document.querySelector('.content');
        if (contentEl) console.log("Content element (.content) scrollHeight BEFORE refresh logic:", contentEl.scrollHeight);
        console.groupEnd();
    });

    ScrollTrigger.addEventListener("refresh", (self) => {
        console.groupCollapsed(`ScrollTrigger Event: refresh (triggered by: ${self ? 'specific ST instance' : 'global/smoother'})`);
        console.log("Document scrollHeight AFTER refresh logic:", document.documentElement.scrollHeight);
        console.log("Body scrollHeight AFTER refresh logic:", document.body.scrollHeight);
        const contentEl = document.querySelector('.content');
        if (contentEl) console.log("Content element (.content) scrollHeight AFTER refresh logic:", contentEl.scrollHeight);
        if (window.smoother) {
            console.log("Smoother's content element scrollHeight:", window.smoother.content().scrollHeight);
            console.log("Smoother's wrapper element scrollHeight:", window.smoother.wrapper().scrollHeight);
            console.log("Smoother's current scrollTop:", window.smoother.scrollTop());
        }
        console.groupEnd();
    });
}
// --- END SCROLLTRIGGER DEBUG EVENT LISTENERS ---


document.addEventListener('DOMContentLoaded', () => {
    if (!gsapReady) {
        console.warn("GSAP not ready, aborting further animation setup in DOMContentLoaded.");
        return;
    }

    console.log("DOMContentLoaded: Initializing ALL GSAP-based animations and setups...");

    // --- HERO SECTION SPECIFIC ANIMATIONS ---
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        console.log("Hero section found. Initializing its animations...");
        const parallaxFactors = { far: -20, mid: -45, near: -75, logo: -60, titleContainer: -120, subtitle: -100 };
        const scrubFactors = { backgrounds: 1.5, content: 1 };
        const entranceConfig = { delayBase: 0.2, logoDelay: 0.1, titleLettersDelay: 0.4, subtitleDelayOffset: 0.3, layersBaseEntranceDelay: 0.1, durationMain: 1.1, staggerLayers: 0.15, cornerAccentContainerDelay: 0.6, cornerAccentInnerElementsDelay: 0.5, cornerImpulseAnimationDelay: 0.8 };

        gsap.to(".layer-far", { yPercent: parallaxFactors.far, ease: "none", scrollTrigger: { trigger: heroSection, start: "top top", end: "bottom top", scrub: scrubFactors.backgrounds } });
        gsap.to(".layer-mid", { yPercent: parallaxFactors.mid, ease: "none", scrollTrigger: { trigger: heroSection, start: "top top", end: "bottom top", scrub: scrubFactors.backgrounds } });
        gsap.to(".layer-near", { yPercent: parallaxFactors.near, ease: "none", scrollTrigger: { trigger: heroSection, start: "top top", end: "bottom top", scrub: scrubFactors.backgrounds - 0.3 } });
        gsap.from(".parallax-layer", { y: 30, opacity: 0, duration: entranceConfig.durationMain, stagger: entranceConfig.staggerLayers, ease: "power2.out", delay: entranceConfig.delayBase + entranceConfig.layersBaseEntranceDelay });
        gsap.to(".layer__header", { yPercent: parallaxFactors.titleContainer, ease: "none", scrollTrigger: { trigger: heroSection, start: "top top", end: "bottom top", scrub: scrubFactors.content } });

        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) {
            gsap.to(heroSubtitle, { yPercent: parallaxFactors.subtitle, ease: "none", scrollTrigger: { trigger: heroSection, start: "top top", end: "bottom top", scrub: scrubFactors.content } });
            gsap.from(heroSubtitle, { opacity: 0, y: 20, duration: entranceConfig.durationMain - 0.3, ease: "power2.out", delay: entranceConfig.delayBase + entranceConfig.titleLettersDelay + entranceConfig.subtitleDelayOffset });
        }
        // console.log("Main Hero layers, title container, subtitle parallax/entrance initialized."); // Можно будет убрать

        if (typeof setupInteractiveNetwork === 'function' && typeof updateNetwork === 'function' && typeof spawnRandomLine === 'function') {
            const networkInitialized = setupInteractiveNetwork('interactiveNetworkCanvas', {});
            if (networkInitialized) {
                gsap.ticker.add(updateNetwork);
                gsap.to({}, { duration: 0.7, repeat: -1, onRepeat: spawnRandomLine, delay: 2 });
                // console.log("Interactive Network setup SUCCESSFUL and ticker started."); // Можно будет убрать
            } else { console.error("Interactive Network setup FAILED."); }
        } else { console.warn("Interactive Network functions not defined."); }

        const cornerAccents = document.querySelectorAll('.hero-content .corner-accent');
        if (cornerAccents.length > 0) {
            // !!!!! ВСТАВЬ СЮДА СВОЙ ПОЛНЫЙ КОД АНИМАЦИИ ДЛЯ .cornerAccents !!!!!
            // Примерный каркас из твоего предыдущего кода:
            const overallCornerDelayStart = entranceConfig.delayBase + entranceConfig.titleLettersDelay + entranceConfig.subtitleDelayOffset + entranceConfig.cornerAccentContainerDelay;
            gsap.fromTo(cornerAccents, {
                scale: 0.5, opacity: 0,
                x: (index, target) => target.classList.contains('corner-bottom-left') ? -20 : 20,
                y: (index, target) => target.classList.contains('corner-top-right') ? -20 : 20,
            }, {
                opacity: 1, scale: 1, x: 0, y: 0, duration: 1.0, ease: "power2.out", stagger: 0.2,
                delay: overallCornerDelayStart
            });
            cornerAccents.forEach((corner, cornerContainerIndex) => {
                // ... и так далее, вся твоя логика для .ca-point, .ca-line, импульсов ...
            });
            console.log(`${cornerAccents.length} corner accents processed (assuming animation code is present).`);
        } else { console.warn("No .corner-accent elements found for animation."); }

        const decoShapes = document.querySelectorAll('.hero-deco-shape');
        if (decoShapes.length > 0) {
            // !!!!! ВСТАВЬ СЮДА СВОЙ ПОЛНЫЙ КОД АНИМАЦИИ ДЛЯ .decoShapes !!!!!
            console.log(`${decoShapes.length} decorative shapes processed (assuming animation code is present).`);
        } else { console.warn("No .hero-deco-shape elements found."); }
    } else {
        console.warn("Hero section not found. Skipping Hero animations.");
    }

    // --- CENTRALIZED CALLS TO SETUP FUNCTIONS FROM OTHER FILES ---
    if (typeof setupHeroTitleAnimations === 'function') {
        // console.log("Calling setupHeroTitleAnimations()..."); // Можно будет убрать
        setupHeroTitleAnimations();
    } else { console.warn("setupHeroTitleAnimations function not found."); }

    if (typeof setupHeroBlobAnimation === 'function') {
        // console.log("Calling setupHeroBlobAnimation()..."); // Можно будет убрать
        setupHeroBlobAnimation();
    } else { /* console.warn("setupHeroBlobAnimation function not found."); */ } // Можно закомментировать, если его нет

    if (typeof setupPortfolioAnimations === 'function') {
        // console.log("Calling setupPortfolioAnimations()..."); // Можно будет убрать
        setupPortfolioAnimations();
    } else { console.warn("setupPortfolioAnimations function not found."); }

    if (typeof setupSectionAnimations === 'function') {
        // console.log("Calling setupSectionAnimations()..."); // Можно будет убрать
        setupSectionAnimations();
    } else { console.warn("setupSectionAnimations function not found."); }

    if (typeof setupStickyHeader === 'function') {
        // console.log("Calling setupStickyHeader()..."); // Можно будет убрать
        setupStickyHeader();
    } else { console.warn("setupStickyHeader function not found."); }

    console.log("DOMContentLoaded: All GSAP-based setups and animations have been called.");

}); // КОНЕЦ DOMContentLoaded


// --- PRELOADER LOGIC (функция для скрытия) ---
function hidePreloader() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.classList.add('preloader--hidden');
        console.log("Preloader hidden.");
        // Дополнительный refresh после скрытия прелоадера, если он влияет на высоту
        if (window.smoother && typeof ScrollTrigger.refresh === 'function') {
            gsap.delayedCall(0.15, () => { // Очень короткая задержка
                ScrollTrigger.refresh(true);
                console.log("ScrollTrigger refreshed again after preloader hide.");
            });
        }
    }
}

// --- FINAL REFRESH ON WINDOW LOAD & PRELOADER HIDE ---
window.addEventListener('load', () => {
    console.log("Window 'load' event triggered.");
    if (gsapReady && typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
        // Финальный refresh перед скрытием прелоадера
        gsap.delayedCall(1.0, () => { // Та же задержка, что и раньше, или чуть меньше
            console.log("Executing FINAL ScrollTrigger.refresh(true) on window load (before preloader hide).");
            ScrollTrigger.refresh(true);

            // Скрываем прелоадер ПОСЛЕ этого финального refresh
            // Даем еще небольшую задержку, чтобы refresh точно отработал
            gsap.delayedCall(0.2, hidePreloader); // Например, 0.2с после refresh
        });
    } else {
        console.warn("Window 'load': GSAP/ScrollTrigger not ready for final refresh. Hiding preloader directly.");
        // Если GSAP не готов, но прелоадер есть, все равно пытаемся его скрыть,
        // чтобы пользователь не застрял на нем.
        hidePreloader();
    }
});