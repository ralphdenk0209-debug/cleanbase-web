/* ============================================================================
   BEWERTUNGS-PRÜFBLATT · Testversion · 27.08.2026
   ----------------------------------------------------------------------------
   Ralph-Genehmigung 27.08.2026: darf ausdrücklich PARALLEL zur bestehenden
   Produkt-erfassen-Ansicht laufen. Bei positivem Entscheid ersetzt sie sie.

   WAS DIESE SEITE TUT: den Serverzustand der automatischen Zutatenbewertung
   je Produkt zeigen — eine Zeile je Zutat, Note, Regel, oder benannte Lücke.

   WAS SIE NICHT TUT (Kernvertrag B1, server_ssot): keine Note rechnen, keine
   Regel zuordnen, keinen Zustand erfinden, NICHTS schreiben. Zwei Lese-RPCs:
     cb_app_produkt_zutaten(p_produkt_id)        — der Serverzustand je Zeile
     cb_admin_bewertungsregeln_suchen(p_suche)   — Regeltexte (nur als Admin)
   Konzept: bereiche/konzept-automatische-zutatenbewertung.md
   ========================================================================== */

/* Dieselben Zugangsdaten wie app.js Zeile 1-2 (öffentlicher anon-Schlüssel).
   Gleicher storageKey wie app.js: die Admin-Anmeldung aus admin.html gilt
   damit auch hier — kein zweiter Anmeldeweg. */
/* Sichtbarer Build-Stempel. Steht im Seitenkopf, damit nie wieder ein alter
   Cache-Stand für den aktuellen gehalten wird (Falle A3, passiert 27.08.). */
var PB_BUILD = "PB-2026-08-27-3";

var PB_URL = "https://haurbpfkfaaehorirzee.supabase.co";
var PB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhdXJicGZrZmFhZWhvcmlyemVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDY2OTYsImV4cCI6MjA5Nzk4MjY5Nn0.6U0bD0m2kYM2iL0KJ9fbCFvcQMXAglr8GvwmPwyHqyw";

var pbClient = supabase.createClient(PB_URL, PB_KEY, {
  auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:false,
          storage: window.localStorage, storageKey:"sb-cleanbase-auth" }
});

var PB_ROWS = [];          /* letzte Serverantwort, unverändert */
var PB_REGELN = {};        /* rule_id -> {titel, wert, inhalt, quelle} */
var PB_FILTER = "alle";
var PB_RIEGEL = null;      /* Befundliste des Verifizierungsriegels, [] = alles grün */
var PB_ZUSATZ = null;      /* Serverantwort cb_app_produkt_zusatzstoffe, unverändert */
var PB_RIEGEL_N = 6;       /* Zahl der Prüfungen im Riegel */
var PB_ADMIN_TEXTE = true; /* wird false, wenn Regeltexte mangels Anmeldung fehlen */

