const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getHeaderOffset(extra = 16) {
    const header = document.querySelector('.pill-header');
    if (!header) return 100;
    return header.getBoundingClientRect().height + extra;
}

function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;

    if (!themeToggleBtn) return;

    const syncThemeState = () => {
        const isDark = root.getAttribute('data-theme') !== 'light';
        themeToggleBtn.setAttribute('aria-pressed', String(isDark));
        themeToggleBtn.setAttribute(
            'aria-label',
            isDark ? 'Включить светлую тему' : 'Включить тёмную тему'
        );
    };

    syncThemeState();

    themeToggleBtn.addEventListener('click', () => {
        const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        syncThemeState();
    });
}

function initMobileNav() {
    const burger = document.querySelector('.burger-btn');
    const nav = document.getElementById('main-nav');
    const backdrop = document.getElementById('nav-backdrop');

    if (!burger || !nav) return;

    let lastFocus = null;

    const setOpen = (open) => {
        nav.classList.toggle('active', open);
        burger.classList.toggle('toggle', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
        document.body.classList.toggle('nav-open', open);

        if (backdrop) {
            backdrop.hidden = !open;
            backdrop.classList.toggle('is-visible', open);
            backdrop.setAttribute('aria-hidden', String(!open));
        }

        if (open) {
            lastFocus = document.activeElement;
            const firstLink = nav.querySelector('a');
            if (firstLink) firstLink.focus();
        } else if (lastFocus) {
            lastFocus.focus();
            lastFocus = null;
        }
    };

    const close = () => setOpen(false);
    const toggle = () => setOpen(!nav.classList.contains('active'));

    burger.addEventListener('click', toggle);

    nav.querySelectorAll('a').forEach(item => {
        item.addEventListener('click', close);
    });

    if (backdrop) {
        backdrop.addEventListener('click', close);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            e.preventDefault();
            close();
        }
    });

    document.addEventListener('click', (e) => {
        if (!nav.classList.contains('active')) return;
        if (nav.contains(e.target) || burger.contains(e.target)) return;
        close();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) close();
    });
}

function initScrollReveal(options = {}) {
    const skipInside = new Set(options.skipInside || []);
    const selector = options.selector || '.scroll-reveal';
    const elements = [];

    document.querySelectorAll(selector).forEach(element => {
        for (const id of skipInside) {
            if (element.closest(id)) return;
        }
        elements.push(element);
    });

    if (!elements.length) return;

    if (prefersReducedMotion()) {
        elements.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

    elements.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
});
