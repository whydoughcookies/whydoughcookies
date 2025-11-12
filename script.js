// Global variables
let selectedBoxSize = null;
let activeCard = null;
let cart = [];

const cookieFlavors = [
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

const ORDER_LIMITS = {
    premade: {
        ogSet: 9,
        classic6: 9,
        samplers: 9
    },
    custom: {
        perCookie: 20
    }
};

// Product data for the modal
const productData = {
    ogSet: {
        name: "The OG Set",
        description: "A perfect introduction to Why Dough! Includes 3 of our signature cookies: The Usual (our classic chocolate chip), The Red One (rich red velvet), and The Burnt One (deep, caramelized flavors). Each cookie is 100g of pure delight.",
        price: 320,
        image: "images/og-set.PNG",
        id: "ogSet"
    },
    classic6: {
        name: "The Classics",
        description: "Our complete collection! Get all 6 of our classic flavors: The Usual, The Red One, The Burnt One, The Milky One (white chocolate dream), Pistash (pistachio perfection), and The Bizz (unique flavor rotation). Perfect for sharing or treating yourself!",
        price: 660,
        image: "images/classics.PNG",
        id: "classic6"
    },
    samplers: {
        name: "Samplers",
        description: "Can't decide? Try them all! This sampler includes 6 cookies (50g each) - one of each classic flavor. Perfect for first-timers or when you want a little taste of everything. Discover your new favorite!",
        price: 320,
        image: "images/samplers.PNG",
        id: "samplers"
    }
};

let currentProduct = null;
let currentQuantity = 1;

// Homepage specific functionality
function initializeHomepage() {
  initializeFlavorsCarousel();
  setupTestimonialSlider();
  setupSmoothScrolling();
}

// Flavors Carousel Functionality
function initializeFlavorsCarousel() {
  const flavors = [
    {
      name: "The Usual",
      description: "Your klassic ooey gooey bittersweet combo.",
      image: "images/the-usual.PNG"
    },
    {
      name: "The Red One",
      description: "Rich red velvet with white chocolate chunks",
      image: "images/the-red-one.PNG"
    },
    {
      name: "The Burnt One", 
      description: "Deep, caramelized flavors with a perfect crisp",
      image: "images/the-burnt-one.PNG"
    },
    {
      name: "The Bizz",
      description: "Our rotating special flavor - always a surprise!",
      image: "images/the-bizz.PNG"
    },
    {
      name: "The Milky One",
      description: "Creamy white chocolate and macadamia nuts", 
      image: "images/milky-one.PNG"
    },
    {
      name: "Pistash",
      description: "Buttery pistachio with dark chocolate chunks",
      image: "images/pistash.PNG"
    },
    {
      name: "Nut-so-Carrot",
      description: "Carrot cake inspired with nuts and spices",
      image: "images/nut-so-carrot.PNG"
    },
    {
      name: "The OT",
      description: "Oatmeal treat with raisins and cinnamon",
      image: "images/the-ot.PNG"
    },
    {
      name: "Espress-oh",
      description: "Coffee infused with chocolate chunks", 
      image: "images/espressoh.PNG"
    },
    {
      name: "Berry Match",
      description: "Mixed berries with white chocolate",
      image: "images/berry-match.PNG"
    },
  ];

  const track = document.getElementById('flavorsCarouselTrack');
  const indicators = document.getElementById('flavorsCarouselIndicators');
  
  if (!track || !indicators) return;
  
  // Clear existing content
  track.innerHTML = '';
  indicators.innerHTML = '';
  
  // Create carousel items
  flavors.forEach((flavor, index) => {
    // Create carousel item
    const item = document.createElement('div');
    item.className = 'flavor-carousel-item';
    item.innerHTML = `
      <div class="flavor-carousel-image">
        <img src="${flavor.image}" alt="${flavor.name}" class="w-full h-full object-cover rounded-full">
      </div>
      <h3 class="flavor-carousel-name">${flavor.name}</h3>
      <p class="flavor-carousel-description">${flavor.description}</p>
    `;
    track.appendChild(item);
    
    // Create indicator
    const indicator = document.createElement('button');
    indicator.className = `flavor-carousel-indicator ${index === 0 ? 'active' : ''}`;
    indicator.setAttribute('data-index', index);
    indicator.addEventListener('click', () => goToSlide(index));
    indicators.appendChild(indicator);
  });
  
  // Initialize carousel state
  let currentSlide = 0;
  const slideCount = flavors.length;
  
  // Update carousel position
  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update indicators
    document.querySelectorAll('.flavor-carousel-indicator').forEach((indicator, i) => {
      indicator.classList.toggle('active', i === currentSlide);
    });
  }
  
  // Navigation functions
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slideCount;
    updateCarousel();
  }
  
  function prevSlide() {
    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
    updateCarousel();
  }
  
  function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
  }
  
  // Add event listeners to navigation buttons
  document.querySelector('.flavor-carousel-prev').addEventListener('click', prevSlide);
  document.querySelector('.flavor-carousel-next').addEventListener('click', nextSlide);
  
  // Auto-advance carousel
  let autoAdvance = setInterval(nextSlide, 4000);
  
  // Pause auto-advance on hover
  const carouselContainer = document.querySelector('.flavors-carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', () => clearInterval(autoAdvance));
    carouselContainer.addEventListener('mouseleave', () => {
      autoAdvance = setInterval(nextSlide, 4000);
    });
  }
  
  // Touch/swipe support for mobile
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    clearInterval(autoAdvance);
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
    
    // Resume auto-advance
    autoAdvance = setInterval(nextSlide, 4000);
  });
}

