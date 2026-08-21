/* ===== TAGEBUCH · MIKRONÄHRSTOFFE (Ralph 25.07.) =====
   Kacheln je Nährstoff für den gewählten Tag: gegessen/Tagesbedarf; Farbe 0%=blau, 1-99%=orange, >=100%=grün.
   ★ = laut DGE für DIESES Profil (Alter/Geschlecht/Ernaehrungsform) besonders wichtig. Selen: nur Empfehlung.
   Ist-Werte: cb_tagebuch_mikro (BLS 4.0, read-only). Soll: EU-Referenzwerte (VO 1169/2011 Anh. XIII). */
const MIKRO_REF = {
  "Vitamin A":[800,"µg","vit"], "Vitamin D":[5,"µg","vit"], "Vitamin E":[12,"mg","vit"],
  "Vitamin K":[75,"µg","vit"], "Vitamin C":[80,"mg","vit"], "Vitamin B1":[1.1,"mg","vit"],
  "Vitamin B2":[1.4,"mg","vit"], "Niacin":[16,"mg","vit"], "Vitamin B6":[1400,"µg","vit"],
  "Folat":[200,"µg","vit"], "Vitamin B12":[2.5,"µg","vit"], "Biotin":[50,"µg","vit"],
  "Pantothensäure":[6,"mg","vit"],
  "Kalium":[2000,"mg","min"], "Chlorid":[800,"mg","min"], "Calcium":[800,"mg","min"],
  "Phosphor":[700,"mg","min"], "Magnesium":[375,"mg","min"], "Eisen":[14,"mg","min"],
  "Zink":[10,"mg","min"], "Kupfer":[1000,"µg","min"], "Mangan":[2000,"µg","min"],
  "Jod":[150,"µg","min"], "Molybdän":[50,"µg","min"], "Chrom":[40,"µg","min"],
  "Selen":[55,"µg","min"],
  "Omega-3 (EPA+DHA)":[250,"mg","omega"],
  /* 28z (Ralph): Wirkstoffe sichtbar, aber GEKENNZEICHNET - "manche menschen wollen es sehen,
     auch wenn es keinen wissenschaftlichen hinweis gibt, wir sollten sie nur entsprechend
     kennzeichnen". Kreatin: 3 g/Tag = Schwelle des zugelassenen EU-Claims VO 432/2012
     (Schnellkraft), KEIN Tagesbedarf; DB-Beleg im Bezugswert-Stamm. */
  "Kreatin":[3000,"mg","wirk"]
};
const MIKRO_ORDER = Object.keys(MIKRO_REF);
function mikroKrit(pf){
  const s=new Set(["Vitamin D","Jod"]);
  const alter=Number(pf&&pf.Alter)||0;
  const w=(pf&&pf.Geschlecht)==="weiblich";
  const ern=(pf&&pf.Ernaehrungsform)||"";
  if(w && alter>=12 && alter<=50){ s.add("Folat"); s.add("Eisen"); }
  if(alter>=65){ s.add("Calcium"); s.add("Vitamin B12"); }
  if(ern==="Vegan"){ ["Vitamin B12","Eisen","Zink","Calcium","Jod","Selen","Vitamin B2"].forEach(function(x){s.add(x);}); }
  else if(ern==="Vegetarisch"){ ["Vitamin B12","Eisen","Zink"].forEach(function(x){s.add(x);}); }
  return s;
}
function _mkNum(x){ x=Number(x)||0; if(x>=100) return Math.round(x); if(x>=10) return Math.round(x*10)/10; return Math.round(x*100)/100; }
function _mkDe(x){ return String(x).replace(".",","); }
function openTbMikro(){
  closeTbMikro();
  const sb=document.getElementById("tbStatBox"); if(sb) sb.style.display="none";
  const ov=document.createElement("div"); ov.id="tbMikroOverlay";
  ov.style.cssText="position:fixed;inset:0;background:rgba(15,30,35,.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:32px 12px;overflow:auto";
  ov.onclick=function(e){ if(e.target.id==="tbMikroOverlay") closeTbMikro(); };
  ov.innerHTML='<div style="--tb-card:var(--k-ffffff);--tb-card2:var(--k-e7eef8);--tb-line:var(--k-d8e2f0);--tb-text:var(--k-15304f);--tb-muted:var(--k-5b6b7e);--tb-track:var(--k-dbe6f4);background:var(--tb-card);color:var(--tb-text);border-radius:16px;max-width:560px;width:100%;padding:14px 18px 20px;position:relative;box-shadow:0 24px 60px rgba(0,0,0,.45)">'
    +'<div style="display:flex;justify-content:flex-end;margin:-2px -6px 2px 0"><button onclick="closeTbMikro()" aria-label="Schlie\u00dfen" style="border:0;background:var(--tb-track,#ece7db);border-radius:9px;width:32px;height:32px;font-size:15px;cursor:pointer;color:var(--tb-text)">\u2715</button></div>'
    +'<div id="tbMikroBody"></div></div>';
  document.body.appendChild(ov);
  document.addEventListener("keydown", _tbMikroEsc);
  loadTbMikro();
}
function closeTbMikro(){ const ov=document.getElementById("tbMikroOverlay"); if(ov) ov.remove(); document.removeEventListener("keydown", _tbMikroEsc); }
function _tbMikroEsc(e){ if(e.key==="Escape") closeTbMikro(); }
async function loadTbMikro(){
  const box=document.getElementById("tbMikroBody"); if(!box) return;
  box.innerHTML='<div style="color:var(--tb-muted);font-size:13px">Lade Nährstoffe…</div>';
  const datum=(document.getElementById("tbDatum")||{}).value || tbToday();
  const {data,error}=await client.rpc("cb_tagebuch_mikro",{p_datum:datum,p_benutzer:null});
  if(error){ box.innerHTML='<div style="color:var(--tb-muted);font-size:13px">Nährstoffe konnten nicht geladen werden.</div>'; return; }
  let pf={}; try{ const r=await client.rpc("cb_profil"); pf=(r.data&&r.data[0])||{}; }catch(e){}
  renderTbMikro(data||[], pf, datum);
}
function renderTbMikro(rows, pf, datum){
  const box=document.getElementById("tbMikroBody"); if(!box) return;
  var _dl=datum||""; try{ var _dd=new Date((datum||"")+"T00:00:00"); _dl=_dd.toLocaleDateString("de-DE",{weekday:"short",day:"numeric",month:"long"}); }catch(e){}
  const map={}; let nProd=0;
  (rows||[]).forEach(function(r){ map[r.naehrstoff]={ist:Number(r.ist)||0,e:r.einheit,nd:r.n_mit_daten,np:r.n_produkte}; if(r.n_produkte>nProd)nProd=r.n_produkte; });
  const KRIT=mikroKrit(pf);
  function chip(name){
    const ref=MIKRO_REF[name], soll=ref[0], eR=ref[1];
    const star=KRIT.has(name)?'<span class="mkstar">★</span>':'';
    const crit=KRIT.has(name)?' mkcrit':'';
    if(name==="Selen") return '<div class="mkchip mkna'+crit+'">'+star+'<div class="mkn">'+name+'</div><div class="mkp">keine&nbsp;Angabe</div><div class="mkm">Soll '+_mkDe(soll)+' '+eR+'/Tag</div></div>';
    const d=map[name];
    if(!d) return '<div class="mkchip mkleer'+crit+'">'+star+'<div class="mkn">'+name+((ref[2]==='wirk')?'<span class="mkteil" title="Zählt nur Supplemente – Kennzeichnung siehe Fußnote">Ⓢ</span>':'')+'</div><div class="mkp">–</div><div class="mkm">0 / '+_mkDe(soll)+' '+eR+'</div></div>';
    const p=soll?Math.round(d.ist/soll*100):0;
    const stufe=p<=0?'mkzero':(p>=100?'mkfull':'mkmid');
    const done=p>=100?' mkdone':'';
    const teil=(d.nd<nProd)?'<span class="mkteil" title="Nicht alle Lebensmittel des Tages haben Nährstoff-Daten">*</span>':'';
    const supKz=(ref[2]==='wirk')?'<span class="mkteil" title="Zählt NUR Supplemente – Lebensmittel-Anteile (z. B. Fleisch/Fisch bei Kreatin) enthält die Datenquelle nicht. Zielmarke = Schwelle der zugelassenen EU-Wirkaussage (VO 432/2012), KEIN Tagesbedarf.">Ⓢ</span>':'';
    return '<div class="mkchip '+stufe+crit+done+'">'+star+'<div class="mkn">'+name+teil+supKz+'</div><div class="mkp">'+p+'%</div><div class="mkm">'+_mkDe(_mkNum(d.ist))+' / '+_mkDe(soll)+' '+eR+'</div></div>';
  }
  function pct(n){ if(n==="Selen") return -1; return map[n]?Math.round(map[n].ist/MIKRO_REF[n][0]*100):-2; }
  function grp(kind){ return MIKRO_ORDER.filter(function(n){return MIKRO_REF[n][2]===kind;}).sort(function(a,b){return pct(b)-pct(a);}); }
  const liste=Array.from(KRIT).join(", ");
  box.innerHTML=
    '<div class="mkhead"><div style="font-weight:700">🥗 Nährstoffe · '+_dl+'</div>'
    +'<div class="mklg"><span><i style="background:#5b86b0"></i>0&nbsp;%</span><span><i style="background:#cf9a2e"></i>1–99&nbsp;%</span><span><i style="background:#3f9d6b"></i>≥100&nbsp;% ✓</span></div></div>'
    +'<div class="mksub">Zahl unter dem Prozent = <b>gegessen / Tagesbedarf</b>. <span style="color:#7d3ea6">★</span> = für <b>dich</b> laut DGE besonders wichtig'+(liste?': '+liste:'')+'.</div>'
    +'<div class="mkgt">Vitamine</div><div class="mkgrid">'+grp("vit").map(chip).join("")+'</div>'
    +'<div class="mkgt">Mineralstoffe &amp; Spurenelemente</div><div class="mkgrid">'+grp("min").map(chip).join("")+'</div>'
    +'<div class="mkgt">Omega-3 (Fettsäuren)</div><div class="mkgrid">'+grp("omega").map(chip).join("")+'</div>'
    +'<div class="mkgt">Wirkstoffe (aus Supplementen) Ⓢ</div><div class="mkgrid">'+grp("wirk").map(chip).join("")+'</div>'
    +'<div class="mknote">Mengen aus dem Bundeslebensmittelschlüssel (amtliche Nährwert-Datenbank), auf deine Portionen hochgerechnet – sie zeigen, was das Essen <b>geliefert</b> hat, nicht was dein Körper braucht. <b>*</b> = nicht alle Lebensmittel des Tages haben Nährstoff-Daten. <b>Selen</b> führt unsere Quelle nicht (nur Empfehlung). <b>Omega-3</b>: Ziel 250 mg EPA+DHA (EU-Referenz, kein NRV). <b>Ⓢ Wirkstoffe (z. B. Kreatin)</b>: zählen NUR Supplemente – Lebensmittel-Anteile (Fleisch/Fisch) enthält die Datenquelle nicht; die Zielmarke (Kreatin 3 g/Tag) ist die Schwelle der zugelassenen EU-Wirkaussage nach VO 432/2012, <b>kein Tagesbedarf</b> – ohne Krafttraining-Kontext keine Wirkaussage. Keine medizinische Beratung.</div>';
}
