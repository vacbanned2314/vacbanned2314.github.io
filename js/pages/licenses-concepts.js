document.addEventListener('DOMContentLoaded', () => {
    const tabs = [...document.querySelectorAll('.lc-tab')];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const activateTab = (nextTab, options = {}) => {
        const { focus = false, scroll = true } = options;

        tabs.forEach((tab, index) => {
            const isActive = tab === nextTab;
            tab.setAttribute('aria-selected', String(isActive));
            tab.tabIndex = isActive ? 0 : -1;
            panels[index].hidden = !isActive;
        });

        if (focus) nextTab.focus({ preventScroll: true });

        if (scroll && window.scrollY > 24) {
            window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateTab(tab, { scroll: true }));
        tab.addEventListener('keydown', (event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();

            let nextIndex = index;
            if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
            if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = tabs.length - 1;

            activateTab(tabs[nextIndex], { focus: true, scroll: true });
        });
    });

    const lightbox = document.getElementById('lc-lightbox');
    if (!lightbox) return;

    const dialog = lightbox.querySelector('.lc-lightbox__dialog');
    const image = lightbox.querySelector('.lc-lightbox__image');
    const title = document.getElementById('lc-lightbox-title');
    const meta = document.getElementById('lc-lightbox-meta');
    const closeButton = lightbox.querySelector('.lc-lightbox__close');
    let returnFocus = null;
    let bodyPaddingRight = '';

    const openLightbox = (trigger) => {
        const previewImage = trigger.querySelector('img');
        returnFocus = trigger;
        image.src = trigger.dataset.src || previewImage?.src || '';
        image.alt = previewImage?.alt || trigger.dataset.title || 'Документ';
        title.textContent = trigger.dataset.title || 'Документ';
        meta.textContent = trigger.dataset.meta || '';
        lightbox.hidden = false;

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        bodyPaddingRight = document.body.style.paddingRight;
        if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';

        closeButton.focus({ preventScroll: true });
    };

    const closeLightbox = () => {
        if (lightbox.hidden) return;
        lightbox.hidden = true;
        image.removeAttribute('src');
        document.body.style.overflow = '';
        document.body.style.paddingRight = bodyPaddingRight;
        returnFocus?.focus({ preventScroll: true });
        returnFocus = null;
    };

    document.querySelectorAll('[data-doc-open]').forEach((trigger) => {
        trigger.addEventListener('click', () => openLightbox(trigger));
    });

    lightbox.querySelectorAll('[data-doc-close]').forEach((control) => {
        control.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', (event) => {
        if (lightbox.hidden) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            closeLightbox();
            return;
        }

        if (event.key !== 'Tab') return;

        const focusable = [...dialog.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
            .filter((element) => element.offsetParent !== null);
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
