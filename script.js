// script.js - Complete with Mobile & Carousel Fixes

// Global state
const state = {
  cart: [],
  currentProduct: null,
  currentQuantity: 1,
  selectedBoxSize: null
};

// Constants
const ORDER_LIMITS = {
  premade: { ogSet: 9, classic6: 9, samplers: 9 },
  custom: { perCookie: 20 }
};

const COOKIE_FLAVORS = [
  { name: "The Usual", price: 100 },
  { name: "The Red One", price: 110 },
  { name: "The Burnt One", price: 110 },
  { name: "The Bizz", price: 115 },
  { name: "The Milky One", price: 110 },
  { name: "Pistash", price: 120 },
  { name: "The OT", price: 115 },
  { name: "Nut-so-Carrot", price: 130 },
  { name: "Espress-oh", price: 115 },
  { name: "Berry match", price: 120 }
];

const PRODUCT_DATA = {
  ogSet: {
    name: "The OG Set",
    description: "3 signature cookies — The Usual, The Red One, and The Burnt One. Each cookie weighs 100g+ of chewy indulgence.",
    price: 320,
    image: "images/og-set.jpeg",
    id: "ogSet"
  },
  classic6: {
    name: "The Classics", 
    description: "All 6 classic flavors in one box: The Usual, The Red One, The Burnt One, The Milky One, PiStash, and The Bizz. Perfect for sharing or treating yourself.",
    price: 660,
    image: "images/classics.JPG", 
    id: "classic6"
  },
  samplers: {
    name: "Samplers",
    description: "6-piece sampler (50g each) — one of every classic flavor. Perfect for tasting it all.",
    price: 320,
    image: "images/samplers.PNG",
    id: "samplers"
  }
};

