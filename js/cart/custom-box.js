function toggleCustomBoxCard(card) {
  resetCustomizeModal();
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

function updateOthersBoxLabel() {
  const othersRow = document.querySelector(
    '#customizeModal input[name="boxSize"][value="others"]'
  )?.closest('.boxsize-row');

  if (!othersRow) return;

  const labelSpan = othersRow.querySelector('span');
  if (!labelSpan) return;

  const hasPremade = hasPremadeSetInCart();

  labelSpan.textContent = hasPremade
    ? 'Others (Add-on: minimum 1 cookie)'
    : 'Others (Minimum 3 cookies)';
}

function openCustomizeModal() {
  const modal = document.getElementById("customizeModal");
  if (!modal) return;

  modal.classList.add("active");
  document.body.classList.add("no-scroll");

  renderCookieList();
  state.selectedBoxSize = null;

  updateOthersBoxLabel();

  // 👇 ADD THIS
  const cookieList = document.getElementById('selectedSizeInfo');
  setupScrollIndicatorForModal(cookieList);
}

// Fixed closeCustomizeModal function
function closeCustomizeModal() {
  const modal = document.getElementById("customizeModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }
}

function resetCustomizeModal() {
  // Reset box size radios
  document
    .querySelectorAll('#customizeModal input[name="boxSize"]')
    .forEach(input => input.checked = false);

  document
    .querySelectorAll('#customizeModal .boxsize-row')
    .forEach(row => row.classList.remove('active'));

  // Reset cookies
  document
    .querySelectorAll('#customizeModal .cookie-row')
    .forEach(row => row.classList.remove('active'));

  document
    .querySelectorAll('#customizeModal .cookie-qty-input')
    .forEach(input => input.value = 0);

  // Hide size info message
  const info = document.getElementById('selectedSizeInfo');
  if (info) info.classList.add('hidden');
}


function selectBoxSize(row) {
  document.querySelectorAll('.boxsize-row').forEach(r => r.classList.remove('active'));
  row.classList.add('active');
  const radio = row.querySelector('input[type="radio"]');
  if (radio) state.selectedBoxSize = radio.value;
  
  const sizeInfo = document.getElementById('selectedSizeInfo');
  const sizeMessage = document.getElementById('sizeMessage');
  
  if (sizeInfo && sizeMessage) {
    if (state.selectedBoxSize === 'others') {
      const hasPremade = hasPremadeSetInCart();
      sizeMessage.textContent = hasPremade
        ? 'You may add at least 1 cookie since you already have a box in your cart.'
        : 'Please select at least 3 cookies for your custom pack.';
    } else {
      sizeMessage.textContent = `Please select exactly ${state.selectedBoxSize} cookies for your pack.`;
    }
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
    label.innerHTML = `<img class="custom-cookie-image" src="icons/${flavor.name}.svg">
                      <span class="cookie-label">${flavor.name} 
                        <br> 
                        <span>(${flavor.label})</span>
                        </span>
                        <span class="cookie-price">₱${flavor.price}</span>`;

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

function hasPremadeSetInCart() {
  return state.cart.some(item => item.type === 'premade');
}

function removeInvalidCustomAddOns() {
  const hasPremade = hasPremadeSetInCart();

  // If premade still exists, nothing to clean
  if (hasPremade) return;

  // Remove custom "Others" packs with < 3 cookies
  state.cart = state.cart.filter(item => {
    if (item.type !== 'customBox') return true;

    // Only apply to "Others" packs
    const isOthersPack =
      item.name?.toLowerCase().includes('custom pack') &&
      item.boxSize === item.items?.reduce((sum, i) => sum + i.qty, 0).toString();

    if (!isOthersPack) return true;

    const totalQty = item.items.reduce((sum, i) => sum + i.qty, 0);

    return totalQty >= 3;
  });
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
    const hasPremade = hasPremadeSetInCart();
    const minRequired = hasPremade ? 1 : 3;
  
    if (totalQty < minRequired) {
      showToast(
        hasPremade
          ? 'You can add at least 1 cookie as an add-on'
          : 'Please select at least 3 cookies for your custom pack',
        'warning'
      );
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
