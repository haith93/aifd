'use strict';
/* AIFD Lab Assessor – supervisor dashboard */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const root = $('#root');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const f1 = v => (v == null ? '–' : String(Math.round(v * 10) / 10));
  const BANDCLS = ['c-bad', 'c-warn', 'c-good'];
  let state = null, results = null, batchSel = 'current', pollT = null, armed = {};

  async function api(path, body) {
    const { status, json: j } = await window.AIFD.call(path, body);
    if (status === 401 && !path.includes('login') && !path.includes('password')) { showLogin(); throw new Error('signed out'); }
    if (status < 200 || status >= 300) throw new Error(j.error || 'Request failed (' + status + ')');
    return j;
  }
  // Export buttons: <button data-dl="/api/admin/...">. A link would not carry the Apps Script sign-in.
  document.addEventListener('click', async e => {
    const b = e.target.closest && e.target.closest('[data-dl]'); if (!b) return;
    try { await window.AIFD.download(b.dataset.dl); } catch (err) { toast(err.message); }
  });
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 3500); }
  const tab = () => { const h = location.hash.slice(1); return ['live', 'results', 'settings', 'data'].includes(h) ? h : 'live'; };
  window.addEventListener('hashchange', () => render());

  /* ---------- sign in ---------- */
  async function start() {
    const w = await api('/api/admin/whoami');
    if (!w.hasPassword) return showSetup(w.local, w.setup);
    if (!w.admin) return showLogin();
    shell(); await poll(); if (tab() !== 'live') render();
  }
  function showSetup(local, setup) {
    root.innerHTML = `<div class="login panel form"><h1>Set the supervisor password</h1>
      ${local ? `<p class="muted">First run. Choose a password of at least 8 characters. Students never need it.</p>
      <label>Password<input type="password" id="pw1" autocomplete="new-password"></label>
      <label>Repeat password<input type="password" id="pw2" autocomplete="new-password"></label>
      <p id="err" class="err" role="alert"></p><button class="btn" id="go">Save password</button>`
      : setup === 'editor' ? `<p class="note">Set the first password in the Apps Script editor: <b>Project Settings → Script properties</b>, add <b>NEW_ADMIN_PASSWORD</b> (8+ characters), then run <b>setAdminPassword</b>. Reload this page afterwards.</p>`
      : `<p class="note">For safety, the first password can only be set on the server computer itself. Open <b>http://localhost:8080/admin</b> there.</p>`}</div>`;
    if (!local) return;
    $('#go').onclick = async () => {
      if ($('#pw1').value !== $('#pw2').value) { $('#err').textContent = 'The two passwords are different.'; return; }
      try { await api('/api/admin/setup', { password: $('#pw1').value }); showLogin(); toast('Password saved. Sign in.'); }
      catch (e) { $('#err').textContent = e.message; }
    };
  }
  function showLogin() {
    clearTimeout(pollT);
    root.innerHTML = `<form class="login panel form" id="lf"><h1>Supervisor sign in</h1>
      <label>Password<input type="password" id="pw" autocomplete="current-password" autofocus></label>
      <p id="err" class="err" role="alert"></p><button class="btn" type="submit">Sign in</button></form>`;
    $('#lf').onsubmit = async e => {
      e.preventDefault();
      try { await api('/api/admin/login', { password: $('#pw').value }); start(); }
      catch (err) { $('#err').textContent = err.message; }
    };
  }

  /* ---------- shell ---------- */
  function shell() {
    root.innerHTML = `<header class="atop"><div><div class="muted small">Imam Sadr Foundation · AIFD · LG2.16</div><h1>Lab Assessor · Supervisor</h1></div>
      <div class="row"><span id="openpill"></span><button class="btn ghost small" id="logout">Sign out</button></div></header>
      <nav class="atabs" aria-label="Sections"><a href="#live" data-t="live">Live session</a><a href="#results" data-t="results">Results</a><a href="#settings" data-t="settings">Settings</a><a href="#data" data-t="data">Data</a></nav>
      <main class="amain" id="view"></main>`;
    $('#logout').onclick = async () => { await api('/api/admin/logout', {}); showLogin(); };
  }
  async function poll() {
    clearTimeout(pollT);
    try { state = await api('/api/admin/state'); paintPill(); if (tab() === 'live') renderLive(); } catch (e) { if (e.message === 'signed out') return; }
    pollT = setTimeout(poll, 5000);
  }
  function paintPill() {
    const p = $('#openpill'); if (!p || !state) return;
    p.innerHTML = state.config.open ? '<span class="pill open">Assessment open</span>' : '<span class="pill closed">Assessment closed</span>';
  }
  function render() {
    if (!$('#view')) return;
    document.querySelectorAll('.atabs a').forEach(a => { if (a.dataset.t === tab()) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    ({ live: renderLive, results: renderResults, settings: renderSettings, data: renderData })[tab()]();
  }

  /* ---------- live ---------- */
  function renderLive() {
    const v = $('#view'); if (!state) { v.innerHTML = '<p class="muted">Loading…</p>'; return; }
    const c = state.config, k = state.counts;
    const helpHtml = state.help.length ? state.help.map(h => `<div class="h"><div><b>${esc(h.short)}</b>${h.station ? ` · PC <b>${esc(h.station)}</b>` : ''} <span class="muted small">· question ${h.question} · waiting ${h.waitingSec}s</span></div><button class="btn small" data-resolve="${esc(h.id)}">Done</button></div>`).join('')
      : '<p class="muted">No one is asking for help.</p>';
    v.innerHTML = `
      <section class="grid2">
        <div class="panel">
          <h2>${esc(c.batchLabel)}</h2>
          <p>${c.open ? '<span class="pill open">Open</span> Students can start on any lab PC.' : '<span class="pill closed">Closed</span> Students see a waiting screen.'}</p>
          ${!c.consentConfirmed ? `<p class="note">Before opening, confirm the consent checklist in <a href="#settings">Settings</a>.</p>` : ''}
          <div class="row wrap"><button class="btn ${c.open ? 'danger' : ''}" id="toggleOpen" ${!c.consentConfirmed && !c.open ? 'disabled' : ''}>${c.open ? 'Close assessment' : 'Open assessment'}</button></div>
          <p class="muted small" style="margin-top:12px">${window.AIFD.remote ? `Students open: <b>${esc(location.origin + location.pathname.replace(/admin(\.html)?$/, ''))}</b>` : `Students open: ${location.protocol}//<b>${esc(location.hostname === 'localhost' ? 'this-computer-address' : location.hostname)}</b>:${location.port || 80} (the address is shown in the server window)`}</p>
        </div>
        <div class="panel"><h2>Next-student code</h2>
          <p class="bigcode" aria-label="Next student code">${esc(c.resetCode)}</p>
          <p class="muted small">After a student finishes, the PC locks. Type this code on that PC to let the next student start. It does not identify anyone.</p>
          <button class="btn ghost small" id="newCode">Change code</button></div>
      </section>
      <section class="stats panel">
        <div class="stat"><b>${k.started}</b><span>started (this session)</span></div>
        <div class="stat"><b>${k.completed}</b><span>completed</span></div>
        <div class="stat"><b>${k.inProgress}</b><span>in progress</span></div>
        <div class="stat"><b>${state.active.filter(a => !a.stale).length}</b><span>active now</span></div>
      </section>
      <section class="panel"><h2>Help requests ${state.help.length ? `<span class="pill High">${state.help.length}</span>` : ''}</h2><div class="helpq">${helpHtml}</div>
        <p class="muted small" style="margin-top:8px">Requests are kept only in memory and disappear when marked done. The code is the last 4 characters of a random session ID.</p></section>
      <section class="panel"><h2>Progress</h2>${state.active.length ? `<div class="active-grid">${state.active.map(a => `<div class="act${a.stale ? ' stale' : ''}${a.help ? ' help' : ''}"><b>${esc(a.short)}</b> ${a.help ? '<span class="pill High">help</span>' : ''}<div class="muted small">${a.progressPct}%${a.stale ? ' · idle ' + Math.round(a.idleSec / 60) + ' min' : ''}</div><div class="minibar"><i style="width:${a.progressPct}%"></i></div></div>`).join('')}</div>` : '<p class="muted">No assessments in progress.</p>'}</section>`;
    $('#toggleOpen').onclick = async () => {
      try { await api('/api/admin/config', { open: !c.open }); await poll(); toast(c.open ? 'Assessment closed' : 'Assessment open'); } catch (e) { toast(e.message); }
    };
    $('#newCode').onclick = async () => { await api('/api/admin/resetcode', {}); poll(); };
    v.querySelectorAll('[data-resolve]').forEach(b => { b.onclick = async () => { await api('/api/admin/help/resolve', { id: b.dataset.resolve }); poll(); }; });
  }

  /* ---------- results ---------- */
  const hbar = (label, pct, cls) => `<div class="hbar"><span>${esc(label)}</span><span class="track"><i class="${cls || ''}" style="width:${Math.max(0, Math.min(100, pct || 0))}%"></i></span><span class="v">${pct == null ? '–' : f1(pct) + '%'}</span></div>`;
  const stack = (dist, names) => {
    const tot = names.reduce((a, n) => a + (dist[n] || 0), 0);
    return `<div class="stack100" role="img" aria-label="${names.map(n => n + ' ' + (dist[n] || 0)).join(', ')}">${names.map((n, i) => tot ? `<i class="${BANDCLS[i]}" style="width:${100 * (dist[n] || 0) / tot}%" title="${esc(n)}: ${dist[n] || 0}"></i>` : '').join('')}</div>
      <div class="legend">${names.map((n, i) => `<span><i class="${BANDCLS[i]}"></i>${esc(n)} ${dist[n] || 0}${tot ? ` (${Math.round(100 * (dist[n] || 0) / tot)}%)` : ''}</span>`).join('')}</div>`;
  };
  async function renderResults() {
    const v = $('#view');
    v.innerHTML = '<p class="muted">Loading results…</p>';
    const batch = batchSel === 'current' ? state.config.batchId : batchSel;
    try { results = await api('/api/admin/results?batch=' + encodeURIComponent(batch)); } catch (e) { v.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
    const r = results, names = r.bandNames;
    const batchOpts = `<option value="current" ${batchSel === 'current' ? 'selected' : ''}>Current session (${esc(state.config.batchLabel)})</option><option value="all" ${batchSel === 'all' ? 'selected' : ''}>All sessions</option>` +
      Object.entries(r.batches || {}).filter(([id]) => id !== state.config.batchId).map(([id, b]) => `<option value="${esc(id)}" ${batchSel === id ? 'selected' : ''}>${esc(b.label)} (${esc(b.created)})</option>`).join('');
    const q = 'batch=' + encodeURIComponent(batch);
    if (!r.completed) {
      v.innerHTML = `<div class="row wrap"><label class="muted">Show <select id="bsel">${batchOpts}</select></label></div>
        <section class="panel"><h2>No completed assessments yet</h2><p class="muted">Results appear here once students submit. ${r.started ? r.started + ' started so far.' : ''}</p></section>`;
      $('#bsel').onchange = e => { batchSel = e.target.value; renderResults(); };
      return;
    }
    const grp = (rows, title) => `<div class="panel"><h3>${title}</h3><div class="tbl"><table><thead><tr><th>Group</th><th class="n">n</th>${r.domains.map(d => `<th class="n">${esc(d.label.split(' ')[0])} %</th>`).join('')}</tr></thead><tbody>
      ${rows.map(g => `<tr><td>${esc(g.key)}</td><td class="n">${g.suppressed ? '&lt;' + r.minGroup : g.n}</td>${g.suppressed ? `<td colspan="${r.domains.length}" class="muted">Hidden: fewer than ${r.minGroup} students</td>` : r.domains.map(d => `<td class="n">${f1(g.domains[d.id])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
    v.innerHTML = `
      <div class="row wrap" style="justify-content:space-between"><label class="muted">Show <select id="bsel">${batchOpts}</select></label>
        <div class="row wrap"><button class="btn ghost small" data-dl="/api/admin/export.csv?${q}">Download results CSV</button><button class="btn ghost small" data-dl="/api/admin/items.csv?${q}">Download item analysis CSV</button></div></div>
      ${r.smallSample ? `<p class="note">Only ${r.completed} completed assessments. Treat everything below as indicative, not conclusive. Recommendations appear from ${r.minGroup} completed assessments.</p>` : ''}
      <p class="note">Readiness bands are <b>provisional</b> and have not been validated. Review them after the pilot (see "Review the bands" below).</p>
      <section class="panel stats">
        <div class="stat"><b>${r.started}</b><span>started</span></div>
        <div class="stat"><b>${r.completed}</b><span>completed</span></div>
        <div class="stat"><b>${f1(r.completionPct)}%</b><span>completion</span></div>
        <div class="stat"><b>${f1(r.avgDurationMin)}</b><span>average minutes (median ${f1(r.medianDurationMin)})</span></div>
        <div class="stat"><b>${f1(r.idkPerSession)}</b><span>"I don't know" per student</span></div>
      </section>
      <section class="grid3">${r.domains.map(d => `<div class="panel"><h3>${esc(d.label)}</h3>
        ${hbar('Average', d.meanPct)}
        ${d.evidence.demonstrated != null ? hbar('Demonstrated (tasks)', d.evidence.demonstrated, 'b2') : ''}
        ${d.evidence.knowledge != null ? hbar('Knowledge (questions)', d.evidence.knowledge) : ''}
        <p class="muted small" style="margin:10px 0 4px">Readiness category</p>${stack(d.bandDist, names)}</div>`).join('')}</section>
      <section class="panel"><h3>Overall readiness category</h3><p class="muted small">Each student's overall category is their weakest domain (a cautious, provisional rule).</p>${stack(r.overallDist, names)}</section>
      <section class="panel"><h2>Institutional recommendations</h2>
        ${r.recommendations.length ? `<p class="muted small">Suggested training priorities, generated from topics where the average was below 60%. Check them against your own knowledge of the programs before acting.</p>
          <div class="tbl"><table><thead><tr><th>Priority</th><th>Topic</th><th class="n">Average</th><th>Suggested action</th></tr></thead><tbody>${r.recommendations.map(x => `<tr><td><span class="pill ${x.priority}">${x.priority}</span></td><td>${esc(x.label)}</td><td class="n">${f1(x.meanPct)}%</td><td>${esc(x.text)}</td></tr>`).join('')}</tbody></table></div>`
        : `<p class="muted">${r.smallSample ? 'Not enough completed assessments yet.' : 'No topic averaged below 60%. No priority training need was detected by this assessment.'}</p>`}</section>
      <section class="grid2">
        <div class="panel"><h3>Strengths and weaknesses by topic</h3>${r.topics.map(t => hbar(t.label, t.meanPct)).join('')}</div>
        <div class="panel"><h3>Self-confidence vs results</h3><p class="muted small">Average domain score for students grouped by how confident they said they were (1 = not confident, 4 = very). Cells with very few students are hidden.</p>
          ${r.confidence.map(c => `<h4 style="margin:12px 0 4px">${esc(c.label)}</h4><div class="tbl"><table><thead><tr><th>Confidence</th><th class="n">n</th><th class="n">Score %</th></tr></thead><tbody>${c.rows.map(x => `<tr><td>${x.level}</td><td class="n">${x.suppressed ? (x.n ? '&lt;3' : '0') : x.n}</td><td class="n">${x.suppressed ? '–' : f1(x.meanPct)}</td></tr>`).join('')}</tbody></table></div>
            <p class="small">Confident but in "Support needed": <b>${f1(c.overconfidentPct)}%</b> · Not confident but "Ready": <b>${f1(c.underconfidentPct)}%</b></p>`).join('')}</div>
      </section>
      <section class="panel"><h2>Most often misunderstood</h2><p class="muted small">Items with the lowest average. "Most common wrong answer" shows a likely misconception; a high "I don't know" shows a gap in knowledge.</p>
        <div class="tbl"><table><thead><tr><th>Item</th><th>Topic</th><th>Evidence</th><th class="n">Average</th><th class="n">I don't know</th><th>Most common wrong answer</th></tr></thead><tbody>
        ${r.items.slice(0, 8).map(i => `<tr><td>${esc(i.prompt)}</td><td>${esc(i.topic)}</td><td>${esc(i.evidence)}</td><td class="n">${f1(i.meanPct)}%</td><td class="n">${f1(i.idkPct)}%</td><td>${i.topWrong ? esc(i.topWrong.text) + ` <span class="muted">(${f1(i.topWrong.pct)}%)</span>` : '–'}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="grid2">${grp(r.byProgram, 'By program')}${grp(r.byLevel, 'By level')}</section>
      <section class="grid2">${r.context.map(c => `<div class="panel"><h3>${esc(c.prompt)}</h3>${c.options.map(o => hbar(o.label, o.pct)).join('')}<p class="muted small">n = ${c.n}</p></div>`).join('')}</section>
      <section class="panel"><h2>Review the bands</h2><p class="muted small">Distribution of scores per domain. Orange lines show the current provisional cut-offs. After the pilot, compare these with what you saw in the lab, then adjust cut-offs in Settings.</p>
        <div class="grid3">${r.domains.map(d => `<div><h4 style="margin:6px 0">${esc(d.label)}</h4>${histo(d)}</div>`).join('')}</div></section>
      <p class="muted small">Demonstrated scores come from simulated tasks in the browser (mouse, typing, copy and paste, a pretend file window). They do not measure skill in real Word, Windows or AI tools.</p>`;
    $('#bsel').onchange = e => { batchSel = e.target.value; renderResults(); };
  }
  function histo(d) {
    const mx = Math.max(1, ...d.histogram);
    return `<div class="hist">${d.histogram.map((n, i) => `<i style="height:${100 * n / mx}%" title="${i * 10}–${i * 10 + 9}%: ${n}"></i>`).join('')}
      ${d.cuts.map(c => `<span class="cut" style="left:${c}%" title="cut-off ${c}%"></span>`).join('')}</div><div class="histax"><span>0%</span><span>50%</span><span>100%</span></div>`;
  }

  /* ---------- settings ---------- */
  function renderSettings() {
    const c = state.config, v = $('#view');
    v.innerHTML = `
      <section class="grid2">
        <div class="panel form"><h2>Session</h2>
          <p class="muted small">A session groups one round of assessments (for example "Pilot 1" or "TS1 Nursing – March"). Starting a new one unlocks all lab PCs and changes the next-student code.</p>
          <label>Current session<input type="text" value="${esc(c.batchLabel)}" disabled></label>
          <label>New session name<input type="text" id="blabel" placeholder="e.g. Pilot 2"></label>
          <button class="btn ghost" id="newBatch">Start new session</button>
        </div>
        <div class="panel form"><h2>Consent and participation</h2>
          <label class="chk"><input type="checkbox" id="consent" ${c.consentConfirmed ? 'checked' : ''}><span>I confirm that participation and consent follow the process approved by management, including the approach for students under 18 (for example guardian information or consent), and that students have been told it is voluntary and anonymous.</span></label>
          <label class="chk"><input type="checkbox" id="feedback" ${c.feedback ? 'checked' : ''}><span>Show learning feedback to each student <b>after</b> they submit (correct answers and short explanations). Keep this off while other students are still taking the assessment in the same room.</span></label>
          <button class="btn" id="saveConsent">Save</button>
        </div>
      </section>
      <section class="grid2">
        <div class="panel form"><h2>Programs and levels</h2><p class="muted small">One per line. Students choose from these lists.</p>
          <label>Programs<textarea id="programs">${esc(c.programs.join('\n'))}</textarea></label>
          <label>Levels<textarea id="levels">${esc(c.levels.join('\n'))}</textarea></label>
          <label>Hide groups smaller than<input type="number" id="minGroup" min="2" max="50" value="${c.minGroup}"></label>
          <button class="btn" id="saveLists">Save</button>
        </div>
        <div class="panel form"><h2>Provisional readiness bands</h2>
          <p class="muted small">Percent of each domain's points. Below the first number = Support needed; from the first = Developing; from the second = Ready. Defaults come from the earlier pen-and-paper kit and are not validated.</p>
          ${Object.entries(c.bands).map(([d, cuts]) => `<div class="row wrap"><span style="min-width:9em">${esc(d)}</span><label>Developing from<input type="number" min="0" max="100" data-band="${d}" data-i="0" value="${cuts[0]}"></label><label>Ready from<input type="number" min="0" max="100" data-band="${d}" data-i="1" value="${cuts[1]}"></label></div>`).join('')}
          <div class="row wrap"><button class="btn" id="saveBands">Save bands</button><button class="btn ghost" id="resetBands">Restore defaults</button></div>
        </div>
      </section>`;
    $('#newBatch').onclick = async () => {
      const label = $('#blabel').value.trim(); if (!label) return toast('Give the new session a name.');
      await api('/api/admin/batch', { label }); batchSel = 'current'; await poll(); renderSettings(); toast('New session started: ' + label);
    };
    $('#saveConsent').onclick = async () => {
      const body = { consentConfirmed: $('#consent').checked, feedback: $('#feedback').checked };
      if (!body.consentConfirmed && c.open) body.open = false;
      await api('/api/admin/config', body); await poll(); toast('Saved');
    };
    $('#saveLists').onclick = async () => {
      const lines = id => $('#' + id).value.split('\n').map(s => s.trim()).filter(Boolean);
      await api('/api/admin/config', { programs: lines('programs'), levels: lines('levels'), minGroup: parseInt($('#minGroup').value, 10) }); await poll(); toast('Saved');
    };
    $('#saveBands').onclick = async () => {
      const bands = {};
      v.querySelectorAll('[data-band]').forEach(i => { (bands[i.dataset.band] = bands[i.dataset.band] || [])[+i.dataset.i] = Number(i.value); });
      const bad = Object.values(bands).some(b => !(b[0] < b[1]));
      if (bad) return toast('"Developing from" must be lower than "Ready from".');
      await api('/api/admin/config', { bands }); await poll(); toast('Bands saved');
    };
    $('#resetBands').onclick = async () => { await api('/api/admin/config', { bandsReset: true }); await poll(); renderSettings(); toast('Defaults restored'); };
  }

  /* ---------- data ---------- */
  async function renderData() {
    const v = $('#view');
    const list = await api('/api/admin/sessions?batch=all');
    v.innerHTML = `
      <section class="grid2">
        <div class="panel"><h2>Export</h2><p class="muted small">All exports are anonymous. CSV files open in Excel (Arabic shows correctly).</p>
          <div class="row wrap"><button class="btn ghost small" data-dl="/api/admin/export.csv?batch=all">Results CSV (all sessions)</button><button class="btn ghost small" data-dl="/api/admin/items.csv?batch=all">Item analysis CSV</button><button class="btn ghost small" data-dl="/api/admin/backup.json">Full backup (JSON)</button></div></div>
        <div class="panel form"><h2>Restore from backup</h2><p class="muted small">Replaces everything stored now with the backup's contents. Your password stays the same, and the assessment is closed after a restore.</p>
          <input type="file" id="rfile" accept=".json,application/json"><button class="btn danger" id="restore">${armed.restore ? 'Click again to replace all data' : 'Restore'}</button></div>
      </section>
      <section class="panel"><h2>Delete data</h2>
        <div class="row wrap">
          <button class="btn ghost small" id="delStale">${armed.stale ? 'Click again to confirm' : 'Delete unfinished assessments older than 2 hours'}</button>
          <button class="btn danger small" id="delAll">${armed.all ? 'Click again to delete everything' : 'Delete all assessments'}</button>
        </div>
        <div class="tbl" style="margin-top:14px"><table><thead><tr><th>Code</th><th>Session</th><th>Status</th><th>Date</th><th class="n">Minutes</th><th></th></tr></thead><tbody>
          ${list.length ? list.map(s => `<tr><td><b>${esc(s.short)}</b></td><td>${esc(s.batch)}</td><td>${esc(s.status)}</td><td>${esc(s.day)}</td><td class="n">${f1(s.durationMin)}</td><td><button class="btn ${armed['d' + s.id] ? 'danger' : 'ghost'} small" data-del="${esc(s.id)}">${armed['d' + s.id] ? 'Confirm' : 'Delete'}</button></td></tr>`).join('') : '<tr><td colspan="6" class="muted">No stored assessments.</td></tr>'}
        </tbody></table></div></section>
      <section class="panel form"><h2>Change supervisor password</h2>
        <label>Current password<input type="password" id="pwc" autocomplete="current-password"></label>
        <label>New password (8+ characters)<input type="password" id="pwn" autocomplete="new-password"></label>
        <button class="btn" id="pwgo">Change password</button></section>`;
    const arm = (k, fn) => async () => { if (!armed[k]) { armed = { [k]: true }; return renderData(); } armed = {}; await fn(); renderData(); };
    $('#delStale').onclick = arm('stale', async () => { const r = await api('/api/admin/delete', { incompleteOlderThanHours: 2 }); toast(r.deleted + ' deleted'); });
    $('#delAll').onclick = arm('all', async () => { const r = await api('/api/admin/delete', { all: true }); toast(r.deleted + ' deleted'); });
    v.querySelectorAll('[data-del]').forEach(b => { b.onclick = arm('d' + b.dataset.del, async () => { await api('/api/admin/delete', { ids: [b.dataset.del] }); toast('Deleted'); }); });
    $('#restore').onclick = async () => {
      const f = $('#rfile').files[0]; if (!f) return toast('Choose a backup file first.');
      if (!armed.restore) { armed = { restore: true }; $('#restore').textContent = 'Click again to replace all data'; return; }
      armed = {};
      try { const data = JSON.parse(await f.text()); const r = await api('/api/admin/restore', data); toast('Restored ' + r.sessions + ' assessments'); await poll(); renderData(); }
      catch (e) { toast(e.message.includes('JSON') ? 'That file is not valid JSON.' : e.message); renderData(); }
    };
    $('#pwgo').onclick = async () => {
      try { await api('/api/admin/password', { current: $('#pwc').value, next: $('#pwn').value }); toast('Password changed. Sign in again.'); showLogin(); }
      catch (e) { toast(e.message); }
    };
  }

  start();
})();
