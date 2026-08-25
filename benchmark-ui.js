/* ============================================================================
   BENCHMARK CONTROL BOARD  ·  Ralph-Auftrag 25.08.2026
   ----------------------------------------------------------------------------
   ZWECK: Ralph sieht in zehn Sekunden, ob das Gesamtsystem grün ist, welcher
   Referenzfall rot ist, ob es eine Regression ist, was fehlt und wer den
   letzten Lauf erzeugt hat.

   🔴 KEIN NEUBAU, KEIN ZWEITER WEG (§4.2). Alles kommt aus zwei vorhandenen
   Admin-RPCs, die ChatGPT gebaut hat:
     cb_admin_benchmark_summary()        -> Kopfzahlen und suite_pass
     cb_admin_benchmark_control_board()  -> eine Zeile je Case, 44 Spalten
   Diese Datei RECHNET NICHTS AUS. Sie zeigt an, was der Server entschieden hat.
   Kein Status wird hier abgeleitet, keine Zahl hier gebildet.

   EIGENE DATEI, NICHT dashboard-ui.js: an dashboard-ui.js arbeitet parallel ein
   zweiter Strang. Eine eigene Datei kollidiert nicht und ist die Richtung, die
   Hauptpfad 1 ohnehin vorgegeben hat.

   ⚠️ ZWEI EHRLICHE GRENZEN, gemessen am 25.08.2026 22:07:
   1. cost_usd, latency_ms, trace_ref, environment_fingerprint, prompt_version
      und tools_version sind in ALLEN vier Zeilen NULL. Der Vertrag hat die
      Spalten, die Läufe füllen sie nicht. Angezeigt wird "nicht erfasst" —
      nicht geraten und nicht mit 0 verwechselt (§1).
      (model_name, workflow_version und harness_version waren um 19:54 noch leer
      und sind seit dem Lauf um 22:03 gefüllt: claude-opus-5 / benchmark_runner_v2.
      Genau deshalb wird hier gemessen und nicht erinnert — §2.)
   2. Der Server liefert KEINEN Status je Dimension, nur `status` je Case und
      eine Liste `failures`. Die Dimensionsampel unten liest genau diese Liste:
      steht die Dimension in failures, ist sie rot; lief der Case und steht sie
      nicht drin, ist sie grün; lief er nicht, ist sie grau. Das ist Lesen einer
      Serverentscheidung, kein zweites Urteil.
   ========================================================================== */

var _BM_STATE = null;

/* Welche gemessenen Schlüssel zu welcher Rubrik-Dimension gehören.
   🔴 DAS IST EINE ANZEIGEZUORDNUNG, KEIN URTEIL. Sie entscheidet nur, welche
   Zahl neben welcher Überschrift steht. Über PASS/FAIL entscheidet sie nichts —
   das kommt aus `status` und `failures` vom Server. Gehört langfristig in den
   Serververtrag; solange sie hier steht, steht sie an EINER Stelle. */
var _BM_DIM_FELDER = {
  identity:        ['product_status','verified','gtin','gtin_verified','pack_size'],
  sources:         ['source','sources'],
  ingredients:     ['ingredients_total','ingredients_bound','ingredient_rating'],
  bindings:        ['ingredients_bound','ingredients_total'],
  nutrition:       ['nutrition_complete','nutrition_basis','matrix_state'],
  micronutrients:  ['micronutrients','q10_mg','l_carnitine_mg'],
  score:           ['score_complete','clean_score','rating','processing_modifier'],
  release:         ['release_ready','product_status'],
  conflicts:       ['ingredient_conflict','conflict_must_remain_open'],
  reproducibility: ['reproducible','repro']
};

var _BM_DIM_NAME = {
  identity:'Identität', sources:'Quellen', ingredients:'Zutaten', bindings:'Bindungen',
  nutrition:'Nährwerte', micronutrients:'Mikronährstoffe', score:'Score',
  release:'Freigabe', conflicts:'Konflikte', reproducibility:'Reproduzierbarkeit'
};

