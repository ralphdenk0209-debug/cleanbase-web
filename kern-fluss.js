/* kern-fluss.js — der eine Kernweg als Flussdiagramm, an einem Ort (CLAUDE.md A4 „eine Regel, ein Ort").
   Scan → Quelle → zerlegen → Stamm → Produkt → binden → bewerten → Freigabe.
   Bei Scan und Quelle teilt sich der Weg (mehrere Kaesten), ab zerlegen laeuft alles in einer Spur.
   Farbe = gemessener Stand: gruen steht · gelb hier arbeiten wir, mit Work-Nummer · rot steht still.
   Wird von webseite/steuerung.html und bereiche/kern-poster.html gezeichnet.
   Stand der Zahlen: 05.09.2026 (KV-491 Durchlauf, KP-499, ST-503). Nichts geschaetzt. */
(function(){
  const G="gruen", Y="gelb", R="rot";
  // Station: {nr, name, was (ein Satz, was hier passiert), kaesten:[{titel?, farbe, stand, problem?, work?}]}
  const STATIONEN = [
    { nr:1, name:"Scan", was:"Der Mensch scannt im Laden.", kaesten:[
      { titel:"Barcode bekannt", farbe:G, stand:"Produkt im Katalog (62.166). Antwort sofort - weiter bei 8.", sprung:8 },
      { titel:"Unbekannt: Foto", farbe:G, stand:"Etikett fotografieren. Produkt angelegt in 7,9 s - weiter bei 2." } ]},
    { nr:2, name:"Quelle", was:"Woher der Zutatentext kommt.", kaesten:[
      { titel:"Etikettfoto", farbe:Y, stand:"KI liest das Foto, Naehrwerte auf 2 kcal genau.",
        problem:"97 alte Produkte wurden nie geprueft; Marke bleibt leer.", work:"#495 · Ralph entscheidet" },
      { titel:"Herstellerseite", farbe:Y, stand:"Skript holt den Text von der Webseite, 68 % Treffer, 0 $.",
        problem:"Das Produkt erfaehrt nicht, dass der Text von dort kam. 70 Seiten sperren uns aus.", work:"#519 · KP-8 · Claude" },
      { titel:"Open Food Facts", farbe:G, stand:"Import laeuft, 8 von 8 Produkte durch die ganze Kette." },
      { titel:"Websuche", farbe:R, stand:"KI sucht im Netz. Eingefroren, 0,27 $ je Lauf (E40)." } ]},
    { nr:3, name:"zerlegen", was:"Der Text wird in einzelne Zutatennamen geteilt.", kaesten:[
      { farbe:G, stand:"323 Namen aus 30 Texten, 0 Fehler. Naehrwerte, Werbung, HTML-Reste raus (KP-499)." } ]},
    { nr:4, name:"Stamm", was:"Jeder Name wird im Zutaten-Stamm gesucht.", kaesten:[
      { farbe:Y, stand:"92,3 % gefunden (Ziel 90, am 03.09. noch 73,9 %).",
        problem:"E-Nummern haben keine Bruecke zum Zusatzstoff-Stamm. 97 Eintraege haben noch keine Note. 4 Regelfragen offen (E42).",
        work:"#469 · #497 #504 · #472 #479 #481 #490 · ChatGPT" } ]},
    { nr:5, name:"Produkt", was:"Text und Herkunft werden am Produkt gespeichert.", kaesten:[
      { farbe:Y, stand:"Foto und Open Food Facts schreiben Text plus Herkunft.",
        problem:"Herstellerseite schreibt nur den Text, nicht die Herkunft.", work:"#519 · KP-8 · Claude" } ]},
    { nr:6, name:"binden", was:"Jede Zutat wird fest mit ihrem Stammeintrag verbunden.", kaesten:[
      { farbe:Y, stand:"Automatisch alle 5 Minuten. 85 % der Zeilen sicher, der Rest bleibt sichtbar offen.",
        problem:"5 stillgelegte Bindungen haengen noch an 1.340 Produktzeilen. Der Durchlauf vom 04.09. wartet auf Abnahme.",
        work:"#509 · ChatGPT · #491 · Ralph" } ]},
    { nr:7, name:"bewerten", was:"Aus den Stammnoten wird der Produkt-Score.", kaesten:[
      { farbe:Y, stand:"23.804 Produkte mit Score. Fehlt eine Note, faellt der Score ehrlich weg.",
        problem:"5.755 Produkte warten auf ihre Bewertung. 6.504 zeigen einen Score, den die heutige Regel entfernen wuerde.",
        work:"#448 · Ralph nimmt ab · #512 · ChatGPT" } ]},
    { nr:8, name:"Freigabe", was:"Erst geprueft, dann sichtbar.", kaesten:[
      { farbe:G, stand:"Foto ohne Sichtpruefung bleibt gesperrt (E39). Im Laden: Entwurf „vorlaeufig”, Aktiv „geprueft”." } ]}
  ];

  const CSS = `
  .kf{font:13px/1.35 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;max-width:1500px;margin:0 auto;overflow-x:auto}
  .kf .fluss{display:grid;grid-template-columns:repeat(8,minmax(150px,1fr));gap:0;align-items:start;min-width:1240px}
  .kf .st{position:relative;padding:0 14px 0 4px}
  .kf .st+.st::before{content:"";position:absolute;left:-12px;top:52px;width:10px;height:2px;background:#9aa19c}
  .kf .st+.st::after{content:"";position:absolute;left:-6px;top:48px;border:5px solid transparent;border-left:7px solid #9aa19c}
  .kf .st h4{margin:0 0 2px;font-size:13px;font-weight:800}
  .kf .st h4 b{display:inline-block;width:20px;height:20px;line-height:20px;border-radius:50%;background:#1a1d1a;color:#fff;text-align:center;font-size:11px;margin-right:5px}
  .kf .st .was{margin:0 0 8px;font-size:11.5px;color:#6b7280;min-height:32px}
  .kf .k{border-radius:9px;padding:7px 8px;margin-bottom:6px;font-size:11.5px;border:1px solid transparent}
  .kf .k .t{font-weight:700;font-size:12px;margin-bottom:2px}
  .kf .k .pr{margin-top:4px;font-weight:600}
  .kf .k .pr::before{content:"Problem: "}
  .kf .k .w{margin-top:3px;font-size:11px;font-weight:700;letter-spacing:.02em}
  .kf .k .sp{margin-top:3px;font-size:11px;font-style:italic}
  .kf .gruen{background:#eaf7ef;border-color:#c3e7d1;color:#14532d}
  .kf .gelb{background:#fdf1cf;border-color:#f0c96a;color:#7a4b00}
  .kf .rot{background:#fdeded;border-color:#f8c9c9;color:#991b1b}
  .kf .legende{font-size:11.5px;color:#6b7280;margin:8px 4px 4px}
  .kf .legende i{display:inline-block;width:11px;height:11px;border-radius:3px;vertical-align:-1px;margin:0 4px 0 10px;border:1px solid transparent}
  .kf.dunkel .st h4{color:#e7edf5}
  .kf.dunkel .st h4 b{background:#e7edf5;color:#0e1116}
  .kf.dunkel .gruen{background:#12291c;border-color:#2a5a3d;color:#bbf7d0}
  .kf.dunkel .gelb{background:#3a2c0c;border-color:#8a6a1e;color:#fde68a}
  .kf.dunkel .rot{background:#331818;border-color:#6b2c2c;color:#fecaca}
  .kf.dunkel .was,.kf.dunkel .legende{color:#93a1b3}
  @media (prefers-color-scheme: dark){
    .kf:not(.hell) .st h4{color:#e7edf5}
    .kf:not(.hell) .st h4 b{background:#e7edf5;color:#0e1116}
    .kf:not(.hell) .gruen{background:#12291c;border-color:#2a5a3d;color:#bbf7d0}
    .kf:not(.hell) .gelb{background:#3a2c0c;border-color:#8a6a1e;color:#fde68a}
    .kf:not(.hell) .rot{background:#331818;border-color:#6b2c2c;color:#fecaca}
  }`;

  function esc(s){ return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]); }

  function zeichnen(el, opt){
    opt = opt || {};
    if(!document.getElementById("kf-css")){
      const st = document.createElement("style"); st.id="kf-css"; st.textContent = CSS; document.head.appendChild(st);
    }
    let h = '<div class="kf'+(opt.dunkel?' dunkel':'')+'"><div class="fluss">';
    STATIONEN.forEach(s => {
      h += '<div class="st" data-nr="'+s.nr+'"><h4><b>'+s.nr+'</b>'+esc(s.name)+'</h4><p class="was">'+esc(s.was)+'</p>';
      s.kaesten.forEach(k => {
        h += '<div class="k '+k.farbe+'">'
           + (k.titel ? '<div class="t">'+esc(k.titel)+'</div>' : '')
           + '<div>'+esc(k.stand)+'</div>'
           + (k.problem ? '<div class="pr">'+esc(k.problem)+'</div>' : '')
           + (k.work ? '<div class="w">'+esc(k.work)+'</div>' : '')
           + (k.sprung ? '<div class="sp">→ springt zu '+k.sprung+'</div>' : '')
           + '</div>';
      });
      h += '</div>';
    });
    h += '</div><div class="legende">'
       + '<i style="background:#eaf7ef;border-color:#c3e7d1"></i>steht'
       + '<i style="background:#fdf1cf;border-color:#f0c96a"></i>hier arbeiten wir - mit Work-Nummer'
       + '<i style="background:#fdeded;border-color:#f8c9c9"></i>steht still'
       + ' · Ab Station 3 laufen alle Wege in einer Spur · Stand 05.09.2026</div></div>';
    el.innerHTML = h;
  }

  window.KERN_FLUSS = { STATIONEN, zeichnen };
})();