// Image Optimization Utilities
const ImageOptimizer = {
// Preload critical images
preloadCriticalImages: function() {
  const criticalImages = [
    'images/logo.PNG',
    'images/bg-image-hero.JPG'
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
},

// Lazy load images with intersection observer
initLazyLoading: function() {
  if ('IntersectionObserver' in window) {
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          this.loadImage(lazyImage);
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    document.querySelectorAll('.lazy-image').forEach(lazyImage => {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Fallback for older browsers
    document.querySelectorAll('.lazy-image').forEach(this.loadImage);
  }
},

loadImage: function(img) {
  const src = img.dataset.src;
  if (!src) return;

  const image = new Image();
  image.onload = () => {
    img.src = src;
    img.classList.remove('lazy-image', 'image-loading');
    img.classList.add('image-loaded');
  };
  image.onerror = () => {
    img.classList.remove('image-loading');
  };
  image.src = src;
},

// Optimize image display
optimizeImages: function() {
  document.querySelectorAll('img').forEach(img => {
    // Add loading lazy for non-critical images
    if (!img.classList.contains('critical-image')) {
      img.loading = 'lazy';
      
      // Add lazy loading with data-src
      if (img.src && !img.dataset.src) {
        img.dataset.src = img.src;
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZThkNSIvPjwvc3ZnPg==';
        img.classList.add('lazy-image', 'image-loading');
      }
    }
  });
}
};

// DOM Utilities
const DOM = {
  get: (selector) => document.querySelector(selector),
  getAll: (selector) => document.querySelectorAll(selector),
  show: (element) => element?.classList?.remove('hidden'),
  hide: (element) => element?.classList?.add('hidden'),
  addClass: (element, className) => element?.classList?.add(className),
  removeClass: (element, className) => element?.classList?.remove(className)
};

// Add this to script.js - iOS Viewport Height Fix
function setVH() {
  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Enhanced navigation for external buttons
function setupExternalNavigation() {
  // Add loading states to all navigation buttons
  document.querySelectorAll('.navigation-buttons .nav-button, .navigation-buttons .arrow-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      // Add loading animation
      this.classList.add('loading');
      
      // Remove loading state after navigation
      setTimeout(() => {
        this.classList.remove('loading');
      }, 1000);
    });
  });
}

// Navigation
function scrollToSection(id) {
  const element = document.getElementById(`section-${id}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
    updateCurrentSection(id);
  }
}

// Cart Management
function updateCartDisplay() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = state.cart.reduce((sum, item) => sum + item.total, 0);

  // Update nav cart
  const navCartCount = DOM.get('#navCartCount');
  if (navCartCount) {
    navCartCount.textContent = totalItems;
    navCartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  // Update cart modal
  updateCartModal(totalItems, totalAmount);
  
  // Save to storage
  saveCartToStorage();
}

function updateCartModal(totalItems, totalAmount) {
  const cartItems = DOM.get('#cartItems');
  const emptyCartMessage = DOM.get('#emptyCartMessage');
  const cartTotal = DOM.get('#cartTotal');
  const cartTotalAmount = DOM.get('#cartTotalAmount');

  if (!cartItems) return;

  if (state.cart.length === 0) {
    DOM.show(emptyCartMessage);
    cartItems.innerHTML = '';
    DOM.hide(cartTotal);
  } else {
    DOM.hide(emptyCartMessage);
    DOM.show(cartTotal);
    
    cartItems.innerHTML = state.cart.map((item, index) => `
      <div class="cart-modal-item p-4 rounded-lg mb-3">
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <h4 class="font-bold text-brown text-lg">${item.name}</h4>
            ${item.type === 'customBox' ? 
              `<p class="text-sm text-brown-700">Box of ${item.boxSize}</p>
               <p class="text-sm text-brown-600">${item.items.map(it => `${it.name} (x${it.qty})`).join(', ')}</p>` : 
              `<p class="text-sm text-brown-700">Quantity: ${item.quantity}</p>`
            }
            <p class="font-bold text-brown-800 text-xl mt-2">₱${item.total}</p>
          </div>
          <button type="button" onclick="removeFromCart(${index})" class="text-red-600 hover:text-red-800 ml-4 bg-white p-2 rounded-full shadow transition-colors">🗑️</button>
        </div>
      </div>
    `).join('');

    if (cartTotalAmount) cartTotalAmount.textContent = totalAmount;
  }
}

function removeFromCart(index) {
  const removedItem = state.cart[index];
  state.cart.splice(index, 1);
  updateCartDisplay();
  showToast(`Removed ${removedItem.name} from cart`, 'warning');
}

function addProductToCart() {
  if (!state.currentProduct) {
    showToast('Please select a product first', 'error');
    return;
  }

  try {
    // Remove existing item with same ID
    state.cart = state.cart.filter(item => item.id !== state.currentProduct.id);
    
    // Add new item
    state.cart.push({
      id: state.currentProduct.id,
      type: 'premade',
      name: state.currentProduct.name,
      price: state.currentProduct.price,
      quantity: state.currentQuantity,
      total: state.currentProduct.price * state.currentQuantity
    });
    
    updateCartDisplay();
    showToast(`Added ${state.currentQuantity} ${state.currentProduct.name} to cart! 🍪`);
    closeProductModal();
    
  } catch (error) {
    showToast('Error adding product to cart. Please try again.', 'error');
  }
}

// Date Management
function generateWeekendDates() {
  const container = DOM.get('#quickDates');
  const currentDateDisplay = DOM.get('#currentDateDisplay');
  
  if (!container) return;
  
  const today = new Date();
  
  // Display current date
  if (currentDateDisplay) {
    currentDateDisplay.textContent = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  const deliveryDates = getAvailableDeliveryDates(today);
  
  container.innerHTML = deliveryDates.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const displayDate = formatDateDisplay(date);
    
    return `
      <button type="button" class="quick-date-btn bg-brown-300 hover:bg-brown-400 px-3 py-3 rounded-lg font-medium transition-colors" data-date="${dateStr}">
        ${displayDate}
      </button>
    `;
  }).join('');
  
  setupDateSelection();
}

function getAvailableDeliveryDates(startDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  
  // Skip today and tomorrow (2-day preparation)
  currentDate.setDate(currentDate.getDate() + 2);
  
  while (dates.length < 8) {
    const day = currentDate.getDay();
    // Find next 4 available dates (Thursday-Sunday)
    // Thursday (4), Friday (5), Saturday (6), Sunday (0)
    /*if ([4, 5, 6, 0].includes(day)) {
      dates.push(new Date(currentDate));
    }*/
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

function formatDateDisplay(date) {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function setupDateSelection() {
  const dateInput = DOM.get('#deliveryDateInput');
  const quickDateBtns = DOM.getAll('.quick-date-btn');
  
  quickDateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const date = btn.dataset.date;
      
      // Update input
      if (dateInput) {
        dateInput.value = date;
        dateInput.type = 'date';
      }
      
      // Update button states
      quickDateBtns.forEach(b => DOM.removeClass(b, 'active'));
      DOM.addClass(btn, 'active');
      
      // Clear delivery date error when a date is selected
      clearDeliveryDateError();
    });
  });
  
  // Update quick dates when input changes and clear error
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      const selectedDate = dateInput.value;
      quickDateBtns.forEach(btn => {
        if (btn.dataset.date === selectedDate) {
          DOM.addClass(btn, 'active');
        } else {
          DOM.removeClass(btn, 'active');
        }
      });
      
      // Clear delivery date error when date is selected via input
      clearDeliveryDateError();
    });
    
    // Also clear on input for manual typing
    dateInput.addEventListener('input', clearDeliveryDateError);
  }
}

function resetTimeSlotSelection() {
  // Remove active visuals
  DOM.getAll('.time-slot-option').forEach(opt => {
    DOM.removeClass(opt, 'active');
  });

  // Clear hidden field
  const timeSlotField = DOM.get('#timeSlotField');
  if (timeSlotField) {
    timeSlotField.value = '';
  }
}


// Modal Management
function openCartModal() {
  const modal = DOM.get("#cartModal");
  if (modal) {
    DOM.addClass(modal, "active");
    DOM.addClass(document.body, "no-scroll");
    updateCartDisplay();
  }
}

function closeCartModal() {
  const modal = DOM.get("#cartModal");
  if (modal) {
    DOM.removeClass(modal, "active");
    DOM.removeClass(document.body, "no-scroll");
  }
}

// Fixed Product Modal Functions
function openProductModal(productId) {
  const product = PRODUCT_DATA[productId];
  if (!product) return;
  
  state.currentProduct = product;
  state.currentQuantity = 1;
  
  // Update modal content
  document.getElementById('productModalTitle').textContent = product.name;
  document.getElementById('productName').textContent = product.name;
  document.getElementById('productDescription').textContent = product.description;
  document.getElementById('productPrice').textContent = `₱${product.price}`;
  document.getElementById('productQuantity').textContent = state.currentQuantity;
  
  // Load image
  const productImage = document.getElementById('productImage');
  const placeholder = document.getElementById('productImagePlaceholder');
  
  if (product.image) {
    productImage.src = product.image;
    productImage.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    productImage.style.display = 'none';
    placeholder.style.display = 'block';
  }
  
  // Show modal
  const modal = document.getElementById("productModal");
  if (modal) {
    modal.classList.add("active");
    document.body.classList.add("no-scroll");
  }
}

function loadProductImage(product) {
  const productImage = DOM.get('#productImage');
  const placeholder = DOM.get('#productImagePlaceholder');
  
  if (!product.image) {
    DOM.hide(productImage);
    DOM.show(placeholder);
    return;
  }
  
  DOM.addClass(productImage, 'loading');
  DOM.hide(placeholder);
  DOM.show(productImage);
  
  const img = new Image();
  img.onload = () => {
    productImage.src = product.image;
    DOM.removeClass(productImage, 'loading');
  };
  img.onerror = () => {
    DOM.hide(productImage);
    DOM.show(placeholder);
  };
  img.src = product.image;
}

// Fixed closeProductModal function
function closeProductModal() {
  const modal = document.getElementById("productModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }
  state.currentProduct = null;
  state.currentQuantity = 1;
}

// Fixed addProductToCart function
function addProductToCart() {
  if (!state.currentProduct) {
    console.error('No product selected');
    return;
  }

  try {
    // Remove existing item with same ID
    state.cart = state.cart.filter(item => item.id !== state.currentProduct.id);
    
    // Add new item
    state.cart.push({
      id: state.currentProduct.id,
      type: 'premade',
      name: state.currentProduct.name,
      price: state.currentProduct.price,
      quantity: state.currentQuantity,
      total: state.currentProduct.price * state.currentQuantity
    });
    
    // Update cart display
    updateCartDisplay();
    
    // Show success message
    showToast(`Added ${state.currentQuantity} ${state.currentProduct.name} to cart! 🍪`);
    
    // Close modal
    closeProductModal();
    
  } catch (error) {
    console.error('Error adding product to cart:', error);
    showToast('Error adding product to cart. Please try again.', 'error');
  }
}

// Fixed updateProductQuantity function
function updateProductQuantity(delta) {
  if (!state.currentProduct) return;
  
  const newQuantity = state.currentQuantity + delta;
  
  if (newQuantity < 1) return;
  
  if (newQuantity > ORDER_LIMITS.premade[state.currentProduct.id]) {
    showToast(`Maximum ${ORDER_LIMITS.premade[state.currentProduct.id]} sets allowed per order`, 'warning');
    return;
  }
  
  state.currentQuantity = newQuantity;
  document.getElementById('productQuantity').textContent = state.currentQuantity;
}

// Fixed Toast Function
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toastContainer');
  
  // Create toast container if it doesn't exist
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌', 
    warning: '⚠️'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '📢'}</span>
    <span class="toast-message">${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  // Force reflow
  toast.offsetHeight;
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode === toastContainer) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Selection Handlers
function selectTimeSlot(element, timeSlot) {
  // Clear active state from all time slots
  DOM.getAll('.time-slot-option').forEach(opt => DOM.removeClass(opt, 'active'));

  // Set active state on the clicked one
  DOM.addClass(element, 'active');

  // (Optional) If you still keep a dummy input inside, you can ignore .checked now
  const radio = element.querySelector('.time-slot-radio');
  if (radio) {
    radio.checked = true; // purely visual/state, not used in validation
  }

  // This is the ONLY source of truth for validation + submission
  const timeSlotField = DOM.get('#timeSlotField');
  if (timeSlotField) {
    timeSlotField.value = timeSlot;
  }

  // Clear any previous error
  clearTimeSlotError();
}


function selectDeliveryMethod(element, method) {
  DOM.getAll('.delivery-option').forEach(opt => {
    if (opt.querySelector('input[name="deliveryMethod"]')) {
      DOM.removeClass(opt, 'active');
    }
  });
  DOM.addClass(element, 'active');
  
  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
  
  // Show/hide details
  const pickupDetails = DOM.get('#pickupDetails');
  const deliveryDetails = DOM.get('#deliveryDetails');
  
  if (pickupDetails && deliveryDetails) {
    if (method === 'pickup') {
      DOM.show(pickupDetails);
      DOM.hide(deliveryDetails);
    } else {
      DOM.hide(pickupDetails);
      DOM.show(deliveryDetails);
    }
  }
  
  // Clear delivery method error when a method is selected
  clearDeliveryMethodError();
}

// Fixed toggleCustomBoxCard function
function toggleCustomBoxCard(card) {
  const isActive = card.classList.contains('active');
  
  document.querySelectorAll('.cookie-card').forEach(c => {
    c.classList.remove('active');
  });
  
  if (isActive) {
    card.classList.remove('active');
  } else {
    card.classList.add('active');
    openCustomizeModal();
  }
}

// Fixed openCustomizeModal function
function openCustomizeModal() {
  const modal = document.getElementById("customizeModal");
  if (modal) {
    modal.classList.add("active");
    document.body.classList.add("no-scroll");
    renderCookieList();
    state.selectedBoxSize = null;
    
    document.querySelectorAll('.boxsize-row').forEach(r => r.classList.remove('active'));
    
    const sizeInfo = document.getElementById('selectedSizeInfo');
    if (sizeInfo) sizeInfo.classList.add('hidden');
  }
}

// Fixed closeCustomizeModal function
function closeCustomizeModal() {
  const modal = document.getElementById("customizeModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }
}


function selectBoxSize(row) {
  document.querySelectorAll('.boxsize-row').forEach(r => r.classList.remove('active'));
  row.classList.add('active');
  const radio = row.querySelector('input[type="radio"]');
  if (radio) state.selectedBoxSize = radio.value;
  
  const sizeInfo = document.getElementById('selectedSizeInfo');
  const sizeMessage = document.getElementById('sizeMessage');
  
  if (sizeInfo && sizeMessage) {
    sizeMessage.textContent = state.selectedBoxSize === 'others' 
      ? 'Please select at least 3 cookies for your custom pack.'
      : `Please select exactly ${state.selectedBoxSize} cookies for your pack.`;
    sizeInfo.classList.remove('hidden');
  }
}

function renderCookieList() {
  const container = document.getElementById('cookieList');
  if (!container) return;
  
  container.innerHTML = '';
  COOKIE_FLAVORS.forEach((flavor) => {
    const row = document.createElement('div');
    row.className = 'cookie-row';
    row.dataset.cookie = flavor.name;
    row.onclick = function() { toggleCookieSelection(this); };

    const label = document.createElement('div');
    label.className = 'flex-1 flex justify-between pr-4 cursor-pointer';
    label.innerHTML = `<img class="custom-cookie-image" src="icons/${flavor.name}.svg"><span class="cookie-label">${flavor.name}</span><span class="cookie-price">₱${flavor.price}</span>`;

    const qtyDiv = document.createElement('div');
    qtyDiv.className = 'quantity-control hidden items-center';
    qtyDiv.innerHTML = `
      <button type="button" class="qty-btn" onclick="event.stopPropagation(); updateCookieQty(this, -1)">-</button>
      <input type="number" value="1" min="0" class="cookie-qty-input" onclick="event.stopPropagation()">
      <button type="button" class="qty-btn" onclick="event.stopPropagation(); updateCookieQty(this, 1)">+</button>
    `;

    row.appendChild(label);
    row.appendChild(qtyDiv);
    container.appendChild(row);
  });
}

function toggleCookieSelection(row) {
  const isActive = row.classList.contains('active');
  
  if (isActive) {
    row.classList.remove('active');
    const qtyInput = row.querySelector('.cookie-qty-input');
    if (qtyInput) qtyInput.value = 1;
  } else {
    row.classList.add('active');
  }
}

function updateCookieQty(button, delta) {
  const qtyDiv = button.closest('.quantity-control');
  if (!qtyDiv) return;
  
  const inputEl = qtyDiv.querySelector('input');
  if (!inputEl) return;
  
  let v = parseInt(inputEl.value, 10) || 0;
  const newValue = v + delta;
  
  if (delta > 0 && newValue > ORDER_LIMITS.custom.perCookie) {
    showToast(`Maximum ${ORDER_LIMITS.custom.perCookie} per cookie flavor allowed`, 'warning');
    return;
  }
  
  v = Math.max(0, newValue);
  inputEl.value = v;
  
  if (v === 0) {
    const row = qtyDiv.closest('.cookie-row');
    if (row) {
      row.classList.remove('active');
    }
  }
}

function getSelectedCookies(){ 
  const selections = []; 
  DOM.getAll('#cookieList .cookie-row.active').forEach(r=>{
    const qtyDiv = r.querySelector('.quantity-control'); 
    if(!qtyDiv) return; 
    const q = parseInt(qtyDiv.querySelector('input').value,10)||0; 
    if(q>0) {
      const cookieName = r.dataset.cookie;
      const cookie = COOKIE_FLAVORS.find(c => c.name === cookieName);
      selections.push({ 
        name: cookieName, 
        qty: q,
        price: cookie ? cookie.price : 0
      }); 
    }
  }); 
  return selections; 
}

// Fixed addCustomBoxToCart function
function addCustomBoxToCart() {
  if (!state.selectedBoxSize) { 
    showToast('Please select a box size first', 'warning'); 
    return; 
  }
  
  const items = getSelectedCookies(); 
  if (items.length === 0) { 
    showToast('Please select at least one cookie for your custom pack', 'warning'); 
    return; 
  }
  
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  
  if (state.selectedBoxSize === 'others') {
    if (totalQty < 3) {
      showToast(`Please select at least 3 cookies for your custom pack. Currently selected: ${totalQty}`, 'warning');
      return;
    }
  } else {
    if (totalQty != state.selectedBoxSize) {
      showToast(`Please select exactly ${state.selectedBoxSize} cookies for your box. Currently selected: ${totalQty}`, 'warning');
      return;
    }
  }
  
  const overLimitCookies = items.filter(item => item.qty > ORDER_LIMITS.custom.perCookie);
  if (overLimitCookies.length > 0) {
    showToast(`Maximum ${ORDER_LIMITS.custom.perCookie} per cookie flavor allowed`, 'warning');
    return;
  }
  
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // Generate unique ID for custom pack
  const customBoxId = `custom-${Date.now()}`;
  
  state.cart.push({
    id: customBoxId,
    type: 'customBox',
    name: state.selectedBoxSize === 'others' ? `Custom pack (${totalQty} cookies)` : `Custom pack of ${state.selectedBoxSize}`,
    boxSize: state.selectedBoxSize === 'others' ? totalQty.toString() : state.selectedBoxSize,
    items: [...items],
    price: totalPrice,
    quantity: 1,
    total: totalPrice
  });

  updateCartDisplay();
  closeCustomizeModal();
  
  // Remove active class from custom pack card
  const customBoxCard = document.querySelector('.cookie-card:last-child');
  if (customBoxCard) customBoxCard.classList.remove('active');
  
  showToast(`Added custom pack to cart!`);
  
  // Reset selections
  state.selectedBoxSize = null;
}

// Social Media Functions
function toggleSocialPlatformSelection(input) {
  const platformSelection = DOM.get('#socialPlatformSelection');
  if (!platformSelection) return;
  
  if (input.value.trim().length > 0) {
    DOM.show(platformSelection);
    // Add required attribute to radio buttons
    DOM.getAll('input[name="socialPlatform"]').forEach(radio => {
      radio.required = true;
    });
  } else {
    DOM.hide(platformSelection);
    clearSocialPlatformSelection();
    // Remove required attribute
    DOM.getAll('input[name="socialPlatform"]').forEach(radio => {
      radio.required = false;
    });
  }
}

function checkSocialHandleFocus(input) {
  const platformSelection = DOM.get('#socialPlatformSelection');
  if (!platformSelection) return;
  
  if (input.value.trim().length > 0) {
    DOM.show(platformSelection);
  }
}

function clearSocialPlatformSelection() {
  const options = DOM.getAll('.social-platform-option');
  options.forEach(opt => {
    opt.classList.remove('active');
    const radio = opt.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });
}

function selectSocialPlatform(element) {
  const options = DOM.getAll('.social-platform-option');
  options.forEach(opt => {
    opt.classList.remove('active');
    const radio = opt.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });
  
  element.classList.add('active');
  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
}

// Helper: scroll to a section, center its form container, optionally focus a field, and show a toast
function scrollToErrorSection(sectionNumber, fieldEl, toastMessage) {
  if (typeof updateCurrentSection === 'function') {
    updateCurrentSection(sectionNumber);
  }

  scrollToSection(sectionNumber);

  if (fieldEl && typeof fieldEl.focus === 'function') {
    setTimeout(() => fieldEl.focus(), 350);
  }

  if (toastMessage && typeof showToast === 'function') {
    showToast(toastMessage, 'error');
  }

  return false;
}


function validateForm() {
  console.log('[validateForm] running'); // debug marker so you can see it in console

  // Clear previous errors and highlights
  clearAllErrors();

  // -------------------------
  // 1. SECTION 2 – NAME
  // -------------------------
  const nameField = document.querySelector('input[name="name"]');
  const nameValue = nameField ? nameField.value.trim() : '';

  if (!nameField || !nameValue) {
    showFieldError(nameField, 'Please enter your name');
    return scrollToErrorSection(2, nameField, 'Please complete your name first.');
  } else {
    const nameRegex = /^[A-Za-z\s'.-]+$/;
    if (!nameRegex.test(nameValue)) {
      showFieldError(
        nameField,
        'Please use letters only (no emojis or special characters)'
      );
      return scrollToErrorSection(2, nameField, 'Please fix your name before continuing.');
    }
  }

  // -------------------------
  // 2. SECTION 3 – DELIVERY DATE
  // -------------------------
  const dateField = document.querySelector('#deliveryDateInput');
  const dateValue = dateField ? dateField.value.trim() : '';

  if (!dateField || !dateValue) {
    showFieldError(dateField, 'Please select a delivery date');
    return scrollToErrorSection(3, dateField, 'Please select a delivery date.');
  }

  // -------------------------
  // 3. SECTION 3 – TIME SLOT
  // (uses hidden field + active tile)
  // -------------------------
  const activeTimeSlot = document.querySelector('#section-3 .time-slot-option.active');
  const timeSlotField = document.querySelector('#timeSlotField');
  let timeSlotValue = timeSlotField ? timeSlotField.value.trim() : '';

  // If a tile is active but hidden field is empty, sync it once
  if (activeTimeSlot && !timeSlotValue && timeSlotField) {
    const label = activeTimeSlot.innerText || activeTimeSlot.textContent || '';
    timeSlotValue = label.trim();
    timeSlotField.value = timeSlotValue;
  }

  if (!activeTimeSlot || !timeSlotValue) {
    const timeSlotContainer = document.querySelector('#section-3 #timeslot-div');
    if (timeSlotContainer) {
      showContainerError(
        document.querySelector('#section-3'),
        timeSlotContainer,
        'Please select a preferred time slot'
      );
    }
    return scrollToErrorSection(3, timeSlotContainer, 'Please select a preferred time slot.');
  }

  // -------------------------
  // 4. SECTION 4 – DELIVERY METHOD
  // -------------------------
  const deliveryMethodSelected = document.querySelector('input[name="deliveryMethod"]:checked');
  if (!deliveryMethodSelected) {
    const deliveryContainer = document.querySelector('#section-4 .space-y-4');
    if (deliveryContainer) {
      showContainerError(
        document.querySelector('#section-4'),
        deliveryContainer,
        'Please select a delivery method'
      );
    }
    return scrollToErrorSection(4, deliveryContainer, 'Please select a delivery method.');
  }

  // -------------------------
  // 5. SECTION 5 – CART / COOKIES
  // -------------------------
  if (!Array.isArray(state.cart) || state.cart.length === 0) {
    const cookieSection = document.querySelector('#section-5');
    showToast('Please add at least one item to your cart before submitting.', 'warning');
    return scrollToErrorSection(5, cookieSection, null);
  }

  // -------------------------
  // 6. SECTION 6 – CONTACT NUMBER
  // -------------------------
  const contactField = document.querySelector('input[name="contactNumber"]');
  const contactValue = contactField ? contactField.value.trim() : '';
  const phoneRegex = /^(09|\+639)\d{9}$/;

  if (!contactField || !contactValue) {
    showFieldError(contactField, 'Please enter your contact number');
    return scrollToErrorSection(6, contactField, 'Please enter your contact number.');
  }

  if (!phoneRegex.test(contactValue)) {
    showFieldError(
      contactField,
      'Please enter a valid Philippine phone number (e.g., 09123456789)'
    );
    return scrollToErrorSection(6, contactField, 'Please fix your contact number.');
  }

  // -------------------------
  // 7. SECTION 6 – SOCIAL (only if handle entered)
  // -------------------------
  const socialHandleField = document.querySelector('#socialHandleInput');
  const socialHandle = socialHandleField ? socialHandleField.value.trim() : '';
  const platformSelected = document.querySelector('input[name="socialPlatform"]:checked');

  if (socialHandle && !platformSelected) {
    const socialContainer = document.querySelector('#socialPlatformSelection');
    showContainerError(
      socialContainer,
      socialContainer,
      'Please select a social media platform since you provided a username'
    );
    return scrollToErrorSection(6, socialContainer, 'Please choose a social media platform.');
  }

  // -------------------------
  // 8. SECTION 7 – PAYMENT
  // -------------------------
  const paymentField = document.querySelector('select[name="payment"]');
  const paymentValue = paymentField ? paymentField.value : '';

  if (!paymentField || !paymentValue) {
    showFieldError(paymentField, 'Please select a payment method');
    return scrollToErrorSection(7, paymentField, 'Please select a payment method.');
  }

  // If we reach here, all checks passed
  return true;
}


function setupSectionFocusTracking() {
  document.addEventListener(
    'focusin',
    (event) => {
      const section = event.target.closest('section[id^="section-"]');
      if (!section) return;

      const match = section.id.match(/^section-(\d+)$/);
      if (!match) return;

      const id = parseInt(match[1], 10);
      if (isNaN(id)) return;

      console.log('Focus moved to section', id);
      updateCurrentSection(id);
    },
    true // capture phase so we catch focus even before it bubbles
  );
}

function updateCurrentSection(sectionId) {
  console.log(`Navigated to section ${sectionId} via button`);

  // Remove active state from all sections
  document.querySelectorAll('section').forEach(section => {
    section.classList.remove('active-section');
  });

  // Add active state to the current section
  const activeSection = document.getElementById(`section-${sectionId}`);
  if (activeSection) {
    activeSection.classList.add('active-section');
  }
}


// Enhanced navigation buttons with better UX
function enhanceNavigationButtons() {
  // Add click handlers to all next/prev buttons
  document.addEventListener('click', function(e) {
    const button = e.target.closest('.nav-button, .arrow-btn');
    if (!button) return;
    
    // Add loading state to button
    button.classList.add('loading');
    setTimeout(() => {
      button.classList.remove('loading');
    }, 500);
  });
}

function showFieldError(field, message) {
  if (!field) return;

  // Add error highlight to the field
  field.classList.add('error-highlight');

  // Clear any existing error first
  const existingError = field.nextElementSibling;
  if (existingError && (existingError.classList.contains('field-error') || existingError.classList.contains('container-error'))) {
    existingError.remove();
  }

  // Create error message element
  const errorElement = document.createElement('div');
  errorElement.className = 'field-error';
  errorElement.textContent = `⚠️ ${message}`;

  // Insert after the field
  field.parentNode.insertBefore(errorElement, field.nextSibling);
}

// Replace the showContainerError function with this improved version
function showContainerError(sectionElement, container, message) {
  if (!container || !sectionElement) return;
  
  // Add error highlight to the container
  container.classList.add('container-error-highlight');
  
  // Create error message element
  const errorElement = document.createElement('div');
  errorElement.className = 'container-error';
  errorElement.textContent = `⚠️ ${message}`;
  
  // Insert the error message AFTER the container (outside)
  container.parentNode.insertBefore(errorElement, container.nextSibling);
}
  
function buildOrderSummary() {
  const form = DOM.get('#orderForm');
  if (!form) return;

  const name = form.name.value.trim();
  const socialPlatform = form.socialPlatform?.value || '';
  const socialHandle = form.socialHandle.value.trim();
  
  let socialDisplay = 'Not provided';
  if (socialHandle && socialPlatform) {
    socialDisplay = `${socialHandle} - ${socialPlatform}`;
  } else if (socialHandle) {
    socialDisplay = `${socialHandle} (platform not selected)`;
  } else if (socialPlatform) {
    socialDisplay = `${socialPlatform} (no username)`;
  }
  
  const deliveryDate = form.deliveryDate.value || '—';
  const timeSlotField = DOM.get('#timeSlotField');
  const timeSlot = timeSlotField && timeSlotField.value ? timeSlotField.value : 'Not selected';
  const deliveryMethodElement = DOM.get('input[name="deliveryMethod"]:checked');
  const deliveryMethod = deliveryMethodElement ? deliveryMethodElement.value : 'Not selected';
  const contact = form.contactNumber.value.trim();
  const notes = form.notes.value.trim();
  const payment = form.payment.value;

  let totalAmount = 0;
  let html = `<strong>Name:</strong> ${escapeHtml(name)}<br>
              <strong>Social:</strong> ${escapeHtml(socialDisplay)}<br>
              <strong>Delivery Date:</strong> ${escapeHtml(deliveryDate)}<br>
              <strong>Preferred Time:</strong> ${escapeHtml(timeSlot)}<br>
              <strong>Delivery Method:</strong> ${escapeHtml(deliveryMethod === 'pickup' ? 'Pick Up' : 'Delivery')}<br>
              <strong>Contact Number:</strong> ${escapeHtml(contact)}<br>
              <strong>Payment Method:</strong> ${escapeHtml(payment)}<br><hr>`;
  
  html += `<strong>Order Items:</strong><br>`;
  
  if (state.cart.length > 0) {
    state.cart.forEach((item) => {
      totalAmount += item.total;
      if (item.type === 'customBox') {
        html += `- ${item.name}: ` +
          item.items.map(it => `${it.name} x ${it.qty}`).join(', ') +
          ` = ₱${item.total}<br>`;
      } else {
        html += `- ${item.name} x ${item.quantity} = ₱${item.total}<br>`;
      }
    });
  } else {
    html += `No items in cart<br>`;
  }
  
  html += `<hr><strong>Total Amount:</strong> ₱${totalAmount}<br>`;
  html += `<hr><strong>Notes:</strong><br>${escapeHtml(notes)}<br>`;
  
  const summaryContent = DOM.get('#summaryContent');
  if (summaryContent) summaryContent.innerHTML = html;
}

function generateOrderId(name) {
  const now = new Date();
  
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);
  
  let initials = 'XX';
  if (name && name.trim()) {
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      initials = (nameParts[0].substring(0, 2) + nameParts[1].substring(0, 1)).toUpperCase();
    } else {
      initials = nameParts[0].substring(0, 3).toUpperCase();
    }
  }
  
  const sequenceKey = `orderSequence_${month}${day}${year}`;
  let sequence = parseInt(localStorage.getItem(sequenceKey)) || 1;
  
  const orderId = `WD${month}${day}${year}${initials}${sequence.toString().padStart(3, '0')}`;
  
  localStorage.setItem(sequenceKey, sequence + 1);
  
  return orderId;
}

function prepareFormSubmitData() {
  const form = document.getElementById('orderForm');
  if (!form) {
    console.error('Order form not found');
    return null;
  }

  try {
    const name = form.name.value.trim();
    
    if (!name) {
      console.error('Customer name is required');
      return null;
    }

    const orderId = generateOrderId(name);
    const socialPlatform = form.socialPlatform?.value || '';
    const socialHandle = form.socialHandle.value.trim();
    
    let socialDisplay = 'Not provided';
    if (socialHandle && socialPlatform) {
      socialDisplay = `${socialHandle} - ${socialPlatform}`;
    } else if (socialHandle) {
      socialDisplay = `${socialHandle} (platform not selected)`;
    } else if (socialPlatform) {
      socialDisplay = `${socialPlatform} (no username)`;
    }
    
    const contactNumber = form.contactNumber.value.trim();
    const deliveryDate = form.deliveryDate.value || 'Not selected';
    const timeSlotField = document.getElementById('timeSlotField');
    const timeSlot = timeSlotField && timeSlotField.value ? timeSlotField.value : 'Not selected';
    const deliveryMethodElement = document.querySelector('input[name="deliveryMethod"]:checked');
    const deliveryMethod = deliveryMethodElement ? deliveryMethodElement.value : 'Not selected';
    const payment = form.payment.value;
    const notes = form.notes.value.trim();
    
    const totalAmount = state.cart.reduce((sum, item) => sum + item.total, 0);
    const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    // FIX: Define orderDetails and cookieQuantities
    const orderDetails = state.cart.map(item => {
      if (item.type === 'customBox') {
        return `${item.name}: ${item.items.map(it => `${it.name} (x${it.qty})`).join(', ')} = ₱${item.total}`;
      } else {
        return `${item.name} x ${item.quantity} = ₱${item.total}`;
      }
    }).join('\n');

    const cookieQuantities = calculateCookieQuantities();

    const orderData = {
      orderId: orderId,
      customerName: name,
      totalAmount: totalAmount,
      itemCount: itemCount,
      deliveryDate: deliveryDate,
      timeSlot: timeSlot,
      timestamp: new Date().toISOString(),
      contactNumber: contactNumber,
      social: socialDisplay,
      deliveryMethod: deliveryMethod,
      payment: payment,
      notes: notes,
      cart: [...state.cart] // Include the cart for thank-you page
    };

    // Setup form data for submission
    const businessOrderSummary = `
🚨 NEW COOKIE ORDER - ACTION REQUIRED 🚨
=========================================
ORDER ID: ${orderId}
STATUS: AWAITING CONFIRMATION

CUSTOMER INFORMATION:
• Name: ${name}
• Social: ${socialDisplay}
• Contact: ${contactNumber}

DELIVERY INFORMATION:
• Date: ${deliveryDate}
• Time Slot: ${timeSlot}
• Method: ${deliveryMethod === 'pickup' ? 'Pick Up' : 'Delivery'}
• Payment: ${payment}

ORDER DETAILS:
${orderDetails}

TOTAL AMOUNT: ₱${totalAmount}

CUSTOMER NOTES:
${notes || 'No special notes'}

🎯 ACTION REQUIRED:
1. Contact customer within 24 hours
2. Confirm order details via Tiktok/IG/FB
3. Arrange payment & delivery
4. Update order status

CONTACT OPTIONS:
📱 Contact: ${contactNumber}
📱 Social: ${socialDisplay}

Order received: ${new Date().toLocaleString()}
    `.trim();
    
    document.getElementById('autoResponseField').value = businessOrderSummary;
    document.getElementById('orderSummaryField').value = businessOrderSummary;
    document.getElementById('customerNameField').value = name;
    document.getElementById('customerContactField').value = `${socialHandle} | ${contactNumber}`;
    document.getElementById('deliveryInfoField').value = `${deliveryDate} - ${deliveryMethod === 'pickup' ? 'Pick Up' : 'Delivery'}`;
    document.getElementById('totalAmountField').value = `₱${totalAmount}`;
    document.getElementById('orderIdField').value = orderId;
    
    const subjectField = document.querySelector('input[name="_subject"]');
    if (subjectField) {
      subjectField.value = `Why Dough Order #${orderId} - ${name} - ${itemCount} item(s) - ₱${totalAmount}`;
    }
    
    setupGoogleFormsData(orderId, name, socialHandle, contactNumber, deliveryDate, timeSlot, deliveryMethod, payment, notes, orderDetails, cookieQuantities, totalAmount);
    
    return orderData;
    
  } catch (error) {
    console.error('Error preparing form data:', error);
    return null;
  }
}

