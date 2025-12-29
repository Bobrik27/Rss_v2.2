// File: js/smooth-scroll.js
function setupSmoothScroll() {
    const allAnchorLinks = document.querySelectorAll('a[href^="#"]');
    const mainNavElement = document.querySelector('.main-nav');
    const portfolioNavElement = document.querySelector('.portfolio-page-header');
    const automationsNavElement = document.querySelector('.automation-page-header');

    if (allAnchorLinks.length === 0) { /* ... */ return; }


    allAnchorLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            const linkHref = this.getAttribute('href');

            // <<< НОВАЯ ПРОВЕРКА ПО КЛАССУ >>>
            // Если ссылка имеет класс 'js-no-smooth-scroll', игнорируем ее здесь
            if (this.classList.contains('js-no-smooth-scroll')) {
                // Важно: не вызываем event.preventDefault() здесь,
                // так как это должно быть сделано в about-me-functionality.js
                return;
            }

            // Проверка event.defaultPrevented все еще может быть полезна для других случаев,
            // но для ссылок "Обо мне" мы полагаемся на класс.
            if (event.defaultPrevented) {
                return;
            }

            if (!linkHref || linkHref === "#" || linkHref.length < 2) {
                return;
            }

            event.preventDefault(); // Предотвращаем, только если будем обрабатывать

            try {
                const targetElement = document.querySelector(linkHref);
                if (!targetElement) { /* ... */ return; }

                let activeSmoother = null;
                let activeHeaderElement = null;
                // ... (остальная логика определения activeSmoother и activeHeaderElement как была) ...
                if (window.smoother) {
                    activeSmoother = window.smoother;
                    activeHeaderElement = mainNavElement;
                } else if (window.smootherPortfolio) {
                    activeSmoother = window.smootherPortfolio;
                    activeHeaderElement = portfolioNavElement;
                } else if (window.smootherAutomations) { // <<< НОВАЯ ПРОВЕРКА
                    activeSmoother = window.smootherAutomations;
                    activeHeaderElement = automationsNavElement;
                }

                let headerOffset = 0;
                if (activeHeaderElement && typeof activeHeaderElement.offsetHeight === 'number') {
                    headerOffset = activeHeaderElement.offsetHeight;
                }

                if (activeSmoother) {
                    activeSmoother.scrollTo(targetElement, {
                        smooth: true,
                        offsetY: headerOffset
                    });
                } else {
                    // Fallback
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            } catch (e) {
                console.error(`Smooth Scroll: Error processing anchor "${linkHref}".`, e);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Smooth Scroll: DOMContentLoaded, setting up smooth scroll behavior.");
    setupSmoothScroll();
});