const API_BASE = window.TEPLOREM_API || '';

function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_content: params.get('utm_content'),
        utm_term: params.get('utm_term'),
    };
}

function extractPhoneDigits(value) {
    let digits = value.replace(/\D/g, '');
    if (!digits) return '';

    if (digits.startsWith('8')) {
        digits = '7' + digits.slice(1);
    } else if (!digits.startsWith('7')) {
        digits = '7' + digits;
    }

    // После автоподставленного «+7» человек часто набирает номер с восьмёрки:
    // «+7 89371234567». Лишнюю 8 убираем, когда цифр становится больше 11.
    if (digits.length > 11 && digits.startsWith('78')) {
        digits = '7' + digits.slice(2);
    }

    return digits.slice(0, 11);
}

function formatPhoneInput(value) {
    const digits = extractPhoneDigits(value);
    if (!digits) return '';

    let result = '+7';
    if (digits.length > 1) result += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) result += ') ' + digits.slice(4, 7);
    if (digits.length >= 7) result += '-' + digits.slice(7, 9);
    if (digits.length >= 9) result += '-' + digits.slice(9, 11);

    return result;
}

function getCursorAfterDigits(formatted, digitsBeforeCursor) {
    if (!formatted) return 0;
    if (digitsBeforeCursor <= 0) {
        return formatted.length > 2 ? 4 : formatted.length;
    }

    let count = 0;
    for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) count++;
        if (count === digitsBeforeCursor) {
            return i + 1;
        }
    }

    return formatted.length;
}

function showFeedback(el, message, type) {
    el.innerHTML = '';
    el.append(document.createTextNode(message));

    if (type === 'success') {
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'form-feedback__retry';
        retry.textContent = 'Отправить ещё одну заявку';
        retry.addEventListener('click', () => {
            const form = document.getElementById('lead-form');
            form?.classList.remove('is-submitted');
            const toggle = document.getElementById('lead-details-toggle');
            if (toggle?.checked) {
                toggle.checked = false;
                toggle.dispatchEvent(new Event('change'));
            }
            hideFeedback(el);
        });
        el.append(document.createElement('br'), retry);
    }

    el.hidden = false;
    el.className = 'form-feedback form-feedback--' + type;
}

// Ошибка показывается рядом с полем, а не баннером под кнопкой отправки.
function setFieldError(input, anchor, message) {
    const errorId = `${input.id}-error`;
    let error = document.getElementById(errorId);

    if (!error) {
        error = document.createElement('p');
        error.id = errorId;
        error.className = 'form-field-error';
        anchor.after(error);
    }

    error.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorId);
    input.focus();
}

function clearFieldError(input) {
    document.getElementById(`${input.id}-error`)?.remove();
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
}

function hideFeedback(el) {
    el.hidden = true;
    el.textContent = '';
    el.className = 'form-feedback';
}

function initFormDetailsToggle() {
    const form = document.getElementById('lead-form');
    const toggle = document.getElementById('lead-details-toggle');
    const details = document.getElementById('lead-form-details');

    if (!form || !toggle || !details) return;

    function setExpanded(expanded) {
        toggle.checked = expanded;
        details.classList.toggle('is-open', expanded);
        details.inert = !expanded;

        if (!expanded) {
            details.querySelectorAll('.custom-select.is-open').forEach(select => {
                select.classList.remove('is-open');
                const trigger = select.querySelector('.custom-select__trigger');
                const list = select.querySelector('.custom-select__list');
                trigger?.setAttribute('aria-expanded', 'false');
                if (list) list.hidden = true;
            });
        }
    }

    toggle.addEventListener('change', () => {
        setExpanded(toggle.checked);
    });

    form.addEventListener('reset', () => {
        requestAnimationFrame(() => setExpanded(false));
    });
}