function _bmEsc(s){
  if(typeof esc==='function') return esc(s==null?'':String(s));
  return String(s==null?'':s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
}

/* Ein fehlender Wert ist ein fehlender Wert. Niemals 0, niemals "-", niemals
   ein plausibler Platzhalter (§1). */
function _bmWert(v){
  if(v===null||v===undefined||v==='') return '<i style="opacity:.5">nicht erfasst</i>';
  if(v===true)  return 'ja';
  if(v===false) return 'nein';
  if(typeof v==='object') return _bmEsc(JSON.stringify(v));
  return _bmEsc(v);
}

function _bmDatum(iso){
  if(!iso) return null;
  try{
    var d=new Date(iso);
    if(isNaN(d.getTime())) return String(iso);
    return d.toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',
                                    hour:'2-digit',minute:'2-digit'});
  }catch(e){ return String(iso); }
}

function _bmDauer(ms){
  if(ms===null||ms===undefined) return null;
  var n=Number(ms); if(!isFinite(n)) return null;
  if(n<1000) return n+' ms';
  if(n<60000) return (n/1000).toFixed(1).replace('.',',')+' s';
  return Math.floor(n/60000)+' min '+Math.round((n%60000)/1000)+' s';
}

/* ── Statusfarben ────────────────────────────────────────────────────────── */
var _BM_ST = {
  pass:    {t:'PASS',       bg:'#e8f6ec', fg:'#1a7f37', li:'#8fd6a4'},
  fail:    {t:'FAIL',       bg:'#fdeaea', fg:'#b3261e', li:'#f0a9a4'},
  blocked: {t:'BLOCKED',    bg:'#fdf0e3', fg:'#9a5b06', li:'#f0c48a'},
  not_run: {t:'NICHT GELAUFEN', bg:'#eef1f4', fg:'#5b6b7a', li:'#cbd5df'}
};
function _bmSt(s){ return _BM_ST[String(s||'').toLowerCase()] || _BM_ST.not_run; }

/* ── Overlay ─────────────────────────────────────────────────────────────── */
function _bmBox(){
  var b=document.getElementById('bmBox');
  if(b) return b;
  b=document.createElement('div');
  b.id='bmBox';
  b.style.cssText='position:fixed;inset:0;z-index:9100;display:none;'
    +'background:rgba(15,23,32,.5);backdrop-filter:blur(2px);overflow:auto';
  b.addEventListener('click',function(e){ if(e.target===b) benchmarkBoardZu(); });
  document.body.appendChild(b);
  return b;
}
function benchmarkBoardZu(){
  var b=document.getElementById('bmBox'); if(b) b.style.display='none';
}
function _bmRahmen(inhalt, kopf){
  return '<div style="max-width:1180px;margin:22px auto;background:var(--card,#fff);'
    +'color:var(--ink,#1b2733);border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,.28);'
    +'overflow:hidden">'
    +'<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;'
      +'border-bottom:1px solid var(--line,#dbe3ea)">'
      +'<b style="font-size:15px;letter-spacing:.4px">🎯 BENCHMARK CONTROL</b>'
      +(kopf||'')
      +'<button type="button" onclick="benchmarkBoardLaden()" style="margin-left:auto;'
        +'border:1px solid var(--line,#dbe3ea);border-radius:8px;background:var(--bg,#f4f6f8);'
        +'color:inherit;padding:6px 12px;font-size:12.5px;cursor:pointer">↻ Aktualisieren</button>'
      +'<button type="button" onclick="benchmarkBoardZu()" style="border:1px solid '
        +'var(--line,#dbe3ea);border-radius:8px;background:var(--bg,#f4f6f8);color:inherit;'
        +'padding:6px 12px;font-size:12.5px;cursor:pointer">Schließen ✕</button>'
    +'</div>'
    +'<div style="padding:16px 18px 24px">'+inhalt+'</div>'
  +'</div>';
}

