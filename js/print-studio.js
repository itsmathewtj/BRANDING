const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');const currentPage = location.pathname.split('/').pop() || 'index.html';
const testimonialTrack = document.querySelector('.home-testimonial-track');
if (testimonialTrack && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const originalReviews = [...testimonialTrack.querySelectorAll('.home-testimonial-card')];
  if (originalReviews.length > 1) {
    originalReviews.forEach((review) => {
      const copy = review.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      testimonialTrack.append(copy);
    });
    const cycleDistance = testimonialTrack.scrollWidth / 2;
    testimonialTrack.style.setProperty('--testimonial-cycle', `${Math.max(24, cycleDistance / 34)}s`);
    testimonialTrack.classList.add('is-looping');
  }
}
const productNav = document.querySelector('.product-nav');
if (navigation && productNav && !navigation.querySelector('.mobile-product-menu')) {
  const mobileMenu = document.createElement('section');
  mobileMenu.className = 'mobile-product-menu';
  mobileMenu.setAttribute('aria-label', 'Browse products');
  mobileMenu.innerHTML = '<h2 class="mobile-product-title">Categories</h2><a class="mobile-product-overview" href="categories.html"><span>All products</span><b class="mobile-product-count"></b></a><div class="mobile-product-links"></div><a class="mobile-quick-quote" href="' + (productNav.querySelector('.product-nav-event')?.getAttribute('href') || '#') + '">Event Coordination <span aria-hidden="true">&rarr;</span></a>';
  const overviewHref = productNav.querySelector('.product-nav-home')?.getAttribute('href');
  if (overviewHref) mobileMenu.querySelector('.mobile-product-overview').href = overviewHref;
  const links = mobileMenu.querySelector('.mobile-product-links');
  const categoryLabels = {
    books: 'Digital Offset Printing',
    business: 'Stationary Prints',
    packaging: 'Stationary Prints',
    gifts: 'Promotional & Corporate Gifts',
    invitations: 'Custom Gift and Brand Gift',
    signage: 'Printing & Advertising'
  };
  let productCount = 0;
  productNav.querySelectorAll('.product-nav-group').forEach((group) => {
    const heading = group.querySelector(':scope > a');
    const menu = group.querySelector(':scope > .product-nav-menu');
    if (!heading || !menu) return;
    const categoryKey = heading.getAttribute('href')?.match(/products\/([^/]+)\//)?.[1];
    const products = [...menu.querySelectorAll('a[href]')];
    const detail = document.createElement('details');
    detail.className = 'mobile-product-group';
    const summary = document.createElement('summary');
    summary.innerHTML = `<span>${categoryLabels[categoryKey] || heading.textContent.trim()}</span><span aria-hidden="true">⌄</span>`;
    detail.append(summary);
    const showAll = document.createElement('a');
    showAll.className = 'mobile-product-category';
    showAll.href = heading.getAttribute('href');
    showAll.innerHTML = `SHOW ALL ${products.length} <span aria-hidden="true">&rarr;</span>`;
    detail.append(showAll);
    products.forEach((product) => {
      const item = product.cloneNode(true);
      item.className = 'mobile-product-item';
      detail.append(item);
    });
    productCount += products.length;
    links.append(detail);
  });
  mobileMenu.querySelector('.mobile-product-count').textContent = `(${productCount})`;
  navigation.append(mobileMenu);
}
navigation?.querySelectorAll('a[href]').forEach((link) => {
  if (link.getAttribute('href') === currentPage) link.setAttribute('aria-current', 'page');
});

if (productNav) {
  productNav.querySelectorAll('.product-nav-group').forEach((group, index) => {
    const heading = group.querySelector(':scope > a');
    const menu = group.querySelector(':scope > .product-nav-menu');
    if (!heading || !menu) return;
    const caret = heading.querySelector('.product-nav-caret');
    if (!group.querySelector(':scope > .product-nav-toggle')) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'product-nav-toggle';
      toggle.setAttribute('aria-label', `Open ${heading.textContent.trim()} menu`);
      toggle.setAttribute('aria-expanded', 'false');
      menu.id ||= `product-nav-menu-${index + 1}`;
      toggle.setAttribute('aria-controls', menu.id);
      const icon = document.createElement('i');
      icon.className = 'product-nav-caret';
      icon.setAttribute('aria-hidden', 'true');
      toggle.append(icon);
      caret?.remove();
      group.append(toggle);
    }
  });

  const closeProductMenus = (except) => {
    productNav.querySelectorAll('.product-nav-group.is-open').forEach((group) => {
      if (group === except) return;
      group.classList.remove('is-open');
      group.querySelector('.product-nav-toggle')?.setAttribute('aria-expanded', 'false');
    });
  };

  productNav.querySelectorAll('.product-nav-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const group = toggle.closest('.product-nav-group');
      const shouldOpen = !group.classList.contains('is-open');
      closeProductMenus(group);
      group.classList.toggle('is-open', shouldOpen);
      toggle.setAttribute('aria-expanded', String(shouldOpen));
      toggle.setAttribute('aria-label', `${shouldOpen ? 'Close' : 'Open'} ${group.querySelector(':scope > a').textContent.trim()} menu`);
    });
  });

  document.addEventListener('click', (event) => {
    if (!productNav.contains(event.target)) closeProductMenus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openGroup = productNav.querySelector('.product-nav-group.is-open');
    if (!openGroup) return;
    closeProductMenus();
    openGroup.querySelector('.product-nav-toggle')?.focus();
  });
}
const heroBackground = document.querySelector('.hero-background-image');
if (heroBackground && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const heroSlides = ['img/6.png', 'img/5.png', 'img/2.png', 'img/1.png'];
  const slideAssets = heroSlides.map((source) => {
    const preload = new Image();
    const ready = new Promise((resolve) => {
      preload.onload = () => resolve(preload);
      preload.onerror = () => resolve(null);
    });
    preload.src = source;
    if (preload.complete && preload.naturalWidth) return Promise.resolve(preload);
    return ready;
  });
  let activeSlide = 0;
  const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
  const advanceHero = async () => {
    await wait(6500);
    const nextSlide = (activeSlide + 1) % heroSlides.length;
    const nextAsset = await slideAssets[nextSlide];
    if (!nextAsset) {
      advanceHero();
      return;
    }
    if (nextAsset.decode) await nextAsset.decode().catch(() => {});
    heroBackground.classList.add('is-changing');
    await wait(500);
    heroBackground.src = nextAsset.src;
    activeSlide = nextSlide;
    heroBackground.classList.remove('is-zooming');
    void heroBackground.offsetWidth;
    requestAnimationFrame(() => {
      heroBackground.classList.remove('is-changing');
      heroBackground.classList.add('is-zooming');
    });
    advanceHero();
  };
  advanceHero();
}

