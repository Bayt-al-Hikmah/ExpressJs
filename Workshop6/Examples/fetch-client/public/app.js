const list = document.querySelector('#list');
const status = document.querySelector('#status');
const count = document.querySelector('#count');
const form = document.querySelector('#form');
const titleInput = document.querySelector('#title');
const submitButton = form.querySelector('button[type="submit"]');

function setStatus(message, type = 'info') {
  status.replaceChildren();
  status.className = 'status-line';
  if (!message) return;

  if (type === 'loading') {
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');
    status.append(spinner, document.createTextNode(message));
    return;
  }

  status.className = type === 'error' ? 'alert alert--error' : type === 'success' ? 'alert alert--success' : 'alert alert--info';
  status.textContent = message;
}

function setBusy(busy) {
  if (busy) {
    submitButton.dataset.label = submitButton.textContent;
    submitButton.textContent = 'Adding…';
    submitButton.disabled = true;
  } else {
    submitButton.textContent = submitButton.dataset.label || 'Add item';
    submitButton.disabled = false;
  }
}

function renderItems(items) {
  list.replaceChildren();
  count.textContent = items.length + (items.length === 1 ? ' item' : ' items');

  if (!items.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';

    const icon = document.createElement('span');
    icon.className = 'empty-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '+';

    const title = document.createElement('h3');
    title.textContent = 'No items yet';

    const text = document.createElement('p');
    text.textContent = 'Add the first item using the form.';

    empty.append(icon, title, text);
    list.append(empty);
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'list-item';

    const main = document.createElement('div');
    main.className = 'list-item-main';

    const title = document.createElement('p');
    title.className = 'list-item-title';
    title.textContent = item.title;

    const meta = document.createElement('span');
    meta.className = 'badge';
    meta.textContent = 'Item #' + item.id;

    main.append(title, meta);

    const position = document.createElement('span');
    position.className = 'badge badge--brand';
    position.textContent = String(index + 1).padStart(2, '0');

    li.append(main, position);
    list.append(li);
  });
}

async function loadItems() {
  setStatus('Loading items…', 'loading');
  count.textContent = 'Loading…';

  const res = await fetch('/api/items', { headers: { Accept: 'application/json' } });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result.message || 'Could not load items.');
  renderItems(result.data.items);
  setStatus('');
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const title = titleInput.value.trim();

  if (!title) {
    setStatus('Enter a title before adding an item.', 'error');
    titleInput.focus();
    return;
  }

  setBusy(true);
  setStatus('Adding your item…', 'loading');

  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ title })
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || 'Could not add the item.');

    titleInput.value = '';
    setStatus('Item added.', 'success');
    await loadItems();
    titleInput.focus();
  } catch (error) {
    setStatus(error.message || 'Could not add the item. Please try again.', 'error');
  } finally {
    setBusy(false);
  }
});

loadItems().catch(error => {
  count.textContent = 'Unavailable';
  setStatus(error.message || 'Could not load items. Please try again.', 'error');
});