/* ── Kopf: vier Kennzahlen und der Gesamtstatus ──────────────────────────── */
function _bmKopf(s){
  s=s||{};
  var bestanden = s.suite_pass===true;
  var kachel=function(zahl,label,farbe,dick){
    return '<div style="flex:1 1 0;min-width:120px;background:var(--bg,#f6f8fa);'
      +'border:1px solid var(--line,#e3e9ef);border-radius:11px;padding:12px 14px">'
      +'<div style="font-size:26px;font-weight:700;line-height:1.1;color:'+farbe+'">'
        +(zahl==null?'–':_bmEsc(zahl))+'</div>'
      +'<div style="font-size:11px;letter-spacing:.6px;opacity:.7;margin-top:3px">'
        +_bmEsc(label)+'</div>'
    +'</div>';
  };
  var ampel = bestanden
    ? '<div style="background:#e8f6ec;border:1px solid #8fd6a4;color:#1a7f37;border-radius:11px;'
        +'padding:13px 18px;font-size:16px;font-weight:700;letter-spacing:.5px">'
        +'🟢 SUITE BESTANDEN</div>'
    : '<div style="background:#fdeaea;border:1px solid #f0a9a4;color:#b3261e;border-radius:11px;'
        +'padding:13px 18px;font-size:16px;font-weight:700;letter-spacing:.5px">'
        +'🔴 SUITE NICHT BESTANDEN</div>';

  /* Warum nicht bestanden — ohne diesen Satz ist die rote Ampel eine Behauptung. */
  var grund='';
  if(!bestanden){
    var g=[];
    if(Number(s.fail||0)>0)        g.push(s.fail+'× FAIL');
    if(Number(s.blocked||0)>0)     g.push(s.blocked+'× BLOCKED');
    if(Number(s.not_run||0)>0)     g.push(s.not_run+'× nie gelaufen');
    if(Number(s.regressions||0)>0) g.push(s.regressions+'× Regression');
    grund = g.length
      ? '<div style="font-size:12px;opacity:.75;margin-top:7px">Grund: '+_bmEsc(g.join(' · '))+'</div>'
      : '';
  }

  return '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:stretch;margin-bottom:6px">'
      +kachel(s.pass,'PASS','#1a7f37')
      +kachel((Number(s.fail||0)+Number(s.blocked||0)),'FAIL / BLOCKED',
              (Number(s.fail||0)+Number(s.blocked||0))>0?'#b3261e':'inherit')
      +kachel(s.not_run,'NICHT GELAUFEN', Number(s.not_run||0)>0?'#9a5b06':'inherit')
      +kachel(s.regressions,'REGRESSIONEN', Number(s.regressions||0)>0?'#b3261e':'inherit')
    +'</div>'
    +'<div style="margin:12px 0 18px">'+ampel+grund+'</div>';
}

/* ── Dimensionen ─────────────────────────────────────────────────────────── */
/* Die Fehlerliste des Servers kann Strings oder Objekte enthalten. Beides wird
   akzeptiert; erfunden wird nichts. Was sich keiner Dimension zuordnen lässt,
   erscheint unten als eigener Fehlerpunkt, statt still zu verschwinden. */
function _bmFehlerDimensionen(failures){
  var m={};
  (failures||[]).forEach(function(f){
    var d = (typeof f==='string') ? f : (f && (f.dimension||f.dim||f.key||f.name));
    if(d) m[String(d).toLowerCase()]=f;
  });
  return m;
}

