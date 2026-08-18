document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();

    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');

    function openLightbox(src, caption, alt) {
        lightboxImg.src = src;
        lightboxImg.alt = alt || caption || 'Документ';
        lightboxCaption.textContent = caption || '';
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lightboxImg.removeAttribute('src');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.license-card').forEach(card => {
        const btn = card.querySelector('.license-preview');
        if (!btn) return;
        btn.addEventListener('click', () => {
            openLightbox(
                card.dataset.lightbox,
                card.dataset.caption,
                btn.querySelector('img')?.alt
            );
        });
    });

    lightbox.querySelectorAll('[data-close-lightbox]').forEach(el => {
        el.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
});
