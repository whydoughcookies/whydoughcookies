function validateForm() {

  // Clear previous errors and highlights
  clearAllErrors();

  // -------------------------
  // 1. SECTION 2 – NAME
  // -------------------------
  const nameField = document.querySelector('input[name="name"]');
  const nameValue = nameField ? nameField.value.trim() : '';

  if (!nameField || !nameValue) {
    showFieldError(nameField, 'Please enter your name');
    return scrollToErrorSection(2, nameField, 'Please complete your name first.');
  } else {
    if (nameValue.length < 3) {
      showFieldError(nameField, 'Name must be at least 3 characters');
      return scrollToErrorSection(2, nameField, 'Please enter at least 3 characters for your name.');
    }    
    const nameRegex = /^[A-Za-z\s'.-]+$/;
    if (!nameRegex.test(nameValue)) {
      showFieldError(
        nameField,
        'Please use letters only (no emojis or special characters)'
      );
      return scrollToErrorSection(2, nameField, 'Please fix your name before continuing.');
    }
  }

  // -------------------------
  // 2. SECTION 3 – DELIVERY DATE
  // -------------------------
  const dateField = document.querySelector('#deliveryDateInput');
  const dateValue = dateField ? dateField.value.trim() : '';

  if (!dateField || !dateValue) {
    showFieldError(dateField, 'Please select a delivery date');
    return scrollToErrorSection(3, dateField, 'Please select a delivery date.');
  }

  // -------------------------
  // 3. SECTION 3 – TIME SLOT
  // (uses hidden field + active tile)
  // -------------------------
  const activeTimeSlot = document.querySelector('#section-3 .time-slot-option.active');
  const timeSlotField = document.querySelector('#timeSlotField');
  let timeSlotValue = timeSlotField ? timeSlotField.value.trim() : '';

  // If a tile is active but hidden field is empty, sync it once
  if (activeTimeSlot && !timeSlotValue && timeSlotField) {
    const label = activeTimeSlot.innerText || activeTimeSlot.textContent || '';
    timeSlotValue = label.trim();
    timeSlotField.value = timeSlotValue;
  }

  if (!activeTimeSlot || !timeSlotValue) {
    const timeSlotContainer = document.querySelector('#section-3 #timeslot-div');
    if (timeSlotContainer) {
      showContainerError(
        document.querySelector('#section-3'),
        timeSlotContainer,
        'Please select a preferred time slot'
      );
    }
    return scrollToErrorSection(3, timeSlotContainer, 'Please select a preferred time slot.');
  }

  // -------------------------
  // 4. SECTION 4 – DELIVERY METHOD
  // -------------------------
  const deliveryMethodSelected = document.querySelector('input[name="deliveryMethod"]:checked');
  if (!deliveryMethodSelected) {
    const deliveryContainer = document.querySelector('#section-4 .space-y-4');
    if (deliveryContainer) {
      showContainerError(
        document.querySelector('#section-4'),
        deliveryContainer,
        'Please select a delivery method'
      );
    }
    return scrollToErrorSection(4, deliveryContainer, 'Please select a delivery method.');
  }

  // -------------------------
  // 5. SECTION 5 – CART / COOKIES
  // -------------------------
  if (!Array.isArray(state.cart) || state.cart.length === 0) {
    const cookieSection = document.querySelector('#section-5');
    showToast('Please add at least one item to your cart before submitting.', 'warning');
    return scrollToErrorSection(5, cookieSection, null);
  }

  // -------------------------
  // 6. SECTION 6 – CONTACT NUMBER
  // -------------------------
  const contactField = document.querySelector('input[name="contactNumber"]');
  const contactValue = contactField ? contactField.value.trim() : '';
  const phoneRegex = /^(09|\+639)\d{9}$/;

  if (!contactField || !contactValue) {
    showFieldError(contactField, 'Please enter your contact number');
    return scrollToErrorSection(6, contactField, 'Please enter your contact number.');
  }

  if (!phoneRegex.test(contactValue)) {
    showFieldError(
      contactField,
      'Please enter a valid Philippine phone number (e.g., 09123456789)'
    );
    return scrollToErrorSection(6, contactField, 'Please fix your contact number.');
  }

  // -------------------------
  // 7. SECTION 6 – SOCIAL (only if handle entered)
  // -------------------------
  const socialHandleField = document.querySelector('#socialHandleInput');
  const socialHandle = socialHandleField ? socialHandleField.value.trim() : '';
  const platformSelected = document.querySelector('input[name="socialPlatform"]:checked');

  if (socialHandle && socialHandle.length < 5) {
    showFieldError(socialHandleField, 'Social handle must be at least 5 characters');
    return scrollToErrorSection(6, socialHandleField, 'Please enter at least 5 characters for your social handle.');
  }
  
  if (socialHandle && !platformSelected) {
    const socialContainer = document.querySelector('#socialPlatformSelection');
    showContainerError(
      socialContainer,
      socialContainer,
      'Please select a social media platform since you provided a username'
    );
    return scrollToErrorSection(6, socialContainer, 'Please choose a social media platform.');
  }

  // -------------------------
  // 8. SECTION 7 – PAYMENT
  // -------------------------
  const paymentField = document.querySelector('select[name="payment"]');
  const paymentValue = paymentField ? paymentField.value : '';

  if (!paymentField || !paymentValue) {
    showFieldError(paymentField, 'Please select a payment method');
    return scrollToErrorSection(7, paymentField, 'Please select a payment method.');
  }

  // If we reach here, all checks passed
  return true;
}


function setupSectionFocusTracking() {
  document.addEventListener(
    'focusin',
    (event) => {
      const section = event.target.closest('section[id^="section-"]');
      if (!section) return;

      const match = section.id.match(/^section-(\d+)$/);
      if (!match) return;

      const id = parseInt(match[1], 10);
      if (isNaN(id)) return;

      updateCurrentSection(id);
    },
    true // capture phase so we catch focus even before it bubbles
  );
}

function updateCurrentSection(sectionId) {

  // Remove active state from all sections
  document.querySelectorAll('section').forEach(section => {
    section.classList.remove('active-section');
  });

  // Add active state to the current section
  const activeSection = document.getElementById(`section-${sectionId}`);
  if (activeSection) {
    activeSection.classList.add('active-section');
  }
}


function showFieldError(field, message) {
  if (!field) return;

  // Add error highlight to the field
  field.classList.add('error-highlight');

  // Clear any existing error first
  const existingError = field.nextElementSibling;
  if (existingError && (existingError.classList.contains('field-error') || existingError.classList.contains('container-error'))) {
    existingError.remove();
  }

  // Create error message element
  const errorElement = document.createElement('div');
  errorElement.className = 'field-error';
  errorElement.textContent = `⚠️ ${message}`;

  // Insert after the field
  field.parentNode.insertBefore(errorElement, field.nextSibling);
}

// Replace the showContainerError function with this improved version
function showContainerError(sectionElement, container, message) {
  if (!container || !sectionElement) return;
  
  // Add error highlight to the container
  container.classList.add('container-error-highlight');
  
  // Create error message element
  const errorElement = document.createElement('div');
  errorElement.className = 'container-error';
  errorElement.textContent = `⚠️ ${message}`;
  
  // Insert the error message AFTER the container (outside)
  container.parentNode.insertBefore(errorElement, container.nextSibling);
}

