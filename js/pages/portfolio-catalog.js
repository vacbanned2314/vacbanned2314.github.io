(function () {
    var projects = [
        { id: 'ko-1', title: 'Котельная ЖК «Акварель»', cat: 'gas', power: '8 МВт', client: 'ГК «Аквастрой»', year: 2025, status: 'done', desc: 'Проектирование и монтаж газовой котельной для жилого комплекса на 640 квартир. Три котла Buderus Logano, дымовая труба 28 м, автоматика погодозависимого регулирования.' },
        { id: 'ko-2', title: 'Котельная завода «Металлист»', cat: 'gas', power: '15 МВт', client: 'АО «Металлист»', year: 2024, status: 'done', desc: 'Замена устаревшей угольной котельной на современную газовую. Два водогрейных котла по 7,5 МВт, система химводоподготовки, резервное дизельное топливо.' },
        { id: 'ko-3', title: 'БМК «Южная»', cat: 'solid', power: '6 МВт', client: 'МУП «Теплосеть»', year: 2025, status: 'done', desc: 'Блочно-модульная котельная на пеллетах для отопления микрорайона. Автоматическая подача топлива, система золоудаления, дистанционный мониторинг.' },
        { id: 'ko-4', title: 'ЦТП «Центральный»', cat: 'modernisation', power: '10 МВт', client: 'ПАО «Теплоэнерго»', year: 2024, status: 'done', desc: 'Реконструкция центрального теплового пункта с заменой насосной группы и пластинчатых теплообменников. Установка частотных преобразователей.' },
        { id: 'ko-5', title: 'Котельная школы № 42', cat: 'gas', power: '3 МВт', client: 'Администрация г. Казань', year: 2023, status: 'done', desc: 'Автономная газовая котельная для отопления и ГВС учебного заведения на 1200 мест. Два котла Viessmann Vitoplex 100, бойлер косвенного нагрева.' },
        { id: 'ko-6', title: 'Котельная «Промзона-2»', cat: 'solid', power: '20 МВт', client: 'ООО «Промресурс»', year: 2024, status: 'done', desc: 'Крупнейшая твердотопливная котельная в регионе на щепе и опилках. Четыре котла с механической решёткой, мультициклонная очистка дымовых газов.' },
        { id: 'ko-7', title: 'ИТП БЦ «Олимп»', cat: 'auto', power: '5 МВт', client: 'УК «Олимп-Сервис»', year: 2025, status: 'done', desc: 'Автоматизация индивидуального теплового пункта бизнес-центра. Внедрение SCADA-системы, погодное регулирование, удалённое управление через web-интерфейс.' },
        { id: 'ko-8', title: 'Котельная ЖК «Невский»', cat: 'gas', power: '12 МВт', client: 'СЗ «Невский проспект»', year: 2024, status: 'done', desc: 'Крышная газовая котельная для 18-этажного жилого комплекса. Четыре настенных котла, система дымоудаления, шумопоглощающие кожухи.' },
        { id: 'ko-9', title: 'Мини-котельная «Загородный клуб»', cat: 'solid', power: '2 МВт', client: 'КП «Загородный клуб»', year: 2025, status: 'done', desc: 'Автономная котельная на дровах для коттеджного посёлка. Котёл длительного горения, теплоаккумулятор 3000 л, автоматическая подача воздуха.' },
        { id: 'ko-10', title: 'Котельная больницы № 7', cat: 'modernisation', power: '4 МВт', client: 'ГБУЗ «ГКБ № 7»', year: 2023, status: 'done', desc: 'Модернизация котельной с заменой котлов и системы автоматики безопасности. Резервирование по схеме 2×100%, бесперебойное горячее водоснабжение.' },
        { id: 'ko-11', title: 'Котельная «Новая Заря»', cat: 'gas', power: '9 МВт', client: 'ОАО «Новая Заря»', year: 2024, status: 'done', desc: 'Строительство газовой котельной для производственного комплекса. Три жаротрубных котла, экономайзер, конденсационный теплоутилизатор.' },
        { id: 'ko-12', title: 'Автоматизация котельной «Восточная»', cat: 'auto', power: '7 МВт', client: 'МКП «Тепловые сети»', year: 2025, status: 'done', desc: 'Комплексная автоматизация муниципальной котельной. Диспетчеризация, контроль параметров теплоносителя в реальном времени, автоматическое поддержание графиков.' },
        { id: 'ko-13', title: 'Котельная тепличного комплекса «Зелёный Дом»', cat: 'gas', power: '11 МВт', client: 'Агрохолдинг «Зелёный Дом»', year: 2024, status: 'done', desc: 'Газовая котельная для круглогодичного тепличного комплекса площадью 12 га. Утилизация CO₂ для подкормки растений, конденсационные котлы.' },
        { id: 'ko-14', title: 'Котельная «Спортивная арена»', cat: 'modernisation', power: '6 МВт', client: 'ГАУ «СпортАрена»', year: 2025, status: 'done', desc: 'Реконструкция котельной ледовой арены. Замена котлов на высокоэффективные конденсационные, модернизация системы ГВС для душевых и раздевалок.' }
    ];

    var grid = document.getElementById('projectGrid');
    var modal = document.getElementById('pf-modal');
    var modalClose = document.getElementById('pfModalClose');
    var filterBtns = document.querySelectorAll('.portfolio-catalog .filter-btn');

    if (!grid || !modal) return;

    var cardSvg = '<svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="60" width="160" height="70" rx="4" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="35" y="80" width="40" height="30" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="90" y="75" width="30" height="40" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="135" y="70" width="25" height="50" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>';
    var catLabels = {
        gas: 'Монтаж котельной',
        solid: 'Техническое обслуживание',
        modernisation: 'Ввод в эксплуатацию',
        auto: 'Установка автоматики'
    };

    function renderProject(p) {
        var catLabel = catLabels[p.cat] || p.cat;
        return '<div class="project-card" data-id="' + p.id + '" data-cat="' + p.cat + '">' +
            '<div class="project-card-img">' + cardSvg + '</div>' +
            '<div class="project-card-body">' +
            '<div class="project-card-cats">' +
            '<span class="project-tag">' + catLabel + '</span>' +
            '</div>' +
            '<h3 class="h3">' + p.title + '</h3>' +
            '<dl class="project-card-details">' +
            '<dt>Мощность</dt><dd>' + p.power + '</dd>' +
            '<dt>Год</dt><dd>' + p.year + '</dd>' +
            '</dl>' +
            '</div>' +
            '</div>';
    }

    function openModal(p) {
        document.getElementById('modalCat').textContent = catLabels[p.cat] || p.cat;
        document.getElementById('modalTitle').textContent = p.title;
        document.getElementById('modalDesc').textContent = p.desc;
        document.getElementById('modalPower').textContent = p.power;
        document.getElementById('modalStatus').textContent = p.status === 'done' ? 'Выполнен' : 'В работе';
        document.getElementById('modalClient').textContent = p.client;
        document.getElementById('modalYear').textContent = p.year;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    function renderGrid(filter) {
        var html = '';
        var filtered = filter === 'all' ? projects : projects.filter(function (p) { return p.cat === filter; });
        filtered.forEach(function (p) { html += renderProject(p); });
        grid.innerHTML = html || '<p style="grid-column:1/-1;text-align:center;padding:48px 0;color:var(--text-dim)">Нет проектов в этой категории</p>';

        grid.querySelectorAll('.project-card').forEach(function (card) {
            card.addEventListener('click', function () {
                var id = card.getAttribute('data-id');
                var p = projects.find(function (x) { return x.id === id; });
                if (p) openModal(p);
            });
        });
    }

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            renderGrid(btn.getAttribute('data-filter'));
        });
    });

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });

    var heroBtn = document.querySelector('[data-pf-hero-details]');
    if (heroBtn) {
        heroBtn.addEventListener('click', function () {
            openModal({
                id: 'featured',
                title: 'Котельная, ул. Баумана, 48 — Казань',
                cat: 'gas',
                power: '340 м²',
                client: 'Частный заказчик',
                year: 2024,
                status: 'done',
                desc: 'Монтаж системы отопления, котельного оборудования Vaillant, тёплых полов, гидравлической разводки и автоматики ZONT. Проектирование, пусконаладка и сдача объекта под ключ.'
            });
        });
    }

    document.querySelectorAll('.portfolio-catalog [href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var href = a.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                var target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    renderGrid('all');
})();

document.addEventListener('DOMContentLoaded', function () {
    if (typeof initScrollReveal === 'function') initScrollReveal();
});
