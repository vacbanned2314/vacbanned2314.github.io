document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal({ skipInside: ['.portfolio-page'] });
    initFeaturedGallery();
    initPortfolioSliders();
    initPortfolioLightbox();
    initPortfolioAnimations();
});

function initFeaturedGallery() {
    const gallery = document.getElementById('portfolio-featured-gallery');
    if (!gallery) return;

    const mainBtn = gallery.querySelector('.portfolio-featured-main');
    const mainImg = gallery.querySelector('.portfolio-featured-img');
    const captionEl = gallery.querySelector('.portfolio-featured-caption');
    const counterEl = gallery.querySelector('.portfolio-featured-counter');
    const prevBtn = gallery.querySelector('.portfolio-featured-arrow--prev');
    const nextBtn = gallery.querySelector('.portfolio-featured-arrow--next');
    const thumbs = [...gallery.querySelectorAll('.portfolio-featured-thumb')];

    if (!mainBtn || !mainImg || !captionEl || !counterEl || !prevBtn || !nextBtn || !thumbs.length) return;

    const slides = thumbs.map((thumb) => ({
        src: thumb.dataset.src,
        caption: thumb.dataset.caption || '',
        label: thumb.dataset.label || '',
        alt: thumb.getAttribute('aria-label') || thumb.dataset.label || ''
    }));

    let active = 0;

    const applySlide = (index) => {
        const slide = slides[index];
        mainImg.src = slide.src;
        mainImg.alt = slide.alt;
        mainBtn.dataset.lightbox = slide.src;
        mainBtn.dataset.caption = slide.caption;
        captionEl.textContent = slide.label;
        counterEl.textContent = `${index + 1} / ${slides.length}`;

        thumbs.forEach((thumb, i) => {
            const isActive = i === index;
            thumb.classList.toggle('is-active', isActive);
            thumb.setAttribute('aria-selected', String(isActive));
        });

        prevBtn.disabled = index <= 0;
        nextBtn.disabled = index >= slides.length - 1;

        const activeThumb = thumbs[index];
        if (activeThumb) {
            activeThumb.scrollIntoView({
                behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    };

    const goTo = (index) => {
        if (index < 0 || index >= slides.length || index === active) return;
        active = index;

        if (!prefersReducedMotion() && typeof gsap !== 'undefined') {
            gsap.to(mainImg, {
                autoAlpha: 0,
                y: 8,
                duration: 0.18,
                ease: 'power2.in',
                onComplete: () => {
                    applySlide(active);
                    gsap.fromTo(mainImg, { autoAlpha: 0, y: -8 }, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.4,
                        ease: 'power3.out'
                    });
                    gsap.fromTo(captionEl, { autoAlpha: 0, y: 6 }, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.35,
                        ease: 'power2.out'
                    });
                }
            });
            return;
        }

        applySlide(active);
    };

    thumbs.forEach((thumb, i) => {
        thumb.addEventListener('click', () => goTo(i));
    });

    prevBtn.addEventListener('click', () => goTo(active - 1));
    nextBtn.addEventListener('click', () => goTo(active + 1));

    gallery.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(active - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            goTo(active + 1);
        }
    });

    let touchStartX = 0;
    const stage = gallery.querySelector('.portfolio-featured-stage');
    if (stage) {
        stage.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        stage.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) < 50) return;
            if (diff > 0) goTo(active + 1);
            else goTo(active - 1);
        }, { passive: true });
    }

    applySlide(0);
}

function initPortfolioSliders() {
    document.querySelectorAll('[data-slider]').forEach((slider) => {
        const viewport = slider.querySelector('.portfolio-mini-viewport');
        const track = slider.querySelector('.portfolio-mini-track');
        const prevBtn = slider.querySelector('.portfolio-mini-arrow--prev');
        const nextBtn = slider.querySelector('.portfolio-mini-arrow--next');
        const dotsWrap = slider.querySelector('.portfolio-mini-dots');

        if (!viewport || !track || !prevBtn || !nextBtn || !dotsWrap) return;

        const slides = [...track.querySelectorAll('.portfolio-mini-slide')];
        if (!slides.length) return;

        const useCounter = slides.length > 10;
        let counterEl = null;

        if (useCounter) {
            counterEl = document.createElement('span');
            counterEl.className = 'portfolio-mini-counter';
            counterEl.setAttribute('aria-live', 'polite');
            slider.appendChild(counterEl);
        } else {
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'portfolio-mini-dot';
                dot.setAttribute('aria-label', `Фото ${i + 1}`);
                dot.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
                dot.addEventListener('click', () => goTo(i));
                dotsWrap.appendChild(dot);
            });
        }

        const dots = useCounter ? [] : [...dotsWrap.querySelectorAll('.portfolio-mini-dot')];

        const getActiveIndex = () => {
            const scrollLeft = viewport.scrollLeft;
            let closest = 0;
            let minDiff = Infinity;

            slides.forEach((slide, index) => {
                const diff = Math.abs(slide.offsetLeft - scrollLeft);
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = index;
                }
            });

            return closest;
        };

        const goTo = (index) => {
            const target = slides[index];
            if (!target) return;

            target.scrollIntoView({
                behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                inline: 'start',
                block: 'nearest'
            });
        };

        const updateUI = () => {
            const active = getActiveIndex();
            prevBtn.disabled = active <= 0;
            nextBtn.disabled = active >= slides.length - 1;
            if (counterEl) {
                counterEl.textContent = `${active + 1} / ${slides.length}`;
            } else {
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === active);
                    dot.setAttribute('aria-pressed', String(i === active));
                });
            }
        };

        prevBtn.addEventListener('click', () => goTo(getActiveIndex() - 1));
        nextBtn.addEventListener('click', () => goTo(getActiveIndex() + 1));
        viewport.addEventListener('scroll', updateUI, { passive: true });

        slider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goTo(getActiveIndex() - 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goTo(getActiveIndex() + 1);
            }
        });

        let touchStartX = 0;
        viewport.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        viewport.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) < 40) return;
            if (diff > 0) goTo(getActiveIndex() + 1);
            else goTo(getActiveIndex() - 1);
        }, { passive: true });

        updateUI();
    });
}

function initPortfolioLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');

    function openLightbox(src, caption, alt) {
        lightboxImg.src = src;
        lightboxImg.alt = alt || caption || 'Фото объекта';
        lightboxCaption.textContent = caption || '';
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lightboxImg.removeAttribute('src');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.portfolio-slide-open').forEach((btn) => {
        btn.addEventListener('click', () => {
            openLightbox(
                btn.dataset.lightbox,
                btn.dataset.caption,
                btn.querySelector('img')?.alt
            );
        });
    });

    lightbox.querySelectorAll('[data-close-lightbox]').forEach((el) => {
        el.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
}

function initPortfolioAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const skip = prefersReducedMotion();

    document.querySelectorAll('.portfolio-card').forEach((card) => {
        const isFeatured = card.classList.contains('portfolio-card--featured');

        if (skip) {
            gsap.set(card, { autoAlpha: 1, y: 0 });
            return;
        }

        gsap.from(card, {
            autoAlpha: 0,
            y: isFeatured ? 32 : 24,
            duration: isFeatured ? 0.9 : 0.7,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                toggleActions: 'play none none none'
            }
        });
    });

    let resizeTimer;
    const refreshScroll = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    window.addEventListener('resize', refreshScroll);
    window.addEventListener('orientationchange', refreshScroll);
}
