/* ============================================================================
   DIE NOTENLEITER  ·  Ralph-Auftrag 26.08.2026
   ----------------------------------------------------------------------------
   „ich will, dass du das Regelstaffel-Ding im Admin einbaust … die Entscheidung,
   was wo hin kommt, muss ich auch ohne KI treffen können, das kann ich aktuell
   nicht."

   ZWECK: Ralph hat eine neue Zutat vor sich und muss selbst entscheiden, welche
   Note sie bekommt. Dafür braucht er zwei Dinge, und nur die:
     1. eine Leiter mit zehn Sprossen und der Frage, die jede Sprosse stellt
     2. die schon entschiedenen Zutaten als Vergleich — „meine ist wie Kakao"

   🔴 KEINE NEUEN REGELN, KEINE ZWEITE WAHRHEIT. Alles kommt aus der vorhandenen
   Tabelle Bewertungsregeln über die vorhandene RPC cb_admin_bewertungsregeln_suchen.
   Diese Datei rechnet nichts und entscheidet nichts — sie sortiert, was da ist.

   Die Sprossentexte sind AUS DEN TITELN der Staffeln auf der jeweiligen Stufe
   abgeleitet und als solche gekennzeichnet. Sie stehen nicht in der Datenbank;
   wer sie ändert, ändert nur die Lesehilfe, nicht die Regel.
   ========================================================================== */

var _STF = null;      /* geladene Regeln */
var _STF_WAHL = null; /* gerade aufgeklappte Staffel */

/* Was fragt jede Sprosse? Abgeleitet aus den Titeln der Staffeln dort. */
var _STF_SPROSSE = {
  10:{kurz:'roh, unbehandelt',        frage:'Kommt es so aus der Natur? Nichts entzogen, nichts erhitzt.'},
   9:{kurz:'schonend behandelt',      frage:'Nur haltbar gemacht oder leicht gegart — die Matrix bleibt ganz.'},
   8:{kurz:'ganzer Rohstoff',         frage:'Mechanisch zerkleinert, gepresst, fermentiert — nichts abgetrennt.'},
   7:{kurz:'leicht getrennt',         frage:'Ein Teil ist raus, das meiste ist noch da.'},
   6:{kurz:'Fraktion',                frage:'Ein Bestandteil wurde herausgeholt — Mehl, Pulver, Endosperm.'},
   5:{kurz:'Auszug oder Konzentrat',  frage:'Extrahiert, eingedickt, gereinigt. Das Ausgangsprodukt ist nicht mehr erkennbar.'},
   4:{kurz:'stark gereinigt',         frage:'Raffiniert, verestert, umgebaut — aber noch aus dem Rohstoff.'},
   3:{kurz:'reiner Einzelstoff',      frage:'Chemisch benannt, hochrein, definiert.'},
   2:{kurz:'chemisch umgewandelt',    frage:'Thermisch oder chemisch zu etwas Neuem gemacht.'},
   1:{kurz:'—',                       frage:'Bisher nicht vergeben.'}
};
var _STF_FARBE = {10:'#0f7a3d',9:'#1a9150',8:'#3aa860',7:'#7cb342',6:'#b0a12a',
                  5:'#c9911f',4:'#d1761c',3:'#c4551f',2:'#b3261e',1:'#8c1a10'};

