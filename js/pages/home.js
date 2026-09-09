document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal({ skipInside: ['#about', '#services', '#trust'] });

    const reducedMotion = prefersReducedMotion();
    const mobileMedia = window.matchMedia('(max-width: 768px)');
    const boilerMedia = window.matchMedia('(min-width: 769px)');
    const isMobile = mobileMedia.matches;
    const heroDecorBlock = document.getElementById('hero-decor-block');
    const boilerWidget = heroDecorBlock?.querySelector('.boiler-widget');
    const skipHeavyMotion = reducedMotion || isMobile;
    const showBoilerWidget = Boolean(boilerWidget) && boilerMedia.matches;
    let boilerInstance = null;
    let boilerSyncVersion = 0;

    initHomePortfolioPreview();
    initAboutScope();
    initMobileServicesAccordion();
    initMobileConversionBar();

    const syncBoilerWidget = () => {
        const syncVersion = ++boilerSyncVersion;

        if (!boilerWidget || !boilerMedia.matches) {
            boilerInstance?.destroy?.();
            boilerInstance = null;
            return;
        }

        if (boilerInstance || typeof window.loadDesktopBoiler !== 'function') return;

        window.loadDesktopBoiler()
            .then((initializer) => {
                if (syncVersion !== boilerSyncVersion || !boilerMedia.matches || !initializer || boilerInstance) return;
                boilerInstance = initializer(boilerWidget, {
                    reducedMotion,
                    mobile: false
                });
            })
            .catch(() => {
                if (syncVersion !== boilerSyncVersion) return;
                boilerWidget.querySelector('.boiler-widget__fallback')?.removeAttribute('hidden');
            });
    };

    syncBoilerWidget();
    boilerMedia.addEventListener('change', syncBoilerWidget);

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    if (skipHeavyMotion) {
        gsap.set('.gsap-text, .gsap-fade, .gsap-stat', {
            autoAlpha: 1, y: 0, scale: 1
        });
    } else {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        gsap.set('.gsap-text, .gsap-fade, .gsap-stat', { autoAlpha: 0 });
        gsap.set('.gsap-text', { y: 50 });
        gsap.set('.gsap-fade', { y: 20 });
        gsap.set('.gsap-stat', { y: 24, scale: 0.97 });

        tl.to('.gsap-text', { autoAlpha: 1, y: 0, stagger: 0.1, duration: 1 })
          .to('.gsap-fade', { autoAlpha: 1, y: 0, stagger: 0.1, duration: 1 }, '-=0.6')
          .to('.gsap-stat', { autoAlpha: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.75 }, '-=0.45');
    }

    if (showBoilerWidget && typeof gsap !== 'undefined') {
        if (skipHeavyMotion) {
            gsap.set(boilerWidget, { autoAlpha: 1, y: 0 });
        } else {
            gsap.set(boilerWidget, { autoAlpha: 0, y: 14 });
            gsap.to(boilerWidget, {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
                delay: 0.35,
                ease: 'power3.out'
            });
        }
    }

    function fadeInSection(selector, start = 'top 75%') {
        const section = document.querySelector(selector);
        if (!section) return;

        if (skipHeavyMotion) {
            gsap.set(section, { autoAlpha: 1, y: 0 });
            return;
        }

        gsap.set(section, { autoAlpha: 0, y: 16 });
        gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start,
                toggleActions: 'play none none none'
            },
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    }

    const aboutSection = document.querySelector('#about');

    if (aboutSection) {
        fadeInSection('#about');

        const editorialBenefits = aboutSection.querySelector('.editorial-benefits');
        if (editorialBenefits && !skipHeavyMotion) {
            const benefitItems = editorialBenefits.querySelectorAll('.editorial-benefit');
            gsap.set(benefitItems, { autoAlpha: 0, x: -16 });
            gsap.to(benefitItems, {
                scrollTrigger: {
                    trigger: editorialBenefits,
                    start: 'top 78%',
                    toggleActions: 'play none none none'
                },
                autoAlpha: 1,
                x: 0,
                duration: 0.42,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }

        if (skipHeavyMotion) {
            aboutSection.querySelectorAll('.stat-count').forEach(el => {
                const target = parseInt(el.dataset.count, 10);
                if (!isNaN(target)) el.textContent = target;
            });
        } else {
            const aboutTl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#about',
                    start: 'top 75%',
                    toggleActions: 'play none none none'
                }
            });

            aboutSection.querySelectorAll('.stat-count').forEach(el => {
                const target = parseInt(el.dataset.count, 10);
                if (isNaN(target)) return;
                const counter = { val: 0 };
                aboutTl.to(counter, {
                    val: target,
                    duration: 1.4,
                    ease: 'power2.out',
                    onUpdate: () => { el.textContent = Math.round(counter.val); }
                }, 0);
            });
        }

        bindIconHover('#about .about-feature', '.about-feature-icon', skipHeavyMotion);
    }

    if (document.querySelector('#services')) {
        const pipelinePath = document.querySelector('.pipeline-path-active');
        if (pipelinePath) gsap.set(pipelinePath, { strokeDashoffset: 0 });
        updatePipelinePath();
        fadeInSection('#services');
        bindIconHover('#services .service-card', '.service-icon-wrap', skipHeavyMotion);
    }

    if (document.querySelector('#trust')) {
        fadeInSection('#trust');
        bindIconHover('#trust .review-card', '.review-icon-wrap', skipHeavyMotion, -5);
        initReviewReadMore();
        initReviewsCarousel();
    }

    let resizeTimer;
    const refreshScroll = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updatePipelinePath();
            ScrollTrigger.refresh();
        }, 150);
    };
    window.addEventListener('resize', refreshScroll);
    window.addEventListener('orientationchange', refreshScroll);
});

