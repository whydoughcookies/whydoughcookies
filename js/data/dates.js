function generateWeekendDates() {
  const container = DOM.get('#quickDates');
  const currentDateDisplay = DOM.get('#currentDateDisplay');
  
  if (!container) return;
  
  const today = new Date();
  
  // Display current date
  if (currentDateDisplay) {
    currentDateDisplay.textContent = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  const dateInput = document.getElementById('deliveryDateInput');
  if (dateInput) {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2); // prep time

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30-day window

    dateInput.min = minDate.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
  }

  const deliveryDates = getAvailableDeliveryDates(today);
  
  container.innerHTML = deliveryDates.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const displayDate = formatDateDisplay(date);
    
    return `
      <button type="button" class="quick-date-btn bg-brown-300 hover:bg-brown-400 rounded-lg font-medium transition-colors" data-date="${dateStr}">
        ${displayDate}
      </button>
    `;
  }).join('');
  
  setupDateSelection();
}

function getAvailableDeliveryDates(startDate) {
  const dates = [];

  const minDate = new Date(startDate);
  minDate.setDate(minDate.getDate() + 2); // prep time

  const maxDate = new Date(startDate);
  maxDate.setDate(maxDate.getDate() + 30); // 30-day limit

  let currentDate = new Date(minDate);

  while (currentDate <= maxDate && dates.length < 9) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

function formatDateDisplay(date) {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function setupDateSelection() {
  const dateInput = DOM.get('#deliveryDateInput');
  const quickDateBtns = DOM.getAll('.quick-date-btn');
  
  quickDateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const date = btn.dataset.date;
      
      // Update input
      if (dateInput) {
        dateInput.value = date;
        dateInput.type = 'date';
      }
      
      // Update button states
      quickDateBtns.forEach(b => DOM.removeClass(b, 'active'));
      DOM.addClass(btn, 'active');
      
      // Clear delivery date error when a date is selected
      clearDeliveryDateError();

      // ✅ NEW: auto-advance if time slot already selected
      if (isDeliverySectionComplete()) {
        autoAdvanceFromSection(3);
      }
    });
  });
  
  // Update quick dates when input changes and clear error
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      const selectedDate = dateInput.value;
    
      quickDateBtns.forEach(btn => {
        if (btn.dataset.date === selectedDate) {
          DOM.addClass(btn, 'active');
        } else {
          DOM.removeClass(btn, 'active');
        }
      });
    
      clearDeliveryDateError();
    
      // ✅ NEW: auto-advance if time slot already selected
      if (isDeliverySectionComplete()) {
        autoAdvanceFromSection(3);
      }
    });
    
    // Also clear on input for manual typing
    dateInput.addEventListener('input', clearDeliveryDateError);
  }
}

function resetTimeSlotSelection() {
  // Remove active visuals
  DOM.getAll('.time-slot-option').forEach(opt => {
    DOM.removeClass(opt, 'active');
  });

  // Clear hidden field
  const timeSlotField = DOM.get('#timeSlotField');
  if (timeSlotField) {
    timeSlotField.value = '';
  }
}