function calculateCookieQuantities() {
  const quantities = {};
  
  state.cart.forEach(item => {
    if (item.type === 'premade') {
      if (item.name === 'The OG Set') {
        quantities['The Usual'] = (quantities['The Usual'] || 0) + item.quantity;
        quantities['The Red One'] = (quantities['The Red One'] || 0) + item.quantity;
        quantities['The Burnt One'] = (quantities['The Burnt One'] || 0) + item.quantity;
      } else if (item.name === 'The Classics') {
        quantities['The Usual'] = (quantities['The Usual'] || 0) + item.quantity;
        quantities['The Red One'] = (quantities['The Red One'] || 0) + item.quantity;
        quantities['The Burnt One'] = (quantities['The Burnt One'] || 0) + item.quantity;
        quantities['The Milky One'] = (quantities['The Milky One'] || 0) + item.quantity;
        quantities['Pistash'] = (quantities['Pistash'] || 0) + item.quantity;
        quantities['The Bizz'] = (quantities['The Bizz'] || 0) + item.quantity;
      } else if (item.name === 'Samplers') {
        quantities['Sampler Pack'] = (quantities['Sampler Pack'] || 0) + item.quantity;
      }
    } else if (item.type === 'customBox') {
      item.items.forEach(cookieItem => {
        quantities[cookieItem.name] = (quantities[cookieItem.name] || 0) + cookieItem.qty;
      });
    }
  });
  
  return quantities;
}