function initMobileServicesAccordion() {
    const section = document.querySelector('#services');
    if (!section) return;

    const mobileMedia = window.matchMedia('(max-width: 768px)');
    const cards = [...section.querySelectorAll('.service-card')];
    const buttons = cards.map((card) => card.querySelector('[data-service-toggle]'));
    if (!cards.length || buttons.some((button) => !button)) return;

    const setOpenCard = (activeCard) => {
        cards.forEach((card, index) => {
            const button = buttons[index];
            const isOpen = !mobileMedia.matches || card === activeCard;
            const title = card.querySelector('.service-name')?.textContent?.trim() || 'этапа';

            card.classList.toggle('is-open', isOpen);
            button.setAttribute('aria-expanded', String(isOpen));
            button.setAttribute('aria-label', `${isOpen ? 'Скрыть' : 'Показать'} описание этапа «${title}»`);
        });
    };

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            if (!mobileMedia.matches) return;
            const card = cards[index];
            setOpenCard(card.classList.contains('is-open') ? null : card);
        });
    });

    const sync = () => {
        const activeCard = cards.find((card) => card.classList.contains('is-open')) || cards[0];
        setOpenCard(mobileMedia.matches ? activeCard : null);
    };

    mobileMedia.addEventListener('change', sync);
    sync();
}

function initAboutScope() {
    const rows = [...document.querySelectorAll('#about .about-route-scope-row')];
    if (!rows.length) return;

    rows.forEach((row) => {
        const button = row.querySelector('[data-about-scope-toggle]');
        const detail = row.querySelector('p');
        if (!button || !detail) return;

        button.addEventListener('click', () => {
            const willOpen = button.getAttribute('aria-expanded') !== 'true';

            rows.forEach((item) => {
                const itemButton = item.querySelector('[data-about-scope-toggle]');
                const itemDetail = item.querySelector('p');
                const open = item === row && willOpen;

                item.classList.toggle('is-open', open);
                itemButton?.setAttribute('aria-expanded', String(open));
                if (itemDetail) itemDetail.hidden = !open;
            });
        });
    });
}

