function toggleSocialPlatformSelection(input) {
  const platformSelection = DOM.get('#socialPlatformSelection');
  if (!platformSelection) return;
  
  if (input.value.trim().length > 0) {
    DOM.show(platformSelection);
    // Add required attribute to radio buttons
    DOM.getAll('input[name="socialPlatform"]').forEach(radio => {
      radio.required = true;
    });
  } else {
    DOM.hide(platformSelection);
    clearSocialPlatformSelection();
    // Remove required attribute
    DOM.getAll('input[name="socialPlatform"]').forEach(radio => {
      radio.required = false;
    });
  }
}

function checkSocialHandleFocus(input) {
  const platformSelection = DOM.get('#socialPlatformSelection');
  if (!platformSelection) return;
  
  if (input.value.trim().length > 0) {
    DOM.show(platformSelection);
  }
}

function clearSocialPlatformSelection() {
  const options = DOM.getAll('.social-platform-option');
  options.forEach(opt => {
    opt.classList.remove('active');
    const radio = opt.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });
}

function selectSocialPlatform(element) {
  const options = DOM.getAll('.social-platform-option');
  options.forEach(opt => {
    opt.classList.remove('active');
    const radio = opt.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });
  
  element.classList.add('active');
  const radio = element.querySelector('input[type="radio"]');
  if (radio) {
    radio.checked = true;

    // ✅ Trigger listeners that depend on "change" (like updateContactNextButton)
    radio.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Clear the error whenever a valid platform is selected
  if (typeof clearSocialMediaError === 'function') {
    clearSocialMediaError();
  }
}

// Helper: scroll to a section, center its form container, optionally focus a field, and show a toast
