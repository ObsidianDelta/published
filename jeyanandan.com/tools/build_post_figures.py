#!/usr/bin/env python3
"""
Figures for the genealogy-of-meaning-capture post on jeyanandan.com.

Each figure is a standalone, tightly-cropped SVG with its own viewBox and
intrinsic size, so a reader downloads only the figure and not the whole
4000x2050 master diagram eight times over.

Every phase string — name, time, era, mechanism, citation, captures, exit
cost, severity — is read straight out of build_svg_light.py by AST. Nothing
is retyped, nothing is paraphrased. The palette, the severity ramp and the
card grammar come from the same place, so the zooms read as details of one
object rather than as separate drawings.

Figure 1 of the post is the existing full diagram,
views/jeyanandan/public/figures/genealogy-meaning-capture-light.svg.
It is deliberately NOT regenerated here.
"""

import ast
import math
import os
import re
import textwrap

_HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(_HERE, os.pardir, os.pardir, os.pardir))
OUT_DIR = os.path.join(REPO_ROOT, "views", "jeyanandan", "public", "figures")
MASTER = os.path.join(_HERE, "build_svg_light.py")

# =========================================================================
# SHARED DATA — lifted verbatim from the master generator
# =========================================================================

with open(MASTER, encoding="utf-8") as _f:
    _TREE = ast.parse(_f.read())


def _const(name):
    """Return the literal value assigned to `name` at module level in the master."""
    for node in _TREE.body:
        if isinstance(node, ast.Assign):
            for tgt in node.targets:
                if isinstance(tgt, ast.Name) and tgt.id == name:
                    return ast.literal_eval(node.value)
    raise KeyError("%s not found in %s" % (name, MASTER))


PHASES = _const("PHASES")
SOVEREIGN = _const("SOVEREIGN")
SEV_COLORS = _const("SEV_COLORS")

SOV_COLOR = _const("SOV_COLOR")
SOV_COLOR_LIGHT = _const("SOV_COLOR_LIGHT")
SOV_BG = _const("SOV_BG")
BG = _const("BG")
TEXT = _const("TEXT")
TEXT_2 = _const("TEXT_2")
TEXT_3 = _const("TEXT_3")
LINE = _const("LINE")
PARCHMENT_LINE = _const("PARCHMENT_LINE")

CARD_W = _const("CARD_W")
CARD_GAP = _const("CARD_GAP")

assert len(PHASES) == 28, len(PHASES)
assert len(SOVEREIGN) == 3, len(SOVEREIGN)
assert len(SEV_COLORS) == 11, len(SEV_COLORS)

P = {p[0]: p for p in PHASES}

GENESIS_RED = "#B7472A"
FONT = ("-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, "
        "sans-serif")
MONO = "ui-monospace, Menlo, monospace"

# The master diagram carries this caption because severity and exit cost are
# the author's reading, not anybody's finding. Any figure that reproduces
# those two columns has to carry it too.
DISCLAIM_1 = ("Severity and exit cost are the author’s own interpretive "
              "scale, not scholarship — no cited source ranks these phases.")
DISCLAIM_2 = ("The citations support each card’s mechanism, not its "
              "position on this ramp.")

# =========================================================================
# UTILITIES
# =========================================================================


def esc(s):
    """Escape XML. Matches the master's esc() exactly."""
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def wrap(text, max_chars):
    return textwrap.wrap(text, width=max_chars, break_long_words=False,
                         break_on_hyphens=True)


def fit(text, width_px, font_px, factor=0.52):
    """Wrap `text` to fit `width_px` at `font_px`.

    factor 0.52 em/char is calibrated against the master: its mechanism
    column is 110px wide at font-size 10 and wraps at 21 characters.
    """
    n = max(8, int(width_px / (font_px * factor)))
    return wrap(text, n)


def r(v):
    """Compact number formatting — keeps the emitted SVG small."""
    s = "%.2f" % float(v)
    if s.endswith("00"):
        return s[:-3]
    return s.rstrip("0").rstrip(".")


def txt(parts, x, y, s, size, fill=None, weight=None, anchor=None,
        italic=False, mono=False, ls=None, opacity=None):
    a = ['<text x="%s" y="%s" font-size="%s"' % (r(x), r(y), r(size))]
    a.append(' fill="%s"' % (fill or TEXT))
    if weight:
        a.append(' font-weight="%s"' % weight)
    if anchor:
        a.append(' text-anchor="%s"' % anchor)
    if italic:
        a.append(' font-style="italic"')
    if mono:
        a.append(' font-family="%s"' % MONO)
    if ls is not None:
        a.append(' letter-spacing="%s"' % r(ls))
    if opacity is not None:
        a.append(' opacity="%s"' % r(opacity))
    a.append(">%s</text>" % esc(s))
    parts.append("".join(a))


def rect(parts, x, y, w, h, fill, stroke=None, sw=None, rx=None, op=None,
         fop=None):
    a = ['<rect x="%s" y="%s" width="%s" height="%s" fill="%s"'
         % (r(x), r(y), r(w), r(h), fill)]
    if stroke:
        a.append(' stroke="%s"' % stroke)
    if sw is not None:
        a.append(' stroke-width="%s"' % r(sw))
    if rx is not None:
        a.append(' rx="%s"' % r(rx))
    if op is not None:
        a.append(' opacity="%s"' % r(op))
    if fop is not None:
        a.append(' fill-opacity="%s"' % r(fop))
    a.append("/>")
    parts.append("".join(a))


def line(parts, x1, y1, x2, y2, stroke=None, sw=1, dash=None, marker=None,
         op=None, cap=None):
    a = ['<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="%s"'
         % (r(x1), r(y1), r(x2), r(y2), stroke or LINE, r(sw))]
    if dash:
        a.append(' stroke-dasharray="%s"' % dash)
    if marker:
        a.append(' marker-end="url(#%s)"' % marker)
    if op is not None:
        a.append(' opacity="%s"' % r(op))
    if cap:
        a.append(' stroke-linecap="%s"' % cap)
    a.append("/>")
    parts.append("".join(a))


def circ(parts, cx, cy, rad, fill, stroke=None, sw=None):
    a = ['<circle cx="%s" cy="%s" r="%s" fill="%s"'
         % (r(cx), r(cy), r(rad), fill)]
    if stroke:
        a.append(' stroke="%s"' % stroke)
    if sw is not None:
        a.append(' stroke-width="%s"' % r(sw))
    a.append("/>")
    parts.append("".join(a))


