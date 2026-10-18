#!/usr/bin/env python3
"""
The Genealogy of Meaning Capture — detailed SVG diagram.
Zoomable. Anthropologically/historically rigorous. Branches: capture path + sovereign fork.
"""

import os
import textwrap

# =========================================================================
# DATA
# =========================================================================

# (n, name, time, era, mechanism, citation, captured, exit_cost, severity_0_10)
PHASES = [
    (1, "Band-level sociality", ">300 kya", "Pleistocene",
     "Egalitarian leveling — ridicule, ostracism, and sharing taboos actively suppress incipient hierarchy.",
     "Boehm 1999 (ethnographic analogy); Sussman & Cloninger 2011", "Nothing yet — meaning emerges from kin and environment", "Trivial", 0),
    (2, "Kin-band cohesion", "~200–50 kya", "Pleistocene",
     "Song, fire-circle ritual, food-sharing, gesture, and gossip bind small groups. The numerical limit is disputed.",
     "Dunbar 1996; Wiessner 2014", "Belonging", "Low", 1),
    (3, "Out-group cognition  ★ GENESIS ★", "recurring, contextual", "Pleistocene",
     "First narrative apparatus: in-group / out-group framing under resource pressure. Meaning manufacture begins here.",
     "Tooby & Cosmides 2010; Fry 2013 (opposed readings)", "Identity boundary", "Low", 2),
    (4, "Shamanic specialization", "~45–15 kya", "Upper Paleolithic",
     "Trance states, dream interpretation, neuropsychologically-grounded cave imagery. First meaning-specialists.",
     "Lewis-Williams 2002; Winkelman 2000 (model contested)", "Cosmological frame", "Moderate", 3),
    (5, "Totemism / animism", "~45–15 kya", "Upper Paleolithic",
     "Ancestor spirits, sacred sites, taboo systems. Meaning embedded in landscape and lineage. "
     "'Totemism' is Durkheim's category, not a stage — Descola treats these as coexisting ontologies.",
     "Durkheim 1912; cf. Descola 2005 (rejects stage-model)", "Landscape + lineage", "High", 3),
    (6, "Pre-agricultural ritual complexes", "~11.5 kya", "Epipaleolithic",
     "Monumental building predates domesticated crops here. Weakens, rather than reverses, Childe's 'surplus → religion' order — the builders were already processing wild cereals.",
     "Schmidt 2010; Dietrich et al. 2012; cf. Banning 2011", "Coordination of labor by ritual authority", "High", 4),
    (7, "Sedentism / Neolithic", "~12–7 kya", "Early Holocene",
     "Harvest calendar, granary cult, household ritual. Independent loci across continents.",
     "Childe 1936; Hodder 2006", "Time itself", "High", 4),
    (8, "Surplus + chiefdom", "~7–5 kya", "Late Neolithic",
     "Hereditary authority claimed via ancestral / divine descent. Redistributive feasting.",
     "Earle 1997; cf. Service 1962 (typology now largely abandoned)", "Legitimacy of hierarchy", "High", 5),
    (9, "Priest-king / temple economy", "Sumer ~3200 / Egypt ~3100 BCE", "Bronze Age",
     "Cuneiform and hieroglyphics as priestly tools. Debt-as-sin. Cosmos codified in writing.",
     "Graeber 2011 (disputed); J. Assmann 1990", "Cosmic order itself", "Very high — afterlife implicated", 6),
    (10, "Divine law", "~1750 / ~600 BCE", "Bronze → Iron",
     "Hammurabi's Code; Mosaic redaction. Written law fused with theological authority.",
     "Roth 1997; Römer 2005", "Behavior + conscience", "Very high — eternal punishment", 7),
    (11, "Axial Age universal frameworks", "~800–200 BCE", "Iron Age",
     "Buddhism, Confucianism, Greek philosophy, prophetic monotheism. First PORTABLE, trans-tribal meaning.",
     "Jaspers 1949; Bellah 2011; cf. Mullins et al. 2018", "Self-concept", "Very high — cosmic orphanhood", 7),
    (12, "Imperial state religion", "380 / 632 CE +", "Late Antiquity",
     "Christianity, Islam, Hindu polities. Meaning fused to state coercion. Establishment, not toleration: the Edict of Thessalonica, 380.",
     "—", "Salvation / damnation framing", "Total where heresy was capital", 8),
    (13, "Scholastic monopoly", "~500–1500 CE", "Medieval",
     "Latin literacy and monastic scriptoria throughout; university gatekeeping only from c. 1088. Vernacular preaching and Jewish and Islamic scholarship ran alongside.",
     "Clanchy 1979; Stock 1983", "Access to interpretation", "Total within Latin Christendom", 8),
    (14, "Print revolution", "~1450–1700", "Early Modern",
     "Mass-produced text. Vernacular scripture. Pamphlet warfare.",
     "Eisenstein 1979; cf. Johns 1998", "Standardized meaning at scale", "Moderate — literacy required", 6),
    (15, "Reformation → nation-state", "~1500–1800", "Early Modern",
     "Religious meaning fractures. Standardized vernacular fills the void. 'Imagined communities.'",
     "Anderson 1983; cf. A. D. Smith 1986", "Linguistic identity", "High — statelessness", 7),
    (16, "Enclosure + wage labor", "~1500–1900 (England)", "→ Industrial",
     "Commons privatized. Survival becomes wage-dependent. The 'fictitious commodities' of land, labor, money.",
     "Polanyi 1944; Thompson 1963", "Body / time", "Total — no land = no food", 9),
    (17, "Industrial discipline", "~1780–1950", "Industrial",
     "Factory clock. Compulsory schooling. Taylorist scientific management.",
     "Foucault 1975; Thompson 1967; Taylor 1911", "Tempo of life", "Very high", 9),
    (18, "Mass press + nationalism", "~1800–1920", "Late Industrial",
     "Cheap newsprint manufactures imagined community at mass scale.",
     "Anderson 1983; Habermas 1962 (on the public sphere's decline)", "Public opinion", "Moderate", 7),
    (19, "PR / propaganda", "1920s onward", "20th c.",
     "Lippmann 1922 coins 'the manufacture of consent'; Bernays 1928 (Propaganda) professionalises it, and names it 'the engineering of consent' in 1947.",
     "Herman & Chomsky 1988", "Belief formation", "High — saturation", 8),
    (20, "Broadcast era (radio/TV)", "~1920–2000", "20th c.",
     "One-to-many. Ad-financed culture. Programmed leisure.",
     "McLuhan 1964; Postman 1985", "Aspiration / desire", "Moderate — opt-out has social cost", 7),
    (21, "Consumer identity", "~1950–present", "Post-war",
     "Brand-as-self. Lifestyle marketing. Debt-financed identity. The simulacrum.",
     "Galbraith 1958; Baudrillard 1970, 1981", "Self-concept", "High — status-coded", 8),
    (22, "Web 1.0 (brief reprieve)", "~1993–2005", "Early digital",
     "Decentralized publishing. Meaning briefly democratized. COUNTER-CURRENT to capture.",
     "Berners-Lee 1989; CERN public-domain release 1993", "n/a — counter-current", "n/a", 2),
    (23, "Platform consolidation", "~2005–2015", "Web 2.0",
     "Search, social, app stores. Gatekeeping returns at higher abstraction.",
     "Zuboff 2019; cf. Morozov 2019", "Discoverability", "High — off-platform = invisible", 8),
    (24, "Attention economy", "~2010–present", "Mobile era",
     "Engagement metrics, infinite scroll, variable-reward loops. Cognitive enclosure.",
     "Simon 1971; Goldhaber 1997; Wu 2016", "Focus / waking hours", "Very high — compulsion-loop design", 9),
    (25, "Algorithmic curation", "~2015–present", "Mobile era",
     "Recommendation engines shape the information diet. The strong 'filter bubble' claim is not supported: ranking slightly widens news diets; self-selection builds echo chambers.",
     "Pariser 2011 (since contested); Eubanks 2018", "What is even seen", "Very high — the unseen is unknowable", 9),
    (26, "Intent capture", "~2020–present", "GenAI era",
     "Predictive personalization. LLM-mediated search shapes desire BEFORE articulation.",
     "Yeung 2017", "Pre-conscious want", "Extreme — shaping is invisible", 10),
    (27, "Agency economy", "~2025–2040 (projected)", "Agent era",
     "AI agents act on your behalf. Volition outsourced. * Existential ONLY if unconscious of it.",
     "projection, not finding", "Will / decision-making", "Existential* (if unconscious)", 10),
    (28, "Meaning economy", "~2035+ (projected)", "Post-agent",
     "Interpretive frameworks themselves productized. Thinkable-space narrowed at machine speed. * Total ONLY if unconscious.",
     "projection, not finding", "Cognition itself", "Total* (if unconscious)", 10),
]

