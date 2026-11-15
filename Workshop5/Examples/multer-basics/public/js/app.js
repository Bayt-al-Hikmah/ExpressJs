(function () {
  const forms = [
    { form: '#single-form', input: '#photo', fileHint: '#single-file', result: '#single-result', multiple: false },
    { form: '#multiple-form', input: '#photos', fileHint: '#multiple-file', result: '#multiple-result', multiple: true }
  ];

  function setHint(target, input, multiple) {
    if (!input.files || input.files.length === 0) {
      target.textContent = multiple ? 'No files selected.' : 'No file selected.';
      return;
    }
    const names = Array.from(input.files).map(file => file.name);
    target.textContent = multiple
      ? names.length + ' file' + (names.length === 1 ? '' : 's') + ' selected: ' + names.join(', ')
      : 'Selected: ' + names[0];
  }

  function showResult(target, type, message, files) {
    target.replaceChildren();
    target.className = 'status-line ' + (type === 'error' ? 'alert alert--error' : 'alert alert--success');
    if (type === 'loading') {
      target.className = 'status-line';
      const spinner = document.createElement('span');
      spinner.className = 'spinner';
      spinner.setAttribute('aria-hidden', 'true');
      target.append(spinner, document.createTextNode(message));
      return;
    }

    const text = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = message;
    text.append(strong);
    target.append(text);

    if (files && files.length) {
      const list = document.createElement('ul');
      list.className = 'list';
      files.forEach(file => {
        const item = document.createElement('li');
        item.className = 'list-item';
        const name = document.createElement('span');
        name.className = 'list-item-main';
        name.textContent = file.originalName || file.name || 'Uploaded file';
        const size = document.createElement('span');
        size.className = 'badge';
        size.textContent = file.size ? Math.max(1, Math.round(file.size / 1024)) + ' KB' : 'Uploaded';
        item.append(name, size);
        list.append(item);
      });
      target.append(list);
    }
  }

  forms.forEach(config => {
    const form = document.querySelector(config.form);
    const input = document.querySelector(config.input);
    const fileHint = document.querySelector(config.fileHint);
    const result = document.querySelector(config.result);
    if (!form || !input) return;

    input.addEventListener('change', () => setHint(fileHint, input, config.multiple));

    form.addEventListener('submit', async event => {
      event.preventDefault();
      result.className = 'status-line';
      result.textContent = '';

      if (!input.files || input.files.length === 0) {
        showResult(result, 'error', config.multiple ? 'Choose at least one image.' : 'Choose an image.');
        input.focus();
        return;
      }
      if (config.multiple && input.files.length > 3) {
        showResult(result, 'error', 'Choose no more than three images.');
        input.focus();
        return;
      }

      const button = form.querySelector('button[type="submit"]');
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = 'Uploading…';
      showResult(result, 'loading', 'Uploading your file' + (config.multiple && input.files.length > 1 ? 's' : '') + '…');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || 'Upload failed. Please try again.');

        const files = payload.file ? [payload.file] : (payload.files || []);
        showResult(result, 'success', 'Upload complete.', files);
        form.reset();
        setHint(fileHint, input, config.multiple);
      } catch (error) {
        showResult(result, 'error', error.message || 'Upload failed. Please try again.');
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  });
})();
