/*
 * Beauty Moments — Shop (Snipcart Test-Modus)
 * ------------------------------------------------------------------
 * Storefront (Grid + Detail-Quick-View) wird hier gerendert. Warenkorb &
 * Checkout übernimmt SNIPCART (echter Test-Modus). Die sichtbaren
 * "In den Warenkorb"-Buttons lösen die passende statische
 * .snipcart-add-item-Definition aus shop.html aus (#def-<id>) — so gibt es
 * keine doppelten Preis-/ID-Angaben und der Snipcart-Crawler kann die Preise
 * gegen das rohe HTML validieren.
 *
 * Hinweis: Die Crawler-Validierung funktioniert nur über die öffentliche URL
 * (beautymoments.de/shop.html). Lokal (localhost) kann Snipcart die Produkt-
 * URL nicht erreichen — der echte Add-to-Cart-Test läuft erst nach Deploy.
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Produktdaten — Preise/IDs müssen mit den #def-Buttons in shop.html
   * übereinstimmen.
   * ------------------------------------------------------------------ */
  const PRODUCTS = [
    {
      id: "gesichtsserum",
      name: "Aufbauendes Gesichtsserum",
      subtitle: "Hyaluron & Niacinamid · 30 ml",
      price: 39.9,
      basePrice: "133,00 € / 100 ml",
      shape: "dropper",
      tint: "#7d8b6a",
      shippable: true,
      category: "Gesichtspflege",
      short: "Intensive Feuchtigkeit und ein ebenmäßiges Hautbild — leicht, schnell einziehend.",
      description:
        "Ein hochkonzentriertes Serum mit Hyaluronsäure in zwei Molekülgrößen und 5 % Niacinamid. " +
        "Spendet langanhaltende Feuchtigkeit, verfeinert das Hautbild und unterstützt die hauteigene " +
        "Schutzbarriere. Morgens und abends auf die gereinigte Haut auftragen, vor der Pflegecreme.",
      reviews: [
        { name: "Sabrina K.", rating: 5, date: "März 2026", text: "Meine Haut fühlt sich morgens viel praller an. Zieht super ein, kein Kleben." },
        { name: "Melanie R.", rating: 5, date: "Februar 2026", text: "Von Cindy empfohlen — nach drei Wochen deutlich gleichmäßigerer Teint." },
        { name: "Jana P.", rating: 4, date: "Januar 2026", text: "Tolles Serum, der Tropfer könnte etwas größer sein." }
      ],
      related: ["nachtcreme", "reinigungsmilch", "mizellen-tonic"]
    },
    {
      id: "reinigungsmilch",
      name: "Sanfte Reinigungsmilch",
      subtitle: "für jeden Hauttyp · 150 ml",
      price: 24.9,
      basePrice: "16,60 € / 100 ml",
      shape: "bottle",
      tint: "#b9c4a8",
      shippable: true,
      category: "Reinigung",
      short: "Löst Make-up und Unreinheiten, ohne die Haut auszutrocknen.",
      description:
        "Eine cremige Reinigungsmilch mit Mandelöl und Panthenol. Entfernt Make-up und Talg gründlich " +
        "und hinterlässt ein angenehm weiches Hautgefühl — auch für empfindliche Haut geeignet. " +
        "Morgens und abends mit lauwarmem Wasser anwenden.",
      reviews: [
        { name: "Carolin B.", rating: 5, date: "März 2026", text: "Endlich eine Reinigung, die nicht spannt. Riecht dezent angenehm." },
        { name: "Nadine S.", rating: 4, date: "Februar 2026", text: "Sehr ergiebig, ein Pumpstoß reicht fürs ganze Gesicht." }
      ],
      related: ["mizellen-tonic", "gesichtsserum", "nachtcreme"]
    },
    {
      id: "nachtcreme",
      name: "Regenerierende Nachtcreme",
      subtitle: "reichhaltig · 50 ml",
      price: 44.9,
      basePrice: "89,80 € / 100 ml",
      shape: "jar",
      tint: "#5f6d4e",
      shippable: true,
      category: "Gesichtspflege",
      short: "Nährt die Haut über Nacht und unterstützt die Regeneration.",
      description:
        "Eine reichhaltige Nachtpflege mit Sheabutter, Squalan und Vitamin E. Versorgt trockene und " +
        "beanspruchte Haut intensiv und unterstützt die nächtliche Zellregeneration. Abends als letzten " +
        "Schritt der Pflegeroutine auftragen.",
      reviews: [
        { name: "Petra L.", rating: 5, date: "April 2026", text: "Wache mit richtig geschmeidiger Haut auf. Ein kleiner Tupfer genügt." },
        { name: "Heike M.", rating: 5, date: "März 2026", text: "Perfekt für meine trockene Winterhaut." },
        { name: "Tanja W.", rating: 4, date: "Februar 2026", text: "Reichhaltig — abends top, mir morgens zu schwer (ist ja aber Nachtcreme)." }
      ],
      related: ["gesichtsserum", "reinigungsmilch", "headspa-oel"]
    },
    {
      id: "mizellen-tonic",
      name: "Mizellen-Tonic",
      subtitle: "klärend & beruhigend · 200 ml",
      price: 19.9,
      basePrice: "9,95 € / 100 ml",
      shape: "bottle",
      tint: "#9fae8a",
      shippable: true,
      category: "Reinigung",
      short: "Erfrischt, klärt und bereitet die Haut auf die Pflege vor.",
      description:
        "Ein alkoholfreies Gesichtswasser mit Mizellen-Technologie und Aloe Vera. Entfernt letzte " +
        "Rückstände nach der Reinigung, spendet Frische und beruhigt die Haut. Mit einem Wattepad " +
        "sanft über Gesicht und Hals führen.",
      reviews: [
        { name: "Lisa F.", rating: 5, date: "März 2026", text: "Mild und erfrischend, brennt überhaupt nicht in den Augen." },
        { name: "Anja D.", rating: 4, date: "Januar 2026", text: "Gutes Preis-Leistungs-Verhältnis, große Flasche." }
      ],
      related: ["reinigungsmilch", "gesichtsserum", "nachtcreme"]
    },
    {
      id: "lashbrow-serum",
      name: "Lash & Brow Serum",
      subtitle: "für Wimpern & Brauen · 5 ml",
      price: 34.9,
      basePrice: "698,00 € / 100 ml",
      shape: "dropper",
      tint: "#c9a86a",
      shippable: true,
      category: "Lash & Brow",
      short: "Kräftigt und pflegt Wimpern und Augenbrauen sichtbar.",
      description:
        "Ein pflegendes Serum mit Peptiden und Panthenol für volleres, kräftiger wirkendes Wimpern- und " +
        "Brauenhaar. Einmal täglich abends mit dem feinen Pinsel am Wimpernkranz bzw. an den Brauen " +
        "auftragen. Erste Ergebnisse meist nach 4–6 Wochen sichtbar.",
      reviews: [
        { name: "Vanessa H.", rating: 5, date: "April 2026", text: "Nach 6 Wochen merklich dichtere Wimpern. Bin begeistert!" },
        { name: "Sandra G.", rating: 4, date: "Februar 2026", text: "Braucht Geduld, aber es wirkt. Pinsel ist angenehm fein." }
      ],
      related: ["gesichtsserum", "nachtcreme", "lash-lifting-kurs"]
    },
    {
      id: "headspa-oel",
      name: "Headspa Kopfhaut-Öl",
      subtitle: "beruhigend · 100 ml",
      price: 29.9,
      basePrice: "29,90 € / 100 ml",
      shape: "bottle",
      tint: "#8a9b76",
      shippable: true,
      category: "Headspa",
      short: "Das Wohlfühl-Ritual aus dem Studio für zuhause.",
      description:
        "Ein leichtes Pflegeöl mit Jojoba und Rosmarin für die Kopfhautmassage zwischen den Headspa-" +
        "Terminen. Beruhigt, pflegt die Kopfhaut und sorgt für ein entspanntes Ritual. In die trockene " +
        "Kopfhaut einmassieren, einwirken lassen, anschließend auswaschen.",
      reviews: [
        { name: "Miriam T.", rating: 5, date: "März 2026", text: "Erinnert mich ans Studio — herrlich entspannend am Abend." },
        { name: "Kerstin V.", rating: 5, date: "Januar 2026", text: "Riecht wunderbar und meine Kopfhaut ist viel ruhiger." }
      ],
      related: ["nachtcreme", "reinigungsmilch", "gutschein"]
    },
    {
      id: "pflege-guide",
      name: "Hautpflege-Guide für Zuhause",
      subtitle: "digitaler Download · PDF",
      price: 9.9,
      basePrice: null,
      shape: "book",
      tint: "#6b6258",
      shippable: false,
      category: "Digital",
      short: "Cindys Routine-Empfehlungen als kompaktes E-Book (sofort verfügbar).",
      description:
        "Ein 28-seitiger digitaler Guide mit Cindys Empfehlungen für die tägliche Hautpflege-Routine, " +
        "Hauttyp-Bestimmung und saisonalen Tipps. Nach dem Kauf sofort als PDF verfügbar — kein Versand. " +
        "(In der echten Version per Download-Link nach Zahlung.)",
      reviews: [
        { name: "Franziska N.", rating: 5, date: "April 2026", text: "Super verständlich erklärt, endlich eine Routine die ich durchhalte." }
      ],
      related: ["gesichtsserum", "reinigungsmilch", "gutschein"]
    },
    {
      id: "lash-lifting-kurs",
      name: "Lash-Lifting Basiskurs",
      subtitle: "Tagesseminar in Schorndorf",
      price: 249.0,
      basePrice: null,
      shape: "course",
      tint: "#7d8b6a",
      shippable: false,
      category: "Ausbildung",
      short: "Lerne das Lash-Lifting von Grund auf — kleine Gruppen, inkl. Material.",
      description:
        "Ein eintägiges Praxisseminar für Einsteiger:innen: Theorie, Sicherheit, Schritt-für-Schritt-" +
        "Technik und Übung am Modell. Inklusive Arbeitsmaterial, Skript und Teilnahmezertifikat. " +
        "Maximal 4 Teilnehmerinnen pro Termin für intensive Betreuung.",
      variant: {
        label: "Termin",
        options: [
          { value: "Sa, 11. Juli 2026", label: "Sa, 11. Juli 2026 (noch 2 Plätze)" },
          { value: "Sa, 22. August 2026", label: "Sa, 22. August 2026" },
          { value: "Sa, 19. September 2026", label: "Sa, 19. September 2026" }
        ]
      },
      reviews: [
        { name: "Denise K.", rating: 5, date: "Mai 2026", text: "Sehr persönlich durch die kleine Gruppe. Cindy erklärt mit viel Geduld." },
        { name: "Aylin C.", rating: 5, date: "April 2026", text: "Praxisanteil war top, hab mich danach direkt sicher gefühlt." }
      ],
      related: ["lashbrow-serum", "gutschein", "gesichtsserum"]
    },
    {
      id: "gutschein",
      name: "Wertgutschein",
      subtitle: "für Behandlungen & Produkte",
      price: 50.0,
      basePrice: null,
      shape: "voucher",
      tint: "#d98a4f",
      shippable: false,
      category: "Gutschein",
      short: "Das perfekte Geschenk — einlösbar in beiden Studios.",
      description:
        "Ein Wertgutschein für Beauty Moments, einlösbar für Behandlungen und Produkte in Schorndorf " +
        "und Schwäbisch Gmünd. Nach dem Kauf als hübsches PDF zum Ausdrucken oder Verschenken " +
        "(in der echten Version per E-Mail). Wähle den gewünschten Wert.",
      variant: {
        label: "Wert",
        options: [
          { value: "50 €", label: "50 €", price: 50 },
          { value: "100 €", label: "100 €", price: 100 },
          { value: "150 €", label: "150 €", price: 150 }
        ]
      },
      reviews: [
        { name: "Stefanie B.", rating: 5, date: "März 2026", text: "Hab ihn meiner Schwester geschenkt — kam super an." }
      ],
      related: ["pflege-guide", "headspa-oel", "lash-lifting-kurs"]
    }
  ];

  const byId = (id) => PRODUCTS.find((p) => p.id === id);

  /* ------------------------------------------------------------------ *
   * Helfer
   * ------------------------------------------------------------------ */
  const euro = (n) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  // Preis je nach gewählter Variante (Gutschein nutzt den Wert als Preis)
  function unitPrice(p, optValue) {
    if (p.variant && optValue != null) {
      const opt = p.variant.options.find((o) => String(o.value) === String(optValue));
      if (opt && typeof opt.price === "number") return opt.price;
    }
    return p.price;
  }

  const stars = (n) => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);

  /* ------------------------------------------------------------------ *
   * Snipcart-Anbindung: sichtbarer Button löst die statische
   * #def-<id>-Definition aus (setzt vorher Menge + Variante).
   * ------------------------------------------------------------------ */
  function snipcartAdd(productId, opts) {
    opts = opts || {};
    const def = document.getElementById("def-" + productId);
    if (!def) { console.warn("Snipcart-Definition fehlt für", productId); return; }
    def.setAttribute("data-item-quantity", String(opts.quantity || 1));
    const p = byId(productId);
    if (p && p.variant && opts.variantValue != null) {
      def.setAttribute("data-item-custom1-value", opts.variantValue);
    }
    // Snipcart fängt den Klick auf .snipcart-add-item ab. Snipcart lädt async;
    // ist es noch nicht bereit, holen wir den Klick beim ready-Event nach.
    if (window.Snipcart) {
      def.click();
    } else {
      document.addEventListener(
        "snipcart.ready",
        function once() {
          document.removeEventListener("snipcart.ready", once);
          def.click();
        },
        { once: true }
      );
    }
  }

  /* ------------------------------------------------------------------ *
   * SVG-Bildgenerator — elegante Produkt-Visuals (mehrere Ansichten für
   * die Galerie), ohne externe Bilddateien.
   * ------------------------------------------------------------------ */
  function productImage(p, view) {
    view = view || 0;
    const ink = "#2c2824";
    const tint = p.tint;
    const shift = view === 1 ? 16 : view === 2 ? -10 : 0;
    const scale = view === 2 ? 1.18 : 1;
    const rot = view === 1 ? -4 : 0;
    const label = esc(p.name.split(" ").slice(0, 2).join(" "));

    const shapes = {
      bottle: `
        <rect x="165" y="150" width="70" height="175" rx="16" fill="#fff" stroke="${ink}" stroke-width="2"/>
        <rect x="182" y="120" width="36" height="36" rx="6" fill="${tint}"/>
        <rect x="165" y="215" width="70" height="78" rx="4" fill="${tint}" opacity="0.16"/>
        <text x="200" y="262" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="${ink}">${label}</text>`,
      dropper: `
        <rect x="170" y="170" width="60" height="150" rx="14" fill="#fff" stroke="${ink}" stroke-width="2"/>
        <rect x="186" y="118" width="28" height="20" rx="4" fill="${tint}"/>
        <rect x="190" y="136" width="20" height="40" rx="3" fill="${tint}" opacity="0.5"/>
        <rect x="170" y="225" width="60" height="66" rx="4" fill="${tint}" opacity="0.16"/>
        <text x="200" y="266" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="${ink}">${label}</text>`,
      jar: `
        <rect x="138" y="205" width="124" height="110" rx="20" fill="#fff" stroke="${ink}" stroke-width="2"/>
        <rect x="128" y="172" width="144" height="44" rx="14" fill="${tint}"/>
        <text x="200" y="270" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="${ink}">${label}</text>`,
      book: `
        <rect x="150" y="150" width="110" height="150" rx="6" fill="#fff" stroke="${ink}" stroke-width="2"/>
        <rect x="150" y="150" width="20" height="150" rx="3" fill="${tint}"/>
        <line x1="185" y1="185" x2="245" y2="185" stroke="${ink}" stroke-width="2" opacity="0.4"/>
        <line x1="185" y1="205" x2="245" y2="205" stroke="${ink}" stroke-width="2" opacity="0.25"/>
        <line x1="185" y1="225" x2="232" y2="225" stroke="${ink}" stroke-width="2" opacity="0.25"/>
        <text x="207" y="278" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="${ink}">PDF</text>`,
      course: `
        <rect x="140" y="158" width="120" height="138" rx="8" fill="#fff" stroke="${ink}" stroke-width="2"/>
        <rect x="140" y="158" width="120" height="26" rx="8" fill="${tint}"/>
        <line x1="158" y1="208" x2="242" y2="208" stroke="${ink}" stroke-width="2" opacity="0.3"/>
        <line x1="158" y1="226" x2="242" y2="226" stroke="${ink}" stroke-width="2" opacity="0.2"/>
        <circle cx="200" cy="262" r="18" fill="none" stroke="${tint}" stroke-width="3"/>
        <text x="200" y="267" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="${ink}">✓</text>`,
      voucher: `
        <rect x="130" y="180" width="140" height="92" rx="12" fill="#fff" stroke="${ink}" stroke-width="2"/>
        <line x1="130" y1="208" x2="270" y2="208" stroke="${tint}" stroke-width="2" stroke-dasharray="4 4"/>
        <circle cx="200" cy="150" r="22" fill="${tint}"/>
        <text x="200" y="156" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#fff">♥</text>
        <text x="200" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="${ink}">Gutschein</text>`
    };

    const id = "g" + p.id + view;
    return `
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(p.name)}">
        <defs>
          <radialGradient id="${id}" cx="42%" cy="38%" r="80%">
            <stop offset="0%" stop-color="${tint}" stop-opacity="0.20"/>
            <stop offset="60%" stop-color="${tint}" stop-opacity="0.07"/>
            <stop offset="100%" stop-color="#000" stop-opacity="0.06"/>
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="#faf9f7"/>
        <rect width="400" height="400" fill="url(#${id})"/>
        <ellipse cx="200" cy="338" rx="92" ry="16" fill="${ink}" opacity="0.08"/>
        <g transform="translate(${shift} 0) rotate(${rot} 200 230) scale(${scale})" transform-origin="200 230">
          ${shapes[p.shape] || shapes.bottle}
        </g>
      </svg>`;
  }

  /* ------------------------------------------------------------------ *
   * DOM-Referenzen
   * ------------------------------------------------------------------ */
  const $ = (sel) => document.querySelector(sel);
  const grid = $("#shop-grid");
  const overlay = $("#overlay");
  const modal = $("#modal");

  /* ------------------------------------------------------------------ *
   * Grid rendern
   * ------------------------------------------------------------------ */
  function renderGrid() {
    grid.innerHTML = PRODUCTS.map((p) => {
      const tags = [];
      if (!p.shippable && p.category === "Digital") tags.push("Sofort verfügbar");
      if (p.category === "Ausbildung") tags.push("Kurs");
      if (p.category === "Gutschein") tags.push("Geschenk-Idee");
      const tag = tags.length ? `<span class="card-tag">${esc(tags[0])}</span>` : "";
      const priceLabel = p.id === "gutschein" ? "ab " : "";
      const mainBtn = p.variant
        ? `<button class="btn btn-solid" data-open="${p.id}">Auswählen</button>`
        : `<button class="btn btn-solid" data-add="${p.id}">In den Warenkorb</button>`;
      return `
        <article class="card" data-id="${p.id}">
          <button class="card-media" data-open="${p.id}" aria-label="Details zu ${esc(p.name)}">
            ${tag}${productImage(p, 0)}
          </button>
          <div class="card-body">
            <p class="card-cat">${esc(p.category)}</p>
            <h3 class="card-name">${esc(p.name)}</h3>
            <p class="card-sub">${esc(p.subtitle)}</p>
            <p class="card-short">${esc(p.short)}</p>
            <div class="card-price">
              <span class="price">${priceLabel}${euro(p.price)}</span>
              ${p.basePrice ? `<span class="base">${esc(p.basePrice)}</span>` : ""}
            </div>
            <div class="card-actions">
              <button class="btn btn-ghost" data-open="${p.id}">Details</button>
              ${mainBtn}
            </div>
          </div>
        </article>`;
    }).join("");
  }

  /* ------------------------------------------------------------------ *
   * Detail-Quick-View (Modal)
   * ------------------------------------------------------------------ */
  let modalState = { id: null, view: 0, variant: null, qty: 1 };

  function openModal(id) {
    const p = byId(id);
    modalState = {
      id,
      view: 0,
      variant: p.variant ? p.variant.options[0].value : null,
      qty: 1
    };
    renderModal();
    overlay.classList.add("open");
    modal.classList.add("open");
    document.body.classList.add("noscroll");
    modal.focus();
  }
  function closeModal() {
    modal.classList.remove("open");
    overlay.classList.remove("open");
    document.body.classList.remove("noscroll");
  }

  function renderModal() {
    const p = byId(modalState.id);
    const price = unitPrice(p, modalState.variant);
    const avg = p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length;

    const thumbs = [0, 1, 2]
      .map(
        (v) =>
          `<button class="thumb ${v === modalState.view ? "active" : ""}" data-view="${v}" aria-label="Ansicht ${v + 1}">${productImage(p, v)}</button>`
      )
      .join("");

    const variantHtml = p.variant
      ? `<label class="field">
           <span>${esc(p.variant.label)}</span>
           <select id="variant-select">
             ${p.variant.options
               .map(
                 (o) =>
                   `<option value="${esc(o.value)}" ${o.value === modalState.variant ? "selected" : ""}>${esc(o.label)}</option>`
               )
               .join("")}
           </select>
         </label>`
      : "";

    const reviews = p.reviews
      .map(
        (r) => `
        <div class="review">
          <div class="review-top">
            <span class="review-stars" aria-label="${r.rating} von 5">${stars(r.rating)}</span>
            <span class="review-verified">✓ Verifizierter Kauf</span>
          </div>
          <p class="review-text">${esc(r.text)}</p>
          <p class="review-meta">${esc(r.name)} · ${esc(r.date)}</p>
        </div>`
      )
      .join("");

    const related = p.related
      .map((rid) => byId(rid))
      .filter(Boolean)
      .map(
        (rp) => `
        <button class="related-card" data-open="${rp.id}">
          <span class="related-media">${productImage(rp, 0)}</span>
          <span class="related-name">${esc(rp.name)}</span>
          <span class="related-price">${euro(rp.price)}</span>
        </button>`
      )
      .join("");

    modal.innerHTML = `
      <button class="modal-close" data-close-modal aria-label="Schließen">×</button>
      <div class="modal-grid">
        <div class="gallery">
          <div class="gallery-main">${productImage(p, modalState.view)}</div>
          <div class="gallery-thumbs">${thumbs}</div>
        </div>
        <div class="detail">
          <p class="card-cat">${esc(p.category)}</p>
          <h2 class="detail-name">${esc(p.name)}</h2>
          <p class="card-sub">${esc(p.subtitle)}</p>
          <div class="detail-rating">
            <span class="review-stars">${stars(Math.round(avg))}</span>
            <span class="detail-rating-meta">${avg.toFixed(1)} · ${p.reviews.length} Bewertungen</span>
          </div>
          <p class="detail-price"><span class="price">${euro(price)}</span>${p.basePrice ? `<span class="base">${esc(p.basePrice)}</span>` : ""}</p>
          <p class="detail-desc">${esc(p.description)}</p>
          ${variantHtml}
          <div class="qty-row">
            <div class="qty">
              <button data-qty="-1" aria-label="weniger">−</button>
              <span id="qty-val">${modalState.qty}</span>
              <button data-qty="1" aria-label="mehr">+</button>
            </div>
            <button class="btn btn-solid btn-add-detail">In den Warenkorb · ${euro(price * modalState.qty)}</button>
          </div>
          <p class="ship-note">${p.shippable ? "Versand 4,90 € · gratis ab 49 € · 2–4 Werktage" : "Kein Versand — digital / im Studio einlösbar"}</p>
        </div>
      </div>
      <section class="modal-section">
        <h3>Bewertungen</h3>
        <div class="reviews">${reviews}</div>
      </section>
      <section class="modal-section">
        <h3>Das könnte dir auch gefallen</h3>
        <div class="related">${related}</div>
      </section>`;
  }

  /* ------------------------------------------------------------------ *
   * Event-Delegation
   * ------------------------------------------------------------------ */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open],[data-add],[data-close-modal],[data-view],[data-qty],.btn-add-detail");
    if (!t) return;

    if (t.classList.contains("btn-add-detail")) {
      const p = byId(modalState.id);
      let variantValue = null;
      if (p.variant) {
        const opt = p.variant.options.find((o) => String(o.value) === String(modalState.variant));
        variantValue = opt ? opt.value : null;
      }
      snipcartAdd(modalState.id, { quantity: modalState.qty, variantValue: variantValue });
      closeModal();
      return;
    }
    if (t.hasAttribute("data-add")) { snipcartAdd(t.getAttribute("data-add"), { quantity: 1 }); return; }
    if (t.hasAttribute("data-open")) { openModal(t.getAttribute("data-open")); return; }
    if (t.hasAttribute("data-close-modal")) { closeModal(); return; }
    if (t.hasAttribute("data-view")) { modalState.view = +t.getAttribute("data-view"); renderModal(); return; }
    if (t.hasAttribute("data-qty")) {
      modalState.qty = Math.max(1, modalState.qty + +t.getAttribute("data-qty"));
      renderModal();
      return;
    }
  });

  // Variantenwahl im Modal
  document.addEventListener("change", (e) => {
    if (e.target.id === "variant-select") {
      modalState.variant = e.target.value;
      renderModal();
    }
  });

  // ESC schließt das Detail-Modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Klick auf den Hintergrund schließt das Detail-Modal
  if (overlay) overlay.addEventListener("click", closeModal);

  /* ------------------------------------------------------------------ *
   * Init
   * ------------------------------------------------------------------ */
  renderGrid();
})();
