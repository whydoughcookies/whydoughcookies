function openLatestProductModal() {

  // ✅ prevent reopening in same session
  if (sessionStorage.getItem(NEW_PRODUCT_MODAL_KEY)) {
    return;
  }

  const modal = document.getElementById("latestProductModal");

  if (modal) {
    modal.classList.add("active");
    document.body.classList.add("no-scroll");
  }
}

function closeLatestProductModal() {

  // ✅ mark as seen
  sessionStorage.setItem(NEW_PRODUCT_MODAL_KEY, 'true');

  const modal = document.getElementById("latestProductModal");

  if (modal) {
    modal.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }
}

function handleLatestProductCTA() {

  // ✅ prevent future popup this session
  sessionStorage.setItem(NEW_PRODUCT_MODAL_KEY, 'true');

  closeLatestProductModal();
}

function openDubaiModal() {
  const modal = document.getElementById("dubaiModal");
  modal.classList.add("active");
  document.body.classList.add("no-scroll");

  const flavorList = document.getElementById('dubaiFlavorList');
  setupScrollIndicatorForModal(flavorList);

  renderDubaiFlavors();
}

function closeDubaiModal() {
  const modal = document.getElementById("dubaiModal");
  modal.classList.remove("active");
  document.body.classList.remove("no-scroll");

  resetDubaiModal();
}

function selectDubaiBox(row, size) {
  document.querySelectorAll('#dubaiModal .boxsize-row')
    .forEach(r => r.classList.remove('active'));

  row.classList.add('active');

  // ✅ FORCE CONSISTENT VALUE
  dubaiState.boxSize = size.toLowerCase();

  const info = document.getElementById('dubaiSizeInfo');

  if (dubaiState.boxSize === '4') {
    info.textContent = "Select exactly 4 cookies.";
  } else {
    info.textContent = "Minimum of 2 cookies required.";
  }

  info.classList.remove('hidden');
}

function toggleDubaiSelection(row) {
  const isActive = row.classList.contains('active');
  const qtyControl = row.querySelector('.quantity-control');
  const input = row.querySelector('input');

  if (isActive) {
    row.classList.remove('active');
    qtyControl.classList.add('hidden');

    // ✅ RESET TO ZERO (not 1)
    input.value = 0;

  } else {
    row.classList.add('active');
    qtyControl.classList.remove('hidden');

    // ✅ START AT 1 when selected
    input.value = 1;
  }
}

function renderDubaiFlavors() {
  const container = document.getElementById('dubaiFlavorList');
  if (!container) return;

  container.innerHTML = '';

  DUBAI_FLAVORS.forEach((flavor) => {
    const row = document.createElement('div');
    row.className = 'cookie-row';
    row.dataset.flavor = flavor.name;

    row.onclick = function () {
      toggleDubaiSelection(this);
    };

    row.innerHTML = `
      <div class="flex-1 flex justify-between pr-4 cursor-pointer items-center">

      <div class="flex items-center gap-3">

        <img 
          class="custom-cookie-image"
          src="images/${flavor.name}.png"
          alt="${flavor.name}"
        >

        <span class="cookie-label">
          ${flavor.name}
        </span>

      </div>

      <span class="cookie-price">
        ₱150
      </span>

    </div>

      <!-- 👇 SAME STRUCTURE AS CUSTOM -->
      <div class="quantity-control hidden items-center">
        <button type="button" class="qty-btn" onclick="event.stopPropagation(); updateDubaiQty(this, -1)">-</button>
        <input type="number" value="1" min="0" class="cookie-qty-input" onclick="event.stopPropagation()">
        <button type="button" class="qty-btn" onclick="event.stopPropagation(); updateDubaiQty(this, 1)">+</button>
      </div>
    `;

    container.appendChild(row);
  });
}

function updateDubaiQty(btn, delta) {
  const input = btn.parentElement.querySelector('input');
  let val = parseInt(input.value) || 0;

  val += delta;

  if (val < 0) val = 0;
  if (val > 50) val = 50; // optional limit

  input.value = val;

  // auto deactivate if 0
  if (val === 0) {
    const row = btn.closest('.cookie-row');
    row.classList.remove('active');
    row.querySelector('.quantity-control').classList.add('hidden');
  }
}

function getDubaiSelections() {
  const rows = document.querySelectorAll('#dubaiFlavorList .cookie-row');

  let selections = [];

  rows.forEach(row => {
    // ✅ ONLY count active rows
    if (!row.classList.contains('active')) return;

    const qty = parseInt(row.querySelector('input').value) || 0;

    if (qty > 0) {
      const name = row.dataset.flavor;
      const flavor = DUBAI_FLAVORS.find(f => f.name === name);

      if (!flavor) return;

      selections.push({
        name,
        qty,
        price: flavor.price
      });
    }
  });

  return selections;
}

function validateDubai() {
  if (!dubaiState.boxSize) {
    showToast("Select a box size", "error");
    return false;
  }

  const selections = getDubaiSelections();
  const totalQty = selections.reduce((sum, s) => sum + s.qty, 0);

  // 🔍 DEBUG (remove later)

  // ✅ BOX OF 4
  if (dubaiState.boxSize === '4' && totalQty !== 4) {
    showToast("You need exactly 4 cookies for this box", "error");
    return false;
  }

  // ✅ INDIVIDUAL (STRICT)
  if (
    dubaiState.boxSize === 'individual' &&
    (totalQty < 2 || selections.length === 0)
  ) {
    showToast("Minimum of 2 cookies required", "error");
    return false;
  }

  return true;
}

function addDubaiToCart() {
  if (!validateDubai()) return;

  const selections = getDubaiSelections();
  const totalQty = selections.reduce((sum, s) => sum + s.qty, 0);

  if (dubaiState.boxSize === 'individual' && totalQty === 1) {
    showToast("Add 1 more cookie to proceed", "warning");
    return;
  }
  let total = 0;

  if (dubaiState.boxSize === '4') {
    total = 550; // fixed price
  } else {
    total = totalQty * 150;
  }

  state.cart.push({
    id: "dubaiBox_" + Date.now(),
    type: "customBox", // 👈 CHANGE THIS
    name: "Dubai Chewy Cookie",
    boxSize: dubaiState.boxSize === '4' ? 4 : totalQty,
    items: selections,
    total
  });

  updateCartDisplay();
  closeDubaiModal();

  showToast("Dubai cookies added to cart 🍪");
}

function resetDubaiModal() {
  dubaiState.boxSize = null;

  document.querySelectorAll('#dubaiModal input')
    .forEach(i => i.value = 0);

  document.querySelectorAll('#dubaiModal .boxsize-row')
    .forEach(r => r.classList.remove('active'));
}
