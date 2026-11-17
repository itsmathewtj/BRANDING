const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');const currentPage = location.pathname.split('/').pop() || 'index.html';
const productNav = document.querySelector('.product-nav');
if (navigation && productNav && !navigation.querySelector('.mobile-product-menu')) {
  const mobileMenu = document.createElement('section');
  mobileMenu.className = 'mobile-product-menu';
  mobileMenu.setAttribute('aria-label', 'Browse products');
  mobileMenu.innerHTML = '<div class="mobile-product-links"></div><a class="mobile-quick-quote" href="' + (productNav.querySelector('.product-nav-quote')?.getAttribute('href') || '#') + '">Quick Quote <span aria-hidden="true">&rarr;</span></a>';
  const links = mobileMenu.querySelector('.mobile-product-links');
  const productsLink = productNav.querySelector('.product-nav-home');
  if (productsLink) {
    const link = productsLink.cloneNode(true);
    link.className = 'mobile-product-link';
    links.append(link);
  }
  productNav.querySelectorAll('.product-nav-group').forEach((group) => {
    const heading = group.querySelector(':scope > a');
    if (!heading) return;
    const categoryLink = heading.cloneNode(true);
    categoryLink.className = 'mobile-product-link';
    categoryLink.querySelector('.product-nav-caret')?.remove();
    links.append(categoryLink);
  });
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
  const heroSlides = ['img/1.png', 'img/2.png', 'img/3.png', 'img/4.png', 'img/5.png', 'img/6.png'];
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
projectForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = document.querySelector('.project-form-message');
  if (message) message.textContent = 'Thanks  -  your project details are ready. Connect this form to your inbox to receive submissions.';
});

const signageEnquiryForm = document.querySelector('.sign-enquiry-form');
signageEnquiryForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = document.querySelector('.sign-form-message');
  if (message) message.textContent = 'Thanks  -  this demo form is ready to connect to your inbox or form service.';
});






