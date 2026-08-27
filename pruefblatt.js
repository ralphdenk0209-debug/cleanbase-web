/* ============================================================================
   BEWERTUNGS-PRÜFBLATT · Testversion · 27.08.2026
   ----------------------------------------------------------------------------
   Ralph-Genehmigung 27.08.2026: darf ausdrücklich PARALLEL zur bestehenden
   Produkt-erfassen-Ansicht laufen. Bei positivem Entscheid ersetzt sie sie.

   WAS DIESE SEITE TUT: den Serverzustand der automatischen Zutatenbewertung
   je Produkt zeigen — eine Zeile je Zutat, Note, Regel, oder benannte Lücke.

   WAS SIE NICHT TUT (Kernvertrag B1, server_ssot): keine Note rechnen, keine
   Regel zuordnen, keinen Zustand erfinden. Seit 27.08. (Ralph: neuer Editor,
   anders und besser) hat sie AKTIONEN — aber ausschließlich über dieselben
   Serververträge wie der alte Editor (Work #81/#93/#309), nie eigene Logik.
   Grundregel des neuen Editors: JEDE Aktion endet mit einem kompletten
   Neuabruf vom Server und einem neuen Riegel-Lauf. Kein lokaler Zustand
   überlebt eine Aktion — das war die Fehlerklasse des alten Editors.
   Konzept: bereiche/konzept-automatische-zutatenbewertung.md
   ========================================================================== */

/* Dieselben Zugangsdaten wie app.js Zeile 1-2 (öffentlicher anon-Schlüssel).
   Gleicher storageKey wie app.js: die Admin-Anmeldung aus admin.html gilt
   damit auch hier — kein zweiter Anmeldeweg. */
/* Sichtbarer Build-Stempel. Steht im Seitenkopf, damit nie wieder ein alter
   Cache-Stand für den aktuellen gehalten wird (Falle A3, passiert 27.08.). */
var PB_BUILD = "PB-2026-08-27-15";
var PB_MODUS = "aufgaben";   /* 'aufgaben' (Standard) oder 'pruef' */
/* Gleicher Wert wie RIKI_LESE_MODELL in app.js Zeile 14746 — bei Modellwechsel
   dort UND hier ändern. */
var PB_RIKI_MODELL = "claude-sonnet-4-6";
var PB_PID = null;         /* zuletzt geladene Produkt-ID, für Aktionen */

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
var PB_WIRK = null;        /* cb_produkt_wirkstoff_liste_v2 */
var PB_WIRKH = {};         /* cb_produkt_wirkstoff_herkunft, je Nährstoff */
var PB_MIKRO = null;       /* cb_produkt_mikro_liste_v2 */
var PB_KOPF = null;        /* cb_produkt_edit_get: Kopf, Nährwerte, Score-Achsen */
var PB_OFFEN = null;       /* cb_admin_zutat_offen_mit_riki: gelesen, nicht zugeordnet */
var PB_RIEGEL_N = 10;      /* Zahl der Prüfungen im Riegel (aus RIEGEL.ANZAHL) */

function pbOffenListe(){ return RIEGEL.offeneZeilen(pbDaten()); }
var PB_ADMIN_TEXTE = true; /* wird false, wenn Regeltexte mangels Anmeldung fehlen */

