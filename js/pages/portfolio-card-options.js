(() => {
    const descriptions = {
        plain: 'Чистая подпись в нижней части кадра. Ничего не отвлекает от фотографии.',
        rail: 'Один оранжевый маркер собирает текст и добавляет карточке инженерный характер.',
        frame: 'Текст заключён в тонкую внутреннюю рамку — карточка читается собраннее, но фото остаётся главным.',
        sheet: 'Светлый паспорт объекта отделяет факты от фотографии. Самый контрастный вариант.'
    };

    const grid = document.getElementById('card-options-grid');
    const hint = document.getElementById('variant-hint');
    const tabs = [...document.querySelectorAll('[data-card-variant]')];

    tabs.forEach(tab => tab.addEventListener('click', () => {
        const variant = tab.dataset.cardVariant;
        grid.dataset.variant = variant;
        hint.textContent = descriptions[variant];
        tabs.forEach(button => button.setAttribute('aria-selected', String(button === tab)));
    }));

    grid.querySelectorAll('.co-card').forEach(card => card.addEventListener('click', () => {
        grid.querySelectorAll('.co-card').forEach(item => item.classList.toggle('is-active', item === card && !card.classList.contains('is-active')));
    }));
})();