def frame(body, w, h):
    """Wrap a finished body in the SVG header, background and parchment rules.

    Height is settled after layout, so every figure gets a tight viewBox and a
    real intrinsic size rather than a crop of the 4000x2050 master canvas.
    """
    head_parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s" '
        'width="%s" height="%s" font-family="%s">'
        % (r(w), r(h), r(w), r(h), FONT)
    ]
    rect(head_parts, 0, 0, w, h, BG)
    line(head_parts, 26, 16, w - 26, 16, PARCHMENT_LINE, 1)
    line(head_parts, 26, h - 16, w - 26, h - 16, PARCHMENT_LINE, 1)
    out = "\n".join(head_parts + body + ["</svg>"])
    assert "&amp;amp;" not in out, "double-escaped ampersand"
    assert "&amp;lt;" not in out, "double-escaped angle bracket"
    return out


def head(parts, w, title, sub, kicker=None, top=0):
    """Centred title block, sized as a fraction of figure width."""
    t = w * 0.030
    s = w * 0.0190
    k = w * 0.0145
    txt(parts, w / 2, top + t * 1.35, title, t, TEXT, "600", "middle")
    y = top + t * 1.35 + s * 1.55
    txt(parts, w / 2, y, sub, s, TEXT_2, None, "middle", italic=True)
    if kicker:
        y += k * 1.55
        txt(parts, w / 2, y, kicker, k, TEXT_3, None, "middle")
    return y + k * 0.9


def disclaimer(parts, x, y, w, second=True):
    """The honesty caption, in small type, exactly as the master carries it."""
    f = max(11.0, w * 0.0122)
    txt(parts, x, y, DISCLAIM_1, f, TEXT, "600")
    if second:
        txt(parts, x, y + f * 1.32, DISCLAIM_2, f, TEXT_2)
        return y + f * 1.32
    return y


def arrow_defs(parts, ident, color, size=9):
    parts.append(
        '<defs><marker id="%s" markerWidth="%s" markerHeight="%s" refX="%s" '
        'refY="%s" orient="auto" markerUnits="strokeWidth">'
        '<path d="M0,0 L%s,%s L0,%s Z" fill="%s"/></marker></defs>'
        % (ident, size, size, size - 1, size / 2.0, size, size / 2.0, size, color)
    )


# =========================================================================
# PHASE CARD — the master's card grammar, uniformly magnified by k
# =========================================================================
# Master geometry: 130 wide, severity strip at the left edge, tinted header
# band, numbered circle, time top-right, name, era, rule, mechanism,
# CAPTURES, EXIT COST, citation, severity dots pinned to the bottom.
# Scaling uniformly means the wrap widths carry over unchanged.


def _card(parts, phase, x, y, k, h_units):
    n, name, time, era, mech, cite, captured, exit_cost, sev = phase
    sc = SEV_COLORS[sev]

    def X(u):
        return x + u * k

    def Y(u):
        return y + u * k

    def F(u):
        return u * k

    if parts is not None:
        rect(parts, X(0), Y(0), F(CARD_W), F(h_units), "#FFFFFF", LINE,
             F(0.5), F(3))
        rect(parts, X(0), Y(0), F(5), F(h_units), sc)
        rect(parts, X(5), Y(0), F(CARD_W - 5), F(6), sc, op=0.6)

        circle_color = GENESIS_RED if n == 3 else (SOV_COLOR if n == 22 else TEXT)
        circ(parts, X(22), Y(24), F(14), circle_color)
        txt(parts, X(22), Y(29), str(n), F(13), "white", "700", "middle")

        for i, tl in enumerate(wrap(time, 14)[:2]):
            txt(parts, X(CARD_W - 7), Y(19 + i * 11), tl, F(9), TEXT_2,
                anchor="end", mono=True)

    name_lines = wrap(name, 17)
    if parts is not None:
        sz = 12 if len(name_lines) > 2 else 13
        for i, nl in enumerate(name_lines[:3]):
            color = GENESIS_RED if "GENESIS" in nl else TEXT
            txt(parts, X(10), Y(58 + i * 16), nl, F(sz), color, "700")

    u = 58 + len(name_lines) * 16 + 6

    if parts is not None:
        txt(parts, X(10), Y(u), era.upper(), F(9), TEXT_3, "500", ls=F(0.5))
    u += 10
    if parts is not None:
        line(parts, X(10), Y(u), X(CARD_W - 10), Y(u), LINE, F(0.5), "2 2")
    u += 14

    for ml in wrap(mech, 21)[:16]:
        if parts is not None:
            txt(parts, X(10), Y(u), ml, F(10), TEXT)
        u += 13
    u += 8

    if parts is not None:
        txt(parts, X(10), Y(u), "CAPTURES", F(8), TEXT_3, "600", ls=F(0.7))
    u += 13
    for cl in wrap(captured, 22)[:3]:
        if parts is not None:
            txt(parts, X(10), Y(u), cl, F(10), sc if sev > 5 else TEXT, "600")
        u += 12
    u += 8

    if parts is not None:
        txt(parts, X(10), Y(u), "EXIT COST", F(8), TEXT_3, "600", ls=F(0.7))
    u += 13
    for el in wrap(exit_cost, 22)[:4]:
        if parts is not None:
            txt(parts, X(10), Y(u), el, F(10), TEXT)
        u += 12
    u += 10

    if cite and cite != "—":
        for cli in wrap(cite, 22)[:4]:
            if parts is not None:
                txt(parts, X(10), Y(u), cli, F(9), TEXT_3, italic=True)
            u += 11

    dots_u = h_units - 14
    if parts is not None:
        if u < dots_u - 20:
            rect(parts, X(CARD_W - 7), Y(u + 5), F(3), F(dots_u - u - 15), sc,
                 op=0.5, rx=F(1))
        for i in range(10):
            dot = SEV_COLORS[i + 1] if i < sev else "#EEEAE0"
            circ(parts, X(10 + i * 5), Y(dots_u), F(1.6), dot)
        txt(parts, X(CARD_W - 7), Y(dots_u + 3), "sev %d/10" % sev, F(8),
            TEXT_3, anchor="end")
    return u


def card_units(phase):
    """Content height of a card, in master units."""
    return _card(None, phase, 0, 0, 1.0, 10 ** 6)


