function initFaqNav() {
    const nav = document.querySelector('.faq-nav');
    if (!nav) return;

    nav.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', event => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;

            event.preventDefault();
            const offset = typeof getHeaderOffset === 'function' ? getHeaderOffset(24) : 140;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
            window.scrollTo({ top, behavior });
        });
    });
}

function initFaqNavScroll() {
    const bar = document.querySelector('.faq-nav-bar');
    if (!bar) return;

    const nav = bar.querySelector('.faq-nav');
    const prevBtn = bar.querySelector('.faq-nav-arrow--prev');
    const nextBtn = bar.querySelector('.faq-nav-arrow--next');
    if (!nav || !prevBtn || !nextBtn) return;

    const mq = window.matchMedia('(max-width: 1024px)');

    const scrollStep = () => Math.max(nav.clientWidth * 0.7, 140);

    const updateArrows = () => {
        if (!mq.matches) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }

        const maxScroll = nav.scrollWidth - nav.clientWidth;
        prevBtn.disabled = nav.scrollLeft <= 2;
        nextBtn.disabled = nav.scrollLeft >= maxScroll - 2;
    };

    const scrollByStep = (direction) => {
        nav.scrollBy({
            left: direction * scrollStep(),
            behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });
    };

    prevBtn.addEventListener('click', () => scrollByStep(-1));
    nextBtn.addEventListener('click', () => scrollByStep(1));
    nav.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    mq.addEventListener('change', updateArrows);
    updateArrows();
}

function initFaqHash() {
    const hash = window.location.hash;
    if (!hash) return;

    const target = document.querySelector(hash);
    if (!target || !target.classList.contains('faq-category')) return;

    const firstItem = target.querySelector('.faq-item');
    if (firstItem) firstItem.open = true;

    requestAnimationFrame(() => {
        const offset = typeof getHeaderOffset === 'function' ? getHeaderOffset(24) : 140;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
        window.scrollTo({ top, behavior });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initFaqNav();
    initFaqNavScroll();
    initFaqHash();
});
