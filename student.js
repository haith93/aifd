'use strict';
/* AIFD Lab Assessor – student app. No answer keys ever reach this page. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#app');
  const K = { cur: 'aifd.v2.cur', lock: 'aifd.v2.lock', prefs: 'aifd.v2.prefs' };
  const ls = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  /* ---------- text ---------- */
  const T = {
    chooseLang: { en: 'Choose your language', ar: 'اختر اللغة' },
    welcomeTitle: { en: 'Welcome', ar: 'أهلاً بك' },
    welcome: {
      en: ['This activity helps AIFD understand how ready students are to use computers and AI for learning, so we can plan better training.',
        'It is not a test and it has no grade.',
        'It is anonymous. We do not ask your name, and nobody can know which answers are yours.',
        'It takes about 15–20 minutes. Work alone, at your own pace.',
        'If something is not clear or the computer has a problem, press "I need help". The supervisor will come.',
        'You can stop at any time.'],
      ar: ['يساعد هذا النشاط معهد AIFD على معرفة مدى جاهزية الطلاب لاستخدام الحاسوب والذكاء الاصطناعي في التعلّم، لنخطط لتدريب أفضل.',
        'هذا ليس امتحاناً ولا توجد عليه علامة.',
        'هو بدون أسماء. لا نسألك عن اسمك، ولا يستطيع أحد معرفة أي الإجابات لك.',
        'يستغرق حوالي 15–20 دقيقة. اعمل وحدك وعلى مهلك.',
        'إذا كان شيء غير واضح أو حصلت مشكلة في الحاسوب، اضغط "أحتاج مساعدة" وسيأتي المشرف.',
        'يمكنك التوقف في أي وقت.'],
    },
    agree: { en: 'Yes, I agree to take part', ar: 'نعم، أوافق على المشاركة' },
    noThanks: { en: "No, I don't want to take part", ar: 'لا، لا أريد المشاركة' },
    declined: { en: 'No problem. Nothing was saved. Please tell the supervisor.', ar: 'لا مشكلة. لم يُحفظ شيء. يرجى إخبار المشرف.' },
    program: { en: 'What is your program?', ar: 'ما هو اختصاصك؟' },
    level: { en: 'What is your level?', ar: 'ما هو مستواك؟' },
    station: { en: 'Computer number on the sticker (optional). It is only used if you ask for help and is not saved.', ar: 'رقم الحاسوب على الملصق (اختياري). يُستخدم فقط إذا طلبت المساعدة ولا يُحفظ.' },
    cont: { en: 'Continue', ar: 'متابعة' },
    start: { en: 'Start', ar: 'ابدأ' },
    practiceTitle: { en: 'Practice first', ar: 'تدريب أولاً' },
    practiceIntro: { en: 'Two practice questions so you can see how it works. They do not count.', ar: 'سؤالان للتدريب لترى كيف يعمل. لا يُحتسبان.' },
    practiceTag: { en: 'Practice – not counted', ar: 'تدريب – لا يُحتسب' },
    wellDone: { en: 'Well done. That is how it works.', ar: 'أحسنت. هكذا يعمل.' },
    tryAgain: { en: 'Not quite. Try again, or continue.', ar: 'ليس تماماً. حاول مرة أخرى، أو تابع.' },
    readyTitle: { en: 'Ready?', ar: 'هل أنت جاهز؟' },
    readyText: { en: 'Answer what you can. If you do not know, choose "I don\'t know". That is fine and helps us too. You can go back to change an answer.', ar: 'أجب عمّا تستطيع. إذا كنت لا تعرف، اختر "لا أعرف". لا بأس بذلك وهو يساعدنا أيضاً. يمكنك الرجوع لتغيير إجابة.' },
    question: { en: 'Question', ar: 'السؤال' },
    of: { en: 'of', ar: 'من' },
    back: { en: 'Back', ar: 'رجوع' },
    next: { en: 'Next', ar: 'التالي' },
    toReview: { en: 'Finish', ar: 'إنهاء' },
    skipNote: { en: 'You did not answer. Press Next again to skip it for now.', ar: 'لم تُجب. اضغط "التالي" مرة أخرى لتتخطاه الآن.' },
    idk: { en: "I don't know", ar: 'لا أعرف' },
    idkTask: { en: "I don't know how to do this", ar: 'لا أعرف كيف أقوم بذلك' },
    reviewTitle: { en: 'Almost done', ar: 'اقتربت من النهاية' },
    allAnswered: { en: 'You answered every question.', ar: 'أجبت على جميع الأسئلة.' },
    unanswered: { en: 'questions are not answered yet.', ar: 'أسئلة لم تُجب عنها بعد.' },
    goFirst: { en: 'Go to the first unanswered question', ar: 'اذهب إلى أول سؤال بلا إجابة' },
    submit: { en: 'Send my answers', ar: 'أرسل إجاباتي' },
    submitting: { en: 'Sending…', ar: 'جارٍ الإرسال…' },
    stop: { en: 'Stop and leave without sending', ar: 'توقف واخرج دون إرسال' },
    stopConfirm: { en: 'Your answers will be deleted. Press again to confirm.', ar: 'سيتم حذف إجاباتك. اضغط مرة أخرى للتأكيد.' },
    stopped: { en: 'You stopped. Your answers were deleted. Thank you.', ar: 'لقد توقفت. تم حذف إجاباتك. شكراً لك.' },
    thanksTitle: { en: 'Thank you!', ar: 'شكراً لك!' },
    thanks: { en: 'Your answers were saved anonymously. They will help AIFD plan training for students.', ar: 'تم حفظ إجاباتك دون اسم. ستساعد معهد AIFD على التخطيط لتدريب الطلاب.' },
    fbTitle: { en: 'What you can learn from this', ar: 'ما يمكنك تعلّمه من هذا' },
    fbFull: { en: 'Correct', ar: 'صحيح' }, fbPartial: { en: 'Partly correct', ar: 'صحيح جزئياً' },
    fbWrong: { en: 'Not correct', ar: 'غير صحيح' }, fbIdk: { en: "You chose I don't know", ar: 'اخترت لا أعرف' }, fbSkipped: { en: 'Not answered', ar: 'لم تُجب' },
    lockTitle: { en: 'Thank you', ar: 'شكراً لك' },
    lockText: { en: 'Please leave this computer for the next student.', ar: 'يرجى ترك هذا الحاسوب للطالب التالي.' },
    lockCode: { en: 'Supervisor: enter the next-student code', ar: 'المشرف: أدخل رمز الطالب التالي' },
    unlock: { en: 'Unlock', ar: 'فتح' },
    badCode: { en: 'That code is not right.', ar: 'هذا الرمز غير صحيح.' },
    closedTitle: { en: 'Please wait', ar: 'يرجى الانتظار' },
    closed: { en: 'The assessment is not open yet. The supervisor will start it soon. This page checks automatically.', ar: 'التقييم غير مفتوح بعد. سيبدأه المشرف قريباً. هذه الصفحة تتحقق تلقائياً.' },
    help: { en: 'I need help', ar: 'أحتاج مساعدة' },
    helpAsk: { en: 'Ask the supervisor to come?', ar: 'هل تطلب حضور المشرف؟' },
    helpYes: { en: 'Yes, call the supervisor', ar: 'نعم، اطلب المشرف' },
    helpSent: { en: 'Help is on the way. You can also raise your hand. Your code:', ar: 'المساعدة في الطريق. يمكنك أيضاً رفع يدك. رمزك:' },
    helpCancel: { en: 'I am fine now', ar: 'أنا بخير الآن' },
    close: { en: 'Close', ar: 'إغلاق' },
    saved: { en: 'Saved', ar: 'تم الحفظ' },
    offline: { en: 'Not connected. Your answers are kept on this computer.', ar: 'غير متصل. إجاباتك محفوظة على هذا الحاسوب.' },
    targetsStart: { en: 'Start', ar: 'ابدأ' },
    targetsDone: { en: 'Finished. Press Next.', ar: 'انتهيت. اضغط "التالي".' },
    typeHere: { en: 'Type here', ar: 'اكتب هنا' },
    pasteHere: { en: 'Paste here', ar: 'الصق هنا' },
    keepOrder: { en: 'This order is right', ar: 'هذا الترتيب صحيح' },
    up: { en: 'Move up', ar: 'تحريك للأعلى' }, down: { en: 'Move down', ar: 'تحريك للأسفل' },
    choose: { en: 'Choose…', ar: 'اختر…' },
    chooseAll: { en: 'You can choose more than one.', ar: 'يمكنك اختيار أكثر من إجابة.' },
    pool: { en: 'Items to place', ar: 'العناصر' },
    files: { newFolder: { en: 'New folder', ar: 'مجلد جديد' }, rename: { en: 'Rename', ar: 'إعادة تسمية' }, moveTo: { en: 'Move to…', ar: 'نقل إلى…' },
      open: { en: 'Open', ar: 'فتح' }, up: { en: 'Back to Documents', ar: 'رجوع إلى المستندات' }, name: { en: 'New name', ar: 'الاسم الجديد' },
      ok: { en: 'OK', ar: 'موافق' }, cancel: { en: 'Cancel', ar: 'إلغاء' }, empty: { en: 'This folder is empty.', ar: 'هذا المجلد فارغ.' },
      select: { en: 'Click a file or folder to select it.', ar: 'انقر على ملف أو مجلد لتحديده.' }, docs: { en: 'Documents', ar: 'المستندات' },
      dragHint: { en: 'Tip: you can also drag a file onto a folder.', ar: '' } },
  };
  const tr = k => { const v = k.split('.').reduce((o, p) => o && o[p], T); return v ? (v[S.lang] ?? v.en) : k; };
  const L = o => (o ? (o[S.lang] || o.en) : '');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- state ---------- */
  const prefs = ls.get(K.prefs) || {};
  const S = { lang: prefs.lang || 'ar', info: null, cur: null, flat: [], idx: 0, phase: 'lang', practiceIdx: 0, practiceAns: {}, skipWarn: false, saveTimer: null, online: true };

  function applyPrefs() {
    document.documentElement.lang = S.lang;
    document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('big', !!prefs.big);
    document.body.classList.toggle('contrast', !!prefs.contrast);
    $('#btnBig').setAttribute('aria-pressed', String(!!prefs.big));
    $('#btnContrast').setAttribute('aria-pressed', String(!!prefs.contrast));
    $('#btnBig').title = S.lang === 'ar' ? 'تكبير النص' : 'Larger text';
    $('#btnContrast').title = S.lang === 'ar' ? 'تباين عالٍ' : 'High contrast';
    $('#btnHelp').textContent = tr('help');
  }
  $('#btnBig').onclick = () => { prefs.big = !prefs.big; ls.set(K.prefs, prefs); applyPrefs(); };
  $('#btnContrast').onclick = () => { prefs.contrast = !prefs.contrast; ls.set(K.prefs, prefs); applyPrefs(); };

  async function api(path, body) {
    const { status, json: j } = await window.AIFD.call(path, body);
    if (status < 200 || status >= 300) { const e = new Error(j.error || 'HTTP ' + status); e.status = status; throw e; }
    return j;
  }

  /* ---------- seeded layout (same order after a refresh) ---------- */
  function rng(seedHex) {
    let a = parseInt(seedHex.slice(0, 8), 16) >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function shuffle(arr, r, mustDiffer) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    if (mustDiffer && a.length > 1 && a.every((x, i) => x === arr[i])) a.push(a.shift());
    return a;
  }
  function buildFlat(inst, sid) {
    const r = rng(sid);
    const flat = [];
    inst.SECTIONS.forEach(sec => {
      const items = sec.shuffle ? shuffle(sec.items, r) : sec.items;
      items.forEach(it => {
        const lay = {};
        if (it.options) lay.options = (it.noShuffle || it.type === 'likert' || it.type === 'choice') ? it.options : shuffle(it.options, r, true);
        if (it.cards) lay.cards = shuffle(it.cards, r);
        if (it.right) lay.right = shuffle(it.right, r);
        if (it.sentences) lay.sentences = shuffle(it.sentences, r);
        if (it.steps) lay.steps = shuffle(it.steps, r, true);
        flat.push({ sec, it, lay });
      });
    });
    return flat;
  }

  /* ---------- persistence ---------- */
  function persistLocal() { if (S.cur) ls.set(K.cur, Object.assign({}, S.cur, { idx: S.idx })); }
  function setSave(state) {
    const el = $('#savestate');
    el.textContent = state === 'ok' ? '✓ ' + tr('saved') : state === 'off' ? tr('offline') : '';
    el.className = 'savestate ' + (state || '');
  }
  function queueSave() {
    persistLocal();
    clearTimeout(S.saveTimer);
    S.saveTimer = setTimeout(pushSave, 700);
  }
  async function pushSave() {
    if (!S.cur) return;
    try {
      const r = await api('/api/save', { sid: S.cur.sid, token: S.cur.token, answers: S.cur.answers, pos: S.idx });
      setSave('ok'); S.online = true;
      if (!r.help && S.cur.helpOn) { S.cur.helpOn = false; persistLocal(); renderHelp(); }
    } catch (e) {
      if (e.status === 404) { ls.del(K.cur); S.cur = null; return boot(); }
      setSave('off'); S.online = false;
    }
  }
  setInterval(() => { if (S.cur && S.phase === 'item') pushSave(); }, 20000);
  window.addEventListener('beforeunload', e => { if (S.cur && (S.phase === 'item' || S.phase === 'review')) { persistLocal(); e.preventDefault(); e.returnValue = ''; } });

  function setAnswer(id, v) {
    if (!S.cur) return;
    if (v === undefined) delete S.cur.answers[id]; else S.cur.answers[id] = v;
    S.skipWarn = false;
    queueSave();
  }

  /* ---------- help ---------- */
  function renderHelp() {
    const btn = $('#btnHelp'), p = $('#helpPanel');
    btn.hidden = !S.cur;
    btn.classList.toggle('on', !!(S.cur && S.cur.helpOn));
    if (!S.helpOpen || !S.cur) { p.hidden = true; return; }
    p.hidden = false;
    p.innerHTML = S.cur.helpOn
      ? `<p>${tr('helpSent')} <b class="code">${esc(S.cur.short)}</b>${S.cur.station ? ' · PC ' + esc(S.cur.station) : ''}</p>
         <div class="row"><button type="button" class="btn ghost" id="helpCancel">${tr('helpCancel')}</button><button type="button" class="btn ghost" id="helpClose">${tr('close')}</button></div>`
      : `<p>${tr('helpAsk')}</p><div class="row"><button type="button" class="btn warm" id="helpYes">${tr('helpYes')}</button><button type="button" class="btn ghost" id="helpClose">${tr('close')}</button></div>`;
  }
  $('#btnHelp').onclick = () => { S.helpOpen = !S.helpOpen; renderHelp(); };
  $('#helpPanel').addEventListener('click', async e => {
    const id = e.target.id;
    if (id === 'helpClose') { S.helpOpen = false; renderHelp(); }
    if (id === 'helpYes' || id === 'helpCancel') {
      try {
        await api('/api/help', { sid: S.cur.sid, token: S.cur.token, station: S.cur.station, pos: S.idx, cancel: id === 'helpCancel' });
        S.cur.helpOn = id === 'helpYes'; persistLocal();
        if (id === 'helpCancel') S.helpOpen = false;
      } catch (err) { setSave('off'); }
      renderHelp();
    }
  });

  /* ---------- screens ---------- */
  function screen(html, focus) {
    app.innerHTML = html;
    applyPrefs(); renderHelp();
    const f = focus ? $(focus) : app; if (f) f.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function showLang() {
    S.phase = 'lang';
    screen(`<section class="card center">
      <h1 class="big-title">AIFD</h1>
      <p class="muted">${esc(T.chooseLang.ar)} · ${esc(T.chooseLang.en)}</p>
      <div class="choices two">
        <button type="button" class="choice xl" data-lang="ar" lang="ar" dir="rtl">العربية</button>
        <button type="button" class="choice xl" data-lang="en" lang="en" dir="ltr">English</button>
      </div></section>`);
    app.querySelectorAll('[data-lang]').forEach(b => { b.onclick = () => { S.lang = b.dataset.lang; prefs.lang = S.lang; ls.set(K.prefs, prefs); showWelcome(); }; });
  }

  async function showClosed() {
    S.phase = 'closed';
    screen(`<section class="card center"><h1>${tr('closedTitle')}</h1><p>${tr('closed')}</p><div class="pulse" aria-hidden="true"></div></section>`);
    const poll = async () => {
      if (S.phase !== 'closed') return;
      try { S.info = await api('/api/info'); if (S.info.open) return showWelcome(); } catch (e) { /* retry */ }
      setTimeout(poll, 5000);
    };
    setTimeout(poll, 5000);
  }

  function showWelcome() {
    if (!S.info || !S.info.open) return showClosed();
    S.phase = 'welcome';
    screen(`<section class="card">
      <h1>${tr('welcomeTitle')}</h1>
      <ul class="welcome">${T.welcome[S.lang].map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <div class="row wrap">
        <button type="button" class="btn" id="agree">${tr('agree')}</button>
        <button type="button" class="btn ghost" id="decline">${tr('noThanks')}</button>
      </div></section>`, '#agree');
    $('#agree').onclick = showSetup;
    $('#decline').onclick = () => screen(`<section class="card center"><p class="lead">${tr('declined')}</p>
      <button type="button" class="btn ghost" id="again">${tr('back')}</button></section>`) || ($('#again').onclick = showLang);
  }

  function showSetup() {
    S.phase = 'setup';
    const sel = { program: null, level: null };
    const group = (name, list) => `<fieldset class="pick"><legend>${tr(name)}</legend><div class="choices">${list.map(v =>
      `<button type="button" class="choice" data-${name}="${esc(v)}" aria-pressed="false">${esc(v)}</button>`).join('')}</div></fieldset>`;
    screen(`<section class="card">
      ${group('program', S.info.programs)}
      ${group('level', S.info.levels)}
      <label class="field"><span>${tr('station')}</span><input id="station" inputmode="numeric" maxlength="6" autocomplete="off"></label>
      <p id="setupErr" class="err" role="alert"></p>
      <button type="button" class="btn" id="go" disabled>${tr('cont')}</button></section>`);
    const upd = () => { $('#go').disabled = !(sel.program && sel.level); };
    ['program', 'level'].forEach(n => app.querySelectorAll(`[data-${n}]`).forEach(b => {
      b.onclick = () => { sel[n] = b.dataset[n]; app.querySelectorAll(`[data-${n}]`).forEach(x => x.setAttribute('aria-pressed', String(x === b))); upd(); };
    }));
    $('#go').onclick = async () => {
      $('#go').disabled = true;
      try {
        const r = await api('/api/start', { program: sel.program, level: sel.level, lang: S.lang });
        S.cur = { sid: r.sid, token: r.token, short: r.short, batchId: r.batchId, lang: S.lang, answers: {}, station: $('#station').value.trim(), inst: r.instrument };
        S.flat = buildFlat(r.instrument, r.sid); S.idx = 0;
        persistLocal(); showPracticeIntro();
      } catch (e) {
        if (e.status === 409) return showClosed();
        $('#setupErr').textContent = S.lang === 'ar' ? 'تعذّر البدء. حاول مرة أخرى أو اطلب المساعدة.' : 'Could not start. Try again or ask for help.';
        $('#go').disabled = false;
      }
    };
  }

  function showPracticeIntro() {
    S.phase = 'practiceIntro';
    screen(`<section class="card"><h1>${tr('practiceTitle')}</h1><p class="lead">${tr('practiceIntro')}</p>
      <button type="button" class="btn" id="go">${tr('start')}</button></section>`, '#go');
    $('#go').onclick = () => { S.practiceIdx = 0; showPractice(); };
  }

  function showPractice() {
    S.phase = 'practice';
    const p = S.cur.inst.PRACTICE[S.practiceIdx];
    const lay = { options: p.options, cards: p.cards };
    screen(`<section class="card"><span class="tag">${tr('practiceTag')}</span>
      <h2 class="prompt">${esc(L(p.prompt))}</h2><div id="w"></div><p id="pfb" class="pfb" role="status" aria-live="polite"></p>
      <div class="nav"><span></span><button type="button" class="btn" id="next">${tr('next')}</button></div></section>`);
    const ans = S.practiceAns;
    renderWidget($('#w'), p, lay, () => ans[p.id], v => {
      ans[p.id] = v;
      const ok = p.type === 'mcq' ? v === p.key : v && Object.keys(p.key).every(k => v[k] === p.key[k]);
      const done = p.type === 'mcq' || (v && Object.keys(v).length === Object.keys(p.key).length);
      $('#pfb').textContent = done ? (ok ? tr('wellDone') : tr('tryAgain')) : '';
      $('#pfb').className = 'pfb ' + (done ? (ok ? 'good' : 'warn') : '');
    }, true);
    $('#next').onclick = () => { if (S.practiceIdx < S.cur.inst.PRACTICE.length - 1) { S.practiceIdx++; showPractice(); } else showReady(); };
  }

  function showReady() {
    S.phase = 'ready';
    screen(`<section class="card"><h1>${tr('readyTitle')}</h1><p class="lead">${tr('readyText')}</p>
      <button type="button" class="btn" id="go">${tr('start')}</button></section>`, '#go');
    $('#go').onclick = () => { S.idx = 0; showItem(); };
  }

  function answered(id) { const v = S.cur.answers[id]; return v !== undefined && v !== null; }

  function showItem() {
    S.phase = 'item';
    const n = S.flat.length, { sec, it, lay } = S.flat[S.idx];
    const isTask = ['targets', 'typing', 'paste', 'files'].includes(it.type);
    const firstOfSec = S.idx === 0 || S.flat[S.idx - 1].sec !== sec;
    screen(`<section class="card item">
      <div class="progress" role="progressbar" aria-valuemin="1" aria-valuemax="${n}" aria-valuenow="${S.idx + 1}"><i style="width:${Math.round(100 * (S.idx + 1) / n)}%"></i></div>
      <div class="meta"><span>${esc(L(sec.title))}</span><span>${tr('question')} ${S.idx + 1} ${tr('of')} ${n}</span></div>
      ${firstOfSec && sec.intro ? `<p class="secintro">${esc(L(sec.intro))}</p>` : ''}
      <h2 class="prompt" id="prompt">${esc(L(it.prompt))}</h2>
      ${it.type === 'multi' ? `<p class="muted small">${tr('chooseAll')}</p>` : ''}
      <div id="w" aria-labelledby="prompt"></div>
      ${it.idk ? `<button type="button" class="idk" id="idk" aria-pressed="${S.cur.answers[it.id] === 'idk'}">${isTask ? tr('idkTask') : tr('idk')}</button>` : ''}
      <p id="skip" class="skipnote" role="status" aria-live="polite"></p>
      <div class="nav">
        <button type="button" class="btn ghost" id="back" ${S.idx === 0 ? 'disabled' : ''}>${tr('back')}</button>
        <button type="button" class="btn" id="next">${S.idx === n - 1 ? tr('toReview') : tr('next')}</button>
      </div></section>`, '#prompt');
    $('#prompt').tabIndex = -1; $('#prompt').focus({ preventScroll: true });
    const redraw = () => renderWidget($('#w'), it, lay, () => S.cur.answers[it.id], v => {
      setAnswer(it.id, v); const b = $('#idk'); if (b) b.setAttribute('aria-pressed', 'false');
    });
    redraw();
    const idk = $('#idk');
    if (idk) idk.onclick = () => {
      const on = S.cur.answers[it.id] === 'idk';
      setAnswer(it.id, on ? undefined : 'idk');
      idk.setAttribute('aria-pressed', String(!on));
      redraw();
    };
    $('#back').onclick = () => { if (S.idx > 0) { S.idx--; persistLocal(); showItem(); } };
    $('#next').onclick = () => {
      if (!answered(it.id) && !S.skipWarn && it.evidence !== 'context') { S.skipWarn = true; $('#skip').textContent = tr('skipNote'); return; }
      S.skipWarn = false;
      if (S.idx < n - 1) { S.idx++; persistLocal(); pushSave(); showItem(); } else showReview();
    };
  }

  function showReview() {
    S.phase = 'review';
    const missing = S.flat.map((f, i) => ({ f, i })).filter(x => !answered(x.f.it.id));
    screen(`<section class="card"><h1>${tr('reviewTitle')}</h1>
      <p class="lead">${missing.length ? `<b>${missing.length}</b> ${tr('unanswered')}` : tr('allAnswered')}</p>
      ${missing.length ? `<button type="button" class="btn ghost" id="first">${tr('goFirst')}</button>` : ''}
      <div class="row wrap" style="margin-top:20px">
        <button type="button" class="btn ghost" id="back">${tr('back')}</button>
        <button type="button" class="btn" id="send">${tr('submit')}</button>
      </div>
      <p id="err" class="err" role="alert"></p>
      <hr><button type="button" class="linkish" id="stop">${tr('stop')}</button><p id="stopMsg" class="err"></p></section>`, '#send');
    if (missing.length) $('#first').onclick = () => { S.idx = missing[0].i; showItem(); };
    $('#back').onclick = () => { S.idx = S.flat.length - 1; showItem(); };
    let stopArmed = false;
    $('#stop').onclick = async () => {
      if (!stopArmed) { stopArmed = true; $('#stopMsg').textContent = tr('stopConfirm'); return; }
      try { await api('/api/withdraw', { sid: S.cur.sid, token: S.cur.token }); } catch (e) { /* deleted locally anyway */ }
      const batch = S.cur.batchId; ls.del(K.cur); S.cur = null; ls.set(K.lock, batch);
      screen(`<section class="card center"><p class="lead">${tr('stopped')}</p></section>`);
      setTimeout(showLocked, 4000);
    };
    $('#send').onclick = async () => {
      const b = $('#send'); b.disabled = true; b.textContent = tr('submitting');
      try {
        const r = await api('/api/submit', { sid: S.cur.sid, token: S.cur.token, answers: S.cur.answers, lang: S.lang });
        const batch = S.cur.batchId; ls.del(K.cur); S.cur = null; ls.set(K.lock, batch);
        showDone(r.feedback);
      } catch (e) {
        b.disabled = false; b.textContent = tr('submit');
        $('#err').textContent = tr('offline') + (S.lang === 'ar' ? ' حاول مرة أخرى بعد قليل.' : ' Try again in a moment.');
      }
    };
  }

  function showDone(fb) {
    S.phase = 'done';
    const label = s => tr({ full: 'fbFull', partial: 'fbPartial', wrong: 'fbWrong', idk: 'fbIdk', skipped: 'fbSkipped' }[s]);
    screen(`<section class="card"><h1>${tr('thanksTitle')}</h1><p class="lead">${tr('thanks')}</p>
      ${fb ? `<h2>${tr('fbTitle')}</h2><ol class="fb">${fb.map(f => `<li><p>${esc(f.prompt)}</p><p><span class="st ${f.status}">${label(f.status)}</span>${f.explain ? ' ' + esc(f.explain) : ''}</p></li>`).join('')}</ol>` : ''}
      <button type="button" class="btn" id="fin">${tr('close')}</button></section>`);
    $('#fin').onclick = showLocked;
    if (!fb) setTimeout(() => { if (S.phase === 'done') showLocked(); }, 15000);
  }

  function showLocked() {
    S.phase = 'locked';
    screen(`<section class="card center"><h1>${tr('lockTitle')}</h1><p class="lead">${tr('lockText')}</p>
      <details class="sup"><summary>${tr('lockCode')}</summary>
        <div class="row"><input id="code" inputmode="numeric" maxlength="4" autocomplete="off" aria-label="${tr('lockCode')}"><button type="button" class="btn" id="unlock">${tr('unlock')}</button></div>
        <p id="err" class="err" role="alert"></p></details></section>`);
    $('#unlock').onclick = async () => {
      try { await api('/api/unlock', { code: $('#code').value }); ls.del(K.lock); S.practiceAns = {}; boot(); }
      catch (e) { $('#err').textContent = tr('badCode'); }
    };
  }

  /* ---------- widgets ---------- */
  function renderWidget(host, it, lay, get, set, practice) {
    const R = WIDGETS[it.type];
    host.innerHTML = '';
    if (R) R(host, it, lay, get, set, practice);
  }
  const press = (el, on) => el.setAttribute('aria-pressed', String(!!on));

  const WIDGETS = {
    likert: (h, it, lay, get, set) => WIDGETS.mcq(h, it, lay, get, set),
    choice: (h, it, lay, get, set) => WIDGETS.mcq(h, it, lay, get, set),
    mcq(h, it, lay, get, set) {
      const cls = it.style === 'results' ? 'results' : it.type === 'likert' ? 'choices likert' : 'choices col';
      h.innerHTML = `<div class="${cls}" role="group">${lay.options.map(o => `<button type="button" class="choice${it.style === 'results' ? ' result' : ''}" data-v="${esc(o.id)}" aria-pressed="${get() === o.id}">${it.style === 'results' ? fmtResult(L(o)) : esc(L(o))}</button>`).join('')}</div>`;
      h.querySelectorAll('[data-v]').forEach(b => { b.onclick = () => { set(b.dataset.v); h.querySelectorAll('[data-v]').forEach(x => press(x, x === b)); }; });
    },
    multi(h, it, lay, get, set) {
      const cur = () => (Array.isArray(get()) ? get() : []);
      h.innerHTML = `<div class="choices col" role="group">${lay.options.map(o => `<button type="button" class="choice check" data-v="${esc(o.id)}" aria-pressed="${cur().includes(o.id)}">${esc(L(o))}</button>`).join('')}</div>`;
      h.querySelectorAll('[data-v]').forEach(b => { b.onclick = () => {
        const s = new Set(cur()); s.has(b.dataset.v) ? s.delete(b.dataset.v) : s.add(b.dataset.v);
        const arr = [...s]; set(arr.length ? arr : undefined); press(b, s.has(b.dataset.v));
      }; });
    },
    findError(h, it, lay, get, set) {
      h.innerHTML = `<div class="bubble"><div class="bubble-head">AI</div>${lay.sentences.map(s => `<button type="button" class="sentence" data-v="${esc(s.id)}" aria-pressed="${get() === s.id}">${esc(L(s))}</button>`).join('')}</div>`;
      h.querySelectorAll('[data-v]').forEach(b => { b.onclick = () => { set(b.dataset.v); h.querySelectorAll('[data-v]').forEach(x => press(x, x === b)); }; });
    },
    sort(h, it, lay, get, set) {
      let sel = null;
      const val = () => (get() && typeof get() === 'object' && get() !== 'idk' ? Object.assign({}, get()) : {});
      const draw = () => {
        const v = val();
        const card = c => `<button type="button" class="sortcard${sel === c.id ? ' sel' : ''}" draggable="true" data-card="${esc(c.id)}" aria-pressed="${sel === c.id}">${esc(L(c))}</button>`;
        const pool = lay.cards.filter(c => !v[c.id]);
        h.innerHTML = `<div class="pool" data-bin="" aria-label="${tr('pool')}">${pool.map(card).join('') || '<span class="muted small">✓</span>'}</div>
          <div class="bins">${it.categories.map(cat => `<div class="bin" data-bin="${esc(cat.id)}" role="button" tabindex="0"><div class="binlabel">${esc(L(cat))}</div>${lay.cards.filter(c => v[c.id] === cat.id).map(card).join('')}</div>`).join('')}</div>`;
        h.querySelectorAll('[data-card]').forEach(b => {
          b.onclick = e => { e.stopPropagation(); sel = sel === b.dataset.card ? null : b.dataset.card; draw(); };
          b.ondragstart = e => { e.dataTransfer.setData('text/plain', b.dataset.card); sel = b.dataset.card; };
        });
        h.querySelectorAll('[data-bin]').forEach(bin => {
          const drop = id => { const nv = val(); if (bin.dataset.bin) nv[id] = bin.dataset.bin; else delete nv[id]; sel = null; set(Object.keys(nv).length ? nv : undefined); draw(); };
          bin.onclick = () => { if (sel) drop(sel); };
          bin.onkeydown = e => { if ((e.key === 'Enter' || e.key === ' ') && sel) { e.preventDefault(); drop(sel); } };
          bin.ondragover = e => { e.preventDefault(); bin.classList.add('over'); };
          bin.ondragleave = () => bin.classList.remove('over');
          bin.ondrop = e => { e.preventDefault(); bin.classList.remove('over'); const id = e.dataTransfer.getData('text/plain'); if (id) drop(id); };
        });
      };
      draw();
    },
    match(h, it, lay, get, set) {
      const v = () => (get() && typeof get() === 'object' ? Object.assign({}, get()) : {});
      h.innerHTML = `<div class="match">${it.left.map(l => `<label class="mrow"><span class="mleft" dir="ltr">${esc(L(l))}</span>
        <select data-l="${esc(l.id)}"><option value="">${tr('choose')}</option>${lay.right.map(r => `<option value="${esc(r.id)}" ${v()[l.id] === r.id ? 'selected' : ''}>${esc(L(r))}</option>`).join('')}</select></label>`).join('')}</div>`;
      h.querySelectorAll('select').forEach(s => { s.onchange = () => { const nv = v(); if (s.value) nv[s.dataset.l] = s.value; else delete nv[s.dataset.l]; set(Object.keys(nv).length ? nv : undefined); }; });
    },
    order(h, it, lay, get, set) {
      let ord = Array.isArray(get()) ? get().slice() : lay.steps.map(s => s.id);
      const byId = Object.fromEntries(it.steps.map(s => [s.id, s]));
      const draw = () => {
        h.innerHTML = `<ol class="order">${ord.map((id, i) => `<li><span class="num">${i + 1}</span><span class="otext">${esc(L(byId[id]))}</span>
          <span class="obtns"><button type="button" class="tool" data-up="${i}" aria-label="${tr('up')}" ${i === 0 ? 'disabled' : ''}>▲</button><button type="button" class="tool" data-down="${i}" aria-label="${tr('down')}" ${i === ord.length - 1 ? 'disabled' : ''}>▼</button></span></li>`).join('')}</ol>
          ${Array.isArray(get()) ? '' : `<button type="button" class="btn ghost small" id="keep">${tr('keepOrder')}</button>`}`;
        h.querySelectorAll('[data-up],[data-down]').forEach(b => { b.onclick = () => {
          const i = Number(b.dataset.up ?? b.dataset.down), j = b.dataset.up !== undefined ? i - 1 : i + 1;
          [ord[i], ord[j]] = [ord[j], ord[i]]; set(ord.slice()); draw();
          const again = h.querySelector(`[data-${b.dataset.up !== undefined ? 'up' : 'down'}="${j}"]`); if (again && !again.disabled) again.focus();
        }; });
        const k = h.querySelector('#keep'); if (k) k.onclick = () => { set(ord.slice()); draw(); };
      };
      draw();
    },
    targets(h, it, lay, get, set) {
      const prev = get();
      if (prev && typeof prev === 'object') { h.innerHTML = `<div class="tarea done"><p>${tr('targetsDone')}</p></div>`; return; }
      h.innerHTML = `<div class="tarea" id="ta"><button type="button" class="btn" id="tgo">${tr('targetsStart')}</button></div>`;
      const area = h.querySelector('#ta');
      h.querySelector('#tgo').onclick = () => {
        let i = 0, hits = 0, misses = 0, timer = null;
        area.innerHTML = '';
        const finish = () => { clearTimeout(timer); area.innerHTML = `<p>${tr('targetsDone')}</p>`; area.classList.add('done'); set({ hits, misses, total: it.count }); };
        const next = () => {
          clearTimeout(timer);
          if (i >= it.count) return finish();
          i++;
          area.innerHTML = '';
          const dot = document.createElement('button');
          dot.type = 'button'; dot.className = 'target'; dot.setAttribute('aria-label', 'target ' + i);
          const w = area.clientWidth - 56, hh = area.clientHeight - 56;
          dot.style.left = Math.round(Math.random() * Math.max(0, w)) + 'px';
          dot.style.top = Math.round(Math.random() * Math.max(0, hh)) + 'px';
          dot.onclick = e => { e.stopPropagation(); hits++; next(); };
          area.appendChild(dot);
          timer = setTimeout(next, it.timeoutMs);
        };
        area.onclick = () => { misses++; };
        next();
      };
    },
    typing(h, it, lay, get, set) {
      const v = get() && typeof get() === 'object' ? get().text : '';
      h.innerHTML = `<div class="tgt" dir="ltr">${esc(it.target)}</div><input id="ty" class="bigin" dir="ltr" autocomplete="off" spellcheck="false" placeholder="${tr('typeHere')}" value="${esc(v)}">`;
      const inp = h.querySelector('#ty');
      inp.onpaste = e => e.preventDefault();
      inp.oninput = () => set(inp.value ? { text: inp.value } : undefined);
    },
    paste(h, it, lay, get, set) {
      const cur = get() && typeof get() === 'object' ? get() : { text: '', pasted: false };
      h.innerHTML = `<div class="codebox" dir="ltr">${esc(it.code)}</div><input id="pi" class="bigin" dir="ltr" autocomplete="off" spellcheck="false" placeholder="${tr('pasteHere')}" value="${esc(cur.text)}">`;
      const inp = h.querySelector('#pi'); let pasted = !!cur.pasted;
      inp.onpaste = () => { pasted = true; };
      inp.oninput = () => set(inp.value ? { text: inp.value, pasted } : undefined);
    },
    files: filesWidget,
  };

  function fmtResult(s) {
    const i = s.indexOf(' — '), j = s.indexOf(': ');
    if (i > 0) return `<span class="rurl" dir="ltr">${esc(s.slice(0, i))}</span><span class="rtitle">${esc(s.slice(i + 3))}</span>`;
    if (j > 0) return `<span class="rurl">${esc(s.slice(0, j))}</span><span class="rtitle">${esc(s.slice(j + 2))}</span>`;
    return `<span class="rtitle">${esc(s)}</span>`;
  }

  /* simulated File Explorer */
  function filesWidget(h, it, lay, get, set) {
    const prev = get();
    let tree = prev && Array.isArray(prev.tree) ? prev.tree.map(n => ({ ...n })) : it.initial.map(n => ({ ...n }));
    let cwd = 'root', sel = null, mode = null, newId = 1;
    const icon = n => n.kind === 'folder' ? '📁' : n.kind === 'pdf' ? '📕' : '📄';
    const save = () => set({ tree: tree.map(n => ({ id: n.id, name: n.name, kind: n.kind, parent: n.parent })) });
    const folders = () => tree.filter(n => n.kind === 'folder');
    const nameOf = id => id === 'root' ? tr('files.docs') : (tree.find(n => n.id === id) || {}).name;
    const draw = () => {
      const here = tree.filter(n => n.parent === cwd);
      const s = tree.find(n => n.id === sel);
      h.innerHTML = `<div class="fx" dir="ltr">
        <div class="fxbar"><span class="crumb">${cwd !== 'root' ? `<button type="button" class="tool" id="fxUp" title="${tr('files.up')}">←</button>` : ''} 📂 ${esc(tr('files.docs'))}${cwd !== 'root' ? ' › ' + esc(nameOf(cwd)) : ''}</span></div>
        <div class="fxtools">
          <button type="button" class="tool" id="fxNew">📁+ ${tr('files.newFolder')}</button>
          <button type="button" class="tool" id="fxRen" ${s ? '' : 'disabled'}>✎ ${tr('files.rename')}</button>
          <button type="button" class="tool" id="fxMove" ${s && s.kind !== 'folder' ? '' : 'disabled'}>➜ ${tr('files.moveTo')}</button>
          ${s && s.kind === 'folder' ? `<button type="button" class="tool" id="fxOpen">${tr('files.open')}</button>` : ''}
        </div>
        ${mode === 'rename' || mode === 'new' ? `<div class="fxdlg"><label>${tr('files.name')} <input id="fxName" value="${esc(mode === 'rename' ? s.name : '')}" autocomplete="off" spellcheck="false"></label><button type="button" class="tool" id="fxOk">${tr('files.ok')}</button><button type="button" class="tool" id="fxCancel">${tr('files.cancel')}</button></div>` : ''}
        ${mode === 'move' ? `<div class="fxdlg">${[{ id: 'root' }].concat(folders()).filter(f => f.id !== s.parent).map(f => `<button type="button" class="tool" data-to="${f.id}">📁 ${esc(nameOf(f.id))}</button>`).join('')}<button type="button" class="tool" id="fxCancel">${tr('files.cancel')}</button></div>` : ''}
        <div class="fxlist">${here.length ? here.map(n => `<button type="button" class="fxitem${sel === n.id ? ' sel' : ''}" data-id="${n.id}" draggable="${n.kind !== 'folder'}"><span class="ico" aria-hidden="true">${icon(n)}</span><span>${esc(n.name)}</span></button>`).join('') : `<p class="muted small">${tr('files.empty')}</p>`}</div>
        <p class="muted small" dir="${S.lang === 'ar' ? 'rtl' : 'ltr'}">${tr('files.select')}</p></div>`;
      const q = id => h.querySelector('#' + id);
      h.querySelectorAll('.fxitem').forEach(b => {
        const n = tree.find(x => x.id === b.dataset.id);
        b.onclick = () => { sel = n.id; mode = null; draw(); };
        b.ondblclick = () => { if (n.kind === 'folder') { cwd = n.id; sel = null; mode = null; draw(); } };
        b.ondragstart = e => e.dataTransfer.setData('text/plain', n.id);
        if (n.kind === 'folder') {
          b.ondragover = e => e.preventDefault();
          b.ondrop = e => { e.preventDefault(); const f = tree.find(x => x.id === e.dataTransfer.getData('text/plain')); if (f && f.kind !== 'folder') { f.parent = n.id; sel = null; save(); draw(); } };
        }
      });
      if (q('fxUp')) q('fxUp').onclick = () => { cwd = 'root'; sel = null; mode = null; draw(); };
      if (q('fxOpen')) q('fxOpen').onclick = () => { cwd = sel; sel = null; draw(); };
      q('fxNew').onclick = () => { mode = 'new'; draw(); h.querySelector('#fxName').focus(); };
      q('fxRen').onclick = () => { mode = 'rename'; draw(); const i = h.querySelector('#fxName'); i.focus(); i.select(); };
      q('fxMove').onclick = () => { mode = 'move'; draw(); };
      if (q('fxCancel')) q('fxCancel').onclick = () => { mode = null; draw(); };
      h.querySelectorAll('[data-to]').forEach(b => { b.onclick = () => { s.parent = b.dataset.to; sel = null; mode = null; save(); draw(); }; });
      if (q('fxOk')) {
        const ok = () => {
          const v = h.querySelector('#fxName').value.trim().slice(0, 40); if (!v) return;
          if (mode === 'new') { const id = 'n' + (newId++) + Date.now().toString(36).slice(-3); tree.push({ id, name: v, kind: 'folder', parent: cwd }); sel = id; }
          else s.name = v;
          mode = null; save(); draw();
        };
        q('fxOk').onclick = ok;
        h.querySelector('#fxName').onkeydown = e => { if (e.key === 'Enter') ok(); if (e.key === 'Escape') { mode = null; draw(); } };
      }
    };
    draw();
  }

  /* ---------- boot ---------- */
  async function boot() {
    applyPrefs();
    try { S.info = await api('/api/info'); }
    catch (e) { screen(`<section class="card center"><p class="lead">${tr('offline')}</p></section>`); return setTimeout(boot, 5000); }
    const saved = ls.get(K.cur);
    if (saved && saved.sid) {
      try {
        const r = await api('/api/resume', { sid: saved.sid, token: saved.token, pos: saved.idx });
        S.lang = saved.lang || r.lang || S.lang;
        // Merge: keep whichever copy has more answers (local can be ahead of the server after a network drop)
        const answers = Object.keys(saved.answers || {}).length >= Object.keys(r.answers || {}).length ? saved.answers : r.answers;
        S.cur = Object.assign({}, saved, { answers: answers || {}, inst: r.instrument, short: r.short, batchId: r.batchId });
        S.flat = buildFlat(r.instrument, saved.sid);
        S.idx = Math.min(saved.idx || 0, S.flat.length - 1);
        queueSave();
        return showItem();
      } catch (e) {
        if (e.status !== 404) { screen(`<section class="card center"><p class="lead">${tr('offline')}</p></section>`); return setTimeout(boot, 5000); }
        ls.del(K.cur);
      }
    }
    const lock = ls.get(K.lock);
    if (lock && lock === S.info.batchId) return showLocked();
    if (lock) ls.del(K.lock); // a new session batch was started by the supervisor
    S.cur = null;
    showLang();
  }
  boot();
})();