def card_block_units(rows, pad=32):
    return max(card_units(P[n]) for n in rows) + pad


def draw_cards(parts, rows, x0, y0, k, h_units):
    """Draw a run of phase cards left to right at the master's spacing."""
    step = (CARD_W + CARD_GAP) * k
    for i, n in enumerate(rows):
        _card(parts, P[n], x0 + i * step, y0, k, h_units)
    return x0 + (len(rows) - 1) * step + CARD_W * k


def sev_dots(parts, x, y, sev, rad=3.2, step=10, label=True, fs=13):
    """The master's severity dot row, at an arbitrary size."""
    for i in range(10):
        dot = SEV_COLORS[i + 1] if i < sev else "#EEEAE0"
        circ(parts, x + i * step, y, rad, dot)
    if label:
        txt(parts, x + 10 * step + rad * 2, y + fs * 0.34, "sev %d/10" % sev,
            fs, TEXT_3)


# =========================================================================
# SOVEREIGN CARD — the master's fork-card grammar at an arbitrary width
# =========================================================================


def _sov_card(parts, row, x, y, w):
    n, name, time, mech, cite, captured, exit_cost = row
    s = w / 700.0
    pad = 15 * s
    inner = w - 2 * pad

    f_name, f_time, f_mech = 18 * s, 11 * s, 12 * s
    f_lab, f_body, f_cite = 10 * s, 11 * s, 10 * s

    mech_lines = fit(mech, inner, f_mech)
    cap_lines = fit(captured, inner, f_body)
    exit_lines = fit(exit_cost, inner, f_body)

    u = 82 * s + len(mech_lines) * f_mech * 1.34 + 14 * s
    u += f_lab * 1.5 + len(cap_lines) * f_body * 1.28 + 10 * s
    u += f_lab * 1.5 + len(exit_lines) * f_body * 1.28 + 8 * s
    if cite and cite != "—":
        u += f_cite * 1.5
    h = u + 10 * s

    if parts is None:
        return h

    rect(parts, x, y, w, h, "#FFFFFF", SOV_COLOR, 1.5 * s, 6 * s)
    circ(parts, x + 30 * s, y + 30 * s, 20 * s, SOV_COLOR)
    txt(parts, x + 30 * s, y + 36 * s, str(n), 16 * s, "white", "600", "middle")
    txt(parts, x + 62 * s, y + 27 * s, name, f_name, TEXT, "600")
    txt(parts, x + 62 * s, y + 45 * s, time, f_time, TEXT_3, italic=True)
    line(parts, x + pad, y + 62 * s, x + w - pad, y + 62 * s, SOV_COLOR_LIGHT,
         0.5 * s)

    cy = y + 82 * s
    for ml in mech_lines:
        txt(parts, x + pad, cy, ml, f_mech, TEXT)
        cy += f_mech * 1.34
    cy += 14 * s

    txt(parts, x + pad, cy, "CAPTURES (or rather: AUTHORS)", f_lab, TEXT_3,
        "600", ls=0.5 * s)
    cy += f_lab * 1.5
    for cl in cap_lines:
        txt(parts, x + pad, cy, cl, f_body, SOV_COLOR, "500")
        cy += f_body * 1.28
    cy += 10 * s

    txt(parts, x + pad, cy, "EXIT COST", f_lab, TEXT_3, "600", ls=0.5 * s)
    cy += f_lab * 1.5
    for el in exit_lines:
        txt(parts, x + pad, cy, el, f_body, TEXT)
        cy += f_body * 1.28
    cy += 8 * s

    if cite and cite != "—":
        txt(parts, x + pad, cy, cite, f_cite, TEXT_3, italic=True)
    return h


# =========================================================================
# FIGURE 2 — rows 16 + 17
# =========================================================================


def fig_rows_16_17():
    rows = [16, 17]
    k = 2.4
    W = 1190
    M = 44
    PANEL_X, PANEL_W = 712, 434

    parts = []
    head(parts, W, "The turn to the body",
         "Rows 16 and 17 — enclosure and wage labor beside industrial discipline",
         "Detail of The Genealogy of Meaning Capture · same cards, magnified")

    cy = 186
    hu = card_block_units(rows)
    draw_cards(parts, rows, M, cy, k, hu)
    bottom = cy + hu * k

    # Right panel: what the captures column actually does across these rows.
    # Built into its own list so the box can be sized to its content.
    pan = []
    px, pw = PANEL_X, PANEL_W
    ix = px + 24
    iw = pw - 48
    y = cy + 40
    txt(pan, ix, y, "THE SHIFT", 17, TEXT_2, "600", ls=1.2)
    y += 30

    def block(label, items, gap=30):
        nonlocal y
        txt(pan, ix, y, label, 13, TEXT_3, "600", ls=0.9)
        y += 26
        for n, val, muted in items:
            col = TEXT_3 if muted else TEXT
            sev = P[n][8]
            circ(pan, ix + 9, y - 5, 9, "#CFCABE" if muted
                 else SEV_COLORS[sev])
            txt(pan, ix + 9, y - 1, str(n), 11, "white", "700", "middle")
            vy = y
            for vl in fit(val, iw - 32, 16):
                txt(pan, ix + 28, vy, vl, 16, col, "600" if not muted else None)
                vy += 20
            y = vy + 14
        y += gap - 14

    block("CAPTURES", [
        (15, P[15][6], True),
        (16, P[16][6], False),
        (17, P[17][6], False),
    ])
    block("EXIT COST", [
        (16, P[16][7], False),
        (17, P[17][7], False),
    ])

    txt(pan, ix, y, "SEVERITY", 13, TEXT_3, "600", ls=0.9)
    y += 26
    for n in rows:
        txt(pan, ix, y + 4, str(n), 14, TEXT_2, "600")
        sev_dots(pan, ix + 24, y, P[n][8], 4.0, 12, True, 13)
        y += 30
    y += 12

    for ln in fit("Row 15 still captures a frame you live inside. From row 16 the "
                  "target is the body that has to eat and the hours it must sell.",
                  iw, 14.5):
        txt(pan, ix, y, ln, 14.5, TEXT_2, italic=True)
        y += 20

    rect(parts, px, cy, pw, y - cy + 26, "#FFFFFF", LINE, 0.6, 4)
    parts.extend(pan)

    dy = max(bottom, y + 26) + 44
    dy = disclaimer(parts, M, dy, W)
    return frame(parts, W, dy + 40)


