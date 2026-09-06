/* kern-fluss.js — der Kernweg als Bahn mit Karten, an einem Ort (CLAUDE.md A4).
   Scan → Quelle → zerlegen → Stamm → Produkt → binden → bewerten → Freigabe.

   🔴 06.09.2026 (Ralph: "Texte sind überlagert, Kacheln zu klein"):
   Die alte Fassung zeichnete feste Kästen von 200x110 Pixeln in ein SVG. Jeder
   Text, der länger war, lief aus dem Kasten oder über den nächsten. Eine feste
   Kachelgröße und ein Text, dessen Länge sich mit jeder Messung ändert, passen
   grundsätzlich nicht zusammen — das war kein Feinschliff, sondern ein Baufehler.
   Neu: eine senkrechte Bahn aus HTML-Karten, die mit ihrem Inhalt wachsen.
   Drei Spalten (Abzweig links · Hauptstrang · Abzweig rechts), unter 820 px
   alles untereinander. Kein SVG, keine Koordinaten, keine Überlagerung möglich.
   Alte Fassung: bereiche/_sicherungen/2026-09-06-poster-misst-sich/kern-fluss.js.bak

   Die Zahlen stehen NICHT mehr in dieser Datei: jeder Kasten misst sich an der
   Datenbank (cb_kern_poster_stand), siehe messen(). Die hier hinterlegten Texte
   sind die Beschreibung der Station, nicht ihr Stand.
   Wird von webseite/steuerung.html und bereiche/kern-poster.html gezeichnet. */