# Sovereign branch (post-recognition)
SOVEREIGN = [
    (29, "Architectural legibility", "post-recognition (any phase)",
     "The capture mechanisms become visible AS mechanisms. The trance breaks for that subject. The fork can activate at any historical phase, including this one.",
     "—", "First uncaptured choice", "n/a — recognition IS the exit"),
    (30, "Sovereign meaning-making", "post-recognition",
     "Productized interpretive frameworks proliferate, but the subject SELECTS deliberately. Agents serve volition rather than substitute for it. Meaning remains suffered-for, not delivered.",
     "Frankl 1946; Taylor 1989", "Authorship of one's own interpretive frame", "Held only by ongoing conscious choice"),
    (31, "Open meaning commons", "systemic horizon",
     "Distributed sovereign agents + open infrastructure hold the field clear so that legibility remains achievable across generations. Plural meanings coexist without enclosure. DAX is the author's own worked example of such a constraint architecture — one instance, not the category.",
     "Ostrom 1990; Illich 1973", "Conditions for self-arrived meaning to remain possible", "Maintained by participation"),
]

# =========================================================================
# LAYOUT CONFIG
# =========================================================================

W, H = 4000, 2050

# Phase card geometry
N_PHASES = 28
CARD_W = 130
CARD_GAP = 5
TOTAL_CARDS_W = N_PHASES * CARD_W + (N_PHASES - 1) * CARD_GAP  # 3775
START_X = (W - TOTAL_CARDS_W) / 2  # 112.5

CARD_TOP = 820
CARD_BOTTOM = 1320
CARD_H = CARD_BOTTOM - CARD_TOP  # 500

# Sovereign zone
SOV_TOP = 130
SOV_BOTTOM = 540
SOV_HORIZON_Y = 660  # the line where sovereign branches "live"

# Time markers
TIME_AXIS_Y = 730

# Severity gradient legend
SEV_BAR_Y = 1360
SEV_BAR_H = 45

# Footnotes
NOTES_Y = 1480

# Severity color ramp — DARK MODE (low → high capture, brighter as severity rises)
SEV_COLORS = [
    "#1E2522",  # 0 — barely above background
    "#2C3A2D",  # 1 — dim greenish
    "#3F4A33",  # 2 — olive
    "#5C5238",  # 3 — warm olive
    "#7A573B",  # 4 — bronze
    "#955A3D",  # 5
    "#B45D3E",  # 6
    "#D0603F",  # 7
    "#E55A3F",  # 8
    "#F2503D",  # 9
    "#FF4A3B",  # 10 — bright crimson alarm
]