# =========================================================================
# FIGURE 3 — rows 23 to 26
# =========================================================================


def fig_rows_23_26():
    rows = [23, 24, 25, 26]
    k = 2.4
    M = 44
    step = (CARD_W + CARD_GAP) * k
    W = M * 2 + (len(rows) - 1) * step + CARD_W * k

    parts = []
    arrow_defs(parts, "chain", TEXT_3, 9)
    head(parts, W, "Four rows, moving inward",
         "Rows 23 to 26 — platform consolidation, attention economy, "
         "algorithmic curation, intent capture",
         "Detail of The Genealogy of Meaning Capture · same cards, magnified")

    cy = 196
    hu = card_block_units(rows)
    draw_cards(parts, rows, M, cy, k, hu)
    y = cy + hu * k + 54

    txt(parts, M, y, "THE CAPTURES COLUMN, READ ACROSS", 16, TEXT_2, "600",
        ls=1.2)
    y += 26

    chip_w = 250
    chip_h = 104
    centres = [M + i * step + CARD_W * k / 2.0 for i in range(len(rows))]
    for i, n in enumerate(rows):
        sev = P[n][8]
        sc = SEV_COLORS[sev]
        cx0 = centres[i] - chip_w / 2.0
        rect(parts, cx0, y, chip_w, chip_h, "#FFFFFF", sc, 1.6, 5)
        rect(parts, cx0, y, 5, chip_h, sc, rx=2)
        circ(parts, cx0 + 26, y + 26, 13, sc)
        txt(parts, cx0 + 26, y + 31, str(n), 14, "white", "700", "middle")
        ty = y + 31
        for cl in fit(P[n][6], chip_w - 62, 17):
            txt(parts, cx0 + 48, ty, cl, 17, TEXT, "600")
            ty += 21
        sev_dots(parts, cx0 + 20, y + chip_h - 24, sev, 3.6, 11, True, 13)
        if i < len(rows) - 1:
            ax = cx0 + chip_w + 10
            line(parts, ax, y + chip_h / 2.0, centres[i + 1] - chip_w / 2.0 - 12,
                 y + chip_h / 2.0, TEXT_3, 2.2, marker="chain")

    y += chip_h + 40
    for ln in fit("Discoverability is a condition on being found. Waking hours are "
                  "a quantity of life. What is even seen is the boundary of the "
                  "visible. A pre-conscious want is the thing that decides before "
                  "you do. Four rows, and the target moves from outside you to "
                  "underneath you.", W - 2 * M, 17.5):
        txt(parts, M, y, ln, 17.5, TEXT_2, italic=True)
        y += 24

    y += 18
    y = disclaimer(parts, M, y, W)
    return frame(parts, W, y + 40)


# =========================================================================
# FIGURE 4 — rows 21 to 23, and the dip between two eights
# =========================================================================


def fig_rows_21_23():
    rows = [21, 22, 23]
    k = 2.4
    M = 44
    step = (CARD_W + CARD_GAP) * k
    W = M * 2 + (len(rows) - 1) * step + CARD_W * k

    parts = []
    head(parts, W, "The dip between two eights",
         "Rows 21 to 23 — consumer identity, Web 1.0, platform consolidation",
         "Detail of The Genealogy of Meaning Capture · same cards, magnified")

    centres = [M + i * step + CARD_W * k / 2.0 for i in range(len(rows))]

    # Severity profile band.
    by, bh = 200, 168
    ax_x = M + 56
    ax_r = W - M
    for g in (0, 5, 10):
        gy = by + bh * (1 - g / 10.0)
        line(parts, ax_x, gy, ax_r, gy, LINE, 0.7,
             None if g in (0, 10) else "3 4", op=0.55)
        txt(parts, ax_x - 12, gy + 5, str(g), 14, TEXT_3, anchor="end")
    txt(parts, M, by - 16, "SEVERITY (author’s interpretive scale, 0–10)",
        15, TEXT_2, "600", ls=0.9)

    pts = []
    for i, n in enumerate(rows):
        sev = P[n][8]
        pts.append((centres[i], by + bh * (1 - sev / 10.0), sev, n))
    parts.append('<polyline points="%s" fill="none" stroke="%s" '
                 'stroke-width="3" stroke-linejoin="round"/>'
                 % (" ".join("%s,%s" % (r(a), r(b)) for a, b, _, _ in pts),
                    TEXT_3))
    for px_, py_, sev, n in pts:
        circ(parts, px_, py_, 11, SEV_COLORS[sev], "#FFFFFF", 3)
        txt(parts, px_, py_ - 22, str(sev), 26, TEXT, "700", "middle")
        line(parts, px_, py_ + 14, px_, by + bh + 42, LINE, 1, "3 5", op=0.7)

    # Call out the counter-current.
    mid = pts[1]
    txt(parts, mid[0] + 26, mid[1] + 6, "← the counter-current", 16,
        SOV_COLOR, "600")
    txt(parts, mid[0] + 26, mid[1] + 27,
        "row 22 is the only fall in the whole sequence", 14, SOV_COLOR,
        italic=True)

    cy = by + bh + 58
    hu = card_block_units(rows)
    draw_cards(parts, rows, M, cy, k, hu)
    y = cy + hu * k + 44

    for ln in fit("Consumer identity captures the self-concept at severity eight. "
                  "Web 1.0 drops it to two for about a decade. Platform "
                  "consolidation puts it back to eight at a higher level of "
                  "abstraction. The reprieve was real, and it was brief.",
                  W - 2 * M, 17.5):
        txt(parts, M, y, ln, 17.5, TEXT_2, italic=True)
        y += 24

    y += 18
    y = disclaimer(parts, M, y, W)
    return frame(parts, W, y + 40)


# =========================================================================
# FIGURE 5 — the sovereign fork, rows 29 to 31
# =========================================================================


