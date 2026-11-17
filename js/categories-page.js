(() => {
  const catalog = window.paperPressProductCatalog || {};
  const categoryList = document.querySelector('[data-category-list]');
  const productGrid = document.querySelector('[data-product-grid]');
  if (!categoryList || !productGrid) return;

  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const products = Object.entries(catalog).flatMap(([key, category]) => category.products.map(([slug, name, description]) => ({
    key, slug, name, description, category: category.label,
    image: window.paperPressProductImages?.[`${key}/${slug}`] || category.image
  })));
  const priority = ['books/certificates','gifts/lanyards','business/stickers','business/brochures','packaging/soft-case-boxes','business/door-hangers','gifts/ramadan-products'];
  products.sort((a, b) => { const ai = priority.indexOf(a.key + '/' + a.slug); const bi = priority.indexOf(b.key + '/' + b.slug); return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi); });
  const categoryCounts = Object.fromEntries(Object.entries(catalog).map(([key, category]) => [key, category.products.length]));
  const initialCount = 9;
  let activeCategory = 'all';
  let searchTerm = '';
  let visibleCount = initialCount;

  document.querySelector('[data-all-count]').textContent = `(${products.length})`;
  categoryList.innerHTML = Object.entries(catalog).map(([key, category]) => `
    <details class="catalog-category">
      <summary><span>${esc(category.label)}</span><i aria-hidden="true"></i></summary>
      <button class="catalog-category-filter" type="button" data-category-filter="${esc(key)}">Show all ${categoryCounts[key]} <span aria-hidden="true">&rarr;</span></button>
      <div class="catalog-category-links">${category.products.map(([slug, name]) => `<a href="products/${key}/${slug}.html">${esc(name)}</a>`).join('')}</div>
    </details>`).join('');

  const matches = () => products.filter((product) => {
    const categoryMatch = activeCategory === 'all' || product.key === activeCategory;
    const textMatch = !searchTerm || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(searchTerm);
    return categoryMatch && textMatch;
  });

  const render = () => {
    const filtered = matches();
    const shown = filtered.slice(0, visibleCount);
    productGrid.innerHTML = shown.map((product, index) => `
      <article class="catalog-product-card">
        <div class="catalog-product-visual"><a class="catalog-product-image" href="products/${product.key}/${product.slug}.html" aria-label="View ${esc(product.name)}"><img src="img/${encodeURIComponent(product.image)}" alt="${esc(product.name)}"><span>${String(index + 1).padStart(2, '0')}</span></a><button class="catalog-favorite" type="button" aria-label="Save ${esc(product.name)}" aria-pressed="false">&#9829;</button></div>
        <div class="catalog-product-copy"><p>${esc(product.category)}</p><h3><a href="products/${product.key}/${product.slug}.html">${esc(product.name)}</a></h3><p class="catalog-product-description">${esc(product.description)}</p><a class="catalog-product-link" href="products/${product.key}/${product.slug}.html">Explore options <span aria-hidden="true">&rarr;</span></a></div>
      </article>`).join('');
    document.querySelector('.catalog-result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'}`;
    document.querySelector('.catalog-empty').hidden = filtered.length > 0;
    document.querySelector('.catalog-load-more').hidden = filtered.length <= visibleCount;
    document.querySelectorAll('[data-category-filter]').forEach((button) => {
      button.classList.toggle('active', button.dataset.categoryFilter === activeCategory);
    });
  };

  document.querySelectorAll('[data-category-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.categoryFilter;
      visibleCount = initialCount;
      render();
    });
  });

  document.querySelector('.catalog-search').addEventListener('input', (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    visibleCount = initialCount;
    render();
  });
  document.querySelector('.catalog-reset').addEventListener('click', () => {
    activeCategory = 'all';
    searchTerm = '';
    visibleCount = initialCount;
    document.querySelector('.catalog-search').value = '';
    document.querySelectorAll('.catalog-category[open]').forEach((details) => { details.open = false; });
    render();
  });
  const mobileFilter = document.querySelector('.catalog-mobile-filter');
  mobileFilter?.addEventListener('click', () => {
    const open = document.querySelector('.catalog-layout').classList.toggle('filters-open');
    mobileFilter.setAttribute('aria-expanded', String(open));
    mobileFilter.textContent = open ? 'Hide Filters' : 'Show Filters';
  });
  productGrid.addEventListener('click', (event) => {
    const favorite = event.target.closest('.catalog-favorite');
    if (!favorite) return;
    const saved = favorite.getAttribute('aria-pressed') !== 'true';
    favorite.setAttribute('aria-pressed', String(saved));
    favorite.classList.toggle('is-saved', saved);
  });  document.querySelector('.catalog-load-more').addEventListener('click', () => {
    visibleCount += initialCount;
    render();
  });
  render();
})();

