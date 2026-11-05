// Same-origin JSON loader: the studio's string tables, template library and catalogues are files
// next to the page. Only relative paths are accepted (the CSP also limits connect-src to 'self'
// plus the opt-in research host, which only core/api.js may call).
export async function loadJSON(path) {
  if (typeof path !== 'string' || !/^[a-z0-9][a-z0-9/_.-]*\.json$/i.test(path) || path.includes('..')) throw new Error('loadJSON: relative .json paths only');
  const r = await fetch(new URL(path, import.meta.url.replace(/core\/load\.js.*$/, '')), { credentials: 'same-origin' });
  if (!r.ok) throw new Error('loadJSON ' + path + ' ' + r.status);
  return r.json();
}
