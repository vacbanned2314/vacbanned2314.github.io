(() => {
    const asset = (folder, file, rotation = 0, caption = '') => ({
        src: `assets/portfolio/${folder}/${file}`,
        rotation,
        caption
    });

    const projects = [
        {
            id: 'laishevo-flagship',
            title: 'Монтаж котельного оборудования и автоматики в Лаишево',
            location: 'Лаишево',
            card: 'Смонтировали котельное оборудование и подключили автоматику.',
            categories: ['монтаж котельной', 'автоматика'],
            gallery: [],
            placeholder: true
        },
        {
            id: 'automation-zont',
            title: 'Автоматика отопления и водоснабжения',
            location: 'Адрес не публикуем',
            card: 'Собрали гидравлические модули и щит управления для нескольких контуров.',
            categories: ['отопительные контуры', 'автоматика'],
            gallery: [
                asset('Автоматизация системы отопления и водоснабжения дома ZONT', '20241023_112915.webp', 0, 'Общий вид гидравлических модулей и щита управления.'),
                asset('Автоматизация системы отопления и водоснабжения дома ZONT', '20241023_112850.webp', 0, 'Настенное оборудование нескольких контуров системы.'),
                asset('Автоматизация системы отопления и водоснабжения дома ZONT', '20241023_112451.webp', 0, 'Элементы установленного щита управления.'),
                asset('Автоматизация системы отопления и водоснабжения дома ZONT', '20241023_112509.webp', 0, 'Подключения внутри блока автоматики.'),
                asset('Автоматизация системы отопления и водоснабжения дома ZONT', '20241023_112859.webp', 0, 'Гидравлические модули и трубная разводка.'),
                asset('Автоматизация системы отопления и водоснабжения дома ZONT', '20241023_112933.webp', 0, 'Завершающий кадр с инженером рядом с оборудованием.')
            ]
        },
        {
            id: 'mirny',
            title: 'Пусконаладка котельной в посёлке Мирный',
            location: 'Посёлок Мирный',
            card: 'Проверили работу котла с измерительным оборудованием.',
            categories: ['ввод в эксплуатацию'],
            gallery: [
                asset('Ввод котлов в эксплуатацию - п. Мирный котельная Вайллант', '20221205_101825.webp', 90, 'Открытый котёл и панель во время пусконаладки.'),
                asset('Ввод котлов в эксплуатацию - п. Мирный котельная Вайллант', '20221202_142309.webp', 90, 'Подключённое измерительное оборудование.'),
                asset('Ввод котлов в эксплуатацию - п. Мирный котельная Вайллант', '20221202_142759.webp', 90, 'Проверка оборудования в техническом помещении.'),
                asset('Ввод котлов в эксплуатацию - п. Мирный котельная Вайллант', '20221205_101833.webp', 90, 'Инженер у открытого котла после проверки узлов.')
            ]
        },
        {
            id: 'usady',
            title: 'Пусконаладка котельной в Усадах',
            location: 'Село Усады',
            card: 'Провели пусконаладку двух котлов и отопительных контуров.',
            categories: ['ввод в эксплуатацию', 'отопительные контуры'],
            gallery: [
                asset('Ввод котлов в эксплуатацию - п. Усады котелная WOLF', '20230927_120459.webp', 0, 'Общий вид котельной с двумя котлами.'),
                asset('Ввод котлов в эксплуатацию - п. Усады котелная WOLF', '20230927_120441.webp', 0, 'Котельное оборудование и многоконтурная разводка.'),
                asset('Ввод котлов в эксплуатацию - п. Усады котелная WOLF', '20230927_153624.webp', 0, 'Измерительные приборы во время пусконаладки.'),
                asset('Ввод котлов в эксплуатацию - п. Усады котелная WOLF', '20230927_145114.webp', 0, 'Распределительные узлы отопительных контуров.'),
                asset('Ввод котлов в эксплуатацию - п. Усады котелная WOLF', '20230927_123654.webp', 90, 'Проверка подключённого оборудования.')
            ]
        },
        {
            id: 'golubyatnikova',
            title: 'Котельная на улице Голубятникова',
            location: 'Казань, ул. Голубятникова',
            card: 'Собрали котельную с двумя напольными котлами и насосными группами.',
            categories: ['монтаж котельной', 'отопительные контуры'],
            gallery: [
                asset('Казань, ул.Голубятникова', '20240911_184138.webp', 0, 'Фронтальный вид насосных групп и металлической разводки.'),
                asset('Казань, ул.Голубятникова', '20240911_184252.webp', 0, 'Два напольных котла в техническом помещении.'),
                asset('Казань, ул.Голубятникова', '20240911_184511.webp', 0, 'Распределительные узлы отопительных контуров.'),
                asset('Казань, ул.Голубятникова', '20240911_184242.webp', 0, 'Общий вид котельного оборудования.'),
                asset('Казань, ул.Голубятникова', '20240911_184412.webp', 0, 'Установленные насосные группы.'),
                asset('Казань, ул.Голубятникова', '20240911_184428.webp', 0, 'Металлическая трубная обвязка.'),
                asset('Казань, ул.Голубятникова', '20240911_184350.webp', 0, 'Фрагмент распределения контуров.'),
                asset('Казань, ул.Голубятникова', '20240911_184716.webp', 90, 'Завершающий кадр с инженером в котельной.')
            ]
        },
        {
            id: 'vedenskaya',
            title: 'Котельная и отопительные контуры в Веденской Слободе',
            location: 'Веденская Слобода',
            card: 'Смонтировали три настенных котла, медную обвязку и распределение отопления.',
            categories: ['монтаж котельной', 'отопительные контуры'],
            gallery: [
                asset('Монтаж - Веденская Слобода', '20221207_120945.webp', 180, 'Общий вид котельной с тремя настенными котлами.'),
                asset('Монтаж - Веденская Слобода', '20221207_120900.webp', 180, 'Медная трубная обвязка котельного оборудования.'),
                asset('Монтаж - Веденская Слобода', '20221207_120954.webp', 180, 'Распределительные узлы отопления.'),
                asset('Монтаж - Веденская Слобода', '20221207_121000.webp', 180, 'Настенные котлы и подключённые коммуникации.'),
                asset('Монтаж - Веденская Слобода', '20240430_105633.webp', 0, 'Завершающий кадр с инженером на объекте.')
            ]
        },
        {
            id: 'voronovka-mount',
            title: 'Котельная в Вороновке',
            location: 'Вороновка',
            card: 'Собрали котельную, насосные группы и многоконтурную обвязку.',
            categories: ['монтаж котельной', 'отопительные контуры'],
            gallery: [
                asset('Монтаж - Вороновка, Заказчик Эдуард', '20220811_140908.webp', 0, 'Фронтальный вид насосных групп и разводки.'),
                asset('Монтаж - Вороновка, Заказчик Эдуард', '20220811_140936.webp', 0, 'Металлическая многоконтурная обвязка.'),
                asset('Монтаж - Вороновка, Заказчик Эдуард', '20220811_140949.webp', 0, 'Насосные группы котельного узла.'),
                asset('Монтаж - Вороновка, Заказчик Эдуард', '20220811_140858.webp', 90, 'Общий вид котельного оборудования.')
            ]
        },
        {
            id: 'nagorny',
            title: 'Котельная в посёлке Нагорный',
            location: 'Казань, пос. Нагорный, ул. Галеева',
            card: 'Смонтировали насосные группы, автоматику и водоподготовку.',
            categories: ['монтаж котельной', 'отопительные контуры', 'автоматика'],
            gallery: [
                asset('Монтаж - Казань пос.Нагорный ул.Галеева', '20230828_180810.webp', 0, 'Фронтальный вид оборудования и автоматики.'),
                asset('Монтаж - Казань пос.Нагорный ул.Галеева', '20230828_180756.webp', 0, 'Многоконтурные насосные группы.'),
                asset('Монтаж - Казань пос.Нагорный ул.Галеева', '20230828_180910.webp', 0, 'Оборудование водоподготовки и трубная разводка.'),
                asset('Монтаж - Казань пос.Нагорный ул.Галеева', '20230828_181002.webp', 90, 'Отдельная зона котельного оборудования.')
            ]
        },
        {
            id: 'fedoseevskaya',
            title: 'Котельная на улице Федосеевской',
            location: 'Казань, ул. Федосеевская',
            card: 'Собрали котельную с двумя котлами, водоподготовкой и автоматикой.',
            categories: ['монтаж котельной', 'отопительные контуры', 'автоматика'],
            gallery: [
                asset('Монтаж - Казань ул Федосеевская', '20240902_131117.webp', 0, 'Общий вид завершённого котельного пространства.'),
                asset('Монтаж - Казань ул Федосеевская', '20240902_131147.webp', 0, 'Два напольных котла и настенное оборудование.'),
                asset('Монтаж - Казань ул Федосеевская', '20240902_131154.webp', 0, 'Протяжённая металлическая обвязка.'),
                asset('Монтаж - Казань ул Федосеевская', '20240902_131240.webp', 90, 'Распределительные узлы нескольких контуров.'),
                asset('Монтаж - Казань ул Федосеевская', '20240902_131324.webp', 90, 'Блоки управления на стене.'),
                asset('Монтаж - Казань ул Федосеевская', '20240803_191219.webp', 0, 'Оборудование на монтажном этапе.')
            ]
        },
        {
            id: 'laishevo-floor',
            title: 'Отопительные контуры в Лаишево',
            location: 'Лаишево, пер. Зелёный',
            card: 'Уложили контуры тёплого пола и подключили коллекторные шкафы.',
            categories: ['отопительные контуры'],
            gallery: [
                asset('Монтаж - Лаишево переулок Зеленый', '20240602_160542.webp', 0, 'Широкий план уложенных отопительных контуров.'),
                asset('Монтаж - Лаишево переулок Зеленый', '20240602_160551.webp', 90, 'Контуры напольного отопления в отдельном помещении.'),
                asset('Монтаж - Лаишево переулок Зеленый', '20240602_160558.webp', 90, 'Шаг укладки труб на монтажной сетке.'),
                asset('Монтаж - Лаишево переулок Зеленый', '20240602_161111.webp', 0, 'Подключение контуров к распределительному шкафу.'),
                asset('Монтаж - Лаишево переулок Зеленый', '20240602_161133.webp', 0, 'Распределительный коллектор отопительных контуров.')
            ]
        },
        {
            id: 'sadovaya',
            title: 'Котельная и отопление на улице Садовой',
            location: 'Лаишево, ул. Садовая',
            card: 'Собрали котельную, отопительные контуры, водоподготовку и радиаторы.',
            categories: ['монтаж котельной', 'отопительные контуры'],
            gallery: [
                asset('Монтаж - Лаишево ул. Садовая', '20240506_182453.webp', 0, 'Фронтальный вид группы отопительных контуров.'),
                asset('Монтаж - Лаишево ул. Садовая', '20240506_182418.webp', 0, 'Котельный агрегат и трубная обвязка.'),
                asset('Монтаж - Лаишево ул. Садовая', '20240506_182410.webp', 0, 'Оборудование водоподготовки.'),
                asset('Монтаж - Лаишево ул. Садовая', '20240506_182442.webp', 0, 'Распределительные гидравлические модули.'),
                asset('Монтаж - Лаишево ул. Садовая', '20240430_105747.webp', 0, 'Установленный настенный радиатор.')
            ]
        },
        {
            id: 'vysokaya-gora-service',
            title: 'Обслуживание конденсационных котлов в Высокой Горе',
            location: 'Высокая Гора',
            card: 'Провели обслуживание: открыли котлы, осмотрели камеры и снятые узлы.',
            categories: ['обслуживание и ремонт'],
            gallery: [
                asset('Обслуживание конденсационного котла - Высокая гора', '20221013_150308.webp', 0, 'Открытый настенный котёл во время обслуживания.'),
                asset('Обслуживание конденсационного котла - Высокая гора', '20221013_150321.webp', 0, 'Камера котла с видимыми отложениями.'),
                asset('Обслуживание конденсационного котла - Высокая гора', '20221013_150334.webp', 0, 'Снятый узел котельного оборудования.'),
                asset('Обслуживание конденсационного котла - Высокая гора', '20221013_151102.webp', 0, 'Общий план оборудования во время обслуживания.')
            ]
        },
        {
            id: 'sokury',
            title: 'Котельный узел в Сокурах',
            location: 'Сокуры, ул. Дорожная',
            card: 'На монтажном этапе собрали насосные группы, коллектор и обвязку.',
            categories: ['монтаж котельной', 'отопительные контуры'],
            gallery: [
                asset('пос.Сокуры ул.Дорожная', '20230913_152517.webp', 0, 'Насосные группы, коллектор и трубная разводка.'),
                asset('пос.Сокуры ул.Дорожная', '20230913_152527.webp', 0, 'Котельный узел на монтажном этапе.')
            ]
        },
        {
            id: 'shuryachiy',
            title: 'Котельный узел в Щурячьем',
            location: 'Щурячий',
            card: 'Собрали четыре гидромодуля, коллектор и накопительный бак.',
            categories: ['реконструкция', 'монтаж котельной', 'отопительные контуры'],
            gallery: [
                asset('Реконструкция котельного узла - Щурячий', '20230121_151013.webp', 0, 'Четыре гидравлических модуля и металлическая обвязка.'),
                asset('Реконструкция котельного узла - Щурячий', '20230121_150638.webp', 0, 'Накопительный бак и элементы котельного узла.'),
                asset('Реконструкция котельного узла - Щурячий', '20230121_150706.webp', 0, 'Распределительный коллектор отопительных контуров.'),
                asset('Реконструкция котельного узла - Щурячий', '20230121_151049.webp', 0, 'Фильтр и изолированный вертикальный модуль.')
            ]
        },
        {
            id: 'voronovka-service',
            title: 'Обслуживание конденсационных котлов в Вороновке',
            location: 'Вороновка',
            card: 'Осмотрели котлы, сняли показания и проверили состояние узлов.',
            categories: ['обслуживание и ремонт'],
            gallery: [
                asset('Техническое обслуживание конденсационных котлов в поселке Вороновка', '20221123_094812.webp', 0, 'Общий вид открытого напольного котла.'),
                asset('Техническое обслуживание конденсационных котлов в поселке Вороновка', '20221123_094821.webp', 0, 'Камера котла с видимыми отложениями.'),
                asset('Техническое обслуживание конденсационных котлов в поселке Вороновка', '20221123_100617.webp', 0, 'Снятые узлы котельного оборудования.'),
                asset('Техническое обслуживание конденсационных котлов в поселке Вороновка', '20221123_111249.webp', 0, 'Измерительные приборы в ходе обслуживания.'),
                asset('Техническое обслуживание конденсационных котлов в поселке Вороновка', '20221123_163232.webp', 0, 'Крупный план детали с видимой коррозией.')
            ]
        }
    ];

    const projectById = new Map(projects.map(project => [project.id, project]));
    const state = { case: { expanded: false }, tasks: { expanded: false, filter: 'all' }, report: { expanded: false } };
    const limits = { case: 7, tasks: 6, report: 6 };
    const categories = ['all', 'монтаж котельной', 'отопительные контуры', 'обслуживание и ремонт', 'реконструкция', 'автоматика', 'ввод в эксплуатацию'];
    const labels = { all: 'Все проекты', 'монтаж котельной': 'Монтаж котельной', 'отопительные контуры': 'Отопительные контуры', 'обслуживание и ремонт': 'Обслуживание и ремонт', 'реконструкция': 'Реконструкция', 'автоматика': 'Автоматика', 'ввод в эксплуатацию': 'Ввод в эксплуатацию' };

    const imageMarkup = (project, className = '') => {
        if (project.placeholder || !project.gallery.length) return `<span class="${className} is-placeholder" aria-hidden="true">LA</span>`;
        const cover = project.gallery[0];
        return `<span class="${className}"><img src="${cover.src}" alt="" loading="lazy" style="--image-rotation:${cover.rotation}deg"></span>`;
    };

    const caseCard = (project) => `
        <button type="button" class="case-card" data-open-project="${project.id}">
            <span class="case-card__content">
                <span class="case-card__meta"><span>${project.location}</span><span>${project.gallery.length ? `${project.gallery.length} фото` : 'Фото готовим'}</span></span>
                <h3>${project.title}</h3><p>${project.card}</p>
            </span>
            ${project.placeholder ? '<span class="case-card__placeholder" aria-hidden="true">LA</span>' : `<img src="${project.gallery[0].src}" alt="" loading="lazy" style="--image-rotation:${project.gallery[0].rotation}deg">`}
        </button>`;

    const taskRow = (project) => `
        <button type="button" class="task-project" data-open-project="${project.id}">
            ${imageMarkup(project, 'task-project__media')}
            <span class="task-project__title"><span>${project.location}</span><h3>${project.title}</h3></span>
            <span class="task-project__desc">${project.card}</span>
            <span class="task-project__tags">${project.categories.map(category => `<span>${labels[category]}</span>`).join('')}</span>
        </button>`;

    const reportRow = (project, index) => `
        <button type="button" class="report-entry" data-open-project="${project.id}">
            <span class="report-entry__no">${String(index + 1).padStart(2, '0')}</span>
            ${imageMarkup(project, 'report-entry__image')}
            <span class="report-entry__copy"><span>${project.location}</span><h3>${project.title}</h3><p>${project.card}</p></span>
            <svg aria-hidden="true"><use href="#icon-arrow"></use></svg>
        </button>`;

    function filteredProjects(type) {
        if (type === 'case') return projects.filter(project => !project.placeholder);
        if (type === 'report') return projects.filter(project => project.id !== 'golubyatnikova');
        const filter = state.tasks.filter;
        return filter === 'all' ? projects : projects.filter(project => project.categories.includes(filter));
    }

    function renderList(type) {
        const container = document.querySelector(`[data-project-list="${type}"]`);
        if (!container) return;
        const all = filteredProjects(type);
        const visible = state[type].expanded ? all : all.slice(0, limits[type]);
        const renderer = type === 'case' ? caseCard : type === 'tasks' ? taskRow : reportRow;
        container.innerHTML = visible.map((project, index) => renderer(project, index)).join('');
        const button = document.querySelector(`[data-show-more="${type}"]`);
        if (button) {
            const wrap = button.closest('.pc-more-wrap');
            const remaining = Math.max(0, all.length - visible.length);
            wrap.hidden = remaining === 0;
            const count = button.querySelector('[data-remaining-count]');
            if (count) count.textContent = remaining ? `(${remaining})` : '';
        }
        bindGalleryOpeners(container);
    }

    function renderFilters() {
        const container = document.querySelector('[data-filter-group="tasks"]');
        if (!container) return;
        container.innerHTML = categories.map(category => `<button type="button" class="task-filter" data-task-filter="${category}" aria-pressed="${category === state.tasks.filter}">${labels[category]}</button>`).join('');
        container.querySelectorAll('[data-task-filter]').forEach(button => button.addEventListener('click', () => {
            state.tasks.filter = button.dataset.taskFilter;
            state.tasks.expanded = false;
            renderFilters();
            renderList('tasks');
            updateTaskCopy();
        }));
    }

    function updateTaskCopy() {
        const result = filteredProjects('tasks');
        const heading = document.querySelector('[data-task-heading]');
        const count = document.querySelector('[data-task-result-count]');
        if (heading) heading.textContent = labels[state.tasks.filter];
        if (count) count.textContent = `${result.length} ${projectWord(result.length)}`;
    }

    function projectWord(number) {
        const mod10 = number % 10;
        const mod100 = number % 100;
        if (mod10 === 1 && mod100 !== 11) return 'проект';
        if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return 'проекта';
        return 'проектов';
    }

    function initTabs() {
        const tabs = [...document.querySelectorAll('[data-concept-tab]')];
        const panels = [...document.querySelectorAll('[data-concept-panel]')];
        const activate = (name, moveFocus = false) => {
            tabs.forEach(tab => {
                const selected = tab.dataset.conceptTab === name;
                tab.setAttribute('aria-selected', String(selected));
                tab.tabIndex = selected ? 0 : -1;
                if (selected && moveFocus) tab.focus();
            });
            panels.forEach(panel => { panel.hidden = panel.dataset.conceptPanel !== name; });
            history.replaceState(null, '', `#concept-${name}`);
            window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        };
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => activate(tab.dataset.conceptTab));
            tab.addEventListener('keydown', event => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                let next = index;
                if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
                if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
                if (event.key === 'Home') next = 0;
                if (event.key === 'End') next = tabs.length - 1;
                activate(tabs[next].dataset.conceptTab, true);
            });
        });
        const initial = location.hash.replace('#concept-', '');
        if (tabs.some(tab => tab.dataset.conceptTab === initial)) activate(initial);
    }

    let galleryProject = null;
    let galleryIndex = 0;
    let galleryReturnFocus = null;
    const modal = document.getElementById('project-gallery');
    const modalImage = document.getElementById('gallery-image');
    const modalPlaceholder = document.getElementById('gallery-placeholder');
    const modalPrev = modal?.querySelector('[data-gallery-prev]');
    const modalNext = modal?.querySelector('[data-gallery-next]');

    function bindGalleryOpeners(root = document) {
        root.querySelectorAll('[data-open-project]').forEach(button => {
            if (button.dataset.galleryBound) return;
            button.dataset.galleryBound = 'true';
            button.addEventListener('click', () => openGallery(button.dataset.openProject, Number(button.dataset.photoIndex || 0), button));
        });
    }

    function openGallery(projectId, index = 0, trigger = null) {
        const project = projectById.get(projectId);
        if (!project || !modal) return;
        galleryProject = project;
        galleryIndex = Math.max(0, Math.min(index, Math.max(0, project.gallery.length - 1)));
        galleryReturnFocus = trigger || document.activeElement;
        document.getElementById('gallery-title').textContent = project.title;
        document.getElementById('gallery-location').textContent = project.location;
        modal.hidden = false;
        document.body.classList.add('gallery-open');
        renderGallery();
        requestAnimationFrame(() => modal.querySelector('[data-gallery-close]').focus());
    }

    function renderGallery() {
        if (!galleryProject) return;
        const hasPhotos = galleryProject.gallery.length > 0;
        modalImage.hidden = !hasPhotos;
        modalPlaceholder.hidden = hasPhotos;
        modalPrev.hidden = !hasPhotos || galleryProject.gallery.length < 2;
        modalNext.hidden = !hasPhotos || galleryProject.gallery.length < 2;
        if (!hasPhotos) {
            document.getElementById('gallery-caption').textContent = galleryProject.card;
            document.getElementById('gallery-counter').textContent = 'Фото готовим';
            return;
        }
        const photo = galleryProject.gallery[galleryIndex];
        modalImage.src = photo.src;
        modalImage.alt = photo.caption;
        modalImage.style.transform = `rotate(${photo.rotation}deg)`;
        modalImage.style.maxWidth = Math.abs(photo.rotation) === 90 ? '78%' : '';
        modalImage.style.maxHeight = Math.abs(photo.rotation) === 90 ? '78%' : '';
        document.getElementById('gallery-caption').textContent = photo.caption;
        document.getElementById('gallery-counter').textContent = `${galleryIndex + 1} / ${galleryProject.gallery.length}`;
    }

    function closeGallery() {
        if (!modal || modal.hidden) return;
        modal.hidden = true;
        document.body.classList.remove('gallery-open');
        modalImage.src = '';
        galleryProject = null;
        galleryReturnFocus?.focus();
        galleryReturnFocus = null;
    }

    function moveGallery(delta) {
        if (!galleryProject?.gallery.length) return;
        galleryIndex = (galleryIndex + delta + galleryProject.gallery.length) % galleryProject.gallery.length;
        renderGallery();
    }

    function initGallery() {
        if (!modal) return;
        modal.querySelectorAll('[data-gallery-close]').forEach(button => button.addEventListener('click', closeGallery));
        modalPrev.addEventListener('click', () => moveGallery(-1));
        modalNext.addEventListener('click', () => moveGallery(1));
        document.addEventListener('keydown', event => {
            if (modal.hidden) return;
            if (event.key === 'Escape') { event.preventDefault(); closeGallery(); return; }
            if (event.key === 'ArrowLeft') { event.preventDefault(); moveGallery(-1); return; }
            if (event.key === 'ArrowRight') { event.preventDefault(); moveGallery(1); return; }
            if (event.key !== 'Tab') return;
            const focusable = [...modal.querySelectorAll('button:not([hidden]), a[href]')].filter(element => !element.disabled);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        });
    }

    function initShowMore() {
        document.querySelectorAll('[data-show-more]').forEach(button => button.addEventListener('click', () => {
            const type = button.dataset.showMore;
            state[type].expanded = true;
            renderList(type);
        }));
    }

    document.addEventListener('DOMContentLoaded', () => {
        initTabs();
        renderFilters();
        renderList('case');
        renderList('tasks');
        renderList('report');
        updateTaskCopy();
        initShowMore();
        initGallery();
        bindGalleryOpeners();
    });
})();