def fig_sovereign_fork():
    W = 1120
    CW = 1000
    x = (W - CW) / 2.0

    parts = []
    arrow_defs(parts, "sovdown", SOV_COLOR, 9)
    head(parts, W, "The sovereign fork",
         "Rows 29 to 31 — architectural legibility, sovereign "
         "meaning-making, open meaning commons",
         "Detail of The Genealogy of Meaning Capture · the post-recognition track")

    y = 200
    txt(parts, x, y, "THE SOVEREIGN FORK", 20, SOV_COLOR, "600", ls=0.8)
    y += 26
    txt(parts, x, y,
        "Available at any phase — activates upon architectural legibility",
        15, SOV_COLOR, italic=True)
    y += 28
    for ln in ["The fork is not a 32nd phase in time. It is a property that activates the moment",
               "a subject sees the architecture AS architecture. Capture rows describe the default;",
               "fork rows describe the alternative available to anyone who recognizes the stack."]:
        txt(parts, x, y, ln, 14.5, TEXT_2)
        y += 20
    y += 8
    txt(parts, x, y,
        "“Meaning, in this framework, is not deliverable. It arrives "
        "through suffered-for resistance.”", 14.5, TEXT_2, italic=True)
    y += 34

    heights = [_sov_card(None, row, 0, 0, CW) for row in SOVEREIGN]
    gap = 62
    panel_top = y - 18
    panel_h = sum(heights) + gap * (len(heights) - 1) + 36
    rect(parts, x - 22, panel_top, CW + 44, panel_h, SOV_BG, SOV_COLOR_LIGHT,
         0.8, 10, fop=0.5)

    cy = y
    for i, row in enumerate(SOVEREIGN):
        _sov_card(parts, row, x, cy, CW)
        cy += heights[i]
        if i < len(SOVEREIGN) - 1:
            line(parts, W / 2.0, cy + 14, W / 2.0, cy + gap - 12, SOV_COLOR,
                 2.6, marker="sovdown")
            cy += gap

    y = panel_top + panel_h + 40
    for ln in fit("Row 29 has no date because it is not an era. Its time column "
                  "reads post-recognition (any phase), and its exit cost reads "
                  "n/a — recognition IS the exit. Nothing has to be built "
                  "before the fork is available; something has to be seen.",
                  CW, 17.5):
        txt(parts, x, y, ln, 17.5, TEXT_2, italic=True)
        y += 24

    y += 18
    y = disclaimer(parts, x, y, W)
    return frame(parts, W, y + 40)


# =========================================================================
# FIGURE 6 — the lag
# =========================================================================
# Two things are dated for each row, and both come out of the row's own data:
#   installed  — the onset year in the row's time column
#   recognised — the earliest publication year among the row's citations
# The figure is about the distance between them, so distance is what it draws.

LAG_ROWS = [11, 14, 16, 20, 24]
LAG_FINAL = 26
LAG_UNIT = 140.0


def installed_year(time_s):
    """Onset year from a row's time column. BCE reads negative."""
    m = re.search(r"(\d+)", time_s)
    if not m:
        raise ValueError(time_s)
    y = int(m.group(1))
    return -y if "BCE" in time_s else y


def recognised_year(cite_s):
    """Earliest publication year among a row's citations."""
    years = [int(y) for y in re.findall(r"\b(1[0-9]{3}|20[0-2][0-9])\b", cite_s)]
    if not years:
        raise ValueError(cite_s)
    return min(years)


def lag_of(n):
    p = P[n]
    inst = installed_year(p[2])
    rec = recognised_year(p[5])
    return inst, rec, rec - inst


def lag_offset(lag):
    return math.copysign(LAG_UNIT * math.log10(abs(lag) + 1), lag)


def fig_the_lag():
    W = 1480
    M = 50
    LEFT_W = 340
    ANCHOR = 720
    TRACK_L, TRACK_R = 360, 1240
    RIGHT_X = W - M

    rows = LAG_ROWS + [LAG_FINAL]

    parts = []
    head(parts, W, "The lag",
         "How long an assignment runs before it is recognised as one",
         "Rows 11, 14, 16, 20 and 24 of The Genealogy of Meaning Capture, "
         "then row 26 · horizontal distance is logarithmic")

    y = 188

    # Legend — says exactly how both dates are derived.
    circ(parts, M + 10, y - 5, 10, SEV_COLORS[7])
    txt(parts, M + 28, y, "assignment installed", 16, TEXT, "600")
    txt(parts, M + 28, y + 20,
        "onset year from the row’s own time column", 14, TEXT_3)
    lx = M + 420
    circ(parts, lx + 10, y - 5, 10, "#FFFFFF", SOV_COLOR, 3.2)
    txt(parts, lx + 28, y, "assignment recognised", 16, SOV_COLOR, "600")
    txt(parts, lx + 28, y + 20,
        "earliest publication year among the row’s citations", 14, TEXT_3)
    y += 56

    lanes_y = y + 46
    lane_h = 124
    n_lanes = len(rows)
    bottom = lanes_y + n_lanes * lane_h

    # Log scale, drawn so nobody mistakes it for linear. Only the lagging
    # side carries magnitude labels; the early side is named instead.
    for mag, lab in ((1, "1"), (10, "10"), (100, "100"), (1000, "1,000 yr")):
        off = lag_offset(mag)
        for sgn in (1, -1):
            gx = ANCHOR + sgn * off
            if not (TRACK_L <= gx <= TRACK_R):
                continue
            line(parts, gx, lanes_y - 26, gx, bottom - 12, LINE, 0.8, "2 6",
                 op=0.6)
            if sgn > 0:
                txt(parts, gx, lanes_y - 34, lab, 12.5, TEXT_3,
                    anchor="middle")
    txt(parts, TRACK_L, lanes_y - 34, "← named first", 12.5, SOV_COLOR,
        italic=True)

    # The installed lane is a single vertical: every row is zeroed on it.
    line(parts, ANCHOR, lanes_y - 20, ANCHOR, bottom - 8, TEXT_2, 2)
    txt(parts, ANCHOR, lanes_y - 50, "ASSIGNMENT INSTALLED", 14, TEXT_2, "600",
        "middle", ls=1.0)

    for i, n in enumerate(rows):
        p = P[n]
        sev = p[8]
        sc = SEV_COLORS[sev]
        top = lanes_y + i * lane_h
        ty = top + 48
        inst, rec, lag = lag_of(n)
        off = lag_offset(lag)
        rx_ = ANCHOR + off
        final = (n == LAG_FINAL)

        if i:
            line(parts, M, top, RIGHT_X, top, LINE, 2.0 if final else 0.6,
                 None if final else "1 5", op=0.9 if final else 0.7)
        if final:
            txt(parts, M, top + 24, "THE COLLAPSE", 14, SOV_COLOR, "600",
                ls=1.2)

        head_off = 26 if final else 0
        circ(parts, M + 18, ty - 20 + head_off, 17, sc)
        txt(parts, M + 18, ty - 14 + head_off, str(n), 17, "white", "700",
            "middle")
        nl = fit(p[1], LEFT_W - 60, 19)
        ny = ty - 26 + head_off
        for l_ in nl[:2]:
            txt(parts, M + 44, ny, l_, 19, TEXT, "600")
            ny += 22
        txt(parts, M + 44, ny + 2, p[2], 14, TEXT_3, mono=True)

        # The bar IS the argument: length equals distance in time.
        bx0, bx1 = min(ANCHOR, rx_), max(ANCHOR, rx_)
        bar_col = SOV_COLOR if lag < 0 else sc
        rect(parts, bx0, ty - 7, bx1 - bx0, 14, bar_col, op=0.30, rx=7)
        circ(parts, ANCHOR, ty, 10, sc)
        circ(parts, rx_, ty, 10, "#FFFFFF", SOV_COLOR, 3.2)
        txt(parts, rx_, ty - 20, str(rec), 16, SOV_COLOR, "700", "middle",
            mono=True)
        # Citation sits under the bar on the side the bar runs, so it
        # never crosses the installed line.
        if lag < 0:
            txt(parts, ANCHOR - 12, ty + 34, p[5], 13.5, TEXT_3,
                anchor="end", italic=True)
        else:
            cy2 = ty + 34
            for cl in fit(p[5], 430, 13.5)[:2]:
                txt(parts, ANCHOR + 12, cy2, cl, 13.5, TEXT_3, italic=True)
                cy2 += 17

        big = "{:,}".format(abs(lag))
        col = SOV_COLOR if lag < 0 else TEXT
        txt(parts, RIGHT_X, ty + 2, big, 32, col, "700", "end")
        txt(parts, RIGHT_X, ty + 24,
            "years early" if lag < 0 else "years to first naming", 13.5,
            TEXT_3, anchor="end")

    y = bottom + 36
    for ln in fit("Twenty-seven centuries, then five centuries, then four, "
                  "then forty-four years — and then the line is crossed. Rows 24 "
                  "and 26 were named by sources that predate their build-out. That "
                  "is the finding, not an error in the dating: by the most recent "
                  "rows the description arrives before or alongside the thing it "
                  "describes. The lag is what used to protect you, and it is gone.",
                  W - 2 * M, 18):
        txt(parts, M, y, ln, 18, TEXT_2, italic=True)
        y += 25

    y += 16
    y = disclaimer(parts, M, y, W)
    return frame(parts, W, y + 40)


