import { apiRequest, refreshCsrfToken } from './api.js';

const els = {
  list: document.querySelector('#events-list'),
  status: document.querySelector('#events-status'),
  count: document.querySelector('#events-count'),
  statEvents: document.querySelector('#stat-events'),
  statPages: document.querySelector('#stat-pages'),
  pagination: document.querySelector('#pagination'),
  pageIndicator: document.querySelector('#page-indicator'),
  prev: document.querySelector('#prev-page'),
  next: document.querySelector('#next-page'),
  filters: document.querySelector('#filters'),
  search: document.querySelector('#search'),
  category: document.querySelector('#category'),
  clearFilters: document.querySelector('#clear-filters'),
  authStatus: document.querySelector('#auth-status'),
  authBadge: document.querySelector('#auth-badge'),
  loggedIn: document.querySelector('#logged-in'),
  loggedOut: document.querySelector('#logged-out'),
  currentUsername: document.querySelector('#current-username'),
  headerActions: document.querySelector('#header-actions'),
  createSection: document.querySelector('#create-section'),
  createForm: document.querySelector('#create-event'),
  loginForm: document.querySelector('#login'),
  registerForm: document.querySelector('#register'),
  tabLogin: document.querySelector('#tab-login'),
  tabRegister: document.querySelector('#tab-register'),
  loginPanel: document.querySelector('#login-panel'),
  registerPanel: document.querySelector('#register-panel')
};

const CATEGORY_LABELS = {
  EDUCATION: 'Education',
  SOCIAL: 'Social',
  TECHNOLOGY: 'Technology',
  OTHER: 'Other'
};

const state = {
  user: null,
  page: 1,
  totalPages: 1,
  total: 0,
  category: '',
  search: ''
};

/* ---------- helpers ---------- */

function setStatus(message, type = 'info') {
  els.status.replaceChildren();
  els.status.className = 'status-line';
  if (!message) return;

  if (type === 'loading') {
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');
    els.status.append(spinner, document.createTextNode(message));
    return;
  }

  if (type === 'error') {
    els.status.className = 'alert alert--error';
  } else if (type === 'success') {
    els.status.className = 'alert alert--success';
  } else {
    els.status.className = 'alert alert--info';
  }
  els.status.textContent = message;
}

