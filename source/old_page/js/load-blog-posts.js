document.addEventListener('DOMContentLoaded', () => {
    const postsGrid = document.querySelector('.blog-cards-grid');

    if (!postsGrid) {
        console.error('Контейнер для карточек блога (.blog-cards-grid) не найден!');
        return;
    }

    // Путь к вашему JSON файлу
    const postsJsonPath = 'data/posts.json'; // Обратите внимание на путь!

    fetch(postsJsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} при загрузке ${postsJsonPath}`);
            }
            return response.json();
        })
        .then(posts => {
            if (!Array.isArray(posts)) {
                console.error('Данные из posts.json не являются массивом.');
                postsGrid.innerHTML = '<p class="error-message">Не удалось загрузить статьи: неверный формат данных.</p>';
                return;
            }
            if (posts.length === 0) {
                postsGrid.innerHTML = '<p class="info-message">Пока нет статей для отображения.</p>';
                return;
            }

            posts.forEach(post => {
                // Создаем ссылку-карточку
                const cardLink = document.createElement('a');
                cardLink.href = post.articleUrl; // Ссылка на полную статью
                cardLink.classList.add('blog-post-card');

                // Обертка для изображения
                const imageWrapper = document.createElement('div');
                imageWrapper.classList.add('blog-post-card__image-wrapper');

                // Изображение
                const image = document.createElement('img');
                image.src = post.imageUrl;
                image.alt = post.title; // Важно для SEO и доступности
                image.classList.add('blog-post-card__image');
                image.loading = 'lazy'; // Ленивая загрузка изображений

                imageWrapper.appendChild(image);

                // Заголовок статьи
                const title = document.createElement('h3');
                title.classList.add('blog-post-card__title');
                title.textContent = post.title;

                // Собираем карточку
                cardLink.appendChild(imageWrapper);
                cardLink.appendChild(title);

                // Добавляем карточку в сетку
                postsGrid.appendChild(cardLink);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке или обработке постов:', error);
            postsGrid.innerHTML = `<p class="error-message">Не удалось загрузить статьи. Пожалуйста, попробуйте обновить страницу позже. Ошибка: ${error.message}</p>`;
        });
});