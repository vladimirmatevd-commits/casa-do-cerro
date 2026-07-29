const categoryLinks = document.querySelectorAll('.category-link');
const sections = Array.from(document.querySelectorAll('.menu-category'));

document.documentElement.classList.add('has-js');

// Hero topline: reveal the entire line "COCKTAILS • SHISHAS • TAPAS • GOOD VIBES"
// as ONE continuous typewriter sequence. Every letter and separator dot is treated
// as a single character in the stream and advances by the same small step, so there
// are no noticeable pauses between words or around the dots - it reads as one
// uninterrupted left-to-right typing pass. Timing is computed here so that each
// character's CSS fade-in animation (see .topline-letter/.topline-dot in style.css)
// starts at the correct cumulative delay; the word/dot markup and final text are
// unchanged for no-JS fallback.
(() => {
  const topline = document.querySelector('.menu-topline');
  if (!topline) return;

  const items = Array.from(topline.children);
  const letterStep = 50; // ms between every character (letters and dots alike), within the requested 40-60ms range

  let delay = 250; // initial delay before the first letter starts

  items.forEach((item) => {
    if (item.classList.contains('topline-word')) {
      const text = item.textContent;
      item.textContent = '';
      const fragment = document.createDocumentFragment();

      Array.from(text).forEach((character) => {
        const letter = document.createElement('span');
        letter.className = 'topline-letter';
        letter.textContent = character === ' ' ? '\u00A0' : character;
        letter.style.animationDelay = `${delay}ms`;
        fragment.appendChild(letter);
        delay += letterStep;
      });

      item.appendChild(fragment);
    } else if (item.classList.contains('topline-dot')) {
      item.style.animationDelay = `${delay}ms`;
      delay += letterStep;
    }
  });
})();

