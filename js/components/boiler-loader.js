'use strict';

(() => {
    const desktopMedia = window.matchMedia('(min-width: 769px)');
    const stylesheetHref = 'css/boiler-widget.css?v=20260826-desktop-only-7';
    const scriptSources = [
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
        'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
        'js/components/boiler-widget.js?v=20260826-boiler-19'
    ];

    let dependencyPromise = null;

    const loadStylesheet = () => new Promise((resolve, reject) => {
        const existing = document.querySelector('link[data-boiler-styles]');
        if (existing) {
            if (existing.sheet) resolve(existing);
            else {
                existing.addEventListener('load', () => resolve(existing), { once: true });
                existing.addEventListener('error', reject, { once: true });
            }
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = stylesheetHref;
        link.dataset.boilerStyles = '';
        link.addEventListener('load', () => resolve(link), { once: true });
        link.addEventListener('error', reject, { once: true });
        const cascadeAnchor = document.querySelector('link[href*="animations.css"]');
        document.head.insertBefore(link, cascadeAnchor || null);
    });

    const loadScript = (src) => new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-boiler-src="${src}"]`);
        if (existing) {
            if (existing.dataset.loaded === 'true') resolve(existing);
            else {
                existing.addEventListener('load', () => resolve(existing), { once: true });
                existing.addEventListener('error', reject, { once: true });
            }
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.dataset.boilerSrc = src;
        script.addEventListener('load', () => {
            script.dataset.loaded = 'true';
            resolve(script);
        }, { once: true });
        script.addEventListener('error', reject, { once: true });
        document.head.appendChild(script);
    });

    window.loadDesktopBoiler = () => {
        if (!desktopMedia.matches) return Promise.resolve(null);
        if (typeof window.initBoilerWidget === 'function') {
            return Promise.resolve(window.initBoilerWidget);
        }

        if (!dependencyPromise) {
            dependencyPromise = loadStylesheet()
                .then(() => scriptSources.reduce(
                    (chain, src) => chain.then(() => loadScript(src)),
                    Promise.resolve()
                ))
                .then(() => {
                    if (typeof window.initBoilerWidget !== 'function') {
                        throw new Error('Boiler widget initializer is unavailable');
                    }
                    return window.initBoilerWidget;
                })
                .catch((error) => {
                    dependencyPromise = null;
                    throw error;
                });
        }

        return dependencyPromise;
    };
})();