function _bmDimensionen(r){
  var rub=r.rubric||{};
  var keys=Object.keys(rub);
  if(!keys.length) return '<div style="font-size:12px;opacity:.6">Kein Rubric hinterlegt.</div>';
  var gelaufen = String(r.status||'').toLowerCase()!=='not_run';
  var fehl=_bmFehlerDimensionen(r.failures);
  var gem=r.dimensions||{};
  var soll=r.expected_state||{};

  var zeilen=keys.sort().map(function(k){
    var kl=String(k).toLowerCase();
    var st = !gelaufen ? 'unknown' : (fehl[kl] ? 'fail' : 'pass');
    var farbe = st==='pass' ? '#1a7f37' : st==='fail' ? '#b3261e' : '#7b8794';
    var zeichen= st==='pass' ? '●' : st==='fail' ? '●' : '○';
    var text  = st==='pass' ? 'PASS' : st==='fail' ? 'FAIL' : 'UNKNOWN';

    /* Messwerte dieser Dimension — nur die, die es wirklich gibt. */
    var felder=_BM_DIM_FELDER[kl]||[];
    var teile=[];
    felder.forEach(function(f){
      if(Object.prototype.hasOwnProperty.call(gem,f))
        teile.push(_bmEsc(f)+' = <b>'+_bmWert(gem[f])+'</b>');
      else if(Object.prototype.hasOwnProperty.call(soll,f))
        teile.push(_bmEsc(f)+' soll <b>'+_bmWert(soll[f])+'</b>');
    });
    var mess = teile.length
      ? teile.join(' · ')
      : '<i style="opacity:.5">kein Messwert im Vertrag</i>';

    var grund = fehl[kl] && typeof fehl[kl]==='object' && fehl[kl].message
      ? '<div style="font-size:11.5px;color:#b3261e;margin-top:2px">'
          +_bmEsc(fehl[kl].message)+'</div>' : '';

    return '<div style="display:flex;gap:9px;align-items:flex-start;padding:6px 0;'
      +'border-bottom:1px dashed var(--line,#eef2f6)">'
      +'<span style="flex:0 0 auto;color:'+farbe+';font-size:13px;line-height:1.5">'+zeichen+'</span>'
      +'<span style="flex:0 0 128px;font-size:12.5px;font-weight:600">'
        +_bmEsc(_BM_DIM_NAME[kl]||k)+'</span>'
      +'<span style="flex:0 0 62px;font-size:11px;font-weight:700;color:'+farbe+'">'
        +text+'</span>'
      +'<span style="flex:1 1 auto;min-width:0;font-size:12px;opacity:.85;overflow-wrap:anywhere">'
        +mess+grund+'</span>'
    +'</div>';
  }).join('');

  /* Fehler, die zu keiner Rubrik-Dimension gehören, gehen nicht verloren. */
  var rest=(r.failures||[]).filter(function(f){
    var d=(typeof f==='string')?f:(f&&(f.dimension||f.dim||f.key||f.name));
    return !d || !Object.prototype.hasOwnProperty.call(rub, String(d));
  });
  var restH = rest.length
    ? '<div style="margin-top:8px;font-size:12px;color:#b3261e">Weitere Fehler: '
        +_bmEsc(JSON.stringify(rest))+'</div>' : '';

  return zeilen+restH
    +'<div style="font-size:10.5px;opacity:.55;margin-top:8px;line-height:1.5">'
      +'Ampel je Dimension aus der Fehlerliste des Servers gelesen: steht die Dimension '
      +'in <code>failures</code>, ist sie rot. Der Case-Status selbst kommt unverändert '
      +'aus <code>status</code>.</div>';
}

