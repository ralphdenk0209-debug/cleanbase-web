/* ===========================================================================
   RIKI-IMPORT (Admin) — Link rein, Riki liest, Mensch prüft, dann speichern.
   Warum die Zwischenstufe: Riki liest eine Herstellerseite, keine Urkunde.
   Ein Vorschlag, der ungeprüft in die DB läuft, ist eine Behauptung mit
   Maschinen-Autorität. Deshalb: anzeigen -> ändern können -> bewusst speichern.
   Leere Felder bleiben leer. Nichts wird geraten, nichts vorbelegt.
   =========================================================================== */
var RK_LETZTER=null;   /* letzter Vorschlag, für die Speicher-Funktion */

async function rkInit(){
  var dl=document.getElementById("rkProdListe"); if(!dl) return;
  if(!ALL.length){ try{ var d=await fetchAlleProdukte(); if(d) ALL=d.map(function(x){return Object.assign({},x,{clean_score:num(x.clean_score)});}); }catch(e){} }
  if(dl.children.length || !ALL.length) return;
  ALL.slice().sort(function(a,b){return (a.name||"").localeCompare(b.name||"");}).forEach(function(p){
    var o=document.createElement("option"); o.value=p.id+" · "+(p.name||"")+(p.marke?(" ("+p.marke+")"):""); dl.appendChild(o);
  });
}
function rkProdId(){
  var v=((document.getElementById("rkProd")||{}).value||"").trim();
  if(!v) return null;
  var m=v.match(/^\s*(P\d+)/i); if(m) return m[1].toUpperCase();
  var p=ALL.find(function(x){ return (x.name||"").toLowerCase()===v.toLowerCase(); });
  return p?p.id:null;
}
/* Liste der Supplements OHNE Verzehrempfehlung - damit man sieht, wo Arbeit liegt. */
function rkOffeneListe(){
  var box=document.getElementById("rkOffen"); if(!box) return;
  if(box.style.display!=="none"){ box.style.display="none"; return; }
  var offen=(ALL||[]).filter(function(p){
    return String(p.kategorie||"").toLowerCase()==="supplement" && !String(p.dosis_text||"").trim();
  }).sort(function(a,b){ return (a.marke||"").localeCompare(b.marke||"")||(a.name||"").localeCompare(b.name||""); });
  box.style.display="";
  box.innerHTML='<div style="background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px">'
    +'<div style="font-size:13px;font-weight:600;margin-bottom:7px">Ohne Verzehrempfehlung: '+offen.length+'</div>'
    +(offen.length
      ? '<div style="display:flex;flex-wrap:wrap;gap:6px">'+offen.map(function(p){
          return '<button onclick="rkWaehle(\''+p.id+'\')" style="padding:5px 10px;border:1px solid var(--line);border-radius:20px;background:var(--bg);color:var(--ink);cursor:pointer;font-size:12px">'+esc(p.name||p.id)+(p.marke?' <span style="color:var(--muted)">'+esc(p.marke)+'</span>':'')+'</button>';
        }).join("")+'</div>'
      : '<div style="font-size:12.5px;color:var(--muted)">Alle erfasst.</div>')
    +'</div>';
}
function rkWaehle(id){
  var p=(ALL||[]).find(function(x){return x.id===id;}); if(!p) return;
  var e=document.getElementById("rkProd"); if(e) e.value=p.id+" · "+(p.name||"")+(p.marke?(" ("+p.marke+")"):"");
  var u=document.getElementById("rkUrl"); if(u && p.produktlink && !u.value) u.value=p.produktlink;
  try{ document.getElementById("rkUrl").focus(); }catch(e2){}
}
/* Manuelle Eingabe – MUSS immer möglich sein.
   Erste Fassung zeigte das Formular nur nach einem erfolgreichen Riki-Lauf: Fand Riki nichts,
   gab es gar kein Eingabefeld. Damit war ausgerechnet der Fall blockiert, in dem der Mensch
   gebraucht wird. Ein Werkzeug, das nur funktioniert, wenn die Maschine liefert, ist keins. */
