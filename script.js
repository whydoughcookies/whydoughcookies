// ----- State -----
let selectedBoxSize = null;
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

const setPrices = {
    ogSet: 320,
    classic6: 660,
    samplers: 320
};

// ----- Fixed JavaScript Functions -----
function scrollToSection(id){ 
    const element = document.getElementById('section-'+id);
    if (element) {
        element.scrollIntoView({behavior:'smooth'});
    }
}

function openDateInput(){ 
    const input = document.getElementById('deliveryDateInput');
    if (input) {
        input.classList.remove('hidden'); 
    }
}

function selectDeliveryMethod(element, method) {
    document.querySelectorAll('.delivery-option').forEach(opt => {
        opt.classList.remove('active');
    });
    element.classList.add('active');
    
    const radio = element.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
}

function toggleCookieCard(card, inputId) {
    const isActive = card.classList.contains('active');
    
    if (isActive) {
        card.classList.remove('active');
    } else {
        document.querySelectorAll('.cookie-card').forEach(c => {
            c.classList.remove('active');
        });
        card.classList.add('active');
        
        const input = document.getElementById(inputId);
        if (input && parseInt(input.value) === 0) {
            input.value = 1;
        }
    }
}

function toggleCustomBoxCard(card) {
    const isActive = card.classList.contains('active');
    
    if (isActive) {
        card.classList.remove('active');
    } else {
        document.querySelectorAll('.cookie-card').forEach(c => {
            c.classList.remove('active');
        });
        card.classList.add('active');
        openCustomizeModal();
    }
}

function updateCardCount(inputId, delta) {
    const input = document.getElementById(inputId);
    if (input) {
        let value = parseInt(input.value) || 0;
        input.value = Math.max(0, value + delta);
    }
}

