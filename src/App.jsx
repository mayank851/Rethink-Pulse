import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { TARGETS, BRANDS_META, LOCS, SWIGGY_WEEKS, ZOMATO_WEEKS, ZOMATO_MONTHLY } from "./data.js";

const WEEKS = ["01-Feb", "08-Feb", "15-Feb", "22-Feb"];

function kpis(d) {
  if (!d || d.ns <= 0) return null;
  return {
    commission_pct: d.gmv > 0  ? +(d.comm / d.gmv * 100).toFixed(1) : 0,
    discount_pct:   d.gmv > 0  ? +(d.disc / d.gmv * 100).toFixed(1) : 0,
    ads_pct:        d.ns  > 0  ? +(d.ads  / d.ns  * 100).toFixed(1) : 0,
    net_margin:     d.ns  > 0  ? +(d.np   / d.ns  * 100).toFixed(1) : 0,
    aov:            d.orders>0 ? +(d.ns   / d.orders).toFixed(0)     : 0,
    np:d.np, ns:d.ns, gmv:d.gmv, orders:d.orders,
  };
}
function hitTarget(k, val) {
  if (val == null) return null;
  const t = TARGETS[k]; if (!t) return null;
  return t.min !== undefined ? val >= t.min : val <= t.max;
}
function healthPct(k) {
  if (!k || k.ns <= 0) return null;
  const keys = ["commission_pct","discount_pct","ads_pct","net_margin"];
  let hits = 0, total = 0;
  for (const key of keys) {
    if (k[key] != null) { total++; if (hitTarget(key, k[key])) hits++; }
  }
  return total === 0 ? null : Math.round((hits/total)*100);
}
function byOutlet(data, brand, loc) { return data.filter(r => r.brand===brand && r.loc===loc); }
function pctChg(c,p) { return (p==null||p===0||c==null)?null:Math.round(((c-p)/Math.abs(p))*100); }
const fmt = n => { if(n==null)return"—";const s=n<0?"-":"";const a=Math.abs(n);if(a>=100000)return`${s}₹${(a/100000).toFixed(1)}L`;if(a>=1000)return`${s}₹${(a/1000).toFixed(0)}K`;return`${s}₹${a.toFixed(0)}`; };

function buildLeaderboard() {
  const out = [];
  for (const brand of Object.keys(BRANDS_META)) {
    for (const loc of Object.keys(LOCS)) {
      const rows = byOutlet(SWIGGY_WEEKS, brand, loc).filter(r => r.ns > 0);
      if (!rows.length) continue;
      const lw = rows[rows.length - 1];
      const k  = kpis(lw);
      out.push({ brand, loc, kpis:k, hs:healthPct(k), week:lw.week,
        trend: WEEKS.map(w => { const r=byOutlet(SWIGGY_WEEKS,brand,loc).find(x=>x.week===w); return r?.ns>0?+(r.np/r.ns*100).toFixed(1):0; })
      });
    }
  }
  return out.sort((a,b)=>(b.kpis?.net_margin??-999)-(a.kpis?.net_margin??-999));
}

function Spark({ data, color, h=44 }) {
  const pts = data.map((v,i)=>({i,v:v??0}));
  const id  = `sp${Math.random().toString(36).slice(2,7)}`;
  return (
    <ResponsiveContainer width="100%" height={h}>
      <AreaChart data={pts} margin={{top:2,right:0,left:0,bottom:2}}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.45}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} dot={false} isAnimationActive={false}/>
        <Tooltip contentStyle={{background:"#111116",border:"1px solid #1E1E2A",borderRadius:6,fontSize:10,padding:"4px 8px"}} labelStyle={{display:"none"}} formatter={v=>[`${(+v).toFixed(1)}%`,""]}/> 
      </AreaChart>
    </ResponsiveContainer>
  );
}

