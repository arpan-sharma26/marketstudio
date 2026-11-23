(function () {
  // Year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Mobile nav
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Header border on scroll
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Contact form: sends each request to the Market Studio inbox as a formatted email (via FormSubmit)
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/hello.marketstudio@gmail.com';
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  var btn = document.getElementById('formBtn');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var el = form.elements, ok = true;
      [el.name, el.email].forEach(function (f) { f.removeAttribute('aria-invalid'); });
      if (!el.name.value.trim()) { el.name.setAttribute('aria-invalid', 'true'); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.email.value.trim())) { el.email.setAttribute('aria-invalid', 'true'); ok = false; }
      note.classList.remove('ok', 'err');
      if (!ok) { note.textContent = 'Please add your name and a valid email address.'; note.classList.add('err'); return; }
      if (el._honey.value) return;

      var name = el.name.value.trim(), biz = el.business.value.trim();
      var payload = {
        '_subject': 'New audit request: ' + name + (biz ? ' (' + biz + ')' : ''),
        '_template': 'table',
        '_captcha': 'false',
        '_replyto': el.email.value.trim(),
        'Name': name,
        'Email': el.email.value.trim(),
        'Phone': el.phone.value.trim() || 'Not provided',
        'Business': biz || 'Not provided',
        'Service needed': el.service.value,
        'Goals': el.message.value.trim() || 'Not provided',
        'Submitted': new Date().toLocaleString('en-CA', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Edmonton' }) + ' (Calgary time)',
        'Page': location.href.split('#')[0]
      };
      btn.disabled = true; btn.textContent = 'Sending...';
      note.textContent = '';
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (String(res.success) !== 'true') throw new Error(res.message || 'Send failed');
        note.textContent = 'Thanks, ' + name.split(' ')[0] + '. Your request is in. We will reply within one business day.';
        note.classList.add('ok');
        form.reset();
      }).catch(function () {
        note.textContent = 'Your request could not be sent. Please email us at hello.marketstudio@gmail.com or call (647) 313-1074.';
        note.classList.add('err');
      }).then(function () { btn.disabled = false; btn.textContent = 'Request my free audit'; });
    });
  }

})();