SOV_COLOR = "#5FBFA8"        # bright teal (pops on dark)
SOV_COLOR_LIGHT = "#3A8A7A"
SOV_BG = "#152825"
BG = "#0E1211"
TEXT = "#E8E4DA"             # warm off-white
TEXT_2 = "#A8A39A"
TEXT_3 = "#6F6B62"
LINE = "#3A3A38"
PARCHMENT_LINE = "#2A2A28"

# =========================================================================
# UTILITIES
# =========================================================================

def phase_x_center(n):
    """Return center x of phase n (1-indexed)."""
    return START_X + (n - 1) * (CARD_W + CARD_GAP) + CARD_W / 2

def phase_x_left(n):
    return START_X + (n - 1) * (CARD_W + CARD_GAP)

def wrap(text, max_chars):
    """Word-wrap text."""
    return textwrap.wrap(text, width=max_chars, break_long_words=False, break_on_hyphens=True)

def esc(s):
    """Escape XML."""
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

# =========================================================================
# SVG BUILDER
# =========================================================================

parts = []

parts.append(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
    f'width="{W}" height="{H}" '
    f'font-family="-apple-system, BlinkMacSystemFont, \'Helvetica Neue\', Arial, sans-serif">'
)

# Background — warm parchment
parts.append(f'<rect width="{W}" height="{H}" fill="{BG}"/>')

# Subtle decorative top/bottom rules
parts.append(f'<line x1="60" y1="20" x2="{W-60}" y2="20" stroke="{PARCHMENT_LINE}" stroke-width="1"/>')
parts.append(f'<line x1="60" y1="{H-20}" x2="{W-60}" y2="{H-20}" stroke="{PARCHMENT_LINE}" stroke-width="1"/>')

# =========================================================================
# TITLE BLOCK
# =========================================================================

parts.append(
    f'<text x="{W/2}" y="62" text-anchor="middle" font-size="34" font-weight="600" fill="{TEXT}">'
    'The Genealogy of Meaning Capture</text>'
)
parts.append(
    f'<text x="{W/2}" y="92" text-anchor="middle" font-size="16" fill="{TEXT_2}" font-style="italic">'
    'From band-level sociality (&gt;300 kya) to the projected meaning economy (~2035+) — and the sovereign fork that remains open at every phase</text>'
)
parts.append(
    f'<text x="{W/2}" y="115" text-anchor="middle" font-size="13" fill="{TEXT_3}">'
    'Anthropological / historical sequence · genesis at row 3 · scholarly anchors inline · severity ramp is an interpretive scale set by the author, not a finding</text>'
)

# =========================================================================
# SOVEREIGN BRANCH ZONE (top region)
# =========================================================================

# Soft background panel for sovereign zone
parts.append(
    f'<rect x="60" y="{SOV_TOP}" width="{W-120}" height="{SOV_BOTTOM-SOV_TOP}" '
    f'fill="{SOV_BG}" fill-opacity="0.5" stroke="{SOV_COLOR_LIGHT}" stroke-width="0.5" rx="8"/>'
)

# Sovereign zone label (left side)
parts.append(
    f'<text x="80" y="{SOV_TOP+30}" font-size="18" font-weight="600" fill="{SOV_COLOR}">'
    'THE SOVEREIGN FORK</text>'
)
parts.append(
    f'<text x="80" y="{SOV_TOP+52}" font-size="13" fill="{SOV_COLOR}" font-style="italic">'
    'Available at any phase below — activates upon architectural legibility</text>'
)
parts.append(
    f'<text x="80" y="{SOV_TOP+72}" font-size="11" fill="{TEXT_2}">'
    'The fork is not a 32nd phase in time. It is a property that activates the moment</text>'
)
parts.append(
    f'<text x="80" y="{SOV_TOP+88}" font-size="11" fill="{TEXT_2}">'
    'a subject sees the architecture AS architecture. Capture rows describe the default;</text>'
)
parts.append(
    f'<text x="80" y="{SOV_TOP+104}" font-size="11" fill="{TEXT_2}">'
    'fork rows describe the alternative available to anyone who recognizes the stack.</text>'
)
parts.append(
    f'<text x="80" y="{SOV_TOP+128}" font-size="11" fill="{TEXT_2}" font-style="italic">'
    '"Meaning, in this framework, is not deliverable. It arrives through suffered-for resistance."</text>'
)

# Three sovereign cards — positioned at right portion of sovereign zone
SOV_CARDS_X_START = 1700
SOV_CARD_W = 700
SOV_CARD_GAP = 30
sov_card_h = SOV_BOTTOM - SOV_TOP - 30