function pbEsc(s){
  return String(s==null?"":s).replace(/[&<>"']/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}
function pbEl(id){ return document.getElementById(id); }

/* --- Lückentyp: kommt aus dem gemeinsamen Kern (riegel-kern.js) ------------
   Seit 27.08. steht die Logik NUR dort — dieselbe Datei nutzt auch der alte
   Editor. Eine Kopie hier wäre eine zweite Wahrheit (§A4.2). */
function pbLuecke(r){ return RIEGEL.luecke(r); }

/* Datenpaket im Format des Kerns, aus den bereits geladenen Antworten. */
function pbDaten(){
  return {pid:PB_PID, rows:PB_ROWS, kopf:PB_KOPF, offen:PB_OFFEN,
          zusatz:PB_ZUSATZ, wirk:PB_WIRK, wirkh:PB_WIRKH, mikro:PB_MIKRO};
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
/* --- VERIFIZIERUNGSRIEGEL ---------------------------------------------------
   Die zehn Prüfungen stehen seit 27.08. im gemeinsamen Kern riegel-kern.js,
   den auch der alte Editor lädt. Hier bleibt nur der Aufruf. */
async function pbRiegel(pid, rows){
  return await RIEGEL.pruefen(pbDaten(), pbClient);
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

/* --- Kopf & Quelle + Nährwerte: aus cb_produkt_edit_get, reine Anzeige ----- */
function pbProduktKopfHtml(){
  var k=PB_KOPF;
  if(!k || k.fehler)
    return '<div class="pbHinweis">Kopf und Nährwerte brauchen eine Admin-Anmeldung (über admin.html anmelden, dann neu laden)'+(k&&k.fehler?' — Serverantwort: '+pbEsc(k.fehler):'')+'.</div>';
  var t='<div class="pbProdukt">';
  t+='<div class="pbProduktName">'+pbEsc(k.name||'(ohne Name)')+'</div>';
  var teile=[];
  if(k.marke) teile.push(pbEsc(k.marke));
  if(k.kategorie) teile.push(pbEsc(k.kategorie)+(k.unterkategorie?' · '+pbEsc(k.unterkategorie):''));
  if(k.ean) teile.push('EAN '+pbEsc(k.ean)+(k.ean_ampel?' ('+pbEsc(k.ean_ampel)+')':''));
  teile.push(k.bio===true?'Bio':(k.bio===false?'kein Bio':'Bio ungeprüft'));
  if(k.status) teile.push(pbEsc(k.status));
  t+='<div class="pbProduktZeile">'+teile.join(' · ')+'</div>';
  if(k.beleg||k.produktlink)
    t+='<div class="pbZQuelle">Quelle: '+pbEsc(k.beleg||'')+(k.produktlink?' · '+pbEsc(k.produktlink):'')+'</div>';
  /* Score-Achsen — dieselben Zahlen, die der Server für den Root Index nutzt */
  t+='<div class="pbKacheln">'
    +'<div class="pbKachel'+(k.clean_score!=null?' gruen':'')+'"><b>'+(k.clean_score!=null?pbEsc(k.clean_score):'—')+'</b>Root Index (Server)'+(k.vollstaendig?'':' · unvollständig')+'</div>'
    +'<div class="pbKachel"><b>'+(k.p_zutaten!=null?pbEsc(k.p_zutaten):'—')+'</b>Achse Zutaten</div>'
    +'<div class="pbKachel"><b>'+(k.p_naehrwert!=null?pbEsc(k.p_naehrwert):'—')+'</b>Achse Nährwert</div>'
    +'<div class="pbKachel"><b>'+(k.p_zusatzstoffe!=null?pbEsc(k.p_zusatzstoffe):'—')+'</b>Achse Zusatzstoffe</div>'
    +'<div class="pbKachel"><b>'+(k.p_nova!=null?pbEsc(k.p_nova):'—')+'</b>Achse Verarbeitung</div>'
    +'</div>'
    +'<div class="pbAkt" style="margin-top:8px"><button onclick="pbKopfFormToggle()">Kopf bearbeiten …</button> '
    +(k.produktlink
       ? '<button onclick="pbQuelleNeuLesen(this)" title="Liest die hinterlegte Herstellerseite erneut (riki-herstellerseite). Ergebnis landet als Leseergebnis, nichts wird automatisch gebunden.">Quelle neu lesen …</button>'
       : '<span class="pbZQuelle">Kein Produktlink hinterlegt — ohne Quelle kein neuer Lesevorgang.</span>')
    +'</div>'
    +'<div id="pbQuelleMsg" class="pbZQuelle"></div>'
    +'<div id="pbKopfForm" style="display:none"></div>'
    +'</div>';
  return t;
}

/* Etappe 3: Kopf bearbeiten über die neue Feldtür cb_admin_produkt_kopf_setzen.
   Gesendet werden NUR geänderte Felder; Bio läuft über die eigene Tür. */
function pbKopfFormToggle(){
  var box=pbEl("pbKopfForm"); if(!box||!PB_KOPF||PB_KOPF.fehler) return;
  if(box.style.display!=="none"){ box.style.display="none"; return; }
  var k=PB_KOPF;
  function feld(id,lab,val){ return '<label style="display:block;margin:4px 0">'+lab
    +': <input id="'+id+'" value="'+pbEsc(val==null?'':val)+'" style="width:280px" spellcheck="false"></label>'; }
  box.innerHTML=feld('pbKfName','Produktname',k.name)+feld('pbKfMarke','Marke',k.marke)
    +feld('pbKfKat','Kategorie',k.kategorie)+feld('pbKfUkat','Unterkategorie',k.unterkategorie)
    +'<label style="display:block;margin:4px 0">Bio: <select id="pbKfBio">'
      +'<option value="null"'+(k.bio==null?' selected':'')+'>ungeprüft</option>'
      +'<option value="true"'+(k.bio===true?' selected':'')+'>ja</option>'
      +'<option value="false"'+(k.bio===false?' selected':'')+'>nein</option></select></label>'
    +'<div class="pbAkt"><button onclick="pbKopfSpeichern(this)">Speichern</button> '
    +'<button onclick="pbKopfFormToggle()">Abbrechen</button></div>'
    +'<div id="pbKfMsg" class="pbZQuelle"></div>';
  box.style.display="block";
}
async function pbKopfSpeichern(btn){
  var k=PB_KOPF, patch={}, msg=pbEl("pbKfMsg");
  function nimm(id, key, alt){
    var v=(pbEl(id).value||"").trim();
    if(v!==String(alt==null?'':alt).trim()) patch[key]=v;
  }
  nimm('pbKfName','name',k.name); nimm('pbKfMarke','marke',k.marke);
  nimm('pbKfKat','kategorie',k.kategorie); nimm('pbKfUkat','unterkategorie',k.unterkategorie);
  var bioNeu=pbEl('pbKfBio').value, bioAlt=(k.bio==null?'null':String(k.bio));
  if(!Object.keys(patch).length && bioNeu===bioAlt){ if(msg) msg.textContent="Nichts geändert."; return; }
  if(btn) btn.disabled=true; if(msg) msg.textContent="speichere …";
  try{
    if(Object.keys(patch).length){
      var r=await pbClient.rpc("cb_admin_produkt_kopf_setzen",{p_id:PB_PID, p:patch});
      if(r.error) throw r.error;
    }
    if(bioNeu!==bioAlt && bioNeu!=='null'){
      var rb=await pbClient.rpc("cb_produkt_bio_setzen",{p_id:PB_PID, p_bio:(bioNeu==='true'), p_quelle:'Prüfblatt (Admin)'});
      if(rb.error) throw rb.error;
    }
    await pbLaden();
  }catch(e){ if(msg) msg.textContent="Fehlgeschlagen: "+(e.message||e); if(btn) btn.disabled=false; }
}

var PB_NW_FELDER=[
  ["kcal","Energie","kcal"],["fett","Fett","g"],["ges_fett","· davon gesättigt","g"],
  ["einfach_unges","· einfach ungesättigt","g"],["mehrfach_unges","· mehrfach ungesättigt","g"],
  ["transfette","· Transfette","g"],["kh","Kohlenhydrate","g"],["zucker","· davon Zucker","g"],
  ["polyole","· Polyole","g"],["ballaststoffe","Ballaststoffe","g"],["protein","Eiweiß","g"],["salz","Salz","g"]];
function pbNaehrwertHtml(){
  var k=PB_KOPF;
  var t='<div class="pbZQuelle">je '+pbEsc((k&&k.basis)||'100g')+' · aus cb_produkt_edit_get</div>';
  if(!k || k.fehler)
    return '<div class="pbHinweis">Nährwerte brauchen eine Admin-Anmeldung (über admin.html anmelden, dann neu laden).</div>';
  var nw=k.naehrwerte||{};
  var ops=nw.operatoren||{};
  var alleLeer=PB_NW_FELDER.every(function(f){ return nw[f[0]]==null; });
  if(alleLeer)
    return t+'<div class="pbZStatus gelb">Keine Nährwerte erfasst — die Nährwert-Achse des Scores bleibt dadurch leer.</div>';
  t+='<table class="pbTab pbNwTab"><tbody>';
  PB_NW_FELDER.forEach(function(f){
    var wert=nw[f[0]];
    var leer=(wert==null);
    if(leer && f[0]==='ballaststoffe' && nw.ballast_nichtdekl)
      { t+='<tr><td>'+f[1]+'</td><td class="r"><i>nicht deklariert (bestätigt)</i></td></tr>'; return; }
    t+='<tr'+(leer?' class="pbNwLeer"':'')+'><td>'+f[1]+'</td><td class="r">'
      +(leer?'—':pbEsc((ops[f[0]]?ops[f[0]]+' ':'')+wert)+' '+f[2])+'</td></tr>';
  });
  t+='</tbody></table>';
  t+='<div class="pbAkt" style="margin-top:6px"><button onclick="pbNwFormToggle()">Nährwerte bearbeiten …</button></div>'
    +'<div id="pbNwForm" style="display:none"></div>';
  return t;
}

/* Bestandsprodukt neu lesen lassen (Ralph 27.08.: "wie soll ich diese nochmal
   laufen lassen?"). Nutzt die vorhandene Edge-Function riki-herstellerseite —
   derselbe Vertrag wie Editor, Dashboard und Import. Das Ergebnis ist ein
   Leseergebnis: es wird nichts automatisch gebunden und nichts überschrieben;
   neue Zeilen erscheinen als Aufgaben. */
async function pbQuelleNeuLesen(btn){
  var k=(PB_KOPF&&!PB_KOPF.fehler)?PB_KOPF:null, msg=pbEl("pbQuelleMsg");
  if(!k||!k.produktlink) return;
  if(!confirm('Herstellerseite neu lesen?\n\n'+k.produktlink
    +'\n\nRiki liest die Seite und legt das Ergebnis als Leseergebnis ab.\n'
    +'Es wird NICHTS automatisch gebunden und nichts überschrieben — neue Zeilen erscheinen als Aufgabe.')) return;
  if(btn) btn.disabled=true;
  if(msg) msg.textContent="Riki liest die Herstellerseite … das dauert meist 1–2 Minuten.";
  try{
    var s=await pbClient.auth.getSession();
    var tok=s&&s.data&&s.data.session&&s.data.session.access_token;
    if(!tok) throw new Error("Nicht angemeldet.");
    var r=await fetch(PB_URL+"/functions/v1/riki-herstellerseite",{method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+tok,"apikey":PB_KEY},
      body:JSON.stringify({url:k.produktlink, product_id:PB_PID})});
    var d=await r.json();
    if(!r.ok||d.error) throw new Error(d.error||("HTTP "+r.status));
    if(msg) msg.textContent="✓ gelesen — Seite wird neu gemessen.";
    await pbLaden();
  }catch(e){
    if(msg) msg.textContent="Lesen fehlgeschlagen: "+(e.message||e);
    if(btn) btn.disabled=false;
  }
}

/* Etappe 3: Nährwerte bearbeiten. ⚠ Die Server-Tür cb_produkt_naehrwerte_setzen
   setzt die 9 Kernfelder IMMER (fehlender Schlüssel = NULL). Deshalb schickt
   das Formular stets ALLE Kernfelder, vorbefüllt aus dem Serverstand; die drei
   Fettsäurefelder sind serverseitig schlüsselgeprüft und gehen nur mit, wenn
   befüllt. Leeres Feld heißt ausdrücklich: keine Angabe. */
var PB_NW_KERN=["kcal","fett","ges_fett","kh","zucker","polyole","ballaststoffe","protein","salz"];
var PB_NW_FETT=["einfach_unges","mehrfach_unges","transfette"];
function pbNwFormToggle(){
  var box=pbEl("pbNwForm"); if(!box||!PB_KOPF||PB_KOPF.fehler) return;
  if(box.style.display!=="none"){ box.style.display="none"; return; }
  var nw=(PB_KOPF.naehrwerte)||{};
  box.innerHTML=PB_NW_FELDER.map(function(f){
    return '<label style="display:block;margin:3px 0">'+f[1]
      +': <input id="pbNw_'+f[0]+'" value="'+pbEsc(nw[f[0]]==null?'':nw[f[0]])+'" style="width:110px" inputmode="decimal"> '+f[2]+'</label>';
  }).join('')
  +'<label style="display:block;margin:6px 0"><input type="checkbox" id="pbNw_bnd"'+(nw.ballast_nichtdekl?' checked':'')+'> Ballaststoffe laut Etikett nicht deklariert</label>'
  +'<div class="pbAkt"><button onclick="pbNwSpeichern(this)">Speichern</button> '
  +'<button onclick="pbNwFormToggle()">Abbrechen</button></div>'
  +'<div id="pbNwMsg" class="pbZQuelle"></div>';
  box.style.display="block";
}
async function pbNwSpeichern(btn){
  var msg=pbEl("pbNwMsg");
  var payload={}, leere=[];
  PB_NW_KERN.forEach(function(key){
    var v=(pbEl("pbNw_"+key).value||"").trim().replace(",",".");
    if(v==="") leere.push(key); else payload[key]=v;
  });
  /* KORREKTUR 27.08. (Selbstprüfung vor Freigabe): vorher gingen die drei
     Fettsäurefelder nur mit, wenn sie befüllt waren. Wer einen Wert LÖSCHEN
     wollte, konnte das nicht — der Server behält bei fehlendem Schlüssel den
     alten Wert. Jetzt gehen sie mit, sobald das Feld vorher einen Wert hatte:
     leer heißt dann ausdrücklich "keine Angabe". */
  var nwAlt=((PB_KOPF&&PB_KOPF.naehrwerte)||{});
  PB_NW_FETT.forEach(function(key){
    var v=(pbEl("pbNw_"+key).value||"").trim().replace(",",".");
    if(v!=="") payload[key]=v;
    else if(nwAlt[key]!=null){ payload[key]=null; leere.push(key); }
  });
  if(leere.length && !confirm("Diese Felder sind leer und werden als KEINE ANGABE gespeichert:\n\n"
    +leere.join(", ")+"\n\nFortfahren?")) return;
  if(btn) btn.disabled=true; if(msg) msg.textContent="speichere …";
  try{
    var r=await pbClient.rpc("cb_produkt_naehrwerte_setzen",{p_id:PB_PID, p:payload});
    if(r.error) throw r.error;
    var altFlag=!!((PB_KOPF.naehrwerte||{}).ballast_nichtdekl), neuFlag=!!pbEl("pbNw_bnd").checked;
    if(altFlag!==neuFlag){
      var rf=await pbClient.rpc("cb_produkt_ballast_nichtdekl_setzen",{p_id:PB_PID, p_flag:neuFlag});
      if(rf.error) throw rf.error;
    }
    await pbLaden();
  }catch(e){ if(msg) msg.textContent="Fehlgeschlagen: "+(e.message||e); if(btn) btn.disabled=false; }
}

/* --- Vom Etikett gelesen, noch nicht zugeordnet ---------------------------- */
function pbOffenHtml(){
  var t='<h2 class="pbH2">Vom Etikett gelesen, noch nicht zugeordnet <span class="pbH2n">· aus cb_admin_zutat_offen_mit_riki</span></h2>';
  if(!PB_OFFEN || PB_OFFEN.fehler)
    return t+'<div class="pbHinweis">Liste braucht Admin-Anmeldung'+(PB_OFFEN&&PB_OFFEN.fehler?' — Serverantwort: '+pbEsc(PB_OFFEN.fehler):'')+'.</div>';
  var offen=pbOffenListe();
  var erledigt=PB_OFFEN.length-offen.length;
  if(!PB_OFFEN.length)
    return t+'<div class="pbZStatus gruen">Keine offenen Etikettzeilen — alles Gelesene ist zugeordnet oder entschieden.</div>';
  if(!offen.length)
    return t+'<div class="pbZStatus gruen">'+PB_OFFEN.length+' gelesene Zeile(n), alle zugeordnet oder manuell entschieden.</div>';
  t+='<table class="pbTab"><thead><tr><th>Gelesener Text</th><th>Quelle</th><th>Stand</th><th>Riki-Kandidat</th><th>Aktion</th></tr></thead><tbody>';
  offen.forEach(function(o){
    var iid=o.item_id;
    t+='<tr class="pbRot"><td>'+pbEsc(o.zutat_text||'—')+'</td>'
      +'<td>'+pbEsc(o.quelle||'—')+(o.gesehen_am?(' · '+pbEsc(String(o.gesehen_am).slice(0,10))):'')+'</td>'
      +'<td>'+pbEsc(o.extraction_status||'—')+'</td>'
      +'<td>'+(o.canonical_name?pbEsc(o.canonical_name)+(o.proposed_rating!=null?' (Vorschlag Note '+pbEsc(o.proposed_rating)+')':''):'—')+'</td>'
      +'<td class="pbAkt">'
        +'<button onclick="pbOffKandidaten('+iid+')" title="Stamm-Kandidaten vom Server holen und per Klick als Zutat binden">Kandidaten</button> '
        +'<button onclick="pbOffRiki('+iid+',this)" title="Riki zerlegt, der Server löst den Stammeintrag auf, Riki bewertet nur mit Regelbeleg, der Vorschlag geht an den Wächter">Riki einstufen</button> '
        +'<button onclick="pbOffZerlegt('+iid+',this)" title="Die Zeile ist zerlegt: ihre Bestandteile stehen als eigene Zutaten am Produkt">✓ ist zerlegt</button> '
        +'<button onclick="pbOffKeineZutat('+iid+',this)" title="Keine eigene Zutat — mit Pflichtbegründung">keine Zutat …</button>'
      +'</td></tr>'
      +'<tr><td colspan="5"><div id="pbKand'+iid+'"></div><div id="pbOffMsg'+iid+'" class="pbZQuelle"></div></td></tr>';
  });
  t+='</tbody></table>';
  if(erledigt>0) t+='<div class="pbZQuelle">'+erledigt+' weitere gelesene Zeile(n) sind zugeordnet oder manuell entschieden.</div>';
  return t;
}

/* --- Aktionen an offenen Etikettzeilen -------------------------------------
   Jede Aktion ruft NUR bestehende Serververträge (dieselben wie der alte
   Editor, Work #81/#93/#309) und endet mit pbLaden(): kompletter Neuabruf,
   Riegel läuft neu. Kein lokaler Zustand überlebt eine Aktion. */
function pbOffMsg(iid, txt){ var m=pbEl("pbOffMsg"+iid); if(m) m.textContent=txt||""; }
function pbOffItem(iid){
  return (Array.isArray(PB_OFFEN)?PB_OFFEN:[]).find(function(o){ return String(o.item_id)===String(iid); })||null;
}

async function pbOffKandidaten(iid){
  var o=pbOffItem(iid), box=pbEl("pbKand"+iid);
  if(!o||!box) return;
  box.innerHTML='Suche Stamm-Kandidaten …';
  try{
    var r=await pbClient.rpc("cb_admin_zutat_zeile_bearbeiten",{p_zutat_text:o.zutat_text});
    if(r.error) throw r.error;
    var ks=(r.data&&r.data.kandidaten)||[];
    var bindbar=ks.filter(function(k){ return k.bindbar && k.entity_id; });
    if(!bindbar.length){ box.innerHTML='<span class="gelbT">Kein bindbarer Stamm-Kandidat. Wege: Riki einstufen, oder im alten Editor neu anlegen.</span>'; return; }
    box.innerHTML='Klick bindet als eigene Zutat an '+pbEsc(PB_PID)+': '+bindbar.map(function(k){
      var name=k.name||k.stammname||k.canonical_name||k.zutat_text||k.zutat_id||"?";
      return '<button onclick="pbOffBinden(\''+pbEsc(String(k.entity_id))+'\','+iid+',this)">'
        +pbEsc(name)+(k.regel_titel?(' · '+pbEsc(k.regel_titel)):'')+'</button>';
    }).join(' ');
  }catch(e){ box.innerHTML='<span class="gelbT">Kandidatensuche fehlgeschlagen: '+pbEsc(e.message||e)+'</span>'; }
}

async function pbOffBinden(entityId, iid, btn){
  if(btn) btn.disabled=true;
  pbOffMsg(iid,"binde …");
  try{
    var r=await pbClient.rpc("cb_admin_canonical_zutat_binden",{p_produkt_id:PB_PID, p_entity_id:entityId});
    if(r.error) throw r.error;
    await pbLaden();
  }catch(e){ pbOffMsg(iid,"Binden fehlgeschlagen: "+(e.message||e)); if(btn) btn.disabled=false; }
}

async function pbOffZerlegt(iid, btn){
  var o=pbOffItem(iid); if(!o) return;
  var gebunden=PB_ROWS.map(function(r){
    return '  · '+(r.canonical_name||r.sichtbarer_name||'?')+(r.resolved_rating!=null?('  Note '+r.resolved_rating):'  Note offen');
  }).join('\n');
  if(!confirm('"'+(o.zutat_text||'')+'" als ZERLEGT abschließen?\n\nDie Zeile wird keine eigene Produktzutat - ihre Bestandteile sind es.\n\nAm Produkt stehen laut Server:\n'+(gebunden||'  (keine Zeile)')+'\n\nWiderrufbar im alten Editor.')) return;
  if(btn) btn.disabled=true;
  /* Wie im alten Editor (27.08.): ohne Klammerrolle blockt der Serverriegel.
     Fehlt sie, läuft erst die Riki-Zerlegung, dann der Abschluss. */
  if(!o.parenthetical_role){
    pbOffMsg(iid,"Klammerrolle fehlt – Riki zerlegt die Zeile zuerst …");
    try{
      var s=await pbClient.auth.getSession();
      var tok=s&&s.data&&s.data.session&&s.data.session.access_token;
      if(!tok) throw new Error("Nicht angemeldet.");
      var resp=await fetch(PB_URL+"/functions/v1/riki-analyse",{method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+tok,"apikey":PB_KEY},
        body:JSON.stringify({modus:"zutaten", modell:PB_RIKI_MODELL, text:String(o.zutat_text||""), produkt_id:PB_PID})});
      var dd=await resp.json();
      if(!resp.ok||dd.error) throw new Error(dd.error||("HTTP "+resp.status));
      var zt=(dd.vorschlag&&Array.isArray(dd.vorschlag.zutaten)&&dd.vorschlag.zutaten[0])||null;
      if(!zt||!zt.parenthetical_role) throw new Error("keine Klammerrolle bestimmbar");
      var rs=await pbClient.rpc("cb_riki_zutat_offen_struktur_speichern",{
        p_item_id:Number(iid), p_base_ingredient:zt.base_ingredient||zt.name||null,
        p_processing_modifiers:Array.isArray(zt.processing_modifiers)?zt.processing_modifiers:null,
        p_attributes:zt.attributes||null, p_parenthetical_role:zt.parenthetical_role,
        p_parenthetical_items:Array.isArray(zt.parenthetical_items)?zt.parenthetical_items:null,
        p_confidence:null, p_extraction_status:"extracted"});
      if(rs.error) throw rs.error;
    }catch(e){
      pbOffMsg(iid,"Riki konnte die Klammerrolle nicht bestimmen ("+(e.message||e)+"). Weg: „Riki einstufen“ oder „keine Zutat …“ mit eigener Begründung.");
      if(btn) btn.disabled=false; return;
    }
  }
  pbOffMsg(iid,"speichere Entscheid …");
  try{
    var r=await pbClient.rpc("cb_source_extraction_item_keine_eigene_zutat_setzen",
      {p_item_id:Number(iid), p_reason:"Zusammengesetzte Zeile - in ihre Bestandteile zerlegt, diese sind als eigene Zutaten gebunden.", p_parenthetical_item:null});
    if(r.error) throw r.error;
    await pbLaden();
  }catch(e){ pbOffMsg(iid,"Fehlgeschlagen: "+(e.message||e)); if(btn) btn.disabled=false; }
}

async function pbOffKeineZutat(iid, btn){
  var o=pbOffItem(iid); if(!o) return;
  var grund=prompt('"'+(o.zutat_text||'')+'" wird KEINE eigene Produktzutat.\n\nWarum? (Pflicht)');
  if(grund===null) return;
  grund=String(grund).trim();
  if(!grund){ pbOffMsg(iid,"Ohne Begründung kein Entscheid."); return; }
  if(btn) btn.disabled=true; pbOffMsg(iid,"speichere Entscheid …");
  try{
    var r=await pbClient.rpc("cb_source_extraction_item_keine_eigene_zutat_setzen",
      {p_item_id:Number(iid), p_reason:grund, p_parenthetical_item:null});
    if(r.error) throw r.error;
    await pbLaden();
  }catch(e){ pbOffMsg(iid,"Fehlgeschlagen: "+(e.message||e)); if(btn) btn.disabled=false; }
}

/* Riki-Kette: zerlegen (falls Struktur fehlt) → auflösen → regelbasiert
   bewerten → Vorschlag speichern. Identische Verträge wie der alte Editor. */
async function pbOffRiki(iid, btn){
  var o=pbOffItem(iid); if(!o) return;
  if(btn) btn.disabled=true;
  try{
    var s=await pbClient.auth.getSession();
    var tok=s&&s.data&&s.data.session&&s.data.session.access_token;
    if(!tok) throw new Error("Nicht angemeldet (über admin.html anmelden).");
    if(!o.base_ingredient){
      pbOffMsg(iid,"1/4 Riki zerlegt …");
      var resp=await fetch(PB_URL+"/functions/v1/riki-analyse",{method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+tok,"apikey":PB_KEY},
        body:JSON.stringify({modus:"zutaten", modell:PB_RIKI_MODELL, text:String(o.zutat_text||""), produkt_id:PB_PID})});
      var d=await resp.json();
      if(!resp.ok||d.error) throw new Error(d.error||("HTTP "+resp.status));
      var zt=(d.vorschlag&&Array.isArray(d.vorschlag.zutaten)&&d.vorschlag.zutaten[0])||null;
      if(!zt) throw new Error("Riki hat keine Zutat geliefert.");
      var rs=await pbClient.rpc("cb_riki_zutat_offen_struktur_speichern",{
        p_item_id:Number(iid), p_base_ingredient:zt.base_ingredient||zt.name||null,
        p_processing_modifiers:Array.isArray(zt.processing_modifiers)?zt.processing_modifiers:null,
        p_attributes:zt.attributes||null, p_parenthetical_role:zt.parenthetical_role||null,
        p_parenthetical_items:Array.isArray(zt.parenthetical_items)?zt.parenthetical_items:null,
        p_confidence:null, p_extraction_status:"extracted"});
      if(rs.error) throw rs.error;
      o=Object.assign({}, o, {base_ingredient:(zt.base_ingredient||zt.name||null),
        processing_modifiers:zt.processing_modifiers||null, attributes:zt.attributes||null,
        parenthetical_role:zt.parenthetical_role||null});
    }
    pbOffMsg(iid,"2/4 Canonical wird aufgelöst …");
    var r1=await pbClient.rpc("cb_riki_ingredient_resolution_erheben",{p_item_id:Number(iid)});
    if(r1.error) throw r1.error;
    var res=r1.data||{};
    if(res.status!=="resolved"){
      pbOffMsg(iid,"Auflösung: "+String(res.status||"?")+" — "+String(res.reason||"")+" Bleibt sichtbar offen.");
      await pbLaden(); return;
    }
    pbOffMsg(iid,"3/4 Riki bewertet nach aktivem Regelwerk …");
    var resp2=await fetch(PB_URL+"/functions/v1/riki-analyse",{method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+tok,"apikey":PB_KEY},
      body:JSON.stringify({modus:"bewerten", modell:PB_RIKI_MODELL,
        name:String(o.base_ingredient||o.zutat_text||""),
        struktur:{processing_modifiers:o.processing_modifiers||null, attributes:o.attributes||null,
                  parenthetical_role:o.parenthetical_role||null},
        produkt_id:PB_PID})});
    var d2=await resp2.json();
    if(!resp2.ok||d2.error) throw new Error(d2.error||("HTTP "+resp2.status));
    var bw=(d2.vorschlag&&typeof d2.vorschlag==="object")?d2.vorschlag:null;
    if(!bw || bw.status!=="proposed" || !bw.regel_id || bw.rating==null){
      pbOffMsg(iid,"Keine anwendbare Regel — es wird KEIN Wert erfunden. "+String((bw&&bw.begruendung)||""));
      await pbLaden(); return;
    }
    pbOffMsg(iid,"4/4 Vorschlag wird gespeichert …");
    var r2=await pbClient.rpc("cb_riki_ingredient_assessment_speichern",{
      p_item_id:Number(iid), p_target_entity_id:res.entity_id,
      p_rule_id:String(bw.regel_id), p_rating:Number(bw.rating),
      p_confidence:String(bw.confidence||"mittel"), p_rationale:String(bw.begruendung||""),
      p_status:"proposed"});
    if(r2.error) throw r2.error;
    await pbLaden();
  }catch(e){
    pbOffMsg(iid,"Kette abgebrochen: "+(e.message||e));
    if(btn) btn.disabled=false;
  }
}

/* --- Wirkstoffe & Mikronährstoffe: dritte Achse, reine Anzeige ------------- */
var PB_HERKUNFT = {
  zugesetzt:  ["gelbT","⊕ zugesetzt (isolierte Zutat)"],
  aus_matrix: ["gruenT","aus den Lebensmittelzutaten"],
  unbekannt:  ["gelbT","? nicht bestimmbar"] };
function pbWirkHtml(){
  var t='<h2 class="pbH2">Wirkstoffe <span class="pbH2n">· deklarierte Mengen aus cb_produkt_wirkstoff_liste_v2, Herkunft aus cb_produkt_wirkstoff_herkunft</span></h2>';
  if(!PB_WIRK || PB_WIRK.fehler)
    return t+'<div class="pbHinweis">Wirkstoffe konnten gerade nicht geladen werden'+(PB_WIRK&&PB_WIRK.fehler?': '+pbEsc(PB_WIRK.fehler):'')+'.</div>';
  if(!PB_WIRK.length)
    t+='<div class="pbZStatus blau">Keine Wirkstoffe deklariert.</div>';
  else{
    t+='<table class="pbTab"><thead><tr><th>Nährstoff</th><th class="r">Menge je Portion/100</th><th class="r">% NRV</th><th>Herkunft</th><th>Beleg-Zutat</th></tr></thead><tbody>';
    PB_WIRK.forEach(function(w){
      var h=PB_WIRKH[w.naehrstoff];
      var hk=h?(PB_HERKUNFT[h.herkunft]||["gelbT",h.herkunft]):["","—"];
      t+='<tr><td>'+pbEsc(w.naehrstoff)+'</td>'
        +'<td class="r">'+pbEsc((w.operator?w.operator+' ':'')+(w.menge!=null?w.menge:'—'))+' '+pbEsc(w.einheit||'')+'</td>'
        +'<td class="r">'+(w.prozent_nrv!=null?pbEsc(w.prozent_nrv)+' %':'—')+'</td>'
        +'<td><span class="'+hk[0]+'">'+pbEsc(hk[1])+'</span></td>'
        +'<td>'+pbEsc(h&&h.beleg_zutat?h.beleg_zutat:'')+'</td></tr>';
    });
    t+='</tbody></table>';
  }
  t+='<h2 class="pbH2">Mikronährstoffe <span class="pbH2n">· aus cb_produkt_mikro_liste_v2</span></h2>';
  if(!PB_MIKRO || PB_MIKRO.fehler)
    return t+'<div class="pbHinweis">Mikronährstoffe konnten gerade nicht geladen werden'+(PB_MIKRO&&PB_MIKRO.fehler?': '+pbEsc(PB_MIKRO.fehler):'')+'.</div>';
  if(!PB_MIKRO.length)
    return t+'<div class="pbZStatus blau">Keine Mikronährstoff-Einträge — bei Supplements läuft die Deklaration über die Wirkstoffliste oben.</div>';
  t+='<table class="pbTab"><thead><tr><th>Nährstoff</th><th class="r">Menge /100</th><th>Form</th><th>Herkunft</th><th>Quelle</th></tr></thead><tbody>';
  PB_MIKRO.forEach(function(m){
    t+='<tr><td>'+pbEsc(m.anzeige||m.naehrstoff)+'</td>'
      +'<td class="r">'+pbEsc((m.operator?m.operator+' ':'')+(m.menge_100g!=null?m.menge_100g:'—'))+' '+pbEsc(m.einheit||'')+'</td>'
      +'<td>'+pbEsc(m.form||'—')+'</td><td>'+pbEsc(m.herkunft||'—')+'</td><td>'+pbEsc(m.quelle||'—')+'</td></tr>';
  });
  return t+'</tbody></table>';
}

/* --- Laden ----------------------------------------------------------------- */
async function pbLaden(){
  var pid=(pbEl("pbPid").value||"").trim();
  if(!pid){ pbStatus("Bitte eine Produkt-ID eingeben, z. B. P1809."); return; }
  PB_PID=pid;
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
      var rk=await pbClient.rpc("cb_produkt_edit_get",{p_id:pid});
      if(rk.error) throw rk.error;
      PB_KOPF=rk.data||null;
    }catch(ek){ PB_KOPF={fehler:String(ek.message||ek)}; }
    try{
      var ro=await pbClient.rpc("cb_admin_zutat_offen_mit_riki",{p_product_id:pid});
      if(ro.error) throw ro.error;
      PB_OFFEN=ro.data||[];
    }catch(eo){ PB_OFFEN={fehler:String(eo.message||eo)}; }
    try{
      var rz=await pbClient.rpc("cb_app_produkt_zusatzstoffe",{p_produkt_id:pid});
      if(rz.error) throw rz.error;
      PB_ZUSATZ=rz.data||null;
    }catch(ez){ PB_ZUSATZ={fehler:String(ez.message||ez)}; }
    try{
      var rw=await pbClient.rpc("cb_produkt_wirkstoff_liste_v2",{p_id:pid});
      if(rw.error) throw rw.error;
      PB_WIRK=rw.data||[];
      PB_WIRKH={};
      var rh=await pbClient.rpc("cb_produkt_wirkstoff_herkunft",{p_id:pid});
      if(!rh.error) (rh.data||[]).forEach(function(h){ PB_WIRKH[h.naehrstoff]=h; });
    }catch(ew){ PB_WIRK={fehler:String(ew.message||ew)}; }
    try{
      var rm=await pbClient.rpc("cb_produkt_mikro_liste_v2",{p_id:pid});
      if(rm.error) throw rm.error;
      PB_MIKRO=rm.data||[];
    }catch(em){ PB_MIKRO={fehler:String(em.message||em)}; }
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
  var offen = pbOffenListe().length;
  var voll = (z.mit+z.l0===z.n) && offen===0;
  return '<div class="pbKacheln">'
    +'<div class="pbKachel'+(voll?' gruen':'')+'"><b>'+z.mit+' / '+z.n+'</b>Note + Regelbeleg ('+deck+' %)</div>'
    +'<div class="pbKachel'+(offen?' rot':'')+'"><b>'+offen+'</b>vom Etikett gelesen, nicht zugeordnet</div>'
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
  /* Etappe 2: zeilengenaue Aktion. Löschen verlangt serverseitig einen Grund
     (mind. 8 Zeichen) und sichert die Zeile im Audit — der Riegel misst danach neu. */
  t += '<div class="pbAkt" style="margin-top:8px">'
    +'<button onclick="pbZeileLoeschen(\''+pbEsc(String(r.produkt_zutat_id||""))+'\',\''+pbEsc(String(r.sichtbarer_name||""))+'\',this)" '
    +'title="Entfernt genau diese eine Zeile. Pflichtgrund, Sicherung im Audit, danach Vollmessung. Für Zwillingszeilen gedacht.">Zeile löschen …</button></div>';
  t += '</div>';
  return t;
}

