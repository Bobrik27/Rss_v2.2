// File: js/form-validation.js

/**
 * Handles validation for the footer contact form and submits data to an n8n webhook.
 */
function setupFooterFormValidation() {
    const footerForm = document.getElementById('footer-contact-form');
    if (!footerForm) {
        // console.warn('Footer contact form (#footer-contact-form) not found.');
        return;
    }

    const nameInput = document.getElementById('footer-name');
    const contactInput = document.getElementById('footer-contact');
    const messageInput = document.getElementById('footer-message');
    const nameError = document.getElementById('name-error');
    const contactError = document.getElementById('contact-error');
    const messageError = document.getElementById('message-error');
    const submitButton = footerForm.querySelector('button[type="submit"]'); // Получаем кнопку отправки

    if (!nameInput || !contactInput || !messageInput || !nameError || !contactError || !messageError || !submitButton) {
        console.error('One or more footer form elements (or submit button) are missing. Validation/submission cannot be set up.');
        return;
    }

    function showError(inputElement, errorElement, message) {
        errorElement.textContent = message;
        inputElement.classList.add('input-error');
        inputElement.setAttribute('aria-invalid', 'true');
        errorElement.setAttribute('role', 'alert');
    }

    function clearError(inputElement, errorElement) {
        errorElement.textContent = '';
        inputElement.classList.remove('input-error');
        inputElement.removeAttribute('aria-invalid');
        errorElement.removeAttribute('role');
    }

    footerForm.addEventListener('submit', async (event) => { // Делаем функцию асинхронной для await
        event.preventDefault();
        let isValid = true;

        // Сохраняем исходный текст кнопки и отключаем ее на время отправки
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...'; // Или иконка загрузки

        // --- Validate Name ---
        const nameValue = nameInput.value.trim();
        const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-'.]+$/; // Добавил апостроф и точку для имен типа O'Neil или Dr.
        clearError(nameInput, nameError);
        if (nameValue === '') {
            showError(nameInput, nameError, 'Пожалуйста, введите ваше имя.');
            isValid = false;
        } else if (nameValue.length < 2) {
            showError(nameInput, nameError, 'Имя должно содержать не менее 2 символов.');
            isValid = false;
        } else if (!nameRegex.test(nameValue)) {
            showError(nameInput, nameError, 'Имя может содержать только буквы, пробелы, дефисы, апострофы, точки.');
            isValid = false;
        }

        // --- Validate Contact ---
        const contactValue = contactInput.value.trim();
        // Более строгий regex для email, но простой тоже часто используют
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(?=.*\d)[\d\s\+\-\(\)]{7,20}$/; // Ограничил длину телефона
        clearError(contactInput, contactError);
        if (contactValue === '') {
            showError(contactInput, contactError, 'Пожалуйста, введите телефон или email.');
            isValid = false;
        } else if (!emailRegex.test(contactValue) && !phoneRegex.test(contactValue)) {
            showError(contactInput, contactError, 'Введите корректный телефон или email.');
            isValid = false;
        }

        // --- Validate Message ---
        const messageValue = messageInput.value.trim();
        clearError(messageInput, messageError);
        if (messageValue === '') {
            showError(messageInput, messageError, 'Пожалуйста, введите ваше сообщение.');
            isValid = false;
        } else if (messageValue.length < 10) {
            showError(messageInput, messageError, 'Сообщение должно содержать не менее 10 символов.');
            isValid = false;
        }

        // --- If Form is Valid ---
        if (isValid) {
            // Используем твой webhook URL
            const webhookUrl = 'http://localhost:5678/webhook/66bfd8d5-9beb-4fe5-85e4-f7bbe2a5508a';

            const dataToSend = {
                name: nameValue,
                contact: contactValue,
                message: messageValue
                // Поля совпадают с твоим примером
            };

            console.log('Form is valid! Attempting to submit data to n8n:', dataToSend);

            try {
                const response = await fetch(webhookUrl, { // Используем await для fetch
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend),
                });

                if (response.ok) {
                    // Успешно отправлено в n8n
                    const responseData = await response.json(); // Пытаемся прочитать ответ от n8n
                    console.log('Data submitted successfully to n8n. Response from n8n:', responseData);
                    alert('Спасибо за ваше сообщение! Мы скоро с вами свяжемся.');
                    footerForm.reset();
                    clearError(nameInput, nameError);
                    clearError(contactInput, contactError);
                    clearError(messageInput, messageError);
                } else {
                    // Ошибка при отправке в n8n
                    let errorData = { message: `Server responded with status: ${response.status}` };
                    try {
                        errorData = await response.json(); // Пытаемся получить JSON с ошибкой от n8n
                    } catch (e) {
                        console.warn('Could not parse error response from n8n as JSON.', e);
                        // errorData.message уже содержит статус ошибки
                    }
                    console.error('Failed to submit data to n8n. Status:', response.status, 'Response data:', errorData);
                    alert(`Произошла ошибка при отправке вашей заявки (код: ${response.status}). Пожалуйста, попробуйте позже или свяжитесь с нами другим способом.`);
                }
            } catch (error) {
                // Сетевая ошибка или другая проблема с fetch
                console.error('Network error or other issue during submission:', error);
                alert('Произошла сетевая ошибка. Пожалуйста, проверьте ваше соединение и попробуйте позже.');
            } finally {
                // В любом случае (успех или ошибка) возвращаем кнопке исходное состояние
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }

        } else {
            console.log('Form has errors. Submission aborted.');
            const firstErrorInput = footerForm.querySelector('.input-error');
            if (firstErrorInput) {
                firstErrorInput.focus();
            }
            // Возвращаем кнопке исходное состояние, если форма невалидна
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', setupFooterFormValidation);