'use strict';
/* AIFD Lab Assessor – one way to call the backend, local Node server or Google Apps Script.
 * AIFD.call(path, body) -> { status, json }. body undefined means GET.
 * AIFD.download(path)   -> saves an export file. */
(function (root) {
  const cfg = root.AIFD_CONFIG || {};
  const remote = !!cfg.api;
  const AUTH = 'aifd_admin_token';
  const ss = {
    get() { try { return root.sessionStorage.getItem(AUTH); } catch (e) { return null; } },
    set(v) { try { if (v) root.sessionStorage.setItem(AUTH, v); else root.sessionStorage.removeItem(AUTH); } catch (e) { /* storage blocked */ } },
  };

  async function call(path, body) {
    if (!remote) {
      const r = await root.fetch(path, body === undefined ? { credentials: 'same-origin' }
        : { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      return { status: r.status, json: await r.json().catch(() => ({})), response: r };
    }
    // Apps Script: text/plain avoids a CORS preflight; the admin token travels in the body, never in the URL.
    const u = new URL(path, 'http://x');
    const req = { route: (body === undefined ? 'GET ' : 'POST ') + u.pathname, q: Object.fromEntries(u.searchParams), body: body || {} };
    const tok = ss.get(); if (tok) req.auth = tok;
    const r = await root.fetch(cfg.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(req), redirect: 'follow', credentials: 'omit' });
    if (!r.ok) return { status: r.status, json: {} };
    const out = await r.json();
    if ('auth' in out) ss.set(out.auth);
    if (out.status === 401) ss.set(null);
    return { status: out.status, json: out.body || {} };
  }

  async function download(path) {
    if (!remote) { const a = document.createElement('a'); a.href = path; a.click(); return; }
    const { status, json } = await call(path);
    if (status !== 200 || !json.download) throw new Error(json.error || 'Download failed (' + status + ')');
    const d = json.download;
    const url = URL.createObjectURL(new Blob([d.content], { type: d.contentType }));
    const a = document.createElement('a'); a.href = url; a.download = d.filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  root.AIFD = { call, download, remote };
})(typeof window !== 'undefined' ? window : globalThis);
