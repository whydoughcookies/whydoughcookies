function updateCartDisplay() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = state.cart.reduce((sum, item) => sum + item.total, 0);

  // Update nav cart
  const navCartCount = DOM.get('#navCartCount');
  if (navCartCount) {
    navCartCount.textContent = totalItems;
    navCartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  // 🔹 Toggle "Proceed to checkout" button in section 5
  const proceedWrapper = document.getElementById('proceedCheckoutWrapper');
  if (proceedWrapper) {
    if (totalItems > 0) {
      proceedWrapper.classList.remove('hidden');
    } else {
      proceedWrapper.classList.add('hidden');
    }
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
    
    let customBoxCounter = 0;

    cartItems.innerHTML = state.cart.map((item, index) => {

      let title = "";
      let description = "";
    
      // ✅ CUSTOM COOKIE SET
      if (item.type === 'customBox') {
        title = `Custom Cookie Set`;
        description = `
          <p class="text-sm text-brown-700">Pack of ${item.boxSize}</p>
          <p class="text-sm text-brown-600">
            ${item.items.map(it => `${it.name} (x${it.qty})`).join(', ')}
          </p>
        `;
      }
    
      // ✅ DUBAI COOKIE (NEW)
      else if (item.type === 'dubaiBox') {
        title = `Dubai Chewy Cookie`;
    
        const packLabel = item.boxSize === '4'
          ? 'Box of 4'
          : 'Individual Pack';
    
        description = `
          <p class="text-sm text-brown-700">${packLabel}</p>
          <p class="text-sm text-brown-600">
            ${item.items.map(it => `${it.name} (x${it.qty})`).join(', ')}
          </p>
        `;
      }
    
      // ✅ PREMADE
      else {
        title = item.name;
        description = `
          <p class="text-sm text-brown-700">Quantity: ${item.quantity}</p>
        `;
      }
    
      return `
        <div class="cart-modal-item p-4 rounded-lg mb-3">
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <h4 class="font-bold text-brown text-2xl">${title}</h4>
              ${description}
              <p class="font-bold text-brown-800 text-xl mt-2">₱${item.total}</p>
            </div>
    
            <button type="button" onclick="removeFromCart(${index})"
              class="text-red-600 hover:text-red-800 ml-4 bg-white p-2 rounded-full shadow">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (cartTotalAmount) cartTotalAmount.textContent = totalAmount;
  }
}

function removeFromCart(index) {
  const removedItem = state.cart[index];
  state.cart.splice(index, 1);

  // ✅ NEW: clean dependent add-ons
  removeInvalidCustomAddOns();

  updateCartDisplay();

  if (removedItem?.type === 'premade') {
    showToast(
      'A main box was removed. Add-on cookies below minimum were also removed.',
      'warning'
    );
  } else {
    showToast(`Removed ${removedItem.name} from cart`, 'warning');
  }
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
  // Auto-advance when both date + time slot are set
  if (isDeliverySectionComplete()) {
    autoAdvanceFromSection(3);
  }
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

  // Show next button
  const nextWrapper = document.getElementById('deliveryNextWrapper');
  if (nextWrapper) nextWrapper.classList.remove('hidden');
}

// Fixed toggleCustomBoxCard function
