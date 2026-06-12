const FEATURED_IDS = ["1", "7", "5", "4"];
const SLIDE_INTERVAL_MS = 5500;


function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function getPage() {
  return document.body.dataset.page || "home";
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

function flowerById(id) {
  return flowers.find((flower) => flower.id === id);
}

function getFlowerOfTheDay() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - startOfYear) / 86400000);
  return flowers[dayOfYear % flowers.length];
}

function flowerMatchesQuery(flower, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    flower.name.toLowerCase().includes(normalized) ||
    flower.scientificName.toLowerCase().includes(normalized) ||
    flower.origin.toLowerCase().includes(normalized) ||
    flower.description.toLowerCase().includes(normalized) ||
    flower.properties.some((property) => property.toLowerCase().includes(normalized))
  );
}

function truncateText(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function populateSidebar() {
  const container = document.querySelector("[data-flower-nav]");
  if (!container) return;

  const heading = container.querySelector(".kicker")?.outerHTML || '<p class="kicker">Espécies A-Z</p>';
  const links = [...flowers]
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .map((flower) => `
      <a class="flower-link" href="flor.html?id=${encodeURIComponent(flower.id)}">
        <span>${escapeHtml(flower.name)}</span>
        <small>${escapeHtml(flower.scientificName)}</small>
      </a>
    `)
    .join("");

  container.innerHTML = `${heading}${links}`;
}

function bindSidebar() {
  const sidebar = document.querySelector("[data-sidebar]");
  const backdrop = document.querySelector(".backdrop");
  const tab = document.querySelector("[data-sidebar-toggle]");
  const closeButtons = document.querySelectorAll("[data-sidebar-close]");

  function setOpen(isOpen) {
    sidebar?.classList.toggle("open", isOpen);
    backdrop?.classList.toggle("show", isOpen);
    tab?.classList.toggle("open", isOpen);
  }

  tab?.addEventListener("click", () => setOpen(!sidebar?.classList.contains("open")));
  closeButtons.forEach((button) => button.addEventListener("click", () => setOpen(false)));
}

function bindGlobalSearch() {
  document.querySelectorAll("[data-global-search]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = new FormData(form).get("q")?.toString().trim() || "";
      const target = query ? `colecao.html?q=${encodeURIComponent(query)}` : "colecao.html";
      window.location.href = target;
    });
  });
}

function flowerCardTemplate(flower) {
  return `
    <a class="flower-card" href="flor.html?id=${encodeURIComponent(flower.id)}">
      <div class="card-image"><img src="${escapeHtml(flower.imageUrl)}" alt="${escapeHtml(flower.name)}" /></div>
      <div class="card-body">
        <h3>${escapeHtml(flower.name)}</h3>
        <div class="sci">${escapeHtml(flower.scientificName)}</div>
        <p class="muted line-clamp">${escapeHtml(flower.description)}</p>
        <div class="muted">⌖ ${escapeHtml(flower.origin)}</div>
      </div>
      <div class="card-accent"></div>
    </a>
  `;
}

function initHomePage() {
  renderDailyFlower();
  renderFeaturedSlideshow();
}

function renderDailyFlower() {
  const container = document.querySelector("[data-daily-flower]");
  if (!container) return;

  const flower = getFlowerOfTheDay();
  container.innerHTML = `
    <a class="daily" href="flor.html?id=${encodeURIComponent(flower.id)}">
      <div class="daily-copy">
        <p class="kicker" style="color:var(--flora-primary)">Flor do Dia</p>
        <h3>${escapeHtml(flower.name)}</h3>
        <p class="sci">${escapeHtml(flower.scientificName)}</p>
        <p>${escapeHtml(flower.description)}</p>
        <span class="white-btn">Ver detalhes →</span>
      </div>
      <div><img src="${escapeHtml(flower.imageUrl)}" alt="${escapeHtml(flower.name)}" /></div>
    </a>
  `;
}