for i, (n, name, time, mech, cite, captured, exit_cost) in enumerate(SOVEREIGN):
    cx = SOV_CARDS_X_START + i * (SOV_CARD_W + SOV_CARD_GAP)
    cy = SOV_TOP + 15

    # Card background
    parts.append(
        f'<rect x="{cx}" y="{cy}" width="{SOV_CARD_W}" height="{sov_card_h}" '
        f'fill="#1A201E" stroke="{SOV_COLOR}" stroke-width="1.5" rx="6"/>'
    )

    # Number circle (top-left)
    parts.append(
        f'<circle cx="{cx+30}" cy="{cy+30}" r="20" fill="{SOV_COLOR}"/>'
    )
    parts.append(
        f'<text x="{cx+30}" y="{cy+36}" text-anchor="middle" font-size="16" font-weight="600" fill="white">{n}</text>'
    )

    # Phase name
    parts.append(
        f'<text x="{cx+62}" y="{cy+27}" font-size="18" font-weight="600" fill="{TEXT}">{esc(name)}</text>'
    )
    parts.append(
        f'<text x="{cx+62}" y="{cy+45}" font-size="11" fill="{TEXT_3}" font-style="italic">{esc(time)}</text>'
    )

    # Divider
    parts.append(
        f'<line x1="{cx+15}" y1="{cy+62}" x2="{cx+SOV_CARD_W-15}" y2="{cy+62}" stroke="{SOV_COLOR_LIGHT}" stroke-width="0.5"/>'
    )

    # Mechanism (wrapped)
    wrapped = wrap(mech, 78)
    for j, line in enumerate(wrapped):
        parts.append(
            f'<text x="{cx+15}" y="{cy+82+j*16}" font-size="12" fill="{TEXT}">{esc(line)}</text>'
        )

    y_offset = cy + 82 + len(wrapped) * 16 + 14

    # Captured
    parts.append(
        f'<text x="{cx+15}" y="{y_offset}" font-size="10" fill="{TEXT_3}" font-weight="600" letter-spacing="0.5">CAPTURES (or rather: AUTHORS)</text>'
    )
    cap_wrapped = wrap(captured, 70)
    for j, line in enumerate(cap_wrapped):
        parts.append(
            f'<text x="{cx+15}" y="{y_offset+15+j*14}" font-size="11" fill="{SOV_COLOR}" font-weight="500">{esc(line)}</text>'
        )
    y_offset += 15 + len(cap_wrapped) * 14 + 10

    # Exit
    parts.append(
        f'<text x="{cx+15}" y="{y_offset}" font-size="10" fill="{TEXT_3}" font-weight="600" letter-spacing="0.5">EXIT COST</text>'
    )
    exit_wrapped = wrap(exit_cost, 70)
    for j, line in enumerate(exit_wrapped):
        parts.append(
            f'<text x="{cx+15}" y="{y_offset+15+j*14}" font-size="11" fill="{TEXT}">{esc(line)}</text>'
        )
    y_offset += 15 + len(exit_wrapped) * 14 + 8

    # Citation
    if cite and cite != "—":
        parts.append(
            f'<text x="{cx+15}" y="{y_offset}" font-size="10" fill="{TEXT_3}" font-style="italic">{esc(cite)}</text>'
        )

# Arrow flow between sovereign cards
for i in range(len(SOVEREIGN) - 1):
    x1 = SOV_CARDS_X_START + (i + 1) * SOV_CARD_W + i * SOV_CARD_GAP
    x2 = x1 + SOV_CARD_GAP
    y = SOV_TOP + 15 + sov_card_h / 2
    parts.append(
        f'<line x1="{x1+2}" y1="{y}" x2="{x2-4}" y2="{y}" stroke="{SOV_COLOR}" stroke-width="2" marker-end="url(#sov-arrow)"/>'
    )

# Marker for sovereign arrows
parts.append(
    '<defs>'
    f'<marker id="sov-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">'
    f'<path d="M0,0 L10,5 L0,10 Z" fill="{SOV_COLOR}"/>'
    f'</marker>'
    f'<marker id="line-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">'
    f'<path d="M0,0 L8,4 L0,8 Z" fill="{LINE}"/>'
    f'</marker>'
    '</defs>'
)

# =========================================================================
# FORK CONNECTOR LINES
# Curved dashed lines from each phase card UP to the sovereign horizon
# =========================================================================

for n, name, time, era, mech, cite, captured, exit_cost, sev in PHASES:
    px = phase_x_center(n)

    # Curve from card top up to sovereign zone bottom
    # Control points for a gentle S-curve
    y_start = CARD_TOP - 4
    y_end = SOV_BOTTOM
    cy1 = y_start - 60
    cy2 = y_end + 60

    # Highlight Web 1.0 fork (counter-current) more
    if n == 22:
        parts.append(
            f'<path d="M {px} {y_start} C {px} {cy1}, {px} {cy2}, {px} {y_end}" '
            f'fill="none" stroke="{SOV_COLOR}" stroke-width="1.4" '
            f'stroke-dasharray="4 4" opacity="0.85"/>'
        )
    else:
        parts.append(
            f'<path d="M {px} {y_start} C {px} {cy1}, {px} {cy2}, {px} {y_end}" '
            f'fill="none" stroke="{SOV_COLOR}" stroke-width="0.7" '
            f'stroke-dasharray="3 5" opacity="0.55"/>'
        )

# A label explaining the fork lines
parts.append(
    f'<text x="80" y="{SOV_BOTTOM + 30}" font-size="12" fill="{SOV_COLOR}" font-style="italic">'
    '↑ dashed lines: the fork is available from every phase below — recognition is the exit'
    '</text>'
)

# =========================================================================
# HORIZON LINE / ERA BAND
# =========================================================================

# A horizontal "horizon" — separating capture (below) from sovereignty (above)
parts.append(
    f'<line x1="60" y1="{SOV_HORIZON_Y}" x2="{W-60}" y2="{SOV_HORIZON_Y}" '
    f'stroke="{PARCHMENT_LINE}" stroke-width="1.5"/>'
)

# Era group labels (positioned above their phase clusters)
era_groups = [
    ("Pleistocene → Upper Paleolithic", 1, 5),
    ("Neolithic → Bronze / Iron", 6, 11),
    ("Imperial / Medieval", 12, 13),
    ("Print → Industrial", 14, 17),
    ("Mass media century", 18, 21),
    ("Digital / Algorithmic / Projected", 22, 28),
]

