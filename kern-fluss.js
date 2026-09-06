/* kern-fluss.js — der Kernweg als Flussdiagramm mit Entscheidungen, an einem Ort (CLAUDE.md A4).
   Scan → Quelle → zerlegen → Stamm → Produkt → binden → bewerten → Freigabe.
   Kasten = Station oder Frage. Pfeil = Pfad. Farbe des Pfads = gemessener Stand:
   gruen laeuft · gelb klemmt (Work-Nummer steht am Kasten) · rot steht still.
   Wird von webseite/steuerung.html und bereiche/kern-poster.html gezeichnet.
   Stand der Zahlen: 06.09.2026 17:30 - Eigentuemer-Sitzung, jede Zahl neu an der Datenbank gemessen
   Ralph 05.09.: das Poster ist das Ziel, und zwar zu 100 Prozent. Jeder Kasten gruen.
   Ralph 06.09.: die vorlaeufige Karte ist NUR Fallback. Ziel ist die vollstaendige
   Produktkarte - der Kasten wird erst gruen, wenn aus dem Treffer ein fertiges
   Produkt geworden ist, nicht wenn eine Karte angezeigt wurde. */
(function(){
  const G="gruen", Y="gelb", R="rot", F="frage", S="still";   // still = stillgelegt, zaehlt nicht
  const W=200, H=110, CX=222, RY=138;       // Kastenbreite, -hoehe, Spaltenabstand, Zeilenabstand
  const X = c => 14 + c*CX, Yr = r => 14 + r*RY;
  const LANE = X(3)+W+34;                    // rechte Spur fuer „ja - sofort erkannt”
  // Knoten: id, Spalte c, Zeile r, Farbe, Titel, Text, Klemmt, Work. Senkrecht: Zeit laeuft von oben nach unten.
  const KNOTEN = [
    {id:"scan",  c:1, r:0,  f:G, t:"Barcode gescannt",          s:"Im Laden. 5 von 5 Scans: Cache = Server."},
    {id:"kat",   c:1, r:1,  f:F, t:"Im Katalog?",               s:"62.166 Produkte bekannt."},
    {id:"off",   c:1, r:2,  f:F, t:"Open Food Facts kennt den Barcode?", s:"Abfrage live im Laden (off-lookup)."},
    {id:"vorl",  c:1, r:3,  f:Y, t:"Vorlaeufige Karte (nur Fallback)", s:"Sie ueberbrueckt die Sekunden im Laden. Ziel ist die vollstaendige Produktkarte - 79 Treffer sind schon Produkte geworden.", p:"50 Treffer haengen: Open Food Facts liefert dort keinen Zutatentext. Ohne Zutaten keine vollstaendige Karte.", w:"#526 · KP-9 · Claude"},
    {id:"foto",  c:3, r:3,  f:G, t:"Niemand kennt es: Foto",    s:"Etikett fotografieren. Produkt in 7,9 s angelegt."},
    {id:"adr",   c:0, r:3,  f:Y, t:"Adresse finden: Marke \u2192 Domain \u2192 Sitemap", s:"Drei Takte, 0 $: Domain suchen, sitemap.xml lesen, Produktseite dem Namen zuordnen, Link ans Produkt. 214 Domains, davon 61 durch einen echten Zutatentext belegt. 64.096 Produktseiten im Vorrat.", p:"792 Produkte haengen an Marken ohne Domain. 6 Herstellerseiten sperren sitemap.xml und robots.txt - dort braucht es einen anderen Weg wie bei Edeka.", w:"#582 \u00b7 Claude"},
    {id:"offd",  c:0, r:4,  f:G, t:"Zutaten von Open Food Facts", s:"Import laeuft, 8 von 8 durch die ganze Kette."},
    {id:"herst", c:1, r:4,  f:Y, t:"Zutaten von der Herstellerseite", s:"Skript holt den Text. 68 % Treffer, 0 $. Herkunft wird seit v4 geschrieben, live.", p:"Arbeitsliste steht auf 0 - abgearbeitet. Neue Adressen kommen ueber den Sitemap-Takt nach.", w:"#519 · Claude"},
    {id:"web",   c:2, r:4,  f:S, t:"Websuche (stillgelegt)",    s:"Eingefroren nach E40, 0,27 $ je Lauf. Am 06.09. ersetzt: die Adresse kommt jetzt aus dem Markennamen, kostenlos. Ein bewusst stillgelegter Weg ist keine Luecke und zaehlt nicht gegen 100 % gruen (E46)."},
    {id:"ki",    c:3, r:4,  f:Y, t:"KI liest das Foto",         s:"Zutaten und Naehrwerte, auf 2 kcal genau.", p:"97 alte Produkte nie geprueft, Marke bleibt leer.", w:"#495 · Ralph"},
    {id:"beleg", c:3, r:5,  f:G, t:"Belegpruefung: steht es wirklich auf dem Foto?", s:"Zweiter Blick auf die Etikettfotos, 0,0014 $ je Produkt. 113 geprueft, 28 ohne Zutatenverzeichnis. Findet sie keines, sperrt der Server den Score mit Grund - das Produkt bleibt nutzbar, nur die unbelegte Zahl faellt weg.", w:"#495 \u00b7 Claude"},
    {id:"prod",  c:1, r:5,  f:Y, t:"Produkt speichert",         s:"Zutatentext plus Herkunft am Produkt. 1.936 von 4.059 aktiven Produkten tragen einen Etikettwortlaut - am Mittag waren es 1.080, also plus 856 an einem Tag.", p:"2.123 offen. Ueber Open Food Facts sind davon nur noch rund 670 zu holen; der Rest braucht den Arm Adresse finden oder ein Foto.", w:"#539 · Claude"},
    {id:"zerl",  c:1, r:6,  f:Y, t:"zerlegen",                  s:"cb_zutaten_aus_text teilt den Wortlaut in Namen und haengt die Stammnote an. Seit 06.09. als Takt angeschlossen - vorher lief er nur im Erfassungsweg.", p:"3.024 Entwuerfe tragen einen Wortlaut und noch keine Zutatenzeile. Der Takt arbeitet sie ab, 60 alle 5 Minuten.", w:"#588 \u00b7 Claude"},
    {id:"stamm", c:1, r:7,  f:F, t:"Name im Stamm, mit Note?",  s:"Stamm 2.490 aktive Eintraege, 2.482 mit Note."},
    {id:"ohnenote",c:2,r:8, f:G, t:"Im Stamm, aber ohne Note",  s:"Nur noch 1 Eintrag wirklich offen (Zitronensaeurekonzentrat, 0 aktive Produkte). Am 04.09. waren es 97. Die uebrigen 7 sind regelgedeckt disponiert - Rauch und Buchenholzrauch sind Verfahrensmarker (BR-RAEUCHERN-MARKER), nicht bewertbar."},
    {id:"nicht", c:3, r:8,  f:Y, t:"Nicht im Stamm",            s:"85 aktive Produkte (17:30). Am 05.09. waren es 181, am Mittag 16. Die Zahl steigt mit jedem neuen Wortlaut - neue Wahrheit bringt neue Luecken.", p:"Zusammengesetzte Zutaten mit Klammerliste, Fachfragen wie Erdnusscreme und Kiwimark, OCR-Bruchstuecke.", w:"#560 · Claude"},
    {id:"bind",  c:1, r:9,  f:Y, t:"binden",                    s:"Gebunden wird an der ZEILE, nicht an der Zutat-ID. 85 Produkte mit Luecke (v_active_product_ingredient_repair_open).", p:"85 offen. Der Zulauf kommt aus den neuen Wortlauten - ein Zeichen von Fortschritt, nicht von Ruecklauf.", w:"#560 · Claude"},
    {id:"bew",   c:1, r:10, f:Y, t:"bewerten",                  s:"Score aus den Stammnoten. 3.253 aktive Produkte mit Note von 4.059. Ein Takt laesst den Riegel ueber jeden Score neu laufen: 1.200 geprueft, 0 verloren.", p:"2.053 Scores noch nicht nachgerechnet. Die Zahl 6.504 vom 05.09. hat sich bei den aktiven Produkten aufgeloest.", w:"#512 · Claude"},
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
    ["adr","herst",Y,"Adresse","merge"],
    ["vorl","web",S,"","merge"],
    ["foto","ki",G,""],
    ["offd","prod",G,"","merge"],
    ["herst","prod",Y,"ohne Herkunft"],
    ["web","prod",S,"ersetzt","merge"],
    ["ki","beleg",G,""],
    ["beleg","prod",G,"nur mit Beleg","merge"],
    ["prod","zerl",G,""],
    ["zerl","stamm",G,""],
    ["stamm","bind",G,"ja - 92,3 %"],
    ["stamm","ohnenote",Y,"ohne Note","seitab"],
    ["stamm","nicht",Y,"nein","seitab"],
    ["ohnenote","bind",G,"disponiert","merge"],
    ["nicht","bind",Y,"Zeile offen","merge"],
    ["bind","bew",Y,"85 % sicher"],
    ["bew","frei",Y,"Score oder ehrlich leer"],
    ["frei","antw",G,""]
  ];
  const FARBE = {gruen:"#16a34a", gelb:"#d97706", rot:"#dc2626", frage:"#2563eb", still:"#94a3b8"};

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
  .kf .kn.still{background:#f1f5f9;border-color:#94a3b8;color:#64748b;border-style:dashed}
  .kf .kn.frage{background:#eaf0fe;border-color:#2563eb;color:#1e3a8a;border-radius:24px;text-align:center}
  .kf .legende{font-size:11.5px;color:#6b7280;margin:6px 4px 4px}
  .kf .legende i{display:inline-block;width:22px;height:3px;vertical-align:3px;margin:0 5px 0 12px}
  .kf.dunkel .kn.gruen{background:#12291c;color:#bbf7d0}
  .kf.dunkel .kn.gelb{background:#3a2c0c;color:#fde68a}
  .kf.dunkel .kn.rot{background:#331818;color:#fecaca}
  .kf.dunkel .kn.still{background:#1e2530;color:#94a3b8}
  .kf.dunkel .kn.frage{background:#151f33;color:#c6d8fd}
  .kf.dunkel .legende{color:#93a1b3}
  .kf.dunkel text{fill:#c9d2dc}
  @media (prefers-color-scheme: dark){
    .kf:not(.hell) .kn.gruen{background:#12291c;color:#bbf7d0}
    .kf:not(.hell) .kn.gelb{background:#3a2c0c;color:#fde68a}
    .kf:not(.hell) .kn.rot{background:#331818;color:#fecaca}
    .kf:not(.hell) .kn.still{background:#1e2530;color:#94a3b8}
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
      + '<div class="legende">Pfeil: <i style="background:#16a34a"></i>laeuft <i style="background:#d97706"></i>klemmt - Work-Nummer steht am Kasten <i style="background:#dc2626"></i>steht still <i style="background:#94a3b8"></i>stillgelegt, zaehlt nicht'
      + ' · blau = Frage mit Abzweig · von oben nach unten · Stand 06.09.2026 17:30</div></div>';
  }

  window.KERN_FLUSS = { KNOTEN, PFADE, zeichnen };
})();
