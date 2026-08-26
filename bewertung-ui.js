/* ============================================================================
   AUTOMATISCHE ZUTATEN-BEWERTUNG  ·  Arbeitsfläche  ·  26.08.2026, Work #301
   ----------------------------------------------------------------------------
   Ralph, Sitzungsziel 26.08.: „automatische bewertung der zutaten anhand des
   regelwerks."

   🔴 WARUM ES DIESE DATEI GIBT — und warum sie NICHTS Neues erfindet.
   GEMESSEN am 26.08., bevor eine Zeile entstand:
     grep über alle webseite/*.js und *.html nach
       cb_admin_stamm_bewertung_queue
       cb_admin_stamm_bewertungsvorschlaege_erzeugen
       cb_admin_stamm_bewertungen_auto_uebernehmen
       cb_admin_stamm_bewertungsvorschlag_uebernehmen
     → 0 Treffer.
   Vier fertige Serverwege, keiner davon hatte eine Tür. Ralph konnte die
   offenen Fälle nicht einmal SEHEN. Das ist der Fall aus Paragraf A4: erst
   suchen, dann bauen — ein nicht angeschlossenes Werkzeug ist häufiger als
   ein fehlendes.

   🔴 WAS DIESE DATEI NICHT TUT (Kernvertrag B1, server_ssot):
   Sie rechnet keine Note aus, sie schlägt keine Regel vor, sie entscheidet
   keinen Sonderfall. Jede Zahl auf dem Schirm kommt aus der Serverantwort.
   Der Server entscheidet, die Oberfläche zeigt und lässt Ralph bestätigen.

   LAGE AM TAG DES BAUS, gemessen über v_product_ingredient_rating_resolution:
     257.250 Produkt-Zutat-Zeilen
     226.789 bewertet                                        88,2 %
      22.583 Zutat nicht im Stamm      (5.675 Namen)          8,8 %
       4.507 im Stamm gebunden, keine Note  (67 Einträge)     1,8 %
       3.371 bewusst offengelassen (disposition)              1,3 %
   Diese Fläche arbeitet den dritten Block ab: 67 Einträge, 4.507 Zeilen.
   ========================================================================== */

var _BWQ = null;        /* letzte Serverantwort, unveraendert */
var _BWQ_FILTER = 'alle';
var _BWQ_LAEUFT = false;

