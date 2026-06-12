function displayOrderDetails() {
  const orderData = getOrderData();

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
        timeSlotEl.textContent = `${orderData.timeSlot}`;
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

  let itemsHtml = '<li><b>• Items: </b></li>';

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

function setupPhoneCopy() {
  document.querySelectorAll('.copy-phone').forEach(el => {
    el.style.cursor = "pointer";

    el.addEventListener('click', async () => {
      const phone = el.dataset.number;

      try {
        await navigator.clipboard.writeText(phone);

        showToast("Phone number copied!");
        setTimeout(() => {
          el.textContent = originalText;
        }, 1500);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    });
  });
}
