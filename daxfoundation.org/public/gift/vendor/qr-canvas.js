/*!
 * qr-canvas.js — public-domain QR Code encoder for browser <canvas>
 *
 * Algorithm follows Nayuki's public-domain QR Code generator reference:
 *   https://www.nayuki.io/page/qr-code-generator-library
 * Released to the public domain by Project Nayuki, 2020.
 *
 * Adapted from templates/venue-hub/src/qr-core.js in this repo, which
 * carries the same public-domain provenance.  Changes: ES-module export,
 * error-correction level L (from M) to handle gift share URLs ≤ 271 bytes,
 * and a drawQR(canvas, text) helper.
 *
 * Byte mode · EC level L · versions 1–10 · up to ~271 bytes of UTF-8.
 */

// --- per-version level-L block structure: [ecPerBlock, g1blocks, g1data, g2blocks, g2data] ---
var SPEC_L = {
  1:  [7,  1,  19, 0,   0],
  2:  [10, 1,  34, 0,   0],
  3:  [15, 1,  55, 0,   0],
  4:  [20, 1,  80, 0,   0],
  5:  [26, 1, 108, 0,   0],
  6:  [18, 2,  68, 0,   0],
  7:  [20, 2,  78, 0,   0],
  8:  [24, 2,  97, 0,   0],
  9:  [30, 2, 116, 0,   0],
  10: [18, 2,  68, 2,  69],
};

var ALIGN = {
  1: [], 2: [6,18], 3: [6,22], 4: [6,26], 5: [6,30], 6: [6,34],
  7: [6,22,38], 8: [6,24,42], 9: [6,26,46], 10: [6,28,50],
};

function totalData(ver) { var s = SPEC_L[ver]; return s[1]*s[2] + s[3]*s[4]; }

function mul(x, y) {
  var z = 0;
  for (var i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11D);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xFF;
}
function rsDivisor(degree) {
  var result = []; for (var i = 0; i < degree; i++) result.push(0);
  result[degree - 1] = 1;
  var rootv = 1;
  for (var d = 0; d < degree; d++) {
    for (var j = 0; j < degree; j++) {
      result[j] = mul(result[j], rootv);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    rootv = mul(rootv, 0x02);
  }
  return result;
}
function rsRemainder(data, divisor) {
  var result = []; for (var i = 0; i < divisor.length; i++) result.push(0);
  for (var k = 0; k < data.length; k++) {
    var factor = data[k] ^ result[0];
    result.shift(); result.push(0);
    for (var j = 0; j < divisor.length; j++) result[j] ^= mul(divisor[j], factor);
  }
  return result;
}

function utf8(text) {
  var out = [], i, c;
  for (i = 0; i < text.length; i++) {
    c = text.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) { out.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F)); }
    else if (c < 0xD800 || c >= 0xE000) { out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)); }
    else { i++; var u = 0x10000 + (((c & 0x3FF) << 10) | (text.charCodeAt(i) & 0x3FF));
      out.push(0xF0 | (u >> 18), 0x80 | ((u >> 12) & 0x3F), 0x80 | ((u >> 6) & 0x3F), 0x80 | (u & 0x3F)); }
  }
  return out;
}

function chooseVersion(len) {
  for (var v = 1; v <= 10; v++) {
    var countBits = (v < 10) ? 8 : 16;
    var needBits = 4 + countBits + 8 * len;
    if (needBits <= 8 * totalData(v)) return v;
  }
  return 0;
}