function initHomePortfolioPreview() {
    const section = document.getElementById('portfolio-preview');
    if (!section) return;

    const gallery = section.querySelector('.home-portfolio-gallery');
    const projects = [...section.querySelectorAll('.home-portfolio-project')];
    const projectList = section.querySelector('.home-portfolio-projects');
    const image = section.querySelector('[data-home-portfolio-image]');
    const imageButton = section.querySelector('.home-portfolio-image-button');
    const prevBtn = section.querySelector('[data-home-portfolio-prev]');
    const nextBtn = section.querySelector('[data-home-portfolio-next]');
    const openButtons = [...section.querySelectorAll('[data-home-portfolio-open]')];
    const currentEl = section.querySelector('[data-home-portfolio-current]');
    const titleEl = section.querySelector('[data-home-portfolio-stage-title]');
    const metaEl = section.querySelector('[data-home-portfolio-stage-meta]');
    const progressEl = section.querySelector('[data-home-portfolio-progress]');
    const lightbox = document.querySelector('[data-home-portfolio-lightbox]');
    const lightboxImage = lightbox?.querySelector('[data-home-portfolio-lightbox-image]');
    const lightboxCaption = lightbox?.querySelector('[data-home-portfolio-lightbox-caption]');
    let active = 0;
    let shown = 0;
    let touchStartX = 0;
    let lastFocus = null;
    let swapSequence = 0;

    if (!gallery || !projects.length || !image || !imageButton || !prevBtn || !nextBtn) return;

    const applyProjectImage = (project) => {
        image.src = project.dataset.src;
        image.alt = project.dataset.alt;
        image.classList.toggle('is-floor-photo', project.dataset.photoFit === 'level-floor');
    };

    const preloadAndApplyProjectImage = (project, sequence) => {
        const preloader = new Image();
        let committed = false;

        const commit = () => {
            if (committed || sequence !== swapSequence || preloader.naturalWidth === 0) return;
            committed = true;
            applyProjectImage(project);
        };

        const decodeAndCommit = () => {
            if (typeof preloader.decode === 'function') {
                preloader.decode().catch(() => {}).then(commit);
            } else {
                commit();
            }
        };

        preloader.onload = decodeAndCommit;
        preloader.onerror = () => {};
        preloader.src = project.dataset.src;
        if (preloader.complete && preloader.naturalWidth > 0) decodeAndCommit();
    };

    const render = (index, waitForLoad = true) => {
        const project = projects[index];
        shown = index;
        const sequence = ++swapSequence;

        if (waitForLoad && image.getAttribute('src') !== project.dataset.src) {
            preloadAndApplyProjectImage(project, sequence);
        } else {
            applyProjectImage(project);
        }
        imageButton.setAttribute('aria-label', `Открыть фото: ${project.dataset.title}`);
        currentEl.textContent = String(index + 1).padStart(2, '0');
        titleEl.textContent = project.dataset.title;
        metaEl.textContent = project.dataset.meta;
        progressEl.style.transform = `scaleX(${(index + 1) / projects.length})`;
        projects.forEach((item, projectIndex) => {
            const isActive = projectIndex === active;
            item.classList.toggle('is-active', isActive);
            item.classList.toggle('is-preview', projectIndex === index && !isActive);
            item.setAttribute('aria-selected', isActive ? 'true' : 'false');
            item.tabIndex = isActive ? 0 : -1;
        });
        prevBtn.disabled = active === 0;
        nextBtn.disabled = active === projects.length - 1;
    };

    const goTo = (index) => {
        active = Math.max(0, Math.min(projects.length - 1, index));
        render(active);
    };

    const openLightbox = () => {
        if (!lightbox || !lightboxImage || !lightboxCaption) return;
        const project = projects[shown];
        lastFocus = document.activeElement;
        lightboxImage.src = project.dataset.src;
        lightboxImage.alt = project.dataset.alt;
        lightboxCaption.textContent = project.dataset.title;
        lightbox.hidden = false;
        window.setModalBackgroundInert?.(lightbox, true);
        document.body.style.overflow = 'hidden';
        lightbox.querySelector('.home-portfolio-lightbox-close')?.focus();
    };

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.hidden = true;
        lightboxImage.removeAttribute('src');
        window.setModalBackgroundInert?.(lightbox, false);
        document.body.style.overflow = '';
        lastFocus?.focus();
    };

    prevBtn.addEventListener('click', () => goTo(active - 1));
    nextBtn.addEventListener('click', () => goTo(active + 1));
    openButtons.forEach((button) => button.addEventListener('click', openLightbox));
    projects.forEach((project, index) => {
        project.addEventListener('pointerenter', () => render(index));
        project.addEventListener('focus', () => render(index));
        project.addEventListener('click', () => goTo(index));
        project.addEventListener('keydown', (event) => {
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
            event.preventDefault();
            const direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
            const nextIndex = Math.max(0, Math.min(projects.length - 1, index + direction));
            goTo(nextIndex);
            projects[nextIndex].focus();
        });
    });
    projectList?.addEventListener('pointerleave', () => render(active));
    projectList?.addEventListener('focusout', (event) => {
        if (!projectList.contains(event.relatedTarget)) render(active);
    });
    lightbox?.querySelectorAll('[data-home-portfolio-close]').forEach((button) => {
        button.addEventListener('click', closeLightbox);
    });

    gallery.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') goTo(active - 1);
        if (event.key === 'ArrowRight') goTo(active + 1);
    });
    gallery.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });
    gallery.addEventListener('touchend', (event) => {
        const diff = touchStartX - event.changedTouches[0].screenX;
        if (Math.abs(diff) > 45) goTo(active + (diff > 0 ? 1 : -1));
    }, { passive: true });
    document.addEventListener('keydown', (event) => {
        if (!lightbox || lightbox.hidden) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            closeLightbox();
            return;
        }
        if (event.key !== 'Tab') return;

        const focusable = window.getFocusableElements?.(lightbox) || [];
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

    render(active, false);
}