menuButton?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) {
      menuButton.setAttribute('aria-label', 'Open navigation');
    }
  });
});

const newsletterForm = document.querySelector('.newsletter form');
newsletterForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = newsletterForm.querySelector('input');
  const message = document.querySelector('.form-message');
  if (email?.checkValidity() && message) {
    message.textContent = 'Thanks for joining us. Watch your inbox!';
    newsletterForm.reset();
  }
});

const revealItems = document.querySelectorAll('.category-card,.product-card,.why-grid article,.showcase-item,.steps article,.detail-tile,.timeline article,.sign-service-card,.sign-project-card,.sign-faq-list details,.home-benefit,.home-category-card');
revealItems.forEach((item) => item.classList.add('motion-reveal'));
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const projectForm = document.querySelector('.project-form');
const signageEnquiryForm = document.querySelector('.sign-enquiry-form');

// Keep the dedicated navigation link as a page link. All other contact CTAs
// open the same accessible, in-page enquiry form.
const contactModal = document.createElement('dialog');
contactModal.className = 'contact-form-modal';
contactModal.setAttribute('aria-labelledby', 'contact-modal-title');
contactModal.setAttribute('aria-describedby', 'contact-modal-description');
contactModal.innerHTML = `
  <div class="contact-modal-panel">
    <button class="contact-modal-close" type="button" aria-label="Close contact form">&times;</button>
    <p class="contact-modal-eyebrow">LET'S MAKE IT REAL</p>
    <h2 id="contact-modal-title">Tell us what you’re<br><em>making.</em></h2>
    <p id="contact-modal-description" class="contact-modal-intro">Share a few details and our team can help you plan the right next step.</p>
    <div class="contact-modal-direct" aria-label="Direct contact details">
      <a href="tel:+971568258470">+971 56 825 8470</a>
      <a href="mailto:info@edenday.ae">info@edenday.ae</a>
      <span>Ajman, United Arab Emirates</span>
    </div>
    <form class="contact-modal-form" method="dialog">
      <input type="hidden" name="enquiry_source">
      <label>Your name<input name="name" autocomplete="name" required placeholder="How should we call you?"></label>
      <label>Email address<input type="email" name="email" autocomplete="email" required placeholder="you@company.com"></label>
      <label>Phone number<input type="tel" name="phone" autocomplete="tel" placeholder="+971 56 825 8470"></label>
      <label>Company<input name="company" autocomplete="organization" placeholder="Your brand or studio"></label>
      <label class="contact-modal-wide">What are you making?<select name="project" required><option value="" disabled selected>Choose a project type</option><option>Business cards &amp; marketing</option><option>Books &amp; documents</option><option>Packaging</option><option>Invitations &amp; cards</option><option>Gifts &amp; promotional items</option><option>Banners &amp; signage</option><option>Event coordination</option><option>Something else</option></select></label>
      <label class="contact-modal-wide">A little more about it<textarea name="details" rows="4" placeholder="Quantity, timing, finishes, ideas — whatever you know so far."></textarea></label>
      <button class="contact-modal-submit" type="submit">Send project enquiry <span aria-hidden="true">-&gt;</span></button>
      <p class="contact-modal-message" role="status" aria-live="polite"></p>
    </form>
  </div>`;