/* ── Beleg-Ebene ─────────────────────────────────────────────────────────── */
function _bmBeleg(r){
  var z=[];
  var add=function(l,v){ z.push('<div style="display:flex;gap:8px;padding:3px 0">'
    +'<span style="flex:0 0 168px;font-size:11.5px;opacity:.65">'+_bmEsc(l)+'</span>'
    +'<span style="flex:1 1 auto;font-size:12px;overflow-wrap:anywhere">'+v+'</span></div>'); };

  add('Grader gesamt', r.grader_count==null?_bmWert(null):_bmEsc(r.grader_count));
  add('davon PASS / FAIL / offen',
      _bmEsc((r.grader_pass==null?'–':r.grader_pass)+' / '
            +(r.grader_fail==null?'–':r.grader_fail)+' / '
            +(r.grader_unknown==null?'–':r.grader_unknown)));
  add('Bewertet von', _bmWert(r.evaluated_by));
  add('Menschliche Prüfung nötig', _bmWert(r.human_review_required));
  add('Trace-Referenz', _bmWert(r.trace_ref));
  add('Umgebung', _bmWert(r.environment_fingerprint));
  add('Prompt-Version', _bmWert(r.prompt_version));
  add('Tools-Version', _bmWert(r.tools_version));
  add('Trial', _bmWert(r.trial_index));
  add('Lauf-Status', _bmWert(r.run_status));
  add('Abbruchgrund', _bmWert(r.exit_reason));

  var wids=(r.linked_work_ids||[]);
  add('Work Items', wids.length
    ? wids.map(function(w){ return '<span style="display:inline-block;border:1px solid '
        +'var(--line,#dbe3ea);border-radius:6px;padding:1px 7px;margin:0 4px 4px 0;'
        +'font-size:11.5px">#'+_bmEsc(w)+'</span>'; }).join('')
    : '<i style="opacity:.5">keines zugeordnet</i>');

  /* Evidence lesbar, nicht als Wand — Schlüssel benannt, Werte daneben. */
  var ev=r.evidence;
  var evH;
  if(ev && typeof ev==='object' && Object.keys(ev).length){
    evH=Object.keys(ev).sort().map(function(k){
      return '<div style="display:flex;gap:8px;padding:2px 0">'
        +'<span style="flex:0 0 168px;font-size:11.5px;opacity:.65">'+_bmEsc(k)+'</span>'
        +'<span style="flex:1 1 auto;font-size:12px;overflow-wrap:anywhere">'
          +_bmWert(ev[k])+'</span></div>';
    }).join('');
  } else {
    evH='<div style="font-size:12px;opacity:.5">Kein Beleg hinterlegt.</div>';
  }

  return '<div style="background:var(--bg,#f6f8fa);border:1px solid var(--line,#e3e9ef);'
      +'border-radius:10px;padding:11px 13px;margin-top:10px">'
    +'<div style="font-size:11px;letter-spacing:.6px;opacity:.7;margin-bottom:6px">LAUF UND GRADER</div>'
    +z.join('')
    +'<div style="font-size:11px;letter-spacing:.6px;opacity:.7;margin:11px 0 6px">BELEG</div>'
    +evH
  +'</div>';
}

