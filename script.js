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
    
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--cream);color:var(--charcoal);padding:2rem;border-radius:8px;max-width:400px;width:90%;max-height:80vh;overflow-y:auto;';
    
    let html = '<h2 style="margin-top:0">Your Cart</h2><div style="margin:1rem 0;border-top:1px solid #ccc;padding-top:1rem;">';
    let total = 0;
    cart.forEach(item => {
      const lineTotal = item.price * item.qty;
      total += lineTotal;
      html += `<div style="display:flex;justify-content:space-between;margin-bottom:.5rem;">
        <span>${item.name} (x${item.qty})</span>
        <span>$${lineTotal.toFixed(2)}</span>
      </div>`;
    });
    html += `</div><div style="display:flex;justify-content:space-between;font-weight:bold;font-size:1.2rem;margin-bottom:1.5rem;">
      <span>Total</span><span>$${total.toFixed(2)}</span>
    </div>
    <div style="display:flex;gap:1rem;">
      <button id="cart-close" class="btn-pill" style="flex:1;background:transparent;border:1px solid var(--charcoal);color:var(--charcoal);padding:.7rem">Close</button>
      <button id="cart-checkout" class="btn-solid" style="flex:1;padding:.7rem">Checkout</button>
    </div>`;
    
    modal.innerHTML = html;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    document.getElementById('cart-close').addEventListener('click', () => overlay.remove());
    document.getElementById('cart-checkout').addEventListener('click', () => {
      const orders = JSON.parse(localStorage.getItem('bl_orders') || '[]');
      orders.push({
        id: Date.now().toString(36),
        date: new Date().toLocaleString(),
        items: cart,
        total: total,
        status: 'Pending'
      });
      localStorage.setItem('bl_orders', JSON.stringify(orders));
      
      cart = [];
      localStorage.setItem('bl_cart', JSON.stringify(cart));
      updateCartCount();
      overlay.remove();
      showToast('Order placed successfully!');
    });
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