document.body.append(contactModal);

const successModal = document.createElement('dialog');
successModal.className = 'form-success-modal';
successModal.setAttribute('aria-labelledby', 'form-success-title');
successModal.setAttribute('aria-describedby', 'form-success-description');
successModal.innerHTML = `
  <div class="form-success-panel">
    <div class="form-success-icon" aria-hidden="true"><svg viewBox="0 0 52 52"><circle class="success-ring" cx="26" cy="26" r="23"/><path class="success-tick" d="m15 27 7 7 15-16"/></svg></div>
    <p class="form-success-eyebrow">MESSAGE RECEIVED</p>
    <h2 id="form-success-title">Thank You!</h2>
    <p id="form-success-description">Your Message Has Been Sent Successfully.</p>

  </div>`;
document.body.append(successModal);

let successCloseTimer = 0;
let successModalClosing = false;
const closeSuccessModal = () => {
  if (!successModal.open || successModalClosing) return;
  successModalClosing = true;
  successModal.classList.add('is-closing');
  const finishClose = () => { if (successModal.open) successModal.close(); };
  successModal.addEventListener('transitionend', (event) => {
    if (event.target === successModal && event.propertyName === 'opacity') finishClose();
  }, { once: true });
  window.setTimeout(finishClose, 420);
};
const showSuccessModal = (title = 'Thank You!', description = 'Your Message Has Been Sent Successfully.') => {
  window.clearTimeout(successCloseTimer);
  successModal.classList.remove('is-closing');
  successModalClosing = false;
  successModal.querySelector('#form-success-title').textContent = title;
  successModal.querySelector('#form-success-description').textContent = description;
  if (!successModal.open) successModal.showModal();
  successCloseTimer = window.setTimeout(closeSuccessModal, 5000);
};
successModal.addEventListener('close', () => {
  window.clearTimeout(successCloseTimer);
  successModalClosing = false;
  successModal.classList.remove('is-closing');
});
successModal.addEventListener('click', (event) => { if (event.target === successModal) closeSuccessModal(); });
successModal.addEventListener('cancel', (event) => { event.preventDefault(); closeSuccessModal(); });