era_y = SOV_HORIZON_Y + 25
for label, n_start, n_end in era_groups:
    x_start = phase_x_left(n_start)
    x_end = phase_x_left(n_end) + CARD_W
    cx = (x_start + x_end) / 2

    parts.append(
        f'<line x1="{x_start+5}" y1="{era_y-12}" x2="{x_end-5}" y2="{era_y-12}" '
        f'stroke="{TEXT_3}" stroke-width="0.5"/>'
    )
    parts.append(
        f'<text x="{cx}" y="{era_y}" text-anchor="middle" font-size="11" '
        f'fill="{TEXT_2}" font-weight="500" letter-spacing="1">{esc(label.upper())}</text>'
    )

# =========================================================================
# TIME AXIS (above cards)
# =========================================================================

# Horizontal axis line just above cards
parts.append(
    f'<line x1="{START_X-10}" y1="{TIME_AXIS_Y}" x2="{START_X+TOTAL_CARDS_W+10}" y2="{TIME_AXIS_Y}" '
    f'stroke="{LINE}" stroke-width="1"/>'
)

# Time tick under each phase
time_label_short = {
    1: ">300 kya", 2: "200 kya", 3: "•", 4: "45 kya", 5: "•",
    6: "11.5 kya", 7: "12 kya", 8: "7 kya", 9: "3200 BCE", 10: "1750 BCE",
    11: "800 BCE", 12: "313 CE", 13: "500 CE", 14: "1450", 15: "1500",
    16: "1500", 17: "1780", 18: "1800", 19: "1920s", 20: "1920",
    21: "1950", 22: "1993", 23: "2005", 24: "2010", 25: "2015",
    26: "2020", 27: "2025+", 28: "2035+",
}

for n in range(1, N_PHASES + 1):
    px = phase_x_center(n)
    parts.append(
        f'<line x1="{px}" y1="{TIME_AXIS_Y-3}" x2="{px}" y2="{TIME_AXIS_Y+3}" '
        f'stroke="{LINE}" stroke-width="1"/>'
    )
    parts.append(
        f'<text x="{px}" y="{TIME_AXIS_Y-8}" text-anchor="middle" font-size="9" '
        f'fill="{TEXT_3}" font-family="ui-monospace, Menlo, monospace">{esc(time_label_short[n])}</text>'
    )

# =========================================================================
# MAIN PHASE CARDS
# =========================================================================

for n, name, time, era, mech, cite, captured, exit_cost, sev in PHASES:
    cx_left = phase_x_left(n)
    cx_center = phase_x_center(n)

    sev_color = SEV_COLORS[sev]

    # Card background — dark with severity-tinted left border
    parts.append(
        f'<rect x="{cx_left}" y="{CARD_TOP}" width="{CARD_W}" height="{CARD_H}" '
        f'fill="#181C1B" stroke="{LINE}" stroke-width="0.5" rx="3"/>'
    )

    # Severity strip on left edge (full height)
    parts.append(
        f'<rect x="{cx_left}" y="{CARD_TOP}" width="5" height="{CARD_H}" '
        f'fill="{sev_color}"/>'
    )

    # Severity-tinted top header band
    parts.append(
        f'<rect x="{cx_left+5}" y="{CARD_TOP}" width="{CARD_W-5}" height="6" '
        f'fill="{sev_color}" opacity="0.6"/>'
    )

    # Phase number circle
    is_genesis = (n == 3)
    is_counter = (n == 22)

    # Dark mode: bright circle with dark text
    if is_genesis:
        circle_color = "#E5715A"  # bright coral for genesis
        num_color = "#1A0F0A"
    elif is_counter:
        circle_color = SOV_COLOR  # bright teal for counter-current
        num_color = "#0A1814"
    else:
        circle_color = TEXT  # off-white circle
        num_color = BG  # dark text inside

    parts.append(
        f'<circle cx="{cx_left+22}" cy="{CARD_TOP+24}" r="14" fill="{circle_color}"/>'
    )
    parts.append(
        f'<text x="{cx_left+22}" y="{CARD_TOP+29}" text-anchor="middle" font-size="13" '
        f'font-weight="700" fill="{num_color}">{n}</text>'
    )

    # Time period (top-right of header)
    time_lines = wrap(time, 14)
    for i, tl in enumerate(time_lines[:2]):
        parts.append(
            f'<text x="{cx_left+CARD_W-7}" y="{CARD_TOP+19+i*11}" text-anchor="end" '
            f'font-size="9" fill="{TEXT_2}" font-family="ui-monospace, Menlo, monospace">{esc(tl)}</text>'
        )

    # Phase name
    name_lines = wrap(name, 17)
    name_y = CARD_TOP + 58
    for i, nl in enumerate(name_lines[:3]):
        is_genesis_text = "GENESIS" in nl
        weight = "700"
        color = "#E5715A" if is_genesis_text else TEXT
        sz = "12" if len(name_lines) > 2 else "13"
        parts.append(
            f'<text x="{cx_left+10}" y="{name_y+i*16}" font-size="{sz}" '
            f'font-weight="{weight}" fill="{color}">{esc(nl)}</text>'
        )

    # Track y cursor for dynamic flow
    y = name_y + len(name_lines) * 16 + 6

    # Era pill
    parts.append(
        f'<text x="{cx_left+10}" y="{y}" font-size="9" fill="{TEXT_3}" '
        f'letter-spacing="0.5" font-weight="500">{esc(era.upper())}</text>'
    )
    y += 10

    # Divider
    parts.append(
        f'<line x1="{cx_left+10}" y1="{y}" x2="{cx_left+CARD_W-10}" y2="{y}" '
        f'stroke="{LINE}" stroke-width="0.5" stroke-dasharray="2 2"/>'
    )
    y += 14

    # Mechanism
    mech_lines = wrap(mech, 21)
    for ml in mech_lines[:16]:
        parts.append(
            f'<text x="{cx_left+10}" y="{y}" font-size="10" '
            f'fill="{TEXT}">{esc(ml)}</text>'
        )
        y += 13

    y += 8

    # Captures section
    parts.append(
        f'<text x="{cx_left+10}" y="{y}" font-size="8" fill="{TEXT_3}" '
        f'font-weight="600" letter-spacing="0.7">CAPTURES</text>'
    )
    y += 13
    cap_lines = wrap(captured, 22)
    for cl in cap_lines[:3]:
        cap_color = sev_color if sev > 5 else TEXT
        parts.append(
            f'<text x="{cx_left+10}" y="{y}" font-size="10" '
            f'font-weight="600" fill="{cap_color}">{esc(cl)}</text>'
        )
        y += 12

    y += 8

    # Exit cost section
    parts.append(
        f'<text x="{cx_left+10}" y="{y}" font-size="8" fill="{TEXT_3}" '
        f'font-weight="600" letter-spacing="0.7">EXIT COST</text>'
    )
    y += 13
    exit_lines = wrap(exit_cost, 22)
    for el in exit_lines[:4]:
        parts.append(
            f'<text x="{cx_left+10}" y="{y}" font-size="10" '
            f'fill="{TEXT}">{esc(el)}</text>'
        )
        y += 12

    y += 10

    # Citation (italic)
    if cite and cite != "—":
        cite_lines = wrap(cite, 22)
        for cli in cite_lines[:4]:
            parts.append(
                f'<text x="{cx_left+10}" y="{y}" font-size="9" '
                f'fill="{TEXT_3}" font-style="italic">{esc(cli)}</text>'
            )
            y += 11

    # Severity indicator at bottom of card (always at fixed bottom position)
    sev_dots_y = CARD_BOTTOM - 14

    # Vertical color band on right side showing severity gradient continuously down empty space
    if y < sev_dots_y - 20:
        # Fill the empty space with a subtle severity-tinted gradient
        parts.append(
            f'<rect x="{cx_left+CARD_W-7}" y="{y+5}" width="3" height="{sev_dots_y-y-15}" '
            f'fill="{sev_color}" opacity="0.5" rx="1"/>'
        )

    # Severity dots
    for i in range(10):
        dot_color = SEV_COLORS[i+1] if i < sev else "#2A2D2B"
        parts.append(
            f'<circle cx="{cx_left+10+i*5}" cy="{sev_dots_y}" r="1.6" fill="{dot_color}"/>'
        )
    parts.append(
        f'<text x="{cx_left+CARD_W-7}" y="{sev_dots_y+3}" text-anchor="end" '
        f'font-size="8" fill="{TEXT_3}">sev {sev}/10</text>'
    )