function rkManuell(){
  var msg=document.getElementById("rkMsg");
  var pid=rkProdId();
  if(!pid){ if(msg){msg.style.color="var(--k-dc2626)"; msg.textContent="Bitte zuerst ein Produkt wählen.";} return; }
  var url=((document.getElementById("rkUrl")||{}).value||"").trim();
  var p=(ALL||[]).find(function(x){return x.id===pid;})||{};
  RK_LETZTER={ pid:pid, url:(url||p.produktlink||""), manuell:true, warn:[],
               v:{ verzehrempfehlung:(p.dosis_text||""), form:(p.form||"") } };
  rkFormZeigen();
  if(msg){ msg.style.color="var(--muted)"; msg.innerHTML="Manuelle Eingabe – trag ein, was auf der <b>Packung</b> steht. Vorhandene Werte sind vorbelegt."; }
}
/* Riki-Import per Link: Editor neu oeffnen, Link setzen, Riki die Seite lesen lassen.
   Beim Speichern legt cb_produkt_ingest neu an oder aktualisiert per EAN/Name (dedup). */
function rkImportVonLink(){
  var url=((document.getElementById("rkImpUrl")||{}).value||"").trim();
  var msg=document.getElementById("rkImpMsg");
  if(!/^https?:\/\//i.test(url)){ if(msg){ msg.style.color="var(--k-dc2626)"; msg.textContent="Bitte einen vollstaendigen Link mit https:// angeben."; } return; }
  if(msg){ msg.style.color="var(--muted)"; msg.textContent="Editor wird geoeffnet, Riki liest die Seite..."; }
  try{
    var pr=openFgEditor(null);
    if(pr && typeof pr.then==="function"){ pr.then(function(){ rkImpAfterOpen(url); }); }
    else { setTimeout(function(){ rkImpAfterOpen(url); }, 500); }
  }catch(e){ if(msg){ msg.style.color="var(--k-dc2626)"; msg.textContent="Fehler: "+e.message; } }
}
if(typeof window!=="undefined"){ window.rkImportVonLink=rkImportVonLink; }

async function rkLesen(){
  var msg=document.getElementById("rkMsg"), form=document.getElementById("rkForm");
  var pid=rkProdId(); var url=((document.getElementById("rkUrl")||{}).value||"").trim();
  if(!pid){ if(msg){msg.style.color="var(--k-dc2626)"; msg.textContent="Bitte zuerst ein Produkt wählen.";} return; }
  if(!/^https?:\/\//i.test(url)){ if(msg){msg.style.color="var(--k-dc2626)"; msg.textContent="Bitte einen vollständigen Link mit https:// angeben.";} return; }
  if(msg){ msg.style.color="var(--muted)"; msg.textContent="Riki liest die Seite…"; }
  if(form) form.style.display="none";
  try{
    var s=await client.auth.getSession(); var tok=(s&&s.data&&s.data.session)?s.data.session.access_token:client.supabaseKey;
    var r=await fetch(client.supabaseUrl+'/functions/v1/riki-herstellerseite',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok,'apikey':client.supabaseKey},body:JSON.stringify({url:url, product_id:pid||null})});
    var d=await r.json();
    if(d.error && !d.leer){ if(msg){msg.style.color="var(--k-dc2626)"; msg.textContent=d.error;} return; }
    /* Nichts gefunden ist kein Sackgassen-Ende: Formular trotzdem öffnen, damit man
       die Angabe von der Packung selbst eintragen kann. */
    if(d.leer){
      rkManuell();
      if(msg){ msg.style.color="var(--k-b45309)";
        msg.innerHTML=esc(d.hinweis||"Auf der Seite nichts gefunden – sie lädt ihre Inhalte vermutlich per JavaScript.")
          +"<br><b>Du kannst es unten von Hand eintragen.</b>"; }
      return;
    }
    RK_LETZTER={pid:pid, url:(d.quelle_url||url), v:(d.vorschlag||{}), warn:(d.warnungen||[])};
    rkFormZeigen();
    if(msg){ msg.style.color="var(--k-166534)"; msg.innerHTML="&#10003; Gelesen – bitte prüfen. <b>Nichts ist gespeichert</b>, bis du unten speicherst."; }
  }catch(e){ if(msg){msg.style.color="var(--k-dc2626)"; msg.textContent="Fehler: "+e.message;} }
}
function rkFormZeigen(){
  var form=document.getElementById("rkForm"); if(!form||!RK_LETZTER) return;
  var v=RK_LETZTER.v||{}, n=v.naehrwerte_100g||{};
  var p=(ALL||[]).find(function(x){return x.id===RK_LETZTER.pid;})||{};
  var feld=function(id,label,wert,hint){
    return '<div style="margin-bottom:10px"><label style="display:block;font-size:12px;color:var(--muted);margin-bottom:3px">'+label
      +(hint?' <span style="color:var(--k-a89f8f)">'+hint+'</span>':'')+'</label>'
      +'<input id="'+id+'" value="'+(wert==null?"":String(wert).replace(/"/g,"&quot;"))+'" style="width:100%;box-sizing:border-box;height:36px;padding:0 10px;border:1px solid var(--line);border-radius:9px;background:var(--bg);color:var(--ink);font-size:14px"></div>';
  };
  var nz=function(x){ return (typeof x==="number"&&isFinite(x))?x:""; };
  var warn=(RK_LETZTER.warn&&RK_LETZTER.warn.length)
    ? '<div class="note" style="background:var(--k-fffbeb);border-color:var(--k-fde68a);color:var(--k-92400e)">⚠️ '+RK_LETZTER.warn.map(esc).join(" · ")+'</div>' : '';
  form.style.display="";
  form.innerHTML='<div style="background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 15px">'
    +'<div style="font-size:13.5px;font-weight:600;margin-bottom:2px">Vorschlag für '+esc(p.name||RK_LETZTER.pid)+'</div>'
    +'<div style="font-size:11.5px;color:var(--muted);margin-bottom:12px">Quelle: '+esc(RK_LETZTER.url)+'</div>'
    + warn
    + feld("rkVerzehr","Verzehrempfehlung (Tagesdosis)", v.verzehrempfehlung, "– wird als Bezugsmenge angezeigt")
    + feld("rkForm2","Form", v.form, "– Kapseln, Pulver, Tropfen …")
    + (v.ean
        ? '<div style="font-size:11.5px;color:var(--k-166534);background:var(--k-e7f4ec);border-radius:8px;padding:7px 10px;margin:-2px 0 10px">EAN auf der Seite gefunden und Prüfziffer stimmt: <b>'+esc(v.ean)+'</b> – trage sie bei Bedarf in der Freigabemaske ein.</div>'
        : '<div style="font-size:11.5px;color:var(--muted);margin:-2px 0 10px">Keine EAN auf der Seite ausgewiesen – kommt beim ersten Scan dazu.</div>')
    + rkNaehrBlock(n)
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">'
      + '<button onclick="rkSpeichern()" style="padding:9px 16px;border:1px solid var(--green);border-radius:9px;background:var(--greenlt);color:var(--greendk);font-weight:600;cursor:pointer;font-size:13.5px">In die Datenbank speichern</button>'
      + '<button onclick="document.getElementById(\'rkForm\').style.display=\'none\'" style="padding:9px 13px;border:1px solid var(--line);border-radius:9px;background:var(--bg);color:var(--muted);cursor:pointer;font-size:13px">Verwerfen</button>'
    + '</div>'
    + '<div id="rkSaveMsg" style="font-size:12.5px;margin-top:9px;line-height:1.5"></div>'
    + '</div>';
}
/* Nährwerte NUR zur Kontrolle anzeigen, nicht speichern.
   Grund: Sie liegen nicht an der Produkt-Tabelle, sondern in der Nährwert-Struktur, und
   dort gehören sie über die Freigabemaske hinein - mit Plausibilitätsprüfung und Quelle.
   Ein zweiter, schwächerer Schreibweg wäre genau die Art Abkürzung, die Daten verdirbt. */
function rkNaehrBlock(n){
  n=n||{};
  var Z=[["Energie","kcal","kcal"],["Eiweiß","protein","g"],["Kohlenhydrate","kh","g"],["davon Zucker","zucker","g"],
         ["Fett","fett","g"],["davon gesättigt","ges_fett","g"],["Ballaststoffe","ballaststoffe","g"],["Salz","salz","g"]];
  var zeilen=Z.filter(function(r){ return typeof n[r[1]]==="number" && isFinite(n[r[1]]); })
    .map(function(r){ return '<div style="display:flex;justify-content:space-between;font-size:12.5px;padding:3px 0;border-bottom:1px solid var(--line)"><span style="color:var(--muted)">'+r[0]+'</span><span>'+String(Math.round(n[r[1]]*100)/100).replace(".",",")+' '+r[2]+'</span></div>'; }).join("");
  return '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--green);margin:14px 0 6px">Nährwerte je 100 g – nur zur Kontrolle</div>'
    + (zeilen
       ? zeilen+'<div style="font-size:11.5px;color:var(--muted);line-height:1.5;margin-top:7px">Diese Werte werden hier <b>nicht</b> gespeichert. Sie gehören über die <b>Freigabemaske</b> ins Produkt – dort laufen Plausibilitätsprüfung und Quellenangabe mit.</div>'
       : '<div style="font-size:12.5px;color:var(--muted)">Riki hat auf der Seite keine Nährwerte gefunden.</div>');
}
async function rkSpeichern(){
  var msg=document.getElementById("rkSaveMsg"); if(!RK_LETZTER) return;
  var g=function(id){ var e=document.getElementById(id); return e?String(e.value||"").trim():""; };
  var zahl=function(id){ var t=g(id).replace(",","."); return (t!==""&&isFinite(Number(t)))?Number(t):null; };
  var patch={ "Produktlink": RK_LETZTER.url };
  var vz=g("rkVerzehr"); if(vz) patch["Portionsgroesse_Text"]=vz;
  var fm=g("rkForm2");   if(fm) patch["Form"]=fm;
  if(!vz && !fm){ if(msg){ msg.style.color="var(--k-b45309)"; msg.textContent="Nichts zu speichern – Verzehrempfehlung und Form sind leer."; } return; }
  if(msg){ msg.style.color="var(--muted)"; msg.textContent="Speichere…"; }
  try{
    /* Direktes Update auf "Produkte" ist per RLS gesperrt (richtig so) – der Schreibweg
       läuft über eine enge Admin-Funktion, die nur diese drei Felder anfasst. */
    var rr=await client.rpc("cb_produkt_bezug_setzen",{p_id:RK_LETZTER.pid, p_verzehr:vz||null, p_form:fm||null, p_link:patch["Produktlink"]||null});
    if(rr.error) throw new Error(rr.error.message);
    /* Frisch nachladen, damit die Offen-Liste das gespeicherte Produkt sofort verliert.
       Ohne das bliebe es stehen und man würde es ein zweites Mal bearbeiten. */
    try{ var d2=await fetchAlleProdukte(); if(d2) ALL=d2.map(function(x){return Object.assign({},x,{clean_score:num(x.clean_score)});}); }catch(e){}
    var ob=document.getElementById("rkOffen");
    if(ob && ob.innerHTML){ ob.style.display="none"; rkOffeneListe(); }   /* neu zeichnen, auch wenn gerade zugeklappt */
    var rest=(ALL||[]).filter(function(p){ return String(p.kategorie||"").toLowerCase()==="supplement" && !String(p.dosis_text||"").trim(); }).length;
    var pn=((ALL||[]).find(function(x){return x.id===RK_LETZTER.pid;})||{}).name||RK_LETZTER.pid;
    /* Feld frei machen: der nächste Link soll ohne Aufräumen hineinpassen. */
    var uf=document.getElementById("rkUrl"); if(uf) uf.value="";
    var pf=document.getElementById("rkProd"); if(pf) pf.value="";
    var form=document.getElementById("rkForm"); if(form) form.style.display="none";
    RK_LETZTER=null;
    var top=document.getElementById("rkMsg");
    if(top){ top.style.color="var(--k-166534)"; top.innerHTML="&#10003; <b>"+esc(pn)+"</b> gespeichert. Noch <b>"+rest+"</b> Supplements ohne Verzehrempfehlung."; }
  }catch(e){ if(msg){ msg.style.color="var(--k-dc2626)"; msg.textContent="Fehler beim Speichern: "+e.message; } }
}