(function(){
  const G="gruen", Y="gelb", R="rot", F="frage", S="still";   // still = stillgelegt, zaehlt nicht

  /* id, Spalte (0 links · 1 Hauptstrang · 2/3 rechts), Zeile, Farbe, Titel, Text,
     Klemmt, Work. Die Zeile bestimmt nur die Reihenfolge, nicht mehr die Pixel. */
  const KNOTEN = [
    {id:"scan",  c:1, r:0,  f:G, t:"Barcode gescannt",          s:"Im Laden. 5 von 5 Scans: Cache = Server."},
    {id:"kat",   c:1, r:1,  f:F, t:"Im Katalog?",               s:"62.166 Produkte bekannt."},
    {id:"off",   c:1, r:2,  f:F, t:"Open Food Facts kennt den Barcode?", s:"Abfrage live im Laden (off-lookup)."},
    {id:"adr",   c:0, r:3,  f:Y, t:"Adresse finden: Marke → Domain → Sitemap", s:"Drei Takte, 0 $: Domain suchen, sitemap.xml lesen, Produktseite dem Namen zuordnen, Link ans Produkt.", p:"Produkte an Marken ohne bestaetigte Domain. Sechs Herstellerseiten sperren sitemap.xml und robots.txt.", w:"#582 · Claude"},
    {id:"vorl",  c:1, r:3,  f:Y, t:"Vorlaeufige Karte (nur Fallback)", s:"Sie ueberbrueckt die Sekunden im Laden. Ziel ist die vollstaendige Produktkarte.", p:"Treffer ohne Zutatentext bei Open Food Facts. Ohne Zutaten keine vollstaendige Karte.", w:"#526 · KP-9 · Claude"},
    {id:"foto",  c:3, r:3,  f:G, t:"Niemand kennt es: Foto",    s:"Etikett fotografieren. Produkt in 7,9 s angelegt."},
    {id:"offd",  c:0, r:4,  f:G, t:"Zutaten von Open Food Facts", s:"Import laeuft. Seit #607 auch fuer Produkte, die noch nie dort abgefragt wurden."},
    {id:"herst", c:1, r:4,  f:Y, t:"Zutaten von der Herstellerseite", s:"Skript holt den Text. 68 % Treffer, 0 $. Herkunft wird seit v4 geschrieben, live.", p:"Produkte in der Arbeitsliste des Quellenabrufs. Ist sie leer, fehlt der Nachschub an Produktlinks - nicht die Arbeit.", w:"#519 · Claude"},
    {id:"web",   c:2, r:4,  f:S, t:"Websuche (stillgelegt)",    s:"Eingefroren nach E40, 0,27 $ je Lauf. Am 06.09. ersetzt: die Adresse kommt jetzt aus dem Markennamen, kostenlos. Ein bewusst stillgelegter Weg ist keine Luecke (E46)."},
    {id:"ki",    c:3, r:4,  f:Y, t:"KI liest das Foto",         s:"Zutaten und Naehrwerte, auf 2 kcal genau.", p:"97 alte Produkte nie geprueft, Marke bleibt leer.", w:"#495 · Ralph"},
    {id:"beleg", c:3, r:5,  f:G, t:"Belegpruefung: steht es wirklich auf dem Foto?", s:"Zweiter Blick auf die Etikettfotos, 0,0014 $ je Produkt. Findet die Pruefung kein Zutatenverzeichnis, sperrt der Server den Score mit Grund.", w:"#495 · Claude"},
    {id:"quelle",c:0, r:5,  f:Y, t:"Herkunft belegt",           s:"Jeder Etikettwortlaut traegt seine Quellenart. Seit #595 setzt ein Riegel sie beim Schreiben, statt sie nachzutragen.", p:"Wortlaute ohne Quellenart - Altbestand, dessen Kommentar die Herkunft nicht nennt.", w:"#595 · Claude"},
    {id:"prod",  c:1, r:5,  f:Y, t:"Produkt speichert",         s:"Zutatentext plus Herkunft am Produkt.", p:"Etikettprodukte ohne Wortlaut. Rohware ohne Etikett zaehlt nicht mit (Ralph 06.09.).", w:"#539 · Claude"},
    {id:"zerl",  c:1, r:6,  f:Y, t:"zerlegen",                  s:"cb_zutaten_aus_text teilt den Wortlaut in Namen und haengt die Stammnote an. Der Takt arbeitet sie ab.", p:"Wortlaute, aus denen noch keine Zutatenzeile geworden ist. Der Zulauf waechst mit jedem neuen Wortlaut.", w:"#588 · Claude"},
    {id:"stamm", c:1, r:7,  f:F, t:"Name im Stamm, mit Note?",  s:"Stamm 2.490 aktive Eintraege, 2.482 mit Note."},
    {id:"ohnenote",c:0,r:8, f:G, t:"Im Stamm, aber ohne Note",  s:"Nur noch 1 Eintrag wirklich offen. Am 04.09. waren es 97. Die uebrigen 7 sind regelgedeckt disponiert."},
    {id:"nicht", c:3, r:8,  f:Y, t:"Nicht im Stamm",            s:"Die Zahl steigt mit jedem neuen Wortlaut — neue Wahrheit bringt neue Luecken.", p:"Zusammengesetzte Zutaten mit Klammerliste, Fachfragen, OCR-Bruchstuecke.", w:"#560 · Claude"},
    {id:"bind",  c:1, r:9,  f:Y, t:"binden",                    s:"Gebunden wird an der ZEILE, nicht an der Zutat-ID.", p:"Der Zulauf kommt aus den neuen Wortlauten — ein Zeichen von Fortschritt, nicht von Ruecklauf.", w:"#560 · Claude"},
    {id:"naehr", c:3, r:10, f:Y, t:"Naehrwerte",                s:"Der Waechter schlaegt an, wenn die Kalorien ausserhalb des physikalisch Moeglichen liegen — seit #605 ohne Prozentschwelle.", p:"Produkte, deren Kalorienangabe aus den Makros nicht entstehen kann. Jeder Fall ist ein Datenfehler, kein Fehlalarm.", w:"#605 · Claude"},
    {id:"bew",   c:1, r:10, f:Y, t:"bewerten",                  s:"Score aus den Stammnoten. Ein Takt laesst den Riegel ueber jeden Score neu laufen.", p:"Ohne Stammnote kein Score — er faellt ehrlich weg, mit genanntem Grund.", w:"#512 · Claude"},
    {id:"nachlauf",c:0,r:10,f:Y, t:"Score-Nachlauf",            s:"Aendert sich eine Zutatennote, werden alle Produkte damit neu gerechnet. Der Takt arbeitet die Warteschlange ab.", p:"Offene Eintraege in der Warteschlange. Solange sie nicht leer ist, sind nicht alle Scores auf dem neuesten Regelstand.", w:"#512 · Claude"},
    {id:"frei",  c:1, r:11, f:G, t:"Freigabe",                  s:"Foto ohne Sichtpruefung bleibt gesperrt (E39). Hersteller und OFF frei nach Bindung."},
    {id:"antw",  c:1, r:12, f:G, t:"Im Laden erkannt",          s:"Entwurf „vorlaeufig“, Aktiv „geprueft“. Ohne Note: kein Score, ehrlich leer."}
  ];

  /* Beschriftete Abzweige: von, nach, Text. Sie stehen als Zeile an der Karte,
     nicht als Pfeil im Bild - eine Linie, die niemand lesen kann, hilft nicht. */
  const ABZWEIG = {
    kat:   "ja → sofort erkannt, sonst weiter nach unten",
    off:   "ja → vorlaeufige Karte · nein → Foto",
    stamm: "ja → binden · ohne Note oder unbekannt → die Kaesten daneben"
  };

  const CSS = `
  .kf{font:14px/1.5 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      max-width:1080px;margin:0 auto;--kfLinie:#cbd5e1;--kfGrund:transparent}
  .kf .kfReihe{display:grid;grid-template-columns:1fr 1.25fr 1fr;gap:10px;align-items:stretch;
      position:relative;padding:5px 0}
  .kf .kfSpalte{display:flex;flex-direction:column;gap:8px;justify-content:center}
  .kf .kfMitte{position:relative}
  /* Die durchgehende Linie hinter dem Hauptstrang ersetzt 25 Einzelpfeile. */
  .kf .kfReihe::before{content:"";position:absolute;left:50%;top:0;bottom:-10px;width:2px;
      margin-left:-1px;background:var(--kfLinie);z-index:0}
  .kf .kfReihe:last-child::before{bottom:50%}
  .kf .kfReihe:first-child::before{top:50%}
  .kf .kn{position:relative;z-index:1;border-radius:12px;padding:11px 13px;border:1.5px solid;
      background:#fff;color:#1a1d1a;box-shadow:0 1px 2px rgba(20,40,70,.05)}
  .kf .kn .t{font-weight:800;font-size:14px;margin-bottom:3px;line-height:1.3}
  .kf .kn .s{font-size:12.5px;line-height:1.45;opacity:.9}
  .kf .kn .p{margin-top:6px;font-size:12.5px;font-weight:600;line-height:1.45}
  .kf .kn .p::before{content:"Klemmt: "}
  .kf .kn .w{margin-top:6px;font-weight:800;font-size:11.5px;letter-spacing:.02em;opacity:.85}
  /* Die gemessene Zahl ist die Hauptaussage der Karte und steht entsprechend gross. */
  .kf .kn .kfMess{margin-top:8px;padding-top:7px;border-top:1px solid rgba(0,0,0,.10);
      font-size:12.5px;font-weight:700;display:flex;align-items:baseline;gap:7px}
  .kf .kn .kfMess b{font-size:20px;font-weight:800;line-height:1}
  .kf .kn.gruen{background:#eaf7ef;border-color:#16a34a;color:#14532d}
  .kf .kn.gelb {background:#fdf1cf;border-color:#d97706;color:#7a4b00}
  .kf .kn.rot  {background:#fdeded;border-color:#dc2626;color:#991b1b}
  .kf .kn.still{background:#f1f5f9;border-color:#94a3b8;color:#64748b;border-style:dashed}
  .kf .kn.frage{background:#eaf0fe;border-color:#2563eb;color:#1e3a8a;text-align:center}
  .kf .kn.frage .t{font-size:14.5px}
  .kf .kn .kfAbz{margin-top:6px;font-size:12px;font-weight:700;opacity:.85}
  .kf .kn.neben{font-size:13px}
  .kf .kn.neben .t{font-size:13px}
  .kf .legende{font-size:12px;color:#6b7280;margin:14px 4px 4px;line-height:1.6}
  .kf .legende i{display:inline-block;width:11px;height:11px;border-radius:3px;
      vertical-align:-1px;margin:0 5px 0 14px;border:1.5px solid}
  .kf .legende i.g{background:#eaf7ef;border-color:#16a34a}
  .kf .legende i.y{background:#fdf1cf;border-color:#d97706}
  .kf .legende i.b{background:#eaf0fe;border-color:#2563eb}
  .kf .legende i.s{background:#f1f5f9;border-color:#94a3b8;border-style:dashed}
  .kf .kfStand{display:block;margin-top:6px;font-weight:600}
  @media (max-width:820px){
    .kf .kfReihe{grid-template-columns:1fr;gap:8px}
    .kf .kfReihe::before{display:none}
    .kf .kn{border-left-width:5px}
  }
  .kf.dunkel{--kfLinie:#3a4450}
  .kf.dunkel .kn{background:#1b1f1c;color:#e9ece9;box-shadow:none}
  .kf.dunkel .kn.gruen{background:#12291c;color:#bbf7d0;border-color:#2f855a}
  .kf.dunkel .kn.gelb {background:#3a2c0c;color:#fde68a;border-color:#a16207}
  .kf.dunkel .kn.rot  {background:#331818;color:#fecaca;border-color:#b91c1c}
  .kf.dunkel .kn.still{background:#1e2530;color:#94a3b8}
  .kf.dunkel .kn.frage{background:#151f33;color:#c6d8fd;border-color:#3b5cb8}
  .kf.dunkel .kn .kfMess{border-top-color:rgba(255,255,255,.14)}
  .kf.dunkel .legende{color:#93a1b3}
  @media (prefers-color-scheme: dark){
    .kf:not(.hell){--kfLinie:#3a4450}
    .kf:not(.hell) .kn{background:#1b1f1c;color:#e9ece9;box-shadow:none}
    .kf:not(.hell) .kn.gruen{background:#12291c;color:#bbf7d0;border-color:#2f855a}
    .kf:not(.hell) .kn.gelb {background:#3a2c0c;color:#fde68a;border-color:#a16207}
    .kf:not(.hell) .kn.rot  {background:#331818;color:#fecaca;border-color:#b91c1c}
    .kf:not(.hell) .kn.still{background:#1e2530;color:#94a3b8}
    .kf:not(.hell) .kn.frage{background:#151f33;color:#c6d8fd;border-color:#3b5cb8}
    .kf:not(.hell) .kn .kfMess{border-top-color:rgba(255,255,255,.14)}
    .kf:not(.hell) .legende{color:#93a1b3}
  }`;

  function esc(s){ return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]); }
  const byId = {}; KNOTEN.forEach(k => byId[k.id] = k);

  function karte(k, neben){
    return '<div class="kn '+k.f+(neben?' neben':'')+'" data-knoten="'+k.id+'">'
      + '<div class="t">'+esc(k.t)+'</div>'
      + '<div class="s">'+esc(k.s)+'</div>'
      + (ABZWEIG[k.id] ? '<div class="kfAbz">'+esc(ABZWEIG[k.id])+'</div>' : '')
      + (k.p ? '<div class="p">'+esc(k.p)+'</div>' : '')
      + (k.w ? '<div class="w">'+esc(k.w)+'</div>' : '')
      + '</div>';
  }

  function zeichnen(el, opt){
    opt = opt || {};
    if(!el) return;
    if(!document.getElementById("kf-css")){
      const st = document.createElement("style"); st.id="kf-css"; st.textContent = CSS; document.head.appendChild(st);
    }
    const zeilen = [...new Set(KNOTEN.map(k => k.r))].sort((a,b) => a-b);
    let s = "";
    zeilen.forEach(r => {
      const inZeile = k => k.r === r;
      const links  = KNOTEN.filter(k => inZeile(k) && k.c === 0);
      const mitte  = KNOTEN.filter(k => inZeile(k) && k.c === 1);
      const rechts = KNOTEN.filter(k => inZeile(k) && k.c >= 2);
      s += '<div class="kfReihe">'
         + '<div class="kfSpalte">' + links.map(k => karte(k,true)).join("")  + '</div>'
         + '<div class="kfSpalte kfMitte">' + mitte.map(k => karte(k,false)).join("") + '</div>'
         + '<div class="kfSpalte">' + rechts.map(k => karte(k,true)).join("") + '</div>'
         + '</div>';
    });
    el.innerHTML = '<div class="kf'+(opt.dunkel?" dunkel":"")+'">' + s
      + '<div class="legende">'
      + '<i class="g"></i>laeuft <i class="y"></i>klemmt — Work-Nummer steht an der Karte'
      + ' <i class="b"></i>Frage mit Abzweig <i class="s"></i>stillgelegt, zaehlt nicht (E46)'
      + '<span class="kfStand">Stand: noch nicht gemessen</span></div></div>';
    if(opt.client) messen(opt.client, el);
  }

  /* 🔴 06.09.2026: Bis heute standen die Zahlen von Hand in dieser Datei und waren
     am naechsten Tag falsch. Jetzt misst sich jeder Kasten selbst an der Datenbank
     (cb_kern_poster_stand). Faellt die Messung aus, sagt die Fusszeile das, statt
     still einen alten Stand als aktuell auszugeben (CLAUDE.md A2, A11). */
  async function messen(client, el){
    if(!client || !el) return;
    var f = el.querySelector(".kfStand");
    var stand;
    try{
      var r = await client.rpc("cb_kern_poster_stand");
      if(r.error) throw r.error;
      stand = r.data;
    }catch(e){
      if(f) f.textContent = "Messung nicht erreichbar — die Karten zeigen nur ihre Beschreibung, keine Zahlen.";
      return;
    }
    if(!stand || !stand.kaesten) return;
    stand.kaesten.forEach(function(kx){
      var d = el.querySelector('[data-knoten="'+kx.id+'"]');
      if(!d) return;
      var alt = byId[kx.id];
      if(alt && alt.f === S) return;               // stillgelegt bleibt stillgelegt (E46)
      d.classList.remove("gruen","gelb","rot");
      d.classList.add(kx.ampel === "gruen" ? "gruen" : "gelb");
      var m = d.querySelector(".kfMess");
      if(!m){ m = document.createElement("div"); m.className = "kfMess"; d.appendChild(m); }
      m.innerHTML = "<b>" + kx.ist + "</b><span>"
        + (kx.ist === 0 ? "offen — " : "offen — ") + esc(kx.messung) + "</span>";
    });
    if(f){
      var offen = stand.kaesten.filter(function(k){ return k.ist > 0; }).length;
      f.textContent = "gemessen " + new Date(stand.gemessen_am).toLocaleString("de-DE")
        + " · " + (stand.kaesten.length - offen) + " von " + stand.kaesten.length + " Messungen auf null"
        + " · " + stand.aktive_produkte + " aktive Produkte, davon "
        + stand.rohware_ohne_etikett + " Rohware ohne Etikett (zaehlt nicht mit)";
    }
  }

  window.KERN_FLUSS = { KNOTEN, ABZWEIG, zeichnen, messen };
})();