function codewords(bytes, ver) {
  var countBits = (ver < 10) ? 8 : 16;
  var bits = [];
  function push(val, n) { for (var i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); }
  push(0x4, 4);
  push(bytes.length, countBits);
  for (var i = 0; i < bytes.length; i++) push(bytes[i], 8);
  var cap = 8 * totalData(ver);
  for (var t = 0; t < 4 && bits.length < cap; t++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  var data = [];
  for (var b = 0; b < bits.length; b += 8) { var v = 0; for (var j = 0; j < 8; j++) v = (v << 1) | bits[b + j]; data.push(v); }
  var pad = [0xEC, 0x11], pi = 0;
  while (data.length < totalData(ver)) { data.push(pad[pi & 1]); pi++; }

  var s = SPEC_L[ver], ec = s[0];
  var blocks = [], off = 0, div = rsDivisor(ec), maxLen = 0;
  var nb = s[1] + s[3];
  for (var bi = 0; bi < nb; bi++) {
    var dlen = (bi < s[1]) ? s[2] : s[4];
    var d = data.slice(off, off + dlen); off += dlen;
    blocks.push({ data: d, ecc: rsRemainder(d, div) });
    if (dlen > maxLen) maxLen = dlen;
  }
  var out = [];
  for (var c = 0; c < maxLen; c++) for (var bb = 0; bb < nb; bb++) if (c < blocks[bb].data.length) out.push(blocks[bb].data[c]);
  for (var e = 0; e < ec; e++) for (var b2 = 0; b2 < nb; b2++) out.push(blocks[b2].ecc[e]);
  return out;
}

function newGrid(size) { var g = []; for (var r = 0; r < size; r++) { var row = []; for (var c = 0; c < size; c++) row.push(0); g.push(row); } return g; }

function buildMatrix(bytes, ver) {
  var size = 17 + 4 * ver;
  var mod = newGrid(size), fn = newGrid(size);
  function set(r, c, dark) { mod[r][c] = dark ? 1 : 0; fn[r][c] = 1; }

  function finder(row, col) {
    for (var dr = -1; dr <= 7; dr++) for (var dc = -1; dc <= 7; dc++) {
      var r = row + dr, c = col + dc;
      if (r < 0 || r >= size || c < 0 || c >= size) continue;
      var inR = dr >= 0 && dr <= 6, inC = dc >= 0 && dc <= 6;
      if (inR && inC) {
        var dark = (dr === 0 || dr === 6 || dc === 0 || dc === 6) || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
        set(r, c, dark);
      } else set(r, c, false);
    }
  }
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);

  for (var i = 8; i < size - 8; i++) { var d = (i % 2 === 0); if (!fn[6][i]) set(6, i, d); if (!fn[i][6]) set(i, 6, d); }

  var pos = ALIGN[ver];
  for (var a = 0; a < pos.length; a++) for (var b = 0; b < pos.length; b++) {
    var ar = pos[a], ac = pos[b];
    if ((ar <= 7 && ac <= 7) || (ar <= 7 && ac >= size - 8) || (ar >= size - 8 && ac <= 7)) continue;
    for (var yr = -2; yr <= 2; yr++) for (var xc = -2; xc <= 2; xc++) {
      var dark2 = (Math.max(Math.abs(yr), Math.abs(xc)) !== 1);
      set(ar + yr, ac + xc, dark2);
    }
  }

  set(size - 8, 8, true);
  for (var k = 0; k <= 8; k++) { if (!fn[8][k]) { fn[8][k] = 1; } if (!fn[k][8]) { fn[k][8] = 1; } }
  for (var k2 = 0; k2 < 8; k2++) { fn[8][size - 1 - k2] = 1; fn[size - 1 - k2][8] = 1; }

  if (ver >= 7) {
    var rem = ver;
    for (var vi = 0; vi < 12; vi++) rem = (rem << 1) ^ ((rem >> 11) * 0x1F25);
    var vbits = (ver << 12) | rem;
    for (var vb = 0; vb < 18; vb++) {
      var bit = (vbits >> vb) & 1;
      var rr = Math.floor(vb / 3), cc = size - 11 + (vb % 3);
      set(rr, cc, !!bit); set(cc, rr, !!bit);
    }
  }
  return { size: size, mod: mod, fn: fn };
}

function placeData(M, cw) {
  var size = M.size, mod = M.mod, fn = M.fn, i = 0, total = cw.length * 8;
  for (var right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (var vert = 0; vert < size; vert++) {
      for (var j = 0; j < 2; j++) {
        var col = right - j;
        var upward = ((right + 1) & 2) === 0;
        var row = upward ? (size - 1 - vert) : vert;
        if (!fn[row][col] && i < total) {
          mod[row][col] = (cw[i >> 3] >> (7 - (i & 7))) & 1;
          i++;
        }
      }
    }
  }
}

