/* kern-fluss.js — der Kernweg als Flussdiagramm mit Entscheidungen, an einem Ort (CLAUDE.md A4).
   Scan → Quelle → zerlegen → Stamm → Produkt → binden → bewerten → Freigabe.
   Kasten = Station oder Frage. Pfeil = Pfad. Farbe des Pfads = gemessener Stand:
   gruen laeuft · gelb klemmt (Work-Nummer steht am Kasten) · rot steht still.
   Wird von webseite/steuerung.html und bereiche/kern-poster.html gezeichnet.
   Stand der Zahlen: 05.09.2026 (KV-491 Durchlauf, KP-499, ST-503). Nichts geschaetzt. */
(function(){
  const G="gruen", Y="gelb", R="rot", F="frage";
  const W=150, H=128, C=166;               // Kastenbreite, -hoehe, Spaltenabstand
  const X = c => 12 + c*C;
  // Knoten: id, Spalte, y, Farbe, Titel, Text, Work
  const KNOTEN = [
    {id:"scan",   c:0, y:80, f:G, t:"1 · Scan im Laden",        s:"Barcode gescannt. 5 von 5: Cache = Server."},
    {id:"kat",    c:1, y:80, f:F, t:"Im Katalog?",              s:"62.166 Produkte bekannt."},
    {id:"foto",   c:2, y:80, f:Y, t:"2 · Foto, KI liest",       s:"Produkt in 7,9 s angelegt. KI liest Zutaten und Naehrwerte.", p:"97 alte Produkte nie geprueft, Marke bleibt leer.", w:"#495 · Ralph"},
    {id:"herst",  c:2, y:236, f:Y, t:"2 · Herstellerseite",      s:"Skript holt den Text. 68 % Treffer, 0 $.", p:"Herkunft wird nicht ans Produkt geschrieben. 70 Seiten sperren.", w:"#519 · KP-8 · Claude"},
    {id:"off",    c:2, y:380, f:G, t:"2 · Open Food Facts",      s:"Import laeuft. 8 von 8 durch die ganze Kette."},
    {id:"web",    c:2, y:524, f:R, t:"2 · Websuche",             s:"KI sucht im Netz. Eingefroren, 0,27 $ je Lauf (E40)."},
    {id:"prod",   c:3, y:80, f:Y, t:"5 · Produkt speichert",    s:"Zutatentext plus Herkunft am Produkt.", p:"Bei Herstellerseite fehlt die Herkunft.", w:"#519 · KP-8"},
    {id:"zerl",   c:4, y:80, f:G, t:"3 · zerlegen",             s:"Text wird in Namen geteilt. 323 Namen, 0 Fehler, Textmuell raus (KP-499)."},
    {id:"stamm",  c:5, y:80, f:F, t:"4 · Name im Stamm, mit Note?", s:"Stamm 2.560 Eintraege, 681 Zweitnamen."},
    {id:"ohnenote",c:5,y:236, f:Y, t:"Im Stamm, aber ohne Note", s:"97 Eintraege haben keine Note.", p:"Score faellt weg, bis die Note da ist. 4 Regelfragen offen (E42).", w:"#497 #504 · #472 #479 #481 #490 · ChatGPT"},
    {id:"nicht",  c:5, y:380, f:Y, t:"Nicht im Stamm (7,7 %)",   s:"25 von 323 Namen.", p:"E-Nummern ohne Bruecke, OCR-Fehler, verklebte Namen. Zeile bleibt sichtbar offen.", w:"#469 · ChatGPT"},
    {id:"bind",   c:6, y:80, f:Y, t:"6 · binden",               s:"Automatisch alle 5 Minuten. 85 % der Zeilen sicher.", p:"5 stillgelegte Bindungen an 1.340 Zeilen. Durchlauf wartet auf Abnahme.", w:"#509 · ChatGPT · #491 · Ralph"},
    {id:"bew",    c:7, y:80, f:Y, t:"7 · bewerten",             s:"Score aus den Stammnoten. 23.804 Produkte mit Score.", p:"5.755 warten auf Bewertung. 6.504 Scores, die die Regel entfernen wuerde.", w:"#448 · Ralph · #512 · ChatGPT"},
    {id:"frei",   c:8, y:80, f:G, t:"8 · Freigabe",             s:"Foto ohne Sichtpruefung bleibt gesperrt (E39). Hersteller und OFF frei nach Bindung."},
    {id:"antw",   c:9, y:80, f:G, t:"Antwort im Laden",         s:"Entwurf „vorlaeufig”, Aktiv „geprueft”. Ohne Note: kein Score, ehrlich leer."}
  ];
  // Pfade: von, nach, Farbe, Beschriftung, Route (Liste von [x,y]; leer = gerade von rechts nach links)
  const PFADE = [
    ["scan","kat",G,""],
    ["kat","antw",G,"ja - Antwort sofort","oben"],
    ["kat","foto",G,"nein - Foto"],
    ["foto","prod",G,""],
    ["herst","prod",Y,"ohne Herkunft","einmuenden"],
    ["off","prod",G,"","einmuenden"],
    ["web","prod",R,"steht still","einmuenden"],
    ["prod","zerl",G,""],
    ["zerl","stamm",G,""],
    ["stamm","bind",G,"ja - 92,3 %"],
    ["stamm","ohnenote",Y,"","runter"],
    ["stamm","nicht",Y,"","runter2"],
    ["ohnenote","bind",Y,"Zeile offen","einmuenden"],
    ["nicht","bind",Y,"Zeile offen","einmuenden"],
    ["bind","bew",Y,"85 % sicher"],
    ["bew","frei",Y,"Score oder ehrlich leer"],
    ["frei","antw",G,""]
  ];
  const FARBE = {gruen:"#16a34a", gelb:"#d97706", rot:"#dc2626", frage:"#2563eb"};

  const CSS = `
  .kf{font:13px/1.35 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;max-width:1500px;margin:0 auto;overflow-x:auto}
  .kf svg{display:block;min-width:1400px;width:100%;height:auto}
  .kf .kn{border-radius:9px;padding:6px 7px;font-size:11px;line-height:1.3;height:100%;border:1.5px solid;box-sizing:border-box;overflow:hidden;color:#1a1d1a;background:#fff}
  .kf .kn .t{font-weight:800;font-size:12px;margin-bottom:2px}
  .kf .kn .p{margin-top:3px;font-weight:600}
  .kf .kn .p::before{content:"Klemmt: "}
  .kf .kn .w{margin-top:2px;font-weight:800;font-size:10.5px}
  .kf .kn.gruen{background:#eaf7ef;border-color:#16a34a;color:#14532d}
  .kf .kn.gelb{background:#fdf1cf;border-color:#d97706;color:#7a4b00}
  .kf .kn.rot{background:#fdeded;border-color:#dc2626;color:#991b1b}
  .kf .kn.frage{background:#eaf0fe;border-color:#2563eb;color:#1e3a8a;border-radius:24px;text-align:center}
  .kf .legende{font-size:11.5px;color:#6b7280;margin:6px 4px 4px}
  .kf .legende i{display:inline-block;width:22px;height:3px;vertical-align:3px;margin:0 5px 0 12px}
  .kf.dunkel .kn.gruen{background:#12291c;color:#bbf7d0}
  .kf.dunkel .kn.gelb{background:#3a2c0c;color:#fde68a}
  .kf.dunkel .kn.rot{background:#331818;color:#fecaca}
  .kf.dunkel .kn.frage{background:#151f33;color:#c6d8fd}
  .kf.dunkel .legende{color:#93a1b3}
  .kf.dunkel text{fill:#c9d2dc}
  @media (prefers-color-scheme: dark){
    .kf:not(.hell) .kn.gruen{background:#12291c;color:#bbf7d0}
    .kf:not(.hell) .kn.gelb{background:#3a2c0c;color:#fde68a}
    .kf:not(.hell) .kn.rot{background:#331818;color:#fecaca}
    .kf:not(.hell) .kn.frage{background:#151f33;color:#c6d8fd}
    .kf:not(.hell) text{fill:#c9d2dc}
  }`;

  function esc(s){ return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]); }
  const byId = {}; KNOTEN.forEach(k => byId[k.id] = k);
  const links = k => X(k.c), rechts = k => X(k.c)+W, mitte = k => k.y + H/2, oben = k => k.y, unten = k => k.y + H;

  function route(a, b, art){
    if(art === "oben")       return [[links(a)+W/2, oben(a)], [links(a)+W/2, 36], [links(b)+W/2, 36], [links(b)+W/2, oben(b)]];
    if(art === "runter")     return [[links(a)+W/2, unten(a)], [links(a)+W/2, oben(b)]];
    if(art === "runter2")    return [[links(a)+W/2+30, unten(a)], [links(a)+W/2+30, oben(b)]];
    if(art === "einmuenden") return [[rechts(a), mitte(a)], [links(b)-12, mitte(a)], [links(b)-12, mitte(b)], [links(b), mitte(b)]];
    return [[rechts(a), mitte(a)], [links(b), mitte(b)]];
  }

  function zeichnen(el, opt){
    opt = opt || {};
    if(!document.getElementById("kf-css")){
      const st = document.createElement("style"); st.id="kf-css"; st.textContent = CSS; document.head.appendChild(st);
    }
    const breite = X(9)+W+12, hoehe = 668;
    let s = '<svg viewBox="0 0 '+breite+' '+hoehe+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kernweg vom Scan zur Antwort"><defs>';
    Object.keys(FARBE).forEach(f => s += '<marker id="pf-'+f+'" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="'+FARBE[f]+'"/></marker>');
    s += '</defs>';
    PFADE.forEach(p => {
      const a = byId[p[0]], b = byId[p[1]], f = p[2], pts = route(a, b, p[4]);
      s += '<polyline data-pfad="'+p[0]+'-'+p[1]+'" data-farbe="'+f+'" points="'+pts.map(q=>q.join(",")).join(" ")+'" fill="none" stroke="'+FARBE[f]+'" stroke-width="2.5"'
         + (f===R ? ' stroke-dasharray="6 5"' : '') + ' marker-end="url(#pf-'+f+')"/>';
      if(p[3]){
        const m = pts.length===2 ? [(pts[0][0]+pts[1][0])/2, pts[0][1]] : (p[4]==="oben" ? [(pts[1][0]+pts[2][0])/2, 36] : pts[1]);
        s += '<text x="'+m[0]+'" y="'+(m[1]-5)+'" text-anchor="middle" font-size="10" font-weight="700" fill="'+FARBE[f]+'">'+esc(p[3])+'</text>';
      }
    });
    KNOTEN.forEach(k => {
      s += '<foreignObject x="'+X(k.c)+'" y="'+k.y+'" width="'+W+'" height="'+H+'"><div xmlns="http://www.w3.org/1999/xhtml" class="kn '+k.f+'" data-knoten="'+k.id+'">'
         + '<div class="t">'+esc(k.t)+'</div><div>'+esc(k.s)+'</div>'
         + (k.p ? '<div class="p">'+esc(k.p)+'</div>' : '') + (k.w ? '<div class="w">'+esc(k.w)+'</div>' : '')
         + '</div></foreignObject>';
    });
    s += '</svg>';
    el.innerHTML = '<div class="kf'+(opt.dunkel?' dunkel':'')+'">'+s
      + '<div class="legende">Pfeil: <i style="background:#16a34a"></i>laeuft <i style="background:#d97706"></i>klemmt - Work-Nummer steht am Kasten <i style="background:#dc2626"></i>steht still'
      + ' · blau = Frage mit Abzweig · Stand 05.09.2026</div></div>';
  }

  window.KERN_FLUSS = { KNOTEN, PFADE, zeichnen };
})();