if (categoryLinks.length && sections.length) {
  categoryLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        categoryLinks.forEach((nav) => nav.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = document.querySelector(`.category-link[href="#${id}"]`);
        if (entry.isIntersecting && link) {
          categoryLinks.forEach((nav) => nav.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -55% 0px',
      threshold: 0.35,
    }
  );

  sections.forEach((section) => observer.observe(section));

  const heroLine = document.querySelector('.menu-topline');
  const menuCards = Array.from(document.querySelectorAll('.menu-item'));
  const animatedElements = heroLine ? [heroLine, ...menuCards] : menuCards;

  if (animatedElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('menu-topline')) {
              entry.target.classList.add('animate');
            } else {
              entry.target.classList.add('visible');
            }
          } else {
            if (entry.target.classList.contains('menu-topline')) {
              entry.target.classList.remove('animate');
            } else {
              entry.target.classList.remove('visible');
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -25% 0px',
        threshold: 0.25,
      }
    );

    animatedElements.forEach((element) => revealObserver.observe(element));
  }

  const modalOverlay = document.querySelector('.cocktail-modal-overlay');
  const modal = document.querySelector('.cocktail-modal');
  const modalImage = modal?.querySelector('.cocktail-modal-hero img');
  const modalTitle = modal?.querySelector('#cocktail-modal-title');
  const modalIngredients = modal?.querySelector('.cocktail-modal-ingredients');
  const modalPrice = modal?.querySelector('.cocktail-modal-price');
  const modalClose = modal?.querySelector('.cocktail-modal-close');

  // Swipe hint state per open
  let swipeHintTimer = null;
  let swipeHintElement = null;

  const removeSwipeHint = () => {
    if (swipeHintTimer) {
      clearTimeout(swipeHintTimer);
      swipeHintTimer = null;
    }
    if (swipeHintElement && swipeHintElement.parentNode) {
      swipeHintElement.parentNode.removeChild(swipeHintElement);
      swipeHintElement = null;
    }
  };

  const createSwipeHint = () => {
    if (!modal) return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'swipe-hint';
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.innerHTML = `
      <svg class="swipe-hint-hand" width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M17 4.5c1.9 0 3.5 1.6 3.5 3.5v5.1h1.3c1.2 0 2.2.9 2.2 2.1 0 1-.7 1.8-1.6 2.1l-1.7.6v4.5c0 2.1-1.7 3.8-3.8 3.8h-2.4c-1.6 0-3-1.1-3.5-2.6l-1.8-4.6-1.5 1.1c-.8.6-1.9.5-2.5-.3-.6-.8-.5-1.9.2-2.5l4.4-3.2V8c0-1.9 1.6-3.5 3.5-3.5h1.2z" fill="currentColor"/>
      </svg>
      <svg class="swipe-hint-arrow" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 3v14M12 17l-4-4M12 17l4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    return wrapper;
  };

  const showSwipeHint = () => {
    if (!modalOverlay?.classList.contains('open')) return;
    removeSwipeHint();
    swipeHintElement = createSwipeHint();
    if (!swipeHintElement) return;
    modal.appendChild(swipeHintElement);
    requestAnimationFrame(() => {
      swipeHintElement.classList.add('visible');
    });
  };

  const closeModal = () => {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modal.style.transform = '';
    modalOverlay.style.background = '';
    removeSwipeHint();
  };

  const openModal = (card) => {
    if (!modalOverlay || !modal || !modalImage || !modalTitle || !modalIngredients || !modalPrice) return;
    const imageSrc = card.dataset.modalImage || card.querySelector('img')?.src || '';
    const title = card.dataset.modalName || card.querySelector('h3')?.textContent || '';
    const ingredients = card.dataset.modalIngredients || card.querySelector('.item-subtitle')?.textContent || '';
    const price = card.dataset.modalPrice || card.querySelector('.price')?.textContent || '';

    modalImage.src = imageSrc;
    modalImage.alt = `${title} cocktail`;
    modalTitle.textContent = title;
    modalIngredients.textContent = ingredients;
    modalPrice.textContent = price;

    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modalClose?.focus();

    removeSwipeHint();
    swipeHintTimer = window.setTimeout(() => {
      if (modalOverlay.classList.contains('open')) {
        showSwipeHint();
      }
    }, 5000);
  };

  const cocktailCards = document.querySelectorAll('#cocktails .menu-item');
  cocktailCards.forEach((card) => {
    const thumb = card.querySelector('.menu-item-thumb');
    if (!thumb) return;
    thumb.addEventListener('click', () => openModal(card));
  });

  modalOverlay?.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });

  modalClose?.addEventListener('click', closeModal);

  // Close modal with Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalOverlay?.classList.contains('open')) {
      closeModal();
    }
  });

  // Swipe-to-close (mobile) with protection against accidental scroll.
  (function setupModalSwipe() {
    if (!modal) return;
    let startY = 0;
    let currentY = 0;
    let touching = false;
    let isDragging = false;
    const dragThreshold = 80; // px
    const maxDrag = 300; // px

    const onTouchStart = (e) => {
      if (!modalOverlay.classList.contains('open')) return;
      if (e.touches && e.touches.length === 1) {
        startY = e.touches[0].clientY;
        currentY = startY;
        touching = true;
        isDragging = false;
        // only allow swipe if the modal content is scrolled to top
        const content = modal.querySelector('.cocktail-modal-content');
        if (content) {
          // if user started inside content and it can scroll and isn't at top, don't start swipe
          const path = e.composedPath ? e.composedPath() : (e.path || []);
          const startedInsideContent = path.includes(content) || content.contains(e.target);
          if (startedInsideContent && content.scrollTop > 0) {
            touching = false;
            return;
          }
        }
      }
    };

    const onTouchMove = (e) => {
      if (!touching || !modalOverlay.classList.contains('open')) return;
      currentY = e.touches[0].clientY;
      const dy = Math.max(0, currentY - startY);
      if (dy > 6) {
        isDragging = true;
      }
      if (isDragging) {
        // move modal with touch for interactive feel
        const t = Math.min(dy, maxDrag);
        const scale = Math.max(0.94, 1 - t / 1200);
        modal.style.transform = `translateY(${t}px) scale(${scale})`;
        modal.style.transition = 'none';
        // dim overlay slightly while dragging
        modalOverlay.style.background = `rgba(7,6,5,${0.85 - Math.min(0.6, t / 800)})`;
      }
    };

    const onTouchEnd = (e) => {
      if (!touching) return;
      touching = false;
      const dy = Math.max(0, currentY - startY);
      modal.style.transition = ''; // restore
      modalOverlay.style.background = '';
      if (isDragging && dy > dragThreshold) {
        // trigger close; animate back via existing close
        // reset inline transform briefly to allow smooth reverse animation
        modal.style.transform = '';
        closeModal();
      } else {
        // restore modal position
        modal.style.transform = '';
      }
      isDragging = false;
    };

    modal.addEventListener('touchstart', onTouchStart, { passive: true });
    modal.addEventListener('touchmove', onTouchMove, { passive: true });
    modal.addEventListener('touchend', onTouchEnd, { passive: true });
  })();

  // PARALLAX BACKGROUND (subtle, performant)
  (function setupParallax() {
    const heroBg = document.querySelector('.hero-background');
    if (!heroBg) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return; // disable for reduced motion

    let lastScroll = window.scrollY;
    let ticking = false;
    const intensity = 0.18; // 18% slower (between 0.15 - 0.25)

    function update() {
      const scrollY = window.scrollY;
      const delta = scrollY * intensity;
      heroBg.style.transform = `translateY(${Math.round(delta)}px) scale(1.05)`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      lastScroll = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  })();
}