function _stfEsc(s){
  if(typeof esc==='function') return esc(s==null?'':String(s));
  return String(s==null?'':s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
}

function _stfBox(){
  var b=document.getElementById('stfBox');
  if(b) return b;
  b=document.createElement('div'); b.id='stfBox';
  b.style.cssText='position:fixed;inset:0;z-index:9100;display:none;'
    +'background:rgba(15,23,32,.5);backdrop-filter:blur(2px);overflow:auto';
  b.addEventListener('click',function(e){ if(e.target===b) staffelnZu(); });
  document.body.appendChild(b);
  return b;
}
function staffelnZu(){ var b=document.getElementById('stfBox'); if(b) b.style.display='none'; }

function _stfRahmen(inhalt){
  return '<div style="max-width:1120px;margin:22px auto;background:var(--card,#fff);'
    +'color:var(--ink,#1b2733);border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,.28);overflow:hidden">'
    +'<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;'
      +'border-bottom:1px solid var(--line,#dbe3ea)">'
      +'<b style="font-size:15px;letter-spacing:.4px">🪜 DIE NOTENLEITER</b>'
      +'<span style="font-size:12px;opacity:.65">Welche Note bekommt eine Zutat — und warum</span>'
      +'<button type="button" onclick="staffelnZu()" style="margin-left:auto;border:1px solid '
        +'var(--line,#dbe3ea);border-radius:8px;background:var(--bg,#f4f6f8);color:inherit;'
        +'padding:6px 12px;font-size:12.5px;cursor:pointer">Schließen ✕</button>'
    +'</div><div style="padding:16px 18px 26px">'+inhalt+'</div></div>';
}

/* Die drei Prinzipien, die bei der Entscheidung wirklich helfen. Die übrigen
   sieben regeln anderes (Siegel, Supplements, Doppelbestrafung) und würden hier
   nur ablenken — sie stehen vollständig im Regelwerk. */
var _STF_HILFT = ['p3','p7','p9'];

function _stfKopf(prinzipien){
  var p=prinzipien.filter(function(x){ return _STF_HILFT.indexOf(x.schluessel)>=0; });
  return '<div style="background:var(--bg,#f6f8fa);border:1px solid var(--line,#e3e9ef);'
      +'border-radius:12px;padding:14px 16px;margin-bottom:18px">'
    +'<div style="font-size:13.5px;font-weight:700;margin-bottom:8px">So entscheidest du</div>'
    +'<div style="font-size:13.5px;line-height:1.6;margin-bottom:10px">'
      +'Die Note misst <b>nur eines</b>: wie weit die Zutat vom Rohstoff entfernt ist. '
      +'Nicht ob sie gesund ist, nicht ob sie bio ist. Such die Sprosse, deren Frage du '
      +'mit ja beantwortest — und vergleiche mit den Zutaten, die schon dort stehen.'
    +'</div>'
    + p.map(function(x){
        return '<div style="display:flex;gap:8px;padding:3px 0;font-size:12.5px">'
          +'<b style="flex:0 0 26px;opacity:.6">'+_stfEsc(x.schluessel)+'</b>'
          +'<span>'+_stfEsc(x.titel)+'</span></div>';
      }).join('')
  +'</div>';
}

function _stfSuche(){
  return '<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px">'
    +'<input id="stfSuche" placeholder="Zutat suchen — z. B. Kakao, Öl, Sirup …" '
      +'oninput="_stfMal()" style="flex:1 1 auto;padding:9px 12px;border:1px solid '
      +'var(--line,#dbe3ea);border-radius:9px;background:var(--card,#fff);color:inherit;font-size:13.5px">'
    +'<span id="stfTreffer" style="font-size:12px;opacity:.65;white-space:nowrap"></span>'
  +'</div>';
}

/* Eine Sprosse: Note, Frage, und die Zutaten, die dort stehen. */
function _stfSprosseHtml(note, liste, suche){
  var s=_STF_SPROSSE[note]||{kurz:'',frage:''};
  var f=_STF_FARBE[note]||'#7b8794';
  var chips=liste.map(function(r){
    var an=(_STF_WAHL===r.id);
    return '<span class="stfChip" data-id="'+_stfEsc(r.id)+'" style="display:inline-block;'
      +'border:1px solid '+(an?f:'var(--line,#dbe3ea)')+';background:'+(an?f+'18':'transparent')+';'
      +'border-radius:7px;padding:3px 9px;margin:0 5px 5px 0;font-size:12px;cursor:pointer">'
      +_stfEsc(r.schluessel)+'</span>';
  }).join('');
  var offen='';
  var gewaehlt=liste.filter(function(r){ return r.id===_STF_WAHL; })[0];
  if(gewaehlt){
    offen='<div style="margin-top:8px;background:var(--bg,#f6f8fa);border:1px solid '
      +'var(--line,#e3e9ef);border-radius:10px;padding:11px 13px">'
      +'<div style="font-weight:700;font-size:13px;margin-bottom:5px">'+_stfEsc(gewaehlt.titel)+'</div>'
      +'<div style="font-size:12.5px;line-height:1.55;white-space:pre-wrap">'
        +_stfEsc(gewaehlt.inhalt||'Keine Herleitung hinterlegt.')+'</div>'
      +(gewaehlt.quelle
        ? '<div style="font-size:11.5px;opacity:.7;margin-top:7px;padding-top:6px;'
          +'border-top:1px solid var(--line,#e3e9ef)">Quelle: '+_stfEsc(gewaehlt.quelle)+'</div>'
        : '<div style="font-size:11.5px;color:#b3261e;margin-top:7px">Ohne Quellenbeleg.</div>')
    +'</div>';
  }
  return '<div style="display:flex;gap:14px;align-items:flex-start;padding:11px 0;'
      +'border-top:1px solid var(--line,#eef2f6)">'
    +'<div style="flex:0 0 54px;text-align:center">'
      +'<div style="font-size:26px;font-weight:800;line-height:1;color:'+f+'">'+note+'</div>'
      +'<div style="font-size:10px;opacity:.6;margin-top:2px">'+_stfEsc(s.kurz)+'</div></div>'
    +'<div style="flex:1 1 auto;min-width:0">'
      +'<div style="font-size:13px;margin-bottom:7px">'+_stfEsc(s.frage)+'</div>'
      +(liste.length?chips:'<span style="font-size:12px;opacity:.5">'
         +(suche?'kein Treffer auf dieser Sprosse':'noch keine Zutat auf dieser Sprosse')+'</span>')
      +offen
    +'</div>'
  +'</div>';
}

/* Familien: Staffeln, die eine Kette bilden (milch_10 … milch_2). Sie stehen
   ZUSÄTZLICH als Kette, weil man dort nicht die Sprosse sucht, sondern den
   Verarbeitungsschritt. */
function _stfFamilien(regeln){
  var fam={};
  regeln.forEach(function(r){
    var m=String(r.schluessel||'').match(/^([a-z_]+?)_(\d+)$/);
    if(!m) return;
    (fam[m[1]]=fam[m[1]]||[]).push({stufe:Number(m[2]), r:r});
  });
  var namen=Object.keys(fam).filter(function(k){ return fam[k].length>=3; }).sort();
  if(!namen.length) return '';
  return '<div style="margin-top:22px;padding-top:14px;border-top:2px solid var(--line,#e3e9ef)">'
    +'<div style="font-size:13.5px;font-weight:700;margin-bottom:4px">Ketten</div>'
    +'<div style="font-size:12.5px;opacity:.7;margin-bottom:10px">'
      +'Hier suchst du nicht die Sprosse, sondern den Verarbeitungsschritt. '
      +'Je weiter rechts, desto weiter vom Rohstoff weg.</div>'
    + namen.map(function(k){
        var kette=fam[k].sort(function(a,b){ return b.stufe-a.stufe; });
        return '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:5px 0">'
          +'<b style="flex:0 0 130px;font-size:12.5px">'+_stfEsc(k.replace(/_/g,' '))+'</b>'
          + kette.map(function(x,i){
              var f=_STF_FARBE[x.stufe]||'#7b8794';
              return (i?'<span style="opacity:.35">→</span>':'')
                +'<span class="stfChip" data-id="'+_stfEsc(x.r.id)+'" title="'+_stfEsc(x.r.titel)+'" '
                +'style="cursor:pointer;border:1px solid '+f+'55;border-radius:7px;padding:2px 8px;'
                +'font-size:12px;font-weight:700;color:'+f+'">'+x.stufe+'</span>';
            }).join('')
        +'</div>';
      }).join('')
  +'</div>';
}

function _stfMal(){
  var box=document.getElementById('stfInhalt'); if(!box||!_STF) return;
  var such=((document.getElementById('stfSuche')||{}).value||'').trim().toLowerCase();
  var staffeln=_STF.filter(function(r){ return r.bereich==='staffel'||r.bereich==='staffel7'; });
  var passt=function(r){
    if(!such) return true;
    return (String(r.schluessel||'')+' '+String(r.titel||'')).toLowerCase().indexOf(such)>=0;
  };
  var gefiltert=staffeln.filter(passt);
  var t=document.getElementById('stfTreffer');
  if(t) t.textContent = such ? (gefiltert.length+' von '+staffeln.length) : (staffeln.length+' Staffeln');

  var h='';
  for(var n=10;n>=2;n--){
    var auf=gefiltert.filter(function(r){ return String(r.wert)===String(n); });
    if(such && !auf.length) continue;                 /* bei Suche leere Sprossen weglassen */
    h+=_stfSprosseHtml(n, auf, such);
  }
  /* Staffeln mit Spanne wie „7 / 5" — sie hängen an einer Bedingung. */
  var spanne=gefiltert.filter(function(r){ return r.wert && !/^\d+$/.test(String(r.wert)); });
  if(spanne.length){
    h+='<div style="margin-top:16px;padding:11px 13px;border:1px dashed var(--line,#dbe3ea);'
      +'border-radius:10px"><div style="font-size:12.5px;font-weight:700;margin-bottom:6px">'
      +'Hängt von einer Bedingung ab</div>'
      + spanne.map(function(r){
          return '<span class="stfChip" data-id="'+_stfEsc(r.id)+'" style="display:inline-block;'
            +'border:1px solid var(--line,#dbe3ea);border-radius:7px;padding:3px 9px;'
            +'margin:0 5px 5px 0;font-size:12px;cursor:pointer">'+_stfEsc(r.schluessel)
            +' <b>'+_stfEsc(r.wert)+'</b></span>';
        }).join('')
    +'</div>';
  }
  if(!such) h+=_stfFamilien(staffeln);
  box.innerHTML=h;
  box.querySelectorAll('.stfChip').forEach(function(c){
    c.addEventListener('click',function(){
      _STF_WAHL=(_STF_WAHL===c.dataset.id)?null:c.dataset.id;
      _stfMal();
    });
  });
}

async function staffelnLaden(){
  var b=_stfBox(); b.style.display='block';
  b.innerHTML=_stfRahmen('<div style="padding:26px 0;font-size:13px;opacity:.7">lädt…</div>');
  try{
    var r=await client.rpc('cb_admin_bewertungsregeln_suchen',{p_suche:null,p_limit:500});
    if(r&&r.error) throw r.error;
    _STF=(r&&r.data)||[];
    var prinz=_STF.filter(function(x){ return x.bereich==='prinzipien'; });
    b.innerHTML=_stfRahmen(_stfKopf(prinz)+_stfSuche()+'<div id="stfInhalt"></div>');
    _stfMal();
  }catch(e){
    b.innerHTML=_stfRahmen('<div style="background:#fdeaea;border:1px solid #f0a9a4;'
      +'border-radius:10px;padding:12px 14px;color:#b3261e;font-size:13px">'
      +'<b>Regelwerk nicht ladbar.</b><br>'+_stfEsc((e&&e.message)||String(e))+'</div>');
    try{ console.error('[Staffeln]',e); }catch(_){}
  }
}
function staffelnOeffnen(){
  try{ if(typeof adminDrawerClose==='function') adminDrawerClose(); }catch(e){}
  staffelnLaden();
}

if(typeof window!=='undefined'){
  window.staffelnOeffnen=staffelnOeffnen;
  window.staffelnLaden=staffelnLaden;
  window.staffelnZu=staffelnZu;
  window._stfMal=_stfMal;
}