function setupGoogleFormsData(orderId, name, social, contactNumber, deliveryDate, timeSlot, deliveryMethod, payment, notes, orderDetails, cookieQuantities, totalAmount) {
  let googleForm = DOM.get('#googleForm');
  if (!googleForm) {
    googleForm = document.createElement('form');
    googleForm.id = 'googleForm';
    googleForm.style.display = 'none';
    googleForm.method = 'POST';
    googleForm.action = 'https://docs.google.com/forms/d/e/1FAIpQLSfEhi7T_6QIM52HL9YDgM3WkkmC4DVGUIDmdSexcpD7GF41Jw/formResponse';
    document.body.appendChild(googleForm);
  }
  
  googleForm.innerHTML = '';
  
  const fieldMapping = {
    'entry.1702384608': orderId,
    'entry.884438646': name,
    'entry.1424096514': social,
    'entry.2010027852': contactNumber,
    'entry.1965862851': deliveryDate,
    'entry.57353341': timeSlot,
    'entry.376530706': deliveryMethod,
    'entry.603581341': payment,
    'entry.658455856': notes,
    'entry.1597602789': orderDetails,
    'entry.1560348506': formatCookieQuantities(cookieQuantities),
    'entry.891879407': `₱${totalAmount}`,
  };
  
  Object.entries(fieldMapping).forEach(([fieldId, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = fieldId;
    input.value = value || '';
    googleForm.appendChild(input);
  });
}

function formatCookieQuantities(cookieQuantities) {
  return Object.entries(cookieQuantities)
    .map(([cookie, qty]) => `${cookie}: ${qty}`)
    .join('; ');
}

// Enhanced handleFormSubmit function
async function handleFormSubmit(e) {
  e.preventDefault();

  console.log('handleFormSubmit running'); // <- add this

  // Force the currently focused field to blur so its inline validation runs
  if (document.activeElement && document.activeElement !== document.body) {
    try {
      document.activeElement.blur();
    } catch (err) {
      // ignore
    }
  }
  // Validate form before submission
  if (!validateForm()) {
    return;
  }

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('hidden');
  }

  try {
    // Prepare and submit order data
    const orderData = prepareFormSubmitData();
    if (!orderData) {
      throw new Error('Failed to prepare order data');
    }

    // STORE ORDER DATA FOR THANK-YOU PAGE
    storeOrderDataForThankYouPage(orderData);
    
    // Submit to both services
    const [googleSuccess, emailSuccess] = await Promise.allSettled([
      submitToGoogleForms(),
      submitToFormSubmit()
    ]);

    // Handle submission results
    const googleOk = googleSuccess.status === 'fulfilled' && googleSuccess.value;
    const emailOk = emailSuccess.status === 'fulfilled' && emailSuccess.value;

    if (googleOk && emailOk) {
      showToast('Order submitted successfully! 📧📊', 'success');
    } else if (googleOk) {
      showToast('Order submitted to tracking! (Email failed)', 'warning');
    } else if (emailOk) {
      showToast('Order submitted via email! (Tracking failed)', 'warning');
    } else {
      showToast('Order received offline! We\'ll contact you soon.', 'warning');
    }

    // Clear cart and redirect
    clearCartAfterSubmission();

    // Add a small delay to ensure storage is written
    setTimeout(() => {
      window.location.href = '/thank-you';
    }, 1000);

  } catch (error) {
    console.error('Submission error:', error);
    showToast('Order received! Please contact us if you don\'t hear back.', 'warning');
    
    // Still redirect to thank you page even if submission fails
    clearCartAfterSubmission();
    setTimeout(() => {
      window.location.href = '/thank-you';
    }, 1000);
  } finally {
    // Restore button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    
    // Hide loading overlay
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }
}

