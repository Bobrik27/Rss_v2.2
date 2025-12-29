// File: js/about-me-functionality.js
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.about-me-nav .about-nav-link.js-no-smooth-scroll'); // Уточняем селектор
    const contentPanels = document.querySelectorAll('.about-me-content .content-panel');

    if (navLinks.length > 0 && contentPanels.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                navLinks.forEach(l => l.classList.remove('active'));
                contentPanels.forEach(p => p.classList.remove('active'));

                this.classList.add('active');

                const contentId = this.getAttribute('data-content-id');
                const targetPanelId = contentId + "-content";
                const targetPanel = document.getElementById(targetPanelId);

                if (targetPanel) {
                    targetPanel.classList.add('active');
                } else {
                    console.warn('About Me: Target panel not found for id:', targetPanelId);
                }
            });
        });
    } else {
        // Оставляем это предупреждение, оно может быть полезным
        console.warn('About Me: Navigation links (.about-me-nav .about-nav-link.js-no-smooth-scroll) or content panels (.about-me-content .content-panel) not found for tab functionality.');
    }

    // --- Код слайдера фотографий ---
    const sliderImages = document.querySelectorAll('.photo-slider-wrapper .slider-image');
    let currentImageIndex = 0;
    const slideInterval = 5000;

    function showNextImage() {
        if (sliderImages.length === 0) return;

        sliderImages[currentImageIndex].classList.remove('active');
        currentImageIndex = (currentImageIndex + 1) % sliderImages.length;
        sliderImages[currentImageIndex].classList.add('active');
    }

    if (sliderImages.length > 1) {
        setInterval(showNextImage, slideInterval);
    } else if (sliderImages.length === 1) {
        sliderImages[0].classList.add('active');
    } else {
        console.warn('About Me: No slider images found for the slider.');
    }
});