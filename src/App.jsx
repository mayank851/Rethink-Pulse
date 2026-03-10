import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

// ══════════════════════════════════════════════════════════════
// REAL DATA — Feb 2026
// ══════════════════════════════════════════════════════════════
const WEEK_LABELS = ["01-Feb", "08-Feb", "15-Feb", "22-Feb"];
const LOC_FULL = { HSR: "HSR Layout", MTH: "Marathahalli", BTM: "BTM Layout", IND: "Indiranagar" };

const BRANDS_META = {
  TOP: { full: "Taste of Protein", color: "#818CF8", dim: "rgba(129,140,248,0.08)" },
  FB:  { full: "FytBlend",         color: "#FCD34D", dim: "rgba(252,211,77,0.08)"  },
  FI:  { full: "Foldit",           color: "#6EE7B7", dim: "rgba(110,231,183,0.08)" },
};

// Swiggy Net Payout (₹) — Weekly
const SWIGGY = {
  TOP: {
    HSR: [27328, 34941, 32357, 27207],
    MTH: [19478, 28026, 32518, 31579],
    BTM: [6552,  5545,  8545,  11593],
    IND: [-205,  -1755, 1070,  1935 ],
  },
  FB: {
    HSR: [1415,  4000,  4355,  6708 ],
    MTH: [2657,  2022,  2501,  2206 ],
    BTM: [-3761, -4123, -3567, -1970],
    IND: [null,  null,  372,   null ],
  },
  FI: {
    HSR: [396,   1448,  2334,  1217 ],
    MTH: [930,   926,   449,   920  ],
    BTM: [null,  null,  null,  null ],
    IND: [-370,  null,  null,  -195 ],
  },
};

// Zomato Net Payout — Weekly W1-W3 (W4 not yet settled)
const ZOMATO_WK = {
  TOP: { HSR: [42336, 37316, 37154, null], MTH: [14498, 20874, 22854, null], BTM: [12605, 17312, 19416, null], IND: [5174, 5468, 5978, null] },
  FB:  { HSR: [5005,  4178,  4729,  null], MTH: [1286,  2328,  2713,  null], BTM: [784,   162,   261,   null], IND: [1753, 2129, 659,  null] },
  FI:  { HSR: [5759,  4319,  4745,  null], MTH: [4692,  6670,  9008,  null], BTM: [0,     0,     805,   null], IND: [3003, 2531, 1370, null] },
};

// Zomato Full Month Net Payout (Feb 2026)
const ZOMATO_MO = {
  TOP: { HSR: 158373, MTH: 75543, BTM: 69884, IND: 23502 },
  FB:  { HSR: 12930,  MTH: 7981,  BTM: 2023,  IND: 6912  },
  FI:  { HSR: 18335,  MTH: 24731, BTM: 805,   IND: 6438  },
};

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n) => {
  if (n === null || n === undefined) return "—";
  const s = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 100000) return `${s}₹${(a / 100000).toFixed(1)}L`;
  if (a >= 1000)   return `${s}₹${(a / 1000).toFixed(0)}K`;
  return `${s}₹${a.toFixed(0)}`;
};
const fmtFull = (n) => n == null ? "—" : `${n < 0 ? "-" : ""}₹${Math.abs(n).toLocaleString("en-IN")}`;
const pct = (c, p) => (p === null || p === 0 || c === null) ? null : Math.round(((c - p) / Math.abs(p)) * 100);
const sum = (arr) => arr.reduce((t, v) => t + (v ?? 0), 0);

function calcStreak(weeks) {
  let s = 0;
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (weeks[i] !== null && weeks[i] > 0) s++; else break;
  }
  return s;
}