const submitContactForm = (form) => {
  const message = form.querySelector('.project-form-message, .sign-form-message, .contact-modal-message');
  message?.classList.remove('form-submit-error');
  form.reset();
  if (message) message.textContent = '';
  if (contactModal.open) {
    closeContactModal();
    window.setTimeout(() => showSuccessModal(), 460);
  } else {
    showSuccessModal();
  }
  return true;
};
const bindContactForm = (form) => form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (form.reportValidity()) await submitContactForm(form);
});
bindContactForm(projectForm);
bindContactForm(signageEnquiryForm);

let contactModalScrollY = 0;
let contactModalPageStyles = null;
const lockPageAtCurrentScroll = () => {
  if (contactModalPageStyles) return;
  contactModalScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const body = document.body;
  contactModalPageStyles = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
    scrollBehavior: document.documentElement.style.scrollBehavior
  };
  const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  body.classList.add('contact-modal-page-locked');
  body.style.position = 'fixed';
  body.style.top = `-${contactModalScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overflow = 'hidden';
  if (scrollbarWidth) body.style.paddingRight = `${scrollbarWidth}px`;
};
const restorePageScroll = () => {
  if (!contactModalPageStyles) return;
  const body = document.body;
  const savedScrollY = contactModalScrollY;
  const savedStyles = contactModalPageStyles;
  contactModalPageStyles = null;
  body.classList.remove('contact-modal-page-locked');
  body.style.position = savedStyles.position;
  body.style.top = savedStyles.top;
  body.style.left = savedStyles.left;
  body.style.right = savedStyles.right;
  body.style.width = savedStyles.width;
  body.style.overflow = savedStyles.overflow;
  body.style.paddingRight = savedStyles.paddingRight;
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, savedScrollY);
  requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = savedStyles.scrollBehavior;
  });
};

let contactModalClosing = false;
const closeContactModal = () => {
  if (!contactModal.open || contactModalClosing) return;
  contactModalClosing = true;
  contactModal.classList.add('is-closing');
  const finishClose = () => {
    if (!contactModal.open) return;
    contactModal.close();
  };
  contactModal.addEventListener('transitionend', (event) => {
    if (event.target === contactModal && event.propertyName === 'opacity') finishClose();
  }, { once: true });
  window.setTimeout(finishClose, 440);
};
contactModal.addEventListener('close', () => {
  contactModalClosing = false;
  contactModal.classList.remove('is-closing');
  restorePageScroll();
});
contactModal.querySelector('.contact-modal-close')?.addEventListener('click', closeContactModal);
contactModal.addEventListener('click', (event) => {
  if (event.target === contactModal) closeContactModal();
});
contactModal.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeContactModal();
});
bindContactForm(contactModal.querySelector('.contact-modal-form'));

document.addEventListener('click', (event) => {
  const trigger = event.target instanceof Element ? event.target.closest('a[href], [data-contact-modal]') : null;
  if (!trigger || trigger.hasAttribute('data-no-contact-modal') || trigger.closest('.main-nav')) return;
  const href = trigger.getAttribute('href');
  if (!href) return;
  let destination;
  try { destination = new URL(href, window.location.href); } catch { return; }
  if (destination.origin !== window.location.origin || !/\/contact\.html$/i.test(destination.pathname)) return;
  event.preventDefault();
  const source = trigger.textContent.trim().replace(/\s+/g, ' ') || 'Website enquiry';
  const sourceField = contactModal.querySelector('[name="enquiry_source"]');
  if (sourceField) sourceField.value = source;
  contactModal.querySelector('.contact-modal-message').textContent = '';
  if (!contactModal.open) {
    lockPageAtCurrentScroll();
    contactModal.classList.remove('is-closing');
    contactModalClosing = false;
    contactModal.showModal();
  }
});






