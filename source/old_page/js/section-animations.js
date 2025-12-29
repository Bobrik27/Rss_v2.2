// js/section-animations.js

/**
 * Adds a simple fade-in-up animation ONCE to sections with the
 * 'animated-section' class when they enter the viewport using onToggle.
 */
function setupSectionAnimations() {
    const sections = gsap.utils.toArray('.animated-section');

    if (sections.length === 0) {
        console.log("Section Animations: No sections with .animated-section found.");
        return;
    }

    console.log(`Section Animations: Found ${sections.length} sections to animate.`);

    sections.forEach((section, index) => {
        const sectionId = section.id || `section-${index}`;
        console.log(`Section Animations: Setting up trigger for ${sectionId}`);

        ScrollTrigger.create({
            trigger: section,
            start: "top 85%",
            // end: "bottom top", // End не так важен для once-эффекта
            //markers: true, // Оставляем для проверки

            // Используем onEnter вместо onToggle для однократного срабатывания
            onEnter: (self) => {
                console.log(`Section Animations: onEnter triggered for ${sectionId}. Adding 'is-visible'.`);
                // Добавляем класс один раз
                section.classList.add('is-visible');
                // Отключаем триггер после первого срабатывания, чтобы он больше не работал
                self.disable();
                console.log(`   - Trigger disabled for ${sectionId}.`);
            },
            // Убираем onToggle
            // onToggle: (self) => { ... },
        });
    });
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        console.log("Section Animations: DOM ready, GSAP found. Setting up directly.");
        setupSectionAnimations(); // Вызываем напрямую, без setTimeout
    } else {
        console.error('Section Animations: GSAP or ScrollTrigger not ready on DOMContentLoaded.');
    }
});