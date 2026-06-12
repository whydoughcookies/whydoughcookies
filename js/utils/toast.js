// Fixed Toast Function
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toastContainer');
  
  // Create toast container if it doesn't exist
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
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
  
  // Force reflow
  toast.offsetHeight;
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode === toastContainer) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 3000);
}
