'use strict';

const serviceCatalog = [
  {
    id: 'ultimate-gamer-pass',
    type: 'Package',
    name: 'Ultimate Gamer Pass',
    price: 1500,
    description: 'Unlimited gaming access for a full day.',
    includes: [
      'PC gaming',
      'Console gaming',
      'High-speed internet',
      'Snack voucher',
      'Tournament entry',
    ],
  },
  {
    id: 'vip-gaming-experience',
    type: 'Package',
    name: 'VIP Gaming Experience',
    price: 1500,
    description: 'Premium gaming experience with exclusive facilities.',
    includes: [
      'Private gaming booth',
      'Premium gaming equipment',
      'Food and drinks',
      'Priority booking',
      'Personal gaming assistant',
    ],
  },
  {
    id: 'esports-training-package',
    type: 'Package',
    name: 'Esports Training Package',
    price: 1500,
    description: 'Improve competitive gaming skills with professional coaching.',
    includes: [
      'Strategy coaching',
      'Team communication',
      'Match analysis',
      'Practice sessions',
      'Performance feedback',
    ],
  },
  {
    id: 'birthday-party-package',
    type: 'Package',
    name: 'Birthday Party Package',
    price: 1500,
    description: 'Host a gaming-themed birthday celebration.',
    includes: [
      'Reserved gaming area',
      'Multiplayer competitions',
      'Party decorations',
      'Catering',
      'Tournament prizes',
    ],
  },
  {
    id: 'virtual-reality-experience',
    type: 'Experience',
    name: 'Virtual Reality Experience',
    price: 750,
    description: 'Explore immersive virtual reality games.',
    includes: ['VR headset', 'Choice of games', 'Staff assistance'],
  },
  {
    id: 'racing-simulator-challenge',
    type: 'Experience',
    name: 'Racing Simulator Challenge',
    price: 750,
    description: 'Race on professional driving simulators.',
    includes: [
      'Racing simulator',
      'Choice of tracks',
      'Leaderboard competition',
    ],
  },
  {
    id: 'escape-room-challenge',
    type: 'Experience',
    name: 'Escape Room Challenge',
    price: 750,
    description: 'Solve puzzles and escape before time runs out.',
    includes: ['Team challenge', 'Themed escape room', 'Digital scorecard'],
  },
];

const STORAGE_KEY = 'next-level-booking-quote';
const CONTACT_KEY = 'next-level-contact-enquiry';
const COOKIE_KEY = 'next-level-cookie-choice';

