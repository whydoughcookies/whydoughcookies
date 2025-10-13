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

// Enhanced add to cart with toast
function addToCart(inputId, itemName, price) {
    const input = document.getElementById(inputId);
    const quantity = parseInt(input.value) || 0;
    
    if (quantity <= 0) {
        showToast('Please select at least 1 quantity', 'warning');
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
    
    // Show success toast
    showToast(`Added ${quantity} ${itemName} to cart!`);
    
    if (event) event.stopPropagation();
}

// Enhanced remove from cart with toast
function removeFromCartWithToast(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    updateCartDisplay();
    showToast(`Removed ${removedItem.name} from cart`, 'warning');
}

// ----- Cart Management -----
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartTotal = document.getElementById('cartTotal');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    
    // Static cart elements
    const staticCart = document.getElementById('staticCart');
    const staticCartCount = document.getElementById('staticCartCount');
    const staticCartTotal = document.getElementById('staticCartTotal');

    if (!staticCart) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

    // Update main cart modal
    if (cartCount) cartCount.textContent = totalItems;
    if (cartTotalAmount) cartTotalAmount.textContent = totalAmount;

    // Update static cart in footer
    if (staticCartCount) staticCartCount.textContent = totalItems;
    if (staticCartTotal) staticCartTotal.textContent = totalAmount;

    // Show/hide static cart based on items
    if (totalItems > 0) {
        staticCart.classList.remove('hidden');
    } else {
        staticCart.classList.add('hidden');
    }

    // Update cart modal content
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
                            <h4 class="font-bold text-amber-900 text-lg">${item.name}</h4>
                            ${item.type === 'customBox' ? 
                                `<p class="text-sm text-amber-700">Box of ${item.boxSize}</p>
                                 <p class="text-sm text-amber-600">${item.items.map(it => `${it.name} (x${it.qty})`).join(', ')}</p>` : 
                                `<p class="text-sm text-amber-700">Quantity: ${item.quantity}</p>`
                            }
                            <p class="font-bold text-amber-800 text-xl mt-2">₱${item.total}</p>
                        </div>
                        <button type="button" onclick="removeFromCartWithToast(${index})" class="text-red-600 hover:text-red-800 ml-4 bg-white p-2 rounded-full shadow transition-colors">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Toast Notification Functions
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
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove after 3 seconds
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

// Enhanced custom box add to cart with toast
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
    
    // Show success toast
    showToast(`Added custom cookie box to cart!`);
    
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

function clearCartAfterSubmission() {
    cart = [];
    updateCartDisplay();
}

function generateOrderId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `WD${timestamp}${randomStr}`;
}