function setAuthMessage(message, type = 'info') {
  els.authStatus.className = type === 'error' ? 'alert alert--error' : type === 'success' ? 'alert alert--success' : 'muted';
  els.authStatus.textContent = message;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date to be announced';
  return date.toLocaleString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function makeBadge(text, variant = '') {
  const badge = document.createElement('span');
  badge.className = 'badge' + (variant ? ' badge--' + variant : '');
  badge.textContent = text;
  return badge;
}

function makeMetaItem(label, value) {
  const li = document.createElement('li');
  const strong = document.createElement('strong');
  strong.textContent = label + ':';
  li.append(strong, document.createTextNode(' ' + value));
  return li;
}

function setBusy(button, busy, label) {
  if (!button) return;
  if (busy) {
    button.dataset.label = button.textContent;
    button.textContent = label || 'Working…';
    button.disabled = true;
  } else {
    button.textContent = button.dataset.label || button.textContent;
    button.disabled = false;
  }
}

/* ---------- auth UI ---------- */

function buildHeaderActions() {
  els.headerActions.replaceChildren();

  if (state.user) {
    const chip = document.createElement('span');
    chip.className = 'user-chip';
    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = state.user.username.charAt(0);
    chip.append(avatar, document.createTextNode(state.user.username));

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-secondary btn-sm';
    button.textContent = 'Log out';
    button.addEventListener('click', logout);

    els.headerActions.append(chip, button);
    return;
  }

  const login = document.createElement('a');
  login.className = 'btn btn-secondary btn-sm';
  login.href = '#account';
  login.textContent = 'Log in';

  const register = document.createElement('a');
  register.className = 'btn btn-sm';
  register.href = '#account';
  register.textContent = 'Register';

  register.addEventListener('click', () => showTab('register'));

  els.headerActions.append(login, register);
}

function updateAuthUI() {
  const signedIn = Boolean(state.user);

  els.loggedIn.hidden = !signedIn;
  els.loggedOut.hidden = signedIn;
  els.createSection.hidden = !signedIn;
  els.authBadge.textContent = signedIn ? 'Signed in' : 'Guest';
  els.authBadge.className = 'badge' + (signedIn ? ' badge--success' : '');

  if (signedIn) {
    els.currentUsername.textContent = state.user.username;
    setAuthMessage('Your events can be managed from the list.');
  } else {
    setAuthMessage('Log in or create an account to publish events.');
  }

  buildHeaderActions();
}

function showTab(name) {
  const login = name === 'login';
  els.tabLogin.setAttribute('aria-selected', String(login));
  els.tabRegister.setAttribute('aria-selected', String(!login));
  els.loginPanel.hidden = !login;
  els.registerPanel.hidden = login;
}

/* ---------- events rendering ---------- */

function createSkeletonCard() {
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('aria-hidden', 'true');

  const cover = document.createElement('div');
  cover.className = 'skeleton';
  cover.style.aspectRatio = '16 / 8';
  cover.style.marginBottom = '0.9rem';

  const title = document.createElement('div');
  title.className = 'skeleton';
  title.style.height = '1.2rem';
  title.style.width = '70%';
  title.style.marginBottom = '0.6rem';

  const line = document.createElement('div');
  line.className = 'skeleton';
  line.style.height = '0.85rem';
  line.style.width = '90%';

  card.append(cover, title, line);
  return card;
}

function renderSkeletons() {
  els.list.replaceChildren();
  for (let i = 0; i < 3; i += 1) els.list.append(createSkeletonCard());
}

function renderEvents(events) {
  els.list.replaceChildren();
  els.count.textContent = state.total + (state.total === 1 ? ' event' : ' events');
  els.statEvents.textContent = String(state.total);
  els.statPages.textContent = String(state.totalPages);

  if (!events.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.style.gridColumn = '1 / -1';

    const icon = document.createElement('span');
    icon.className = 'empty-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '◎';

    const title = document.createElement('h3');
    title.textContent = state.search || state.category ? 'No events match those filters' : 'No published events yet';

    const text = document.createElement('p');
    text.textContent = state.search || state.category
      ? 'Try a different search term or clear the filters.'
      : 'Published events will appear here. Log in to create the first one.';

    empty.append(icon, title, text);
    els.list.append(empty);
    return;
  }

  events.forEach(event => {
    const card = document.createElement('article');
    card.className = 'card event-card';

    if (event.coverUrl) {
      const img = document.createElement('img');
      img.className = 'event-cover';
      img.src = event.coverUrl;
      img.alt = 'Cover image for ' + event.title;
      img.loading = 'lazy';
      card.append(img);
    }

    const top = document.createElement('div');
    top.className = 'cluster';
    top.append(makeBadge(CATEGORY_LABELS[event.category] || event.category, 'brand'));

    const owned = state.user && event.organizerId === state.user.id;
    if (owned) top.append(makeBadge('Your event', 'success'));
    card.append(top);

    const title = document.createElement('h3');
    title.textContent = event.title;
    card.append(title);

    const desc = document.createElement('p');
    desc.className = 'event-desc';
    desc.textContent = event.description;
    card.append(desc);

    const meta = document.createElement('ul');
    meta.className = 'meta';
    meta.append(
      makeMetaItem('Starts', formatDate(event.startsAt)),
      makeMetaItem('Location', event.location)
    );
    card.append(meta);

    const footer = document.createElement('div');
    footer.className = 'event-footer';

    const dateBadge = makeBadge(formatDate(event.startsAt).split(',')[0]);
    footer.append(dateBadge);

    if (owned) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'btn btn-danger btn-sm';
      remove.textContent = 'Delete event';
      remove.addEventListener('click', async () => {
        if (!window.confirm('Delete “' + event.title + '”? This cannot be undone.')) return;
        setBusy(remove, true, 'Deleting…');
        try {
          await apiRequest('/api/events/' + event.id, { method: 'DELETE' });
          setStatus('Event deleted.', 'success');
          await loadEvents();
        } catch (error) {
          setStatus(error.message, 'error');
          setBusy(remove, false);
        }
      });
      footer.append(remove);
    }

    card.append(footer);
    els.list.append(card);
  });
}

function renderPagination() {
  const show = state.totalPages > 1;
  els.pagination.hidden = !show;
  if (!show) return;

  els.pageIndicator.textContent = 'Page ' + state.page + ' of ' + state.totalPages;
  els.prev.disabled = state.page <= 1;
  els.next.disabled = state.page >= state.totalPages;
}

/* ---------- data loading ---------- */

