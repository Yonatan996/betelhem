// cart.js
(function() {
  // --- CSS Injection ---
  const styles = `
    
    .cart-drawer-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4); opacity: 0; visibility: hidden;
      transition: all 0.4s ease; z-index: 99999; backdrop-filter: blur(4px);
    }
    .cart-drawer-overlay.active { opacity: 1; visibility: visible; }

    .cart-drawer {
      position: fixed; top: 0; right: 0; width: 400px; max-width: 100vw; height: 100vh;
      background: #fdfcf8; transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
      z-index: 100000; display: flex; flex-direction: column; box-shadow: -10px 0 40px rgba(0,0,0,0.1);
    }
    .cart-drawer.active { transform: translateX(0); }

    .cart-header { padding: 2rem; border-bottom: 1px solid rgba(26,26,26,0.1); display: flex; justify-content: space-between; align-items: center; }
    .cart-title { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; color: #1a1a1a; font-style: italic; }
    .cart-close { background: none; border: none; font-size: 1.5rem; color: #1a1a1a; cursor: pointer; }

    .cart-items { flex: 1; overflow-y: auto; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .cart-empty-message { text-align: center; color: rgba(26,26,26,0.5); font-size: 0.85rem; margin-top: 2rem; }

    .cart-item { display: flex; gap: 1rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(26,26,26,0.05); }
    .cart-item-img { width: 80px; height: 80px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgba(26,26,26,0.05); }
    .cart-item-img img { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; }
    .cart-item-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
    .cart-item-brand { font-size: 0.5rem; letter-spacing: 0.2em; text-transform: uppercase; color: #c5a059; margin-bottom: 0.3rem; }
    .cart-item-name { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; color: #1a1a1a; margin-bottom: 0.3rem; line-height: 1.1; }
    .cart-item-price { font-size: 0.8rem; color: #1a1a1a; }
    .cart-item-remove { align-self: flex-start; font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(26,26,26,0.4); text-decoration: underline; background: none; border: none; cursor: pointer; transition: color 0.2s; margin-top: 0.5rem; }
    .cart-item-remove:hover { color: #1a1a1a; }

    .cart-footer { padding: 2rem; border-top: 1px solid rgba(26,26,26,0.1); background: #fdfcf8; }
    .cart-total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: #1a1a1a; }
    
    .cart-checkout-btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 0.75rem 2rem; border: 1px solid var(--charcoal); border-radius: 100px;
      background: transparent; color: var(--charcoal); font-family: 'Montserrat', sans-serif;
      font-size: 0.5rem; letter-spacing: 0.22em; text-transform: uppercase; cursor: pointer;
      position: relative; overflow: hidden; transition: color 0.35s; width: 100%;
    }
    .cart-checkout-btn::before {
      content: ''; position: absolute; inset: 0; border-radius: 100px; background: var(--charcoal);
      transform: scaleX(0); transform-origin: left; transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); z-index: -1;
    }
    .cart-checkout-btn:hover::before { transform: scaleX(1); }
    .cart-checkout-btn:hover { color: var(--alabaster); }
    .cart-checkout-btn span { position: relative; z-index: 1; pointer-events: none; }

    /* New FAB Cart styling */
    .cart-fab {
      position: fixed; bottom: 2rem; right: 2rem; width: 60px; height: 60px; border-radius: 50%;
      background: #1A1A1A; color: #FDFCF8; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 25px rgba(26,26,26,0.2); cursor: pointer; z-index: 8000;
      transition: transform 0.3s cubic-bezier(0.19,1,0.22,1), box-shadow 0.3s ease;
    }
    .cart-fab:hover { transform: translateY(-4px) scale(1.05); box-shadow: 0 15px 35px rgba(26,26,26,0.25); }
    .cart-fab-badge {
      position: absolute; top: -5px; right: -5px; background: #C5A059; color: #fff; font-size: 0.65rem;
      font-weight: 600; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; border: 3px solid #FDFCF8;
    }
    .cart-fab svg { width: 22px; height: 22px; fill: currentColor; }

    .cart-drawer,
    .cart-drawer * {
      cursor: auto !important;
    }
    .cart-drawer button,
    .cart-fab,
    .cart-drawer-overlay {
      cursor: pointer !important;
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // --- Cart State ---
  let cart = JSON.parse(localStorage.getItem('bethlehem_cart') || '[]');

  function saveCart() {
    localStorage.setItem('bethlehem_cart', JSON.stringify(cart));
    updateCartUI();
  }

  // --- HTML Injection ---
  const drawerHtml = `
    <div class="cart-drawer-overlay"></div>
    <div class="cart-drawer">
      <div class="cart-header">
        <h2 class="cart-title">Your Cart</h2>
        <button class="cart-close">&times;</button>
      </div>
      <div class="cart-items" id="cart-item-list"></div>
      <div class="cart-footer">
        <div class="cart-total-row">
          <span>Subtotal</span>
          <span id="cart-subtotal">$0.00</span>
        </div>
        <button class="cart-checkout-btn"><span>Checkout</span></button>
      </div>
    </div>
  `;
  const temp = document.createElement('div');
  temp.innerHTML = drawerHtml;
  while(temp.firstChild) document.body.appendChild(temp.firstChild);

  
  // Make sure cart-fab HTML is injected
  const fabHtml = `
    <div class="cart-fab" id="cart-fab-btn">
      <svg viewBox="0 0 24 24"><path d="M21.822 7.431A1 1 0 0 0 21 7H7.333L6.179 4.23A1.994 1.994 0 0 0 4.333 3H2v2h2.333l4.053 9.728A2 2 0 0 0 10.228 16H19v-2h-8.772l-.71-1.705H19.5a2 2 0 0 0 1.904-1.386l1.42-4.5a1 1 0 0 0-1.002-1.978zM10 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
      <div class="cart-fab-badge" id="cart-fab-badge">0</div>
    </div>
  `;
  const fabTemp = document.createElement('div');
  fabTemp.innerHTML = fabHtml;
  document.body.appendChild(fabTemp.firstElementChild);
  
  document.getElementById('cart-fab-btn').addEventListener('click', toggleCart);


  // --- UI Logic ---
  const drawer = document.querySelector('.cart-drawer');
  const overlay = document.querySelector('.cart-drawer-overlay');
  const closeBtn = document.querySelector('.cart-close');
  const itemList = document.getElementById('cart-item-list');
  const subtotalEl = document.getElementById('cart-subtotal');

  function toggleCart() {
    drawer.classList.toggle('active');
    overlay.classList.toggle('active');
  }

  closeBtn.addEventListener('click', toggleCart);
  overlay.addEventListener('click', toggleCart);

  function updateCartUI() {
    
    const badge = document.getElementById('cart-fab-badge');
    if (badge) badge.textContent = cart.length;


    itemList.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
      itemList.innerHTML = '<p class="cart-empty-message">Your cart is currently empty.</p>';
      subtotalEl.textContent = '$0.00';
      return;
    }

    cart.forEach((item, index) => {
      // Calculate total
      let priceMatch = item.price.match(/[\d\.]+/);
      if (priceMatch) total += parseFloat(priceMatch[0]);

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-img"><img src="${item.image}" alt="${item.name}"></div>
        <div class="cart-item-info">
          <span class="cart-item-brand">${item.brandName || ''}</span>
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">${item.price}</span>
          <button class="cart-item-remove" data-index="${index}">Remove</button>
        </div>
      `;
      itemList.appendChild(itemEl);
    });

    subtotalEl.textContent = '$' + total.toFixed(2);

    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        cart.splice(idx, 1);
        saveCart();
      });
    });
  }

  // Checkout Alert
  document.querySelector('.cart-checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) return;
    alert("Checkout functionality is pending integration with a payment gateway. Please contact Bethlehem Lebneh to finalize your order.");
  });

  // Init
  updateCartUI();

  // --- Globals ---
  window.AddToCart = function(productName, productPrice, productImage, brandName) {
    cart.push({
      name: productName,
      price: productPrice,
      image: productImage,
      brandName: brandName || ''
    });
    saveCart();
    toggleCart();
  };

})();