async function pbZeileLoeschen(pzid, name, btn){
  if(!pzid) return;
  var grund=prompt('Zeile "'+name+'" ('+pzid+') wirklich entfernen?\n\nGrund (Pflicht, mind. 8 Zeichen — z. B. "Zwillingszeile zu <Name>, Etikett-Doppelerfassung"):');
  if(grund===null) return;
  grund=String(grund).trim();
  if(grund.length<8){ alert("Ohne tragfähigen Grund kein Löschen (mind. 8 Zeichen)."); return; }
  if(!confirm('Letzte Kontrolle:\n\n"'+name+'" ('+pzid+') wird gelöscht.\nGrund: '+grund+'\n\nDie Zeile wird im Audit gesichert. Fortfahren?')) return;
  if(btn) btn.disabled=true;
  try{
    var r=await pbClient.rpc("cb_admin_produkt_zutat_zeile_loeschen",{p_produkt_zutat_id:pzid, p_grund:grund});
    if(r.error) throw r.error;
    await pbLaden();
  }catch(e){ alert("Löschen fehlgeschlagen: "+(e.message||e)); if(btn) btn.disabled=false; }
}

/* Etappe 2: Zutat aus dem Stamm hinzufügen — Suche über den Server-Vorschlagsweg,
   Klick bindet über cb_admin_canonical_zutat_binden, danach Vollmessung. */
