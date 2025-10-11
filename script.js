// ----- State -----
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

// ----- Navigation -----
function scrollToSection(id){ 
    const element = document.getElementById('section-'+id);
    if (element) element.scrollIntoView({behavior:'smooth'});
}

// ----- Form Sections -----
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

// ----- Cookie Cards -----
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
        input.value = Math.max(0, value + delta);
    }
    event.stopPropagation();
}

function addToCart(inputId, itemName, price) {
    const input = document.getElementById(inputId);
    const quantity = parseInt(input.value) || 0;
    
    if (quantity <= 0) {
        alert('Please select at least 1 quantity');
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
    
    if (event) event.stopPropagation();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// ----- Cart Management -----
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartTotalPreview = document.getElementById('cartTotalPreview');
    const cartItems = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartTotal = document.getElementById('cartTotal');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    const cartPreview = document.getElementById('cartPreview');

    if (!cartCount || !cartTotalPreview || !cartItems || !emptyCartMessage || !cartTotal || !cartTotalAmount || !cartPreview) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
    
    cartCount.textContent = totalItems;
    cartTotalPreview.textContent = totalAmount;
    cartTotalAmount.textContent = totalAmount;

    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        cartItems.innerHTML = '';
        cartTotal.classList.add('hidden');
        cartPreview.classList.add('hidden');
    } else {
        emptyCartMessage.classList.add('hidden');
        cartTotal.classList.remove('hidden');
        cartPreview.classList.remove('hidden');

        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-modal-item p-4 rounded-lg mb-3">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-bold text-amber-900 text-lg">${item.name}</h4>
                        ${item.type === 'customBox' ? 
                            `<p class="text-sm text-amber-700">Box of ${item.boxSize}</p>
                             <p class="text-sm text-amber-600">${item.items.map(it => `${it.name} (x${it.qty})`).join(', ')}</p>` : 
                            `<p class="text-sm text-amber-700">Quantity: ${item.quantity}</p>`
                        }
                        <p class="font-bold text-amber-800 text-xl mt-2">₱${item.total}</p>
                    </div>
                    <button type="button" onclick="removeFromCart(${index})" class="text-red-600 hover:text-red-800 ml-4 bg-white p-2 rounded-full shadow">🗑️</button>
                </div>
            </div>
        `).join('');
    }
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

// ----- Date Handling -----
function generateWeekendDates(){
    const container = document.getElementById('quickDates');
    if (!container) return;
    
    const today = new Date();
    let count = 0, dayOffset = 0; 
    container.innerHTML = '';
    
    while(count < 6){
        const future = new Date(); 
        future.setDate(today.getDate() + dayOffset);
        const day = future.getDay();
        if([5,6,0].includes(day)){
            const yyyy = future.getFullYear(); 
            const mm = String(future.getMonth()+1).padStart(2,'0'); 
            const dd = String(future.getDate()).padStart(2,'0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            const btn = document.createElement('button'); 
            btn.type='button'; 
            btn.textContent = `${mm}/${dd}`;
            btn.className = 'bg-yellow-300 px-3 py-2 rounded text-sm';
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

// ----- Custom Box Modal -----
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
    v = Math.max(0, v + delta);
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

function addCustomBoxToCart(){
    if(!selectedBoxSize){ alert('Please select a box size first'); return; }
    const items = getSelectedCookies(); 
    if(items.length === 0){ alert('Please select at least one cookie for your custom box'); return; }
    
    const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
    
    if (selectedBoxSize === 'others') {
        if (totalQty < 3) {
            alert(`Please select at least 3 cookies for your custom box. Currently selected: ${totalQty}`);
            return;
        }
    } else {
        if (totalQty != selectedBoxSize) {
            alert(`Please select exactly ${selectedBoxSize} cookies for your box. Currently selected: ${totalQty}`);
            return;
        }
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
    
    selectedBoxSize = null;
    document.querySelectorAll('.boxsize-row').forEach(r => r.classList.remove('active'));
    document.querySelectorAll('.cookie-row').forEach(r => {
        r.classList.remove('active');
        const qtyInput = r.querySelector('.cookie-qty-input');
        if (qtyInput) qtyInput.value = 1;
    });
}

// ----- Order Summary & Submission -----
function buildOrderSummary(){
    const form = document.getElementById('orderForm'); 
    if (!form) return;
    
    const name = form.name.value.trim(); 
    const social = form.socialHandle.value.trim(); 
    const deliveryDate = form.deliveryDate.value || '—';
    const deliveryMethod = form.deliveryMethod?.value || 'Not selected';
    const contact = form.contactNumber.value.trim(); 
    const notes = form.notes.value.trim();
    const payment = form.payment.value;

    let totalAmount = 0;
    let html = `<strong>Name:</strong> ${escapeHtml(name)}<br>
                <strong>Social:</strong> ${escapeHtml(social)}<br>
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

async function handleFormSubmit(e){ 
    e.preventDefault(); 
    
    if (cart.length === 0) {
        alert('Please add at least one item to your cart before submitting.');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.classList.add('loading');
    
    try {
        const formData = new FormData(document.getElementById('orderForm'));
        await submitToGoogleForms(formData);
        
        alert('Order submitted successfully! Thank you for your order!');
        
        document.getElementById('orderForm').reset();
        cart = [];
        updateCartDisplay();
        document.querySelectorAll('.cookie-card').forEach(card => card.classList.remove('active'));
        scrollToSection(1);
        
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting your order. Please try again or contact us directly.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
    }
}

async function submitToGoogleForms(formData) {
    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfpWgm_iikunZ44T7HxQfnbmA1KY-bB4l57fnAN0vAaFo0ZsA/formResponse';
    
    // Calculate individual cookie quantities
    const cookieQuantities = {};
    cart.forEach(item => {
        if (item.type === 'premade') {
            if (item.name === 'OG Set') {
                cookieQuantities['The Usual'] = (cookieQuantities['The Usual'] || 0) + item.quantity;
                cookieQuantities['The Red One'] = (cookieQuantities['The Red One'] || 0) + item.quantity;
                cookieQuantities['The Burnt One'] = (cookieQuantities['The Burnt One'] || 0) + item.quantity;
            } else if (item.name === 'The Classics') {
                cookieQuantities['The Usual'] = (cookieQuantities['The Usual'] || 0) + item.quantity;
                cookieQuantities['The Red One'] = (cookieQuantities['The Red One'] || 0) + item.quantity;
                cookieQuantities['The Burnt One'] = (cookieQuantities['The Burnt One'] || 0) + item.quantity;
                cookieQuantities['The Milky One'] = (cookieQuantities['The Milky One'] || 0) + item.quantity;
                cookieQuantities['Pistash'] = (cookieQuantities['Pistash'] || 0) + item.quantity;
                cookieQuantities['The Bizz'] = (cookieQuantities['The Bizz'] || 0) + item.quantity;
            } else if (item.name === 'Samplers') {
                cookieQuantities['Sampler Pack'] = (cookieQuantities['Sampler Pack'] || 0) + item.quantity;
            }
        } else if (item.type === 'customBox') {
            item.items.forEach(cookieItem => {
                cookieQuantities[cookieItem.name] = (cookieQuantities[cookieItem.name] || 0) + cookieItem.qty;
            });
        }
    });

    const orderDetails = cart.map(item => {
        if (item.type === 'customBox') {
            return `${item.name}: ${item.items.map(it => `${it.name}(x${it.qty})`).join(', ')}`;
        } else {
            return `${item.name} x ${item.quantity}`;
        }
    }).join('; ');

    const cookieQuantitiesText = Object.entries(cookieQuantities)
        .map(([cookie, qty]) => `${cookie}: ${qty}`)
        .join('; ');

    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

    const params = new URLSearchParams({
        'entry.1608348325': formData.get('name') || '',           // Name
        'entry.756795480': formData.get('socialHandle') || '',   // Social Handle
        'entry.1868351860': formData.get('deliveryDate') || '',   // Delivery Date
        'entry.1213945014': formData.get('deliveryMethod') || '', // Delivery Method
        'entry.216379063': formData.get('contactNumber') || '',  // Contact Number
        'entry.1369240809': formData.get('payment') || '',        // Payment Method
        'entry.564442403': formData.get('notes') || '',          // Notes
        'entry.1344414632': orderDetails,                         // Order Details
        'entry.950008786': cookieQuantitiesText,                 // Cookie Quantities
        'entry.1858160446': totalAmount.toString()                // Total Amount
    });

    try {
        await fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });
        return true;
    } catch (error) {
        console.log('Form submission attempted (no-cors mode)');
        return true;
    }
}

function escapeHtml(str){ 
    if(!str) return '—'; 
    return String(str).replace(/[&<>"']/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); 
}

// ----- Event Listeners -----
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
});

document.addEventListener('DOMContentLoaded', ()=>{
    generateWeekendDates(); 
    setDateRestrictions(); 
    renderCookieList();
    
    const orderForm = document.getElementById('orderForm');
    if (orderForm) orderForm.addEventListener('submit', handleFormSubmit);
    
    updateCartDisplay();
});