# =========================================================================
# Highlight: GENESIS arrow & Web 1.0 counter-current marker
# =========================================================================

# Genesis annotation (row 3)
gx = phase_x_center(3)
parts.append(
    f'<path d="M {gx-25} {CARD_TOP-15} Q {gx-12} {CARD_TOP-30} {gx} {CARD_TOP-6}" '
    f'fill="none" stroke="#E5715A" stroke-width="1.2" marker-end="url(#line-arrow)"/>'
)
parts.append(
    f'<text x="{gx-130}" y="{CARD_TOP-30}" font-size="11" font-weight="600" '
    f'fill="#E5715A">★ Meaning manufacture begins here</text>'
)
parts.append(
    f'<text x="{gx-130}" y="{CARD_TOP-16}" font-size="10" fill="{TEXT_2}" font-style="italic">'
    'first narrative apparatus = the imperial primitive</text>'
)

# Counter-current annotation (row 22)
wx = phase_x_center(22)
parts.append(
    f'<path d="M {wx-3} {CARD_TOP-6} Q {wx-15} {CARD_TOP-25} {wx-50} {CARD_TOP-22}" '
    f'fill="none" stroke="{SOV_COLOR}" stroke-width="1.2"/>'
)
parts.append(
    f'<text x="{wx-200}" y="{CARD_TOP-25}" font-size="10" fill="{SOV_COLOR}" '
    f'font-style="italic">Web 1.0: brief reprieve / counter-current</text>'
)

# =========================================================================
# SEVERITY GRADIENT LEGEND
# =========================================================================

leg_x = 100
leg_w = 600
parts.append(
    f'<text x="{leg_x}" y="{SEV_BAR_Y-8}" font-size="11" font-weight="600" '
    f'fill="{TEXT_2}" letter-spacing="0.5">DEPTH OF INTERIOR CAPTURE  →  (severity color ramp)</text>'
)
seg_w = leg_w / 11
for i, color in enumerate(SEV_COLORS):
    parts.append(
        f'<rect x="{leg_x+i*seg_w}" y="{SEV_BAR_Y}" width="{seg_w}" height="{SEV_BAR_H}" fill="{color}"/>'
    )
    parts.append(
        f'<text x="{leg_x+i*seg_w+seg_w/2}" y="{SEV_BAR_Y+SEV_BAR_H+15}" text-anchor="middle" '
        f'font-size="10" fill="{TEXT_3}">{i}</text>'
    )

# Labels under bar
parts.append(
    f'<text x="{leg_x}" y="{SEV_BAR_Y+SEV_BAR_H+30}" font-size="10" fill="{TEXT_2}" font-style="italic">'
    'land / external</text>'
)
parts.append(
    f'<text x="{leg_x+leg_w/2}" y="{SEV_BAR_Y+SEV_BAR_H+30}" text-anchor="middle" font-size="10" fill="{TEXT_2}" font-style="italic">'
    'body, time, attention</text>'
)
parts.append(
    f'<text x="{leg_x+leg_w}" y="{SEV_BAR_Y+SEV_BAR_H+30}" text-anchor="end" font-size="10" fill="{TEXT_2}" font-style="italic">'
    'will, cognition, interpretive frame</text>'
)

