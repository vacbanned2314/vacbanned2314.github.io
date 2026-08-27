(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tabs = [...document.querySelectorAll('.concept-tab')];
    const panels = [...document.querySelectorAll('.concept')];

    const animateCounts = (panel) => {
        panel.querySelectorAll('.count[data-value]').forEach((node) => {
            const target = Number(node.dataset.value);
            if (reduceMotion) {
                node.textContent = target;
                return;
            }
            const started = performance.now();
            const tick = (now) => {
                const progress = Math.min((now - started) / 750, 1);
                node.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    };

    const activateConcept = (name, focus = false) => {
        tabs.forEach((tab) => {
            const active = tab.dataset.concept === name;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
            if (active && focus) tab.focus();
        });
        panels.forEach((panel) => {
            const active = panel.id === `concept-${name}`;
            panel.hidden = !active;
            panel.classList.toggle('is-active', active);
            if (active) animateCounts(panel);
        });
        document.documentElement.dataset.concept = name;
        history.replaceState(null, '', `#${name}`);
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateConcept(tab.dataset.concept));
        tab.addEventListener('keydown', (event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            let next = index;
            if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
            if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = tabs.length - 1;
            activateConcept(tabs[next].dataset.concept, true);
        });
    });

    const controlDetails = {
        team: ['icon-users', 'Собственный штат', 'Инженеры и монтажные бригады работают без субподряда.'],
        contract: ['icon-file-detail', 'Прозрачная смета', 'Стоимость и спецификация закреплены в договоре до начала работ.'],
        smart: ['icon-wifi', 'Умный климат', 'ZONT и MyHeat дают контроль системы прямо со смартфона.']
    };
    document.querySelectorAll('[data-control-detail]').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('[data-control-detail]').forEach((item) => {
                const active = item === button;
                item.classList.toggle('is-active', active);
                item.setAttribute('aria-selected', String(active));
            });
            const [icon, title, text] = controlDetails[button.dataset.controlDetail];
            const detail = document.querySelector('.console-detail');
            detail.innerHTML = `<span class="console-detail-icon"><svg viewBox="0 0 24 24"><use href="assets/icons/sprite.svg#${icon}"></use></svg></span><div><strong>${title}</strong><p>${text}</p></div>`;
        });
    });

    const blueprintDetails = {
        survey: ['icon-home', 'Входные данные', 'Замер объекта', 'Учитываем площадь, теплопотери и сценарии использования дома.', 'Точное техзадание', 'Не используем'],
        estimate: ['icon-file-detail', 'Расчёт и подбор', 'Смета и спецификация', 'Показываем состав оборудования и стоимость до начала работ.', 'Зафиксированная цена', 'Исключены'],
        install: ['icon-wrench', 'Реализация', 'Монтаж своим штатом', 'Инженеры и монтажные бригады отвечают за общий результат.', 'Готовая система', 'Не привлекаем'],
        service: ['icon-shield-check', 'После запуска', 'Гарантия и сервис', 'Даём 1 год гарантии на монтаж и принимаем аварийные заявки 24/7.', 'Защита по договору', 'Всегда на связи']
    };
    document.querySelectorAll('[data-blueprint-detail]').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('[data-blueprint-detail]').forEach((item) => {
                const active = item === button;
                item.classList.toggle('is-active', active);
                item.setAttribute('aria-selected', String(active));
            });
            const [icon, label, title, text, result, templates] = blueprintDetails[button.dataset.blueprintDetail];
            const passport = document.querySelector('.system-passport');
            passport.innerHTML = `<div class="passport-top"><span>${label}</span><span class="passport-state">Проверено</span></div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="assets/icons/sprite.svg#${icon}"></use></svg><h2>${title}</h2><p>${text}</p><dl><div><dt>Результат</dt><dd>${result}</dd></div><div><dt>Шаблоны</dt><dd>${templates}</dd></div></dl>`;
        });
    });

    document.querySelectorAll('.route-item > button').forEach((button) => {
        button.addEventListener('click', () => {
            const item = button.closest('.route-item');
            const willOpen = !item.classList.contains('is-open');
            document.querySelectorAll('.route-item').forEach((entry) => {
                entry.classList.remove('is-open');
                entry.querySelector('button').setAttribute('aria-expanded', 'false');
            });
            if (willOpen) {
                item.classList.add('is-open');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });

    let currentSlide = 0;
    const showSlide = (index) => {
        const slides = [...document.querySelectorAll('.panorama-slide')];
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === currentSlide));
        document.querySelector('.panorama-controls b').textContent = currentSlide + 1;
    };
    document.querySelector('[data-panorama-prev]').addEventListener('click', () => showSlide(currentSlide - 1));
    document.querySelector('[data-panorama-next]').addEventListener('click', () => showSlide(currentSlide + 1));

    const initial = location.hash.slice(1);
    if (tabs.some((tab) => tab.dataset.concept === initial)) activateConcept(initial);
    else animateCounts(document.querySelector('.concept.is-active'));
})();
