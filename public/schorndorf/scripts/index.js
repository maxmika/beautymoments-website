document.addEventListener('DOMContentLoaded', () => {
  const heroTextSection = document.querySelector('.hero-text-section');
  const heroContent = document.querySelector('.hero-content');
  const introOverlay = document.querySelector('.intro-overlay');

  if (!heroTextSection) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsViewTimeline = CSS.supports('animation-timeline', 'view()');

  // Ohne scroll-getriebene Animationen die Sektion sofort sichtbar zeigen.
  if (reduceMotion || !supportsViewTimeline) {
    heroTextSection.style.animation = 'none';
    heroTextSection.style.opacity = '1';
    heroTextSection.style.transform = 'translateY(0)';
  }

  // Parallax ist rein dekorativ – bei reduzierter Bewegung auslassen.
  if (reduceMotion) return;

  let ticking = false;

  const update = () => {
    if (heroContent) {
      const rect = heroTextSection.getBoundingClientRect();
      const scrollPercent = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight));
      const yOffset = Math.max(-100, scrollPercent * 70 - 100);
      heroContent.style.transform = `translateY(${yOffset}px)`;
    }

    if (introOverlay) {
      const scrollFromTop = Math.max(0, window.scrollY);
      introOverlay.style.transform = `translateY(${-scrollFromTop * 0.5}px)`;
      introOverlay.style.opacity = Math.min(1, Math.max(0, 1 - scrollFromTop / 400));
    }
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    },
    { passive: true }
  );

  update();
});

// Erfahrungen / Google-Rezensionen aus separater JSON laden und rendern.
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('quotes');
  if (!container) return;
  const src = container.dataset.src || 'data/testimonials.json';

  fetch(src)
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then((data) => {
      const reviews = (data && data.reviews) || [];
      if (!reviews.length) {
        container.innerHTML = '';
        return;
      }
      const frag = document.createDocumentFragment();

      reviews.forEach((r) => {
        const card = document.createElement('article');
        card.className = 'quote';

        const rating = Math.max(0, Math.min(5, Number(r.rating) || 5));
        const stars = document.createElement('div');
        stars.className = 'quote-stars';
        stars.setAttribute('aria-label', rating + ' von 5 Sternen');
        stars.textContent = '★★★★★☆☆☆☆☆'.slice(5 - rating, 10 - rating);
        card.appendChild(stars);

        const text = document.createElement('p');
        text.className = 'quote-text';
        text.textContent = r.text || '';
        card.appendChild(text);

        if (Array.isArray(r.services) && r.services.length) {
          const tags = document.createElement('div');
          tags.className = 'quote-tags';
          r.services.forEach((s) => {
            const pill = document.createElement('span');
            pill.textContent = s;
            tags.appendChild(pill);
          });
          card.appendChild(tags);
        }

        const foot = document.createElement('div');
        foot.className = 'quote-foot';
        const cite = document.createElement('cite');
        cite.textContent = r.name || '';
        foot.appendChild(cite);
        if (r.dateLabel) {
          const date = document.createElement('span');
          date.className = 'quote-date';
          date.textContent = r.dateLabel;
          foot.appendChild(date);
        }
        card.appendChild(foot);

        if (r.url) {
          const link = document.createElement('a');
          link.className = 'quote-source';
          link.href = r.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = 'Auf Google lesen ↗';
          card.appendChild(link);
        }

        frag.appendChild(card);
      });

      container.innerHTML = '';
      container.appendChild(frag);
    })
    .catch(() => {
      const loading = container.querySelector('.quotes-loading');
      if (loading) loading.textContent = 'Erfahrungen konnten nicht geladen werden.';
    });
});