/* ── Eine Fallkarte ──────────────────────────────────────────────────────── */
function _bmKarte(r,i){
  var st=_bmSt(r.status);
  var istPass = String(r.status||'').toLowerCase()==='pass';
  var regress = r.regression===true;

  /* Die Regressionsfahne steht ÜBER dem Status: vorher grün, jetzt rot ist
     schlimmer als ein Fall, der noch nie lief. */
  var fahne = regress
    ? '<div style="background:#b3261e;color:#fff;border-radius:8px;padding:7px 11px;'
        +'font-size:12.5px;font-weight:700;margin-bottom:9px">⚠️ REGRESSION — vorher '
        +_bmEsc(String(r.previous_status||'PASS').toUpperCase())+', jetzt '
        +_bmEsc(String(r.status||'').toUpperCase())+'</div>'
    : '';

  var kopfz='<div style="display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap">'
    +'<div style="flex:1 1 260px;min-width:0">'
      +'<div style="font-size:14px;font-weight:700;overflow-wrap:anywhere">'
        +_bmEsc(r.title||r.case_key||'')+'</div>'
      +'<div style="font-size:11.5px;opacity:.7;margin-top:2px;overflow-wrap:anywhere">'
        +_bmEsc(r.case_key||'')
        +(r.product_id?' · '+_bmEsc(r.product_id):' · <i>keine Produkt-ID</i>')
      +'</div>'
    +'</div>'
    +'<div style="flex:0 0 auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap">'
      +'<span style="border:1px solid var(--line,#dbe3ea);border-radius:20px;padding:2px 10px;'
        +'font-size:11px;opacity:.85">'+_bmEsc(r.suite_kind==='regression'?'Regression':'Capability')+'</span>'
      +(r.critical
          ? '<span style="border:1px solid #f0a9a4;background:#fdeaea;color:#b3261e;'
              +'border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700">critical</span>'
          : '<span style="border:1px solid var(--line,#dbe3ea);border-radius:20px;'
              +'padding:2px 10px;font-size:11px;opacity:.6">nicht critical</span>')
      +'<span style="background:'+st.bg+';color:'+st.fg+';border:1px solid '+st.li+';'
        +'border-radius:8px;padding:4px 12px;font-size:12.5px;font-weight:700">'+st.t+'</span>'
    +'</div>'
  +'</div>';

  /* Sollziel — kurz, aus expected_state. */
  var soll=r.expected_state||{};
  var sollH=Object.keys(soll).length
    ? '<div style="margin-top:9px;font-size:12px;opacity:.85">'
        +'<span style="opacity:.65">Soll: </span>'
        +Object.keys(soll).sort().map(function(k){
            return _bmEsc(k)+' <b>'+_bmWert(soll[k])+'</b>'; }).join(' · ')
      +'</div>'
    : '';

  /* Herkunft des Ergebnisses — Ralphs Frage 5. */
  var herk=[
    ['Letzter Lauf', r.run_label],
    ['Modell', r.model_name],
    ['Workflow', r.workflow_version],
    ['Harness', r.harness_version],
    ['Datum', _bmDatum(r.evaluated_at)],
    ['Laufzeit', _bmDauer(r.latency_ms)],
    ['Kosten', r.cost_usd==null?null:(String(r.cost_usd).replace('.',',')+' $')]
  ].map(function(p){
    return '<div style="flex:1 1 150px;min-width:130px">'
      +'<div style="font-size:10.5px;letter-spacing:.5px;opacity:.6">'+_bmEsc(p[0])+'</div>'
      +'<div style="font-size:12px;margin-top:1px;overflow-wrap:anywhere">'+_bmWert(p[1])+'</div>'
    +'</div>';
  }).join('');

  /* Bei FAIL/BLOCKED steht der Fehler SOFORT da, nicht hinter einem Menü. */
  var fehlerH='';
  if(!istPass && String(r.status||'').toLowerCase()!=='not_run'){
    var fs=r.failures||[];
    fehlerH='<div style="margin-top:10px;background:#fdeaea;border:1px solid #f0a9a4;'
        +'border-radius:10px;padding:10px 12px">'
      +'<div style="font-size:11px;letter-spacing:.6px;color:#b3261e;font-weight:700;'
        +'margin-bottom:5px">WAS FEHLGESCHLAGEN IST</div>'
      +(fs.length
        ? fs.map(function(f){
            var t=(typeof f==='string')?f:(f&&(f.message||f.detail))||JSON.stringify(f);
            return '<div style="font-size:12.5px;color:#7f1d1a;padding:2px 0;'
              +'overflow-wrap:anywhere">· '+_bmEsc(t)+'</div>'; }).join('')
        : '<div style="font-size:12.5px;color:#7f1d1a">Der Server meldet den Status '
            +_bmEsc(String(r.status).toUpperCase())+', aber keine Einzelfehler. '
            +'Die Ursache steht damit noch nicht im Vertrag.</div>')
    +'</div>';
  }
  if(String(r.status||'').toLowerCase()==='not_run'){
    fehlerH='<div style="margin-top:10px;background:#fdf6ec;border:1px solid #f0d3a4;'
        +'border-radius:10px;padding:9px 12px;font-size:12.5px;color:#7a4e06">'
      +'Dieser Fall ist nie gelaufen. Es gibt kein Ergebnis — weder gut noch schlecht.</div>';
  }

  var id='bmC'+i;
  return '<div style="border:1px solid '+(regress?'#f0a9a4':'var(--line,#e3e9ef)')+';'
      +'border-left:5px solid '+st.fg+';border-radius:12px;padding:13px 15px;'
      +'margin-bottom:12px;background:var(--card,#fff)">'
    +fahne
    +kopfz
    +sollH
    +fehlerH
    +'<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:11px;padding-top:10px;'
      +'border-top:1px solid var(--line,#eef2f6)">'+herk+'</div>'
    +'<div style="display:flex;gap:8px;margin-top:11px">'
      +'<button type="button" onclick="_bmKlapp(\''+id+'d\')" style="border:1px solid '
        +'var(--line,#dbe3ea);border-radius:8px;background:var(--bg,#f4f6f8);color:inherit;'
        +'padding:5px 11px;font-size:12px;cursor:pointer">Dimensionen ▾</button>'
      +'<button type="button" onclick="_bmKlapp(\''+id+'e\')" style="border:1px solid '
        +'var(--line,#dbe3ea);border-radius:8px;background:var(--bg,#f4f6f8);color:inherit;'
        +'padding:5px 11px;font-size:12px;cursor:pointer">Beleg und Trace ▾</button>'
    +'</div>'
    +'<div id="'+id+'d" style="display:none;margin-top:10px">'+_bmDimensionen(r)+'</div>'
    +'<div id="'+id+'e" style="display:none">'+_bmBeleg(r)+'</div>'
  +'</div>';
}