async function pbStammSuchen(){
  var txt=(pbEl("pbSuchIn").value||"").trim(), box=pbEl("pbSuchErg");
  if(!txt||!box) return;
  box.innerHTML='Suche im Stamm …';
  try{
    var r=await pbClient.rpc("cb_admin_zutat_zeile_bearbeiten",{p_zutat_text:txt});
    if(r.error) throw r.error;
    var ks=((r.data&&r.data.kandidaten)||[]).filter(function(k){ return k.bindbar && k.entity_id; });
    if(!ks.length){ box.innerHTML='<span class="gelbT">Kein bindbarer Stammeintrag zu "'+pbEsc(txt)+'".</span>'; return; }
    box.innerHTML='Klick bindet als eigene Zutat an '+pbEsc(PB_PID)+': '+ks.map(function(k){
      var name=k.name||k.stammname||k.canonical_name||k.zutat_text||k.zutat_id||"?";
      return '<button onclick="pbStammBinden(\''+pbEsc(String(k.entity_id))+'\',this)">'+pbEsc(name)
        +(k.regel_titel?(' · '+pbEsc(k.regel_titel)):'')+'</button>';
    }).join(' ');
  }catch(e){ box.innerHTML='<span class="gelbT">Suche fehlgeschlagen: '+pbEsc(e.message||e)+'</span>'; }
}
async function pbStammBinden(entityId, btn){
  if(btn) btn.disabled=true;
  try{
    var r=await pbClient.rpc("cb_admin_canonical_zutat_binden",{p_produkt_id:PB_PID, p_entity_id:entityId});
    if(r.error) throw r.error;
    pbEl("pbSuchErg").innerHTML=""; pbEl("pbSuchIn").value="";
    await pbLaden();
  }catch(e){ alert("Binden fehlgeschlagen: "+(e.message||e)); if(btn) btn.disabled=false; }
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

/* Kopfleiste: Name, Root Index, Riegel-Ampel, Stations-Status — alles aus den
   frisch geladenen Serverantworten, nichts gemerkt. */
function pbTopSync(z){
  var k=(PB_KOPF && !PB_KOPF.fehler) ? PB_KOPF : null;
  var name=pbEl("pbTopName"); if(name) name.textContent = k ? (k.name||"(ohne Name)") : (PB_PID||"—");
  var sc=pbEl("pbTopScore");
  if(sc) sc.innerHTML='<b>'+(k&&k.clean_score!=null?pbEsc(k.clean_score):'—')+'</b><small>Root Index</small>';
  var rg=pbEl("pbTopRiegel");
  if(rg){
    var ok = Array.isArray(PB_RIEGEL) && PB_RIEGEL.length===0;
    rg.className='pbTopChip '+(Array.isArray(PB_RIEGEL)?(ok?'gruen':'rot'):'');
    rg.innerHTML='<b>'+(Array.isArray(PB_RIEGEL)?(ok?'✓ '+PB_RIEGEL_N+'/'+PB_RIEGEL_N:('✗ '+PB_RIEGEL.length)):'—')+'</b><small>Riegel</small>';
  }
  var s1=pbEl("pbStat1");
  if(s1){ var ok1 = k && k.name && k.kategorie;
    s1.textContent = k ? (ok1?('erfüllt · '+k.kategorie):'unvollständig') : '—';
    s1.className = k ? (ok1?'ok':'warn') : ''; }
  var s2=pbEl("pbStat2");
  if(s2){
    var nw=(k&&k.naehrwerte)||{};
    var leer=PB_NW_FELDER.every(function(f){ return nw[f[0]]==null; });
    s2.textContent = k ? (leer?'keine Angaben':'vollständig') : '—';
    s2.className = k ? (leer?'warn':'ok') : ''; }
  var s3=pbEl("pbStat3");
  if(s3){ var offen=pbOffenListe().length;
    s3.textContent = z.mit+'/'+z.n+' bewertet'+(offen?(' · '+offen+' offen'):'');
    s3.className = (z.mit+z.l0===z.n && !offen) ? 'ok' : (offen||z.l1?'rot':'warn'); }
}

/* ────────────────────────────────────────────────────────────────────────────
   AUFGABENMODUS — die Umkehrung des alten Editors (Ralph, 27.08.: "weg vom
   alten System, hin zu was Neuem, Intuitivem"). Nicht der Mensch sucht in
   Formularen die Lücken: der Riegel kennt sie, also legt die Seite sie als
   Aufgabenkarten vor — mit den passenden Knöpfen direkt daran. Jede erledigte
   Karte verschwindet durch die Vollmessung von selbst. Grün = fertig.
   ────────────────────────────────────────────────────────────────────────── */
/* Aufgabenliste kommt aus dem gemeinsamen Kern — derselbe Code, den der alte
   Editor für seine Aufgabenklappe nutzt. */
function pbAufgabenListe(){ return RIEGEL.aufgaben(pbDaten()); }

function pbAufgabenHtml(){
  var A=pbAufgabenListe();
  var t='';
  if(!A.length){
    var riegelOk=Array.isArray(PB_RIEGEL)&&!PB_RIEGEL.length;
    return '<div class="pbAufFertig"><b>'+(riegelOk?'✓ Nichts zu tun.':'Keine Aufgaben ableitbar.')+'</b>'
      +(riegelOk?'Alle Zutaten bewertet oder benannt, Riegel '+PB_RIEGEL_N+'/'+PB_RIEGEL_N+' grün.'
        :'Der Riegel meldet aber noch Befunde — in den Prüfblatt-Modus wechseln.')+'</div>';
  }
  t+='<div class="pbAufFortschritt"><span><b>'+A.length+'</b> Aufgabe'+(A.length===1?'':'n')+' bis grün</span>'
    +'<div class="pbAufBalken"><div style="width:'+Math.max(4,Math.round(100/(A.length+1)))+'%"></div></div></div>';
  A.forEach(function(a,idx){
    if(a.typ==="etikett"){
      var o=a.o, iid=o.item_id;
      t+='<div class="pbAufKarte rot"><h3>„'+pbEsc(o.zutat_text||'?')+'" wurde gelesen, ist aber keiner Zutat zugeordnet</h3>'
        +'<div class="pbAufWas">Quelle: '+pbEsc(o.quelle||'—')+(o.gesehen_am?(' · '+pbEsc(String(o.gesehen_am).slice(0,10))):'')
        +' — solange die Zeile offen ist, fehlt sie in der Bewertung.</div>'
        +'<div id="pbKand'+iid+'" class="pbAkt"><button onclick="pbOffKandidaten('+iid+')">Stamm-Kandidaten anzeigen</button></div>'
        +'<div class="pbAkt" style="margin-top:6px">'
        +'<button onclick="pbOffRiki('+iid+',this)" title="Riki zerlegt, Server löst auf, Riki bewertet nur mit Regelbeleg">Riki einstufen</button> '
        +'<button onclick="pbOffZerlegt('+iid+',this)">✓ ist zerlegt — Bestandteile stehen schon da</button> '
        +'<button onclick="pbOffKeineZutat('+iid+',this)">keine Zutat …</button></div>'
        +'<div id="pbOffMsg'+iid+'" class="pbZQuelle"></div></div>';
    }
    if(a.typ==="zwilling"){
      var r1=a.rows[0], r2=a.rows[1];
      function seite(rB, rT){
        return '<div class="pbZwSeite"><b>'+pbEsc(rB.sichtbarer_name||'?')+'</b>'
          +'<div class="pbZQuelle">'+pbEsc(rB.produkt_zutat_id||'')+' · '+pbEsc(String(rB.zutatenliste_rohtext||rB.legacy_zutat_id||'').slice(0,60))+'</div>'
          +'Note '+(rB.resolved_rating!=null?pbEsc(rB.resolved_rating):'—')
          +'<div class="pbAkt" style="margin-top:6px"><button onclick="pbZwillingLoesen(\''
          +pbEsc(String(rT.produkt_zutat_id))+'\',\''+pbEsc(String(rT.sichtbarer_name||""))+'\',\''
          +pbEsc(String(rB.sichtbarer_name||""))+'\',this)">diese behalten → „'+pbEsc(String(rT.sichtbarer_name||"").slice(0,24))+'" löschen</button></div></div>';
      }
      t+='<div class="pbAufKarte"><h3>Zwei Zeilen zeigen auf denselben Stammeintrag</h3>'
        +'<div class="pbAufWas">Der Score gewichtet je Zeile — der Zwilling zählt doppelt. Eine Zeile behalten, die andere geht mit Grund ins Audit.</div>'
        +'<div class="pbZwPaar">'+seite(r1,r2)+seite(r2,r1)+'</div>'
        +(a.rows.length>2?'<div class="pbHinweis">Achtung: '+a.rows.length+' Zeilen betroffen — Rest im Prüfblatt-Modus klären.</div>':'')
        +'</div>';
    }
    if(a.typ==="luecke"){
      var lid=String(a.r.legacy_zutat_id||"");
      t+='<div class="pbAufKarte"><h3>„'+pbEsc(a.r.sichtbarer_name||'?')+'" hat keine Note — '+pbEsc(a.lk.kurz)+'</h3>'
        +'<div class="pbAufWas">'+pbEsc(a.lk.lang)+'</div>'
        +'<div class="pbAkt">'
        +(a.lk.typ===1 && lid
           ? '<button onclick="pbBrueckeKandidaten(\''+pbEsc(lid)+'\',\''+pbEsc(String(a.r.sichtbarer_name||""))+'\')" '
             +'title="Zeigt passende Stammeinträge. Der Klick setzt die Brücke – mit Pflichtbeleg, für ALLE Produkte mit dieser Zutat.">'
             +'Stammeintrag suchen und Brücke setzen</button> '
           : '')
        +'<button onclick="pbLueckeUebergeben(\''+pbEsc(String(a.r.produkt_zutat_id||""))+'\',\''
        +pbEsc(String(a.r.sichtbarer_name||""))+'\',\''+pbEsc(a.lk.kurz)+'\',this)" '
        +'title="Nur wenn du es selbst nicht entscheiden kannst: sammelt den Befund für ChatGPT.">nicht entscheidbar → sammeln</button></div>'
        +'<div id="pbBr'+pbEsc(lid)+'" class="pbAkt"></div>'
        +'<div class="pbZQuelle" id="pbLkMsg'+pbEsc(String(a.r.produkt_zutat_id||idx))+'"></div></div>';
    }
    if(a.typ==="kopf"){
      t+='<div class="pbAufKarte blau"><h3>Kopfdaten unvollständig</h3>'
        +'<div class="pbAufWas">Produktname oder Kategorie fehlt — ohne sie keine saubere Zuordnung.</div>'
        +'<div class="pbAkt"><button onclick="pbModus(\'pruef\');location.hash=\'sec1\';pbKopfFormToggle()">Kopf jetzt ausfüllen</button></div></div>';
    }
    if(a.typ==="nw"){
      t+='<div class="pbAufKarte blau"><h3>Keine Nährwerte erfasst</h3>'
        +'<div class="pbAufWas">Die Nährwert-Achse des Scores bleibt leer, solange hier nichts steht.</div>'
        +'<div class="pbAkt"><button onclick="pbModus(\'pruef\');location.hash=\'sec2\';pbNwFormToggle()">Nährwerte jetzt eintragen</button></div></div>';
    }
  });
  return t;
}

/* Zwilling: eine Zeile behalten, die andere mit vorbereitetem Grund löschen. */
async function pbZwillingLoesen(pzidWeg, nameWeg, nameBleibt, btn){
  if(!confirm('Zwilling auflösen:\n\nBEHALTEN: '+nameBleibt+'\nLÖSCHEN:  '+nameWeg+' ('+pzidWeg+')\n\nDie gelöschte Zeile geht mit Grund ins Audit. Fortfahren?')) return;
  if(btn) btn.disabled=true;
  try{
    var r=await pbClient.rpc("cb_admin_produkt_zutat_zeile_loeschen",
      {p_produkt_zutat_id:pzidWeg, p_grund:'Zwillingszeile zu "'+nameBleibt+'" - Doppelerfassung Etikett/Referenzprüfung, aufgelöst im Aufgabenmodus.'});
    if(r.error) throw r.error;
    await pbLaden();
  }catch(e){ alert("Löschen fehlgeschlagen: "+(e.message||e)); if(btn) btn.disabled=false; }
}

/* Brücke selbst setzen (Ralph 27.08.: "direkt lösen"). Kandidaten kommen vom
   Server; gebunden wird NIE automatisch — bei "Calcium" gibt es 13 Salze im
   Stamm, blind binden wäre Raten. Der Klick verlangt einen Beleg und wirkt
   für ALLE Produkte mit dieser Zutat. */
async function pbBrueckeKandidaten(legacyId, name){
  var box=pbEl("pbBr"+legacyId); if(!box) return;
  box.innerHTML='Suche Stammeinträge zu „'+pbEsc(name)+'" …';
  try{
    var r=await pbClient.rpc("cb_admin_zutat_zeile_bearbeiten",{p_zutat_text:name});
    if(r.error) throw r.error;
    var ks=((r.data&&r.data.kandidaten)||[]).filter(function(k){ return k.entity_id; });
    if(!ks.length){ box.innerHTML='<span class="gelbT">Kein Stammeintrag gefunden. Wege: Quelle neu lesen (Kopf) oder sammeln.</span>'; return; }
    box.innerHTML='<div class="pbZQuelle">'+ks.length+' Vorschlag'+(ks.length===1?'':'e')+' — Klick setzt die Brücke (Beleg wird abgefragt):</div>'
      + ks.slice(0,12).map(function(k){
          var nm=k.name||k.stammname||k.canonical_name||k.zutat_text||'?';
          return '<button onclick="pbBrueckeSetzen(\''+pbEsc(legacyId)+'\',\''+pbEsc(String(k.entity_id))+'\',\''
            +pbEsc(String(nm).replace(/'/g,"\\'"))+'\',this)">'+pbEsc(nm)
            +(k.regel_titel?('<span class="pbZQuelle"> · '+pbEsc(k.regel_titel)+'</span>'):'')+'</button>';
        }).join(' ')
      + (ks.length>12?('<div class="pbZQuelle">… '+(ks.length-12)+' weitere. Wenn nichts eindeutig passt: sammeln statt raten.</div>'):'');
  }catch(e){ box.innerHTML='<span class="gelbT">Suche fehlgeschlagen: '+pbEsc(e.message||e)+'</span>'; }
}
async function pbBrueckeSetzen(legacyId, entityId, name, btn){
  var beleg=prompt('Brücke setzen: „'+name+'"\n\nWoher weißt du das? (Pflicht, mind. 8 Zeichen — z. B. „Herstellerseite nennt '+name+'")',
    'Herstellerangabe zu '+PB_PID+', geprüft am '+new Date().toLocaleDateString('de-DE'));
  if(beleg===null) return;
  beleg=String(beleg).trim();
  if(beleg.length<8){ alert("Ohne tragfähigen Beleg keine Bindung."); return; }
  if(btn) btn.disabled=true;
  try{
    var r=await pbClient.rpc("cb_admin_legacy_bruecke_setzen",
      {p_legacy_zutat_id:legacyId, p_entity_id:entityId, p_beleg:beleg});
    if(r.error) throw r.error;
    var d=r.data||{};
    alert('✓ Brücke gesetzt: '+(d.canonical_name||name)
      +(d.rating!=null?('\nNote '+d.rating):'\nNote noch offen')
      +'\nBetrifft '+(d.zeilen_betroffen||'?')+' Produktzeile(n) im ganzen Bestand.');
    await pbLaden();
  }catch(e){
    alert("Brücke setzen fehlgeschlagen: "+(e.message||e));
    if(btn) btn.disabled=false;
  }
}

/* Letzter Ausweg: Befund sammeln. EIN Work Item je Produkt statt eines je
   Zutat (Selbstprüfung Punkt 5) — bestehendes Item wird ergänzt. */
var PB_SAMMEL={};
async function pbLueckeUebergeben(pzid, name, art, btn){
  var liste=pbAufgabenListe().filter(function(a){ return a.typ==="luecke"; });
  var text=liste.map(function(a){ return a.r.sichtbarer_name+' ('+a.lk.kurz+')'; }).join(', ');
  if(!confirm('Nicht entscheidbare Lücken dieses Produkts sammeln und an ChatGPT geben?\n\n'
    +'Produkt: '+PB_PID+'\nBetroffen ('+liste.length+'): '+text+'\n\nEs entsteht EIN Work Item für alle.')) return;
  if(btn) btn.disabled=true;
  var m=pbEl("pbLkMsg"+pzid);
  if(PB_SAMMEL[PB_PID]){ if(m) m.textContent='Bereits gesammelt: Work #'+PB_SAMMEL[PB_PID]; if(btn) btn.disabled=false; return; }
  try{
    var r=await pbClient.rpc("cb_admin_agent_work_setzen",{
      p_actor:'claude', p_owner:'chatgpt', p_area:'zutaten-bewertung',
      p_title:('Stamm-Luecken '+PB_PID+': '+liste.length+' Zutat(en) ohne Note').slice(0,120),
      p_description:('Gemessen im Erfassungs-Aufgabenmodus, '+PB_PID+'. Nicht am Produkt entscheidbar: '+text
        +'. Behebung am Stamm (Bruecke/Beleg/Regel).').slice(0,590),
      p_acceptance_criteria:('Alle genannten Zeilen von '+PB_PID+' zeigen Note+Regel oder eine benannte Disposition.').slice(0,390),
      p_product_id:PB_PID, p_priority:80});
    if(r.error) throw r.error;
    PB_SAMMEL[PB_PID]=r.data||'?';
    if(m) m.textContent='✓ gesammelt — Work #'+PB_SAMMEL[PB_PID]+' für alle '+liste.length+' Lücken.';
  }catch(e){ if(m) m.textContent='Sammeln fehlgeschlagen: '+(e.message||e); if(btn) btn.disabled=false; }
}

function pbModus(m){
  PB_MODUS=m;
  ["aufgaben","pruef"].forEach(function(x){
    var b=pbEl("pbM_"+x); if(b) b.className=(x===m)?"pbFBtn aktiv":"pbFBtn";
  });
  pbRender();
}

function pbRender(){
  var z=pbZaehler();
  pbEl("pbRiegelBox").innerHTML=pbRiegelHtml(PB_RIEGEL);
  pbTopSync(z);
  var auf=pbEl("pbAufgaben"), pm=pbEl("pbPruefmodus");
  if(PB_MODUS==="aufgaben"){
    if(pm) pm.style.display="none";
    /* Prüfmodus-Container leeren, damit keine doppelten Element-IDs entstehen */
    ["pbKopf","pbZaehler","pbNw","pbTabelle","pbZusatz","pbWirk"].forEach(function(id){
      var e=pbEl(id); if(e) e.innerHTML="";
    });
    if(auf){ auf.style.display="block"; auf.innerHTML=pbAufgabenHtml(); }
    /* KORREKTUR 27.08. (Selbstprüfung Punkt 4): vorher wurden die Kandidaten
       für JEDE offene Zeile automatisch geholt — bei acht offenen Zeilen acht
       Abfragen auf einen Schlag. Jetzt nur für die erste (die man ohnehin
       zuerst bearbeitet); die übrigen holt ihr eigener Knopf. */
    var _o1=pbOffenListe()[0];
    if(_o1) pbOffKandidaten(_o1.item_id);
    return;
  }
  if(auf){ auf.style.display="none"; auf.innerHTML=""; }
  if(pm) pm.style.display="block";
  pbEl("pbKopf").innerHTML=pbProduktKopfHtml();
  pbEl("pbZaehler").innerHTML=pbKopfHtml(z);
  pbEl("pbNw").innerHTML=pbNaehrwertHtml();
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
  pbEl("pbZusatz").innerHTML=pbOffenHtml()+pbZusatzHtml();
  pbEl("pbWirk").innerHTML=pbWirkHtml();
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
