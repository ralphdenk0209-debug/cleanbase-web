/* ============================================================================
   RIEGEL-KERN · gemeinsame Prüf- und Aufgabenlogik · 27.08.2026
   ----------------------------------------------------------------------------
   Ralph, 27.08.: "kannst du deine rechenlogik, vorgehensweise von diesem neuen
   vorgehen in die alte datenerfassung übernehmen? optik soll beim alten
   erhalten bleiben."

   🔴 EINE REGEL, EIN ORT (§A4.2). Diese Datei ist die EINZIGE Stelle, an der
   die Invarianten I1–I10 und die daraus abgeleiteten Aufgaben stehen. Beide
   Oberflächen laden sie:
     · pruefblatt.html  (neue Erfassungsseite, Aufgabenmodus)
     · admin.html       (alter Produkteditor, Optik unverändert)
   Wer hier etwas ändert, ändert es für beide. Eine Kopie in einer der beiden
   Oberflächen wäre eine zweite Wahrheit und ist verboten.

   🔴 KEINE EIGENE FACHLOGIK. Der Kern rechnet keine Note, ordnet keine Regel
   zu und entscheidet keinen Sonderfall. Er liest ausschließlich vorhandene
   Serverantworten und prüft sie gegen zehn Aussagen, die wahr sein müssen.

   🔴 KEIN DOM. Diese Datei kennt kein HTML. Jede Oberfläche malt das Ergebnis
   in ihrem eigenen Stil — genau deshalb kann der alte Editor sein Aussehen
   behalten und trotzdem dieselbe Wahrheit zeigen.
   ========================================================================== */
