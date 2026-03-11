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
                      <div style={{fontFamily:"Space Mono,monospace",fontSize:12,fontWeight:700,colo