// Testimonial Slider Functionality
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

// Order page functionality
function scrollToSection(id){ 
    const element = document.getElementById('section-'+id);
    if (element) element.scrollIntoView({behavior:'smooth'});
}

function openDateInput(){ 
    const input = document.getElementById('deliveryDateInput');
    if (input) input.classList.remove('hidden'); 
}

function selectDeliveryMethod(element, method) {
    document.querySelectorAll('.delivery-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    const radio = element.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
}

function toggleCookieCard(card, inputId) {
    const isActive = card.classList.contains('active');
    
    document.querySelectorAll('.cookie-card').forEach(c => {
        if (c !== card) c.classList.remove('active');
    });
    
    if (isActive) {
        card.classList.remove('active');
        activeCard = null;
    } else {
        card.classList.add('active');
        activeCard = card;
        const input = document.getElementById(inputId);
        if (input && parseInt(input.value) === 0) input.value = 1;
    }
}

function toggleCustomBoxCard(card) {
    const isActive = card.classList.contains('active');
    
    document.querySelectorAll('.cookie-card').forEach(c => {
        if (c !== card) c.classList.remove('active');
    });
    
    if (isActive) {
        card.classList.remove('active');
        activeCard = null;
    } else {
        card.classList.add('active');
        activeCard = card;
        openCustomizeModal();
    }
}

function updateCardCount(inputId, delta) {
    const input = document.getElementById(inputId);
    if (input) {
        let value = parseInt(input.value) || 0;
        const newValue = value + delta;
        
        if (delta > 0 && ORDER_LIMITS.premade[inputId] && newValue > ORDER_LIMITS.premade[inputId]) {
            showToast(`Maximum ${ORDER_LIMITS.premade[inputId]} sets allowed per order`, 'warning');
            return;
        }
        
        input.value = Math.max(0, newValue);
    }
    event.stopPropagation();
}

function addToCart(inputId, itemName, price) {
    const input = document.getElementById(inputId);
    const quantity = parseInt(input.value) || 0;
    
    if (quantity <= 0) {
        showToast('Please select at least 1 quantity', 'warning');
        return;
    }

    if (ORDER_LIMITS.premade[inputId] && quantity > ORDER_LIMITS.premade[inputId]) {
        showToast(`Maximum ${ORDER_LIMITS.premade[inputId]} ${itemName} allowed per order`, 'warning');
        return;
    }

    cart = cart.filter(item => item.id !== inputId);
    
    cart.push({
        id: inputId,
        type: 'premade',
        name: itemName,
        price: price,
        quantity: quantity,
        total: price * quantity
    });

    updateCartDisplay();
    input.value = 0;
    
    const card = document.querySelector(`.cookie-card[onclick*="${inputId}"]`);
    if (card) {
        card.classList.remove('active');
        activeCard = null;
    }
    
    showToast(`Added ${quantity} ${itemName} to cart!`);
    
    if (event) event.stopPropagation();
}

function removeFromCartWithToast(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    updateCartDisplay();
    showToast(`Removed ${removedItem.name} from cart`, 'warning');
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartTotal = document.getElementById('cartTotal');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    
    const staticCart = document.getElementById('staticCart');
    const staticCartCount = document.getElementById('staticCartCount');
    const staticCartTotal = document.getElementById('staticCartTotal');

    if (!staticCart) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

    if (cartTotalAmount) cartTotalAmount.textContent = totalAmount;

    if (staticCartCount) staticCartCount.textContent = totalItems;
    if (staticCartTotal) staticCartTotal.textContent = totalAmount;

    if (totalItems > 0) {
        staticCart.classList.remove('hidden');
    } else {
        staticCart.classList.add('hidden');
    }

    if (cartItems && emptyCartMessage && cartTotal) {
        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            cartItems.innerHTML = '';
            cartTotal.classList.add('hidden');
        } else {
            emptyCartMessage.classList.add('hidden');
            cartTotal.classList.remove('hidden');

            cartItems.innerHTML = cart.map((item, index) => `
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
                        <button type="button" onclick="removeFromCartWithToast(${index})" class="text-red-600 hover:text-red-800 ml-4 bg-white p-2 rounded-full shadow transition-colors">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
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
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function openCartModal() {
    const modal = document.getElementById("cartModal");
    if (modal) {
        modal.classList.add("active");
        document.body.classList.add("no-scroll");
        updateCartDisplay();
    }
}

function closeCartModal() {
    const modal = document.getElementById("cartModal");
    if (modal) {
        modal.classList.remove("active");
        document.body.classList.remove("no-scroll");
    }
}

function generateWeekendDates(){
    const container = document.getElementById('quickDates');
    if (!container) return;
    
    const today = new Date();
    let count = 0, dayOffset = 1;
    container.innerHTML = '';
    
    while(count < 6){
        const future = new Date(); 
        future.setDate(today.getDate() + dayOffset);
        const day = future.getDay();
        if([5,6,0].includes(day)){
            const dateStr = future.toISOString().split('T')[0];
            const displayDate = `${String(future.getMonth()+1).padStart(2,'0')}/${String(future.getDate()).padStart(2,'0')}`;
            
            const btn = document.createElement('button'); 
            btn.type='button'; 
            btn.textContent = displayDate;
            btn.className = 'bg-brown-300 hover:bg-brown-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors';
            btn.onclick = ()=>{ 
                const input = document.getElementById('deliveryDateInput'); 
                if (input) {
                    input.value = dateStr; 
                    input.classList.remove('hidden'); 
                }
            };
            container.appendChild(btn); 
            count++; 
        }
        dayOffset++; 
    }
}

function setDateRestrictions(){
    const input = document.getElementById('deliveryDateInput');
    if (input) {
        const today = new Date(); 
        input.setAttribute('min', today.toISOString().split('T')[0]);
        input.addEventListener('input', function(){ 
            const chosenDate = new Date(this.value); 
            if(![5,6,0].includes(chosenDate.getDay())){ 
                alert('Only Friday, Saturday, or Sunday are allowed.'); 
                this.value = ''; 
            } 
        });
    }
}

function renderCookieList(){
    const container = document.getElementById('cookieList'); 
    if(!container) return; 
    
    container.innerHTML = '';
    cookieFlavors.forEach((flavor) => {
        const row = document.createElement('div'); 
        row.className = 'cookie-row'; 
        row.dataset.cookie = flavor.name;
        row.onclick = function() { toggleCookieSelection(this); };

        const label = document.createElement('div'); 
        label.className = 'flex-1 flex justify-between pr-4 cursor-pointer';
        label.innerHTML = `<span>${flavor.name}</span><span class="cookie-price">₱${flavor.price}</span>`;

        const qtyDiv = document.createElement('div'); 
        qtyDiv.className = 'quantity-control hidden items-center';
        qtyDiv.innerHTML = `<button type="button" class="qty-btn" onclick="event.stopPropagation(); updateCookieQty(this, -1)">-</button><input type="number" value="1" min="0" class="cookie-qty-input" onclick="event.stopPropagation()" /><button type="button" class="qty-btn" onclick="event.stopPropagation(); updateCookieQty(this, 1)">+</button>`;

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

function selectBoxSize(row){ 
    document.querySelectorAll('.boxsize-row').forEach(r=> r.classList.remove('active')); 
    row.classList.add('active'); 
    const radio = row.querySelector('input[type="radio"]');
    if (radio) selectedBoxSize = radio.value;
    
    const sizeInfo = document.getElementById('selectedSizeInfo');
    const sizeMessage = document.getElementById('sizeMessage');
    
    if (sizeInfo && sizeMessage) {
        sizeMessage.textContent = selectedBoxSize === 'others' 
            ? 'Please select at least 3 cookies for your custom box.'
            : `Please select exactly ${selectedBoxSize} cookies for your box.`;
        sizeInfo.classList.remove('hidden');
    }
}

function getSelectedCookies(){ 
    const selections = []; 
    document.querySelectorAll('#cookieList .cookie-row.active').forEach(r=>{
        const qtyDiv = r.querySelector('.quantity-control'); 
        if(!qtyDiv) return; 
        const q = parseInt(qtyDiv.querySelector('input').value,10)||0; 
        if(q>0) {
            const cookieName = r.dataset.cookie;
            const cookie = cookieFlavors.find(c => c.name === cookieName);
            selections.push({ 
                name: cookieName, 
                qty: q,
                price: cookie ? cookie.price : 0
            }); 
        }
    }); 
    return selections; 
}

function openCustomizeModal() {
    const modal = document.getElementById("customizeModal");
    if (modal) {
        modal.classList.add("active");
        document.body.classList.add("no-scroll");
        renderCookieList();
        selectedBoxSize = null;
        document.querySelectorAll('.boxsize-row').forEach(r => r.classList.remove('active'));
        
        const sizeInfo = document.getElementById('selectedSizeInfo');
        if (sizeInfo) sizeInfo.classList.add('hidden');
    }
}

function closeCustomizeModal() {
    const modal = document.getElementById("customizeModal");
    if (modal) {
        modal.classList.remove("active");
        document.body.classList.remove("no-scroll");
    }
}

// Enhanced social media validation
function validateSocialMedia() {
    const socialHandle = document.getElementById('socialHandleInput').value.trim();
    const facebookChecked = document.getElementById('platformFacebook').checked;
    const instagramChecked = document.getElementById('platformInstagram').checked;
    
    if (socialHandle && !facebookChecked && !instagramChecked) {
        showToast('Please select a social media platform since you provided a username', 'warning');
        scrollToSection(2);
        return false;
    }
    
    return true;
}

// Update the toggle function
function toggleSocialPlatformSelection(input) {
    const platformSelection = document.getElementById('socialPlatformSelection');
    if (!platformSelection) return;
    
    if (input.value.trim().length > 0) {
        platformSelection.classList.remove('hidden');
        // Add required attribute to radio buttons
        document.querySelectorAll('input[name="socialPlatform"]').forEach(radio => {
            radio.required = true;
        });
    } else {
        platformSelection.classList.add('hidden');
        clearSocialPlatformSelection();
        // Remove required attribute
        document.querySelectorAll('input[name="socialPlatform"]').forEach(radio => {
            radio.required = false;
        });
    }
}

function checkSocialHandleFocus(input) {
    const platformSelection = document.getElementById('socialPlatformSelection');
    if (!platformSelection) return;
    
    if (input.value.trim().length > 0) {
        platformSelection.classList.remove('hidden');
    }
}

function clearSocialPlatformSelection() {
    const options = document.querySelectorAll('.social-platform-option');
    options.forEach(opt => {
        opt.classList.remove('active');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
    });
}

function selectSocialPlatform(element) {
    const options = document.querySelectorAll('.social-platform-option');
    options.forEach(opt => {
        opt.classList.remove('active');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
    });
    
    element.classList.add('active');
    const radio = element.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
}

function addCustomBoxToCart(){
    if(!selectedBoxSize){ 
        showToast('Please select a box size first', 'warning'); 
        return; 
    }
    const items = getSelectedCookies(); 
    if(items.length === 0){ 
        showToast('Please select at least one cookie for your custom box', 'warning'); 
        return; 
    }
    
    const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
    
    if (selectedBoxSize === 'others') {
        if (totalQty < 3) {
            showToast(`Please select at least 3 cookies for your custom box. Currently selected: ${totalQty}`, 'warning');
            return;
        }
    } else {
        if (totalQty != selectedBoxSize) {
            showToast(`Please select exactly ${selectedBoxSize} cookies for your box. Currently selected: ${totalQty}`, 'warning');
            return;
        }
    }
    
    const overLimitCookies = items.filter(item => item.qty > ORDER_LIMITS.custom.perCookie);
    if (overLimitCookies.length > 0) {
        showToast(`Maximum ${ORDER_LIMITS.custom.perCookie} per cookie flavor allowed`, 'warning');
        return;
    }
    
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    cart.push({
        type: 'customBox',
        name: selectedBoxSize === 'others' ? `Custom Box (${totalQty} cookies)` : `Custom Box of ${selectedBoxSize}`,
        boxSize: selectedBoxSize === 'others' ? totalQty.toString() : selectedBoxSize,
        items: [...items],
        price: totalPrice,
        quantity: 1,
        total: totalPrice
    });

    updateCartDisplay();
    closeCustomizeModal();
    
    const customBoxCard = document.querySelector('.cookie-card:last-child');
    if (customBoxCard) customBoxCard.classList.remove('active');
    
    showToast(`Added custom cookie box to cart!`);
    
    selectedBoxSize = null;
    document.querySelectorAll('.boxsize-row').forEach(r => r.classList.remove('active'));
    document.querySelectorAll('.cookie-row').forEach(r => {
        r.classList.remove('active');
        const qtyInput = r.querySelector('.cookie-qty-input');
        if (qtyInput) qtyInput.value = 1;
    });
}

// Product Modal Functions
function openProductModal(productId) {
    const product = productData[productId];
    if (!product) return;
    
    currentProduct = product;
    currentQuantity = 1;
    
    // Update modal content
    document.getElementById('productModalTitle').textContent = product.name;
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productPrice').textContent = `₱${product.price}`;
    document.getElementById('productQuantity').textContent = currentQuantity;
    
    // Show image if available, otherwise show placeholder
    const productImage = document.getElementById('productImage');
    const placeholder = document.getElementById('productImagePlaceholder');
    
    if (product.image) {
        productImage.src = product.image;
        productImage.classList.remove('hidden');
        placeholder.classList.add('hidden');
    } else {
        productImage.classList.add('hidden');
        placeholder.classList.remove('hidden');
    }
    
    // Show modal
    const modal = document.getElementById("productModal");
    if (modal) {
        modal.classList.add("active");
        document.body.classList.add("no-scroll");
    }
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById("productModal");
    if (modal) {
        modal.classList.remove("active");
        document.body.classList.remove("no-scroll");
    }
    currentProduct = null;
    currentQuantity = 1;
}

// Update product quantity
function updateProductQuantity(delta) {
    const newQuantity = currentQuantity + delta;
    
    // Check order limits
    if (newQuantity < 1) return;
    if (newQuantity > ORDER_LIMITS.premade[currentProduct.id]) {
        showToast(`Maximum ${ORDER_LIMITS.premade[currentProduct.id]} sets allowed per order`, 'warning');
        return;
    }
    
    currentQuantity = newQuantity;
    document.getElementById('productQuantity').textContent = currentQuantity;
}

// Add product to cart from modal
function addProductToCart() {
    if (!currentProduct) {
        console.error('No product selected');
        showToast('Please select a product first', 'error');
        return;
    }
    
    try {
        // Remove existing item with same ID
        cart = cart.filter(item => item.id !== currentProduct.id);
        
        // Add new item
        cart.push({
            id: currentProduct.id,
            type: 'premade',
            name: currentProduct.name,
            price: currentProduct.price,
            quantity: currentQuantity,
            total: currentProduct.price * currentQuantity
        });
        
        // Update cart display
        updateCartDisplay();
        
        // Show success message
        showToast(`Added ${currentQuantity} ${currentProduct.name} to cart! 🍪`);
        
        // Close modal
        closeProductModal();
        
        // Close any active cookie card
        if (activeCard) {
            activeCard.classList.remove('active');
            activeCard = null;
        }
        
    } catch (error) {
        console.error('Error adding product to cart:', error);
        showToast('Error adding product to cart. Please try again.', 'error');
    }
}

// Comprehensive form validation
function validateForm() {
    // Cart validation
    if (cart.length === 0) {
        showToast('Please add at least one item to your cart before submitting.', 'warning');
        return false;
    }
    
    // Payment method validation
    const paymentSelect = document.querySelector('select[name="payment"]');
    if (paymentSelect && !paymentSelect.value) {
        showToast('Please select a payment method.', 'warning');
        scrollToSection(6);
        return false;
    }
    
    // Email validation
    const email = document.querySelector('input[name="email"]').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address.', 'warning');
        scrollToSection(4);
        return false;
    }
    
    // Phone number validation (Philippines format)
    const contactNumber = document.querySelector('input[name="contactNumber"]').value.trim();
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (!phoneRegex.test(contactNumber)) {
        showToast('Please enter a valid Philippine phone number (e.g., 09123456789).', 'warning');
        scrollToSection(4);
        return false;
    }
    
    // Name validation
    const name = document.querySelector('input[name="name"]').value.trim();
    if (name.length < 2) {
        showToast('Please enter your full name.', 'warning');
        scrollToSection(2);
        return false;
    }
    
    // Delivery method validation
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked');
    if (!deliveryMethod) {
        showToast('Please select a delivery method.', 'warning');
        scrollToSection(3);
        return false;
    }
    
    // Delivery date validation
    const deliveryDate = document.querySelector('input[name="deliveryDate"]').value;
    if (!deliveryDate) {
        showToast('Please select a delivery date.', 'warning');
        scrollToSection(3);
        return false;
    }
    
    // Social media validation
    if (!validateSocialMedia()) {
        return false;
    }
    
    return true;
}

function buildOrderSummary(){
    const form = document.getElementById('orderForm'); 
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
    const deliveryMethod = form.deliveryMethod?.value || 'Not selected';
    const contact = form.contactNumber.value.trim(); 
    const notes = form.notes.value.trim();
    const payment = form.payment.value;

    let totalAmount = 0;
    let html = `<strong>Name:</strong> ${escapeHtml(name)}<br>
                <strong>Social:</strong> ${escapeHtml(socialDisplay)}<br>
                <strong>Delivery Date:</strong> ${escapeHtml(deliveryDate)}<br>
                <strong>Delivery Method:</strong> ${escapeHtml(deliveryMethod === 'pickup' ? 'Pick Up' : 'Delivery')}<br>
                <strong>Contact Number:</strong> ${escapeHtml(contact)}<br>
                <strong>Payment Method:</strong> ${escapeHtml(payment)}<br><hr>`;
    
    html += `<strong>Order Items:</strong><br>`;
    
    if(cart.length > 0){
        cart.forEach((item) => {
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
    
    const summaryContent = document.getElementById('summaryContent');
    if (summaryContent) summaryContent.innerHTML = html;
}

function clearCartAfterSubmission() {
    cart = [];
    updateCartDisplay();
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
        return null;
    }

    try {
        const name = form.name.value.trim();
        
        if (!name) {
            return null;
        }

        const orderId = generateOrderId(name);
        const email = form.email.value.trim();
        const socialPlatform = form.socialPlatform?.value || '';
        const socialHandle = form.socialHandle.value.trim();
        
        let social = 'Not provided';
        if (socialHandle && socialPlatform) {
            social = `${socialHandle} - ${socialPlatform}`;
        } else if (socialHandle) {
            social = `${socialHandle} (platform not selected)`;
        } else if (socialPlatform) {
            social = `${socialPlatform} (no username)`;
        }
        
        const contactNumber = form.contactNumber.value.trim();
        const deliveryDate = form.deliveryDate.value || 'Not selected';
        const deliveryMethod = form.deliveryMethod?.value || 'Not selected';
        const payment = form.payment.value;
        const notes = form.notes.value.trim();
        
        const orderDetails = cart.map(item => {
            if (item.type === 'customBox') {
                return `${item.name}: ${item.items.map(it => `${it.name} (x${it.qty})`).join(', ')} = ₱${item.total}`;
            } else {
                return `${item.name} x ${item.quantity} = ₱${item.total}`;
            }
        }).join('\n');
        
        const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        const cookieQuantities = calculateCookieQuantities();
        
        const businessOrderSummary = `
🚨 NEW COOKIE ORDER - ACTION REQUIRED 🚨
=========================================
ORDER ID: ${orderId}
STATUS: AWAITING CONFIRMATION

CUSTOMER INFORMATION:
• Name: ${name}
• Email: ${email}
• Social: ${social}
• Contact: ${contactNumber}

DELIVERY INFORMATION:
• Date: ${deliveryDate}
• Method: ${deliveryMethod === 'pickup' ? 'Pick Up' : 'Delivery'}
• Payment: ${payment}

ORDER DETAILS:
${orderDetails}

TOTAL AMOUNT: ₱${totalAmount}

CUSTOMER NOTES:
${notes || 'No special notes'}

🎯 ACTION REQUIRED:
1. Contact customer within 24 hours
2. Confirm order details via Email/IG/FB
3. Arrange payment & delivery
4. Update order status

CONTACT OPTIONS:
📧 Email: ${email}
📱 Contact: ${contactNumber}
📱 Social: ${social}

Order received: ${new Date().toLocaleString()}
        `.trim();
        
        document.getElementById('customerEmailField').value = email;
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
        
        setupGoogleFormsData(orderId, name, email, socialHandle, contactNumber, deliveryDate, deliveryMethod, payment, notes, orderDetails, cookieQuantities, totalAmount);
        
        const orderData = {
            orderId: orderId,
            customerName: name,
            totalAmount: totalAmount,
            itemCount: itemCount,
            deliveryDate: deliveryDate,
            timestamp: new Date().toISOString(),
            email: email,
            contactNumber: contactNumber,
            social: social,
            deliveryMethod: deliveryMethod,
            payment: payment,
            notes: notes
        };
        
        return orderData;
        
    } catch (error) {
        return null;
    }
}

function calculateCookieQuantities() {
    const quantities = {};
    
    cart.forEach(item => {
        if (item.type === 'premade') {
            if (item.name === 'OG Set') {
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

function setupGoogleFormsData(orderId, name, email, social, contactNumber, deliveryDate, deliveryMethod, payment, notes, orderDetails, cookieQuantities, totalAmount) {
    let googleForm = document.getElementById('googleForm');
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
        'entry.945933971': email,
        'entry.1424096514': social,
        'entry.2010027852': contactNumber,
        'entry.376530706': deliveryDate,
        'entry.57353341': deliveryMethod,
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

async function handleFormSubmit(e){ 
    e.preventDefault(); 
    
    console.log('Form submission started...');
    
    if (!validateForm()) {
        console.log('Form validation failed');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        console.log('Preparing form data...');
        
        // Prepare and store order data FIRST
        const orderData = prepareFormSubmitData();
        
        if (!orderData || !orderData.orderId) {
            throw new Error('Failed to prepare order data');
        }
        
        console.log('Order prepared with ID:', orderData.orderId);
        
        // Store order data in both storage methods for redundancy
        try {
            sessionStorage.setItem('lastOrder', JSON.stringify(orderData));
            localStorage.setItem('lastOrder', JSON.stringify(orderData));
            console.log('Order data stored successfully');
        } catch (storageError) {
            console.error('Storage error:', storageError);
            // Continue even if storage fails
        }
        
        // Show immediate success feedback
        showToast('Processing your order...', 'success');
        
        console.log('Submitting to services...');
        
        // Submit to both services with timeout protection
        const submissionTimeout = 10000; // 10 seconds
        
        const [googleSuccess, emailSuccess] = await Promise.allSettled([
            Promise.race([
                submitToGoogleForms(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Google Forms timeout')), submissionTimeout)
                )
            ]),
            Promise.race([
                submitToFormSubmit(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('FormSubmit timeout')), submissionTimeout)
                )
            ])
        ]);
        
        console.log('Submission results:', {
            google: googleSuccess,
            email: emailSuccess
        });
        
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
        
        // Clear cart but NOT order data
        clearCartAfterSubmission();
        
        console.log('Final storage check before redirect:', {
            sessionStorage: sessionStorage.getItem('lastOrder'),
            localStorage: localStorage.getItem('lastOrder')
        });
        
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        
        // Redirect to thank you page
        setTimeout(() => {
            console.log('Redirecting to thank you page...');
            window.location.href = '/thank-you';
        }, 2000);

    } catch (error) {
        console.error('Submission error:', error);
        
        // Hide loading overlay on error
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        
        // Even if there's an error, try to preserve order data and redirect
        try {
            const currentOrderData = prepareFormSubmitData();
            if (currentOrderData) {
                sessionStorage.setItem('lastOrder', JSON.stringify(currentOrderData));
                localStorage.setItem('lastOrder', JSON.stringify(currentOrderData));
            }
        } catch (backupError) {
            console.error('Backup storage failed:', backupError);
        }
        
        showToast('Order received! Please contact us if you don\'t hear back.', 'warning');
        
        // Clear cart and redirect
        clearCartAfterSubmission();
        
        setTimeout(() => {
            window.location.href = '/thank-you';
        }, 2000);
        
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function submitToGoogleForms() {
    const googleForm = document.getElementById('googleForm');
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
    const form = document.getElementById('orderForm');
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

function escapeHtml(str){ 
    if(!str) return '—'; 
    return String(str).replace(/[&<>"']/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); 
}

// Thank you page functions
function displayOrderDetails() {
    const orderData = getOrderData();
    
    if (orderData && orderData.orderId) {
        document.getElementById('orderIdDisplay').textContent = orderData.orderId;
        document.getElementById('customerName').textContent = orderData.customerName || '-';
        document.getElementById('orderTotal').textContent = orderData.totalAmount || '0';
        document.getElementById('itemCount').textContent = (orderData.itemCount || 0) + ' item(s)';
        document.getElementById('deliveryDate').textContent = orderData.deliveryDate || '-';
        
        document.title = `Order #${orderData.orderId} - Why Dough`;
    } else {
        document.getElementById('orderIdDisplay').textContent = 'Not Found';
        document.getElementById('orderDetails').innerHTML = 
            '<li class="text-brown-600">Order details not available. Please check your email for confirmation.</li>';
        
        showToast('Order details not found. Please check your email for confirmation.', 'warning');
    }
}

function getOrderData() {
    let orderData = sessionStorage.getItem('lastOrder');
    
    if (!orderData) {
        orderData = localStorage.getItem('lastOrder');
    }
    
    if (!orderData) {
        return null;
    }
    
    try {
        return JSON.parse(orderData);
    } catch (e) {
        return null;
    }
}

function clearStorageAndGoHome() {
    sessionStorage.removeItem('lastOrder');
    localStorage.removeItem('lastOrder');
    localStorage.removeItem('cart');
    sessionStorage.removeItem('cart');
    
    sessionStorage.setItem('comingFromThankYou', 'true');
    
    window.location.href = '/';
}

function copyOrderId() {
    const orderId = document.getElementById('orderIdDisplay').textContent;
    const copyButton = document.getElementById('copyButton');
    const copySuccess = document.getElementById('copySuccess');
    
    if (orderId === 'Loading...' || orderId === 'Not Found') {
        showToast('Order ID not available yet', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(orderId).then(function() {
        copySuccess.classList.remove('hidden');
        copyButton.innerHTML = '✅ Copied!';
        copyButton.classList.remove('bg-accent', 'hover:bg-brown-700');
        copyButton.classList.add('bg-green-600', 'hover:bg-green-700');
        
        setTimeout(() => {
            copySuccess.classList.add('hidden');
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
            const copySuccess = document.getElementById('copySuccess');
            const copyButton = document.getElementById('copyButton');
            
            copySuccess.classList.remove('hidden');
            copySuccess.textContent = '✅ Order ID copied to clipboard!';
            copyButton.innerHTML = '✅ Copied!';
            copyButton.classList.remove('bg-accent', 'hover:bg-brown-700');
            copyButton.classList.add('bg-green-600', 'hover:bg-green-700');
            
            setTimeout(() => {
                copySuccess.classList.add('hidden');
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

function takeScreenshot() {
    const orderId = document.getElementById('orderIdDisplay').textContent;
    if (orderId === 'Loading...' || orderId === 'Not Found') {
        showToast('Please wait for order details to load', 'warning');
        return;
    }
    alert(`Take a screenshot of this page to save your Order ID: ${orderId}\n\nYou can also check your email for a written confirmation.`);
}

function clearPreviousCart() {
    localStorage.removeItem('cart');
    sessionStorage.removeItem('cart');
}

// Event Listeners
document.addEventListener('click', function(event) {
    const clickedCard = event.target.closest('.cookie-card');
    
    if (activeCard && !clickedCard) {
        activeCard.classList.remove('active');
        activeCard = null;
    } else if (clickedCard && activeCard && clickedCard !== activeCard) {
        activeCard.classList.remove('active');
        activeCard = clickedCard;
        clickedCard.classList.add('active');
    }
    
    const socialOption = event.target.closest('.social-platform-option');
    if (socialOption) {
        selectSocialPlatform(socialOption);
    }
});

// Initialize based on current page
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on homepage by looking for the carousel
  if (document.querySelector('#flavorsCarouselTrack')) {
    console.log('Initializing homepage...');
    initializeHomepage();
  } 
  // Check if we're on thank you page
  else if (document.getElementById('orderIdDisplay')) {
    displayOrderDetails();
    clearPreviousCart();
    
    setTimeout(() => {
      const orderId = document.getElementById('orderIdDisplay').textContent;
      if (orderId === 'Loading...' || orderId === 'Not Found') {
        displayOrderDetails();
      }
    }, 2000);
  }
  // Otherwise, we're on the order page
  else {
    generateWeekendDates(); 
    setDateRestrictions(); 
    renderCookieList();
    
    const orderForm = document.getElementById('orderForm');
    if (orderForm) orderForm.addEventListener('submit', handleFormSubmit);
    
    updateCartDisplay();
  }
});