# =========================================================================
# FIGURE 7 — four properties
# =========================================================================
# Row 24 is the right comparison because it is recent, uncontested, and the
# reader is living inside it. The four properties are the author's test, and
# the labels say so; the row 24 column quotes the row's own data where it can.


def cross(parts, cx, cy, s, color):
    line(parts, cx - s, cy - s, cx + s, cy + s, color, s * 0.44, cap="round")
    line(parts, cx + s, cy - s, cx - s, cy + s, color, s * 0.44, cap="round")


def tick(parts, cx, cy, s, color):
    parts.append('<polyline points="%s,%s %s,%s %s,%s" fill="none" '
                 'stroke="%s" stroke-width="%s" stroke-linecap="round" '
                 'stroke-linejoin="round"/>'
                 % (r(cx - s), r(cy + s * 0.05), r(cx - s * 0.25), r(cy + s * 0.75),
                    r(cx + s), r(cy - s * 0.8), color, r(s * 0.44)))


def fig_four_properties():
    W = 1340
    M = 50
    PROP_X, PROP_W = 50, 400
    A_X, A_W = 480, 400
    B_X, B_W = 910, 380

    p24 = P[24]
    sev = p24[8]
    dark = SEV_COLORS[9]

    props = [
        ("Declared in advance",
         "Is the rule stated before it binds you?",
         "The engagement objective is never published. You meet it as "
         "experience, not as a term you were offered.",
         "Written down and dated before it takes effect. You can read it "
         "before you are inside it."),
        ("States what it forbids",
         "Does it name the things it rules out?",
         "It forbids nothing openly. It selects, ranks and rewards — a "
         "design, not a rule you could point at.",
         "Its prohibitions are the content. What it rules out is the part "
         "you can hold it to."),
        ("Inspectable by a non-truster",
         "Can a sceptic check it without taking anyone’s word?",
         "Ranking and experiment assignment are not visible from outside. "
         "Trust is the only posture available to you.",
         "Verifiable from outside by someone who assumes bad faith. Checking "
         "does not require permission."),
        ("Forkable and exitable",
         "Can you leave, or run your own, and keep what you built?",
         "Exit cost, in the row’s own words: " + p24[7] + ".",
         "Leaving is defined and cheap. A fork carries the same rules, so "
         "exit is not exile."),
    ]

    parts = []
    head(parts, W, "Four properties",
         "Row 24 of the genealogy, beside a constraint that is declared",
         "The four tests are the author’s; the row 24 column quotes the "
         "row’s own data")

    # --- Row 24, in the master's card grammar, laid out horizontally --------
    sy, sh = 196, 182
    rect(parts, M, sy, W - 2 * M, sh, "#FFFFFF", LINE, 0.8, 4)
    rect(parts, M, sy, 11, sh, SEV_COLORS[sev])
    rect(parts, M + 11, sy, W - 2 * M - 11, 13, SEV_COLORS[sev], op=0.6)
    circ(parts, M + 52, sy + 54, 26, TEXT)
    txt(parts, M + 52, sy + 62, "24", 23, "white", "700", "middle")
    txt(parts, M + 92, sy + 54, p24[1], 28, TEXT, "700")
    txt(parts, M + 92, sy + 78, p24[3].upper(), 14.5, TEXT_3, "500", ls=0.8)
    txt(parts, W - M - 20, sy + 44, p24[2], 16, TEXT_2, anchor="end", mono=True)
    sev_dots(parts, W - M - 224, sy + 70, sev, 4.2, 12, True, 14)

    by = sy + 108
    for ml in fit(p24[4], 520, 17):
        txt(parts, M + 22, by, ml, 17, TEXT)
        by += 22
    txt(parts, M + 22, sy + sh - 16, p24[5], 14.5, TEXT_3, italic=True)

    cx2 = M + 600
    txt(parts, cx2, sy + 108, "CAPTURES", 12.5, TEXT_3, "600", ls=1.0)
    txt(parts, cx2, sy + 132, p24[6], 18, SEV_COLORS[sev], "600")
    cx3 = M + 880
    txt(parts, cx3, sy + 108, "EXIT COST", 12.5, TEXT_3, "600", ls=1.0)
    ey = sy + 132
    for el in fit(p24[7], 300, 18):
        txt(parts, cx3, ey, el, 18, TEXT)
        ey += 22

    # --- The scoring matrix -------------------------------------------------
    hy = sy + sh + 46
    hh = 48
    rect(parts, A_X, hy, A_W, hh, dark, rx=4)
    txt(parts, A_X + A_W / 2, hy + 31, "ROW 24 · ATTENTION ECONOMY", 16,
        "#FFFFFF", "700", "middle", ls=0.8)
    rect(parts, B_X, hy, B_W, hh, SOV_COLOR, rx=4)
    txt(parts, B_X + B_W / 2, hy + 31, "A DECLARED CONSTRAINT", 16, "#FFFFFF",
        "700", "middle", ls=0.8)
    txt(parts, PROP_X, hy + 31, "THE FOUR TESTS", 16, TEXT_2, "600", ls=1.0)

    ry = hy + hh + 10
    for i, (name, gloss, cell_a, cell_b) in enumerate(props):
        la = fit(cell_a, A_W - 76, 15.5)
        lb = fit(cell_b, B_W - 76, 15.5)
        lg = fit(gloss, PROP_W - 10, 14.5)
        left_h = 34 + len(lg) * 19 + 12
        right_h = 28 + max(len(la), len(lb)) * 21 + 14
        rh = max(left_h, right_h) + 12
        if i % 2 == 0:
            rect(parts, PROP_X - 10, ry, W - 2 * M + 20, rh, "#FFFFFF", op=0.55,
                 rx=4)
        line(parts, PROP_X - 10, ry, W - M + 10, ry, LINE, 0.5, "1 4", op=0.8)

        txt(parts, PROP_X, ry + 34, name, 21, TEXT, "600")
        gy = ry + 58
        for g in lg:
            txt(parts, PROP_X, gy, g, 14.5, TEXT_3, italic=True)
            gy += 19

        cross(parts, A_X + 26, ry + 30, 12, dark)
        ay = ry + 28
        for l_ in la:
            txt(parts, A_X + 54, ay, l_, 15.5, TEXT)
            ay += 21

        tick(parts, B_X + 26, ry + 30, 12, SOV_COLOR)
        cy2 = ry + 28
        for l_ in lb:
            txt(parts, B_X + 54, cy2, l_, 15.5, TEXT)
            cy2 += 21

        ry += rh

    line(parts, PROP_X - 10, ry, W - M + 10, ry, LINE, 1.2)
    ry += 12
    sh2 = 68
    rect(parts, A_X, ry, A_W, sh2, dark, rx=4, op=0.10)
    txt(parts, A_X + 26, ry + 48, "0 / 4", 38, dark, "700")
    rect(parts, B_X, ry, B_W, sh2, SOV_COLOR, rx=4, op=0.10)
    txt(parts, B_X + 26, ry + 48, "4 / 4", 38, SOV_COLOR, "700")
    txt(parts, PROP_X, ry + 32, "SCORE", 16, TEXT_2, "600", ls=1.0)
    txt(parts, PROP_X, ry + 54, "the author’s assessment", 14, TEXT_3,
        italic=True)
    ry += sh2 + 44

    for ln in fit("The difference is not how much a thing shapes you. It is "
                  "whether you could read the terms in advance, see what they "
                  "rule out, check them yourself, and leave.", W - 2 * M, 21):
        txt(parts, M, ry, ln, 21, TEXT, "600")
        ry += 28

    ry += 14
    ry = disclaimer(parts, M, ry, W)
    return frame(parts, W, ry + 40)


