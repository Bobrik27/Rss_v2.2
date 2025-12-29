// File: js/hero-animations.js

/**
 * Handles animations for the Hero section title:
 * 1. Wraps letters in spans.
 * 2. Animates letters appearing on load (CSS driven via .active class).
 * 3. Animates letters "falling" down and fading out on scroll down.
 */
function setupHeroTitleAnimations() {
    const titleElement = document.querySelector('.layers__title');
    const heroSection = document.querySelector('.hero-section'); // Needed for ScrollTrigger

    if (!titleElement) {
        // console.warn('Hero title element (.layers__title) not found in hero-animations.js.');
        return;
    }
    if (!heroSection) {
        // console.warn('Hero section element (.hero-section) not found for title exit animation.');
        return;
    }

    // --- 1. Wrap letters for entrance animation ---
    const text = titleElement.textContent;
    let wrappedText = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === ' ') {
            wrappedText += `<span class="letter letter--space"> </span>`; // Use a regular space inside span
        } else {
            wrappedText += `<span class="letter">${char}</span>`;
        }
    }
    titleElement.innerHTML = wrappedText;

    const letters = titleElement.querySelectorAll('.letter:not(.letter--space)'); // Select only non-space letters for animation

    if (letters.length === 0) {
        // console.warn('No visible letters found in hero title after wrapping.');
        return;
    }

    // --- 2. Entrance Animation (CSS driven) ---
    // Staggered delay for CSS transition (opacity and transform Y)
    letters.forEach((letter, i) => {
        letter.style.transitionDelay = `${i * 0.05}s`;
    });

    // Add .active class after a short delay to trigger entrance
    // Delay is relative to the entranceConfig in gsap-init.js for titleLettersDelay
    // This should align with when the title container itself is ready.
    // We can use the same delay logic as in gsap-init.js for consistency, or a fixed one.
    // Let's assume entranceConfig is not directly accessible here, so use a reasonable fixed delay.
    // The actual delay for title appearance should be coordinated with gsap-init.js's overall entrance timing.
    const titleEntranceDelay = 0.2 + 0.4; // Approx baseDelay + titleLettersDelay from your gsap-init config

    setTimeout(() => {
        titleElement.classList.add('active');
        // console.log("Added .active class to title for letter entrance in hero-animations.js.");
    }, titleEntranceDelay * 1000); // Convert to milliseconds


    // --- 3. Exit Animation: Letters "Falling" on Scroll ---
    if (letters.length > 0 && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        // Ensure GSAP and ScrollTrigger are available

        // Create a ScrollTrigger for the exit animation
        ScrollTrigger.create({
            trigger: heroSection,       // Element that triggers the animation
            start: "top top",           // When the top of heroSection hits the top of the viewport
            end: '+=100px',          // Animation will be active while heroSection is scrolling out
            // Or a fixed distance like "+=300" or "+=50%"
            scrub: 0.5,                 // Smooth scrubbing effect (0.5 to 2 is usually good)
            // markers: true,           // Uncomment for debugging trigger positions

            onUpdate: (self) => {
                // self.progress will go from 0 to 1 as the heroSection scrolls out
                // We can use this progress to drive the "falling" animation

                letters.forEach((letter, i) => {
                    // Calculate random values for each letter to make the fall chaotic
                    // These random valuesself.progress should ideally be generated once per letter and stored,
                    // or the animation might look jittery on scrub.
                    // For simplicity here, we'll calculate them on each update, but for production, consider storing.

                    const randomY = 300 + Math.random() * 200; // Fall distance (pixels)
                    const randomX = (Math.random() - 0.5) * 150; // Horizontal drift (pixels)
                    const randomRotation = (Math.random() - 0.5) * 120; // Rotation (degrees)
                    const randomDelayFactor = Math.random() * 0.6; // To make letters start falling at slightly different times

                    // Calculate the actual animation progress for this letter based on scroll progress and random delay
                    // We want letters to start falling a bit staggered.
                    // Let's say the fall happens during the first 50% of the scroll (self.progress from 0 to 0.5)
                    let letterFallProgress = Math.max(0, (self.progress - randomDelayFactor * 0.3) / 2.4); // Normalize to 0-1 over a range
                    letterFallProgress = Math.min(1, letterFallProgress); // Clamp between 0 and 1


                    // Apply transformations based on letterFallProgress
                    // As letterFallProgress goes from 0 to 1:
                    // - Y translation increases
                    // - Opacity decreases
                    // - X translation and Rotation apply

                    gsap.to(letter, {
                        y: letterFallProgress * randomY,
                        x: letterFallProgress * randomX,
                        rotation: letterFallProgress * randomRotation,
                        opacity: 1 - letterFallProgress, // Fade out as it falls
                        duration: 0.1, // Short duration for immediate response to scrub
                        ease: "power1.out", // Makes the start of the fall a bit quicker
                        overwrite: true // Important for scrub animations
                    });
                });
            },
            onLeave: () => { // When hero section is fully scrolled out of view
                // Ensure all letters are hidden if not already
                gsap.to(letters, { opacity: 0, duration: 0.1 });
            },
            onEnterBack: () => { // When scrolling back up and hero re-enters
                // Reset letters to their original state (or entrance animation state)
                gsap.to(letters, { y: 0, x: 0, rotation: 0, opacity: 1, duration: 0.1, overwrite: true });
            }
        });
        console.log("Hero title exit (falling letters) animation initialized.");
    } else if (letters.length > 0) {
        console.warn("GSAP or ScrollTrigger not available for hero title exit animation.");
    }
}

// Initialize after DOM is ready
// document.addEventListener('DOMContentLoaded', setupHeroTitleAnimations);