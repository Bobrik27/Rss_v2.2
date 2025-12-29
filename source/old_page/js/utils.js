// File: js/utils.js

function updateFooterYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    } else {
        // console.warn('Element with ID "current-year" not found in utils.js.');
    }
}

function updateScrollTopVariable() {
    // This variable is used for some CSS parallax effects.
    // The new JS-driven hero parallax does NOT use this.
    // Keep if other elements rely on --scrollTop.
    document.documentElement.style.setProperty('--scrollTop', `${window.scrollY}px`);
}

document.addEventListener('DOMContentLoaded', () => {
    updateFooterYear();
    updateScrollTopVariable(); // Initial set on load
});

window.addEventListener('scroll', updateScrollTopVariable, { passive: true });