function addToCart(inputId, itemName, price) {
    const quantity = parseInt(document.getElementById(inputId).value) || 0;
    
    if (quantity <= 0) {
        alert('Please select at least 1 quantity');
        return;
    }

    const existingIndex = cart.findIndex(item => item.id === inputId && item.type === 'premade');
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity = quantity;
        cart[existingIndex].total = price * quantity;
    } else {
        cart.push({
            id: inputId,
            type: 'premade',
            name: itemName,
            price: price,
            quantity: quantity,
            total: price * quantity
        });
    }

    updateCartDisplay();
    
    document.getElementById(inputId).value = 0;
    const card = document.querySelector(`.cookie-card[onclick*="${inputId}"]`);
    if (card) {
        card.classList.remove('active');
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartTotalPreview = document.getElementById('cartTotalPreview');
    const cartItems = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartTotal = document.getElementById('cartTotal');
    const cartTotalAmount = document.getElementById('cartTotalAmount');

    // Check if elements exist before manipulating them
    if (!cartCount || !cartTotalPreview || !cartItems || !emptyCartMessage || !cartTotal || !cartTotalAmount) {
        console.log('Cart elements not found');
        return;
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
    
    cartCount.textContent = totalItems;
    cartTotalPreview.textContent = totalAmount;

    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        cartItems.innerHTML = '';
        cartTotal.classList.add('hidden');
    } else {
        emptyCartMessage.classList.add('hidden');
        cartTotal.classList.remove('hidden');
        cartTotalAmount.textContent = totalAmount;

        cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="flex justify-between items-start">
            <div class="flex-1">
                <h4 class="font-semibold">${item.name}</h4>
                ${item.type === 'customBox' ? 
                `<p class="text-sm text-gray-600">Box of ${item.boxSize}</p>
                    <p class="text-sm text-gray-600">${item.items.map(it => `${it.name} (x${it.qty})`).join(', ')}</p>` : 
                `<p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>`
                }
                <p class="font-semibold">₱${item.total}</p>
            </div>
            <button type="button" onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700 ml-2">🗑️</button>
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

function renderCookieList(){
    const container = document.getElementById('cookieList'); 
    if(!container) return; 
    
    container.innerHTML = '';
    cookieFlavors.forEach((flavor, idx) => {
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
            qtyDiv.classList.add('hidden');
            row.classList.remove('active');
        }
    }
}

function selectBoxSize(row){ 
    document.querySelectorAll('.boxsize-row').forEach(r=> r.classList.remove('active')); 
    row.classList.add('active'); 
    const radio = row.querySelector('input[type="radio"]');
    if (radio) {
        selectedBoxSize = radio.value;
    }
    
    const sizeInfo = document.getElementById('selectedSizeInfo');
    const sizeMessage = document.getElementById('sizeMessage');
    
    if (sizeInfo && sizeMessage) {
        if (selectedBoxSize === 'others') {
            sizeMessage.textContent = 'Please select at least 3 cookies for your custom box.';
            sizeInfo.classList.remove('hidden');
        } else {
            sizeMessage.textContent = `Please select exactly ${selectedBoxSize} cookies for your box.`;
            sizeInfo.classList.remove('hidden');
        }
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
        if (sizeInfo) {
            sizeInfo.classList.add('hidden');
        }
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
    if (customBoxCard) {
        customBoxCard.classList.remove('active');
    }
    
    selectedBoxSize = null;
    document.querySelectorAll('.boxsize-row').forEach(r => r.classList.remove('active'));
    document.querySelectorAll('.cookie-row').forEach(r => {
        r.classList.remove('active');
        const qtyInput = r.querySelector('.cookie-qty-input');
        if (qtyInput) qtyInput.value = 1;
    });
}

// ----- Google Forms Submission -----
async function submitToGoogleForms(formData) {
    // REPLACE THIS WITH YOUR ACTUAL GOOGLE FORM URL
    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfpWgm_iikunZ44T7HxQfnbmA1KY-bB4l57fnAN0vAaFo0ZsA/formResponse';
    
    // Calculate individual cookie quantities
    const cookieQuantities = {};
    cart.forEach(item => {
        if (item.type === 'premade') {
            if (item.name === 'OG Set') {
                cookieQuantities['The Usual'] = (cookieQuantities['The Usual'] || 0) + item.quantity;
                cookieQuantities['The Red One'] = (cookieQuantities['The Red One'] || 0) + item.quantity;
                cookieQuantities['The Burnt One'] = (cookieQuantities['The Burnt One'] || 0) + item.quantity;
            } else if (item.name === 'Classic 6') {
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

    // REPLACE THESE ENTRY IDs WITH YOUR ACTUAL GOOGLE FORM FIELD IDs
    const params = new URLSearchParams({
        'entry.1608348325': formData.get('name') || '',             // Name
        'entry.756795480': formData.get('socialHandle') || '',      // Social Handle
        'entry.1868351860': formData.get('deliveryDate') || '',     // Delivery Date
        'entry.1213945014': formData.get('deliveryMethod') || '',   // Delivery Method
        'entry.216379063': formData.get('contactNumber') || '',     // Contact Number
        'entry.1369240809': formData.get('payment') || '',          // Payment Method
        'entry.564442403': formData.get('notes') || '',             // Notes
        'entry.1344414632': orderDetails,                           // Order Details
        'entry.950008786': cookieQuantitiesText,                    // Cookie Quantities
        'entry.1858160446': totalAmount.toString()                  // Total Amount
    });

    // Submit to Google Forms using no-cors mode
    try {
        await fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        return true;
    } catch (error) {
        console.log('Form submission attempted (no-cors mode)');
        return true; // With no-cors, we can't verify success, but assume it worked
    }
}

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
        cart.forEach((item, index) => {
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
    if (summaryContent) {
        summaryContent.innerHTML = html;
    }
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
        document.querySelectorAll('.cookie-card').forEach(card => {
            card.classList.remove('active');
        });
        scrollToSection(1);
        
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting your order. Please try again or contact us directly.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
    }
}

function escapeHtml(str){ 
    if(!str) return '—'; 
    return String(str).replace(/[&<>"']/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); 
}

// ----- Init -----
document.addEventListener('DOMContentLoaded', ()=>{
    generateWeekendDates(); 
    setDateRestrictions(); 
    renderCookieList();
    
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', handleFormSubmit);
    }
    
    updateCartDisplay();
});