function updatePipelinePath() {
    const grid = document.querySelector('.services-grid');
    const track = document.querySelector('.pipeline-track');
    if (!grid || !track) return;

    const cards = [...grid.querySelectorAll('.service-card')];
    if (cards.length < 3) return;

    const gridRect = grid.getBoundingClientRect();
    const row2Top = cards[2].getBoundingClientRect().top - gridRect.top;

    // gap = 30px, gap center = row2Top - 15
    const gapCenter = row2Top - 15;
    const fraction = gapCenter / gridRect.height;
    const svgY = Math.round(fraction * 520);

    const newPath = `M 250 45 H 750 V ${svgY} H 250 V 475 H 750`;
    track.querySelectorAll('path').forEach(path => path.setAttribute('d', newPath));
}

function initReviewReadMore() {
    const section = document.querySelector('#trust');
    if (!section) return;

    const mobileMedia = window.matchMedia('(max-width: 768px)');
    const toggle = section.querySelector('.reviews-mobile-toggle');
    const extraItems = [...section.querySelectorAll('[data-mobile-review-extra]')];
    if (!toggle || !extraItems.length) return;

    let expanded = false;

    const sync = () => {
        if (!mobileMedia.matches) {
            extraItems.forEach((item) => { item.hidden = false; });
            toggle.hidden = true;
            toggle.setAttribute('aria-expanded', 'true');
            return;
        }

        extraItems.forEach((item) => { item.hidden = !expanded; });
        toggle.hidden = false;
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.textContent = expanded ? 'Скрыть дополнительные отзывы' : 'Показать ещё 2 отзыва';
    };

    toggle.addEventListener('click', () => {
        expanded = !expanded;
        sync();
    });

    mobileMedia.addEventListener('change', sync);
    sync();
}

function initMobileConversionBar() {
    const bar = document.querySelector('[data-mobile-conversion]');
    const hero = document.querySelector('.hero');
    const formSection = document.querySelector('#calc');
    const footer = document.querySelector('.main-footer');
    if (!bar || !hero || !formSection || !footer) return;

    const mobileMedia = window.matchMedia('(max-width: 768px)');
    const visibility = new Map([[hero, true], [formSection, false], [footer, false]]);

    const sync = () => {
        const shouldShow = mobileMedia.matches
            && !visibility.get(hero)
            && !visibility.get(formSection)
            && !visibility.get(footer);

        bar.classList.toggle('is-visible', shouldShow);
        bar.setAttribute('aria-hidden', String(!shouldShow));
        if (shouldShow) bar.removeAttribute('inert');
        else bar.setAttribute('inert', '');
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => visibility.set(entry.target, entry.isIntersecting));
        sync();
    }, { threshold: 0.01 });

    observer.observe(hero);
    observer.observe(formSection);
    observer.observe(footer);
    mobileMedia.addEventListener('change', sync);
    sync();
}

function initReviewsCarousel() {
    const carousel = document.querySelector('#trust .reviews-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.reviews-grid');
    const prevBtn = carousel.querySelector('.reviews-carousel-arrow--prev');
    const nextBtn = carousel.querySelector('.reviews-carousel-arrow--next');
    if (!track || !prevBtn || !nextBtn) return;

    const mq = window.matchMedia('(max-width: 767px)');

    const getItems = () => [...track.querySelectorAll('.review-card, .rating-card')];

    const getActiveIndex = () => {
        const items = getItems();
        if (!items.length) return 0;

        const scrollLeft = track.scrollLeft;
        let closest = 0;
        let minDiff = Infinity;

        items.forEach((item, index) => {
            const diff = Math.abs(item.offsetLeft - track.offsetLeft - scrollLeft);
            if (diff < minDiff) {
                minDiff = diff;
                closest = index;
            }
        });

        return closest;
    };

    const scrollToIndex = (index) => {
        const items = getItems();
        const target = items[index];
        if (!target) return;

        target.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            inline: 'start',
            block: 'nearest'
        });
    };

    const updateButtons = () => {
        const enabled = mq.matches;
        prevBtn.disabled = !enabled || getActiveIndex() <= 0;
        nextBtn.disabled = !enabled || getActiveIndex() >= getItems().length - 1;
    };

    prevBtn.addEventListener('click', () => {
        scrollToIndex(getActiveIndex() - 1);
    });

    nextBtn.addEventListener('click', () => {
        scrollToIndex(getActiveIndex() + 1);
    });

    track.addEventListener('scroll', updateButtons, { passive: true });
    mq.addEventListener('change', updateButtons);
    window.addEventListener('resize', updateButtons);
    updateButtons();
}

function bindIconHover(cardSelector, iconSelector, skipMotion, rotation = 5) {
    if (skipMotion) return;

    document.querySelectorAll(cardSelector).forEach(card => {
        const icon = card.querySelector(iconSelector);
        if (!icon) return;

        card.addEventListener('mouseenter', () => {
            gsap.to(icon, { rotation, scale: 1.08, duration: 0.35, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(icon, { rotation: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
        });
    });
}
