/* =====================================================
   JAI KASHI TOURS & TRAVELS - JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== PRELOADER =====
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (preloader) preloader.classList.add('hidden');
    }, 1500);
  });
  // Fallback: hide after 4 seconds regardless
  setTimeout(() => {
    if (preloader) preloader.classList.add('hidden');
  }, 4000);

  // ===== FLOATING PARTICLES =====
  const particlesContainer = document.getElementById('particles');
  function createParticles() {
    if (!particlesContainer) return;
    const count = 30;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.width = (Math.random() * 4 + 2) + 'px';
      particle.style.height = particle.style.width;
      particle.style.animationDuration = (Math.random() * 10 + 8) + 's';
      particle.style.animationDelay = (Math.random() * 8) + 's';
      particle.style.opacity = Math.random() * 0.4 + 0.1;
      particlesContainer.appendChild(particle);
    }
  }
  createParticles();

  // ===== NAVBAR SCROLL =====
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar scroll effect
    if (navbar) {
      if (scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Back to top button
    if (backToTop) {
      if (scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }

    // Active nav link on scroll
    if (typeof updateActiveNavLink === 'function') {
      updateActiveNavLink();
    }
  });

  // Back to top click
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== MOBILE MENU LOGIC =====
  window.toggleMobileMenu = function() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('active');
  };

  // ===== AUTH LOGIC (MOCKED) =====
  window.openLoginModal = function() {
    document.getElementById('auth-modal').classList.add('active');
  };

  window.closeLoginModal = function() {
    document.getElementById('auth-modal').classList.remove('active');
  };

  window.switchAuthTab = function(tab) {
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('tab-register').classList.remove('active');
    document.getElementById('form-login-container').style.display = 'none';
    document.getElementById('form-register-container').style.display = 'none';
    document.getElementById('form-login-container').classList.remove('active');
    document.getElementById('form-register-container').classList.remove('active');

    if (tab === 'login') {
      document.getElementById('tab-login').classList.add('active');
      document.getElementById('form-login-container').style.display = 'block';
      setTimeout(() => document.getElementById('form-login-container').classList.add('active'), 10);
    } else {
      document.getElementById('tab-register').classList.add('active');
      document.getElementById('form-register-container').style.display = 'block';
      setTimeout(() => document.getElementById('form-register-container').classList.add('active'), 10);
    }
  };

  window.handleLogin = async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-id').value;
    const password = document.getElementById('login-password')?.value || 'password123';
    
    try {
      const res = await fetch('http://localhost:5500/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error) return alert(data.error);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      alert('Logged in successfully!');
      closeLoginModal();
      updateAuthUI();
      // Redirect straight to the unified dashboard
      window.location.href = 'dashboard.html';
    } catch(err) {
      alert('Login failed. Server error.');
    }
  };

  window.handleRegister = async function(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password')?.value || 'password123';

    try {
      const res = await fetch('http://localhost:5500/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.error) return alert(data.error);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      alert('Registered and logged in successfully!');
      closeLoginModal();
      updateAuthUI();
    } catch(err) {
      alert('Registration failed. Server error.');
    }
  };

  function updateAuthUI() {
    const user = localStorage.getItem('user');
    const loginBtn = document.getElementById('login-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileDashboardBtn = document.getElementById('mobile-dashboard-btn');
    
    if (user) {
      if(loginBtn) loginBtn.style.display = 'none';
      if(dashboardBtn) dashboardBtn.style.display = 'inline-flex';
      if(mobileLoginBtn) mobileLoginBtn.style.display = 'none';
      if(mobileDashboardBtn) mobileDashboardBtn.style.display = 'flex';
    } else {
      if(loginBtn) loginBtn.style.display = 'inline-block';
      if(dashboardBtn) dashboardBtn.style.display = 'none';
      if(mobileLoginBtn) mobileLoginBtn.style.display = 'block';
      if(mobileDashboardBtn) mobileDashboardBtn.style.display = 'none';
    }
  }
  
  // Handle URL hash to open login modal automatically
  if (window.location.hash === '#login') {
    setTimeout(() => {
      if (typeof window.openLoginModal === 'function') {
        window.openLoginModal();
      }
    }, 500);
  }

  // Initialize UI
  updateAuthUI();

  // ===== CALL LINK INTERCEPT (MOBILE VS DESKTOP) =====
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  }

  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function(e) {
      if (!isMobile()) {
        e.preventDefault();
        const phoneNumber = "919653028323";
        const message = encodeURIComponent("Hello! I clicked Call Now from your website. I would like to enquire about your travel services.");
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      }
    });
  });

  // ===== ACTIVE NAV LINK ON SCROLL =====
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ===== HERO SLIDER =====
  const heroSlides = document.querySelectorAll('.hero-slide');
  let currentSlide = 0;

  function nextHeroSlide() {
    heroSlides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % heroSlides.length;
    heroSlides[currentSlide].classList.add('active');
  }

  setInterval(nextHeroSlide, 5000);

  // ===== 3D TILT EFFECT ON CARDS =====
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });

  // ===== SCROLL REVEAL ANIMATIONS =====
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  function checkReveal() {
    const trigger = window.innerHeight * 0.85;

    revealElements.forEach(el => {
      const top = el.getBoundingClientRect().top;
      if (top < trigger) {
        el.classList.add('revealed');
      }
    });
  }

  window.addEventListener('scroll', checkReveal);
  checkReveal(); // Run on load

  // ===== COUNTER ANIMATION =====
  const counters = document.querySelectorAll('.counter-number');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;

    const counterSection = document.getElementById('counter-section');
    const sectionTop = counterSection.getBoundingClientRect().top;
    const trigger = window.innerHeight * 0.85;

    if (sectionTop < trigger) {
      countersAnimated = true;

      counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const isDecimal = counter.getAttribute('data-decimal') === 'true';
        const duration = 2000;
        const steps = 60;
        const stepTime = duration / steps;
        let current = 0;
        const increment = target / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString();
          if (counter.textContent === target.toString() || current >= target) {
            counter.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
          }
        }, stepTime);
      });
    }
  }

  window.addEventListener('scroll', animateCounters);
  animateCounters();

  // ===== HERO STATS COUNTER =====
  const heroStats = document.querySelectorAll('.hero-stat-number');
  let heroStatsAnimated = false;

  function animateHeroStats() {
    if (heroStatsAnimated) return;
    heroStatsAnimated = true;

    heroStats.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-count'));
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;
      let current = 0;
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        stat.textContent = Math.floor(current).toLocaleString() + '+';
      }, stepTime);
    });
  }

  // Animate hero stats after preloader
  setTimeout(animateHeroStats, 2000);

  // ===== LIGHTBOX GALLERY =====
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // ===== SMOOTH SCROLL FOR NAV LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // ===== FORM HANDLING =====
  window.handleFormSubmit = function(e) {
    e.preventDefault();

    const name = document.getElementById('form-name').value;
    const phone = document.getElementById('form-phone').value;
    const email = document.getElementById('form-email').value;
    const date = document.getElementById('form-date').value;
    const guests = document.getElementById('form-guests').value;
    const message = document.getElementById('form-message').value;

    // Build WhatsApp message
    let waMessage = `Hello Jai Kashi Tours! 🕉\n\n`;
    waMessage += `*New Enquiry*\n`;
    waMessage += `👤 Name: ${name}\n`;
    waMessage += `📱 Phone: ${phone}\n`;
    if (email) waMessage += `📧 Email: ${email}\n`;
    if (date) waMessage += `📅 Travel Date: ${date}\n`;
    if (guests) waMessage += `👥 Guests: ${guests}\n`;
    if (message) waMessage += `💬 Message: ${message}\n`;

    const encodedMessage = encodeURIComponent(waMessage);
    window.open(`https://wa.me/919653028323?text=${encodedMessage}`, '_blank');

    // Show success feedback
    const btn = document.getElementById('form-submit-btn');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Sent via WhatsApp!';
    btn.style.background = 'linear-gradient(135deg, #25d366, #128c7e)';
    btn.style.color = '#fff';

    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.style.background = '';
      btn.style.color = '';
      e.target.reset();
    }, 3000);
  };

  // ===== NEWSLETTER =====
  window.handleNewsletter = function(e) {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    const waMessage = encodeURIComponent(`Hi! I want to subscribe to your newsletter. My email: ${email}`);
    window.open(`https://wa.me/919653028323?text=${waMessage}`, '_blank');
    document.getElementById('newsletter-email').value = '';
  };

  // ===== PARALLAX EFFECT ON HERO =====
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroContent.style.opacity = 1 - (scrollY / (window.innerHeight * 0.8));
    }
  });

  // ===== TYPING EFFECT FOR HERO BADGE =====
  // Already using CSS animations, but add subtle interactivity
  const heroBadge = document.querySelector('.hero-badge');
  if (heroBadge) {
    heroBadge.addEventListener('mouseenter', () => {
      heroBadge.style.transform = 'scale(1.05)';
    });
    heroBadge.addEventListener('mouseleave', () => {
      heroBadge.style.transform = 'scale(1)';
    });
  }

});
