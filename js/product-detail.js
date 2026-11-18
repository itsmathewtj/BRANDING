(() => {
  const catalog = window.paperPressProductCatalog || {};
  const root = document.querySelector('[data-product-key]');
  if (!root) return;

  const [categoryKey, productSlug] = root.dataset.productKey.split('/');
  const category = catalog[categoryKey];
  const product = category?.products.find((item) => item[0] === productSlug);
  if (!category || !product) {
    root.innerHTML = '<main class="pd-not-found"><h1>Product not found</h1><a href="../../categories.html">Browse all categories</a></main>';
    return;
  }

  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const [slug, itemName, summary] = product;
  const params = new URLSearchParams(window.location.search);
  const variant = params.get('variant');
  const galleryRef = params.get('gallery')?.match(/^(\d+)-(\d+)$/);
  const galleryItem = galleryRef && window.paperPressProductGalleryData?.[slug]?.[Number(galleryRef[1])]?.items?.[Number(galleryRef[2])];
  const name = galleryItem?.name || (variant ? `${variant.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')} ${itemName}` : itemName);
  const rootPath = root.dataset.rootPath || '../../';
  const productImage = galleryItem ? { local: galleryItem.local, remote: `https://spog-api.spogprint.com${galleryItem.source}` } : window.paperPressProductVariantImages?.[`${categoryKey}/${slug}/${variant}`] || window.paperPressProductImages?.[`${categoryKey}/${slug}`] || { remote: `${rootPath}img/${encodeURIComponent(category.image)}`, local: category.image };
  const sourceGroups = window.paperPressProductGalleryData?.[slug] || [];
  const selectedGroup = galleryRef ? sourceGroups[Number(galleryRef[1])] : null;
  const selectedGroupItems = selectedGroup?.items || [];
  const sameGroupViews = selectedGroup ? (selectedGroup.mode === 'gallery' && selectedGroupItems.length > 1 ? selectedGroupItems : [galleryItem].filter(Boolean)) : [];
  const categoryViews = galleryRef ? [] : sourceGroups.flatMap((group) => group.items || []);
  const imageHashes = window.paperPressProductImageHashes || {};
  const galleryImages = [productImage, ...(sameGroupViews.length ? sameGroupViews : categoryViews)]
    .filter((image, index, all) => image?.local && all.findIndex((candidate) => candidate?.local === image.local || (imageHashes[candidate?.local] && imageHashes[candidate.local] === imageHashes[image.local])) === index)
    .slice(0, 5);
  const categoryGroups = Object.entries(catalog);
  const productHref = (key, item) => `${rootPath}products/${key}/${item[0]}.html`;
  const navGroups = categoryGroups.map(([key, group]) => `<div class="product-nav-group"><a href="${rootPath}products/${key}/index.html">${esc(group.menu)} <i class="product-nav-caret" aria-hidden="true"></i></a><div class="product-nav-menu"><div class="product-menu-heading"><strong>${esc(group.label)}</strong><small>${esc(group.short)}</small></div>${group.products.map((item) => `<a href="${productHref(key, item)}">${esc(item[1])}</a>`).join('')}</div></div>`).join('');

  document.title = `${name} printing in Dubai | Paper & Press`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', `${summary} Custom print by Paper & Press in Dubai, delivered across the UAE.`);

  const header = `<div class="announcement"><span>Dubai made, UAE delivered</span><span>Premium print, thoughtfully produced -&gt;</span></div><header class="site-header"><a class="brand" href="${rootPath}index.html" aria-label="Paper and Press home"><img class="brand-logo" src="${rootPath}img/Logo.png" alt="Paper &amp; Press"></a><button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"></button><nav class="main-nav" aria-label="Main navigation"><a href="${rootPath}index.html">Home</a><a href="${rootPath}about.html">About us</a><div class="nav-dropdown"><a href="${rootPath}categories.html">Services <span class="nav-caret">&#8964;</span></a><div class="nav-submenu"><a href="${rootPath}products/books/index.html">Print &amp; publications</a><a href="${rootPath}products/packaging/index.html">Packaging &amp; labels</a><a href="${rootPath}products/invitations/index.html">Invitations &amp; gifts</a></div></div><a href="${rootPath}work.html">Projects</a><a href="${rootPath}contact.html">Contact us</a><div class="nav-dropdown all-categories-dropdown"><a class="all-categories-button" href="${rootPath}categories.html" aria-haspopup="true"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="12" y="2" width="6" height="6" rx="1"/><rect x="2" y="12" width="6" height="6" rx="1"/><rect x="12" y="12" width="6" height="6" rx="1"/></svg><span>All Categories</span><i class="all-categories-caret" aria-hidden="true"></i></a><div class="nav-submenu all-categories-menu">${categoryGroups.map(([key, group]) => `<a href="${rootPath}products/${key}/index.html">${esc(group.label)}</a>`).join('')}</div></div></nav><div class="locale-indicator" aria-label="United Arab Emirates"><span class="uae-flag" aria-hidden="true"></span><span>UAE</span></div><a class="button button-dark header-cta" href="${rootPath}contact.html">Get a quote</a></header><nav class="product-nav" aria-label="Product categories"><a class="product-nav-home" href="${rootPath}categories.html">Products</a>${navGroups}<a class="product-nav-event" href="${rootPath}event-coordination.html">Event Coordination</a></nav>`;

  const related = category.products.filter((item) => item[0] !== slug).slice(0, 4);
  const relatedMarkup = related.map((item, index) => `<a class="pd-related-card" href="${productHref(categoryKey, item)}"><span>${String(index + 1).padStart(2, '0')} / ${esc(category.short)}</span><strong>${esc(item[1])}</strong><i aria-hidden="true">-&gt;</i></a>`).join('');
  const thumbMarkup = galleryImages.map((view, index) => `<button class="pd-gallery-thumb${index === 0 ? ' is-active' : ''}" type="button" data-view="${index}" data-local="${rootPath}img/${view.local}" data-fallback="${view.remote || ''}" data-label="${esc(galleryItem?.name || itemName)}" aria-label="View ${index + 1} of ${galleryImages.length} ${esc(galleryItem?.name || itemName)} images"><img src="${rootPath}img/${view.local}"${view.remote ? ` data-fallback="${view.remote}" onerror="this.onerror=null;this.src=this.dataset.fallback"` : ''} alt=""></button>`).join('');
  const faqItems = [
    [`What options are available for ${name.toLowerCase()}?`, `Options depend on the intended use, quantity and artwork. We can discuss available sizes, materials, print coverage and finishing before preparing a quote.`],
    ['Can you help prepare artwork for print?', 'Yes. Share your file or early concept and our team can advise on artwork setup and the next steps for print approval.'],
    ['Can I review a proof before production?', 'We share an artwork proof for your review. Production starts after you approve the final details.'],
    ['Do you deliver across the UAE?', 'Yes. We arrange delivery across the Emirates. Share your delivery location and required date so we can confirm the options for your order.']
  ];

  root.innerHTML = `${header}<main class="pd-main"><nav class="pd-breadcrumb" aria-label="Breadcrumb"><a href="${rootPath}index.html">Home</a><span>/</span><a href="${rootPath}products/${categoryKey}/index.html">${esc(category.label)}</a><span>/</span><span>${esc(name)}</span></nav><section class="pd-hero"><div class="pd-hero-copy"><p class="pd-eyebrow">${esc(category.short)} <i aria-hidden="true">*</i> MADE IN DUBAI</p><h1>${esc(name)}<br><em>made personal.</em></h1><p>${esc(summary)} ${esc(category.intro)}</p><ul><li><b>01</b> Made around your brief</li><li><b>02</b> Carefully finished</li><li><b>03</b> Delivered across the UAE</li></ul><a class="pd-primary-link" href="${rootPath}contact.html">GET A QUOTE <span>-&gt;</span></a></div><div class="pd-hero-visual"><img src="${rootPath}img/${productImage.local}" data-fallback="${productImage.remote}" onerror="this.onerror=null;this.src=this.dataset.fallback" alt="${esc(name)} print example"><div class="pd-visual-glass"><span>MADE FOR YOUR BRAND</span><b>${esc(name)}</b><small>FORMAT / PAPER / FINISH</small></div><div class="pd-visual-index">P&amp;P / ${esc(category.short)}</div></div></section>${relatedMarkup ? `<section class="pd-related"><div class="pd-section-heading"><p class="pd-eyebrow">EXPLORE MORE</p><h2>More from <em>${esc(category.label)}.</em></h2></div><div class="pd-related-grid">${relatedMarkup}</div></section>` : ''}<section class="pd-final-cta"><p class="pd-eyebrow">READY WHEN YOU ARE</p><h2>Let us make your<br><em>${esc(name.toLowerCase())} work.</em></h2><p>Share your idea and we will come back with useful questions, options and a quote for your brief.</p><a class="pd-primary-link" href="${rootPath}contact.html">START A CONVERSATION <span>-&gt;</span></a></section></main><footer class="footer"><div class="footer-main"><div><h4>PRODUCTS</h4>${categoryGroups.map(([key, group]) => `<a href="${rootPath}products/${key}/index.html">${esc(group.label)}</a>`).join('')}</div><div><h4>QUICK LINKS</h4><a href="${rootPath}index.html#home-about">About the studio</a><a href="${rootPath}work.html">Our work</a><a href="${rootPath}process.html">Order process</a><a href="${rootPath}index.html#faqs">Frequently asked questions</a></div><div><h4>INFORMATION</h4><a href="${rootPath}about.html">Our story</a><a href="${rootPath}categories.html">Browse all products</a><a href="${rootPath}index.html#home-our-work">Selected projects</a><a href="${rootPath}index.html#order-process">How to order</a></div><div><h4>HELP &amp; SUPPORT</h4><a href="${rootPath}contact.html">Get a quote</a><a href="${rootPath}contact.html">Artwork assistance</a><a href="${rootPath}contact.html">Delivery enquiries</a><a href="mailto:hello@paperandpress.ae">Email our team</a></div><div><h4>CONTACT</h4><a href="tel:+971561998490">+971 56 199 8490</a><a href="tel:+97143393800">+971 4 339 3800</a><a href="mailto:hello@paperandpress.ae">hello@paperandpress.ae</a><p>Office 46, Al Bahar Building,<br>Salah Al Din Street, Dubai, UAE</p></div></div><div class="footer-contact-panel"><div class="footer-panel-brand"><a class="brand brand-footer" href="${rootPath}index.html" aria-label="Paper and Press home"><img class="brand-logo" src="${rootPath}img/Logo.png" alt="Paper &amp; Press"></a><p>Good ideas deserve<br>good things to hold.</p><div class="socials"><a href="${rootPath}contact.html" aria-label="Instagram">ig</a><a href="${rootPath}contact.html" aria-label="LinkedIn">in</a><a href="${rootPath}work.html" aria-label="Our work">-&gt;</a></div></div><div class="footer-panel-note"><span>MADE WITH CARE IN DUBAI</span><p>Trusted by brands across the UAE to make thoughtful print, packaging and paper goods.</p></div><div class="newsletter"><label for="newsletter-email">NOTES FROM THE STUDIO</label><p>Occasional ideas, new work and print inspiration.</p><form><input id="newsletter-email" type="email" placeholder="Your email address" required><button aria-label="Subscribe">-&gt;</button></form><small class="form-message" aria-live="polite"></small></div></div><div class="footer-bottom"><span>Copyright 2026 Paper &amp; Press Studio. Made with care in Dubai.</span><div><a href="${rootPath}contact.html">Contact</a><a href="${rootPath}index.html#faqs">FAQs</a><a href="${rootPath}index.html">Back to top</a></div><span>GOOD PAPER. GOOD PEOPLE.</span></div></footer>`;

  const gallery = `<section class="pd-product-showcase" aria-label="${esc(name)} product details"><div class="pd-gallery"><div class="pd-gallery-frame"><img class="pd-gallery-main" src="${rootPath}img/${productImage.local}" data-fallback="${productImage.remote}" onerror="this.onerror=null;this.src=this.dataset.fallback" alt="${esc(name)} product photo"><button class="pd-gallery-favorite" type="button" aria-label="Save ${esc(name)}" aria-pressed="false">&#9829;</button><button class="pd-gallery-zoom" type="button" aria-label="Enlarge product image">+</button></div>${galleryImages.length > 1 ? `<div class="pd-gallery-thumbs" role="group" aria-label="Other ${esc(name)} product images">${thumbMarkup}</div>` : ''}</div><div class="pd-product-copy"><p class="pd-eyebrow">${esc(category.label)} / MADE IN DUBAI</p><h1>${esc(name)}</h1><p class="pd-product-description">${esc(summary)} ${esc(category.intro)}</p><p class="pd-product-detail">From artwork and material choices to finishing and delivery, we will help you shape the right version for your brand and project.</p><div class="pd-product-tags"><span>Made to order</span><span>Custom options</span><span>UAE delivery</span></div><div class="pd-product-actions"><a class="pd-action-quote" href="${rootPath}contact.html">Get a quote</a><a class="pd-action-chat" href="https://wa.me/971561998490?text=${encodeURIComponent(`Hello Paper & Press, I would like a quote for ${name}.`)}" target="_blank" rel="noopener">Chat on WhatsApp</a></div><p class="pd-response-note">Share your quantity and timeline and our team will help with the next step.</p></div></section>`;
  root.querySelector('.pd-breadcrumb')?.insertAdjacentHTML('afterend', gallery);
  root.querySelector('.pd-hero')?.remove();
  const mainImage = root.querySelector('.pd-gallery-main');
  const galleryFrame = root.querySelector('.pd-gallery-frame');
  let zoomPinned = false;
  galleryFrame?.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const bounds = galleryFrame.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    mainImage.style.transformOrigin = `${x}% ${y}%`;
    galleryFrame.classList.add('is-zoomed');
  });
  galleryFrame?.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'touch' || zoomPinned) return;
    galleryFrame.classList.remove('is-zoomed');
    mainImage.style.transformOrigin = '50% 50%';
  });
  root.querySelectorAll('.pd-gallery-thumb').forEach((thumb) => thumb.addEventListener('click', () => {
    root.querySelector('.pd-gallery-thumb.is-active')?.classList.remove('is-active');
    thumb.classList.add('is-active');
    mainImage.src = thumb.dataset.local;
    mainImage.onerror = thumb.dataset.fallback ? () => { mainImage.onerror = null; mainImage.src = thumb.dataset.fallback; } : null;
    mainImage.style.filter = 'none';
    mainImage.alt = `${thumb.dataset.label} product image ${Number(thumb.dataset.view) + 1}`;
  }));
  root.querySelector('.pd-gallery-favorite')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const saved = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', saved ? `Remove ${name} from saved products` : `Save ${name}`);
  });
  root.querySelector('.pd-gallery-zoom')?.addEventListener('click', () => {
    zoomPinned = !zoomPinned;
    galleryFrame?.classList.toggle('is-zoomed', zoomPinned);
    if (!zoomPinned) mainImage.style.transformOrigin = '50% 50%';
  });
})();
