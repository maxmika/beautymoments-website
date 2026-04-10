/**
 * Hero Section Parallax & Fade-in Animation
 * 
 * Animiert:
 * - hero-content: Starker Parallax-Effekt (Text fährt von unten hinein)
 * - intro-overlay: Fährt mit Parallax nach oben weg und faded out
 */

document.addEventListener('DOMContentLoaded', () => {
  const heroTextSection = document.querySelector('.hero-text-section');
  const heroContent = document.querySelector('.hero-content');
  const introOverlay = document.querySelector('.intro-overlay');

  if (!heroTextSection) return;

  // IntersectionObserver für Fallback-Animationen
  const observerOptions = {
    threshold: 0,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Fallback für Browser ohne animation-timeline Support
        if (!CSS.supports('animation-timeline', 'view()')) {
          heroTextSection.style.animation = 'none';
          heroTextSection.style.opacity = '1';
          heroTextSection.style.transform = 'translateY(0)';
        }
      }
    });
  }, observerOptions);

  observer.observe(heroTextSection);

  // Starker Parallax Scrolling Effect
  let ticking = false;

  const updateOverlayAndParallax = () => {
    const rect = heroTextSection.getBoundingClientRect();
    const scrollPercent = Math.max(
      0,
      Math.min(1, (window.innerHeight - rect.top) / window.innerHeight)
    );

    // Hero Content: Starker Parallax (fährt von unten ins Viewport)
    const parallaxTransform = scrollPercent * 70;
    const yOffset = Math.max(-100, parallaxTransform - 100);
    heroContent.style.transform = `translateY(${yOffset}px)`;

    // Intro Overlay:
    // - beim normalen Scroll nach unten: nach oben parallaxen + ausfaden
    if (introOverlay) {
      const scrollFromTop = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const fadeOpacity = Math.min(1, Math.max(0, 1 - scrollFromTop / 400));
      const overlayTransform = -scrollFromTop * 0.5;

      introOverlay.style.transform = `translateY(${overlayTransform}px)`;
      introOverlay.style.opacity = fadeOpacity;
    }
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateOverlayAndParallax();

        ticking = false;
      });

      ticking = true;
    }
  });

  updateOverlayAndParallax();
});

