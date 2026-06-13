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