function maskBit(m, r, c) {
  switch (m) {
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
  }
  return false;
}
function applyMask(M, m) {
  var size = M.size;
  for (var r = 0; r < size; r++) for (var c = 0; c < size; c++) if (!M.fn[r][c] && maskBit(m, r, c)) M.mod[r][c] ^= 1;
}
function drawFormat(M, m) {
  var size = M.size;
  var data = (1 << 3) | m;              // EC level L = 01 binary = 1
  var rem = data;
  for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537);
  var bits = ((data << 10) | rem) ^ 0x5412;
  function gb(n) { return (bits >> n) & 1; }
  function sm(r, c, v) { M.mod[r][c] = v; M.fn[r][c] = 1; }
  for (var k = 0; k <= 5; k++) sm(k, 8, gb(k));
  sm(7, 8, gb(6)); sm(8, 8, gb(7)); sm(8, 7, gb(8));
  for (var k2 = 9; k2 <= 14; k2++) sm(8, 14 - k2, gb(k2));
  for (var k3 = 0; k3 <= 7; k3++) sm(size - 1 - k3, 8, gb(k3));
  for (var k4 = 8; k4 <= 14; k4++) sm(8, size - 15 + k4, gb(k4));
}

function penalty(M) {
  var size = M.size, mod = M.mod, s = 0, r, c, run, i;
  for (r = 0; r < size; r++) { run = 1; for (c = 1; c < size; c++) { if (mod[r][c] === mod[r][c-1]) { run++; if (run === 5) s += 3; else if (run > 5) s += 1; } else run = 1; } }
  for (c = 0; c < size; c++) { run = 1; for (r = 1; r < size; r++) { if (mod[r][c] === mod[r-1][c]) { run++; if (run === 5) s += 3; else if (run > 5) s += 1; } else run = 1; } }
  for (r = 0; r < size - 1; r++) for (c = 0; c < size - 1; c++) { var v = mod[r][c]; if (v === mod[r][c+1] && v === mod[r+1][c] && v === mod[r+1][c+1]) s += 3; }
  var pat = [1,0,1,1,1,0,1];
  function match(get, n) {
    var cnt = 0, len = n;
    for (var a = 0; a <= len - 7; a++) {
      var ok = true; for (var b = 0; b < 7; b++) if (get(a + b) !== pat[b]) { ok = false; break; }
      if (!ok) continue;
      var before = true; for (var p = a - 4; p < a; p++) { if (p < 0 || get(p) !== 0) { before = false; break; } }
      var after = true; for (var q = a + 7; q < a + 11; q++) { if (q >= len || get(q) !== 0) { after = false; break; } }
      if (before || after) cnt++;
    }
    return cnt;
  }
  for (r = 0; r < size; r++) s += 40 * match(function (x) { return mod[r][x]; }, size);
  for (c = 0; c < size; c++) s += 40 * match(function (x) { return mod[x][c]; }, size);
  var dark = 0; for (r = 0; r < size; r++) for (c = 0; c < size; c++) dark += mod[r][c];
  var ratio = dark * 100 / (size * size);
  var k = Math.floor(Math.abs(ratio - 50) / 5);
  s += k * 10;
  return s;
}

function cloneGrid(g) { var o = []; for (var r = 0; r < g.length; r++) o.push(g[r].slice()); return o; }

/** qrMatrix(text) → boolean[][] (true = dark module). Throws if text > ~271 bytes. */
function qrMatrix(text) {
  var bytes = utf8(String(text));
  var ver = chooseVersion(bytes.length);
  if (!ver) throw new Error('qr: text too long (' + bytes.length + ' bytes)');
  var cw = codewords(bytes, ver);
  var base = buildMatrix(bytes, ver);
  var best = null, bestPen = Infinity;
  for (var m = 0; m < 8; m++) {
    var M = { size: base.size, mod: cloneGrid(base.mod), fn: cloneGrid(base.fn) };
    placeData(M, cw);
    applyMask(M, m);
    drawFormat(M, m);
    var p = penalty(M);
    if (p < bestPen) { bestPen = p; best = M; }
  }
  var out = [];
  for (var r = 0; r < best.size; r++) { var row = []; for (var c = 0; c < best.size; c++) row.push(best.mod[r][c] === 1); out.push(row); }
  return out;
}

/**
 * drawQR(canvas, text) — render text as a QR code on the given canvas element.
 * The canvas is resized to fit; white background + black modules, 4 px quiet zone.
 * Throws if text is longer than ~271 UTF-8 bytes.
 */
export function drawQR(canvas, text) {
  var grid = qrMatrix(String(text));
  var size = grid.length;
  var px = Math.max(2, Math.floor(240 / size));
  var pad = 4;
  canvas.width = size * px + pad * 2;
  canvas.height = size * px + pad * 2;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000';
  for (var r = 0; r < size; r++) {
    for (var c = 0; c < size; c++) {
      if (grid[r][c]) ctx.fillRect(pad + c * px, pad + r * px, px, px);
    }
  }
}
