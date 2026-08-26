(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const variantTabs = [...document.querySelectorAll('.variant-tab')];
    const panels = [...document.querySelectorAll('.left-panel')];

    const activateVariant = (name, moveFocus = false) => {
        const nextTab = variantTabs.find((tab) => tab.dataset.variant === name);
        const nextPanel = panels.find((panel) => panel.id === `variant-${name}`);
        if (!nextTab || !nextPanel) return;

        variantTabs.forEach((tab) => {
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

        document.documentElement.dataset.variant = name;
        history.replaceState(null, '', `#${name}`);
        if (moveFocus) nextTab.focus();
    };

    variantTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateVariant(tab.dataset.variant));
        tab.addEventListener('keydown', (event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();

            let nextIndex = index;
            if (event.key === 'ArrowLeft') nextIndex = (index - 1 + variantTabs.length) % variantTabs.length;
            if (event.key === 'ArrowRight') nextIndex = (index + 1) % variantTabs.length;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = variantTabs.length - 1;
            activateVariant(variantTabs[nextIndex].dataset.variant, true);
        });
    });

    const processFacts = {
        survey: {
            label: '01 / ОБСЛЕДОВАНИЕ',
            copy: 'Выезжаем на объект, оцениваем теплопотери, помещение котельной и будущую трассировку.'
        },
        estimate: {
            label: '02 / РАСЧЁТ И СМЕТА',
            copy: 'Считаем мощность, состав оборудования и фиксируем объём работ до начала монтажа.'
        },
        install: {
            label: '03 / МОНТАЖ',
            copy: 'Собственным штатом собираем котельную, разводку, радиаторы или тёплые полы.'
        },
        launch: {
            label: '04 / ПУСКОНАЛАДКА',
            copy: 'Заполняем систему, проверяем режимы, настраиваем автоматику и управление с телефона.'
        }
    };

    const processDetail = document.querySelector('.process-detail');

    const setProcessFact = (button) => {
        const fact = processFacts[button.dataset.process];
        if (!fact || !processDetail) return;

        document.querySelectorAll('[data-process]').forEach((item) => {
            const active = item === button;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-selected', String(active));
        });

        processDetail.classList.add('is-changing');
        window.setTimeout(() => {
            processDetail.querySelector('[data-process-label]').textContent = fact.label;
            processDetail.querySelector('[data-process-copy]').textContent = fact.copy;
            processDetail.classList.remove('is-changing');
        }, reduceMotion ? 0 : 110);
    };

    document.querySelectorAll('[data-process]').forEach((button) => {
        button.addEventListener('click', () => setProcessFact(button));
        button.addEventListener('pointerenter', (event) => {
            if (event.pointerType !== 'touch') setProcessFact(button);
        });
    });

    const schemeFacts = {
        boiler: {
            title: 'Настенный котёл',
            copy: 'Нагревает теплоноситель. Мощность подбираем по теплопотерям дома и потребности в горячей воде.'
        },
        automation: {
            title: 'Шкаф автоматики',
            copy: 'Управляет температурой, насосами и защитой системы. Настройки собраны в одном понятном месте.'
        },
        pump: {
            title: 'Насосные группы',
            copy: 'Поддерживают циркуляцию и раздельные температурные режимы радиаторов и тёплого пола.'
        },
        collector: {
            title: 'Распределительный коллектор',
            copy: 'Распределяет теплоноситель по контурам дома и позволяет настраивать каждую ветку отдельно.'
        },
        tank: {
            title: 'Расширительный бак',
            copy: 'Компенсирует изменение объёма теплоносителя при нагреве и защищает систему от скачков давления.'
        }
    };

    const schemeCaption = document.querySelector('.scheme-caption');

    const setSchemeFact = (button) => {
        const name = button.dataset.scheme;
        const fact = schemeFacts[name];
        if (!fact || !schemeCaption) return;

        document.querySelectorAll('[data-scheme]').forEach((item) => {
            item.classList.toggle('is-active', item === button);
        });
        document.querySelectorAll('[data-scheme-shape]').forEach((shape) => {
            shape.classList.toggle('is-active', shape.dataset.schemeShape === name);
        });

        schemeCaption.classList.add('is-changing');
        window.setTimeout(() => {
            schemeCaption.querySelector('[data-scheme-title]').textContent = fact.title;
            schemeCaption.querySelector('[data-scheme-copy]').textContent = fact.copy;
            schemeCaption.classList.remove('is-changing');
        }, reduceMotion ? 0 : 110);
    };

    document.querySelectorAll('[data-scheme]').forEach((button) => {
        button.addEventListener('click', () => setSchemeFact(button));
        button.addEventListener('pointerenter', (event) => {
            if (event.pointerType !== 'touch') setSchemeFact(button);
        });
    });

    document.querySelectorAll('[data-scope-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const selectedRow = button.closest('.scope-row');
            if (!selectedRow) return;

            document.querySelectorAll('.scope-row').forEach((row) => {
                const rowButton = row.querySelector('[data-scope-toggle]');
                const detail = row.querySelector('p');
                const open = row === selectedRow && rowButton.getAttribute('aria-expanded') !== 'true';
                row.classList.toggle('is-open', open);
                rowButton.setAttribute('aria-expanded', String(open));
                detail.hidden = !open;
            });
        });
    });

    const controlRows = [...document.querySelectorAll('[data-control]')];
    const controlCount = document.querySelector('[data-control-count]');

    const updateControlCount = () => {
        if (!controlCount) return;
        controlCount.textContent = String(controlRows.filter((row) => row.classList.contains('is-complete')).length);
    };

    controlRows.forEach((row) => {
        row.addEventListener('click', () => {
            const complete = !row.classList.contains('is-complete');
            row.classList.toggle('is-complete', complete);
            row.setAttribute('aria-pressed', String(complete));
            updateControlCount();
        });
    });

    const initialVariant = location.hash.slice(1);
    if (variantTabs.some((tab) => tab.dataset.variant === initialVariant)) {
        activateVariant(initialVariant);
    }
})();
