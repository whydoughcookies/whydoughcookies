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
  
  const orderId = `WD${month}${day}${initials}${sequence.toString().padStart(2, '0')}`;
  
  localStorage.setItem(sequenceKey, sequence + 1);
  
  return orderId;
}


function clearCartAfterSubmission() {
  state.cart = [];
  updateCartDisplay();
  localStorage.removeItem('whyDoughCart');
}

function saveCartToStorage() {
  localStorage.setItem('whyDoughCart', JSON.stringify(state.cart));
}

function escapeHtml(str){ 
  if(!str) return '—'; 
  return String(str).replace(/[&<>"']/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); 
}

