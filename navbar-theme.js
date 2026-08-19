// navbar-theme.js
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav.fixed');
    if (!nav) return;

    // We will find all direct children of body that act as large sections
    const sections = Array.from(document.body.children).filter(el => {
      const tag = el.tagName.toLowerCase();
      // Most main structural blocks will be header, main, section, footer, or divs with a known class
      return ['header', 'main', 'section', 'footer'].includes(tag) || el.classList.contains('ritual-section') || el.classList.contains('cta-bar');
    });

    // Helper: Is color light or dark? Parse rgba, rgb, hex and check luminance
    function isColorLight(colorString) {
      // Default to light if transparent or empty
      if (!colorString || colorString === 'transparent' || colorString === 'rgba(0, 0, 0, 0)') return true;
      
      let r, g, b;
      
      if (colorString.startsWith('rgb')) {
        const parts = colorString.match(/\\d+/g);
        if (parts && parts.length >= 3) {
          [r, g, b] = parts.map(Number);
        } else return true;
      } else if (colorString.startsWith('#')) {
        let hex = colorString.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
        const num = parseInt(hex, 16);
        r = (num >> 16) & 255;
        g = (num >> 8) & 255;
        b = num & 255;
      } else {
        return true; // fallback
      }

      // Check luminance (simple perceptive formula)
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      return luminance > 128; 
    }

    // Since computed style `background-color` is often what matters, we check it
    // But some sections use background linear-gradient, which computed style might just say "transparent".
    // Or they inherit from body.
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const isBodyLight = isColorLight(bodyBg);

    const observer = new IntersectionObserver((entries) => {
      // Find the topmost intersecting section
      let topmostSection = null;
      let minTop = Infinity;

      // We actually want to analyze all currently intersecting, and find the one that spans the top 80px (the navbar area)
      const navRect = nav.getBoundingClientRect();
      const navCenterY = navRect.top + (navRect.height / 2);

      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        // If the section covers the center of the navbar vertically
        if (rect.top <= navCenterY && rect.bottom >= navCenterY) {
          topmostSection = sec;
        }
      });

      if (topmostSection) {
        // We evaluate color
        const compStyle = window.getComputedStyle(topmostSection);
        let bg = compStyle.backgroundColor;
        
        // If bg is transparent, it inherits from body
        if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
           bg = bodyBg;
        }

        const isLight = isColorLight(bg);

        // Additionally, hard-coded checks for dark elements or dark gradients
        const isKnownDark = topmostSection.classList.contains('cta-bar') || 
                            topmostSection.classList.contains('products-hero') || 
                            topmostSection.classList.contains('brands-hero') || 
                            topmostSection.id === 'hero';
        
        if (isLight && !isKnownDark) {
          // Nav Text should be DARK (Charcoal)
          nav.style.color = '#1A1A1A'; nav.classList.remove('theme-dark'); nav.classList.add('theme-light');
          nav.querySelectorAll('.nav-link, .nav-cart-btn, .logo-text, .breadcrumb a, .breadcrumb-sep').forEach(el => {
            el.style.color = '#1A1A1A';
            el.classList.remove('text-alabaster');
          });
          // Fix logo invert if it's the solid white logo (assuming white logo -> filter to black)
          const logoImg = nav.querySelector('.logo-image img');
          if (logoImg) logoImg.style.filter = 'invert(1)';
        } else {
          // Nav Text should be LIGHT (Alabaster)
          nav.style.color = '#FDFCF8'; nav.classList.remove('theme-light'); nav.classList.add('theme-dark');
          nav.querySelectorAll('.nav-link, .nav-cart-btn, .logo-text, .breadcrumb a, .breadcrumb-sep').forEach(el => {
            el.style.color = '#FDFCF8';
            el.classList.add('text-alabaster');
          });
          // Revert logo
          const logoImg = nav.querySelector('.logo-image img');
          if (logoImg) logoImg.style.filter = 'none';
        }
      }

    }, {
      rootMargin: '-40px 0px -90% 0px', // Just trigger as things cross the top boundary
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    });

    sections.forEach(sec => observer.observe(sec));

    // Handle scroll for the observer to fire continuously or rely on scroll listener
    window.addEventListener('scroll', () => {
      // Force trigger intersection logic manually because observer is asynchronous and sometimes imprecise for fast scrolling
      const navRect = nav.getBoundingClientRect();
      const navCenterY = navRect.top + (navRect.height / 2);
      
      let topSec = null;
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= navCenterY && rect.bottom >= navCenterY) {
          topSec = sec;
          break;
        }
      }

      if (topSec) {
        const compStyle = window.getComputedStyle(topSec);
        let bg = compStyle.backgroundColor;
        if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') bg = bodyBg;
        
        const isLight = isColorLight(bg);
        const isKnownDark = topSec.classList.contains('cta-bar') || 
                            topSec.classList.contains('products-hero') || 
                            topSec.classList.contains('brands-hero') || 
                            topSec.id === 'hero';

        if (isLight && !isKnownDark) {
          nav.style.color = '#1A1A1A'; nav.classList.remove('theme-dark'); nav.classList.add('theme-light');
          nav.querySelectorAll('.nav-link, .nav-cart-btn, .logo-text, .breadcrumb a, .breadcrumb-sep').forEach(el => {
            el.style.color = '#1A1A1A';
          });
          const logoImg = nav.querySelector('.logo-image img');
          if (logoImg) logoImg.style.filter = 'invert(1)';
        } else {
          nav.style.color = '#FDFCF8'; nav.classList.remove('theme-light'); nav.classList.add('theme-dark');
          nav.querySelectorAll('.nav-link, .nav-cart-btn, .logo-text, .breadcrumb a, .breadcrumb-sep').forEach(el => {
            el.style.color = '#FDFCF8';
          });
          const logoImg = nav.querySelector('.logo-image img');
          if (logoImg) logoImg.style.filter = 'none';
        }
      }
    }, {passive: true});

  });
})();