function _bmKlapp(id){
  var e=document.getElementById(id); if(!e) return;
  e.style.display = (e.style.display==='none') ? '' : 'none';
}

/* ── Laden und Zeichnen ──────────────────────────────────────────────────── */
async function benchmarkBoardLaden(){
  var b=_bmBox();
  b.style.display='block';
  b.innerHTML=_bmRahmen('<div style="padding:26px 0;font-size:13px;opacity:.7">lädt…</div>');
  try{
    var rs = await Promise.all([
      client.rpc('cb_admin_benchmark_summary'),
      client.rpc('cb_admin_benchmark_control_board')
    ]);
    if(rs[0]&&rs[0].error) throw rs[0].error;
    if(rs[1]&&rs[1].error) throw rs[1].error;
    var s=rs[0]&&rs[0].data; if(typeof s==='string') s=JSON.parse(s);
    var rows=(rs[1]&&rs[1].data)||[];
    if(!Array.isArray(rows)) rows=[rows];
    _BM_STATE={summary:s, rows:rows};

    /* Reihenfolge nach Dringlichkeit: Regression, dann rot, dann nie gelaufen,
       dann grün. Ralph soll nicht suchen müssen. */
    var rang={fail:1, blocked:2, not_run:3, pass:4};
    rows=rows.slice().sort(function(a,c){
      if((c.regression===true)-(a.regression===true)) return (c.regression===true)-(a.regression===true);
      var ra=rang[String(a.status||'').toLowerCase()]||9,
          rc=rang[String(c.status||'').toLowerCase()]||9;
      if(ra!==rc) return ra-rc;
      if((c.critical===true)-(a.critical===true)) return (c.critical===true)-(a.critical===true);
      return String(a.case_key||'').localeCompare(String(c.case_key||''));
    });

    var h=_bmKopf(s)
      +'<div style="font-size:11px;letter-spacing:.6px;opacity:.7;margin:4px 0 9px">'
        +'REFERENZFÄLLE ('+rows.length+') — oben steht, was am dringendsten ist</div>'
      +(rows.length
        ? rows.map(function(r,i){ return _bmKarte(r,i); }).join('')
        : '<div style="font-size:12.5px;opacity:.6">Der Server liefert keine Fälle.</div>')
      /* Der Riegel aus Ralphs Regel, sichtbar und nicht nur im Kopf. */
      +'<div style="margin-top:14px;padding:10px 13px;border:1px dashed var(--line,#dbe3ea);'
        +'border-radius:10px;font-size:11.5px;opacity:.75;line-height:1.6">'
        +'<b>Benchmark schlägt Work Item.</b> Ein fertig gemeldetes Work Item macht einen '
        +'roten Fall nicht grün. Grün wird er allein durch einen neuen erfolgreichen '
        +'Eval-Lauf. Die Work Items unter „Beleg und Trace" sind einem Fehler zugeordnet, '
        +'sie ersetzen ihn nicht.</div>';

    b.innerHTML=_bmRahmen(h);
  }catch(e){
    b.innerHTML=_bmRahmen('<div style="background:#fdeaea;border:1px solid #f0a9a4;'
      +'border-radius:10px;padding:12px 14px;color:#b3261e;font-size:13px">'
      +'<b>Board nicht ladbar.</b><br>'+_bmEsc((e&&e.message)||String(e))+'</div>');
    try{ console.error('[Benchmark]',e); }catch(_){}
  }
}

function benchmarkBoardOpen(){
  try{ if(typeof adminDrawerClose==='function') adminDrawerClose(); }catch(e){}
  benchmarkBoardLaden();
}

if(typeof window!=='undefined'){
  window.benchmarkBoardOpen = benchmarkBoardOpen;
  window.benchmarkBoardLaden = benchmarkBoardLaden;
  window.benchmarkBoardZu = benchmarkBoardZu;
  window._bmKlapp = _bmKlapp;
}