// Store order data for thank-you page
function storeOrderDataForThankYouPage(orderData) {
  try {
    // Include cart in order data
    const completeOrderData = {
      ...orderData,
      cart: [...state.cart], // Copy current cart
      timestamp: new Date().toISOString()
    };

    // Store in both sessionStorage and localStorage for redundancy
    sessionStorage.setItem('lastOrder', JSON.stringify(completeOrderData));
    localStorage.setItem('lastOrder', JSON.stringify(completeOrderData));
    
    console.log('Order data stored:', completeOrderData);
    return true;
  } catch (error) {
    console.error('Error storing order data:', error);
    return false;
  }
}

function setupRealTimeValidation() {
  // Input fields - with enhanced clearing
  const fieldsToValidate = [
    'input[name="name"]',
    'input[name="contactNumber"]',
    '#deliveryDateInput',
    'select[name="payment"]'
  ];
  
  fieldsToValidate.forEach(selector => {
    const field = document.querySelector(selector);
    if (field) {
      field.addEventListener('blur', function() {
        validateSingleField(this);
      });
      
      field.addEventListener('input', function() {
        // Clear error when user starts typing
        if (selector === '#deliveryDateInput') {
          clearDeliveryDateError();
        } else {
          this.classList.remove('error-highlight');
          const error = this.nextElementSibling;
          if (error && (error.classList.contains('field-error') || error.classList.contains('container-error'))) {
            error.remove();
          }
        }
      });
    }
  });

  const nameField = document.querySelector('input[name="name"]');
  if (nameField) {
    nameField.addEventListener('input', function () {
      const cleaned = this.value.replace(/[^A-Za-z\s'.-]/g, '');
      if (cleaned !== this.value) this.value = cleaned;
    });
  }

  // Radio groups - time slot (with enhanced clearing)
  const timeSlotRadios = document.querySelectorAll('input[name="timeSlot"]');
  timeSlotRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      clearTimeSlotError();
    });
  });

  // Radio groups - delivery method (with enhanced clearing)
  const deliveryRadios = document.querySelectorAll('input[name="deliveryMethod"]');
  deliveryRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      clearDeliveryMethodError();
    });
  });

  // Social media
  const socialInput = document.querySelector('#socialHandleInput');
  if (socialInput) {
    socialInput.addEventListener('input', function() {
      clearSocialMediaError();
    });
  }

  const socialRadios = document.querySelectorAll('input[name="socialPlatform"]');
  socialRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      clearSocialMediaError();
    });
  });
  
  // Payment method
  const paymentSelect = document.querySelector('select[name="payment"]');
  if (paymentSelect) {
    paymentSelect.addEventListener('change', function() {
      this.classList.remove('error-highlight');
      const error = this.nextElementSibling;
      if (error && error.classList.contains('field-error')) {
        error.remove();
      }
    });
  }
}

