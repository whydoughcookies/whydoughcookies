function initializeFlavorsSection() {
const flavors = [
  { 
    name: "The Dubai Chewy Cookie", 
    description: "soft, stretchy, pistachio-kataifi filled, cocoa-dusted, irresistibly chewy goodness.", 
    image: "images/the-dubai-chewy-cookie.png",
    tag: "New" 
  },
  { 
    name: "The Biscoff Chewy Cookie", 
    description: "soft, stretchy, Biscoff bits-dusted, with rich caramelized Biscoff kataifi inside.", 
    image: "images/the-biscoff-chewy-cookie.png",
    tag: "New"
  },
  { 
    name: "The Usual", 
    description: "Crispy outside, soft inside—loaded with premium dark and milk chocolate for the ultimate classic cookie.", 
    image: "images/the-usual.png" 
  },
  { 
    name: "The Red One", 
    description: "Soft red velvet cookie filled with creamy cream cheese and layered with premium white chocolate.", 
    image: "images/the-red-one.png" 
  },
  { 
    name: "The Burnt One", 
    description: "Rich dark chocolate cookie packed with premium dark chocolate and a luscious cream cheese center.", 
    image: "images/the-burnt-one.png" 
  },
  { 
    name: "The Bizz", 
    description: "Chewy cookie with rich Lotus Biscoff flavor, crunchy biscuit bits, and smooth milk chocolate.", 
    image: "images/the-bizz.png" 
  },
  { 
    name: "The Milky One", 
    description: "Soft buttery cookie overflowing with creamy white chocolate—sweet, chewy, and irresistibly dreamy.", 
    image: "images/milky-one.png" 
  },
  { 
    name: "Pistash", 
    description: "Tender pistachio cookie infused with pistachio cream and crunch, finished with white and milk chocolate.", 
    image: "images/pistash.png" 
  },
  { 
    name: "The OT", 
    description: "Malty Ovaltine cookie with a crunchy surprise filling and creamy milk chocolate.", 
    image: "images/the-ot.png" 
  },
  { 
    name: "Nut-so-Carrot", 
    description: "Moist carrot cake–inspired cookie with cream cheese filling, real carrot goodness, and white chocolate.", 
    image: "images/nut-so-carrot.png" 
  },
  { 
    name: "Espress-oh", 
    description: "Bold coffee cookie with cream cheese filling blended with silky white and milk chocolate.", 
    image: "images/espressoh.png" 
  },
  { 
    name: "Berry Match", 
    description: "Earthy matcha cookie with tangy berry bits balanced by smooth white chocolate.", 
    image: "images/berry-match.png" 
  },
  { 
    name: "The Minty One", 
    description: "Deep dark chocolate cookie infused with cool peppermint for a perfectly festive bite.", 
    image: "images/the-minty-one.png",
    tag: "  Sold-out  " 
  },
  { 
    name: "The Campfire", 
    description: "Gooey marshmallow-filled cookie with two kinds of marshmallow and a crispy graham cracker base.", 
    image: "images/the-campfire.png",
    tag: "Sold-out" 
  },
  { 
    name: "Nut Usual", 
    description: "Your classic cookie upgraded with toasted walnuts and an oozy caramel center for ultimate holiday indulgence.", 
    image: "images/nut-usual.png",
    tag: "Sold-out" 
  }
];

// Initialize both grid and carousel
initializeFlavorsGrid(flavors);
initializeFlavorsCarousel(flavors);
}

function initializeFlavorsGrid(flavors) {
  const grid = document.getElementById('flavorsGrid');
  if (!grid) return;

  grid.innerHTML = flavors.map(flavor => `
    <div class="flavor-card">
      <div class="flavor-image-container">
        ${flavor.tag ? `<div class="flavor-tag">${flavor.tag}</div>` : ''}
        <img src="${flavor.image}" alt="${flavor.name}" loading="lazy" class="flavor-image">
      </div>
      <h3 class="flavor-name text-3xl">${flavor.name}</h3>
      <p class="flavor-description">${flavor.description}</p>
    </div>
  `).join('');

  preloadFlavorImages(flavors);
}