function formatRand(amount) {
  return `R${Number(amount).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function readSavedQuote() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveQuote(quote) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quote));
  } catch {
    // The page can still be used if browser storage is unavailable.
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });
}

function setupMobileNavigation() {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');

  if (!menuButton || !nav) return;

  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

function setCurrentYear() {
  document.querySelectorAll('.year').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
}

function makeServiceCard(service) {
  const features = service.includes
    .map((feature) => `<li>${escapeHtml(feature)}</li>`)
    .join('');

  return `
    <article class="feature-card service-card">
      <div class="card-icon" aria-hidden="true">
        ${service.type === 'Package' ? '🎮' : '✦'}
      </div>
      <p class="eyebrow">${escapeHtml(service.type)}</p>
      <h3>${escapeHtml(service.name)}</h3>
      <p class="service-price">${formatRand(service.price)}</p>
      <p>${escapeHtml(service.description)}</p>
      <ul>${features}</ul>
      <a
        class="button button-primary"
        href="calculate-fees.html?add=${encodeURIComponent(service.id)}"
      >
        Add to booking
      </a>
    </article>
  `;
}

function updateCatalogPages() {
  const path = window.location.pathname.toLowerCase();

  if (path.endsWith('/overview.html') || path.endsWith('overview.html')) {
    const grid = document.querySelector('.card-grid');

    if (grid) {
      grid.innerHTML = serviceCatalog
        .filter((service) => service.type === 'Experience')
        .map(makeServiceCard)
        .join('');
    }
  }

  if (path.endsWith('/package.html') || path.endsWith('package.html')) {
    const section = document.querySelector('main .section.two-column');

    if (section) {
      section.classList.remove('two-column');
      section.innerHTML = `
        <div class="card-grid">
          ${serviceCatalog
            .filter((service) => service.type === 'Package')
            .map(makeServiceCard)
            .join('')}
        </div>
      `;
    }
  }
}

function getDiscountRate(numberOfBookings) {
  if (numberOfBookings >= 4) return 0.15;
  if (numberOfBookings === 3) return 0.10;
  if (numberOfBookings === 2) return 0.05;
  return 0;
}

/*
 * Hourly calculation:
 * PC Gaming costs R50 per player per hour.
 * Console Gaming costs R40 per player per hour.
 * VAT of 15% is added to the hourly estimate.
 */
function setupHourlyCalculator() {
  const form = document.querySelector('#hourly-form');
  const result = document.querySelector('#hourly-result');

  if (!form || !result) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const rate = Number(form.elements.experience.value);
    const players = Number(form.elements.players.value);
    const hours = Number(form.elements.hours.value);

    if (
      !Number.isFinite(rate) ||
      !Number.isFinite(players) ||
      !Number.isFinite(hours) ||
      players < 1 ||
      players > 20 ||
      hours < 1 ||
      hours > 12
    ) {
      result.textContent =
        'Enter between 1 and 20 players and between 1 and 12 hours.';
      return;
    }

    const subtotal = rate * players * hours;
    const vat = subtotal * 0.15;
    const total = subtotal + vat;

    result.textContent =
      `${players} player(s) × ${hours} hour(s) × ${formatRand(rate)} per player/hour ` +
      `= ${formatRand(subtotal)} before VAT. ` +
      `VAT (15%): ${formatRand(vat)}. ` +
      `Estimated total: ${formatRand(total)}.`;
  });
}

/*
 * Package and experience calculator:
 * One selected service counts as one booking.
 * Discount is applied before VAT.
 */
function setupFeeCalculator() {
  const form = document.querySelector('#fee-form');
  const result = document.querySelector('#fee-result');

  if (!form || !result) return;

  const savedQuote = readSavedQuote();
  const query = new URLSearchParams(window.location.search);
  const addedId = query.get('add');

  const initiallySelected = new Set(
    Array.isArray(savedQuote.selectedIds) ? savedQuote.selectedIds : []
  );

  if (addedId && serviceCatalog.some((service) => service.id === addedId)) {
    initiallySelected.add(addedId);
  }

  form.innerHTML = `
    <fieldset class="service-selection">
      <legend>Select packages and experiences</legend>

      ${serviceCatalog
        .map(
          (service) => `
            <div class="booking-option">
              <input
                id="service-${service.id}"
                name="services"
                type="checkbox"
                value="${service.id}"
                ${initiallySelected.has(service.id) ? 'checked' : ''}
              >

              <label for="service-${service.id}">
                ${escapeHtml(service.name)} (${escapeHtml(service.type)})
              </label>

              <span class="booking-option-price">
                ${formatRand(service.price)}
              </span>
            </div>
          `
        )
        .join('')}
    </fieldset>

    <label for="quote-name">Your name</label>
    <input
      id="quote-name"
      name="name"
      type="text"
      autocomplete="name"
      required
    >

    <label for="quote-email">Email address</label>
    <input
      id="quote-email"
      name="email"
      type="email"
      autocomplete="email"
      required
    >

    <label for="quote-phone">Phone number</label>
    <input
      id="quote-phone"
      name="phone"
      type="tel"
      autocomplete="tel"
      inputmode="tel"
      pattern="[0-9+()\\-\\s]{7,20}"
      title="Enter a valid phone number"
      required
    >

    <button class="button button-primary" type="button" id="request-quote">
      Prepare booking request
    </button>

    <div class="booking-summary" aria-live="polite">
      <h3>Fee summary</h3>
      <div id="fee-summary-rows"></div>
    </div>
  `;

  const summaryRows = form.querySelector('#fee-summary-rows');
  const requestButton = form.querySelector('#request-quote');

  function getSelectedServices() {
    const selectedIds = Array.from(
      form.querySelectorAll('input[name="services"]:checked')
    ).map((input) => input.value);

    return serviceCatalog.filter((service) => selectedIds.includes(service.id));
  }

  function calculateAndRender() {
    const selected = getSelectedServices();
    const subtotal = selected.reduce(
      (sum, service) => sum + service.price,
      0
    );

    const discountRate = getDiscountRate(selected.length);
    const discount = subtotal * discountRate;
    const discountedSubtotal = subtotal - discount;
    const vat = discountedSubtotal * 0.15;
    const total = discountedSubtotal + vat;

    const serviceRows = selected.length
      ? selected
          .map(
            (service) => `
              <div class="summary-row">
                <span>${escapeHtml(service.name)}</span>
                <strong>${formatRand(service.price)}</strong>
              </div>
            `
          )
          .join('')
      : `
          <div class="summary-row">
            <span>No services selected</span>
            <strong>—</strong>
          </div>
        `;

    summaryRows.innerHTML = `
      ${serviceRows}

      <div class="summary-row">
        <span>Subtotal</span>
        <strong>${formatRand(subtotal)}</strong>
      </div>

      <div class="summary-row">
        <span>Discount (${Math.round(discountRate * 100)}%)</span>
        <strong>−${formatRand(discount)}</strong>
      </div>

      <div class="summary-row">
        <span>VAT (15%)</span>
        <strong>${formatRand(vat)}</strong>
      </div>

      <div class="summary-row total">
        <span>Estimated total</span>
        <strong>${formatRand(total)}</strong>
      </div>
    `;

    const quote = {
      selectedIds: selected.map((service) => service.id),
      subtotal,
      discount,
      discountRate,
      vat,
      total,
    };

    saveQuote(quote);

    if (selected.length === 0) {
      result.textContent =
        'Select one or more packages or experiences to see your estimate.';
    } else {
      result.textContent =
        `Estimated total: ${formatRand(total)} ` +
        `(${Math.round(discountRate * 100)}% discount and 15% VAT included).`;
    }

    return { selected, subtotal, discount, discountRate, vat, total };
  }

  // Update the fee summary as soon as a service checkbox changes.
  form.addEventListener('change', (event) => {
    if (event.target.name === 'services') {
      calculateAndRender();
    }
  });

  requestButton.addEventListener('click', () => {
    if (!form.reportValidity()) return;

    const quote = calculateAndRender();

    if (quote.selected.length === 0) {
      result.textContent = 'Please select at least one package or experience.';
      return;
    }

    const bookingRequest = {
      customer: {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
      },
      selectedIds: quote.selected.map((service) => service.id),
      subtotal: quote.subtotal,
      discount: quote.discount,
      discountRate: quote.discountRate,
      vat: quote.vat,
      total: quote.total,
      createdAt: new Date().toISOString(),
    };

    saveQuote(bookingRequest);

    result.textContent =
      `Booking request prepared for ${bookingRequest.customer.name}. ` +
      `Estimated total including VAT: ${formatRand(quote.total)}. ` +
      'This is a quote only; the business must confirm availability and final pricing.';
  });

  calculateAndRender();

  // Remove the query parameter after pre-selecting the service.
  if (addedId) {
    window.history.replaceState({}, '', window.location.pathname);
  }
}

function setupContactForm() {
  const form = document.querySelector('#contact-form');
  const result = document.querySelector('#contact-result');

  if (!form || !result) return;

  const emailInput = form.querySelector('#email');

  // Add the phone field after the email input, keeping the email label in place.
  if (emailInput && !form.querySelector('[name="phone"]')) {
    const phoneLabel = document.createElement('label');
    phoneLabel.htmlFor = 'phone';
    phoneLabel.textContent = 'Phone number';

    const phoneInput = document.createElement('input');
    phoneInput.id = 'phone';
    phoneInput.name = 'phone';
    phoneInput.type = 'tel';
    phoneInput.autocomplete = 'tel';
    phoneInput.required = true;
    phoneInput.pattern = '[0-9+()\\-\\s]{7,20}';
    phoneInput.title = 'Enter a valid phone number';

    emailInput.after(phoneLabel, phoneInput);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const formData = new FormData(form);

    const enquiry = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      topic: String(formData.get('topic') || ''),
      message: String(formData.get('message') || '').trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(CONTACT_KEY, JSON.stringify(enquiry));
    } catch {
      // The confirmation still works if browser storage is unavailable.
    }

    result.textContent =
      `Message submitted successfully, ${enquiry.name}! ` +
      'This is a demo confirmation; it has not been emailed to the business.';

    form.reset();
  });
}

function setupCookieNotice() {
  let savedChoice = null;

  try {
    savedChoice = localStorage.getItem(COOKIE_KEY);
  } catch {
    // The notice can still display if storage is unavailable.
  }

  const settingsButton = document.createElement('button');
  settingsButton.className = 'cookie-settings-button';
  settingsButton.type = 'button';
  settingsButton.textContent = 'Cookie settings';
  settingsButton.hidden = !savedChoice;

  document.body.appendChild(settingsButton);

  let notice = null;

  function saveChoice(choice) {
    try {
      localStorage.setItem(COOKIE_KEY, choice);
    } catch {
      // Ignore storage errors.
    }

    if (notice) {
      notice.remove();
      notice = null;
    }

    settingsButton.hidden = false;
  }

  function showNotice() {
    if (notice) notice.remove();

    notice = document.createElement('section');
    notice.className = 'cookie-notice';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-label', 'Cookie notice');

    notice.innerHTML = `
      <h2>Cookie notice</h2>
      <p>
        This student demo uses browser storage to remember your cookie choice
        and selected services. It does not use advertising or analytics cookies.
      </p>

      <div class="cookie-actions">
        <button
          class="button button-primary"
          type="button"
          data-cookie-choice="accepted"
        >
          Accept
        </button>

        <button
          class="button button-outline"
          type="button"
          data-cookie-choice="declined"
        >
          Decline optional cookies
        </button>
      </div>
    `;

    notice.querySelectorAll('[data-cookie-choice]').forEach((button) => {
      button.addEventListener('click', () => {
        saveChoice(button.dataset.cookieChoice);
      });
    });

    document.body.appendChild(notice);
  }

  settingsButton.addEventListener('click', showNotice);

  if (!savedChoice) {
    showNotice();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNavigation();
  setCurrentYear();
  updateCatalogPages();
  setupHourlyCalculator();
  setupFeeCalculator();
  setupContactForm();
  setupCookieNotice();
});