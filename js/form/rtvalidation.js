function setupRealTimeValidation() {
  // Input fields - with enhanced clearing
  const fieldsToValidate = [
    'input[name="name"]',
    'input[name="contactNumber"]',
    '#deliveryDateInput',
    'select[name="payment"]'
  ];
  
  fieldsToValidate.forEach(selector => {
    const field = document.querySelector(selector);
    if (!field) return;

    field.addEventListener('blur', function() {
      validateSingleField(this);

      if (!isOrderPage()) return;
      
      const name  = this.name || this.id;
      const value = this.value ? this.value.trim() : '';

      // SECTION 3 – Delivery date (date part) → wait until both date + time slot set
      if (this.id === 'deliveryDateInput') {
        if (isDeliverySectionComplete()) {
          autoAdvanceFromSection(3);
        }
      }

      // SECTION 7 – Payment → Section 8
      if (name === 'payment' && value) {
        autoAdvanceFromSection(7); 
      }
    });
  });

  // Name field — Show next button only when valid
  const nameField = document.querySelector('input[name="name"]');
  const nextBtnWrapper2 = DOM.get('#nextBtnWrapper2');

  if (nameField && nextBtnWrapper2) {
    nameField.addEventListener('input', function () {
      clearNameError();
      const cleaned = this.value.replace(/[^A-Za-z\s'.-]/g, '');
      if (cleaned !== this.value) this.value = cleaned;

      const value = cleaned.trim();
      const valid = /^[A-Za-z\s'.-]+$/.test(value) && value.length >= 3;

      if (valid && value.length > 0) {
        nextBtnWrapper2.classList.remove('hidden');
      } else {
        nextBtnWrapper2.classList.add('hidden');
      }
    });
  }

  // Radio groups - time slot (with enhanced clearing)
  const timeSlotRadios = document.querySelectorAll('input[name="timeSlot"]');
  timeSlotRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      clearTimeSlotError();
    });
  });

  // Radio groups - delivery method (with enhanced clearing)
  const deliveryRadios = document.querySelectorAll('input[name="deliveryMethod"]');
  deliveryRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      clearDeliveryMethodError();
    });
  });

    // Contact section next button logic
  const nextBtnWrapper6 = DOM.get('#nextBtnWrapper6');

  function updateContactNextButton() {
    if (!nextBtnWrapper6) return;

    const phoneField = document.querySelector('input[name="contactNumber"]');
    const socialField = document.querySelector('#socialHandleInput');
    const socialRadios = document.querySelectorAll('input[name="socialPlatform"]');

    // Clear existing phone error while typing
    clearContactNumberError();

    const rawPhone = phoneField ? phoneField.value : '';
    const digitsOnly = rawPhone.replace(/\D/g, ''); // remove spaces/dashes etc.

    const phoneValid =
      /^09\d{9}$/.test(digitsOnly) ||   // 09XXXXXXXXX
      /^639\d{9}$/.test(digitsOnly);    // 639XXXXXXXXX

    const social = socialField ? socialField.value.trim() : '';
    const socialOk = social === '' || social.length >= 5;
    const platformSelected = Array.from(socialRadios).some(r => r.checked);

    let canProceed = false;

    if (phoneValid && socialOk) {
      if (social === '') {
        // No social → OK
        canProceed = true;
      } else if (platformSelected) {
        // Social provided AND platform selected → OK
        canProceed = true;
      }
    }

    if (canProceed) {
      nextBtnWrapper6.classList.remove('hidden');
    } else {
      nextBtnWrapper6.classList.add('hidden');
    }
  }

  // Listeners
  const phoneField = document.querySelector('input[name="contactNumber"]');
  const socialField = document.querySelector('#socialHandleInput');
  const socialRadios = document.querySelectorAll('input[name="socialPlatform"]');

  if (phoneField) phoneField.addEventListener('input', updateContactNextButton);
  if (socialField) socialField.addEventListener('input', updateContactNextButton);
  socialRadios.forEach(radio => radio.addEventListener('change', updateContactNextButton));

  // Payment method change → still auto-advance to Section 8
  const paymentSelect = document.querySelector('select[name="payment"]');
  if (paymentSelect) {
    paymentSelect.addEventListener('change', function() {
      this.classList.remove('error-highlight');
      const error = this.nextElementSibling;
      if (error && error.classList.contains('field-error')) {
        error.remove();
      }

      if (this.value && isOrderPage()) {
        autoAdvanceFromSection(7);
      }
    });
  }

  // Notes – no auto-advance, just error clearing if ever used
  const notesField = document.querySelector('textarea[name="notes"]');
  const nextBtnWrapper8 = DOM.get('#nextBtnWrapper8');

  if (notesField && nextBtnWrapper8) {
    notesField.addEventListener('input', function () {
      if (this.value.trim().length > 0) {
        nextBtnWrapper8.classList.remove('hidden');
      } else {
        nextBtnWrapper8.classList.add('hidden');
      }
    });
  }
}

