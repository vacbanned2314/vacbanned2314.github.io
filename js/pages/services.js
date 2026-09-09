document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();

    const filterButtons = [...document.querySelectorAll('[data-filter]')];
    const rows = [...document.querySelectorAll('.price-row')];

    const selectFilter = (filter) => {
        filterButtons.forEach((button) => {
            const active = button.dataset.filter === filter;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        rows.forEach((row) => {
            const visible = filter === 'all' || row.dataset.category === filter;
            row.hidden = !visible;
        });
    };

    filterButtons.forEach((button) => button.addEventListener('click', () => selectFilter(button.dataset.filter)));
    document.querySelectorAll('[data-price-filter]').forEach((link) => link.addEventListener('click', () => selectFilter(link.dataset.priceFilter)));
});