function renderFeaturedSlideshow() {
  const container = document.querySelector("[data-featured-slideshow]");
  if (!container) return;

  const featuredFlowers = FEATURED_IDS.map(flowerById).filter(Boolean);
  let currentSlide = 0;

  container.innerHTML = `
    <div class="slideshow">
      <div class="slide-track">
        ${featuredFlowers.map(slideTemplate).join("")}
      </div>
      <button class="slide-control slide-prev" data-slide="prev" aria-label="Anterior">‹</button>
      <button class="slide-control slide-next" data-slide="next" aria-label="Próximo">›</button>
      <div class="dots"></div>
      <div class="counter"></div>
    </div>
  `;

  const track = container.querySelector(".slide-track");
  const dots = container.querySelector(".dots");
  const counter = container.querySelector(".counter");

  function showSlide(index) {
    currentSlide = (index + featuredFlowers.length) % featuredFlowers.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.innerHTML = featuredFlowers
      .map((_, dotIndex) => `<button class="dot ${dotIndex === currentSlide ? "active" : ""}" data-slide-to="${dotIndex}" aria-label="Slide ${dotIndex + 1}"></button>`)
      .join("");
    counter.textContent = `${currentSlide + 1} / ${featuredFlowers.length}`;
    dots.querySelectorAll("[data-slide-to]").forEach((button) => {
      button.addEventListener("click", () => showSlide(Number(button.dataset.slideTo)));
    });
  }

  container.querySelector('[data-slide="prev"]').addEventListener("click", () => showSlide(currentSlide - 1));
  container.querySelector('[data-slide="next"]').addEventListener("click", () => showSlide(currentSlide + 1));
  setInterval(() => showSlide(currentSlide + 1), SLIDE_INTERVAL_MS);
  showSlide(0);
}

function slideTemplate(flower) {
  return `
    <div class="slide" style="background-image:url('${escapeHtml(flower.imageUrl)}')">
      <div class="slide-content">
        <div>
          <p class="kicker" style="color:rgba(255,255,255,.55)">${escapeHtml(flower.origin)}</p>
          <h2>${escapeHtml(flower.name)}</h2>
          <p class="sci">${escapeHtml(flower.scientificName)}</p>
          <p>${escapeHtml(truncateText(flower.description, 140))}</p>
          <a class="white-btn" href="flor.html?id=${encodeURIComponent(flower.id)}">Ver detalhes</a>
        </div>
      </div>
    </div>
  `;
}

function initCollectionPage() {
  const input = document.getElementById("collectionSearch");
  const initialQuery = getQueryParam("q");
  if (input) input.value = initialQuery;
  renderCollection(initialQuery);

  input?.addEventListener("input", () => {
    const query = input.value;
    renderCollection(query);
    const nextUrl = query.trim() ? `colecao.html?q=${encodeURIComponent(query.trim())}` : "colecao.html";
    window.history.replaceState({}, "", nextUrl);
  });

  document.querySelectorAll("[data-clear-collection]").forEach((button) => {
    button.addEventListener("click", () => {
      if (input) input.value = "";
      renderCollection("");
      window.history.replaceState({}, "", "colecao.html");
      input?.focus();
    });
  });
}

function renderCollection(query) {
  const grid = document.querySelector("[data-collection-grid]");
  const count = document.querySelector("[data-results-count]");
  const empty = document.querySelector("[data-empty-results]");
  if (!grid || !count || !empty) return;

  const filtered = flowers.filter((flower) => flowerMatchesQuery(flower, query));
  grid.innerHTML = filtered.map(flowerCardTemplate).join("");
  grid.hidden = filtered.length === 0;
  empty.hidden = filtered.length > 0;
  count.textContent = `${filtered.length} ${filtered.length === 1 ? "espécie encontrada" : "espécies"}${query ? ` para "${query}"` : " catalogadas"}`;
}

function initFlowerPage() {
  const container = document.querySelector("[data-flower-detail]");
  if (!container) return;

  const flower = flowerById(getQueryParam("id"));
  if (!flower) {
    document.title = "Flor não encontrada | Flora Conceptus";
    container.innerHTML = `
      <section class="container empty">
        <h1>Flor não encontrada</h1>
        <p class="muted">Escolha uma espécie pela coleção ou pelo menu lateral.</p>
        <a class="outline-btn" href="colecao.html">Ver coleção</a>
      </section>
    `;
    return;
  }

  document.title = `${flower.name} | Flora Conceptus`;
  container.innerHTML = flowerDetailTemplate(flower);
}

