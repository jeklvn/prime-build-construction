 const menuToggle = document.querySelector('.menu-toggle');
    const navUl = document.getElementById('mobileNav');

    const setNavOpen = (open) => {
      if (!navUl || !menuToggle) return;
      navUl.classList.toggle('is-open', open);
      menuToggle.classList.toggle('is-active', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      navUl.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('nav-open', open);
    };

    menuToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navUl.classList.toggle('is-open');
      menuToggle.classList.toggle('is-active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      navUl.setAttribute('aria-hidden', String(!isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    // Close menu when clicking outside the nav on mobile
    document.addEventListener('click', (e) => {
      if (!navUl || !menuToggle) return;
      if (!navUl.classList.contains('is-open')) return;
      const withinNav = e.composedPath().includes(navUl) || e.composedPath().includes(menuToggle);
      if (!withinNav) setNavOpen(false);
    });

    // Keep menu visible after scrolling — do not auto-close on scroll
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        setNavOpen(false);
      });
    });

    // Close mobile nav if viewport is resized to desktop width
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) {
        setNavOpen(false);
      }
    });

    const statSection = document.querySelector('.stats-section');
    const statNumbers = document.querySelectorAll('.stat-number');
    const statCards = document.querySelectorAll('.stat-card');

    const animateCounter = (element) => {
      const target = Number(element.dataset.target);
      const suffix = target === 98 ? '%' : '+';
      const duration = 1800;
      const startTime = performance.now();

      const step = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const value = Math.floor(progress * target);
        element.textContent = `${value}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          element.textContent = `${target}${suffix}`;
        }
      };

      requestAnimationFrame(step);
    };

    const revealStats = () => {
      statCards.forEach((card) => card.classList.add('is-visible'));
      statNumbers.forEach((number) => animateCounter(number));
    };

    if (statSection) {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealStats();
              observer.disconnect();
            }
          });
        }, { threshold: 0.35 });

        observer.observe(statSection);
      } else {
        revealStats();
      }
    }

    const fadeUpSections = document.querySelectorAll('.fade-up-section');

    const revealFadeUps = () => {
      fadeUpSections.forEach((section) => section.classList.add('is-visible'));
    };

    if (fadeUpSections.length) {
      if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          });
        }, { threshold: 0.25 });

        fadeUpSections.forEach((section) => revealObserver.observe(section));
      } else {
        revealFadeUps();
      }
    }

    const contactForm = document.getElementById('contactPreviewForm');
    const contactSubmitButton = document.getElementById('contactSubmitBtn');
    const contactStatus = document.getElementById('contactFormStatus');
    const contactButtonLabel = contactSubmitButton?.querySelector('.submit-label');
    const contactSpinner = contactSubmitButton?.querySelector('.button-spinner');
    let contactStatusTimer;

    const resetContactStatus = () => {
      if (!contactStatus) return;
      contactStatus.classList.remove('is-visible', 'success', 'error');
      contactStatus.textContent = '';
      contactStatus.setAttribute('aria-live', 'polite');
    };

    const showContactStatus = (message, type) => {
      if (!contactStatus) return;
      resetContactStatus();
      contactStatus.textContent = message;
      contactStatus.classList.add('is-visible', type);
      contactStatus.setAttribute('aria-live', type === 'success' ? 'polite' : 'assertive');

      if (contactStatusTimer) {
        window.clearTimeout(contactStatusTimer);
      }

      contactStatusTimer = window.setTimeout(() => {
        contactStatus.classList.remove('is-visible');
      }, 5000);
    };

    const setSubmitState = (isSubmitting) => {
      if (!contactSubmitButton || !contactButtonLabel || !contactSpinner) return;
      contactSubmitButton.disabled = isSubmitting;
      contactSubmitButton.classList.toggle('is-loading', isSubmitting);
      contactButtonLabel.textContent = isSubmitting ? 'Sending…' : 'Send Inquiry';
      contactSpinner.setAttribute('aria-hidden', 'true');
    };

    contactForm?.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (contactSubmitButton?.disabled) {
        return;
      }

      setSubmitState(true);
      resetContactStatus();

      try {
        const payload = Object.fromEntries(new FormData(contactForm).entries());
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        showContactStatus('Your inquiry has been sent successfully. Our team will contact you shortly.', 'success');
        contactForm.reset();
      } catch (error) {
        showContactStatus('Failed to send your inquiry. Please try again or contact us directly.', 'error');
      } finally {
        setSubmitState(false);
      }
    });