function initLeadForm() {
    const form = document.getElementById('lead-form');
    if (!form) return;

    const submitBtn = document.getElementById('lead-submit');
    const feedback = document.getElementById('form-feedback');
    const nameInput = form.querySelector('[name="name"]');
    const phoneInput = form.querySelector('[name="phone"]');
    const consentInput = form.querySelector('[name="privacy_consent"]');
    const consentLink = form.querySelector('.privacy-consent a');

    consentInput?.addEventListener('change', () => clearFieldError(consentInput));
    nameInput?.addEventListener('input', () => clearFieldError(nameInput));

    consentLink?.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });

    // «+7» подставляется при фокусе, чтобы не искать «+» на клавиатуре.
    const phonePrefix = '+7 ';
    const placeCursorAtEnd = () => {
        const end = phoneInput.value.length;
        phoneInput.setSelectionRange(end, end);
    };

    phoneInput.addEventListener('focus', () => {
        if (extractPhoneDigits(phoneInput.value).length > 1) return;
        phoneInput.value = phonePrefix;
        requestAnimationFrame(placeCursorAtEnd);
    });

    phoneInput.addEventListener('blur', () => {
        if (extractPhoneDigits(phoneInput.value).length <= 1) phoneInput.value = '';
    });

    phoneInput.addEventListener('keydown', (e) => {
        if (e.key !== 'Backspace' && e.key !== 'Delete') return;

        const digits = extractPhoneDigits(phoneInput.value);
        if (digits.length <= 1) {
            phoneInput.value = phonePrefix;
            placeCursorAtEnd();
            e.preventDefault();
        }
    });

    phoneInput.addEventListener('input', () => {
        clearFieldError(phoneInput);
        const cursor = phoneInput.selectionStart ?? phoneInput.value.length;
        const digitsBeforeCursor = phoneInput.value.slice(0, cursor).replace(/\D/g, '').length;
        const formatted = formatPhoneInput(phoneInput.value);

        phoneInput.value = formatted;

        const newCursor = getCursorAfterDigits(formatted, digitsBeforeCursor);
        phoneInput.setSelectionRange(newCursor, newCursor);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideFeedback(feedback);

        if (nameInput) clearFieldError(nameInput);
        clearFieldError(phoneInput);
        if (consentInput) clearFieldError(consentInput);

        if (nameInput && !nameInput.value.trim()) {
            setFieldError(nameInput, nameInput, 'Укажите, как к вам обращаться');
            return;
        }

        if (extractPhoneDigits(phoneInput.value).length !== 11) {
            setFieldError(phoneInput, phoneInput, 'Введите номер полностью: +7 и 10 цифр');
            return;
        }

        if (consentInput && !consentInput.checked) {
            setFieldError(consentInput, consentInput.closest('.privacy-consent'), 'Отметьте согласие, чтобы мы могли перезвонить');
            return;
        }

        const formData = new FormData(form);
        const utm = getUtmParams();

        const payload = {
            name: formData.get('name')?.toString().trim(),
            phone: formData.get('phone')?.toString().trim(),
            service_code: formData.get('service_code')?.toString() || null,
            area_sqm: formData.get('area_sqm')?.toString() || null,
            heating_type: formData.get('heating_type')?.toString() || null,
            message: formData.get('message')?.toString().trim() || null,
            privacy_consent: consentInput ? consentInput.checked : true,
            landing_page: window.location.href,
            referrer_url: document.referrer || null,
            ...utm,
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка…';

        try {
            const response = await fetch(`${API_BASE}/api/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const msg = data.errors
                    ? data.errors.map(err => err.message).join('. ')
                    : data.error || 'Не удалось отправить заявку';
                showFeedback(feedback, msg, 'error');
                return;
            }

            showFeedback(feedback, data.message || 'Заявка принята! Мы перезвоним в течение 15 минут.', 'success');
            form.classList.add('is-submitted');
            form.reset();
        } catch {
            showFeedback(
                feedback,
                'Сервер недоступен. Позвоните нам: +7 (937) 625-47-03',
                'error'
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Оставить заявку';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initFormDetailsToggle();
    initLeadForm();
});
