/* kern-fluss.js — der eine Kernweg, an einem Ort (CLAUDE.md A4 „eine Regel, ein Ort").
   Scan → Quelle → zerlegen → Stamm → Produkt → binden → bewerten → Freigabe,
   je Weg eine Zeile. Farbe = gemessener Stand:
   gruen steht · gelb wird noch gearbeitet · rot steht still · grau: auf diesem Weg keine Station.
   Wird von webseite/steuerung.html und bereiche/kern-poster.html gezeichnet.
   Stand der Zahlen: 05.09.2026 (KV-491 Durchlauf, KP-499, ST-503). Nichts geschaetzt. */
(function(){
  const STATIONEN = ["Scan","Quelle","zerlegen","Stamm","Produkt","binden","bewerten","Freigabe"];
  const G="gruen", Y="gelb", R="rot", N="grau";
  // Zelle: [farbe, kurztext]. Kurztext = die Wirkung, nicht die Ursache.
  const WEGE = [
    { name:"Barcode im Laden", zellen:[
      [G,"5 von 5 Scans: Cache = Server"],
      [G,"Katalog 62.166, sonst Foto"],
      [N,""],[N,""],[N,""],[N,""],[N,""],
      [G,"Entwurf „vorlaeufig”, Aktiv „geprueft”"] ]},
    { name:"Etikettfoto", zellen:[
      [G,"Einreichen bis Produkt 7,9 s"],
      [Y,"Foto gelesen; Marke bleibt leer · 97 Altprodukte ungeprueft"],
      [G,"Textmuell raus, 0 Fehler (KP-499)"],
      [Y,"92,3 % Treffer · 97 ohne Note · E-Nummern ohne Bruecke"],
      [G,"Rohtext + Station Quelle gespeichert"],
      [Y,"85 % der Zeilen automatisch, Rest bleibt sichtbar offen"],
      [Y,"Score faellt weg, bis der Stamm nachzieht"],
      [G,"Ohne Sichtpruefung gesperrt (E39)"] ]},
    { name:"Herstellerseite", zellen:[
      [N,""],
      [Y,"Skript-Abruf 68 % · 70 Seiten hinter Bot-Sperre"],
      [G,"wie Foto"],
      [Y,"wie Foto"],
      [Y,"Station Quelle wird nicht geschrieben"],
      [Y,"wie Foto"],
      [Y,"wie Foto"],
      [G,"frei nach Bindung"] ]},
    { name:"Open Food Facts", zellen:[
      [N,""],
      [G,"8 von 8 durch die Kette"],
      [G,"wie Foto"],
      [Y,"wie Foto"],
      [G,"Station Quelle ueber Ingest"],
      [Y,"wie Foto"],
      [Y,"wie Foto"],
      [G,"frei nach Bindung"] ]},
    { name:"Websuche", zellen:[
      [N,""],
      [R,"eingefroren (E40), 0,27 $ je Lauf"],
      [N,""],[N,""],[N,""],[N,""],[N,""],[N,""] ]}
  ];
  // Gelb = hier wird gearbeitet. Jede Zeile traegt ihre Work-Nummer oder sagt, dass keine da ist.
  const GELB = [
    ["Quelle",  "97 alte Etikettfoto-Produkte nachpruefen",            "#495 · Ralph entscheidet"],
    ["Quelle",  "Skript-Abruf schreibt keine Station Quelle, Vault ≠ Live", "kein Work Item — KP geschlossen, Ralph entscheidet"],
    ["Stamm",   "E-Nummern an den Zusatzstoff-Stamm haengen",          "#469 · ChatGPT"],
    ["Stamm",   "letzte Eintraege ohne Note bewerten",                  "#497, #504 · ChatGPT"],
    ["Stamm",   "vier Regelklaerungen umsetzen (E42)",                  "#472, #479, #481, #490 · ChatGPT"],
    ["binden",  "5 stillgelegte Bindungen tragen 1.340 Produktzeilen",  "#509 · ChatGPT"],
    ["binden",  "Durchlauf auf drei Wegen abnehmen",                    "#491 · Ralph"],
    ["bewerten","5.755 Produkte warten auf Bewertung",                  "#448 · Ralph nimmt ab"],
    ["bewerten","6.504 Scores, die die heutige Regel entfernen wuerde", "#512 · ChatGPT"]
  ];

  const CSS = `
  .kf{font:13px/1.35 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;max-width:1400px;margin:0 auto}
  .kf table{border-collapse:separate;border-spacing:4px;width:100%;table-layout:fixed}
  .kf th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;padding:4px 2px;text-align:center}
  .kf th.w{text-align:left;width:130px}
  .kf td{border-radius:8px;padding:6px 7px;font-size:11.5px;vertical-align:top;min-height:38px;border:1px solid transparent}
  .kf td.w{font-weight:700;font-size:12.5px;background:none;color:inherit}
  .kf td.gruen{background:#eaf7ef;border-color:#c3e7d1;color:#14532d}
  .kf td.gelb{background:#fdf1cf;border-color:#f0c96a;color:#7a4b00;font-weight:600}
  .kf td.rot{background:#fdeded;border-color:#f8c9c9;color:#991b1b}
  .kf td.grau{background:#f2f4f2;border-color:#e4e8e3;color:#9aa19c;text-align:center}
  .kf td.grau::before{content:"—"}
  .kf .pfeile{display:grid;grid-template-columns:130px repeat(8,1fr);gap:4px;padding:0 4px 6px;color:#9aa19c;font-size:11px}
  .kf .pfeile span{text-align:center}
  .kf .legende{font-size:11.5px;color:#6b7280;margin:6px 4px 10px}
  .kf .legende i{display:inline-block;width:11px;height:11px;border-radius:3px;vertical-align:-1px;margin:0 4px 0 10px;border:1px solid transparent}
  .kf ol{margin:6px 0 0;padding-left:20px;font-size:12.5px}
  .kf ol li{margin:2px 0}
  .kf ol b{color:#7a4b00}
  .kf ol .nr{color:#6b7280;font-size:11.5px}
  .kf.dunkel td.gruen{background:#12291c;border-color:#2a5a3d;color:#bbf7d0}
  .kf.dunkel td.gelb{background:#3a2c0c;border-color:#8a6a1e;color:#fde68a}
  .kf.dunkel td.rot{background:#331818;border-color:#6b2c2c;color:#fecaca}
  .kf.dunkel td.grau{background:#20241f;border-color:#2b312d;color:#6b7280}
  .kf.dunkel ol b{color:#fde68a}
  .kf.dunkel th,.kf.dunkel .legende,.kf.dunkel ol .nr{color:#93a1b3}
  @media (prefers-color-scheme: dark){
    .kf:not(.hell) td.gruen{background:#12291c;border-color:#2a5a3d;color:#bbf7d0}
    .kf:not(.hell) td.gelb{background:#3a2c0c;border-color:#8a6a1e;color:#fde68a}
    .kf:not(.hell) td.rot{background:#331818;border-color:#6b2c2c;color:#fecaca}
    .kf:not(.hell) td.grau{background:#20241f;border-color:#2b312d;color:#6b7280}
    .kf:not(.hell) ol b{color:#fde68a}
  }`;

  function esc(s){ return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]); }

  function zeichnen(el, opt){
    opt = opt || {};
    if(!document.getElementById("kf-css")){
      const st = document.createElement("style"); st.id="kf-css"; st.textContent = CSS; document.head.appendChild(st);
    }
    let h = '<div class="kf'+(opt.dunkel?' dunkel':'')+'"><table><tr><th class="w">Weg</th>';
    STATIONEN.forEach((s,i) => h += '<th>'+(i+1)+' · '+esc(s)+'</th>');
    h += '</tr>';
    WEGE.forEach(w => {
      h += '<tr><td class="w">'+esc(w.name)+'</td>';
      w.zellen.forEach(z => h += '<td class="'+z[0]+'" title="'+esc(z[1])+'">'+esc(z[1])+'</td>');
      h += '</tr>';
    });
    h += '</table>';
    h += '<div class="legende">'
       + '<i style="background:#eaf7ef;border-color:#c3e7d1"></i>steht'
       + '<i style="background:#fdf1cf;border-color:#f0c96a"></i>hier arbeiten wir noch'
       + '<i style="background:#fdeded;border-color:#f8c9c9"></i>steht still'
       + '<i style="background:#f2f4f2;border-color:#e4e8e3"></i>keine Station auf diesem Weg'
       + ' · Stand 05.09.2026</div>';
    if(opt.gelbListe !== false){
      h += '<ol class="gelb-liste">';
      GELB.forEach(g => h += '<li><b>'+esc(g[0])+':</b> '+esc(g[1])+' <span class="nr">— '+esc(g[2])+'</span></li>');
      h += '</ol>';
    }
    h += '</div>';
    el.innerHTML = h;
  }

  window.KERN_FLUSS = { STATIONEN, WEGE, GELB, zeichnen };
})();
