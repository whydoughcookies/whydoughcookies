let aboutSlides = [];
let aboutCurrentIndex = 0;
let aboutCarouselTimer = null;

function initAboutCarousel() {
  const carousel = document.getElementById('aboutCarousel');
  if (!carousel) return;

  aboutSlides = Array.from(carousel.querySelectorAll('.about-slide'));
  if (!aboutSlides.length) return;

  aboutCurrentIndex = 0;
  updateAboutCarousel();

  // clear any existing timer (if homepage re-inits)
  if (aboutCarouselTimer) {
    clearInterval(aboutCarouselTimer);
  }

  // auto-play every 5 seconds
  aboutCarouselTimer = setInterval(() => {
    aboutNextImage(true);   // pass flag so we know it's from timer
  }, 5000);
}

function updateAboutCarousel() {
  if (!aboutSlides.length) return;

  aboutSlides.forEach((slide, index) => {
    slide.classList.toggle('about-slide-active', index === aboutCurrentIndex);
  });
}

function aboutNextImage(fromTimer = false) {
  if (!aboutSlides.length) return;

  aboutCurrentIndex = (aboutCurrentIndex + 1) % aboutSlides.length;
  updateAboutCarousel();

  // If user clicked arrow, restart timer so it feels responsive
  if (!fromTimer) {
    restartAboutCarouselTimer();
  }
}

function aboutPrevImage() {
  if (!aboutSlides.length) return;

  aboutCurrentIndex =
    (aboutCurrentIndex - 1 + aboutSlides.length) % aboutSlides.length;
  updateAboutCarousel();
  restartAboutCarouselTimer();
}

function restartAboutCarouselTimer() {
  if (aboutCarouselTimer) {
    clearInterval(aboutCarouselTimer);
  }
  if (!aboutSlides.length) return;

  aboutCarouselTimer = setInterval(() => {
    aboutNextImage(true);
  }, 5000);
}

