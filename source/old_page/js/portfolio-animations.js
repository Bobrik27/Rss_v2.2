// js/portfolio-animations.js

/**
 * Sets up scroll-triggered entrance animations for portfolio items
 * in the left and right columns using GSAP.
 * Animations only run if ScrollSmoother is active (non-touch).
 */
function setupPortfolioAnimations() {
    console.log("Attempting to set up portfolio animations...");
    console.log("Check within setupPortfolioAnimations:");
    console.log(" - window.smoother:", window.smoother ? 'Exists' : 'Does NOT exist');
    console.log(" - gsap:", typeof gsap !== 'undefined' ? 'Exists' : 'Does NOT exist');
    console.log(" - ScrollTrigger:", typeof ScrollTrigger !== 'undefined' ? 'Exists' : 'Does NOT exist');


    // Check conditions based on original logic (smoother active, non-touch)
    // Assuming GSAP/ScrollTrigger are globally available if loaded correctly
    if (window.smoother && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        console.log(">>> Conditions MET. Setting up portfolio animations via GSAP.");

        const defaultStart = "top 85%";
        const defaultEnd = "center 75%";
        const defaultScrub = 0.5;

        // --- Left Column Animation ---
        const itemsL = gsap.utils.toArray('.gallery-column--left .gallery-item');
        if (itemsL.length > 0) {
            itemsL.forEach(item => {
                gsap.fromTo(item,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1, x: 0,
                        scrollTrigger: {
                            trigger: item, start: defaultStart, end: defaultEnd, scrub: defaultScrub,
                        }
                    }
                );
            });
            console.log(`   - Left column animations set up for ${itemsL.length} items.`);
        } else {
            console.warn('   - No items found for left portfolio column animation.');
        }

        // --- Right Column Animation ---
        const itemsR = gsap.utils.toArray('.gallery-column--right .gallery-item');
        if (itemsR.length > 0) {
            itemsR.forEach(item => {
                gsap.fromTo(item,
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1, x: 0,
                        scrollTrigger: {
                            trigger: item, start: defaultStart, end: defaultEnd, scrub: defaultScrub,
                        }
                    }
                );
            });
            console.log(`   - Right column animations set up for ${itemsR.length} items.`);
        } else {
            console.warn('   - No items found for right portfolio column animation.');
        }

    } else {
        console.log(">>> Conditions NOT MET for portfolio animations.");
        if (!window.smoother) console.log("   - Reason: ScrollSmoother not active or initialized (likely touch device).");
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') console.log("   - Reason: GSAP or ScrollTrigger was not available globally.");
    }
}

// --- Initialize ---
// Revert to using DOMContentLoaded directly as in the original working version
// document.addEventListener('DOMContentLoaded', setupPortfolioAnimations);