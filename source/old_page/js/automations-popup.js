// File: js/automations-popup.js
document.addEventListener('DOMContentLoaded', () => {
    const cardsGrid = document.querySelector('.automation-cards-grid');
    const popupOverlay = document.getElementById('automationPopupOverlay');
    const popupCloseButton = document.getElementById('automationPopupClose');
    const popupDetailsContainer = document.getElementById('popupServiceDetailsContainer');
    const hiddenDetailsContainer = document.querySelector('.automation-details-content');

    if (!cardsGrid || !popupOverlay || !popupCloseButton || !popupDetailsContainer || !hiddenDetailsContainer) {
        console.warn('Automation Popup: One or more essential elements are missing. Popup functionality may be affected.');
        return;
    }

    function openPopup(serviceId) {
        const serviceContentElement = hiddenDetailsContainer.querySelector(`[data-service-content-id="${serviceId}"]`);

        if (serviceContentElement) {
            popupDetailsContainer.innerHTML = serviceContentElement.innerHTML;
            popupOverlay.querySelector('.automation-popup-content').scrollTop = 0; // Сброс скролла контента

            popupOverlay.style.display = 'flex'; // Сначала делаем flex, чтобы transition сработал

            // Форсируем reflow браузера перед добавлением класса для анимации opacity/transform
            // Это нужно, чтобы переход от display:none к display:flex + анимация сработали корректно
            void popupOverlay.offsetWidth;

            popupOverlay.classList.add('visible');
            document.body.style.overflow = 'hidden'; // Блокируем скролл основной страницы
        } else {
            console.warn(`Automation Popup: Content for service ID "${serviceId}" not found.`);
        }
    }

    function closePopup() {
        popupOverlay.classList.remove('visible');
        document.body.style.overflow = '';

        // Ждем завершения CSS-анимации исчезновения перед тем, как сделать display: none
        popupOverlay.addEventListener('transitionend', function handleTransitionEnd() {
            // Убедимся, что это именно тот transition, который нам нужен (opacity)
            // и что оверлей все еще не видим (на случай быстрых повторных кликов)
            if (!popupOverlay.classList.contains('visible')) {
                popupOverlay.style.display = 'none';
                popupDetailsContainer.innerHTML = '';
            }
            popupOverlay.removeEventListener('transitionend', handleTransitionEnd); // Удаляем слушатель
        }, { once: true }); // Слушатель сработает один раз
    }

    cardsGrid.addEventListener('click', (event) => {
        const card = event.target.closest('.automation-preview-card');
        if (card) {
            const serviceId = card.dataset.serviceId;
            if (serviceId) {
                openPopup(serviceId);
            }
        }
    });

    if (popupCloseButton) {
        popupCloseButton.addEventListener('click', closePopup);
    }

    if (popupOverlay) {
        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) {
                closePopup();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && popupOverlay.classList.contains('visible')) {
            closePopup();
        }
    });

    console.log("Automation popup functionality initialized.");
});