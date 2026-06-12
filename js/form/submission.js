function handleProceedToCheckout() {
  if (typeof buildOrderSummary === 'function') {
    buildOrderSummary();
  }
  scrollToSection(6); // Section 6 = Contact details
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
    
    setupGoogleFormsData(orderId, name, socialDisplay, contactNumber, deliveryDate, timeSlot, deliveryMethod, payment, notes, orderDetails, cookieQuantities, totalAmount);
    
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
    const googleSuccess = await submitToGoogleForms();

    if (googleSuccess) {
      showToast('Order submitted successfully! 📊', 'success');
    } else {
        showToast('Order received! Tracking failed, but your order is saved.', 'warning');
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
    
    return true;
  } catch (error) {
    console.error('Error storing order data:', error);
    return false;
  }
}

