document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();

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
        card.querySelectorAll('.permit-document-button, .permit-row__open').forEach((trigger) => {
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
