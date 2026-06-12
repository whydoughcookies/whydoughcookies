function initializeHomepage() {
  initializeFlavorsSection();
  setupTestimonialSlider();
  setupSmoothScrolling();
  initAboutCarousel();
}

// Testimonial Slider
function setupTestimonialSlider() {
  const testimonials = [
    {
      text: "The best cookies I've ever had! The OG Set is perfect for trying their signature flavors. The Burnt One is absolutely incredible - don't let the name fool you!",
      author: "Sarah M.",
      role: "Regular Customer"
    },
    {
      text: "I ordered the Samplers for my office and they were gone in minutes! Everyone loved the variety and the perfect texture - chewy but not too soft.",
      author: "Michael T.",
      role: "First-time Customer"
    },
    {
      text: "Why Dough has become our family's weekend treat. The Classics box has something for everyone. The Red One is my personal favorite!",
      author: "The Reyes Family", 
      role: "Loyal Customers"
    }
  ];
  
  let currentTestimonial = 0;
  
  window.changeTestimonial = function(index) {
    currentTestimonial = index;
    const slider = document.getElementById('testimonialSlider');
    const dots = document.querySelectorAll('#testimonials button');
    
    if (!slider) return;
    
    slider.innerHTML = `
      <div class="testimonial-slide text-center">
        <p class="text-lg mb-6 italic">${testimonials[index].text}</p>
        <div class="flex items-center justify-center space-x-3">
          <div class="w-12 h-12 bg-brown/20 rounded-full flex items-center justify-center">
            <span class="font-bold">${testimonials[index].author.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <div class="text-left">
            <p class="font-bold">${testimonials[index].author}</p>
            <p class="text-sm text-brown/70">${testimonials[index].role}</p>
          </div>
        </div>
      </div>
    `;
    
    // Update dots
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.remove('bg-brown/30');
        dot.classList.add('btn-primary');
      } else {
        dot.classList.remove('btn-primary');
        dot.classList.add('bg-brown/30');
      }
    });
  };
  
  // Auto-rotate testimonials
  setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    changeTestimonial(currentTestimonial);
  }, 5000);
}

function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Enhanced scroll handling for iOS
function setupScrollableSections() {
  const containers = document.querySelectorAll(
    '#section-3 .form-container, #section-5 .form-container'
  );

  containers.forEach(container => {
    let hideTimeout;

    function checkScrollable() {
      const isScrollable =
        container.scrollHeight > container.clientHeight + 5;

      if (isScrollable) {
        addScrollIndicator(container);
        container.classList.add('scrollable');
      } else {
        container.classList.remove('scrollable');
      }
    }

    // Initial check (after layout & images)
    setTimeout(checkScrollable, 300);

    // Re-check on resize (rotation, keyboard open/close)
    window.addEventListener('resize', checkScrollable);

    container.addEventListener('scroll', () => {
      container.classList.add('scrolling');

      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        // Only show indicator again if user is near the top
        if (container.scrollTop < 20) {
          container.classList.remove('scrolling');
        }
      }, 200);
    });
  });
}

function setupScrollIndicatorForModal(scrollContainer) {
  if (!scrollContainer) return;

  // Prevent duplicates
  if (scrollContainer.querySelector('.scroll-indicator')) return;

  const indicator = document.createElement('div');
  indicator.className = 'scroll-indicator';
  indicator.textContent = 'scroll for more';

  // IMPORTANT: attach to modal body, not body
  scrollContainer.style.position = 'relative';
  scrollContainer.appendChild(indicator);

  const hideIndicator = () => {
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 300);
    scrollContainer.removeEventListener('scroll', hideIndicator);
  };

  // Only show if scrollable
  requestAnimationFrame(() => {
    if (scrollContainer.scrollHeight > scrollContainer.clientHeight) {
      scrollContainer.addEventListener('scroll', hideIndicator, { once: true });

      // auto-hide after 6s
      setTimeout(hideIndicator, 6000);
    } else {
      indicator.remove();
    }
  });
}

function addScrollIndicator(container) {
  // Prevent duplicates
  if (container.querySelector('.scroll-indicator')) return;

  const indicator = document.createElement('div');
  indicator.className = 'scroll-indicator';
  indicator.textContent = 'Scroll for more';

  container.appendChild(indicator);
}