function validateSingleField(field) {
  const fieldName = field.name || field.id;
  
  // Clear any existing error for this field
  if (fieldName === 'deliveryDate') {
    clearDeliveryDateError();
  } else {
    field.classList.remove('error-highlight');
    const existingError = field.nextElementSibling;
    if (existingError && (existingError.classList.contains('field-error') || existingError.classList.contains('container-error'))) {
      existingError.remove();
    }
  }
  
  // Validate based on field type
  if (field.name === 'name') {
    const value = field.value.trim();
    if (!value) {
      showFieldError(field, 'Please enter your name');
      return false;
    }
  
    const nameRegex = /^[A-Za-z\s'.-]+$/;
    if (!nameRegex.test(value)) {
      showFieldError(field, 'Please use letters only (no emojis or special characters)');
      return false;
    }
    //clearFieldError(field);
    return true;

  } else if (fieldName === 'deliveryDate' && field.value == '') {
    showFieldError(field, 'Please select a delivery date');
  } else if (fieldName === 'contactNumber') {
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (!field.value.trim()) {
      showFieldError(field, 'Please enter your contact number');
    } else if (!phoneRegex.test(field.value.trim())) {
      showFieldError(field, 'Please enter a valid Philippine phone number');
    }
  } else if (fieldName === 'payment' && !field.value) {
    showFieldError(field, 'Please select a payment method');
  }
}

function clearDeliveryDateError() {
  const dateField = document.querySelector('#deliveryDateInput');

  if (dateField) {
    // Remove highlight on the input
    dateField.classList.remove('error-highlight');

    // Remove error message directly after the input
    const next = dateField.nextElementSibling;
    if (
      next &&
      (next.classList.contains('field-error') ||
        next.classList.contains('container-error'))
    ) {
      next.remove();
    }
  }

  // Optional: also remove any container highlight on the wrapper, if ever used
  const dateContainer = document.querySelector('#deliverydate-div');
  if (dateContainer) {
    dateContainer.classList.remove('container-error-highlight');
  }
}


function clearTimeSlotError() {
  const timeSlotContainer = document.querySelector('#section-3 #timeslot-div');
  const timeSlotSection = document.querySelector('#section-3');
  
  if (timeSlotContainer) {
    timeSlotContainer.classList.remove('container-error-highlight');
  }
  
  // Remove any container errors that are siblings of the time slot container
  const error = timeSlotContainer?.nextElementSibling;
  if (error && error.classList.contains('container-error')) {
    error.remove();
  }
}

function clearDeliveryMethodError() {
  const deliveryContainer = document.querySelector('#section-4 .space-y-4');
  
  if (deliveryContainer) {
    deliveryContainer.classList.remove('container-error-highlight');
  }
  
  // Remove any container errors that are siblings of the delivery container
  const error = deliveryContainer?.nextElementSibling;
  if (error && error.classList.contains('container-error')) {
    error.remove();
  }
}

// Update the existing clearAllErrors function to use these specific functions
function clearAllErrors() {
  // Use specialized clear helpers where available
  if (typeof clearDeliveryDateError === 'function') clearDeliveryDateError();
  if (typeof clearTimeSlotError === 'function') clearTimeSlotError();
  if (typeof clearDeliveryMethodError === 'function') clearDeliveryMethodError();
  if (typeof clearSocialMediaError === 'function') clearSocialMediaError();

  // Remove all inline error messages
  const errorMessages = document.querySelectorAll('.field-error, .container-error');
  errorMessages.forEach(error => error.remove());

  // Remove any highlight classes
  const highlighted = document.querySelectorAll('.error-highlight, .container-error-highlight');
  highlighted.forEach(element => {
    element.classList.remove('error-highlight', 'container-error-highlight');
  });
}

function clearSocialMediaError() {
  const socialContainer = document.querySelector('#socialPlatformSelection');
  if (socialContainer) {
      socialContainer.classList.remove('container-error-highlight');
      const error = socialContainer.querySelector('.container-error');
      if (error) error.remove();
  }
}

async function submitToGoogleForms() {
  const googleForm = DOM.get('#googleForm');
  if (!googleForm) {
    return false;
  }
  
  try {
    const formData = new URLSearchParams();
    const inputs = googleForm.querySelectorAll('input');
    
    if (inputs.length === 0) {
      return false;
    }
    
    inputs.forEach(input => {
      if (input.name && input.value) {
        formData.append(input.name, input.value);
      }
    });
    
    await fetch(googleForm.action, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
    
    return true;
    
  } catch (error) {
    return false;
  }
}

async function submitToFormSubmit() {
  const form = DOM.get('#orderForm');
  const formData = new FormData(form);
  
  try {
    const response = await fetch('https://formsubmit.co/ajax/whydoughcookies@gmail.com', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (result.success) {
      return true;
    } else {
      return false;
    }
    
  } catch (error) {
    return false;
  }
}

function clearCartAfterSubmission() {
  state.cart = [];
  updateCartDisplay();
  localStorage.removeItem('whyDoughCart');
}

function saveCartToStorage() {
  localStorage.setItem('whyDoughCart', JSON.stringify(state.cart));
}

function escapeHtml(str){ 
  if(!str) return '—'; 
  return String(str).replace(/[&<>"']/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); 
}

// Updated Meet the Doughs Functions
function initializeFlavorsSection() {
const flavors = [
  { 
    name: "The Usual", 
    description: "Crispy outside, soft inside—loaded with premium dark and milk chocolate for the ultimate classic cookie.", 
    image: "images/the-usual.PNG" 
  },
  { 
    name: "The Red One", 
    description: "Soft red velvet cookie filled with creamy cream cheese and layered with premium white chocolate.", 
    image: "images/the-red-one.PNG" 
  },
  { 
    name: "The Burnt One", 
    description: "Rich dark chocolate cookie packed with premium dark chocolate and a luscious cream cheese center.", 
    image: "images/the-burnt-one.PNG" 
  },
  { 
    name: "The Bizz", 
    description: "Chewy cookie with rich Lotus Biscoff flavor, crunchy biscuit bits, and smooth milk chocolate.", 
    image: "images/the-bizz.PNG" 
  },
  { 
    name: "The Milky One", 
    description: "Soft buttery cookie overflowing with creamy white chocolate—sweet, chewy, and irresistibly dreamy.", 
    image: "images/milky-one.PNG" 
  },
  { 
    name: "Pistash", 
    description: "Tender pistachio cookie infused with pistachio cream and crunch, finished with white and milk chocolate.", 
    image: "images/pistash.PNG" 
  },
  { 
    name: "The OT", 
    description: "Malty Ovaltine cookie with a crunchy surprise filling and creamy milk chocolate.", 
    image: "images/the-ot.PNG" 
  },
  { 
    name: "Nut-so-Carrot", 
    description: "Moist carrot cake–inspired cookie with cream cheese filling, real carrot goodness, and white chocolate.", 
    image: "images/nut-so-carrot.PNG" 
  },
  { 
    name: "Espress-oh", 
    description: "Bold coffee cookie with cream cheese filling blended with silky white and milk chocolate.", 
    image: "images/espressoh.PNG" 
  },
  { 
    name: "Berry Match", 
    description: "Earthy matcha cookie with tangy berry bits balanced by smooth white chocolate.", 
    image: "images/berry-match.PNG" 
  }
];

// Initialize both grid and carousel
initializeFlavorsGrid(flavors);
initializeFlavorsCarousel(flavors);
}

function initializeFlavorsGrid(flavors) {
  const grid = document.getElementById('flavorsGrid');
  if (!grid) return;

  grid.innerHTML = flavors.map(flavor => `
    <div class="flavor-card">
      <div class="flavor-image-container">
        <img src="${flavor.image}" alt="${flavor.name}" loading="lazy" class="flavor-image">
      </div>
      <h3 class="flavor-name">${flavor.name}</h3>
      <p class="flavor-description">${flavor.description}</p>
    </div>
  `).join('');

  // Preload images for grid
  preloadFlavorImages(flavors);
}

function initializeFlavorsCarousel(flavors) {
const track = document.getElementById('flavorsCarouselTrack');
const currentSlideElement = document.getElementById('currentSlide');
const totalSlidesElement = document.getElementById('totalSlides');
const prevButton = document.querySelector('.flavor-carousel-prev');
const nextButton = document.querySelector('.flavor-carousel-next');

if (!track) return;

// Set total slides count
if (totalSlidesElement) {
  totalSlidesElement.textContent = flavors.length;
}

// Create carousel items
track.innerHTML = flavors.map((flavor, index) => `
  <div class="flavor-carousel-item">
    <div class="flavor-card">
      <div class="flavor-image-container">
        <img src="${flavor.image}" alt="${flavor.name}" loading="lazy" class="flavor-image">
      </div>
      <h3 class="flavor-name">${flavor.name}</h3>
      <p class="flavor-description">${flavor.description}</p>
    </div>
  </div>
`).join('');

// Carousel state
let currentSlide = 0;
const slideCount = flavors.length;
let isTransitioning = false;

// Update carousel position with smooth transition
function updateCarousel(instant = false) {
  if (instant) {
    track.style.transition = 'none';
  } else {
    track.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  }
  
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  
  // Update counter
  if (currentSlideElement) {
    currentSlideElement.textContent = currentSlide + 1;
  }
  
  // Update button states
  if (prevButton) {
    prevButton.disabled = currentSlide === 0;
  }
  if (nextButton) {
    nextButton.disabled = currentSlide === slideCount - 1;
  }
  
  // Reset transition flag
  if (!instant) {
    isTransitioning = true;
    setTimeout(() => {
      isTransitioning = false;
    }, 500);
  }
}

// Navigation functions with smooth looping
function nextSlide() {
  if (isTransitioning) return;
  
  if (currentSlide < slideCount - 1) {
    currentSlide++;
    updateCarousel();
  } else {
    // Smooth loop to first slide
    currentSlide = 0;
    updateCarousel();
  }
}

function prevSlide() {
  if (isTransitioning) return;
  
  if (currentSlide > 0) {
    currentSlide--;
    updateCarousel();
  } else {
    // Smooth loop to last slide
    currentSlide = slideCount - 1;
    updateCarousel();
  }
}

function goToSlide(index) {
  if (isTransitioning || index < 0 || index >= slideCount) return;
  
  currentSlide = index;
  updateCarousel();
}

// Add event listeners to navigation buttons
if (prevButton) {
  prevButton.addEventListener('click', prevSlide);
}

if (nextButton) {
  nextButton.addEventListener('click', nextSlide);
}

// Touch/swipe support for mobile
let startX = 0;
let currentX = 0;
let isDragging = false;

track.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  isDragging = true;
});

track.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  currentX = e.touches[0].clientX;
});

track.addEventListener('touchend', () => {
  if (!isDragging) return;
  isDragging = false;
  
  const diff = startX - currentX;
  const threshold = 50;
  
  if (diff > threshold) {
    nextSlide();
  } else if (diff < -threshold) {
    prevSlide();
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    prevSlide();
  } else if (e.key === 'ArrowRight') {
    nextSlide();
  }
});

// Auto-advance carousel (mobile only)
let autoAdvance;

function startAutoAdvance() {
  if (window.innerWidth >= 768) return; // Only auto-advance on mobile
  
  autoAdvance = setInterval(() => {
    nextSlide();
  }, 4000);
}

function stopAutoAdvance() {
  if (autoAdvance) {
    clearInterval(autoAdvance);
  }
}

// Start auto-advance
startAutoAdvance();

// Pause auto-advance on hover/touch
const carouselContainer = document.querySelector('.flavors-carousel-container');
if (carouselContainer) {
  carouselContainer.addEventListener('mouseenter', stopAutoAdvance);
  carouselContainer.addEventListener('mouseleave', startAutoAdvance);
  carouselContainer.addEventListener('touchstart', stopAutoAdvance);
  carouselContainer.addEventListener('touchend', startAutoAdvance);
}

// Handle window resize
window.addEventListener('resize', () => {
  stopAutoAdvance();
  startAutoAdvance();
});

// Initial update
updateCarousel(true);

// Preload images for carousel
preloadFlavorImages(flavors);
}

function preloadFlavorImages(flavors) {
flavors.forEach(flavor => {
  if (flavor.image) {
    const img = new Image();
    img.src = flavor.image;
  }
});
}

// Update the homepage initialization
function initializeHomepage() {
  initializeFlavorsSection();
  setupTestimonialSlider();
  setupSmoothScrolling();
}


// Testimonial Slider
function setupTestimonialSlider() {
  const testimonials = [
    {
      text: "The best cookies I've ever had! The OG Set is perfect for trying their signature flavors. The Burnt One is absolutely incredible - don't let the name fool you!",
      author: "Sarah M.",
      role: "Regular Customer"
    },
    {
      text: "I ordered the Samplers for my office and they were gone in minutes! Everyone loved the variety and the perfect texture - chewy but not too soft.",
      author: "Michael T.",
      role: "First-time Customer"
    },
    {
      text: "Why Dough has become our family's weekend treat. The Classics box has something for everyone. The Red One is my personal favorite!",
      author: "The Reyes Family", 
      role: "Loyal Customers"
    }
  ];
  
  let currentTestimonial = 0;
  
  window.changeTestimonial = function(index) {
    currentTestimonial = index;
    const slider = document.getElementById('testimonialSlider');
    const dots = document.querySelectorAll('#testimonials button');
    
    if (!slider) return;
    
    slider.innerHTML = `
      <div class="testimonial-slide text-center">
        <p class="text-lg mb-6 italic">${testimonials[index].text}</p>
        <div class="flex items-center justify-center space-x-3">
          <div class="w-12 h-12 bg-brown/20 rounded-full flex items-center justify-center">
            <span class="font-bold">${testimonials[index].author.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <div class="text-left">
            <p class="font-bold">${testimonials[index].author}</p>
            <p class="text-sm text-brown/70">${testimonials[index].role}</p>
          </div>
        </div>
      </div>
    `;
    
    // Update dots
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.remove('bg-brown/30');
        dot.classList.add('btn-primary');
      } else {
        dot.classList.remove('btn-primary');
        dot.classList.add('bg-brown/30');
      }
    });
  };
  
  // Auto-rotate testimonials
  setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    changeTestimonial(currentTestimonial);
  }, 5000);
}