function prepareFormSubmitData() {
    const form = document.getElementById('orderForm');
    if (!form) return;

    const orderId = generateOrderId();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const socialHandle = form.socialHandle.value.trim();
    const contactNumber = form.contactNumber.value.trim();
    const deliveryDate = form.deliveryDate.value || 'Not selected';
    const deliveryMethod = form.deliveryMethod?.value || 'Not selected';
    const payment = form.payment.value;
    const notes = form.notes.value.trim();
    
    // Build order details for both services
    const orderDetails = cart.map(item => {
        if (item.type === 'customBox') {
            return `${item.name}: ${item.items.map(it => `${it.name} (x${it.qty})`).join(', ')} = ₱${item.total}`;
        } else {
            return `${item.name} x ${item.quantity} = ₱${item.total}`;
        }
    }).join('\n');
    
    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate individual cookie quantities for Google Forms
    const cookieQuantities = calculateCookieQuantities();
    
    const businessOrderSummary = `
🚨 NEW COOKIE ORDER - ACTION REQUIRED 🚨
=========================================
ORDER ID: ${orderId}
STATUS: AWAITING CONFIRMATION

CUSTOMER INFORMATION:
• Name: ${name}
• Email: ${email}
• Social: ${socialHandle}
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
📱 Social: ${socialHandle}

Order received: ${new Date().toLocaleString()}
    `.trim();
    
    // 🎯 SET UP FORMSUBMIT.CO DATA
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
    
    // 🎯 SET UP GOOGLE FORMS DATA
    setupGoogleFormsData(orderId, name, email, socialHandle, contactNumber, deliveryDate, deliveryMethod, payment, notes, orderDetails, cookieQuantities, totalAmount);
    
    const orderData = {
        orderId: orderId,
        customerName: name,
        totalAmount: totalAmount,
        itemCount: itemCount,
        deliveryDate: deliveryDate,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
}

// Function to calculate individual cookie quantities for Google Forms
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

// Function to set up Google Forms hidden fields
function setupGoogleFormsData(orderId, name, email, socialHandle, contactNumber, deliveryDate, deliveryMethod, payment, notes, orderDetails, cookieQuantities, totalAmount) {
    // Create hidden fields for Google Forms if they don't exist
    let googleForm = document.getElementById('googleForm');
    if (!googleForm) {
        googleForm = document.createElement('form');
        googleForm.id = 'googleForm';
        googleForm.style.display = 'none';
        googleForm.method = 'POST';
        googleForm.action = 'https://docs.google.com/forms/d/e/1FAIpQLSfEhi7T_6QIM52HL9YDgM3WkkmC4DVGUIDmdSexcpD7GF41Jw/formResponse';
        document.body.appendChild(googleForm);
    }
    
    // Clear previous Google Forms fields
    googleForm.innerHTML = '';
    
    // Map your Google Form field IDs here
    // You need to replace these with your actual Google Form field IDs
    const fieldMapping = {
        'entry.1702384608': orderId,
        'entry.884438646': name,
        'entry.945933971': email,
        'entry.1424096514': socialHandle,
        'entry.2010027852': contactNumber,
        'entry.376530706': deliveryDate,
        'entry.57353341': deliveryMethod,
        'entry.603581341': payment,
        'entry.658455856': notes,
        'entry.1597602789': orderDetails,
        'entry.1560348506': Object.entries(cookieQuantities).map(([cookie, qty]) => `${cookie}: ${qty}`).join('; '),
        'entry.891879407': `₱${totalAmount}`,
        'entry.984840806': `₱${totalAmount}`
    };
    
    // Create hidden inputs for Google Forms
    Object.entries(fieldMapping).forEach(([fieldId, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = fieldId;
        input.value = value;
        googleForm.appendChild(input);
    });
}

async function handleFormSubmit(e){ 
    e.preventDefault(); 
    
    if (cart.length === 0) {
        alert('Please add at least one item to your cart before submitting.');
        return;
    }

    prepareFormSubmitData();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        // 🎯 SUBMIT TO BOTH SERVICES SIMULTANEOUSLY
        const [googleSuccess, emailSuccess] = await Promise.allSettled([
            submitToGoogleForms(),
            submitToFormSubmit()
        ]);
        
        // Check results
        const googleOk = googleSuccess.status === 'fulfilled' && googleSuccess.value;
        const emailOk = emailSuccess.status === 'fulfilled' && emailSuccess.value;
        
        console.log('Google Forms result:', googleOk);
        console.log('Email result:', emailOk);
        
        if (googleOk && emailOk) {
            showToast('Order submitted successfully! 📧📊', 'success');
        } else if (googleOk) {
            showToast('Order submitted to tracking! (Email failed)', 'warning');
        } else if (emailOk) {
            showToast('Order submitted via email! (Tracking failed)', 'warning');
        } else {
            showToast('Order received! Please contact us to confirm.', 'warning');
        }
        
        // 🎯 REDIRECT TO THANK YOU PAGE
        setTimeout(() => {
            window.location.href = 'thank-you.html';
        }, 2000);
        
        // Clear cart
        clearCartAfterSubmission();

    } catch (error) {
        console.error('Submission error:', error);
        showToast('Order submitted! Please contact us if you dont hear back.', 'warning');
        
        // Still redirect to thank you page
        setTimeout(() => {
            window.location.href = 'thank-you.html';
        }, 2000);
        
        clearCartAfterSubmission();
    }
}

// Function to submit to Google Forms
async function submitToGoogleForms() {
    const googleForm = document.getElementById('googleForm');
    if (!googleForm) {
        console.error('Google Form not found');
        return false;
    }
    
    // Create a copy of the form data to avoid CORS issues
    const formData = new URLSearchParams();
    const inputs = googleForm.querySelectorAll('input');
    
    inputs.forEach(input => {
        if (input.name && input.value) {
            formData.append(input.name, input.value);
        }
    });
    
    try {
        // Submit to Google Forms
        const response = await fetch(googleForm.action, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Forms
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
        
        // With no-cors mode, we can't read the response but submission should work
        console.log('Google Forms submission completed');
        return true;
        
    } catch (error) {
        console.error('Error submitting to Google Forms:', error);
        return false;
    }
}

// Function to submit to FormSubmit.co for emails
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
            console.log('✅ Email sent successfully via FormSubmit.co');
            return true;
        } else {
            console.log('⚠️ FormSubmit.co email failed');
            return false;
        }
        
    } catch (error) {
        console.error('Error submitting to FormSubmit.co:', error);
        return false;
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