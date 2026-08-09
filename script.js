// ── CART ──
let cart = JSON.parse(localStorage.getItem('bl_cart') || '[]');
function updateCartCount() {
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = cart.reduce((s, i) => s + i.qty, 0);
  });
}
function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) existing.qty++;
  else cart.push({ name, price, qty: 1 });
  localStorage.setItem('bl_cart', JSON.stringify(cart));
  updateCartCount();
  showToast(`"${name}" added to cart`);
}
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'bl-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  // ── MOBILE NAV ──
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));
  }

  // ── TESTIMONIALS CAROUSEL ──
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.t-dot');
  const prevBtn = document.querySelector('.t-prev');
  const nextBtn = document.querySelector('.t-next');
  let current = 0;
  function showSlide(n) {
    slides.forEach((s, i) => s.classList.toggle('active', i === n));
    dots.forEach((d, i) => d.classList.toggle('active', i === n));
    current = n;
  }
  if (slides.length) {
    showSlide(0);
    prevBtn?.addEventListener('click', () => showSlide((current - 1 + slides.length) % slides.length));
    nextBtn?.addEventListener('click', () => showSlide((current + 1) % slides.length));
    dots.forEach((d, i) => d.addEventListener('click', () => showSlide(i)));
    setInterval(() => showSlide((current + 1) % slides.length), 6000);
  }

  // ── PRODUCT TABS ──
  document.querySelectorAll('.product-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;
      document.querySelectorAll('.product-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = (category === 'all' || card.dataset.category === category) ? '' : 'none';
      });
    });
  });

  // ── ADD TO CART BUTTONS ──
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.dataset.name, btn.dataset.price);
    });
  });

  // ── CART BUBBLE ──
  document.querySelector('.cart-bubble')?.addEventListener('click', () => {
    if (!cart.length) { showToast('Your cart is empty'); return; }
    const list = cart.map(i => `${i.name} ×${i.qty} — $${(i.price * i.qty).toFixed(2)}`).join('\n');
    alert('Cart:\n\n' + list + '\n\nTotal: $' + cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2));
  });

  // ── SCROLL REVEAL ──
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ── SKIN CONCERN ACCORDION ──
  document.querySelectorAll('.concern-card').forEach(card => {
    card.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      document.querySelectorAll('.concern-card').forEach(c => c.classList.remove('open'));
      if (!isOpen) card.classList.add('open');
    });
  });
});

// toast style injected dynamically
const style = document.createElement('style');
style.textContent = `
.bl-toast {
  position: fixed; bottom: 6rem; right: 2rem; z-index: 9999;
  background: var(--charcoal); color: var(--cream);
  padding: .7rem 1.4rem; font-size: .8rem; letter-spacing: .05em;
  opacity: 0; transform: translateY(8px);
  transition: all .3s; pointer-events: none;
}
.bl-toast.show { opacity: 1; transform: translateY(0); }
.reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s ease; }
.reveal.revealed { opacity: 1; transform: none; }
`;
document.head.appendChild(style);