function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Enhanced scroll handling for iOS
function setupScrollableSections() {
  const scrollableContainers = [
    document.querySelector('#section-5 .form-container')
  ];

  scrollableContainers.forEach(container => {
    if (!container) return;

    // Add scrollable class for CSS targeting
    container.classList.add('scrollable');

    // Detect if content is scrollable
    const isScrollable = container.scrollHeight > container.clientHeight;
    
    if (isScrollable) {
      // Add scroll indicator
      addScrollIndicator(container);
      
      // Track scrolling to hide hints
      container.addEventListener('scroll', function() {
        this.classList.add('scrolling');
        
        // Remove scroll indicator after first scroll
        const indicator = this.querySelector('.scroll-indicator');
        if (indicator) {
          indicator.style.opacity = '0';
          setTimeout(() => indicator.remove(), 300);
        }
      });

      // Show scrollbars on touch start (iOS)
      container.addEventListener('touchstart', function() {
        this.style.overflowY = 'auto';
      });

      // Hide scrollbars after a delay when not scrolling
      let scrollTimeout;
      container.addEventListener('scroll', function() {
        this.style.overflowY = 'auto';
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (this.scrollTop === 0 || 
              this.scrollTop + this.clientHeight >= this.scrollHeight - 10) {
            this.style.overflowY = 'hidden';
          }
        }, 1500);
      });
    }
  });
}

function addScrollIndicator(container) {
  const indicator = document.createElement('div');
  indicator.className = 'scroll-indicator';
  indicator.textContent = 'Scroll for more';
  indicator.style.position = 'absolute';
  indicator.style.bottom = '70px';
  indicator.style.left = '50%';
  indicator.style.transform = 'translateX(-50)';
  indicator.style.background = 'var(--accent)';
  indicator.style.color = 'white';
  indicator.style.padding = '6px 12px';
  indicator.style.borderRadius = '20px';
  indicator.style.fontSize = '0.75rem';
  indicator.style.fontWeight = 'bold';
  indicator.style.zIndex = '10';
  indicator.style.pointerEvents = 'none';
  indicator.style.animation = 'bounce 2s infinite';
  
  container.style.position = 'relative';
  container.appendChild(indicator);

  // Auto-remove after 8 seconds
  setTimeout(() => {
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 300);
  }, 8000);
}