# =========================================================================
# FIGURE 8 — the ramp
# =========================================================================
# Horizontal: what each row captures, ordered outward to inward. That
# ordering is a classification of the data, not part of it, so the figure
# prints every row's captured string in a key and says whose reading it is.
# Vertical: the exit-cost tier, taken from the first word of the row's own
# exit-cost string.

CAPTURE_AXIS = ["land / external", "body", "time", "attention", "perception",
                "desire", "will", "cognition"]

# row -> position on the outward-to-inward axis (1-indexed)
CAPTURE_BUCKET = {
    1: 1, 2: 1, 5: 1,
    16: 2,
    6: 3, 7: 3, 17: 3,
    23: 4, 24: 4,
    3: 5, 4: 5, 8: 5, 9: 5, 18: 5, 25: 5,
    12: 6, 20: 6, 26: 6,
    10: 7, 27: 7,
    11: 8, 13: 8, 14: 8, 15: 8, 19: 8, 21: 8, 28: 8,
}

EXIT_LABELS = ["Trivial", "Low", "Moderate", "High", "Very high",
               "Total / Extreme / Existential"]


def exit_tier(exit_cost):
    """Ordinal 0-5 from the leading word of a row's exit-cost string.

    Returns None for row 22, whose exit cost is n/a.
    """
    s = exit_cost.strip().lower()
    if s.startswith("n/a"):
        return None
    for key, rank in (("very high", 4), ("trivial", 0), ("low", 1),
                      ("moderate", 2), ("high", 3), ("extreme", 5),
                      ("total", 5), ("existential", 5)):
        if s.startswith(key):
            return rank
    raise ValueError(exit_cost)