function flowerDetailTemplate(flower) {
  return `
    <section class="detail-hero">
      <img src="${escapeHtml(flower.imageUrl)}" alt="${escapeHtml(flower.name)}" />
      <div>
        <p class="kicker">${escapeHtml(flower.origin)}</p>
        <h1>${escapeHtml(flower.name)}</h1>
        <p class="sci">${escapeHtml(flower.scientificName)}</p>
      </div>
    </section>

    <section class="detail-layout">
      <div class="detail-content">
        ${detailSectionTemplate("Descrição", flower.description)}
        ${detailSectionTemplate("Origem", flower.origin)}
        ${detailSectionTemplate("Época de Floração", flower.bloomingSeason)}
        ${pillSectionTemplate("Cores", flower.colors)}
        ${pillSectionTemplate("Propriedades", flower.properties, true)}
        ${detailSectionTemplate("Simbolismo", flower.symbolism)}
        ${detailSectionTemplate("História", flower.history)}
      </div>
    </section>
  `;
}

function detailSectionTemplate(label, value) {
  return `<section><p class="label">${label}</p><p class="muted">${escapeHtml(value)}</p></section>`;
}

function pillSectionTemplate(label, values, filled = false) {
  return `
    <section>
      <p class="label">${label}</p>
      <div class="pills">${values.map((value) => `<span class="pill ${filled ? "filled" : ""}">${escapeHtml(value)}</span>`).join("")}</div>
    </section>
  `;
}

function initAuthPage() {
  let mode = "login";
  const tabs = document.querySelectorAll("[data-auth-mode]");
  const signupOnly = document.querySelectorAll(".signup-only");
  const submit = document.querySelector("[data-auth-submit]");
  const switchLabel = document.querySelector("[data-auth-switch-label]");
  const switchButton = document.querySelector("[data-auth-switch]");
  const form = document.querySelector("[data-auth-form]");
  const error = document.querySelector("[data-auth-error]");
  const password = document.getElementById("password");

  function setMode(nextMode) {
    mode = nextMode;
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.authMode === mode));
    signupOnly.forEach((field) => field.hidden = mode !== "signup");
    submit.textContent = mode === "signup" ? "Criar conta" : "Entrar";
    switchLabel.textContent = mode === "signup" ? "Já tem uma conta?" : "Novo por aqui?";
    switchButton.textContent = mode === "signup" ? "Entrar" : "Crie sua conta";
    error.textContent = "";
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.authMode)));
  switchButton?.addEventListener("click", () => setMode(mode === "signup" ? "login" : "signup"));
  document.querySelector("[data-password-toggle]")?.addEventListener("click", () => {
    if (!password) return;
    password.type = password.type === "password" ? "text" : "password";
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("email")?.value.trim() || "";
    const name = document.getElementById("name")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const pass = password?.value || "";
    const validPassword = /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[^A-Za-z0-9]/.test(pass) && pass.length > 0 && pass.length <= 8;

    if (!email) return error.textContent = "Informe seu e-mail.";
    if (mode === "signup" && (!name || !phone)) return error.textContent = "Preencha todos os campos.";
    if (!validPassword) return error.textContent = "A senha não atende aos requisitos.";
    error.textContent = "Tudo certo. Esta versão estática não conecta a um backend.";
  });

  document.querySelector("[data-auth-success]")?.addEventListener("click", () => {
    error.textContent = "Login social não está conectado nesta versão estática.";
  });
}

function initPage() {
  populateSidebar();
  bindSidebar();
  bindGlobalSearch();

  const page = getPage();
  if (page === "home") initHomePage();
  if (page === "collection") initCollectionPage();
  if (page === "flower") initFlowerPage();
  if (page === "auth") initAuthPage();
}

initPage();