# Honesty caption: the ramp is not scholarship
parts.append(
    f'<text x="{leg_x}" y="{SEV_BAR_Y+SEV_BAR_H+52}" font-size="10" font-weight="600" fill="{TEXT}">'
    'Severity and exit cost are the author’s own interpretive scale, not scholarship — no cited source ranks these phases.</text>'
)
parts.append(
    f'<text x="{leg_x}" y="{SEV_BAR_Y+SEV_BAR_H+66}" font-size="10" fill="{TEXT_2}">'
    'The citations support each card’s mechanism, not its position on this ramp.</text>'
)

# Phase severity legend on the right — inverted scale showing it's not time-linear
right_x = 1050
parts.append(
    f'<text x="{right_x}" y="{SEV_BAR_Y-8}" font-size="11" font-weight="600" '
    f'fill="{TEXT_2}" letter-spacing="0.5">READING THE DIAGRAM</text>'
)

reading_lines = [
    "• Each card = a phase in the genealogy of meaning capture",
    "• This is NOT a stage theory of social evolution — it tracks what capture targets. Societies did not climb this",
    "• Number circle: red = genesis (row 3); teal = counter-current (row 22)",
    "• Severity dots encode the author's own 0–10 judgement of how deep the capture goes — an interpretive scale, not a finding",
    "• Dashed teal curves rising upward: the sovereign fork remains accessible at every phase",
    "• Top panel: post-recognition track (architectural legibility → sovereign meaning-making → open commons)",
    "• Time axis is NOT linear — earlier eras are compressed; modern density given proportional space",
    "• Citations inline are the principal scholarly anchors, not exhaustive. Several are interpretive works",
    "   whose central thesis is disputed in the empirical literature — those are marked on the card and in the notes",
]
for i, line in enumerate(reading_lines):
    parts.append(
        f'<text x="{right_x}" y="{SEV_BAR_Y+5+i*14}" font-size="10.5" fill="{TEXT}">{esc(line)}</text>'
    )

# =========================================================================
# FOOTNOTES / SCHOLARLY NOTES
# =========================================================================

note_x = 100
note_y = NOTES_Y + 60

parts.append(
    f'<text x="{note_x}" y="{NOTES_Y+30}" font-size="14" font-weight="600" fill="{TEXT}">'
    'Anthropological &amp; historical notes</text>'
)
parts.append(
    f'<line x1="{note_x}" y1="{NOTES_Y+38}" x2="{note_x+250}" y2="{NOTES_Y+38}" stroke="{TEXT_2}" stroke-width="0.5"/>'
)

