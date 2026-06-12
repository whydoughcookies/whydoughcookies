
// Initialize based on page
document.addEventListener('DOMContentLoaded', function() {
  // Load cart from storage

  if (document.body.classList.contains("homepage-body")) {
    setTimeout(() => {
      openLatestProductModal();
    }, 1000);
  }

  const savedCart = localStorage.getItem('whyDoughCart');
  if (savedCart) {
    try {
      state.cart = JSON.parse(savedCart);
    } catch (e) {
      state.cart = [];
    }
  }
  // Setup external navigation if on order page
  if (document.getElementById('orderForm')) {
    setupExternalNavigation();
  }

  setVH();
  if (!document.body.classList.contains("thankyou-page")) {
    setupScrollableSections();
  }
  
  // Homepage initialization
  if (DOM.get('#flavorsCarouselTrack')) {
    initializeHomepage();

    // Run once after everything (images, fonts) are loaded
    window.addEventListener('load', () => {
      equalizeFlavorCardHeights();
    });

    // Re-run when screen size changes (orientation change, etc.)
    let equalizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(equalizeTimeout);
      equalizeTimeout = setTimeout(() => {
        equalizeFlavorCardHeights();
      }, 150);
    });
  }
  
  // Order page initialization
  const orderForm = DOM.get('#orderForm');
  if (orderForm) {
    generateWeekendDates();
    updateCartDisplay();
    setupRealTimeValidation();
    orderForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Set initial active section for order page
  if (DOM.get('#orderForm')) {
    updateCurrentSection(2); // Start at section-2 (What's your name?)
    setupSectionFocusTracking();
    resetTimeSlotSelection();
  }

  // Thank you page initialization
  if (DOM.get('#orderIdDisplay')) {
    setTimeout(() => {
      displayOrderDetails();
    }, 100);
  }

  setupPhoneCopy();

  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    blurFromKeyboard = true;
    setTimeout(() => blurFromKeyboard = false, 300);
  }
});

document.addEventListener('keydown', function (e) {
  if (
    e.key === 'Enter' &&
    e.target.matches('input[name="name"]')
  ) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.target.blur(); // closes keyboard
    return false;
  }
}, true); // 👈 capture phase (CRITICAL)