function displayOrderDetails() {
  const orderData = getOrderData();
  console.log('Retrieved order data:', orderData); // Debug log

  if (orderData && orderData.orderId) {
    // Basic header
    const orderIdEl = document.getElementById('orderIdDisplay');
    if (orderIdEl) orderIdEl.textContent = orderData.orderId;

    const customerNameEl = document.getElementById('customerName');
    if (customerNameEl) customerNameEl.textContent = orderData.customerName || '-';

    const orderTotalEl = document.getElementById('orderTotal');
    if (orderTotalEl) orderTotalEl.textContent = orderData.totalAmount || '0';

    const deliveryDateEl = document.getElementById('deliveryDate');
    if (deliveryDateEl) deliveryDateEl.textContent = orderData.deliveryDate || '-';

    // Delivery time slot (shown beside date)
    const timeSlotEl = document.getElementById('timeSlotDisplay');
    if (timeSlotEl) {
      if (orderData.timeSlot && orderData.timeSlot !== 'Not selected') {
        timeSlotEl.textContent = ` • ${orderData.timeSlot}`;
      } else {
        timeSlotEl.textContent = '';
      }
    }

    // Delivery method
    const deliveryMethodEl = document.getElementById('deliveryMethodDisplay');
    if (deliveryMethodEl) {
      deliveryMethodEl.textContent =
        orderData.deliveryMethod && orderData.deliveryMethod !== 'Not selected'
          ? orderData.deliveryMethod
          : '-';
    }

    // Payment method
    const paymentEl = document.getElementById('paymentDisplay');
    if (paymentEl) {
      paymentEl.textContent = orderData.payment || '-';
    }

    // Social handle (only show if provided)
    const socialRowEl = document.getElementById('socialRow');
    const socialEl = document.getElementById('socialDisplay');
    if (socialRowEl && socialEl) {
      if (orderData.social && orderData.social !== 'Not provided') {
        socialEl.textContent = orderData.social;
        socialRowEl.classList.remove('hidden');
      } else {
        socialRowEl.classList.add('hidden');
        socialEl.textContent = '';
      }
    }

    // Notes (only show if not empty)
    const notesRowEl = document.getElementById('notesRow');
    const notesEl = document.getElementById('notesDisplay');
    if (notesRowEl && notesEl) {
      if (orderData.notes && orderData.notes.trim() !== '') {
        notesEl.textContent = orderData.notes.trim();
        notesRowEl.classList.remove('hidden');
      } else {
        notesRowEl.classList.add('hidden');
        notesEl.textContent = '';
      }
    }

    // Update items display
    const orderDetailsContainer = document.getElementById('orderDetails');
    if (orderDetailsContainer) {
      if (orderData.cart && orderData.cart.length > 0) {
        const itemsHtml = generateOrderItemsHtml(orderData.cart);
        orderDetailsContainer.innerHTML = itemsHtml;
      } else {
        orderDetailsContainer.innerHTML =
          '<li class="text-brown-600">Items: No items in order</li>';
      }
    }

    document.title = `Order #${orderData.orderId} - Why Dough`;
    console.log('Order details displayed successfully');
  } else {
    const orderIdEl = document.getElementById('orderIdDisplay');
    if (orderIdEl) orderIdEl.textContent = 'Not Found';

    const orderDetails = document.getElementById('orderDetails');
    if (orderDetails) {
      orderDetails.innerHTML =
        '<li class="text-brown-600">Order details not available.</li>';
    }

    console.warn('Order data not found for display');
    // no toast on thank-you
  }
}

// New function to generate detailed order items HTML
function generateOrderItemsHtml(cart) {
  if (!cart || cart.length === 0) {
    return '<li>• Items: No items in order</li>';
  }

  let itemsHtml = '<li>• Items:</li>';

  cart.forEach((item) => {
    if (item.type === 'customBox') {
      // Custom pack items with commas, only show cookies with qty > 0
      const cookiesText = (item.items || [])
        .filter(cookieItem => cookieItem.qty > 0)
        .map(cookieItem => `${cookieItem.name} (×${cookieItem.qty})`)
        .join(', ');

      itemsHtml += `<li class="ml-4 text-brown-600">- ${item.name}: ${cookiesText}</li>`;
    } else {
      // Premade items
      itemsHtml += `<li class="ml-4 text-brown-600">- ${item.name} × ${item.quantity}</li>`;
    }
  });

  return itemsHtml;
}

// Enhanced getOrderData function
function getOrderData() {
  let orderData = null;
  
  try {
    // Try sessionStorage first (more secure for single session)
    orderData = sessionStorage.getItem('lastOrder');
    
    // If not found in sessionStorage, try localStorage
    if (!orderData) {
      orderData = localStorage.getItem('lastOrder');
    }

    // If still not found, check URL parameters (fallback)
    if (!orderData) {
      orderData = getOrderDataFromURL();
    }

    if (orderData) {
      const parsedData = JSON.parse(orderData);
      
      // Validate the order data has required fields
      if (!parsedData.orderId || !parsedData.customerName) {
        console.warn('Order data missing required fields:', parsedData);
        return null;
      }
      
      return parsedData;
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving order data:', error);
    return null;
  }
}

// Fallback: Get order data from URL parameters
function getOrderDataFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  const customerName = urlParams.get('customerName');
  
  if (orderId && customerName) {
    return JSON.stringify({
      orderId: orderId,
      customerName: customerName,
      totalAmount: urlParams.get('totalAmount') || '0',
      deliveryDate: urlParams.get('deliveryDate') || '-',
      cart: [] // Can't recover cart from URL
    });
  }
  
  return null;
}

function clearStorageAndGoHome() {
  sessionStorage.removeItem('lastOrder');
  localStorage.removeItem('lastOrder');
  localStorage.removeItem('whyDoughCart');
  sessionStorage.removeItem('whyDoughCart');
  
  sessionStorage.setItem('comingFromThankYou', 'true');
  
  window.location.href = '/';
}

function copyOrderId() {
  const orderId = DOM.get('#orderIdDisplay').textContent;
  const copyButton = DOM.get('#copyButton');
  const copySuccess = DOM.get('#copySuccess');
  
  if (orderId === 'Loading...' || orderId === 'Not Found') {
    showToast('Order ID not available yet', 'warning');
    return;
  }
  
  navigator.clipboard.writeText(orderId).then(function() {
    DOM.show(copySuccess);
    copyButton.innerHTML = '✅ Copied!';
    copyButton.classList.remove('bg-accent', 'hover:bg-brown-700');
    copyButton.classList.add('bg-green-600', 'hover:bg-green-700');
    
    setTimeout(() => {
      DOM.hide(copySuccess);
      copyButton.innerHTML = '📋 Copy';
      copyButton.classList.remove('bg-green-600', 'hover:bg-green-700');
      copyButton.classList.add('bg-accent', 'hover:bg-brown-700');
    }, 3000);
    
  }).catch(function(err) {
    fallbackCopyTextToClipboard(orderId);
  });
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      const copySuccess = DOM.get('#copySuccess');
      const copyButton = DOM.get('#copyButton');
      
      DOM.show(copySuccess);
      copyButton.innerHTML = '✅ Copied!';
      copyButton.classList.remove('bg-accent', 'hover:bg-brown-700');
      copyButton.classList.add('bg-green-600', 'hover:bg-green-700');
      
      setTimeout(() => {
        DOM.hide(copySuccess);
        copyButton.innerHTML = '📋 Copy';
        copyButton.classList.remove('bg-green-600', 'hover:bg-green-700');
        copyButton.classList.add('bg-accent', 'hover:bg-brown-700');
      }, 3000);
    }
  } catch (err) {
    alert('Failed to copy Order ID. Please manually select and copy the text.');
  }

  document.body.removeChild(textArea);
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', function() {
  // Load cart from storage
  console.log('Why Dough script loaded – v2.4.0');

  const savedCart = localStorage.getItem('whyDoughCart');
  if (savedCart) {
    try {
      state.cart = JSON.parse(savedCart);
    } catch (e) {
      state.cart = [];
    }
  }
  // Setup external navigation if on order page
  if (document.getElementById('orderForm')) {
    setupExternalNavigation();
  }

  setVH();
  setTimeout(setupScrollableSections, 500);
  
  // Homepage initialization
  if (DOM.get('#flavorsCarouselTrack')) {
    initializeHomepage();
  }
  
  // Order page initialization
  const orderForm = DOM.get('#orderForm');
  if (orderForm) {
    generateWeekendDates();
    updateCartDisplay();
    setupRealTimeValidation();
    console.log('Attaching submit handler to orderForm'); // debug
    orderForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Set initial active section for order page
  if (DOM.get('#orderForm')) {
    updateCurrentSection(2); // Start at section-2 (What's your name?)
    setupSectionFocusTracking();
    resetTimeSlotSelection();
  }

  // Thank you page initialization
  if (DOM.get('#orderIdDisplay')) {
    setTimeout(() => {
      displayOrderDetails();
    }, 100);
  }

  
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
});