function healthScore(brand) {
  const locs = Object.keys(SWIGGY[brand]);
  let score = 0;
  locs.forEach(loc => {
    const w = SWIGGY[brand][loc];
    const w4 = w[3]; const w3 = w[2];
    if (w4 !== null && w4 > 0) score += 30;
    const ch = pct(w4, w3);
    if (ch !== null && ch > 0) score += 20;
    if (calcStreak(w) >= 3) score += 10;
  });
  return Math.min(100, Math.round(score / locs.length));
}

function getStatus(value, change) {
  if (value === null)   return { label: "No Data",       color: "#4B5563", bg: "rgba(75,85,99,0.1)"    };
  if (value < 0)        return { label: "↓ Negative",    color: "#EF4444", bg: "rgba(239,68,68,0.1)"   };
  if (change === null)  return { label: "New",            color: "#94A3B8", bg: "rgba(148,163,184,0.1)" };
  if (change >= 30)     return { label: `🔥 +${change}%`, color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  };
  if (change >= 5)      return { label: `↑ +${change}%`, color: "#10B981", bg: "rgba(16,185,129,0.1)"  };
  if (change > -5)      return { label: `→ ${change}%`,  color: "#64748B", bg: "rgba(100,116,139,0.1)" };
  return                       { label: `↓ ${change}%`,  color: "#EF4444", bg: "rgba(239,68,68,0.1)"   };
}

function buildLeaderboard() {
  const rows = [];
  for (const brand of Object.keys(SWIGGY)) {
    for (const loc of Object.keys(SWIGGY[brand])) {
      const sw = SWIGGY[brand][loc];
      rows.push({ brand, loc, w4: sw[3], w3: sw[2], change: pct(sw[3], sw[2]), trend: sw });
    }
  }
  return rows.sort((a, b) => (b.w4 ?? -Infinity) - (a.w4 ?? -Infinity));
}

