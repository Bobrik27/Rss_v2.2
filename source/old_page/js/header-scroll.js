// js/header-scroll.js

/**
 * Adds/removes a 'scrolled' class to the main navigation
 * based on the scroll position using GSAP ScrollTrigger.
 */
function setupStickyHeader() {
    const navElement = document.querySelector('.main-nav');

    if (!navElement) {
        console.warn('Main navigation element (.main-nav) not found.');
        return;
    }

    setTimeout(() => {
        if (!ScrollTrigger) {
            console.error('ScrollTrigger not available for sticky header.');
            return;
        }
        ScrollTrigger.create({
            trigger: document.body,
            // Calculate start position dynamically after potential layout shifts/font loading
            start: "top top-=" + (navElement.offsetHeight > 0 ? navElement.offsetHeight + 5 : 50), // Start slightly below the nav's bottom edge (with fallback)
            end: "+=1", // Minimal distance to trigger enter/leave
            // Add class when scrolling down past the start point
            onEnter: () => navElement.classList.add('main-nav--scrolled'),
            // Remove class when scrolling up past the start point
            onLeaveBack: () => navElement.classList.remove('main-nav--scrolled'),
            // markers: true // Uncomment for debugging trigger positions
        });
    }, 100); // Small delay of 100ms

}

// --- Initialize ---
// Wait for DOM ready and GSAP likely initialized
// document.addEventListener('DOMContentLoaded', setupStickyHeader);
// Alternative using gsap.delayedCall if preferred, ensuring GSAP context:
// gsap.delayedCall(0.1, setupStickyHeader); // Needs check if ScrollTrigger exists inside setupStickyHeader