function equalizeFlavorCardHeights() {
  // Only apply equal heights on mobile carousel
  if (window.innerWidth >= 768) {
    // Reset heights when leaving mobile
    document.querySelectorAll('.flavor-carousel-item .flavor-card')
      .forEach(card => {
        card.style.height = 'auto';
      });
    return;
  }

  const cards = document.querySelectorAll('.flavor-carousel-item .flavor-card');
  if (!cards.length) return;

  // Make sure all images in the carousel are loaded
  const images = document.querySelectorAll('.flavor-carousel-item img');
  const allImagesLoaded = Array.from(images).every(img => img.complete);

  if (!allImagesLoaded) {
    // Try again shortly, once images have had time to load
    setTimeout(equalizeFlavorCardHeights, 100);
    return;
  }

  // Reset heights first to get natural sizes
  let maxHeight = 0;
  cards.forEach(card => {
    card.style.height = 'auto';
    const h = card.offsetHeight;
    if (h > maxHeight) maxHeight = h;
  });

  // Apply tallest height to all
  cards.forEach(card => {
    card.style.height = maxHeight + 'px';
  });
}

function initializeFlavorsCarousel(flavors) {
  const track = document.getElementById('flavorsCarouselTrack');
  const currentSlideElement = document.getElementById('currentSlide');
  const totalSlidesElement = document.getElementById('totalSlides');
  const prevButton = document.querySelector('.flavor-carousel-prev');
  const nextButton = document.querySelector('.flavor-carousel-next');

  if (!track) return;

  // Set total slides count
  if (totalSlidesElement) {
    totalSlidesElement.textContent = flavors.length;
  }

  // Create carousel items
  track.innerHTML = flavors.map((flavor, index) => `
    <div class="flavor-carousel-item">
      <div class="flavor-card">
        <div class="flavor-image-container">
          ${flavor.tag ? `<div class="flavor-tag">${flavor.tag}</div>` : ''}
          <img src="${flavor.image}" alt="${flavor.name}" loading="lazy" class="flavor-image">
        </div>
        <h3 class="flavor-name text-3xl">${flavor.name}</h3>
        <p class="flavor-description">${flavor.description}</p>
      </div>
    </div>
  `).join('');

  // Carousel state
  let currentSlide = 0;
  const slideCount = flavors.length;
  let isTransitioning = false;

  // Update carousel position with smooth transition
  function updateCarousel(instant = false) {
    if (instant) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update counter
    if (currentSlideElement) {
      currentSlideElement.textContent = currentSlide + 1;
    }
    
    // Update button states
    if (prevButton) {
      prevButton.disabled = currentSlide === 0;
    }
    if (nextButton) {
      nextButton.disabled = currentSlide === slideCount - 1;
    }
    
    // Reset transition flag
    if (!instant) {
      isTransitioning = true;
      setTimeout(() => {
        isTransitioning = false;
      }, 3500);
    }
  }

  // Navigation functions with smooth looping
  function nextSlide() {
    if (isTransitioning) return;
    
    if (currentSlide < slideCount - 1) {
      currentSlide++;
      updateCarousel();
    } else {
      // Smooth loop to first slide
      currentSlide = 0;
      updateCarousel();
    }
  }

  function prevSlide() {
    if (isTransitioning) return;
    
    if (currentSlide > 0) {
      currentSlide--;
      updateCarousel();
    } else {
      // Smooth loop to last slide
      currentSlide = slideCount - 1;
      updateCarousel();
    }
  }

  // Add event listeners to navigation buttons
  if (prevButton) {
    prevButton.addEventListener('click', prevSlide);
  }

  if (nextButton) {
    nextButton.addEventListener('click', nextSlide);
  }

  // Touch/swipe support for mobile
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
  });

  track.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    
    const diff = startX - currentX;
    const threshold = 50;
    
    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });

  // Auto-advance carousel (mobile only)
  let autoAdvance;

  function startAutoAdvance() {
    if (window.innerWidth >= 768) return; // Only auto-advance on mobile
    
    autoAdvance = setInterval(() => {
      nextSlide();
    }, 4000);
  }

  function stopAutoAdvance() {
    if (autoAdvance) {
      clearInterval(autoAdvance);
    }
  }

  // Start auto-advance
  startAutoAdvance();

  // Pause auto-advance on hover/touch
  const carouselContainer = document.querySelector('.flavors-carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoAdvance);
    carouselContainer.addEventListener('mouseleave', startAutoAdvance);
    carouselContainer.addEventListener('touchstart', stopAutoAdvance);
    carouselContainer.addEventListener('touchend', startAutoAdvance);
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    stopAutoAdvance();
    startAutoAdvance();
  });

  // Initial update
  updateCarousel(true);

  // Preload images for carousel
  preloadFlavorImages(flavors);
}

function preloadFlavorImages(flavors) {
flavors.forEach(flavor => {
  if (flavor.image) {
    const img = new Image();
    img.src = flavor.image;
  }
});
}

