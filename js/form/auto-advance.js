function scrollToErrorSection(sectionNumber, fieldEl, toastMessage) {
  if (typeof updateCurrentSection === 'function') {
    updateCurrentSection(sectionNumber);
  }

  scrollToSection(sectionNumber);

  if (fieldEl && typeof fieldEl.focus === 'function') {
    setTimeout(() => fieldEl.focus(), 350);
  }

  if (toastMessage && typeof showToast === 'function') {
    showToast(toastMessage, 'error');
  }

  return false;
}

function isOrderPage() {
  return document.body && document.body.classList.contains('order-page');
}

function autoAdvanceFromSection(sectionNumber) {
  if (!isOrderPage()) return;

  // small delay so user sees their action before jump
  setTimeout(() => {
    scrollToSection(sectionNumber + 1);
  }, 350);
}

function isDeliverySectionComplete() {
  const dateField = document.querySelector('#deliveryDateInput');
  const timeSlotField = document.querySelector('#timeSlotField');

  const hasDate = dateField && dateField.value.trim() !== '';
  const hasTime = timeSlotField && timeSlotField.value.trim() !== '';

  return hasDate && hasTime;
}

function clearSectionErrors(sectionNumber) {
  const section = document.getElementById(`section-${sectionNumber}`);
  if (!section) return;

  // Remove all error messages inside this section
  section.querySelectorAll('.field-error, .container-error').forEach(el => el.remove());

  // Remove highlight classes inside this section
  section.querySelectorAll('.error-highlight, .container-error-highlight').forEach(el => {
    el.classList.remove('error-highlight', 'container-error-highlight');
  });
}

function canProceedFromSection(sectionNumber) {
  // Only gate on the main sections you listed
  if (![2, 3, 4, 5, 6, 7].includes(sectionNumber)) return true;

  clearSectionErrors(sectionNumber);

  // 2. WHAT'S YOUR NAME
  if (sectionNumber === 2) {
    const nameField = document.querySelector('input[name="name"]');
    const value = nameField ? nameField.value.trim() : '';

    if (!value) {
      showFieldError(nameField, 'Please enter your name');
      showToast('Please enter your name before continuing.', 'error');
      return false;
    }

    const nameRegex = /^[A-Za-z\s'.-]+$/;
    if (!nameRegex.test(value)) {
      showFieldError(
        nameField,
        'Please use letters only (no emojis or special characters)'
      );
      showToast('Please fix your name before continuing.', 'error');
      return false;
    }

    if (value.length < 3) {
      showFieldError(nameField, 'Name must be at least 3 characters');
      showToast('Please enter at least 3 characters for your name.', 'error');
      return false;
    }
    return true;
  }

  // 3. DELIVERY DATE + TIME SLOT
  if (sectionNumber === 3) {
    const dateField = document.querySelector('#deliveryDateInput');
    const dateValue = dateField ? dateField.value.trim() : '';

    if (!dateValue) {
      showFieldError(dateField, 'Please select a delivery date');
      showToast('Please select a delivery date.', 'error');
      return false;
    }

    const activeTimeSlot = document.querySelector('#section-3 .time-slot-option.active');
    const timeSlotField = document.querySelector('#timeSlotField');
    let timeSlotValue = timeSlotField ? timeSlotField.value.trim() : '';

    // Sync hidden field from active tile if needed (same behavior as validateForm)
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
      showToast('Please select a preferred time slot.', 'error');
      return false;
    }

    return true;
  }

  // 4. DELIVERY METHOD
  if (sectionNumber === 4) {
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
      showToast('Please select a delivery method.', 'error');
      return false;
    }
    return true;
  }

  // 5. CHOOSE YOUR COOKIES (CART)
  if (sectionNumber === 5) {
    if (!Array.isArray(state.cart) || state.cart.length === 0) {
      showToast('Please add at least one item to your cart before continuing.', 'warning');
      return false;
    }
    return true;
  }

  // 6. CONTACT DETAILS (CONTACT + OPTIONAL SOCIAL)
  if (sectionNumber === 6) {
    const contactField = document.querySelector('input[name="contactNumber"]');
    const contactValue = contactField ? contactField.value.trim() : '';
    const phoneRegex = /^(09|\+639)\d{9}$/;

    if (!contactValue) {
      showFieldError(contactField, 'Please enter your contact number');
      showToast('Please enter your contact number.', 'error');
      return false;
    }

    if (!phoneRegex.test(contactValue)) {
      showFieldError(
        contactField,
        'Please enter a valid Philippine phone number (e.g., 09123456789)'
      );
      showToast('Please fix your contact number.', 'error');
      return false;
    }

    const socialHandleField = document.querySelector('#socialHandleInput');
    const socialHandle = socialHandleField ? socialHandleField.value.trim() : '';
    const platformSelected = document.querySelector('input[name="socialPlatform"]:checked');

    if (socialHandle && socialHandle.length < 5) {
      showFieldError(socialHandleField, 'Social handle must be at least 5 characters');
      showToast('Please enter at least 5 characters for your social handle.', 'error');
      return false;
    }
    
    if (socialHandle && !platformSelected) {
      const socialContainer = document.querySelector('#socialPlatformSelection');
      showContainerError(
        socialContainer,
        socialContainer,
        'Please select a social media platform since you provided a username'
      );
      showToast('Please choose a social media platform.', 'error');
      return false;
    }

    return true;
  }

  // 7. PAYMENT METHOD
  if (sectionNumber === 7) {
    const paymentField = document.querySelector('select[name="payment"]');
    const paymentValue = paymentField ? paymentField.value : '';

    if (!paymentValue) {
      showFieldError(paymentField, 'Please select a payment method');
      showToast('Please select a payment method.', 'error');
      return false;
    }

    return true;
  }

  return true;
}

