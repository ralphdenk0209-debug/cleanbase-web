/* kern-fluss.js — der Kernweg als Flussdiagramm mit Entscheidungen, an einem Ort (CLAUDE.md A4).
   Scan → Quelle → zerlegen → Stamm → Produkt → binden → bewerten → Freigabe.
   Kasten = Station oder Frage. Pfeil = Pfad. Farbe des Pfads = gemessener Stand:
   gruen laeuft · gelb klemmt (Work-Nummer steht am Kasten) · rot steht still.
   Wird von webseite/steuerung.html und bereiche/kern-poster.html gezeichnet.
   Stand der Zahlen: 05.09.2026 (KV-491 Durchlauf, KP-499, ST-503). Nichts geschaetzt. */
(function(){
  const G="gruen", Y="gelb", R="rot", F="frage";
  const W=200, H=110, CX=222, RY=138;       // Kastenbreite, -hoehe, Spaltenabstand, Zeilenabstand
  const X = c => 14 + c*CX, Yr = r => 14 + r*RY;
  const LANE = X(3)+W+34;                    // rechte Spur fuer „ja - sofort erkannt”
  // Knoten: id, Spalte c, Zeile r, Farbe, Titel, Text, Klemmt, Work. Senkrecht: Zeit laeuft von oben nach unten.
  const KNOTEN = [
    {id:"scan",  c:1, r:0,  f:G, t:"Barcode gescannt",          s:"Im Laden. 5 von 5 Scans: Cache = Server."},
    {id:"kat",   c:1, r:1,  f:F, t:"Im Katalog?",               s:"62.166 Produkte bekannt."},
    {id:"off",   c:1, r:2,  f:F, t:"Open Food Facts kennt den Barcode?", s:"Abfrage live im Laden (off-lookup)."},
    {id:"vorl",  c:1, r:3,  f:Y, t:"Vorlaeufige Karte",         s:"Name, Marke, Naehrwerte von Open Food Facts, im Scan-Cache.", p:"65 von 128 Treffern werden nie Produkt - nur per Admin-Klick.", w:"#526 · KP-9 · Claude"},
    {id:"foto",  c:3, r:3,  f:G, t:"Niemand kennt es: Foto",    s:"Etikett fotografieren. Produkt in 7,9 s angelegt."},
    {id:"offd",  c:0, r:4,  f:G, t:"Zutaten von Open Food Facts", s:"Import laeuft, 8 von 8 durch die ganze Kette."},
    {id:"herst", c:1, r:4,  f:Y, t:"Zutaten von der Herstellerseite", s:"Skript holt den Text. 68 % Treffer, 0 $.", p:"Herkunft wird nicht ans Produkt geschrieben. 70 Seiten sperren.", w:"#519 · KP-8 · Claude"},
    {id:"web",   c:2, r:4,  f:R, t:"Websuche",                  s:"KI sucht Name und Zutaten im Netz. Eingefroren, 0,27 $ je Lauf (E40)."},
    {id:"ki",    c:3, r:4,  f:Y, t:"KI liest das Foto",         s:"Zutaten und Naehrwerte, auf 2 kcal genau.", p:"97 alte Produkte nie geprueft, Marke bleibt leer.", w:"#495 · Ralph"},
    {id:"prod",  c:1, r:5,  f:Y, t:"Produkt speichert",         s:"Zutatentext plus Herkunft am Produkt. Ab hier eine Spur.", p:"Bei Herstellerseite fehlt die Herkunft.", w:"#519 · KP-8"},
    {id:"zerl",  c:1, r:6,  f:G, t:"zerlegen",                  s:"Text wird in Namen geteilt. 323 Namen, 0 Fehler, Textmuell raus (KP-499)."},
    {id:"stamm", c:1, r:7,  f:F, t:"Name im Stamm, mit Note?",  s:"Stamm 2.560 Eintraege, 681 Zweitnamen. 92,3 % Treffer (Ziel 90)."},
    {id:"ohnenote",c:2,r:8, f:Y, t:"Im Stamm, aber ohne Note",  s:"97 Eintraege ohne Note.", p:"Score faellt weg, bis die Note da ist. 4 Regelfragen offen (E42).", w:"#497 #504 · #472 #479 #481 #490 · ChatGPT"},
    {id:"nicht", c:3, r:8,  f:Y, t:"Nicht im Stamm (7,7 %)",    s:"25 von 323 Namen.", p:"E-Nummern ohne Bruecke, OCR-Fehler, verklebte Namen. Zeile bleibt sichtbar offen.", w:"#469 · ChatGPT"},
    {id:"bind",  c:1, r:9,  f:Y, t:"binden",                    s:"Automatisch alle 5 Minuten. 85 % der Zeilen sicher.", p:"5 stillgelegte Bindungen an 1.340 Zeilen. Durchlauf wartet auf Abnahme.", w:"#509 · ChatGPT · #491 · Ralph"},
    {id:"bew",   c:1, r:10, f:Y, t:"bewerten",                  s:"Score aus den Stammnoten. 23.804 Produkte mit Score.", p:"5.755 warten auf Bewertung. 6.504 Scores, die die Regel entfernen wuerde.", w:"#448 · Ralph · #512 · ChatGPT"},
    {id:"frei",  c:1, r:11, f:G, t:"Freigabe",                  s:"Foto ohne Sichtpruefung bleibt gesperrt (E39). Hersteller und OFF frei nach Bindung."},
    {id:"antw",  c:1, r:12, f:G, t:"Im Laden erkannt",          s:"Entwurf „vorlaeufig”, Aktiv „geprueft”. Ohne Note: kein Score, ehrlich leer."}
  ];
  // Pfade: von, nach, Farbe, Beschriftung, Route ("" = senkrecht runter, seitab = nach rechts und runter, merge = runter und einmuenden, lane = rechte Spur)
  const PFADE = [
    ["scan","kat",G,""],
    ["kat","antw",G,"ja - sofort erkannt","lane"],
    ["kat","off",G,"nein"],
    ["off","vorl",G,"ja"],
    ["off","foto",G,"nein","seitab"],
    ["vorl","offd",G,"","merge"],
    ["vorl","herst",Y,""],
    ["vorl","web",R,"","merge"],
    ["foto","ki",G,""],
    ["offd","prod",G,"","merge"],
    ["herst","prod",Y,"ohne Herkunft"],
    ["web","prod",R,"steht still","merge"],
    ["ki","prod",Y,"","merge"],
    ["prod","zerl",G,""],
    ["zerl","stamm",G,""],
    ["stamm","bind",G,"ja - 92,3 %"],
    ["stamm","ohnenote",Y,"ohne Note","seitab"],
    ["stamm","nicht",Y,"nein","seitab"],
    ["ohnenote","bind",Y,"Zeile offen","merge"],
    ["nicht","bind",Y,"Zeile offen","merge"],
    ["bind","bew",Y,"85 % sicher"],
    ["bew","frei",Y,"Score oder ehrlich leer"],
    ["frei","antw",G,""]
  ];
  const FARBE = {gruen:"#16a34a", gelb:"#d97706", rot:"#dc2626", frage:"#2563eb"};

  const CSS = `
  .kf{font:13px/1.35 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;max-width:1000px;margin:0 auto;overflow-x:auto}
  .kf svg{display:block;max-width:960px;width:100%;height:auto;margin:0 auto}
  .kf .kn{border-radius:9px;padding:6px 7px;font-size:11.5px;line-height:1.3;height:100%;border:1.5px solid;box-sizing:border-box;overflow:hidden;color:#1a1d1a;background:#fff}
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
  const links = k => X(k.c), rechts = k => X(k.c)+W, cx = k => X(k.c)+W/2,
        oben = k => Yr(k.r), unten = k => Yr(k.r)+H, mitte = k => Yr(k.r)+H/2;

  function route(a, b, art){
    if(art === "lane")   return [[rechts(a), mitte(a)], [LANE, mitte(a)], [LANE, mitte(b)], [rechts(b), mitte(b)]];
    if(art === "seitab") return [[rechts(a), mitte(a)], [cx(b), mitte(a)], [cx(b), oben(b)]];
    if(art === "merge")  return [[cx(a), unten(a)], [cx(a), oben(b)-16], [cx(b), oben(b)-16], [cx(b), oben(b)]];
    return [[cx(a), unten(a)], [cx(b), oben(b)]];
  }
  function beschriftung(pts, art){
    if(art === "lane" || art === "seitab") return [(pts[0][0]+pts[1][0])/2, pts[0][1]-5];
    if(art === "merge") return [pts[1][0]+6, pts[1][1]-4];
    return [pts[0][0]+6, (pts[0][1]+pts[1][1])/2+4];
  }

  function zeichnen(el, opt){
    opt = opt || {};
    if(!document.getElementById("kf-css")){
      const st = document.createElement("style"); st.id="kf-css"; st.textContent = CSS; document.head.appendChild(st);
    }
    const breite = LANE+16, hoehe = Yr(12)+H+14;
    let s = '<svg viewBox="0 0 '+breite+' '+hoehe+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kernweg vom Scan zur Antwort"><defs>';
    Object.keys(FARBE).forEach(f => s += '<marker id="pf-'+f+'" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="'+FARBE[f]+'"/></marker>');
    s += '</defs>';
    PFADE.forEach(p => {
      const a = byId[p[0]], b = byId[p[1]], f = p[2], pts = route(a, b, p[4]);
      s += '<polyline data-pfad="'+p[0]+'-'+p[1]+'" data-farbe="'+f+'" points="'+pts.map(q=>q.join(",")).join(" ")+'" fill="none" stroke="'+FARBE[f]+'" stroke-width="2.5"'
         + (f===R ? ' stroke-dasharray="6 5"' : '') + ' marker-end="url(#pf-'+f+')"/>';
      if(p[3]){
        const m = beschriftung(pts, p[4]);
        s += '<text x="'+m[0]+'" y="'+m[1]+'" text-anchor="middle" font-size="10" font-weight="700" fill="'+FARBE[f]+'">'+esc(p[3])+'</text>';
      }
    });
    KNOTEN.forEach(k => {
      s += '<foreignObject x="'+X(k.c)+'" y="'+Yr(k.r)+'" width="'+W+'" height="'+H+'"><div xmlns="http://www.w3.org/1999/xhtml" class="kn '+k.f+'" data-knoten="'+k.id+'">'
         + '<div class="t">'+esc(k.t)+'</div><div>'+esc(k.s)+'</div>'
         + (k.p ? '<div class="p">'+esc(k.p)+'</div>' : '') + (k.w ? '<div class="w">'+esc(k.w)+'</div>' : '')
         + '</div></foreignObject>';
    });
    s += '</svg>';
    el.innerHTML = '<div class="kf'+(opt.dunkel?' dunkel':'')+'">'+s
      + '<div class="legende">Pfeil: <i style="background:#16a34a"></i>laeuft <i style="background:#d97706"></i>klemmt - Work-Nummer steht am Kasten <i style="background:#dc2626"></i>steht still'
      + ' · blau = Frage mit Abzweig · von oben nach unten · Stand 05.09.2026</div></div>';
  }

  window.KERN_FLUSS = { KNOTEN, PFADE, zeichnen };
})();