async function loadEvents() {
  renderSkeletons();
  setStatus('Loading events…', 'loading');
  els.count.textContent = 'Loading…';

  const params = new URLSearchParams();
  params.set('page', String(state.page));
  if (state.category) params.set('category', state.category);
  if (state.search) params.set('search', state.search);

  try {
    const result = await apiRequest('/api/events?' + params.toString());
    const data = result.data;
    state.total = data.total;
    state.totalPages = data.totalPages;
    if (state.page > state.totalPages) {
      state.page = state.totalPages;
      return loadEvents();
    }
    renderEvents(data.events);
    renderPagination();
    setStatus('');
  } catch (error) {
    els.list.replaceChildren();
    els.count.textContent = 'Unavailable';
    els.statEvents.textContent = '—';
    els.statPages.textContent = '—';
    els.pagination.hidden = true;
    setStatus(error.message || 'Could not load events. Please try again.', 'error');
  }
}

async function loadSession() {
  try {
    const result = await apiRequest('/api/auth/me');
    state.user = result.data.user;
  } catch (error) {
    if (error.status === 401) state.user = null;
    else throw error;
  }
  updateAuthUI();
}

/* ---------- actions ---------- */

async function postJSON(url, body) {
  return apiRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function logout() {
  setAuthMessage('Logging out…');
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    await refreshCsrfToken();
    state.user = null;
    updateAuthUI();
    setAuthMessage('You are logged out.', 'success');
    await loadEvents();
  } catch (error) {
    setAuthMessage(error.message || 'Could not log out.', 'error');
  }
}

function readForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

els.loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = els.loginForm.querySelector('button[type="submit"]');
  const values = readForm(els.loginForm);
  setBusy(button, true, 'Logging in…');
  setAuthMessage('Signing you in…');
  try {
    const result = await postJSON('/api/auth/login', values);
    await refreshCsrfToken();
    state.user = result.data.user;
    updateAuthUI();
    setAuthMessage('Welcome back, ' + state.user.username + '.', 'success');
    els.loginForm.reset();
    await loadEvents();
  } catch (error) {
    setAuthMessage(error.message || 'Invalid email or password.', 'error');
  } finally {
    setBusy(button, false);
  }
});

els.registerForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = els.registerForm.querySelector('button[type="submit"]');
  const values = readForm(els.registerForm);
  setBusy(button, true, 'Creating…');
  setAuthMessage('Creating your account…');
  try {
    await postJSON('/api/auth/register', values);
    await refreshCsrfToken();
    els.registerForm.reset();
    showTab('login');
    if (els.loginForm.elements.email) els.loginForm.elements.email.value = values.email || '';
    setAuthMessage('Account created. Log in to continue.', 'success');
  } catch (error) {
    setAuthMessage(error.message || 'Could not create the account.', 'error');
  } finally {
    setBusy(button, false);
  }
});

els.createForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = els.createForm.querySelector('button[type="submit"]');
  const values = readForm(els.createForm);

  if (!values.title || !values.description || !values.location || !values.startsAt) {
    setStatus('Fill in the title, description, location and start time.', 'error');
    return;
  }

  const startsAt = new Date(values.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    setStatus('Choose a valid start date and time.', 'error');
    return;
  }

  setBusy(button, true, 'Publishing…');
  setStatus('Publishing your event…', 'loading');

  try {
    await postJSON('/api/events', {
      title: values.title.trim(),
      description: values.description.trim(),
      location: values.location.trim(),
      startsAt: startsAt.toISOString(),
      category: values.category || 'OTHER',
      status: 'PUBLISHED'
    });
    els.createForm.reset();
    state.page = 1;
    setStatus('Event published.', 'success');
    await loadEvents();
    document.querySelector('#events').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    setStatus(error.message || 'Could not publish the event.', 'error');
  } finally {
    setBusy(button, false);
  }
});

els.filters.addEventListener('submit', event => {
  event.preventDefault();
  state.search = els.search.value.trim();
  state.category = els.category.value;
  state.page = 1;
  loadEvents();
});

els.clearFilters.addEventListener('click', () => {
  els.search.value = '';
  els.category.value = '';
  state.search = '';
  state.category = '';
  state.page = 1;
  loadEvents();
});

els.prev.addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1;
    loadEvents();
  }
});

els.next.addEventListener('click', () => {
  if (state.page < state.totalPages) {
    state.page += 1;
    loadEvents();
  }
});

els.tabLogin.addEventListener('click', () => showTab('login'));
els.tabRegister.addEventListener('click', () => showTab('register'));

/* ---------- boot ---------- */

(async () => {
  showTab('login');
  renderSkeletons();
  try {
    await refreshCsrfToken();
    await loadSession();
    await loadEvents();
  } catch (error) {
    updateAuthUI();
    setAuthMessage('Could not reach the API.', 'error');
    setStatus(error.message || 'Could not load the event board.', 'error');
  }
})();
