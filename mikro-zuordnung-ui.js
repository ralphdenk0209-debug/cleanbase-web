/* ===== Admin: Nährstoff-Zuordnung (Leitlebensmittel) — Ralph 25.07. =====
   Produkte OHNE Mikronährstoffe mit dominanter Zutat: Vorschlag „= dieses Lebensmittel" (cb_mikro_zuordnung_offen).
   Admin bestätigt (kopiert BLS-Profil, cb_mikro_zuordnung_uebernehmen), wählt ein anderes Leitlebensmittel,
   oder markiert „zusammengesetzt → keine Angabe" (cb_mikro_zuordnung_keine). Nichts wird automatisch geschrieben. */
function mikroZuordnungRender(){
  if(!(ME&&ME.is_admin)) return;
  var v=document.getElementById("mikroView"); if(!v) return;
  v.innerHTML='<div style="max-width:860px;margin:0 auto;padding:14px 6px 40px"><div style="background:var(--card,#fff);color:var(--ink);border:1px solid var(--line);border-radius:14px;padding:18px 18px 20px">'
    +'<div style="font-weight:800;font-size:20px;margin:4px 2px 2px">🥗 Nährstoff-Zuordnung</div>'
    +'<div style="font-size:12.5px;color:var(--muted);line-height:1.5;margin:0 2px 18px">Produkten ohne Mikronährstoffe eine belegte Quelle geben. <b>Einzel-Lebensmittel</b>: das BLS-Profil eines Lebensmittel-Typs übernehmen (als „geschätzt"). <b>Zusammengesetzt</b>: aus den Zutaten berechnen (Anteile schätzbar). Nichts wird automatisch geschrieben.</div>'
    +'<datalist id="mzLeitDL"></datalist>'
    +'<div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:700;margin:6px 2px 8px">Einzel-Lebensmittel</div>'
    +'<div id="mzListE" style="font-size:13px;color:var(--muted);margin-bottom:26px">Lade …</div>'
    +'<div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:700;margin:6px 2px 8px">Zusammengesetzt · aus Zutaten berechnen</div>'
    +'<div id="mzListK" style="font-size:13px;color:var(--muted)">Lade …</div>'
  +'</div></div>';
  mzLoadAll();
}
async function mzLoadAll(){
  try{ var rl=await client.rpc("cb_mikro_leit_liste"); window._mzLeit=(rl&&rl.data)||[]; var dl=document.getElementById("mzLeitDL"); if(dl) dl.innerHTML=(window._mzLeit).map(function(x){return '<option value="'+esc(x.name)+'"></option>';}).join(""); }catch(e){ window._mzLeit=[]; }
  try{ var r=await client.rpc("cb_mikro_zuordnung_offen"); if(r.error) throw new Error(r.error.message); window._mzOffen=(r&&r.data)||[]; mzRender(); }
  catch(e){ var l=document.getElementById("mzListE"); if(l){ l.style.color="var(--k-dc2626)"; l.textContent="Konnte die Liste nicht laden: "+(e&&e.message?e.message:e); } }
  try{ var r2=await client.rpc("cb_mikro_komposit_offen"); if(r2.error) throw new Error(r2.error.message); window._mzKomp=(r2&&r2.data)||[]; mzKompListRender(); }
  catch(e){ var l2=document.getElementById("mzListK"); if(l2){ l2.style.color="var(--k-dc2626)"; l2.textContent="Konnte die Liste nicht laden: "+(e&&e.message?e.message:e); } }
}
function mzConf(sim){ if(sim>=0.7) return ['sehr sicher','var(--k-166534)']; if(sim>=0.5) return ['sicher','var(--k-166534)']; if(sim>=0.34) return ['prüfen','var(--k-b45309)']; return ['unsicher','var(--k-dc2626)']; }
function mzRender(){
  var l=document.getElementById("mzListE"); if(!l) return;
  var arr=window._mzOffen||[];
  if(!arr.length){ l.style.color="var(--k-166534)"; l.innerHTML="✓ Nichts mehr offen."; return; }
  l.style.color="var(--ink)";
  l.innerHTML='<div style="color:var(--muted);font-size:12px;margin-bottom:8px">'+arr.length+' Produkt(e) · nach Trefferqualität sortiert</div>'
    + arr.map(function(o){ var c=mzConf(o.sim);
      return '<div class="mzRow" data-pid="'+esc(o.produkt_id)+'" style="border:1px solid var(--line);border-radius:11px;padding:11px 12px;margin-bottom:9px">'
        +'<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b style="font-size:14px">'+esc(o.produkt)+'</b><span style="font-size:11px;color:'+c[1]+';white-space:nowrap;font-weight:700">'+c[0]+'</span></div>'
        +'<div style="font-size:11.5px;color:var(--muted);margin:3px 0 8px">Zutat: <b>'+esc(o.zutat||'—')+'</b> · '+esc(String(o.n_zutaten))+' Zutat(en)</div>'
        +'<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><span style="font-size:12px;color:var(--muted)">= Lebensmittel:</span>'
          +'<input class="mzLeit" list="mzLeitDL" value="'+esc(o.leit_name||'')+'" style="flex:1;min-width:180px;padding:7px 9px;border:1px solid var(--line);border-radius:8px;font-size:13px;background:var(--bg);color:var(--ink)">'
          +'<button onclick="mzUebernehmen(this)" style="padding:7px 12px;border:0;border-radius:8px;background:var(--green);color:var(--auf-gruen);font-weight:700;font-size:12.5px;cursor:pointer">✓ Übernehmen</button>'
          +'<button onclick="mzKeine(this)" style="padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--muted);font-weight:600;font-size:12px;cursor:pointer">∅ zusammengesetzt</button>'
        +'</div><div class="mzMsg" style="font-size:12px;margin-top:5px"></div></div>';
    }).join("");
}
async function mzUebernehmen(btn){
  var row=btn.closest(".mzRow"); if(!row) return;
  var pid=row.getAttribute("data-pid");
  var inp=row.querySelector(".mzLeit"), msg=row.querySelector(".mzMsg");
  var v=((inp.value||"").trim()).toLowerCase();
  var leit=(window._mzLeit||[]).find(function(x){ return (x.name||"").toLowerCase()===v; });
  if(!leit){ if(msg){ msg.style.color="var(--k-dc2626)"; msg.textContent="Bitte ein Lebensmittel aus der Liste wählen."; } return; }
  if(msg){ msg.style.color="var(--muted)"; msg.textContent="Übernehme …"; }
  try{ var r=await client.rpc("cb_mikro_zuordnung_uebernehmen",{p_produkt:pid, p_leit:leit.id});
    if(r.error) throw new Error(r.error.message);
    if(msg){ msg.style.color="var(--k-166534)"; msg.innerHTML='✓ '+esc(String(r.data||0))+' Nährstoffe von „'+esc(leit.name)+'" übernommen.'; }
    row.style.opacity="0.5"; var bs=row.querySelectorAll("button,input"); for(var i=0;i<bs.length;i++) bs[i].disabled=true;
  }catch(e){ if(msg){ msg.style.color="var(--k-dc2626)"; msg.textContent="Fehler: "+(e&&e.message?e.message:e); } }
}
async function mzKeine(btn){
  var row=btn.closest(".mzRow"); if(!row) return;
  var pid=row.getAttribute("data-pid"), msg=row.querySelector(".mzMsg");
  if(msg){ msg.style.color="var(--muted)"; msg.textContent="Merke …"; }
  try{ var r=await client.rpc("cb_mikro_zuordnung_keine",{p_produkt:pid});
    if(r.error) throw new Error(r.error.message);
    if(msg){ msg.style.color="var(--k-166534)"; msg.textContent='✓ als „keine Angabe" gemerkt.'; }
    row.style.opacity="0.5"; var bs=row.querySelectorAll("button,input"); for(var i=0;i<bs.length;i++) bs[i].disabled=true;
  }catch(e){ if(msg){ msg.style.color="var(--k-dc2626)"; msg.textContent="Fehler: "+(e&&e.message?e.message:e); } }
}
function mzKompListRender(){
  var l=document.getElementById("mzListK"); if(!l) return; var arr=window._mzKomp||[];
  if(!arr.length){ l.style.color="var(--k-166534)"; l.innerHTML="✓ Nichts mehr offen."; return; }
  l.style.color="var(--ink)";
  l.innerHTML='<div style="color:var(--muted);font-size:12px;margin-bottom:8px">'+arr.length+' zusammengesetzte(s) Produkt(e)</div>'
    + arr.map(function(o){
      return '<div class="mzRow" data-pid="'+esc(o.produkt_id)+'" style="border:1px solid var(--line);border-radius:11px;padding:11px 12px;margin-bottom:9px">'
        +'<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b style="font-size:14px">'+esc(o.produkt)+'</b><span style="font-size:11px;color:var(--muted);white-space:nowrap">'+esc(String(o.n_zutaten))+' Zutaten</span></div>'
        +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">'
          +'<button onclick="mzKompOpen(this)" style="padding:7px 12px;border:1px solid var(--green);border-radius:8px;background:var(--greenlt);color:var(--greendk);font-weight:700;font-size:12.5px;cursor:pointer">🔧 aus Zutaten berechnen</button>'
          +'<button onclick="mzKeine(this)" style="padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--muted);font-weight:600;font-size:12px;cursor:pointer">∅ keine Angabe</button>'
        +'</div>'
        +'<div class="mzKompPanel" style="display:none"></div>'
        +'<div class="mzMsg" style="font-size:12px;margin-top:5px"></div>'
      +'</div>';
    }).join("");
}
async function mzKompOpen(btn){
  var row=btn.closest(".mzRow"), pid=row.getAttribute("data-pid");
  var panel=row.querySelector(".mzKompPanel");
  if(panel.style.display!=="none"){ panel.style.display="none"; return; }
  panel.style.display=""; panel.innerHTML='<div style="color:var(--muted);font-size:12px;padding:6px 0">Lade Zutaten …</div>';
  try{ var r=await client.rpc("cb_mikro_komposit_zutaten",{p_produkt:pid}); if(r.error) throw new Error(r.error.message);
    panel.innerHTML=mzKompPanelHtml((r&&r.data)||[]);
  }catch(e){ panel.innerHTML='<div style="color:var(--k-dc2626);font-size:12px">Fehler: '+esc(e&&e.message?e.message:String(e))+'</div>'; }
}
function mzKompPanelHtml(z){
  var rows=z.map(function(o){
    var pre=(o.sim>=0.5)?esc(o.leit_name||""):"";
    var an=(o.anteil!=null)?String(o.anteil):"";
    return '<div class="mzZ" style="display:flex;gap:6px;align-items:center;margin-bottom:5px">'
      +'<span style="flex:0 0 130px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+esc(o.zutat)+'">'+esc(o.zutat)+'</span>'
      +'<input class="mzZLeit" list="mzLeitDL" value="'+pre+'" placeholder="Lebensmittel…" style="flex:1;min-width:110px;padding:5px 7px;border:1px solid var(--line);border-radius:7px;font-size:12px;background:var(--bg);color:var(--ink)">'
      +'<input class="mzZAnt" type="number" min="0" max="100" step="0.1" value="'+esc(an)+'" placeholder="%" style="width:60px;padding:5px 6px;border:1px solid var(--line);border-radius:7px;font-size:12px;background:var(--bg);color:var(--ink)"><span style="font-size:11px;color:var(--muted)">%</span>'
    +'</div>';
  }).join("");
  return '<div style="border-top:1px solid var(--line);margin-top:9px;padding-top:9px">'
    +'<div style="font-size:11.5px;color:var(--muted);margin-bottom:8px">Je Zutat ein <b>Lebensmittel</b> (Nährstoff-Quelle) + <b>Anteil %</b>. Prüfe die Vorschläge (z. B. „Mandeln → Mandelöl" wäre falsch). Ohne Etikett-Prozente: „≈ schätzen" und anpassen.</div>'
    + rows
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">'
      +'<button onclick="mzKompSchaetzen(this)" style="padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);font-weight:600;font-size:12px;cursor:pointer">≈ Anteile aus Reihenfolge schätzen</button>'
      +'<button onclick="mzKompVorschau(this)" style="padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);font-weight:600;font-size:12px;cursor:pointer">👁 Vorschau</button>'
      +'<button onclick="mzKompSpeichern(this)" style="padding:7px 12px;border:0;border-radius:8px;background:var(--green);color:var(--auf-gruen);font-weight:700;font-size:12.5px;cursor:pointer">✓ Speichern (berechnet)</button>'
    +'</div>'
    +'<div class="mzKompVor" style="font-size:12px;margin-top:8px;color:var(--muted)"></div>'
  +'</div>';
}
function mzKompCollect(panel){
  var out=[], zs=panel.querySelectorAll(".mzZ");
  for(var i=0;i<zs.length;i++){
    var nm=((zs[i].querySelector(".mzZLeit").value)||"").trim().toLowerCase();
    var an=parseFloat(zs[i].querySelector(".mzZAnt").value);
    var leit=(window._mzLeit||[]).find(function(x){ return (x.name||"").toLowerCase()===nm; });
    if(leit && an>0) out.push({leit_id:leit.id, anteil:an});
  }
  return out;
}
function mzKompSchaetzen(btn){
  var panel=btn.closest(".mzKompPanel"); var zs=panel.querySelectorAll(".mzZ"); var k=zs.length; if(!k) return;
  var sum=k*(k+1)/2;
  for(var i=0;i<k;i++){ var w=(k-i); var pct=Math.round(w/sum*1000)/10; zs[i].querySelector(".mzZAnt").value=pct; }
  var vor=panel.querySelector(".mzKompVor"); if(vor){ vor.style.color="var(--k-b45309)"; vor.textContent="Anteile aus Reihenfolge geschätzt (Annahme) – bitte anpassen, dann Vorschau."; }
}
async function mzKompVorschau(btn){
  var panel=btn.closest(".mzKompPanel"); var vor=panel.querySelector(".mzKompVor");
  var zeilen=mzKompCollect(panel);
  var summe=zeilen.reduce(function(a,b){ return a+b.anteil; },0);
  if(!zeilen.length){ vor.style.color="var(--k-dc2626)"; vor.textContent="Keine Zutat mit Lebensmittel + Anteil."; return; }
  vor.style.color="var(--muted)"; vor.textContent="Rechne …";
  try{ var r=await client.rpc("cb_mikro_komposit_vorschau",{p_zeilen:zeilen}); if(r.error) throw new Error(r.error.message);
    var d=(r&&r.data)||[];
    var top=d.slice().sort(function(a,b){ return Number(b.menge_100g)-Number(a.menge_100g); }).slice(0,6)
      .map(function(x){ return esc(x.naehrstoff)+' '+esc(String(x.menge_100g))+' '+esc(x.einheit); }).join(" · ");
    var warn=Math.abs(summe-100)>15;
    vor.style.color=warn?"var(--k-b45309)":"var(--k-166534)";
    vor.innerHTML='Σ Anteile <b>'+summe.toFixed(1)+' %</b>'+(warn?' ⚠ (weit von 100 %)':'')+' · '+d.length+' Nährstoffe berechnet · z. B. '+top;
  }catch(e){ vor.style.color="var(--k-dc2626)"; vor.textContent="Fehler: "+(e&&e.message?e.message:e); }
}
async function mzKompSpeichern(btn){
  var row=btn.closest(".mzRow"), pid=row.getAttribute("data-pid");
  var panel=btn.closest(".mzKompPanel"), msg=row.querySelector(".mzMsg");
  var zeilen=mzKompCollect(panel);
  if(!zeilen.length){ if(msg){ msg.style.color="var(--k-dc2626)"; msg.textContent="Keine gültige Zutat (Lebensmittel + Anteil)."; } return; }
  if(msg){ msg.style.color="var(--muted)"; msg.textContent="Speichere …"; }
  try{ var r=await client.rpc("cb_mikro_komposit_speichern",{p_produkt:pid, p_zeilen:zeilen}); if(r.error) throw new Error(r.error.message);
    if(msg){ msg.style.color="var(--k-166534)"; msg.innerHTML='✓ '+esc(String(r.data||0))+' Nährstoffe berechnet &amp; gespeichert.'; }
    row.style.opacity="0.55"; var bs=row.querySelectorAll("button,input"); for(var i=0;i<bs.length;i++) bs[i].disabled=true;
  }catch(e){ if(msg){ msg.style.color="var(--k-dc2626)"; msg.textContent="Fehler: "+(e&&e.message?e.message:e); } }
}
if(typeof window!=='undefined'){ window.mikroZuordnungRender=mikroZuordnungRender; window.mzUebernehmen=mzUebernehmen; window.mzKeine=mzKeine; window.mzKompOpen=mzKompOpen; window.mzKompSchaetzen=mzKompSchaetzen; window.mzKompVorschau=mzKompVorschau; window.mzKompSpeichern=mzKompSpeichern; }