notes = [
    ("Row 1–3 (Pleistocene revisionism)",
     "The older picture of constant prehistoric warfare has been substantially complicated — Fry (2013) and Sussman & Cloninger (2011) argue that lethal "
     "intergroup conflict was rare among nomadic foragers, and Rutar's 2023 survey finds war 'a minority affair' among them, while conceding a sizable minority do fight. "
     "Boehm (1999) belongs here for a different reason: his argument is not that humans are peaceful but that we carry a dominance drive which small groups actively "
     "suppress through ridicule, ostracism and sanction — and his evidence base is recent foragers, not the Pleistocene, so the date is analogy. "
     "Tooby & Cosmides (2010) supply the cognitive machinery for in-group/out-group construction and read it as deep and adaptive; Fry reads its deployment as contextual. "
     "Genesis at row 3 is deliberately conservative: it marks where the apparatus becomes available as a recurring tool, not where a permanent regime of war begins."),
    ("Row 6 (Göbekli Tepe)",
     "Schmidt's excavations (1995–2014) showed monumental architecture at Göbekli Tepe predating domesticated crops in the region — a real challenge to Childe's "
     "'surplus → settlement → religion' order. Since Schmidt's death the picture has been revised by the site's own team: domestic structures, rainwater cisterns and "
     "7,000+ grinding stones now point to a settlement where ritual and everyday life coexisted, not a sanctuary served by nomads (Banning 2011 argues the enclosures were "
     "houses all along). And the builders sat ~30 km from Karaca dağ, where einkorn was domesticated (Heun et al. 1997). The honest version is co-evolution, not inversion: "
     "meaning infrastructure and subsistence intensification arrive together. That is still enough for the point being made here — meaning-making is not a luxury purchased with surplus."),
    ("Row 11 (Axial Age)",
     "Jaspers's 1949 framework remains useful but contested. Bellah (2011) extends it. Assmann calls it a projection of modernity backwards, and charges it with Eurocentrism "
     "and excessive discontinuity; Mullins et al. (2018) tested it against the Seshat global databank and found the supposedly axial traits appearing centuries to millennia "
     "earlier, across Afro-Eurasia. What survives the criticism is the structural point: meaning frameworks become PORTABLE, decoupled from local geography and lineage. "
     "This is the first time meaning can travel across tribes — and the first time it can be IMPOSED across tribes."),
    ("Row 16–17 (Polanyi's fictitious commodities)",
     "Land, labor, and money are 'fictitious commodities' (Polanyi 1944) — they were never produced for sale, but enclosure forces them into market logic. "
     "Once the commons is enclosed, survival depends on wage labor, which depends on the time-discipline of the factory clock (Thompson 1967; Glennie & Thrift 2009 show "
     "clock-time was more widespread pre-industrially than Thompson allowed). Foucault (1975) shows how the school, prison, factory, and barracks share a common disciplinary "
     "architecture. The body becomes the site of capture. Dates and evidence here are English; Polanyi's book is about Britain."),
    ("Row 19 (Manufacturing consent)",
     "Lippmann's Public Opinion (1922) coins 'the manufacture of consent'; Bernays's Propaganda (1928) professionalises the practice, and his 1947 article names it "
     "'the engineering of consent.' Herman & Chomsky's 1988 propaganda model — Herman is first author and is generally credited with the model itself — identifies "
     "five filters: ownership, advertising, sourcing, flak, and, in the first edition, anti-communism, later broadened to a generalised fear ideology. "
     "This is meaning-economy logic operating with 20th-century technology."),
    ("Rows 23–25 (Surveillance capitalism)",
     "Zuboff's 2019 The Age of Surveillance Capitalism documents the shift from observing behavior to MODIFYING behavior at scale (Morozov 2019 argues she overstates both the "
     "novelty and the demonstrated efficacy). Pariser's 2011 'filter bubble' has fared worse: a decade of testing finds algorithmic ranking produces slightly MORE diverse news "
     "exposure, not less, and that echo chambers are built by self-selection among a partisan minority (Ross Arguedas et al., Reuters Institute, 2022). Eubanks (2018) holds up "
     "— her automated welfare and criminal-justice cases are documented. The 2010s built infrastructure capable of meaning-shaping at planetary scale; whether the filter "
     "bubble is how it works is a different question, and the evidence says mostly not."),
    ("Rows 26–28 (Projected)",
     "Intent capture, agency economy, and meaning economy are extrapolations from current trajectory, not predictions. They depend on choices not yet made. "
     "Yeung's 'hypernudge' (2017) is the nearest peer-reviewed anchor for row 26; rows 27 and 28 have none, and are labelled projections on the cards. "
     "The fork (rows 29–31) is the alternative architecture — distributed, sovereign, conscious. Frankl's Man's Search for Meaning (1946) is read here as the "
     "anti-meaning-economy manual, written before the technology existed to make the threat fully legible; that reading is the author's. The work is not to deliver meaning "
     "but to keep open the conditions under which meaning can still be self-arrived."),
    ("Standing objections (read these against the diagram)",
     "Three criticisms land and are not answered here. (1) Band → tribe → chiefdom → state is Service 1962 and the field has largely abandoned it (Yoffee 2005); "
     "Graeber & Wengrow, The Dawn of Everything (2021), argue there was no single ladder at all and that people moved between political forms deliberately. This diagram tracks "
     "what gets captured, not social complexity — but that defence only works if it is said out loud, so it is said here. (2) Several anchors are trade books rather than "
     "empirical research, and three have taken direct hits: Pariser, Zuboff and Graeber. (3) The severity and exit-cost columns are the author's own interpretive scale. "
     "No cited source ranks any phase on a 0–10 ramp. Corrections are welcome and go into the next version with credit."),
]

col_w = 1900
col_x_positions = [100, 2050]
col_max = 2  # 2 columns
notes_per_col = (len(notes) + col_max - 1) // col_max  # 4 in left, 3 in right

y_cursor = [NOTES_Y + 60, NOTES_Y + 60]

for idx, (title, body) in enumerate(notes):
    col = 0 if idx < notes_per_col else 1

    # Title
    parts.append(
        f'<text x="{col_x_positions[col]}" y="{y_cursor[col]}" font-size="12" font-weight="700" fill="{TEXT}">{esc(title)}</text>'
    )
    y_cursor[col] += 18

    # Body wrapped wider
    body_lines = wrap(body, 220)
    for line in body_lines:
        parts.append(
            f'<text x="{col_x_positions[col]}" y="{y_cursor[col]}" font-size="10.5" fill="{TEXT}">{esc(line)}</text>'
        )
        y_cursor[col] += 14

    y_cursor[col] += 12

# =========================================================================
# BOTTOM SIGNATURE / FRAMING
# =========================================================================

# Big takeaway
ty = H - 130
parts.append(
    f'<line x1="100" y1="{ty-20}" x2="{W-100}" y2="{ty-20}" stroke="{PARCHMENT_LINE}" stroke-width="0.5"/>'
)
parts.append(
    f'<text x="{W/2}" y="{ty}" text-anchor="middle" font-size="16" font-weight="600" fill="{TEXT}" font-style="italic">'
    'Each layer is harder to detect, harder to exit, and extracts something more intimate than the last.</text>'
)
parts.append(
    f'<text x="{W/2}" y="{ty+26}" text-anchor="middle" font-size="14" fill="{SOV_COLOR}">'
    'The architecture is not predetermined. The fork is always available. Recognition is the exit.</text>'
)
parts.append(
    f'<text x="{W/2}" y="{ty+50}" text-anchor="middle" font-size="11" fill="{TEXT_3}" font-style="italic">'
    'A map, not a finding · periodisation, severity and direction of travel are a reading by the author · corrections go into the next version with credit</text>'
)

# Close SVG
parts.append('</svg>')

# Write file
output = '\n'.join(parts)
# Output is resolved relative to the repo root (this file lives in
# views/jeyanandan/tools/), so the script works from any cwd.
_HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(_HERE, os.pardir, os.pardir, os.pardir))
out_dir = os.path.join(REPO_ROOT, "views", "jeyanandan", "public", "figures")
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "genealogy-meaning-capture-dark.svg")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(output)

print(f"Wrote {out_path}")
print(f"Size: {len(output):,} bytes")
print(f"Dimensions: {W}x{H}")
print(f"Phases: {N_PHASES}")
print(f"Sovereign fork rows: {len(SOVEREIGN)}")