// ── Sparkline ─────────────────────────────────────────────────
function Spark({ data, color, h = 44 }) {
  const pts = data.map((v, i) => ({ i, v: v ?? 0 }));
  const uid = `g${color.replace(/[^a-z0-9]/gi, "")}${Math.random().toString(36).slice(2, 6)}`;
  return (
    <ResponsiveContainer width="100%" height={h}>
      <AreaChart data={pts} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#${uid})`} dot={false} isAnimationActive={false} />
        <Tooltip
          contentStyle={{ background: "#111116", border: "1px solid #1E1E2A", borderRadius: 6, fontSize: 10, padding: "4px 8px" }}
          labelStyle={{ display: "none" }}
          formatter={(v) => [fmt(v), ""]}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── CountUp animation ─────────────────────────────────────────
function CountUp({ value, prefix = "₹" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (value == null) return;
    const target = Math.abs(value);
    const duration = 800;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * ease));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  if (value == null) return <span>—</span>;
  const s = value < 0 ? "-" : "";
  const a = display;
  let txt;
  if (a >= 100000)    txt = `${s}${prefix}${(a / 100000).toFixed(1)}L`;
  else if (a >= 1000) txt = `${s}${prefix}${(a / 1000).toFixed(0)}K`;
  else                txt = `${s}${prefix}${a}`;
  return <span>{txt}</span>;
}

// ══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════════
function Overview({ leaderboard }) {
  const totalW4 = Object.values(SWIGGY).flatMap(b => Object.values(b)).reduce((t, w) => t + (w[3] ?? 0), 0);
  const totalW3 = Object.values(SWIGGY).flatMap(b => Object.values(b)).reduce((t, w) => t + (w[2] ?? 0), 0);
  const totalChg = pct(totalW4, totalW3);
  const hot  = leaderboard.filter(r => r.change !== null && r.change >= 30).length;
  const neg  = leaderboard.filter(r => (r.w4 ?? 0) < 0).length;
  const top1 = leaderboard[0];

  const HERO = [
    {
      label: "TOTAL SWIGGY · W4",
      value: <CountUp value={totalW4} />,
      sub: totalChg !== null ? `${totalChg >= 0 ? "↑" : "↓"} ${Math.abs(totalChg)}% vs last week` : "—",
      vc: "#E2E8F0",
      sc: (totalChg ?? 0) >= 0 ? "#10B981" : "#EF4444",
      accent: "#7C3AED",
    },
    {
      label: "👑 BEST OUTLET · W4",
      value: `${top1.brand} ${top1.loc}`,
      sub: `${fmt(top1.w4)} Swiggy payout`,
      vc: BRANDS_META[top1.brand].color,
      sc: "#4B5563",
      accent: BRANDS_META[top1.brand].color,
    },
    {
      label: "🔥 ON FIRE THIS WEEK",
      value: `${hot} outlets`,
      sub: "≥ 30% growth vs last week",
      vc: "#FCD34D",
      sc: "#4B5563",
      accent: "#F59E0B",
    },
    {
      label: "⚠ NEEDS ATTENTION",
      value: `${neg} outlets`,
      sub: "Negative Swiggy payout W4",
      vc: neg > 0 ? "#EF4444" : "#10B981",
      sc: "#4B5563",
      accent: neg > 0 ? "#EF4444" : "#10B981",
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: 1080, margin: "0 auto" }}>

      {/* Hero */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
        {HERO.map((c) => (
          <div key={c.label} style={{ background: "#0E0E14", border: `1px solid ${c.accent}30`, borderTop: `2px solid ${c.accent}`, borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontSize: 9, color: "#4B5563", letterSpacing: 2.5, fontFamily: "Syne,sans-serif", fontWeight: 700, marginBottom: 12 }}>{c.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.vc, fontFamily: "Space Mono,monospace", lineHeight: 1.1 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: c.sc, marginTop: 8 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div style={{ background: "#0E0E14", border: "1px solid #1A1A24", borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1A1A24", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: 3, color: "#E2E8F0" }}>
            WEEKLY LEADERBOARD
          </span>
          <span style={{ fontSize: 10, color: "#4B5563" }}>Swiggy Net Payout · W4 (22-Feb-26)</span>
        </div>
        {leaderboard.map((row, i) => {
          const meta = BRANDS_META[row.brand];
          const st = getStatus(row.w4, row.change);
          const MEDALS = ["🥇", "🥈", "🥉"];
          return (
            <div key={`${row.brand}${row.loc}`} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 20px",
              borderBottom: "1px solid #0D0D12",
              background: i < 3 ? `${meta.color}05` : i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
              transition: "background 0.15s",
            }}>
              <div style={{ width: 30, textAlign: "center", fontSize: i < 3 ? 16 : 12, color: "#4B5563", fontWeight: 700, fontFamily: "Space Mono,monospace" }}>
                {i < 3 ? MEDALS[i] : i + 1}
              </div>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: meta.color, fontSize: 12, fontFamily: "Syne,sans-serif" }}>{row.brand}</span>
                <span style={{ color: "#64748B", fontSize: 12, marginLeft: 6 }}>{LOC_FULL[row.loc]}</span>
              </div>
              <div style={{ width: 100, height: 28 }}>
                <Spark data={row.trend} color={meta.color} h={28} />
              </div>
              <div style={{ fontFamily: "Space Mono,monospace", fontSize: 15, fontWeight: 700, color: (row.w4 ?? 0) < 0 ? "#EF4444" : "#E2E8F0", minWidth: 80, textAlign: "right" }}>
                {fmt(row.w4)}
              </div>
              <div style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, minWidth: 96, textAlign: "center" }}>
                {st.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Brand Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {Object.entries(BRANDS_META).map(([brand, meta]) => {
          const sw4  = sum(Object.values(SWIGGY[brand]).map(w => w[3]));
          const sw3  = sum(Object.values(SWIGGY[brand]).map(w => w[2]));
          const swFeb = Object.values(SWIGGY[brand]).reduce((t, w) => t + sum(w), 0);
          const zo   = sum(Object.values(ZOMATO_MO[brand]));
          const ch   = pct(sw4, sw3);
          const hs   = healthScore(brand);
          const hsColor = hs >= 70 ? "#10B981" : hs >= 40 ? "#F59E0B" : "#EF4444";
          return (
            <div key={brand} style={{ background: "#0E0E14", border: `1px solid ${meta.color}25`, borderTop: `2px solid ${meta.color}`, borderRadius: 10, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: meta.color, fontSize: 10, fontWeight: 800, letterSpacing: 3, fontFamily: "Syne,sans-serif" }}>{brand}</div>
                  <div style={{ color: "#4B5563", fontSize: 12, marginTop: 3 }}>{meta.full}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#4B5563" }}>Health</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: hsColor, fontFamily: "Space Mono,monospace" }}>{hs}</div>
                </div>
              </div>
              {/* Health bar */}
              <div style={{ height: 3, background: "#1A1A24", borderRadius: 2, margin: "12px 0" }}>
                <div style={{ height: "100%", width: `${hs}%`, background: `linear-gradient(90deg, ${hsColor}80, ${hsColor})`, borderRadius: 2, transition: "width 1s ease" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: 9, color: "#FC8019", letterSpacing: 1.5, fontFamily: "Syne,sans-serif" }}>SWIGGY W4</div>
                  <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "Space Mono,monospace", marginTop: 3, color: sw4 < 0 ? "#EF4444" : "#E2E8F0" }}>{fmt(sw4)}</div>
                  {ch !== null && <div style={{ fontSize: 10, color: ch >= 0 ? "#10B981" : "#EF4444" }}>{ch >= 0 ? "↑" : "↓"} {Math.abs(ch)}%</div>}
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "#E23744", letterSpacing: 1.5, fontFamily: "Syne,sans-serif" }}>ZOMATO FEB</div>
                  <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "Space Mono,monospace", marginTop: 3 }}>{fmt(zo)}</div>
                  <div style={{ fontSize: 10, color: "#4B5563" }}>Full month</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// BRAND VIEW
// ══════════════════════════════════════════════════════════════
function BrandView({ brand }) {
  const meta = BRANDS_META[brand];
  const sw4   = sum(Object.values(SWIGGY[brand]).map(w => w[3]));
  const sw3   = sum(Object.values(SWIGGY[brand]).map(w => w[2]));
  const swFeb = Object.values(SWIGGY[brand]).reduce((t, w) => t + sum(w), 0);
  const zoFeb = sum(Object.values(ZOMATO_MO[brand]));
  const ch    = pct(sw4, sw3);
  const hs    = healthScore(brand);
  const hsColor = hs >= 70 ? "#10B981" : hs >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ padding: "24px", maxWidth: 1080, margin: "0 auto" }}>
      {/* Brand Hero */}
      <div style={{ background: `linear-gradient(135deg, #0E0E14 0%, ${meta.color}12 100%)`, border: `1px solid ${meta.color}30`, borderRadius: 12, padding: "22px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: meta.color, letterSpacing: 4, fontFamily: "Syne,sans-serif", fontWeight: 700 }}>BRAND DEEP DIVE · FEB 2026</div>
            <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "Syne,sans-serif", color: "#E2E8F0", marginTop: 4 }}>{meta.full}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "#4B5563" }}>Health Score</div>
              <div style={{ width: 120, height: 4, background: "#1A1A24", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${hs}%`, background: hsColor, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: hsColor, fontFamily: "Space Mono,monospace" }}>{hs}/100</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "#FC8019", letterSpacing: 2, fontFamily: "Syne,sans-serif" }}>SWIGGY FEB TOTAL</div>
              <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "Space Mono,monospace", color: "#E2E8F0", marginTop: 4 }}>{fmt(swFeb)}</div>
              <div style={{ fontSize: 11, color: ch !== null ? (ch >= 0 ? "#10B981" : "#EF4444") : "#4B5563" }}>
                W4: {fmt(sw4)}{ch !== null ? ` (${ch >= 0 ? "↑" : "↓"}${Math.abs(ch)}%)` : ""}
              </div>
            </div>
            <div style={{ width: 1, background: "#1A1A24" }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "#E23744", letterSpacing: 2, fontFamily: "Syne,sans-serif" }}>ZOMATO FEB TOTAL</div>
              <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "Space Mono,monospace", color: "#E2E8F0", marginTop: 4 }}>{fmt(zoFeb)}</div>
              <div style={{ fontSize: 11, color: "#4B5563" }}>Full calendar month</div>
            </div>
            <div style={{ width: 1, background: "#1A1A24" }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: meta.color, letterSpacing: 2, fontFamily: "Syne,sans-serif" }}>COMBINED FEB</div>
              <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "Space Mono,monospace", color: meta.color, marginTop: 4 }}>{fmt(swFeb + zoFeb)}</div>
              <div style={{ fontSize: 11, color: "#4B5563" }}>Both platforms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {Object.keys(SWIGGY[brand]).map(loc => (
          <LocationCard key={loc} brand={brand} loc={loc} />
        ))}
      </div>
    </div>
  );
}

function LocationCard({ brand, loc }) {
  const meta = BRANDS_META[brand];
  const sw   = SWIGGY[brand][loc];
  const zo   = ZOMATO_WK[brand][loc];
  const zoMo = ZOMATO_MO[brand][loc];
  const w4 = sw[3], w3 = sw[2];
  const ch = pct(w4, w3);
  const st = getStatus(w4, ch);
  const streak = calcStreak(sw);

  return (
    <div style={{ background: "#0E0E14", border: "1px solid #1A1A24", borderRadius: 10, overflow: "hidden" }}>
      {/* Card Header */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #1A1A24", background: `${meta.color}06`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, color: "#4B5563", letterSpacing: 2.5, fontFamily: "Syne,sans-serif", fontWeight: 700 }}>LOCATION</div>
          <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "Syne,sans-serif", color: "#E2E8F0", marginTop: 2 }}>{LOC_FULL[loc]}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {streak >= 3 && (
            <div style={{ fontSize: 10, color: "#FCD34D", background: "rgba(252,211,77,0.1)", border: "1px solid rgba(252,211,77,0.2)", padding: "3px 8px", borderRadius: 20 }}>
              🔥 {streak}-week streak
            </div>
          )}
          <div style={{ background: st.bg, color: st.color, padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, border: `1px solid ${st.color}30` }}>
            {st.label}
          </div>
        </div>
      </div>

      {/* Platform Data */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {/* Swiggy */}
        <div style={{ padding: "14px 18px", borderRight: "1px solid #1A1A24" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 9, color: "#FC8019", fontWeight: 700, letterSpacing: 2, fontFamily: "Syne,sans-serif" }}>SWIGGY</div>
            <div style={{ fontSize: 9, color: "#4B5563" }}>W1→W4</div>
          </div>
          <div style={{ fontFamily: "Space Mono,monospace", fontSize: 22, fontWeight: 700, color: (w4 ?? 0) < 0 ? "#EF4444" : "#E2E8F0", lineHeight: 1 }}>{fmt(w4)}</div>
          <div style={{ fontSize: 10, color: "#4B5563", marginTop: 3 }}>W4 · 22-Feb</div>
          <div style={{ marginTop: 10 }}>
            <Spark data={sw} color={(w4 !== null && w4 >= 0) ? "#FC8019" : "#EF4444"} h={44} />
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
            {sw.map((v, i) => (
              <div key={i} style={{
                fontSize: 9, padding: "2px 7px", borderRadius: 4, fontFamily: "Space Mono,monospace",
                background: v === null ? "#111116" : v >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                color:      v === null ? "#4B5563"  : v >= 0 ? "#10B981"              : "#EF4444",
              }}>
                W{i+1} {v !== null ? fmt(v) : "—"}
              </div>
            ))}
          </div>
        </div>

        {/* Zomato */}
        <div style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 9, color: "#E23744", fontWeight: 700, letterSpacing: 2, fontFamily: "Syne,sans-serif" }}>ZOMATO</div>
            <div style={{ fontSize: 9, color: "#4B5563" }}>W1→W3</div>
          </div>
          <div style={{ fontFamily: "Space Mono,monospace", fontSize: 22, fontWeight: 700, color: "#E2E8F0", lineHeight: 1 }}>{fmt(zoMo)}</div>
          <div style={{ fontSize: 10, color: "#4B5563", marginTop: 3 }}>Full Feb (monthly)</div>
          <div style={{ marginTop: 10 }}>
            <Spark data={zo} color="#E23744" h={44} />
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
            {zo.slice(0, 3).map((v, i) => (
              <div key={i} style={{
                fontSize: 9, padding: "2px 7px", borderRadius: 4, fontFamily: "Space Mono,monospace",
                background: v === null || v === 0 ? "#111116" : "rgba(226,55,68,0.12)",
                color:      v === null || v === 0 ? "#4B5563" : "#E23744",
              }}>
                W{i+1} {v !== null ? fmt(v) : "—"}
              </div>
            ))}
            <div style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, fontFamily: "Space Mono,monospace", background: "rgba(226,55,68,0.2)", color: "#E23744", fontWeight: 700 }}>
              MO {fmt(zoMo)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("overview");
  const leaderboard = buildLeaderboard();

  const TABS = [
    { id: "overview", label: "◈ Overview",             color: "#7C3AED" },
    { id: "TOP",      label: "TOP · Taste of Protein", color: BRANDS_META.TOP.color },
    { id: "FB",       label: "FB · FytBlend",           color: BRANDS_META.FB.color  },
    { id: "FI",       label: "FI · Foldit",             color: BRANDS_META.FI.color  },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#07070A", color: "#E2E8F0", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Space+Mono:wght@700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0E0E14; }
        ::-webkit-scrollbar-thumb { background: #2A2A38; border-radius: 2px; }
        body { background: #07070A; }
      `}</style>

      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(7,7,10,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1A1A24" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg, #7C3AED, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚡</div>
            <div>
              <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: 3, color: "#E2E8F0" }}>RETHINK PULSE</div>
              <div style={{ fontSize: 9, color: "#4B5563", letterSpacing: 2.5, marginTop: 1 }}>PAYOUT INTELLIGENCE · FEB 2026</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 10, color: "#4B5563", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
              Data as of 04 Mar 2026
            </div>
            <div style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, border: "1px solid rgba(16,185,129,0.25)", letterSpacing: 1 }}>
              W4 LIVE
            </div>
          </div>
        </div>

        {/* NAV */}
        <div style={{ display: "flex", padding: "0 16px", overflowX: "auto", borderTop: "1px solid #111116" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none", padding: "10px 18px", cursor: "pointer",
              fontSize: 10, fontWeight: 700, fontFamily: "Syne,sans-serif", letterSpacing: 1.5,
              color: tab === t.id ? t.color : "#4B5563",
              borderBottom: `2px solid ${tab === t.id ? t.color : "transparent"}`,
              whiteSpace: "nowrap", transition: "color 0.15s, border-color 0.15s",
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* PAGE */}
      {tab === "overview"
        ? <Overview leaderboard={leaderboard} />
        : <BrandView brand={tab} />
      }

      <div style={{ textAlign: "center", padding: "32px 24px 24px", fontSize: 9, color: "#1E1E28", letterSpacing: 2, borderTop: "1px solid #111116", marginTop: 32 }}>
        RETHINK FUTURE PVT LTD · CONFIDENTIAL · INTERNAL USE ONLY
      </div>
    </div>
  );
}
