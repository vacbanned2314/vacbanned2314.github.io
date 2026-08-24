(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tabs = [...document.querySelectorAll('.concept-tab')];
    const panels = [...document.querySelectorAll('.concept')];

    const activateConcept = (name, moveFocus = false) => {
        const nextTab = tabs.find((tab) => tab.dataset.concept === name);
        const nextPanel = panels.find((panel) => panel.id === `concept-${name}`);
        if (!nextTab || !nextPanel) return;

        tabs.forEach((tab) => {
            const active = tab === nextTab;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
        });

        panels.forEach((panel) => {
            const active = panel === nextPanel;
            panel.hidden = !active;
            panel.classList.toggle('is-active', active);
        });

        document.documentElement.dataset.concept = name;
        history.replaceState(null, '', `#${name}`);
        if (moveFocus) nextTab.focus();
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateConcept(tab.dataset.concept));
        tab.addEventListener('keydown', (event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();

            let nextIndex = index;
            if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
            if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = tabs.length - 1;
            activateConcept(tabs[nextIndex].dataset.concept, true);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        if (event.target.closest('button, a, input, [tabindex]')) return;
        const current = tabs.findIndex((tab) => tab.classList.contains('is-active'));
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const next = (current + direction + tabs.length) % tabs.length;
        activateConcept(tabs[next].dataset.concept);
    });

    document.querySelectorAll('.module-panel').forEach((panel) => {
        panel.addEventListener('pointerenter', () => panel.classList.add('is-focus'));
        panel.addEventListener('pointerleave', () => panel.classList.remove('is-focus'));
        panel.addEventListener('focus', () => panel.classList.add('is-focus'));
        panel.addEventListener('blur', () => panel.classList.remove('is-focus'));
    });

    const priceModes = {
        typical: {
            value: '350–600',
            unit: 'тыс. ₽',
            copy: 'Для дома 150–200 м² с котлом 24–28 кВт.'
        },
        measure: {
            value: 'После замера',
            unit: '',
            copy: 'Инженер фиксирует объём работ, оборудование и условия монтажа.'
        }
    };

    document.querySelectorAll('[data-price-mode]').forEach((button) => {
        button.addEventListener('click', () => {
            const mode = priceModes[button.dataset.priceMode];
            const readout = document.querySelector('.price-readout');
            if (!mode || !readout) return;

            document.querySelectorAll('[data-price-mode]').forEach((item) => {
                item.classList.toggle('is-active', item === button);
            });

            readout.classList.add('is-changing');
            window.setTimeout(() => {
                readout.querySelector('[data-price-value]').textContent = mode.value;
                readout.querySelector('[data-price-unit]').textContent = mode.unit;
                readout.querySelector('[data-price-copy]').textContent = mode.copy;
                readout.classList.toggle('is-text', button.dataset.priceMode === 'measure');
                readout.classList.remove('is-changing');
            }, reduceMotion ? 0 : 150);
        });
    });

    document.querySelectorAll('[data-area]').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('[data-area]').forEach((item) => {
                item.classList.toggle('is-active', item === button);
            });
            document.querySelector('[data-area-title]').textContent = button.dataset.area;
            document.querySelector('[data-area-status]').textContent = button.dataset.status;
        });
    });

    document.querySelectorAll('[data-passport-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const detail = document.getElementById(`passport-${button.dataset.passportToggle}`);
            if (!detail) return;
            const open = button.getAttribute('aria-expanded') !== 'true';
            button.setAttribute('aria-expanded', String(open));
            detail.hidden = !open;
        });
    });

    const openToggle = document.querySelector('[data-open-details]');
    const openDetails = document.querySelector('.open-details');
    openToggle?.addEventListener('click', () => {
        const open = openToggle.getAttribute('aria-expanded') !== 'true';
        openToggle.setAttribute('aria-expanded', String(open));
        openToggle.firstChild.textContent = open ? 'Скрыть подробности ' : 'Показать подробности ';
        openDetails.hidden = !open;
    });

    const initialConcept = location.hash.slice(1);
    if (tabs.some((tab) => tab.dataset.concept === initialConcept)) {
        activateConcept(initialConcept);
    }
})();