def fig_the_ramp():
    W = 1200
    M = 60
    PX0, PX1 = 200, 1140
    PY0, PY1 = 240, 780
    ncol = len(CAPTURE_AXIS)
    colw = (PX1 - PX0) / float(ncol)
    rowh = (PY1 - PY0) / 6.0

    parts = []
    head(parts, W, "The ramp",
         "All 28 rows: what is captured, against what it costs to leave",
         "Outward to inward on the horizontal · colour is the severity ramp")

    # Grid.
    rect(parts, PX0, PY0, PX1 - PX0, PY1 - PY0, "#FFFFFF", None, None, 4,
         fop=0.6)
    for i in range(7):
        gy = PY1 - i * rowh
        line(parts, PX0, gy, PX1, gy, LINE, 0.6, "2 5", op=0.7)
    for i in range(ncol + 1):
        gx = PX0 + i * colw
        line(parts, gx, PY0, gx, PY1, LINE, 0.5, "2 5", op=0.5)

    for i, lab in enumerate(EXIT_LABELS):
        gy = PY1 - (i + 0.5) * rowh
        for j, l_ in enumerate(fit(lab, 170, 14.5)):
            txt(parts, PX0 - 14, gy + 5 + (j - (len(fit(lab, 170, 14.5)) - 1)
                                           / 2.0) * 17, l_, 14.5, TEXT_2,
                anchor="end")
    txt(parts, PX0 - 14, PY0 - 26, "EXIT COST", 14, TEXT_2, "600", anchor="end",
        ls=1.0)
    txt(parts, PX0 - 14, PY0 - 8, "tier from the row’s own wording", 12.5,
        TEXT_3, anchor="end", italic=True)

    for i, lab in enumerate(CAPTURE_AXIS):
        gx = PX0 + (i + 0.5) * colw
        txt(parts, gx, PY1 + 26, lab, 14.5, TEXT_2, "600", "middle")
    txt(parts, PX0, PY1 + 52, "← outward", 13.5, TEXT_3, italic=True)
    txt(parts, PX1, PY1 + 52, "inward →", 13.5, TEXT_3, anchor="end",
        italic=True)

    # Points, dodged inside each cell so none sit on top of another.
    cells = {}
    for n, b in CAPTURE_BUCKET.items():
        t = exit_tier(P[n][7])
        cells.setdefault((b, t), []).append(n)
    for (b, t), ns in sorted(cells.items()):
        ns.sort()
        cx = PX0 + (b - 0.5) * colw
        cy = PY1 - (t + 0.5) * rowh
        for i, n in enumerate(ns):
            ox = (i - (len(ns) - 1) / 2.0) * 31
            sev = P[n][8]
            circ(parts, cx + ox, cy, 14, SEV_COLORS[sev], "#FFFFFF", 1.6)
            txt(parts, cx + ox, cy + 5, str(n), 13,
                "#FFFFFF" if sev >= 5 else TEXT, "700", "middle")

    # Row 22 has no exit cost to plot; it gets its own line rather than a guess.
    ny = PY1 + 74
    circ(parts, PX0 + 0.5 * colw, ny, 14, SEV_COLORS[P[22][8]], SOV_COLOR, 2.4)
    txt(parts, PX0 + 0.5 * colw, ny + 5, "22", 13, TEXT, "700", "middle")
    txt(parts, PX0 + 0.5 * colw + 26, ny + 5,
        "Web 1.0 — exit cost reads " + P[22][7] + ", so it is not plotted "
        "on the vertical. It is the one fall in the sequence.", 14.5, SOV_COLOR)

    # Key: every row's captured string, verbatim, so the classification above
    # can be checked rather than taken on trust.
    ky = ny + 48
    txt(parts, M, ky, "WHAT EACH ROW CAPTURES — the wording is the "
        "diagram’s; the grouping is the author’s", 14, TEXT_2, "600",
        ls=0.6)
    ky += 22
    groups = [[1, 2], [3, 4], [5, 6], [7, 8]]
    col_x = [M, M + 285, M + 570, M + 855]
    maxy = ky
    for gi, buckets in enumerate(groups):
        y = ky
        for b in buckets:
            txt(parts, col_x[gi], y + 14, CAPTURE_AXIS[b - 1].upper(), 12.5,
                TEXT_3, "600", ls=0.8)
            y += 22
            for n in sorted(k for k, v in CAPTURE_BUCKET.items() if v == b):
                circ(parts, col_x[gi] + 8, y + 9, 8, SEV_COLORS[P[n][8]])
                txt(parts, col_x[gi] + 8, y + 13, str(n), 9,
                    "#FFFFFF" if P[n][8] >= 5 else TEXT, "700", "middle")
                cap = fit(P[n][6], 235, 13)
                cyk = y + 13
                for cl in cap[:2]:
                    txt(parts, col_x[gi] + 22, cyk, cl, 13, TEXT)
                    cyk += 16
                y += 19 + (len(cap[:2]) - 1) * 16
            y += 10
        maxy = max(maxy, y)

    y = maxy + 30
    for ln in fit("The horizontal ordering is a classification of the captures "
                  "column, not something the diagram states. Row 16 sits far to "
                  "the left at the top of the vertical: enclosure took the body "
                  "and left no exit. That is the exception, and it is why this "
                  "is not a ladder anyone climbed.", W - 2 * M, 16.5):
        txt(parts, M, y, ln, 16.5, TEXT_2, italic=True)
        y += 23

    y += 14
    y = disclaimer(parts, M, y, W)
    return frame(parts, W, y + 40)


# =========================================================================
# MAIN
# =========================================================================

FIGURES = [
    ("fig-zoom-rows-16-17.svg", fig_rows_16_17),
    ("fig-zoom-rows-23-26.svg", fig_rows_23_26),
    ("fig-zoom-rows-21-23.svg", fig_rows_21_23),
    ("fig-zoom-sovereign-fork.svg", fig_sovereign_fork),
    ("fig-the-lag.svg", fig_the_lag),
    ("fig-four-properties.svg", fig_four_properties),
    ("fig-the-ramp.svg", fig_the_ramp),
]


def blob_sha(data):
    """git hash-object equivalent, so a run can be checked against the repo."""
    import hashlib
    raw = data.encode("utf-8")
    return hashlib.sha1(b"blob " + str(len(raw)).encode() + bytes(1)
                        + raw).hexdigest()


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    import xml.dom.minidom as minidom
    for name, fn in FIGURES:
        svg = fn()
        minidom.parseString(svg)          # must parse as well-formed XML
        assert "&amp;amp;" not in svg
        path = os.path.join(OUT_DIR, name)
        with open(path, "w", encoding="utf-8") as f:
            f.write(svg)
        raw = svg.encode("utf-8")
        print("%-34s %7d B  %s" % (name, len(raw), blob_sha(svg)))
    print("")
    print("Figure 1 of the post is the existing genealogy-meaning-capture-light.svg;")
    print("it is not regenerated here.")


if __name__ == "__main__":
    main()