function _bwEsc(s){
  if(typeof esc==='function') return esc(s==null?'':String(s));
  return String(s==null?'':s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
}

/* Die Sonderfall-Gruende kommen als Schluessel vom Server. Hier steht nur die
   Uebersetzung in Ralphs Sprache — kein zusaetzliches Urteil. */
var _BWQ_GRUND = {
  keine_eindeutige_regelzuordnung:
    'Keine Regel zugeordnet. Der Server weiß nicht, welche Regel gilt — das muss ein Mensch entscheiden.',
  regel_fehlend_oder_inaktiv:
    'Die zugeordnete Regel ist abgeschaltet oder gelöscht. Solange sie nicht aktiv ist, wird nichts übernommen.',
  regel_hat_keinen_einzelwert:
    'Die Regel nennt keine einzelne Note, sondern einen Text. Daraus lässt sich keine Zahl übernehmen.',
  vorschlag_nicht_hoch_sicher:
    'Der Vorschlag ist da, aber nicht als „hoch sicher" gekennzeichnet. Automatisch übernommen wird nur, was hoch sicher ist.'
};

function _bwBox(){
  var b=document.getElementById('bwBox');
  if(b) return b;
  b=document.createElement('div'); b.id='bwBox';
  b.style.cssText='position:fixed;inset:0;z-index:9100;display:none;'
    +'background:rgba(15,23,32,.5);backdrop-filter:blur(2px);overflow:auto';
  b.addEventListener('click',function(e){ if(e.target===b) bewertungZu(); });
  document.body.appendChild(b);
  return b;
}
function bewertungZu(){ var b=document.getElementById('bwBox'); if(b) b.style.display='none'; }

function _bwRahmen(inhalt){
  return '<div style="max-width:1120px;margin:22px auto;background:var(--card,#fff);'
    +'border:1px solid var(--line,#dde3ea);border-radius:14px;padding:0 0 18px;'
    +'box-shadow:0 18px 50px rgba(15,23,32,.28)">'
    +'<div style="display:flex;align-items:center;gap:9px;padding:13px 16px;'
      +'border-bottom:1px solid var(--line,#dde3ea)">'
      +'<span style="font-size:17px" aria-hidden="true">⚖️</span>'
      +'<b style="font-size:14px">Zutaten automatisch bewerten</b>'
      +'<button type="button" onclick="bewertungZu()" style="margin-left:auto;border:1px solid '
        +'var(--line,#dde3ea);background:var(--card,#fff);border-radius:8px;padding:4px 11px;'
        +'font-size:12px;cursor:pointer">schließen</button>'
    +'</div><div style="padding:0 16px">'+inhalt+'</div></div>';
}

function _bwFehler(t,e){
  return '<div style="background:var(--k-fdeaea,#fdeaea);border:1px solid var(--k-f0a9a4,#f0a9a4);'
    +'border-radius:10px;padding:12px 14px;color:var(--k-b3261e,#b3261e);font-size:13px;margin-top:14px">'
    +'<b>'+_bwEsc(t)+'</b><br>'+_bwEsc((e&&e.message)||String(e))
    +'<br><span style="opacity:.75">Es wird NICHT behauptet, dass nichts offen ist.</span></div>';
}

/* ---------------------------------------------------------------- Kopfzeile */
function _bwKopf(){
  var d=_BWQ||{};
  var rows=Array.isArray(d.rows)?d.rows:[];
  var auto=rows.filter(function(r){ return r && r.sonderfall===false; }).length;
  var sonder=rows.length-auto;
  return '<div style="margin-top:14px;background:var(--k-f4f7fb,#f4f7fb);border:1px solid '
      +'var(--line,#dde3ea);border-radius:11px;padding:12px 14px">'
    +'<div style="font-size:13px;line-height:1.55">'
      +'<b>'+_bwEsc(d.total==null?'?':d.total)+'</b> Zutaten im Stamm haben noch keine Note. '
      +'Auf dieser Seite stehen <b>'+rows.length+'</b> davon.'
      +'<br><span style="color:var(--k-166534,#166534)">▸ '+auto+' können automatisch übernommen werden</span>'
      +' — dort hängt eine aktive Regel mit einer klaren Zahl dran, und der Vorschlag ist hoch sicher.'
      +'<br><span style="color:var(--k-8a5a0b,#8a5a0b)">▸ '+sonder+' gehen nicht automatisch</span>'
      +' — bei jedem steht darunter, woran es liegt.'
    +'</div>'
    +'<div style="margin-top:10px;font-size:11.5px;color:var(--muted,#6b7785)">'
      +'Diese Fläche rechnet keine Note aus. Jede Zahl kommt vom Server aus der '
      +'Tabelle Bewertungsregeln. Übernommen wird erst, wenn du es sagst.'
    +'</div></div>';
}

/* ------------------------------------------------------------------ Knöpfe */
function _bwLeiste(){
  var d=_BWQ||{};
  var rows=Array.isArray(d.rows)?d.rows:[];
  var auto=rows.filter(function(r){ return r && r.sonderfall===false; }).length;
  function f(k,t){
    var an=(_BWQ_FILTER===k);
    return '<button type="button" onclick="bewertungFilter(\''+k+'\')" style="border:1px solid '
      +(an?'var(--k-1e40af,#1e40af)':'var(--line,#dde3ea)')+';background:'
      +(an?'var(--k-e8effc,#e8effc)':'var(--card,#fff)')+';border-radius:8px;padding:5px 11px;'
      +'font-size:12px;cursor:pointer;font-weight:'+(an?'700':'400')+'">'+t+'</button>';
  }
  return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin-top:12px">'
    +f('alle','alle')+f('auto','nur automatisch möglich')+f('sonderfall','nur Sonderfälle')
    +'<span style="flex:1"></span>'
    +'<button type="button" onclick="bewertungVorschlaegeErzeugen()" '
      +'title="Der Server sucht Zutaten, an denen bereits eine aktive Bewertungsregel hinterlegt ist, und legt daraus Vorschläge an. Es wird nichts übernommen."'
      +' style="border:1px solid var(--line,#dde3ea);background:var(--card,#fff);border-radius:8px;'
      +'padding:6px 12px;font-size:12px;cursor:pointer">🔎 Vorschläge suchen</button>'
    +'<button type="button" onclick="bewertungAlleUebernehmen()" '
      +(auto?'':'disabled ')
      +'title="Übernimmt alle hoch sicheren, regelgebundenen Vorschläge auf einmal. Fragt vorher."'
      +' style="border:1px solid '+(auto?'var(--k-166534,#166534)':'var(--line,#dde3ea)')+';background:'
      +(auto?'var(--k-eaf6ee,#eaf6ee)':'var(--k-f4f7fb,#f4f7fb)')+';border-radius:8px;padding:6px 12px;'
      +'font-size:12px;cursor:'+(auto?'pointer':'not-allowed')+';font-weight:600;color:'
      +(auto?'var(--k-166534,#166534)':'var(--muted,#6b7785)')+'">✓ '+auto+' auf einmal übernehmen</button>'
    +'</div>';
}

/* ------------------------------------------------------------------ Zeilen */
function _bwZeile(r){
  var name=_bwEsc(r.canonical_name||'(ohne Namen)');
  var kat=r.category?('<span style="color:var(--muted,#6b7785)"> · '+_bwEsc(r.category)+'</span>'):'';
  var H='<div style="border-top:1px solid var(--line,#dde3ea);padding:11px 2px">'
    +'<div style="display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap">'
    +'<div style="flex:1;min-width:230px"><b style="font-size:13px">'+name+'</b>'+kat+'</div>';

  if(r.sonderfall===false && r.vorgeschlagene_bewertung!=null){
    H+='<div style="display:flex;align-items:center;gap:9px">'
      +'<span style="display:inline-block;min-width:30px;text-align:center;font-weight:700;'
        +'font-size:15px;background:var(--k-eaf6ee,#eaf6ee);border:1px solid var(--k-166534,#166534);'
        +'color:var(--k-166534,#166534);border-radius:7px;padding:2px 7px">'
        +_bwEsc(r.vorgeschlagene_bewertung)+'</span>'
      +'<button type="button" onclick="bewertungUebernehmen(\''+_bwEsc(r.candidate_id)+'\',this)" '
        +'style="border:1px solid var(--k-166534,#166534);background:var(--k-166534,#166534);color:#fff;'
        +'border-radius:8px;padding:5px 12px;font-size:12px;cursor:pointer;font-weight:600">übernehmen</button>'
      +'</div>';
  } else {
    H+='<span style="font-size:12px;color:var(--k-8a5a0b,#8a5a0b);font-weight:600">kein Automatikfall</span>';
  }
  H+='</div>';

  /* Beleg: welche Regel, welcher Wert, welche Quelle. Woertlich vom Server. */
  if(r.regel_titel||r.rule_id){
    H+='<div style="margin-top:5px;font-size:11.5px;color:var(--muted,#6b7785);line-height:1.5">'
      +'Regel: <b>'+_bwEsc(r.regel_titel||r.rule_id)+'</b>'
      +(r.regel_wert?(' · Wert '+_bwEsc(r.regel_wert)):'')
      +(r.confidence?(' · Sicherheit '+_bwEsc(r.confidence)):'')
      +(r.source_type?(' · Herkunft '+_bwEsc(r.source_type)):'')
      +(r.regel_quelle?('<br>Quelle: '+_bwEsc(r.regel_quelle)):'')
      +'</div>';
  }
  if(r.sonderfall===true && r.sonderfall_grund){
    H+='<div style="margin-top:5px;font-size:12px;color:var(--k-8a5a0b,#8a5a0b);'
      +'background:var(--k-fdf7ea,#fdf7ea);border-radius:7px;padding:6px 9px">'
      +'⚠ '+_bwEsc(_BWQ_GRUND[r.sonderfall_grund]||r.sonderfall_grund)
      +'<span style="display:block;color:var(--muted,#6b7785);margin-top:2px">Schlüssel: '
      +_bwEsc(r.sonderfall_grund)+'</span></div>';
  }
  return H+'</div>';
}

function _bwMal(){
  var el=document.getElementById('bwInhalt'); if(!el) return;
  var rows=(_BWQ&&Array.isArray(_BWQ.rows))?_BWQ.rows:[];
  if(!rows.length){
    el.innerHTML='<div style="padding:22px 0;font-size:13px;color:var(--muted,#6b7785)">'
      +'Zu diesem Filter steht nichts offen.</div>';
    return;
  }
  el.innerHTML='<div style="margin-top:12px">'+rows.map(_bwZeile).join('')+'</div>';
}

/* ------------------------------------------------------------------- Laden */
async function bewertungLaden(){
  var b=_bwBox(); b.style.display='block';
  b.innerHTML=_bwRahmen('<div style="padding:26px 0;font-size:13px;opacity:.7">lädt…</div>');
  try{
    var r=await client.rpc('cb_admin_stamm_bewertung_queue',
      {p_filter:_BWQ_FILTER,p_limit:200,p_offset:0});
    if(r&&r.error) throw r.error;
    _BWQ=(r&&r.data)||null;
    if(!_BWQ||_BWQ.ok!==true) throw new Error('Der Server hat keine gültige Antwort geliefert.');
    b.innerHTML=_bwRahmen(_bwKopf()+_bwLeiste()+'<div id="bwInhalt"></div>');
    _bwMal();
  }catch(e){
    b.innerHTML=_bwRahmen(_bwFehler('Die Bewertungsliste ist nicht ladbar.',e));
    try{ console.error('[Bewertung] cb_admin_stamm_bewertung_queue:',e); }catch(_){}
  }
}

function bewertungFilter(k){
  if(_BWQ_LAEUFT) return;
  _BWQ_FILTER=(k==='auto'||k==='sonderfall')?k:'alle';
  bewertungLaden();
}

/* --------------------------------------------------- Vorschläge erzeugen */
async function bewertungVorschlaegeErzeugen(){
  if(_BWQ_LAEUFT) return;
  _BWQ_LAEUFT=true;
  try{
    var r=await client.rpc('cb_admin_stamm_bewertungsvorschlaege_erzeugen',{});
    if(r&&r.error) throw r.error;
    var n=(r&&r.data&&r.data.neu_erzeugt!=null)?r.data.neu_erzeugt:'?';
    alert(n+' neue Vorschläge gefunden.\n\nÜbernommen wurde nichts — das entscheidest du.');
  }catch(e){
    alert('Die Suche nach Vorschlägen ist fehlgeschlagen:\n\n'+((e&&e.message)||String(e)));
    try{ console.error('[Bewertung] vorschlaege_erzeugen:',e); }catch(_){}
  }finally{
    _BWQ_LAEUFT=false;
    bewertungLaden();
  }
}

/* ------------------------------------------------------- Einzelübernahme */
async function bewertungUebernehmen(cid,btn){
  if(!cid||_BWQ_LAEUFT) return;
  if(btn){ btn.disabled=true; btn.textContent='…'; }
  _BWQ_LAEUFT=true;
  try{
    var r=await client.rpc('cb_admin_stamm_bewertungsvorschlag_uebernehmen',
      {p_candidate_id:cid,p_grund:'Von Hand übernommen in der Bewertungsfläche.'});
    if(r&&r.error) throw r.error;
  }catch(e){
    alert('Übernahme fehlgeschlagen:\n\n'+((e&&e.message)||String(e)));
    try{ console.error('[Bewertung] vorschlag_uebernehmen:',e); }catch(_){}
  }finally{
    _BWQ_LAEUFT=false;
    bewertungLaden();
  }
}

/* --------------------------------------------------------- Sammelübernahme
   🔴 Das ist ein schreibender Sammelvorgang in einem fachlich gesperrten
   Bereich (B3: Ratings). Er läuft NUR auf Ralphs ausdrückliche Bestätigung,
   und die Bestätigung nennt die gemessene Zahl — nicht die Kategorie. */
async function bewertungAlleUebernehmen(){
  if(_BWQ_LAEUFT) return;
  var rows=(_BWQ&&Array.isArray(_BWQ.rows))?_BWQ.rows:[];
  var auto=rows.filter(function(r){ return r && r.sonderfall===false; });
  if(!auto.length){ alert('Es gibt gerade keinen hoch sicheren Vorschlag zum Übernehmen.'); return; }
  var namen=auto.slice(0,8).map(function(r){
    return '  · '+(r.canonical_name||'?')+'  →  '+r.vorgeschlagene_bewertung; }).join('\n');
  if(!confirm('Auf dieser Seite stehen '+auto.length+' hoch sichere Vorschläge.\n\n'
    +namen+(auto.length>8?('\n  · … und '+(auto.length-8)+' weitere'):'')
    +'\n\nAlle übernehmen? Jede Note kommt aus einer aktiven Regel.\n'
    +'Zurücknehmen geht danach nur einzeln im Stamm.')) return;
  _BWQ_LAEUFT=true;
  try{
    var r=await client.rpc('cb_admin_stamm_bewertungen_auto_uebernehmen',{p_limit:auto.length});
    if(r&&r.error) throw r.error;
    var n=(r&&r.data&&r.data.uebernommen!=null)?r.data.uebernommen:'?';
    alert(n+' von '+auto.length+' übernommen.');
  }catch(e){
    alert('Die Sammelübernahme ist fehlgeschlagen:\n\n'+((e&&e.message)||String(e)));
    try{ console.error('[Bewertung] auto_uebernehmen:',e); }catch(_){}
  }finally{
    _BWQ_LAEUFT=false;
    bewertungLaden();
  }
}

function bewertungOeffnen(){
  try{ if(typeof adminDrawerClose==='function') adminDrawerClose(); }catch(e){}
  _BWQ_FILTER='alle';
  bewertungLaden();
}

if(typeof window!=='undefined'){
  window.bewertungOeffnen=bewertungOeffnen;
  window.bewertungLaden=bewertungLaden;
  window.bewertungZu=bewertungZu;
  window.bewertungFilter=bewertungFilter;
  window.bewertungUebernehmen=bewertungUebernehmen;
  window.bewertungAlleUebernehmen=bewertungAlleUebernehmen;
  window.bewertungVorschlaegeErzeugen=bewertungVorschlaegeErzeugen;
  window._bwZeile=_bwZeile;
  window._bwKopf=_bwKopf;
}