(function(global){
"use strict";

var ANZAHL = 10;

/* ── Messen: alle Datenachsen eines Produkts, ohne Gedächtnis ───────────────
   opt.schnell=true lädt nur die beiden billigen Achsen (Zutaten + gelesene
   Etikettzeilen). Das reicht für die Kopfzahl im alten Editor; die volle
   Messung mit allen sechs Abfragen läuft dort erst auf Klick
   (Selbstprüfung Punkt 3: sechs Abfragen bei JEDEM Editor-Öffnen waren zu
   teuer für etwas, das man nicht immer braucht). */
async function messen(client, pid, opt){
  opt = opt || {};
  var d = {pid:pid, rows:[], zusatz:null, wirk:null, wirkh:{}, mikro:null, kopf:null, offen:null, schnell:!!opt.schnell};
  var r = await client.rpc("cb_app_produkt_zutaten",{p_produkt_id:pid});
  if(r.error) throw r.error;
  d.rows = r.data || [];
  if(opt.schnell){
    try{ var ros=await client.rpc("cb_admin_zutat_offen_mit_riki",{p_product_id:pid});
         if(ros.error) throw ros.error; d.offen=ros.data||[];
    }catch(e){ d.offen={fehler:String(e.message||e)}; }
    return d;
  }
  try{ var rk=await client.rpc("cb_produkt_edit_get",{p_id:pid});
       if(rk.error) throw rk.error; d.kopf=rk.data||null;
  }catch(e){ d.kopf={fehler:String(e.message||e)}; }
  try{ var ro=await client.rpc("cb_admin_zutat_offen_mit_riki",{p_product_id:pid});
       if(ro.error) throw ro.error; d.offen=ro.data||[];
  }catch(e){ d.offen={fehler:String(e.message||e)}; }
  try{ var rz=await client.rpc("cb_app_produkt_zusatzstoffe",{p_produkt_id:pid});
       if(rz.error) throw rz.error; d.zusatz=rz.data||null;
  }catch(e){ d.zusatz={fehler:String(e.message||e)}; }
  try{ var rw=await client.rpc("cb_produkt_wirkstoff_liste_v2",{p_id:pid});
       if(rw.error) throw rw.error; d.wirk=rw.data||[];
       var rh=await client.rpc("cb_produkt_wirkstoff_herkunft",{p_id:pid});
       if(!rh.error) (rh.data||[]).forEach(function(h){ d.wirkh[h.naehrstoff]=h; });
  }catch(e){ d.wirk={fehler:String(e.message||e)}; }
  try{ var rm=await client.rpc("cb_produkt_mikro_liste_v2",{p_id:pid});
       if(rm.error) throw rm.error; d.mikro=rm.data||[];
  }catch(e){ d.mikro={fehler:String(e.message||e)}; }
  return d;
}

/* ── Lückentyp einer Zutatenzeile: nur Anzeige der Serverfelder ───────────── */
function luecke(r){
  /* 29.08.2026, RALPH: "die teigware muss auch weg."
     Eine HUELLE ist eine Zeile, deren Bestandteile einzeln am Produkt stehen
     ("71% EIER-TEIGWAREN (…)" - Hartweizengriess, Wasser, Vollei und
     Sonnenblumenoel sind eigene Zutaten geworden). Der Server laesst sie aus
     der Bewertung heraus; sie hat deshalb absichtlich keine Note.
     Sie als Luecke zu melden war falsch: die Aufgabenliste verlangte eine Note
     fuer eine Zeile, die gar nicht bewertet werden soll.
     score_leaf===false kommt vom Server (cb_app_produkt_zutaten). */
  if(r.score_leaf===false) return null;
  if(r.resolved_rating!=null) return null;
  if(r.disposition)
    return {typ:0, kurz:"bewusst offen",
      lang:"Der Server hat diese Zeile ausdrücklich als Sonderfall benannt ("+r.disposition+"): "+(r.disposition_reason||"")};
  if(r.resolution_path==="unresolved" || !r.canonical_entity_id)
    return {typ:1, kurz:"Brücke fehlt",
      lang:"Im alten Stamm gebunden, aber der Weg in den Canonical-Stamm fehlt. Ohne Stammeintrag kann keine Regel greifen."};
  if(r.rating_disposition==="insufficient_evidence")
    return {typ:2, kurz:"Beleg fehlt",
      lang: r.rating_disposition_reason || "Die Regel braucht eine Angabe von der Quelle, die fehlt."};
  return {typ:3, kurz:"Keine Regel",
    lang: r.rating_disposition_reason || "Das Regelwerk deckt diesen Fall nicht. Behebung: Regelentscheid Ralph."};
}

/* Offen = vom Etikett gelesen, ohne Zielzeile und ohne manuelle Entscheidung */
function offeneZeilen(d){
  if(!d.offen || d.offen.fehler || !Array.isArray(d.offen)) return [];
  return d.offen.filter(function(o){ return !o.target_id && !o.manual_decision_kind; });
}

function zaehler(d){
  /* Huellen stehen nicht im Nenner: sie werden nicht bewertet, also kann man
     auch nicht verlangen, dass sie eine Note haben. Ralph, 29.08.2026:
     "oben werden 16 angezeigt" - Station 3 zaehlte schon richtig, dieser
     Zaehler noch nicht. */
  var _rows=d.rows.filter(function(r){ return !(r && r.score_leaf===false); });
  var z={n:_rows.length, mit:0, l0:0, l1:0, l2:0, l3:0, offen:offeneZeilen(d).length};
  _rows.forEach(function(r){
    var lk=luecke(r);
    if(!lk) z.mit++; else if(lk.typ===0) z.l0++; else if(lk.typ===1) z.l1++;
    else if(lk.typ===2) z.l2++; else z.l3++;
  });
  return z;
}

/* Zwillinge: zwei Zeilen desselben Produkts auf demselben Stammeintrag */
function zwillinge(d){
  var proE={}, paare=[];
  d.rows.forEach(function(r){ if(r.canonical_entity_id)
    (proE[r.canonical_entity_id]=proE[r.canonical_entity_id]||[]).push(r); });
  Object.keys(proE).forEach(function(eid){ if(proE[eid].length>1) paare.push(proE[eid]); });
  return paare;
}

var NW_FELDER=["kcal","fett","ges_fett","einfach_unges","mehrfach_unges","transfette",
               "kh","zucker","polyole","ballaststoffe","protein","salz"];
function naehrwerteLeer(d){
  var k=(d.kopf && !d.kopf.fehler)?d.kopf:null;
  if(!k) return false;
  var nw=k.naehrwerte||{};
  return NW_FELDER.every(function(f){ return nw[f]==null; });
}

/* ── Prüfen: die zehn Aussagen, die wahr sein müssen ──────────────────────── */
async function pruefen(d, client){
  var f=[];
  d.rows.forEach(function(r){
    var hatNote=r.resolved_rating!=null, hatRegel=!!r.resolved_rule_id, benannt=!!r.disposition;
    if(hatNote && !hatRegel) f.push('I2 verletzt: "'+r.sichtbarer_name+'" hat Note '+r.resolved_rating+' ohne Regel-ID.');
    if(hatNote && !r.canonical_entity_id) f.push('I3 verletzt: "'+r.sichtbarer_name+'" hat Note ohne Stammeintrag.');
    if(!hatNote && !benannt) f.push('I1 verletzt: "'+r.sichtbarer_name+'" ist weder bewertet noch benannt offen.');
    if(hatNote && benannt) f.push('I1 verletzt: "'+r.sichtbarer_name+'" ist bewertet UND als Sonderfall benannt - zwei Zustände.');
  });
  var z=zaehler(d);
  if(z.mit+z.l0+z.l1+z.l2+z.l3!==z.n)
    f.push("I5 verletzt: Kopfzahlen ("+z.mit+"+"+z.l0+"+"+z.l1+"+"+z.l2+"+"+z.l3+") ≠ "+z.n+" Zeilen.");
  if(client){
    try{
      var r2=await client.rpc("cb_app_produkt_zutaten",{p_produkt_id:d.pid});
      if(r2.error) throw r2.error;
      if(JSON.stringify(d.rows)!==JSON.stringify(r2.data||[]))
        f.push("I4 verletzt: zweiter Abruf liefert eine andere Antwort — Lesen ist nicht stabil.");
    }catch(e){ f.push("I4 nicht prüfbar: "+(e.message||e)); }
  }
  var bekannt=["identified","partial","unresolved","none_declared","no_data"];
  if(!d.zusatz || d.zusatz.fehler)
    f.push("I6 verletzt: Zusatzstoff-Antwort fehlt"+(d.zusatz&&d.zusatz.fehler?(" ("+d.zusatz.fehler+")"):"")+".");
  else{
    if(bekannt.indexOf(d.zusatz.resolution_status)<0)
      f.push('I6 verletzt: unbekannter Zusatzstoff-Gesamtzustand "'+d.zusatz.resolution_status+'".');
    (d.zusatz.items||[]).forEach(function(it){
      if(["abgewertet","neutral","ungeprueft","ungeprüft"].indexOf(it.evaluation)<0)
        f.push('I6 verletzt: Zusatzstoff "'+(it.name||it.e_number)+'" ohne Bewertungszustand.');
    });
  }
  if(!d.wirk || d.wirk.fehler)
    f.push("I7 verletzt: Wirkstoff-Antwort fehlt"+(d.wirk&&d.wirk.fehler?(" ("+d.wirk.fehler+")"):"")+".");
  else d.wirk.forEach(function(w){
    if(w.menge==null || !w.einheit) f.push('I7 verletzt: Wirkstoff "'+w.naehrstoff+'" ohne Menge oder Einheit.');
    var h=d.wirkh[w.naehrstoff];
    if(h && ["zugesetzt","aus_matrix","unbekannt"].indexOf(h.herkunft)<0)
      f.push('I7 verletzt: Wirkstoff "'+w.naehrstoff+'" mit unbekanntem Herkunftszustand "'+h.herkunft+'".');
  });
  if(!d.mikro || d.mikro.fehler)
    f.push("I7 verletzt: Mikronährstoff-Antwort fehlt"+(d.mikro&&d.mikro.fehler?(" ("+d.mikro.fehler+")"):"")+".");
  else d.mikro.forEach(function(m){
    if(m.menge_100g==null || !m.einheit) f.push('I7 verletzt: Mikronährstoff "'+m.naehrstoff+'" ohne Menge oder Einheit.');
  });
  zwillinge(d).forEach(function(gr){
    f.push('I8 verletzt: '+gr.length+' Zeilen zeigen auf denselben Stammeintrag: '
      + gr.map(function(r){ return r.sichtbarer_name; }).join(' + ')+'. Zwillinge verfälschen die Gewichtung.');
  });
  if(!d.kopf || d.kopf.fehler)
    f.push("I9 verletzt: Kopf/Nährwerte-Antwort fehlt"+(d.kopf&&d.kopf.fehler?(" ("+d.kopf.fehler+")"):"")+".");
  else if(!d.kopf.name) f.push("I9 verletzt: Produkt ohne Namen im Kopf.");
  if(!d.offen || d.offen.fehler)
    f.push("I10 nicht prüfbar: Etikett-Leseliste fehlt"+(d.offen&&d.offen.fehler?(" ("+d.offen.fehler+")"):"")+".");
  else offeneZeilen(d).forEach(function(o){
    f.push('I10 verletzt: "'+(o.zutat_text||'?')+'" wurde von der Quelle gelesen, ist aber keiner Bestandteilzeile zugeordnet.');
  });
  return f;
}

/* ── Aufgaben: was der Mensch tun kann, abgeleitet aus den Befunden ───────── */
function aufgaben(d){
  var A=[];
  offeneZeilen(d).forEach(function(o){
    A.push({typ:"etikett", item_id:o.item_id, titel:'„'+(o.zutat_text||'?')+'" gelesen, aber keiner Zutat zugeordnet',
      was:'Quelle: '+(o.quelle||'—')+' — solange die Zeile offen ist, fehlt sie in der Bewertung.', o:o});
  });
  zwillinge(d).forEach(function(gr){
    A.push({typ:"zwilling", rows:gr, titel:'Zwei Zeilen zeigen auf denselben Stammeintrag: '
      + gr.map(function(r){ return r.sichtbarer_name; }).join(' + '),
      was:'Der Score gewichtet je Zeile — der Zwilling zählt doppelt.'});
  });
  d.rows.forEach(function(r){
    var lk=luecke(r);
    if(lk && lk.typ>=1) A.push({typ:"luecke", r:r, lk:lk,
      titel:'„'+(r.sichtbarer_name||'?')+'" hat keine Note — '+lk.kurz, was:lk.lang});
  });
  var k=(d.kopf&&!d.kopf.fehler)?d.kopf:null;
  if(k && (!k.name||!k.kategorie))
    A.push({typ:"kopf", titel:'Kopfdaten unvollständig', was:'Produktname oder Kategorie fehlt — ohne sie keine saubere Zuordnung.'});
  if(naehrwerteLeer(d))
    A.push({typ:"nw", titel:'Keine Nährwerte erfasst', was:'Die Nährwert-Achse des Scores bleibt leer, solange hier nichts steht.'});
  return A;
}

global.RIEGEL = {
  ANZAHL: ANZAHL, messen: messen, pruefen: pruefen, aufgaben: aufgaben,
  luecke: luecke, zaehler: zaehler, zwillinge: zwillinge,
  offeneZeilen: offeneZeilen, naehrwerteLeer: naehrwerteLeer, NW_FELDER: NW_FELDER
};
})(typeof window!=="undefined"?window:this);