function KPIBox({ label, val, hitKey }) {
  const hit = hitKey ? hitTarget(hitKey, val) : null;
  const col = hit===null?"#64748B":hit?"#10B981":"#EF4444";
  return (
    <div style={{background:hit===null?"rgba(100,116,139,0.07)":hit?"rgba(16,185,129,0.07)":"rgba(239,68,68,0.07)",borderRadius:7,padding:"8px 6px",textAlign:"center",border:`1px solid ${col}20`}}>
      <div style={{fontSize:8,color:"#4B5563",marginBottom:4,letterSpacing:1}}>{label}</div>
      <div style={{fontFamily:"Space Mono,monospace",fontSize:13,fontWeight:700,color:col}}>{val!=null?val:"—"}</div>
      {hit!==null&&<div style={{fontSize:11,marginTop:2}}>{hit?"✅":"❌"}</div>}
    </div>
  );
}

function Overview({ lb }) {
  const w4 = SWIGGY_WEEKS.filter(r=>r.week==="22-Feb"&&r.ns>0);
  const agg={np:0,ns:0,gmv:0,comm:0,disc:0,ads:0,orders:0};
  w4.forEach(r=>{agg.np+=r.np;agg.ns+=r.ns;agg.gmv+=r.gmv;agg.comm+=r.comm;agg.disc+=r.disc;agg.ads+=r.ads;agg.orders+=r.orders;});
  const totK = kpis(agg);
  const w3 = SWIGGY_WEEKS.filter(r=>r.week==="15-Feb"&&r.ns>0);
  const agg3={np:0,ns:0}; w3.forEach(r=>{agg3.np+=r.np;agg3.ns+=r.ns;});
  const prev_nm = agg3.ns>0?+(agg3.np/agg3.ns*100).toFixed(1):null;
  const chg = pctChg(totK?.net_margin, prev_nm);
  const fire = lb.filter(r=>r.kpis?.net_margin>=60).length;
  const neg  = lb.filter(r=>r.kpis?.net_margin!=null&&r.kpis.net_margin<0).length;
  const top1 = lb[0];
  const HERO=[
    {label:"FLEET NET PAYOUT % · W4", value:`${totK?.net_margin??0}%`, sub:chg!=null?`${chg>=0?"↑":"↓"} ${Math.abs(chg)}pp vs W3`:"—", vc:totK?.net_margin>=60?"#10B981":"#EF4444", accent:"#7C3AED"},
    {label:"👑 BEST NET PAYOUT % · W4", value:`${top1?.brand} ${top1?.loc}`, sub:`${top1?.kpis?.net_margin}% net payout`, vc:BRANDS_META[top1?.brand]?.color, accent:BRANDS_META[top1?.brand]?.color},
    {label:"✅ HITTING ≥60% TARGET", value:`${fire} outlets`, sub:"Swiggy Net Payout W4", vc:"#10B981", accent:"#10B981"},
    {label:"⚠ NEGATIVE NET PAYOUT", value:`${neg} outlets`, sub:"Swiggy W4 · need urgent review", vc:neg>0?"#EF4444":"#10B981", accent:neg>0?"#EF4444":"#10B981"},
  ];
  let n=0,cm=0,di=0,ad=0,nm=0;
  w4.forEach(r=>{const k=kpis(r);if(k){cm+=k.commission_pct;di+=k.discount_pct;ad+=k.ads_pct;nm+=k.net_margin;n++;}});
  const fl={cm:+(cm/n).toFixed(1),di:+(di/n).toFixed(1),ad:+(ad/n).toFixed(1),nm:+(nm/n).toFixed(1)};
  return (
    <div style={{padding:"24px",maxWidth:1120,margin:"0 auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {HERO.map(c=>(
          <div key={c.label} style={{background:"#0E0E14",border:`1px solid ${c.accent}30`,borderTop:`2px solid ${c.accent}`,borderRadius:10,padding:"16px 20px"}}>
            <div style={{fontSize:9,color:"#4B5563",letterSpacing:2.5,fontFamily:"Syne,sans-serif",fontWeight:700,marginBottom:10}}>{c.label}</div>
            <div style={{fontSize:24,fontWeight:700,color:c.vc,fontFamily:"Space Mono,monospace",lineHeight:1.1}}>{c.value}</div>
            <div style={{fontSize:11,color:"#4B5563",marginTop:8}}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#0E0E14",border:"1px solid #1A1A24",borderRadius:10,padding:"18px 24px",marginBottom:24}}>
        <div style={{fontSize:9,color:"#E2E8F0",letterSpacing:3,fontFamily:"Syne,sans-serif",fontWeight:700,marginBottom:18}}>FLEET-WIDE AVERAGE · SWIGGY W4 · ALL OUTLETS</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24}}>
          {[
            {key:"net_margin",     label:"Net Payout %", val:fl.nm, target:"≥ 60%", barMax:100},
            {key:"commission_pct", label:"Commission %",  val:fl.cm, target:"≤ 30%", barMax:50},
            {key:"discount_pct",   label:"Discount %",    val:fl.di, target:"≤ 30%", barMax:50},
            {key:"ads_pct",        label:"Ads Spend %",   val:fl.ad, target:"≤ 10%", barMax:25},
          ].map(({key,label,val,target,barMax})=>{
            const hit=hitTarget(key,val);
            const col=hit?"#10B981":"#EF4444";
            return (
              <div key={key}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:9,color:"#94A3B8",fontFamily:"Syne,sans-serif",letterSpacing:1.5,fontWeight:700}}>{label}</span>
                  <span style={{fontSize:9,color:"#4B5563"}}>Target {target}</span>
                </div>
                <div style={{fontFamily:"Space Mono,monospace",fontSize:30,fontWeight:800,color:col,lineHeight:1}}>{val}%</div>
                <div style={{height:3,background:"#1A1A24",borderRadius:2,marginTop:10}}>
                  <div style={{height:"100%",width:`${Math.min(100,(val/barMax)*100)}%`,background:col,borderRadius:2,transition:"width 1s ease"}}/>
                </div>
                <div style={{fontSize:9,color:col,marginTop:5}}>{hit?"✅ On target":"❌ Off target"}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{background:"#0E0E14",border:"1px solid #1A1A24",borderRadius:10,overflow:"hidden",marginBottom:24}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #1A1A24",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:10,letterSpacing:3}}>WEEKLY LEADERBOARD</span>
            <span style={{fontSize:9,color:"#4B5563",marginLeft:12}}>Ranked by Net Payout % · Swiggy W4</span>
          </div>
          <span style={{fontSize:9,color:"#4B5563"}}>HS = Health Score (targets hit/4)</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"40px 1fr 95px 95px 95px 95px 90px 24px",gap:0,padding:"7px 20px",background:"#0A0A10",borderBottom:"1px solid #111116"}}>
          {["#","OUTLET","NET PAY %","COMM %","DISC %","ADS %","TREND","HS"].map((h,i)=>(
            <div key={i} style={{fontSize:8,color:"#4B5563",letterSpacing:1.5,textAlign:i<=1?"left":"right"}}>{h}</div>
          ))}
        </div>
        {lb.map((row,i)=>{
          const meta=BRANDS_META[row.brand]; const k=row.kpis;
          const hsC=row.hs>=75?"#10B981":row.hs>=50?"#F59E0B":"#EF4444";
          const MEDALS=["🥇","🥈","🥉"];
          const Cell=({hitKey,val})=>{
            const hit=hitTarget(hitKey,val);
            const col=hit===null?"#64748B":hit?"#10B981":"#EF4444";
            return <div style={{textAlign:"right",fontFamily:"Space Mono,monospace",fontSize:12,fontWeight:700,color:col}}>{val!=null?`${val}%`:"—"}</div>;
          };
          return (
            <div key={`${row.brand}${row.loc}`} style={{display:"grid",gridTemplateColumns:"40px 1fr 95px 95px 95px 95px 90px 24px",alignItems:"center",padding:"9px 20px",borderBottom:"1px solid #0D0D12",background:i<3?`${meta.color}05`:i%2===0?"rgba(255,255,255,0.01)":"transparent"}}>
              <div style={{textAlign:"center",fontSize:i<3?15:11,color:"#4B5563",fontFamily:"Space Mono,monospace"}}>{i<3?MEDALS[i]:i+1}</div>
              <div>
                <span style={{fontWeight:700,color:meta.color,fontSize:12,fontFamily:"Syne,sans-serif"}}>{row.brand}</span>
                <span style={{color:"#64748B",fontSize:11,marginLeft:6}}>{LOCS[row.loc]}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <span style={{fontFamily:"Space Mono,monospace",fontSize:14,fontWeight:800,color:hitTarget("net_margin",k?.net_margin)?"#10B981":"#EF4444"}}>{k?.net_margin!=null?`${k.net_margin}%`:"—"}</span>
              </div>
              <Cell hitKey="commission_pct" val={k?.commission_pct}/>
              <Cell hitKey="discount_pct"   val={k?.discount_pct}/>
              <Cell hitKey="ads_pct"        val={k?.ads_pct}/>
              <div style={{height:26}}><Spark data={row.trend} color={meta.color} h={26}/></div>
              <div style={{textAlign:"right",fontFamily:"Space Mono,monospace",fontSize:11,fontWeight:700,color:hsC}}>{row.hs??""}</div>
            </div>
          );
        })}
        <div style={{padding:"9px 20px",borderTop:"1px solid #111116",display:"flex",gap:20,flexWrap:"wrap"}}>
          <span style={{fontSize:9,color:"#10B981"}}>✅ = hitting target</span>
          <span style={{fontSize:9,color:"#EF4444"}}>❌ = off target</span>
          <span style={{fontSize:9,color:"#4B5563"}}>Targets: Net Pay ≥60% · Commission ≤30% · Discount ≤30% · Ads ≤10%</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {Object.entries(BRANDS_META).map(([brand,meta])=>{
          const rows=SWIGGY_WEEKS.filter(r=>r.brand===brand&&r.week==="22-Feb"&&r.ns>0);
          const a={np:0,ns:0,gmv:0,comm:0,disc:0,ads:0,orders:0};
          rows.forEach(r=>{a.np+=r.np;a.ns+=r.ns;a.gmv+=r.gmv;a.comm+=r.comm;a.disc+=r.disc;a.ads+=r.ads;a.orders+=r.orders;});
          const bk=kpis(a); const hs=healthPct(bk);
          const hsC=hs>=75?"#10B981":hs>=50?"#F59E0B":"#EF4444";
          const zoMo=ZOMATO_MONTHLY.filter(r=>r.brand===brand).reduce((t,r)=>t+r.np,0);
          return (
            <div key={brand} style={{background:"#0E0E14",border:`1px solid ${meta.color}20`,borderTop:`2px solid ${meta.color}`,borderRadius:10,padding:"18px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div>
                  <div style={{color:meta.color,fontSize:11,fontWeight:800,letterSpacing:3,fontFamily:"Syne,sans-serif"}}>{brand}</div>
                  <div style={{color:"#4B5563",fontSize:11,marginTop:2}}>{meta.full}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:8,color:"#4B5563"}}>Health Score</div>
                  <div style={{fontSize:20,fontWeight:800,color:hsC,fontFamily:"Space Mono,monospace"}}>{hs??0}<span style={{fontSize:10}}>/100</span></div>
                </div>
              </div>
              <div style={{height:3,background:"#1A1A24",borderRadius:2,marginBottom:14}}>
                <div style={{height:"100%",width:`${hs??0}%`,background:hsC,borderRadius:2}}/>
              </div>
              {bk&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12}}>
                  {[["net_margin","Net Pay"],["commission_pct","Comm"],["discount_pct","Disc"],["ads_pct","Ads"]].map(([key,lbl])=>{
                    const hit=hitTarget(key,bk[key]);
                    const col=hit?"#10B981":"#EF4444";
                    return <div key={key} style={{background:hit?"rgba(16,185,129,0.07)":"rgba(239,68,68,0.07)",border:`1px solid ${col}15`,borderRadius:6,padding:"6px 4px",textAlign:"center"}}>
                      <div style={{fontSize:8,color:"#4B5563",marginBottom:3}}>{lbl}</div>
                      <div style={{fontFamily:"Space Mono,monospace",fontSize:12,fontWeight:700,color:col}}>{bk[key]}%</div>
                    </div>;
                  })}
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:"1px solid #111116"}}>
                <div><div style={{fontSize:8,color:"#FC8019",letterSpacing:1.5}}>SWIGGY W4</div><div style={{fontFamily:"Space Mono,monospace",fontSize:16,fontWeight:700,color:a.np<0?"#EF4444":"#E2E8F0",marginTop:2}}>{fmt(a.np)}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:8,color:"#E23744",letterSpacing:1.5}}>ZOMATO FEB</div><div style={{fontFamily:"Space Mono,monospace",fontSize:16,fontWeight:700,marginTop:2}}>{fmt(zoMo)}</div></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BrandView({ brand }) {
  const meta = BRANDS_META[brand];
  return (
    <div style={{padding:"24px",maxWidth:1120,margin:"0 auto"}}>
      <div style={{background:`linear-gradient(135deg,#0E0E14 0%,${meta.color}10 100%)`,border:`1px solid ${meta.color}25`,borderRadius:12,padding:"20px 28px",marginBottom:24}}>
        <div style={{fontSize:10,color:meta.color,letterSpacing:4,fontFamily:"Syne,sans-serif",fontWeight:700}}>BRAND DEEP DIVE · FEB 2026</div>
        <div style={{fontSize:28,fontWeight:800,fontFamily:"Syne,sans-serif",marginTop:4,marginBottom:16}}>{meta.full}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {WEEKS.map(wk=>{
            const rows=SWIGGY_WEEKS.filter(r=>r.brand===brand&&r.week===wk&&r.ns>0);
            const a={np:0,ns:0,gmv:0,comm:0,disc:0,ads:0,orders:0};
            rows.forEach(r=>{a.np+=r.np;a.ns+=r.ns;a.gmv+=r.gmv;a.comm+=r.comm;a.disc+=r.disc;a.ads+=r.ads;a.orders+=r.orders;});
            const k=kpis(a); const hs=healthPct(k);
            const hsC=hs>=75?"#10B981":hs>=50?"#F59E0B":"#EF4444";
            return (
              <div key={wk} style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"12px 14px",border:`1px solid ${meta.color}15`,borderLeft:`3px solid ${wk==="22-Feb"?meta.color:`${meta.color}40`}`}}>
                <div style={{fontSize:8,color:"#4B5563",marginBottom:6}}>{wk}</div>
                <div style={{fontFamily:"Space Mono,monospace",fontSize:20,fontWeight:800,color:k?.net_margin>=60?"#10B981":k?.net_margin<0?"#EF4444":"#F59E0B"}}>{k?`${k.net_margin}%`:"—"}</div>
                <div style={{fontSize:9,color:"#4B5563",marginTop:2}}>Net Pay · {fmt(a.np)}</div>
                {k&&<div style={{fontSize:9,color:hsC,marginTop:4}}>HS {hs}/100</div>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
        {Object.keys(LOCS).map(loc=><LocationCard key={loc} brand={brand} loc={loc}/>)}
      </div>
    </div>
  );
}

function LocationCard({ brand, loc }) {
  const meta=BRANDS_META[brand];
  const swRows=byOutlet(SWIGGY_WEEKS,brand,loc);
  const zoMo=ZOMATO_MONTHLY.find(r=>r.brand===brand&&r.loc===loc);
  const latest=[...swRows].filter(r=>r.ns>0).pop();
  const latK=kpis(latest);
  const hs=healthPct(latK);
  const hsC=hs>=75?"#10B981":hs>=50?"#F59E0B":"#EF4444";
  const prev=[...swRows].filter(r=>r.ns>0).slice(-2,-1)[0];
  const chg=latest&&prev?pctChg(latK?.net_margin,kpis(prev)?.net_margin):null;
  const trend=WEEKS.map(w=>{const r=swRows.find(x=>x.week===w);return r?.ns>0?+(r.np/r.ns*100).toFixed(1):0;});
  const zoK=kpis(zoMo);
  return (
    <div style={{background:"#0E0E14",border:"1px solid #1A1A24",borderRadius:10,overflow:"hidden"}}>
      <div style={{padding:"13px 18px",borderBottom:"1px solid #1A1A24",background:`${meta.color}06`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:8,color:"#4B5563",letterSpacing:2,fontFamily:"Syne,sans-serif",fontWeight:700}}>LOCATION</div>
          <div style={{fontSize:17,fontWeight:800,fontFamily:"Syne,sans-serif",color:"#E2E8F0",marginTop:2}}>{LOCS[loc]}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {chg!==null&&<div style={{fontSize:10,color:chg>=0?"#10B981":"#EF4444",background:chg>=0?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",padding:"3px 8px",borderRadius:20}}>{chg>=0?"↑":"↓"} {Math.abs(chg)}pp WoW</div>}
          {hs!==null&&<div style={{fontSize:10,color:hsC,background:`${hsC}15`,padding:"3px 9px",borderRadius:20,fontFamily:"Space Mono,monospace",fontWeight:700}}>HS {hs}/100</div>}
        </div>
      </div>
      <div style={{padding:"14px 18px"}}>
        <div style={{fontSize:8,color:"#FC8019",letterSpacing:2,fontFamily:"Syne,sans-serif",fontWeight:700,marginBottom:10}}>SWIGGY W4 · 5 KPIs vs TARGET</div>
        {latK ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:14}}>
            <KPIBox label="Net Pay%" val={`${latK.net_margin}%`} hitKey="net_margin"/>
            <KPIBox label="Comm%"    val={`${latK.commission_pct}%`} hitKey="commission_pct"/>
            <KPIBox label="Disc%"    val={`${latK.discount_pct}%`} hitKey="discount_pct"/>
            <KPIBox label="Ads%"     val={`${latK.ads_pct}%`} hitKey="ads_pct"/>
            <KPIBox label="AOV"      val={`₹${latK.aov}`} hitKey={null}/>
          </div>
        ) : <div style={{color:"#4B5563",fontSize:11,marginBottom:14}}>No Swiggy W4 data</div>}
        <div style={{fontSize:8,color:"#4B5563",letterSpacing:1.5,marginBottom:4}}>NET PAYOUT % TREND · SWIGGY W1→W4</div>
        <Spark data={trend} color="#FC8019" h={44}/>
        <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
          {WEEKS.map((w,i)=>{
            const r=swRows.find(x=>x.week===w); const k2=kpis(r);
            return <div key={w} style={{fontSize:9,padding:"2px 7px",borderRadius:4,fontFamily:"Space Mono,monospace",background:!k2?"#111116":k2.net_margin>=60?"rgba(16,185,129,0.12)":k2.net_margin<0?"rgba(239,68,68,0.12)":"rgba(245,158,11,0.12)",color:!k2?"#4B5563":k2.net_margin>=60?"#10B981":k2.net_margin<0?"#EF4444":"#F59E0B"}}>W{i+1} {k2?`${k2.net_margin}%`:"—"}</div>;
          })}
        </div>
        <div style={{borderTop:"1px solid #111116",marginTop:14,paddingTop:14}}>
          <div style={{fontSize:8,color:"#E23744",letterSpacing:2,fontFamily:"Syne,sans-serif",fontWeight:700,marginBottom:10}}>ZOMATO FEB 2026 · MONTHLY SETTLEMENT · 5 KPIs</div>
          {zoK ? (
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
              <KPIBox label="Net Pay%" val={`${zoK.net_margin}%`} hitKey="net_margin"/>
              <KPIBox label="Comm%"    val={`${zoK.commission_pct}%`} hitKey="commission_pct"/>
              <KPIBox label="Disc%"    val={`${zoK.discount_pct}%`} hitKey="discount_pct"/>
              <KPIBox label="Ads%"     val={`${zoK.ads_pct}%`} hitKey="ads_pct"/>
              <KPIBox label="AOV"      val={`₹${zoK.aov}`} hitKey={null}/>
            </div>
          ) : <div style={{color:"#4B5563",fontSize:11}}>No Zomato data</div>}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("overview");
  const lb = buildLeaderboard();
  const TABS=[
    {id:"overview",label:"◈ Overview",color:"#7C3AED"},
    {id:"TOP",label:"TOP · Taste of Protein",color:BRANDS_META.TOP.color},
    {id:"FB",label:"FB · FytBlend",color:BRANDS_META.FB.color},
    {id:"FI",label:"FI · Foldit",color:BRANDS_META.FI.color},
  ];
  return (
    <div style={{minHeight:"100vh",background:"#07070A",color:"#E2E8F0",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Space+Mono:wght@700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0E0E14}
        ::-webkit-scrollbar-thumb{background:#2A2A38;border-radius:2px}
      `}</style>
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(7,7,10,0.96)",backdropFilter:"blur(12px)",borderBottom:"1px solid #1A1A24"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,#7C3AED,#4F46E5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚡</div>
            <div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:13,letterSpacing:3}}>RETHINK PULSE</div>
              <div style={{fontSize:9,color:"#4B5563",letterSpacing:2.5,marginTop:1}}>PAYOUT INTELLIGENCE · FEB 2026</div>
            </div>
          </div>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <div style={{display:"flex",gap:10,fontSize:9,color:"#4B5563"}}>
              <span>Net Pay <span style={{color:"#818CF8"}}>≥60%</span></span>
              <span>·</span><span>Comm <span style={{color:"#FCD34D"}}>≤30%</span></span>
              <span>·</span><span>Disc <span style={{color:"#FB923C"}}>≤30%</span></span>
              <span>·</span><span>Ads <span style={{color:"#F472B6"}}>≤10%</span></span>
            </div>
            <div style={{background:"rgba(16,185,129,0.12)",color:"#10B981",padding:"4px 12px",borderRadius:20,fontSize:10,fontWeight:700,border:"1px solid rgba(16,185,129,0.25)"}}>W4 LIVE</div>
          </div>
        </div>
        <div style={{display:"flex",padding:"0 16px",overflowX:"auto",borderTop:"1px solid #111116"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",padding:"10px 18px",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"Syne,sans-serif",letterSpacing:1.5,color:tab===t.id?t.color:"#4B5563",borderBottom:`2px solid ${tab===t.id?t.color:"transparent"}`,whiteSpace:"nowrap",transition:"color 0.15s,border-color 0.15s"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {tab==="overview"?<Overview lb={lb}/>:<BrandView brand={tab}/>}
      <div style={{textAlign:"center",padding:"28px 24px 20px",fontSize:9,color:"#1A1A24",letterSpacing:2,borderTop:"1px solid #111116",marginTop:32}}>
        RETHINK FUTURE PVT LTD · CONFIDENTIAL · INTERNAL USE ONLY
      </div>
    </div>
  );
}
