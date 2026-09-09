'use strict';

(() => {
    const desktopMedia = window.matchMedia('(min-width: 769px)');
    const scriptSources = [
        'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
        'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
        'js/components/boiler-widget.js'
    ];

    let dependencyPromise = null;

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
            dependencyPromise = scriptSources.reduce(
                (chain, src) => chain.then(() => loadScript(src)),
                Promise.resolve()
            )
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