function pbEsc(s){
  return String(s==null?"":s).replace(/[&<>"']/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}
function pbEl(id){ return document.getElementById(id); }

/* --- Lückentyp: reine ANZEIGE der Serverfelder, kein eigenes Urteil -------- */
function pbLuecke(r){
  if(r.resolved_rating!=null) return null;
  if(r.disposition)
    return {typ:0, kurz:"bewusst offen",
      lang:"Der Server hat diese Zeile ausdrücklich als Sonderfall benannt ("+r.disposition+"): "+(r.disposition_reason||"")};
  if(r.resolution_path==="unresolved" || !r.canonical_entity_id)
    return {typ:1, kurz:"Brücke fehlt",
      lang:"Im alten Stamm gebunden, aber der Weg in den Canonical-Stamm fehlt. Ohne Stammeintrag kann keine Regel greifen. Behebung: Binding (ChatGPT)."};
  if(r.rating_disposition==="insufficient_evidence")
    return {typ:2, kurz:"Beleg fehlt",
      lang: r.rating_disposition_reason || "Die Regel braucht eine Angabe von der Quelle, die fehlt."};
  return {typ:3, kurz:"Keine Regel",
    lang: r.rating_disposition_reason || "Das Regelwerk deckt diesen Fall nicht. Behebung: Regelentscheid Ralph."};
}

/* --- VERIFIZIERUNGSRIEGEL ---------------------------------------------------
   Fünf harte Prüfungen gegen die Serverantwort. Jede ist deterministisch und
   erfindet nichts. Fällt eine, steht der Riegel ROT und nennt die Zeilen.
   I1  Jede Zeile hat genau EINEN Zustand: Note+Regel ODER benannter Sonderfall.
   I2  Keine Note ohne Regel-ID (eine Zahl ohne Beleg zählt nicht).
   I3  Keine Note an einer Zeile ohne Stammeintrag (Fehlerklasse aus Work #285).
   I4  Zweiter Abruf liefert exakt dieselbe Antwort (Lesen ist idempotent).
   I5  Die Kopfzahlen gehen auf die Gesamtzeilenzahl auf.
   I6  Zusatzstoffe: Serverantwort da, Gesamtzustand benannt, jeder Eintrag
       trägt einen Bewertungszustand (abgewertet/neutral/ungeprüft).         */
async function pbRiegel(pid, rows){
  var f=[]; /* Befunde */
  rows.forEach(function(r){
    var hatNote = r.resolved_rating!=null;
    var hatRegel = !!r.resolved_rule_id;
    var benannt = !!r.disposition;
    if(hatNote && !hatRegel) f.push('I2 verletzt: "'+r.sichtbarer_name+'" hat Note '+r.resolved_rating+' ohne Regel-ID.');
    if(hatNote && !r.canonical_entity_id) f.push('I3 verletzt: "'+r.sichtbarer_name+'" hat Note ohne Stammeintrag.');
    if(!hatNote && !benannt) f.push('I1 verletzt: "'+r.sichtbarer_name+'" ist weder bewertet noch benannt offen.');
    if(hatNote && benannt) f.push('I1 verletzt: "'+r.sichtbarer_name+'" ist bewertet UND als Sonderfall benannt - zwei Zustände.');
  });
  var z=pbZaehler();
  if(z.mit+z.l0+z.l1+z.l2+z.l3!==z.n) f.push("I5 verletzt: Kopfzahlen ("+z.mit+"+"+z.l0+"+"+z.l1+"+"+z.l2+"+"+z.l3+") ≠ "+z.n+" Zeilen.");
  try{
    var r2=await pbClient.rpc("cb_app_produkt_zutaten",{p_produkt_id:pid});
    if(r2.error) throw r2.error;
    if(JSON.stringify(rows)!==JSON.stringify(r2.data||[]))
      f.push("I4 verletzt: zweiter Abruf liefert eine andere Antwort — Lesen ist nicht stabil.");
  }catch(e){ f.push("I4 nicht prüfbar: "+(e.message||e)); }
  var bekannt=["identified","partial","unresolved","none_declared","no_data"];
  if(!PB_ZUSATZ || PB_ZUSATZ.fehler)
    f.push("I6 verletzt: Zusatzstoff-Antwort fehlt"+(PB_ZUSATZ&&PB_ZUSATZ.fehler?(" ("+PB_ZUSATZ.fehler+")"):"")+".");
  else{
    if(bekannt.indexOf(PB_ZUSATZ.resolution_status)<0)
      f.push("I6 verletzt: unbekannter Zusatzstoff-Gesamtzustand \""+PB_ZUSATZ.resolution_status+"\".");
    (PB_ZUSATZ.items||[]).forEach(function(it){
      if(["abgewertet","neutral","ungeprueft","ungeprüft"].indexOf(it.evaluation)<0)
        f.push('I6 verletzt: Zusatzstoff "'+(it.name||it.e_number)+'" ohne Bewertungszustand.');
    });
  }
  return f;
}

function pbRiegelHtml(f){
  if(!f) return "";
  if(!f.length)
    return '<div class="pbRiegel gruen"><b>✓ Verifizierungsriegel: '+PB_RIEGEL_N+' von '+PB_RIEGEL_N+' Prüfungen bestanden.</b> '
      +'Jede Zeile hat genau einen Zustand, jede Note einen Regelbeleg, Zusatzstoffe benannt, zwei Abrufe liefern dieselbe Antwort.</div>';
  return '<div class="pbRiegel rot"><b>✗ Verifizierungsriegel: '+f.length+' Befund(e).</b><ul><li>'
    + f.map(pbEsc).join('</li><li>') + '</li></ul></div>';
}

/* --- Zusatzstoffe: eigene Achse, eigener Serverweg, reine Anzeige ---------- */
var PB_ZFUNK = { antioxidant:"Antioxidationsmittel", emulsifier:"Emulgator",
  stabiliser:"Stabilisator", stabilizer:"Stabilisator", preservative:"Konservierungsstoff",
  colour:"Farbstoff", color:"Farbstoff", sweetener:"Süßstoff", thickener:"Verdickungsmittel",
  acidity_regulator:"Säureregulator", flavour_enhancer:"Geschmacksverstärker" };
var PB_ZSTATUS = {
  identified:   ["gruen","Alle Zusatzstoffe identifiziert"],
  partial:      ["gelb","Teilweise identifiziert — es bleiben ungeklärte Angaben"],
  unresolved:   ["gelb","Angaben gelesen, aber nicht aufgelöst"],
  none_declared:["blau","Laut Quelle: keine Zusatzstoffe deklariert"],
  no_data:      ["gelb","Keine Angabe zu Zusatzstoffen gelesen"] };
function pbZusatzHtml(){
  var z=PB_ZUSATZ;
  var t='<h2 class="pbH2">Zusatzstoffe <span class="pbH2n">· eigene Achse, aus cb_app_produkt_zusatzstoffe</span></h2>';
  if(!z || z.fehler)
    return t+'<div class="pbHinweis">Zusatzstoffe konnten gerade nicht geladen werden'+(z&&z.fehler?': '+pbEsc(z.fehler):'')+'. Kein Rückfall auf alte Felder.</div>';
  var st=PB_ZSTATUS[z.resolution_status]||["gelb","Unbekannter Zustand: "+z.resolution_status];
  t+='<div class="pbZStatus '+st[0]+'">'+pbEsc(st[1])+'</div>';
  if(z.source_text && z.resolution_status!=="none_declared")
    t+='<div class="pbZQuelle">Quelltext: „'+pbEsc(z.source_text)+'"</div>';
  var items=z.items||[];
  if(items.length){
    t+='<table class="pbTab"><thead><tr><th>E-Nr</th><th>Name</th><th>Funktion</th><th>EU-Status</th><th>Bewertung</th></tr></thead><tbody>';
    items.forEach(function(it){
      var ev=it.evaluation||"";
      var kl = ev==="abgewertet" ? "pbRot" : (ev==="neutral" ? "pbGruen" : "pbGelb");
      t+='<tr class="'+kl+'"><td>'+pbEsc(it.e_number||"—")+'</td><td>'+pbEsc(it.name||"—")+'</td>'
        +'<td>'+pbEsc(PB_ZFUNK[it.function]||it.function||"—")+'</td>'
        +'<td>'+pbEsc(it.eu_status||"—")+'</td><td><b>'+pbEsc(ev||"—")+'</b></td></tr>';
    });
    t+='</tbody></table>';
  }
  var uk=z.unresolved_candidates||[];
  if(uk.length)
    t+='<div class="pbHinweis">Nicht aufgelöste Angaben ('+uk.length+'): '+pbEsc(uk.join(', '))+'</div>';
  return t;
}

/* --- Laden ----------------------------------------------------------------- */
async function pbLaden(){
  var pid=(pbEl("pbPid").value||"").trim();
  if(!pid){ pbStatus("Bitte eine Produkt-ID eingeben, z. B. P1809."); return; }
  pbStatus("Lade "+pbEsc(pid)+" …");
  try{
    var r=await pbClient.rpc("cb_app_produkt_zutaten",{p_produkt_id:pid});
    if(r.error) throw r.error;
    PB_ROWS=r.data||[];
    if(!PB_ROWS.length){
      pbStatus("Der Server kennt zu "+pbEsc(pid)+" keine Zutatenzeilen.");
      pbEl("pbKopf").innerHTML=""; pbEl("pbTabelle").innerHTML=""; return;
    }
    await pbRegelTexte();
    try{
      var rz=await pbClient.rpc("cb_app_produkt_zusatzstoffe",{p_produkt_id:pid});
      if(rz.error) throw rz.error;
      PB_ZUSATZ=rz.data||null;
    }catch(ez){ PB_ZUSATZ={fehler:String(ez.message||ez)}; }
    PB_RIEGEL = await pbRiegel(pid, PB_ROWS);
    pbRender();
    pbStatus("");
  }catch(e){
    pbStatus("Fehler beim Laden: "+pbEsc(e.message||e));
  }
}

/* Regeltexte: EIN Abruf des kompletten aktiven Regelwerks über die vorhandene
   Riki-Tür (cb_riki_regelwerk_zutatenbewertung_holen), dann Zuordnung über
   id UND schluessel. Grund für den Wechsel am 27.08.: die Suchfunktion
   cb_admin_bewertungsregeln_suchen filtert auf reine Zahlenregeln (wert 0-10)
   und ließ z. B. die Salzregel (wert "7 / 5") aus - auf dem Prüfblatt stand
   dann die rohe Regel-ID. Braucht Admin-Anmeldung; ohne sie bleibt die
   Regel-ID stehen und die Seite sagt das ehrlich. */
var PB_REGELWERK_GELADEN = false;
async function pbRegelTexte(){
  if(PB_REGELWERK_GELADEN) return;
  PB_ADMIN_TEXTE=true;
  try{
    var r=await pbClient.rpc("cb_riki_regelwerk_zutatenbewertung_holen");
    if(r.error) throw r.error;
    var regeln=(r.data && r.data.rules) || [];
    regeln.forEach(function(b){
      if(b.id) PB_REGELN[b.id]=b;
      if(b.schluessel && !PB_REGELN[b.schluessel]) PB_REGELN[b.schluessel]=b;
    });
    PB_REGELWERK_GELADEN=true;
  }catch(e){ PB_ADMIN_TEXTE=false; }
}

/* --- Rendern ---------------------------------------------------------------- */
function pbZaehler(){
  var n=PB_ROWS.length, mit=0, l0=0, l1=0, l2=0, l3=0;
  PB_ROWS.forEach(function(r){
    var lk=pbLuecke(r);
    if(!lk) mit++;
    else if(lk.typ===0) l0++;
    else if(lk.typ===1) l1++;
    else if(lk.typ===2) l2++;
    else l3++;
  });
  return {n:n, mit:mit, l0:l0, l1:l1, l2:l2, l3:l3};
}

function pbKopfHtml(z){
  var deck = z.n ? Math.round(z.mit*1000/z.n)/10 : 0;
  var voll = (z.mit+z.l0===z.n);
  return '<div class="pbKacheln">'
    +'<div class="pbKachel'+(voll?' gruen':'')+'"><b>'+z.mit+' / '+z.n+'</b>Note + Regelbeleg ('+deck+' %)</div>'
    +'<div class="pbKachel'+(z.l0?' blau':'')+'"><b>'+z.l0+'</b>bewusst offen (benannter Sonderfall)</div>'
    +'<div class="pbKachel'+(z.l1?' rot':'')+'"><b>'+z.l1+'</b>Brücke fehlt (kein Canonical)</div>'
    +'<div class="pbKachel'+(z.l2?' gelb':'')+'"><b>'+z.l2+'</b>Beleg fehlt (Quelle unklar)</div>'
    +'<div class="pbKachel'+(z.l3?' gelb':'')+'"><b>'+z.l3+'</b>Regel fehlt</div>'
    +'</div>'
    +(PB_ADMIN_TEXTE?'' :'<div class="pbHinweis">Regeltexte brauchen eine Admin-Anmeldung (über admin.html anmelden, dann hier neu laden). Die Regel-IDs stimmen trotzdem.</div>');
}

function pbSichtbar(r){
  var lk=pbLuecke(r);
  if(PB_FILTER==="alle") return true;
  if(PB_FILTER==="note") return !lk;
  return !!lk; /* "luecke" */
}

function pbZeileHtml(r, idx){
  var lk=pbLuecke(r);
  var klasse = lk ? (lk.typ===0?"pbBlau":(lk.typ===1?"pbRot":"pbGelb")) : "pbGruen";
  var regel = "";
  if(r.resolved_rule_id){
    var b=PB_REGELN[r.resolved_rule_id];
    regel = b ? pbEsc(b.titel||b.schluessel||r.resolved_rule_id)
              : pbEsc(r.resolved_rule_id);
  }
  return '<tr class="pbZeile '+klasse+'" onclick="pbDetail('+idx+')">'
    +'<td class="r">'+pbEsc(r.reihenfolge)+'</td>'
    +'<td>'+pbEsc(r.sichtbarer_name||r.zutatenliste_rohtext||"—")+'</td>'
    +'<td class="r">'+pbEsc(r.anteil_prozent||"")+'</td>'
    +'<td>'+(r.canonical_name?pbEsc(r.canonical_name):'<span class="pbLeer">nicht verknüpft</span>')+'</td>'
    +'<td class="r"><b>'+(r.resolved_rating!=null?pbEsc(r.resolved_rating):"—")+'</b></td>'
    +'<td class="r">'+(r.resolved_critical?"⚠":"")+'</td>'
    +'<td>'+regel+'</td>'
    +'<td>'+(lk?('<b>'+pbEsc(lk.kurz)+'</b>'):"")+'</td>'
    +'</tr>'
    +'<tr class="pbDetail" id="pbD'+idx+'" style="display:none"><td colspan="8">'+pbDetailHtml(r,lk)+'</td></tr>';
}

function pbDetailHtml(r, lk){
  var b = r.resolved_rule_id ? PB_REGELN[r.resolved_rule_id] : null;
  var t = '<div class="pbDetailBox">';
  t += '<div><b>Serverzustand dieser Zeile</b> (unverändert aus cb_app_produkt_zutaten):</div>';
  t += '<table class="pbFelder">';
  var felder=[
    ["Rohtext vom Etikett", r.zutatenliste_rohtext],
    ["Legacy-Zutat", r.legacy_zutat_id],
    ["Canonical-Eintrag", r.canonical_name ? (r.canonical_name+" · "+(r.canonical_category||"ohne Kategorie")) : null],
    ["Bindungsweg", r.resolution_path],
    ["Bindungsart", r.binding_type],
    ["Verarbeitungszusatz", r.processing_modifier],
    ["Matrix-Zustand", r.matrix_state],
    ["Note", r.resolved_rating],
    ["kritisch", r.resolved_critical===true?"ja":(r.resolved_critical===false?"nein":null)],
    ["Quelle der Note", r.rating_source],
    ["Regel-ID", r.resolved_rule_id],
    ["Kontextschlüssel", r.matched_context_key],
    ["Disposition (Bindung)", r.disposition ? r.disposition+" — "+(r.disposition_reason||"") : null],
    ["Disposition (Bewertung)", r.rating_disposition ? r.rating_disposition+" — "+(r.rating_disposition_reason||"") : null]
  ];
  felder.forEach(function(f){
    if(f[1]==null||f[1]==="") return;
    t += '<tr><td>'+pbEsc(f[0])+'</td><td>'+pbEsc(f[1])+'</td></tr>';
  });
  t += '</table>';
  if(b){
    t += '<div class="pbRegel"><b>Regel: '+pbEsc(b.titel||"")+'</b> (Wert '+pbEsc(b.wert||"?")+', '+pbEsc(b.schluessel||b.id||"")+')<br>'
      + pbEsc(b.inhalt||"")
      + (b.quelle?('<br><i>Quelle: '+pbEsc(b.quelle)+'</i>'):'')
      + '</div>';
  }
  if(lk){
    t += '<div class="pbRegel pbLueckeBox"><b>Warum keine Note: '+pbEsc(lk.kurz)+'</b><br>'+pbEsc(lk.lang)+'</div>';
  }
  t += '</div>';
  return t;
}

function pbDetail(idx){
  var d=pbEl("pbD"+idx);
  if(d) d.style.display = (d.style.display==="none") ? "" : "none";
}

function pbFilter(f){
  PB_FILTER=f;
  ["alle","note","luecke"].forEach(function(k){
    var b=pbEl("pbF_"+k);
    if(b) b.className = (k===f) ? "pbFBtn aktiv" : "pbFBtn";
  });
  pbRender();
}

function pbRender(){
  var z=pbZaehler();
  pbEl("pbKopf").innerHTML=pbRiegelHtml(PB_RIEGEL)+pbKopfHtml(z);
  var t='<table class="pbTab"><thead><tr>'
    +'<th class="r" title="Reihenfolge auf dem Etikett">Nr</th>'
    +'<th title="Name, wie er am Produkt steht">Zutat (Etikett)</th>'
    +'<th class="r" title="Anteil laut Etikett">%</th>'
    +'<th title="Der Eintrag im Zutaten-Stamm, an dem die Regel hängt">Stammeintrag</th>'
    +'<th class="r" title="Note 0-10, vom Server aus dem Regelwerk">Note</th>'
    +'<th class="r" title="Vom Server als kritisch markiert">krit.</th>'
    +'<th title="Die Regel, die die Note begründet">Regel</th>'
    +'<th title="Warum keine Note da ist">Lücke</th>'
    +'</tr></thead><tbody>';
  var sichtbar=0;
  PB_ROWS.forEach(function(r,i){
    if(!pbSichtbar(r)) return;
    sichtbar++;
    t+=pbZeileHtml(r,i);
  });
  t+='</tbody></table>';
  if(!sichtbar) t='<div class="pbHinweis">Der Filter zeigt gerade keine Zeile. Auf „alle" umschalten.</div>';
  pbEl("pbTabelle").innerHTML=t;
  pbEl("pbZusatz").innerHTML=pbZusatzHtml();
}

function pbStatus(s){ pbEl("pbStatus").innerHTML=s?pbEsc(s):""; }

window.addEventListener("DOMContentLoaded", function(){
  var b=document.getElementById("pbBuild");
  if(b) b.textContent="Build "+PB_BUILD;
  var q=new URLSearchParams(location.search);
  pbEl("pbPid").value = q.get("p") || "P1809";
  pbEl("pbPid").addEventListener("keydown", function(e){ if(e.key==="Enter") pbLaden(); });
  pbLaden();
});
