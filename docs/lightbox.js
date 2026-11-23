/* Tap a screenshot to see it full size. Arrows / swipe to move between them, Esc / tap outside / swipe down to close. */
(() => {
  const imgs = [...document.querySelectorAll('.shot img, .art img, .gl img')];
  if (!imgs.length) return;
  const box = document.createElement('div');
  box.className = 'lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Screenshot');
  box.innerHTML = `<button class="lb-x" aria-label="Close">&times;</button>
    <button class="lb-nav lb-prev" aria-label="Previous screenshot">&#8249;</button>
    <figure class="lb-fig"><img alt=""><figcaption></figcaption></figure>
    <button class="lb-nav lb-next" aria-label="Next screenshot">&#8250;</button>`;
  document.body.appendChild(box);
  const big = box.querySelector('img'), cap = box.querySelector('figcaption');
  let i = 0, last = null;
  const show = n => { i = (n + imgs.length) % imgs.length; const s = imgs[i]; big.src = s.currentSrc || s.src; big.alt = s.alt; cap.textContent = s.alt; };
  const open = n => { last = document.activeElement; show(n); box.classList.add('on'); document.documentElement.classList.add('lb-lock'); box.querySelector('.lb-x').focus(); };
  const close = () => { box.classList.remove('on'); document.documentElement.classList.remove('lb-lock'); last?.focus?.(); };
  imgs.forEach((im, n) => {
    // category cards are links: the whole card opens its screenshot; a plain screenshot becomes its own button
    const t = im.closest('a') || im;
    t.classList.add('lb-can');
    if (t === im) { im.tabIndex = 0; im.setAttribute('role', 'button'); }
    t.setAttribute('aria-label', (im.alt || 'Screenshot') + ' (open full size)');
    t.addEventListener('click', e => { e.preventDefault(); open(n); });
    t.addEventListener('keydown', e => { if (t === im && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(n); } });
  });
  box.querySelector('.lb-x').onclick = close;
  box.querySelector('.lb-prev').onclick = e => { e.stopPropagation(); show(i - 1); };
  box.querySelector('.lb-next').onclick = e => { e.stopPropagation(); show(i + 1); };
  box.addEventListener('click', e => { if (e.target === box || e.target.classList.contains('lb-fig')) close(); });
  addEventListener('keydown', e => {
    if (!box.classList.contains('on')) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') show(i + 1); else if (e.key === 'ArrowLeft') show(i - 1);
    else if (e.key === 'Tab') { const f = [...box.querySelectorAll('button')]; const a = f.indexOf(document.activeElement); e.preventDefault(); f[(a + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
  });
  // swipe: left/right to move, down to close (one finger only, so pinch-zoom still works)
  let sx = 0, sy = 0, one = false;
  box.addEventListener('touchstart', e => { one = e.touches.length === 1; if (one) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { passive: true });
  box.addEventListener('touchend', e => {
    if (!one || (window.visualViewport && visualViewport.scale > 1.05)) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(i + (dx < 0 ? 1 : -1)); else if (dy > 80) close();
  });
})();
