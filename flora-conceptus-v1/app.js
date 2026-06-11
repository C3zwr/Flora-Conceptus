const FEATURED_IDS = ["1", "7", "5", "4"];
const SLIDE_INTERVAL_MS = 5500;

const continents = [
  { id: "na", name: "América do Norte", labelX: 200, labelY: 175, d: "M85,95 L130,80 L175,75 L215,72 L255,80 L295,90 L320,110 L335,135 L325,160 L305,180 L285,195 L295,215 L280,235 L260,245 L235,255 L210,265 L195,255 L185,235 L170,225 L155,235 L145,250 L135,240 L130,220 L120,200 L110,180 L95,160 L82,135 L78,115 Z M155,260 L175,275 L165,290 L150,285 Z" },
  { id: "sa", name: "América do Sul", labelX: 270, labelY: 380, d: "M245,275 L275,265 L300,275 L320,285 L335,310 L340,340 L335,375 L320,410 L300,440 L280,460 L260,465 L245,455 L235,430 L228,400 L222,365 L222,335 L228,305 Z" },
  { id: "eu", name: "Europa", labelX: 510, labelY: 130, d: "M440,80 L470,72 L505,68 L540,72 L575,78 L600,90 L605,108 L590,125 L575,140 L555,148 L535,158 L510,170 L485,178 L465,170 L445,160 L430,145 L425,125 L428,105 Z" },
  { id: "af", name: "África", labelX: 540, labelY: 320, d: "M465,190 L510,185 L555,188 L600,200 L625,225 L635,260 L625,295 L610,330 L595,365 L575,395 L555,420 L535,430 L515,425 L495,405 L478,375 L465,340 L455,305 L450,270 L450,235 L455,210 Z" },
  { id: "as", name: "Ásia", labelX: 770, labelY: 165, d: "M605,75 L660,68 L720,65 L775,68 L825,75 L870,85 L905,100 L925,125 L935,155 L920,185 L895,210 L860,230 L820,245 L775,255 L730,255 L690,245 L650,230 L620,210 L605,185 L595,160 L590,135 L592,110 L598,90 Z M850,255 L880,265 L905,280 L920,310 L900,335 L870,340 L845,325 L835,300 L840,275 Z" },
  { id: "oc", name: "Oceania", labelX: 855, labelY: 380, d: "M790,355 L830,345 L875,348 L910,360 L920,385 L905,410 L880,425 L845,430 L815,425 L790,410 L780,385 Z M925,395 L945,405 L935,420 L920,415 Z" },
];

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
      <aside class="detail-map">
        <div class="map-head"><p class="label">Distribuição Geográfica</p><p class="muted">Regiões onde a espécie ocorre estão destacadas.</p></div>
        <div class="map-wrap">${mapTemplate(flower.regions)}</div>
      </aside>
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

function mapTemplate(activeRegions) {
  return `
    <div class="map-box">
      <svg viewBox="0 0 1000 500">
        <rect width="1000" height="500" fill="var(--map-background)" />
        ${continents.map((continent) => {
          const active = activeRegions.includes(continent.id);
          return `
            <path d="${continent.d}" fill="${active ? "var(--flora-primary)" : "var(--muted)"}" stroke="${active ? "var(--flora-primary-dark)" : "var(--border)"}" stroke-width="${active ? 2 : 1}" opacity="${active ? 1 : 0.5}"><title>${continent.name}</title></path>
            <text x="${continent.labelX}" y="${continent.labelY}" text-anchor="middle" dominant-baseline="middle" font-size="15" fill="${active ? "#fff" : "var(--muted-foreground)"}">${continent.name}</text>
          `;
        }).join("")}
      </svg>
    </div>
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
