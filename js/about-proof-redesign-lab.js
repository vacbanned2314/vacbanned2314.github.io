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
        activateConcept(tabs[(current + direction + tabs.length) % tabs.length].dataset.concept);
    });

    const moduleFacts = {
        experience: {
            index: '01 / ОПЫТ',
            copy: 'С 2018 года занимаемся отоплением и котельными: от первого расчёта до запуска автоматики.'
        },
        objects: {
            index: '02 / ПРАКТИКА',
            copy: 'Более 200 завершённых объектов — это практика с разными площадями, схемами отопления и условиями монтажа.'
        },
        brands: {
            index: '03 / АВТОРИЗАЦИИ',
            copy: 'Работаем более чем с пятью брендами и подбираем оборудование под задачу, а не под один каталог.'
        }
    };

    const moduleDetail = document.querySelector('.metric-detail');
    const setModuleFact = (button) => {
        const fact = moduleFacts[button.dataset.moduleMetric];
        if (!fact || !moduleDetail) return;

        document.querySelectorAll('[data-module-metric]').forEach((item) => {
            const active = item === button;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-selected', String(active));
        });

        moduleDetail.classList.add('is-changing');
        window.setTimeout(() => {
            moduleDetail.querySelector('[data-module-index]').textContent = fact.index;
            moduleDetail.querySelector('[data-module-copy]').textContent = fact.copy;
            moduleDetail.classList.remove('is-changing');
        }, reduceMotion ? 0 : 120);
    };

    document.querySelectorAll('[data-module-metric]').forEach((button) => {
        button.addEventListener('click', () => setModuleFact(button));
        button.addEventListener('pointerenter', (event) => {
            if (event.pointerType !== 'touch') setModuleFact(button);
        });
    });

    document.querySelectorAll('[data-passport-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const row = button.closest('.passport-row');
            const detail = row?.querySelector('.passport-detail');
            if (!row || !detail) return;

            const open = button.getAttribute('aria-expanded') !== 'true';
            button.setAttribute('aria-expanded', String(open));
            row.classList.toggle('is-open', open);
            detail.hidden = !open;
        });
    });

    const ribbonFacts = [
        {
            name: 'experience',
            label: 'ОПЫТ / С 2018 ГОДА',
            copy: 'Ведём объект последовательно: замер, расчёт, подбор оборудования, монтаж и настройка.'
        },
        {
            name: 'objects',
            label: 'ПРАКТИКА / БОЛЕЕ 200 ОБЪЕКТОВ',
            copy: 'Знаем, где проект расходится с реальным монтажом, и учитываем это ещё на этапе расчёта.'
        },
        {
            name: 'brands',
            label: 'СЕРВИС / БОЛЕЕ 5 БРЕНДОВ',
            copy: 'Подбираем и обслуживаем оборудование разных производителей — решение не привязано к одному бренду.'
        }
    ];
    const ribbonItems = [...document.querySelectorAll('[data-ribbon]')];
    let ribbonIndex = 0;

    const activateRibbon = (index) => {
        ribbonIndex = (index + ribbonFacts.length) % ribbonFacts.length;
        const fact = ribbonFacts[ribbonIndex];
        ribbonItems.forEach((item, itemIndex) => {
            const active = itemIndex === ribbonIndex;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-selected', String(active));
        });
        document.querySelector('[data-ribbon-label]').textContent = fact.label;
        document.querySelector('[data-ribbon-copy]').textContent = fact.copy;
        document.querySelector('[data-ribbon-position]').textContent = `0${ribbonIndex + 1} / 03`;
    };

    ribbonItems.forEach((item, index) => item.addEventListener('click', () => activateRibbon(index)));
    document.querySelector('[data-ribbon-prev]')?.addEventListener('click', () => activateRibbon(ribbonIndex - 1));
    document.querySelector('[data-ribbon-next]')?.addEventListener('click', () => activateRibbon(ribbonIndex + 1));

    const focusFacts = {
        objects: {
            kicker: 'ЗАВЕРШЕНО',
            value: '>200',
            unit: 'объектов',
            title: 'Более 200 завершённых объектов.',
            copy: 'Опыт не абстрактный: за ним разные площади, схемы отопления, котельные и условия монтажа.'
        },
        experience: {
            kicker: 'РАБОТАЕМ',
            value: '8+',
            unit: 'лет',
            title: 'В отоплении и котельных с 2018 года.',
            copy: 'Сохраняем экспертизу внутри компании и отвечаем за весь путь — от первого замера до запуска.'
        },
        brands: {
            kicker: 'АВТОРИЗАЦИИ',
            value: '5+',
            unit: 'брендов',
            title: 'Обслуживаем более пяти брендов.',
            copy: 'Подбираем оборудование под параметры объекта и можем продолжить его сервис после монтажа.'
        }
    };
    const focusValue = document.querySelector('.focus-value');

    document.querySelectorAll('[data-focus]').forEach((button) => {
        button.addEventListener('click', () => {
            const fact = focusFacts[button.dataset.focus];
            if (!fact || !focusValue) return;

            document.querySelectorAll('[data-focus]').forEach((item) => {
                const active = item === button;
                item.classList.toggle('is-active', active);
                item.setAttribute('aria-selected', String(active));
            });

            focusValue.classList.add('is-changing');
            window.setTimeout(() => {
                document.querySelector('[data-focus-kicker]').textContent = fact.kicker;
                document.querySelector('[data-focus-value]').textContent = fact.value;
                document.querySelector('[data-focus-unit]').textContent = fact.unit;
                document.querySelector('[data-focus-title]').textContent = fact.title;
                document.querySelector('[data-focus-copy]').textContent = fact.copy;
                focusValue.classList.remove('is-changing');
            }, reduceMotion ? 0 : 120);
        });
    });

    const initialConcept = location.hash.slice(1);
    if (tabs.some((tab) => tab.dataset.concept === initialConcept)) {
        activateConcept(initialConcept);
    }
})();