function validateSingleField(field) {
  const fieldName = field.name || field.id;
  
  // Clear any existing error for this field
  if (fieldName === 'deliveryDate') {
    clearDeliveryDateError();
  } else {
    field.classList.remove('error-highlight');
    const existingError = field.nextElementSibling;
    if (existingError && (existingError.classList.contains('field-error') || existingError.classList.contains('container-error'))) {
      existingError.remove();
    }
  }
  
  // Validate based on field type
  if (field.name === 'name') {
    const value = field.value.trim();
    if (!value) {
      showFieldError(field, 'Please enter your name');
      return false;
    }
  
    const nameRegex = /^[A-Za-z\s'.-]+$/;
    if (!nameRegex.test(value)) {
      showFieldError(field, 'Please use letters only (no emojis or special characters)');
      return false;
    }
    return true;

  } else if (fieldName === 'deliveryDate' && field.value == '') {
    showFieldError(field, 'Please select a delivery date');
  } else if (fieldName === 'contactNumber') {
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (!field.value.trim()) {
      showFieldError(field, 'Please enter your contact number');
    } else if (!phoneRegex.test(field.value.trim())) {
      showFieldError(field, 'Please enter a valid Philippine phone number');
    }
  } else if (fieldName === 'payment' && !field.value) {
    showFieldError(field, 'Please select a payment method');
  }
}

// Clear error for Name field while typing
function clearNameError() {
  const field = document.querySelector('input[name="name"]');
  if (!field) return;

  field.classList.remove('error-highlight');

  // Remove only field-error inside this field's parent container
  const err = field.parentElement.querySelector('.field-error');
  if (err) err.remove();
}

// Clear error for Contact Number field while typing
function clearContactNumberError() {
  const field = document.querySelector('input[name="contactNumber"]');
  if (!field) return;

  field.classList.remove('error-highlight');

  const err = field.parentElement.querySelector('.field-error');
  if (err) err.remove();
}


function clearDeliveryDateError() {
  const dateField = document.querySelector('#deliveryDateInput');

  if (dateField) {
    // Remove highlight on the input
    dateField.classList.remove('error-highlight');

    // Remove error message directly after the input
    const next = dateField.nextElementSibling;
    if (
      next &&
      (next.classList.contains('field-error') ||
        next.classList.contains('container-error'))
    ) {
      next.remove();
    }
  }

  // Optional: also remove any container highlight on the wrapper, if ever used
  const dateContainer = document.querySelector('#deliverydate-div');
  if (dateContainer) {
    dateContainer.classList.remove('container-error-highlight');
  }
}


function clearTimeSlotError() {
  const timeSlotContainer = document.querySelector('#section-3 #timeslot-div');
  const timeSlotSection = document.querySelector('#section-3');
  
  if (timeSlotContainer) {
    timeSlotContainer.classList.remove('container-error-highlight');
  }
  
  // Remove any container errors that are siblings of the time slot container
  const error = timeSlotContainer?.nextElementSibling;
  if (error && error.classList.contains('container-error')) {
    error.remove();
  }
}

function clearDeliveryMethodError() {
  const deliveryContainer = document.querySelector('#section-4 .space-y-4');
  
  if (deliveryContainer) {
    deliveryContainer.classList.remove('container-error-highlight');
  }
  
  // Remove any container errors that are siblings of the delivery container
  const error = deliveryContainer?.nextElementSibling;
  if (error && error.classList.contains('container-error')) {
    error.remove();
  }
}

// Update the existing clearAllErrors function to use these specific functions
function clearAllErrors() {
  // Use specialized clear helpers where available
  if (typeof clearDeliveryDateError === 'function') clearDeliveryDateError();
  if (typeof clearTimeSlotError === 'function') clearTimeSlotError();
  if (typeof clearDeliveryMethodError === 'function') clearDeliveryMethodError();
  if (typeof clearSocialMediaError === 'function') clearSocialMediaError();

  // Remove all inline error messages
  const errorMessages = document.querySelectorAll('.field-error, .container-error');
  errorMessages.forEach(error => error.remove());

  // Remove any highlight classes
  const highlighted = document.querySelectorAll('.error-highlight, .container-error-highlight');
  highlighted.forEach(element => {
    element.classList.remove('error-highlight', 'container-error-highlight');
  });
}

function clearSocialMediaError() {
  const socialContainer = document.querySelector('#socialPlatformSelection');
  if (!socialContainer) return;

  // Remove red highlight on the container
  socialContainer.classList.remove('container-error-highlight');

  // Remove any error message(s) directly after the container
  let sibling = socialContainer.nextElementSibling;
  while (sibling && sibling.classList.contains('container-error')) {
    const toRemove = sibling;
    sibling = sibling.nextElementSibling;
    toRemove.remove();
  }
}

async function submitToGoogleForms() {
  const googleForm = DOM.get('#googleForm');
  if (!googleForm) {
    return false;
  }
  
  try {
    const formData = new URLSearchParams();
    const inputs = googleForm.querySelectorAll('input');
    
    if (inputs.length === 0) {
      return false;
    }
    
    inputs.forEach(input => {
      if (input.name && input.value) {
        formData.append(input.name, input.value);
      }
    });
    
    await fetch(googleForm.action, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
    
    return true;
    
  } catch (error) {
    return false;
  }
}

