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
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(25,30,30,0.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--cream);color:var(--charcoal);padding:2.5rem;border-radius:12px;max-width:450px;width:92%;max-height:85vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.2);transform:translateY(20px);transition:transform 0.4s cubic-bezier(0.16,1,0.3,1);position:relative;';
    
    let html = `
      <button id="cart-close-icon" style="position:absolute;top:1rem;right:1rem;background:transparent;border:none;font-size:1.8rem;cursor:pointer;color:var(--text-dark);line-height:1">&times;</button>
      <h2 style="margin-top:0;font-family:var(--font-heading);font-style:italic;color:var(--text-dark);font-size:2rem;margin-bottom:.5rem;">Your Cart</h2>
      <p style="margin-bottom:1.5rem;font-size:0.9rem;color:rgba(45,41,36,0.7)">Review your selections before checkout.</p>
      <div style="border-top:1px solid rgba(45,41,36,0.1);padding-top:1.5rem;margin-bottom:1.5rem;">`;
      
    let total = 0;
    cart.forEach(item => {
      const lineTotal = item.price * item.qty;
      total += lineTotal;
      html += `
      <div style="display:flex;justify-content:space-between;margin-bottom:1rem;align-items:center;">
        <div>
          <div style="font-weight:600;color:var(--charcoal)">${item.name}</div>
          <div style="font-size:0.85rem;color:rgba(45,41,36,0.6)">Qty: ${item.qty}</div>
        </div>
        <div style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-dark)">$${lineTotal.toFixed(2)}</div>
      </div>`;
    });
    
    html += `
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:1.5rem 0;border-top:1px solid rgba(45,41,36,0.1);margin-bottom:1.5rem;">
        <span style="font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;font-size:0.9rem;">Subtotal</span>
        <span style="font-family:var(--font-heading);font-style:italic;font-size:1.5rem;color:var(--text-dark)">$${total.toFixed(2)}</span>
      </div>
      <button id="cart-checkout" class="btn-solid" style="width:100%;padding:1rem;font-size:1.05rem;background:var(--charcoal);color:var(--cream);border:none;border-radius:4px;cursor:pointer;transition:background 0.3s;display:block;text-align:center;">Proceed to Checkout &rarr;</button>
    `;
    
    modal.innerHTML = html;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      modal.style.transform = 'translateY(0)';
    });
    
    const closeModal = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'translateY(20px)';
      setTimeout(() => overlay.remove(), 300);
    };
    
    document.getElementById('cart-close-icon').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
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
