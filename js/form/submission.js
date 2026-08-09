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
    
    return orderData;
    
  } catch (error) {
    console.error('Error preparing form data:', error);
    return null;
  }
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
    
    // Send the new-order notification email via the Worker → Resend.
    // Email-only for now — no order database until the D1 backend (B.1).
    const notifySuccess = await sendOrderNotification(orderData);

    if (notifySuccess) {
      showToast('Order submitted successfully! 📬', 'success');
    } else {
        showToast('Order received! We\'ll still contact you to confirm.', 'warning');
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

// Sends the new-order notification email via the Pages Function /api/notify,
// which relays to Resend → whydoughcookies@gmail.com. Email-only order record
// until the D1 order backend ships (see ROADMAP B.1).
async function sendOrderNotification(orderData) {
  try {
    const summaryField = DOM.get('#orderSummaryField');
    const text =
      summaryField && summaryField.value
        ? summaryField.value
        : JSON.stringify(orderData, null, 2);

    const subject = `Why Dough Order #${orderData.orderId} - ${orderData.customerName}`;

    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: orderData.orderId, subject, text }),
    });

    const data = await res.json().catch(() => null);
    return res.ok && data && data.ok === true;
  } catch (error) {
    console.error('sendOrderNotification error:', error);
    return false;
  }
}

