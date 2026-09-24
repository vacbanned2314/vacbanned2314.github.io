// Ответ по марке: данные берутся из строк таблицы документов, чтобы не дублировать их в JS.
function initBrandCheck() {
    const verdict = document.querySelector('.permit-verdict');
    if (!verdict) return;

    const tiles = document.querySelectorAll('[data-brand-pick]');
    const known = verdict.querySelector('.permit-verdict__known');
    const other = verdict.querySelector('.permit-verdict__other');
    const scan = known.querySelector('.permit-verdict__scan img');
    const fields = {};
    known.querySelectorAll('[data-verdict]').forEach((field) => { fields[field.dataset.verdict] = field; });

    const rows = {};
    document.querySelectorAll('.permit-line[data-brand]').forEach((row) => { rows[row.dataset.brand] = row; });

    const pick = (brand) => {
        tiles.forEach((tile) => tile.setAttribute('aria-pressed', String(tile.dataset.brandPick === brand)));
        const row = rows[brand];
        known.hidden = !row;
        other.hidden = Boolean(row);
        if (!row) return;

        const rowImage = row.querySelector('img');
        fields.name.textContent = row.querySelector('h3').textContent;
        fields.kind.textContent = row.dataset.kind;
        fields.term.textContent = row.dataset.term;
        fields.org.textContent = row.dataset.org;
        known.dataset.src = row.dataset.src;
        known.dataset.title = row.dataset.title;
        known.dataset.meta = row.dataset.meta;
        scan.src = rowImage.getAttribute('src');
        scan.alt = rowImage.alt;
        scan.width = rowImage.width;
        scan.height = rowImage.height;
    };

    tiles.forEach((tile) => tile.addEventListener('click', () => {
        pick(tile.dataset.brandPick);
        // На телефоне ответ стоит под плитками: показываем его, если он за экраном.
        if (verdict.getBoundingClientRect().top > window.innerHeight * 0.6) {
            verdict.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
        }
    }));
}

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initBrandCheck();

    const lightbox = document.getElementById('permit-lightbox');
    if (!lightbox) return;

    const dialog = lightbox.querySelector('.permit-lightbox__dialog');
    const image = lightbox.querySelector('.permit-lightbox__image');
    const title = lightbox.querySelector('#permit-lightbox-title');
    const meta = lightbox.querySelector('#permit-lightbox-meta');
    const closeButton = lightbox.querySelector('.permit-lightbox__close');
    let lastTrigger = null;
    let previousBodyPadding = '';

    const getFocusable = () => Array.from(
        dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')
    ).filter((element) => element.offsetParent !== null);

    const openLightbox = (card, trigger) => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        previousBodyPadding = document.body.style.paddingRight;
        lastTrigger = trigger;

        image.src = card.dataset.src;
        image.alt = card.querySelector('img')?.alt || card.dataset.title || 'Документ';
        title.textContent = card.dataset.title || 'Документ';
        meta.textContent = card.dataset.meta || '';
        lightbox.hidden = false;
        window.setModalBackgroundInert?.(lightbox, true);

        if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';
        closeButton.focus();
    };

    const closeLightbox = () => {
        if (lightbox.hidden) return;
        lightbox.hidden = true;
        image.removeAttribute('src');
        image.alt = '';
        window.setModalBackgroundInert?.(lightbox, false);
        document.body.style.overflow = '';
        document.body.style.paddingRight = previousBodyPadding;
        lastTrigger?.focus();
    };

    document.querySelectorAll('[data-permit-document]').forEach((card) => {
        card.querySelectorAll('.permit-document-button').forEach((trigger) => {
            trigger.addEventListener('click', () => openLightbox(card, trigger));
        });
    });

    lightbox.querySelectorAll('[data-permit-close]').forEach((element) => {
        element.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', (event) => {
        if (lightbox.hidden) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            closeLightbox();
            return;
        }

        if (event.key !== 'Tab') return;
        const focusable = getFocusable();
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
});
