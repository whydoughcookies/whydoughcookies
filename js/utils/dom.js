// Add this to script.js - iOS Viewport Height Fix
function setVH() {
  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Enhanced navigation for external buttons
function setupExternalNavigation() {
  // Add loading states to all navigation buttons
  document.querySelectorAll('.navigation-buttons .nav-button, .navigation-buttons .arrow-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      // Add loading animation
      this.classList.add('loading');
      
      // Remove loading state after navigation
      setTimeout(() => {
        this.classList.remove('loading');
      }, 1000);
    });
  });
}

function scrollToSection(sectionId) {
  if (blurFromKeyboard) return;

  // ✅ Prevent focused inputs (like Notes textarea) from snapping scroll back
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
    active.blur();
  }
  
  const element = document.getElementById(`section-${sectionId}`);
  if (!element) return;

  // Only gate on the order page
  if (typeof isOrderPage === 'function' && isOrderPage()) {
    const activeSectionEl = document.querySelector('section.active-section');
    if (activeSectionEl) {
      const match = activeSectionEl.id.match(/^section-(\d+)$/);
      const currentId = match ? parseInt(match[1], 10) : null;

      // If moving FORWARD from one of the gated sections (2–7), check it first
      if (
        currentId &&
        sectionId > currentId &&         // forward only
        currentId >= 2 && currentId <= 7 && // only those sections
        sectionId <= 8                     // you can still go to summary after 7
      ) {
        const ok = canProceedFromSection(currentId);
        if (!ok) {
          // Stay on current section if validation fails
          return;
        }
      }
    }
  }

  element.scrollIntoView({ behavior: 'smooth' });
  updateCurrentSection(sectionId);
}


