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
     Klemmt. Die Zeile bestimmt nur die Reihenfolge, nicht mehr die Pixel.
     KEINE WORK-NUMMER MEHR HIER (#613, 07.09.2026): die Aufgaben einer Karte
     kommen aus shadow_v1.kern_poster_karte_work, siehe aufgaben(). */
  /* 🔴 07.09.2026 (#613, Ralphs Zielsatz in #217): Das Poster IST ab jetzt der
     Produktweg — Eingabe im Laden, Bild oder EAN, abgeschickt; zurueck kommt ein
     vollstaendig bewertetes Produkt mit Index. Vier Gruppen: Eingang, Beschaffung,
     Verarbeitung, Ausgabe.
     KEINE ZAHL STEHT MEHR IN DIESEM TEXT. Jede Karte, deren id auch als kasten_id
     in v_kern_poster_stand steht, bekommt ihre Zahl aus der Messung. Eine Karte
     ohne Messkasten traegt bewusst gar keine Zahl — der Zwischenweg "Zahl von
     gestern im Text" ist abgeschafft (CLAUDE.md A2, A11).
     Zusammengelegt: "Nicht im Stamm" und "binden" lasen dieselbe Abfrage und sind
     jetzt EIN Kasten "bindung". Neu: zeit, quote, sperre, ausgabe. */
  /* 🔴 07.09.2026 (#616, Ralph): Zwei Aenderungen, beide von ihm.
     ERSTENS seine Handskizze steht jetzt VOLLSTAENDIG im Baum. Es fehlten
     fuenf Stationen: die drei Eingaenge EAN / Rueckseitenfoto / Frontbild,
     der Sammelpunkt "Erfassen" und der kurze Ja-Weg vom Katalogtreffer
     direkt zur Ausgabe.
     ZWEITENS faerbt der Baum nicht mehr nach Altbestand, sondern nach dem
     DURCHLAUF: gelb = offen, gruen = ein Testprodukt ist hier nachweislich
     durchgekommen. Ein Kasten wird nie gruen, weil niemand hingesehen hat.
     Quelle: shadow_v1.kern_durchlauf. Die Bestandszahl steht weiter an der
     Karte, aber sie entscheidet die Farbe nicht mehr. */
  /* 🔴 07.09.2026 (#217, Ralph): "der Baum ist keine Doku-Liste, er ist der Weg,
     der gruen werden muss — die einzelnen Werkzeuge und Ablaeufe muessen stehen."
     Jede Karte nennt deshalb ab jetzt ihr WERKZEUG (Funktion, Takt, Edge-Funktion,
     Tabelle) und WER es ausloest. Alles unten ist am 07.09.2026 in der Datenbank
     nachgelesen (pg_proc, cron.job, Views), nichts ist aus dem Gedaechtnis.
     Die Websuche ist ersetzt: die Adresse kommt aus Marke → Domain → Sitemap,
     den Text holt der Crawler (Edge quelle-abruf-einfach). */
  const KNOTEN = [
    /* ── Gruppe Eingang · vier Eingaenge, ein Sammelpunkt ─────────────── */
    {id:"ein_ean",  c:0, r:0, f:Y, t:"Eingang 1: EAN (nur Barcode)",
      s:"App → cb_scan_lookup (eigener Bestand + Scan_Cache) → bei Fremdtreffer cb_scan_off_treffer / cb_scan_cache_schreiben (Open Food Facts live) → Zeile in Scan_Cache. Von dort holt cb_scan_uebernehmen (Admin, von Hand im Scan-Eingang) das Produkt ueber cb_produkt_ingest in den Bestand.",
      p:"Die Uebernahme aus dem Scan_Cache ist Handarbeit — es gibt keinen Takt, der sie macht."},
    {id:"ein_foto", c:1, r:0, f:Y, t:"Eingang 2: Rueckseitenfoto mit EAN",
      s:"App → cb_riki_scan_einreihen(EAN, Fotos) → Scan_Warteschlange + shadow_v1.riki_scan_job. Eingangsart setzt der Trigger am Job (EAN + Foto = foto_rueckseite)."},
    {id:"ein_front",c:3, r:0, f:Y, t:"Eingang 3: Frontbild ohne EAN",
      s:"App 'Produkt ohne Barcode fotografieren' → cb_riki_ohne_ean_einreihen(Fotos) → legt sofort ein Entwurfsprodukt 'RIKI-Entwurf ohne EAN' an (Identitaet = Foto-Fingerabdruck in riki_no_ean_identity) → riki_scan_job. Erwartung: RIKI liest Name und Marke, dann geht es ueber Marke → Domain → Produktseite weiter (Beschaffung), nicht ueber das Foto."},
    {id:"ein_link", c:2, r:0, f:Y, t:"Eingang 4: Produktlink (Herstellerseite)",
      s:"cb_riki_ohne_ean_einreihen(Produktlink) → Entwurfsprodukt mit Produktlink, Quelle_Typ Herstellerseite, KEIN Foto-Auftrag. Weiter direkt beim Crawler (quelle-abruf-takt liest v_quelle_abruf_offen, Entwuerfe eingeschlossen)."},
    {id:"erfassen", c:1, r:1, f:Y, t:"Erfassen — Sammelpunkt",
      s:"Ab hier existiert ein Produkt (Bestand, Scan_Cache-Zeile oder Entwurf) mit festgehaltener Eingangsart. Ohne Eingangsart ist nicht messbar, welcher Eingang klemmt."},

    {id:"scan",  c:1, r:2,  f:Y, t:"RIKI liest (Worker)",
      s:"Takt riki-scan-worker-v1 (jede Minute, cb_riki_scan_worker_takt) ruft die Edge-Funktion riki-scan-worker; die holt sich Jobs ueber cb_riki_scan_job_claim, liest Zutaten, Naehrwerte, Name, Marke vom Foto und schliesst mit cb_riki_scan_job_abschliessen ab. Ohne EAN dazu cb_riki_no_ean_identitaet_pruefen (Dublette melden, nicht zusammenfuehren, E35)."},
    {id:"zeit",  c:0, r:2,  f:Y, t:"Antwortzeit",               s:"gestartet_am → beendet_am am riki_scan_job. Grenze 1 Minute. Ein Auftrag im Status 'gehalten' zaehlt als haengt.", p:"Auftraege, die gehalten wurden oder laenger als eine Minute liefen."},
    {id:"quote", c:3, r:2,  f:Y, t:"Durchlaufquote",            s:"riki_scan_job.status = fertig. Fehler stehen in letzter_fehler.", p:"Auftraege, die nicht fertig geworden sind."},
    {id:"kat",   c:1, r:3,  f:F, t:"Im Katalog?",               s:"Produkte.EAN_GTIN bzw. Produkt_ID am Job. cb_scan_lookup fuer die EAN, riki_no_ean_identity fuer Foto/Link."},
    {id:"treffer",c:3, r:3, f:Y, t:"Ja — kurzer Weg zur Ausgabe", s:"Aktives Produkt mit Score (Scores.Clean_Score) und belegtem Wortlaut (Zutaten_Rohtext.Quellenart) geht direkt zur Ausgabe, aber durch dieselben Waechter.", p:"Treffer ohne vollstaendige Karte."},
    {id:"off",   c:1, r:4,  f:F, t:"Open Food Facts kennt den Barcode?", s:"Nur mit EAN: cb_scan_off_treffer live im Laden; spaeter off-rohtext-takt (alle 6 Min, cb_off_rohtext_takt) fuer den Zutatentext.", p:"Produkte ohne EAN gehen hier immer 'nein' — ihr Weg ist die Herstellerseite."},
    {id:"vorl",  c:1, r:5,  f:Y, t:"Vorlaeufige Karte (nur Fallback)", s:"Scan_Cache.Score_vorlaeufig. Ueberbrueckt die Sekunden im Laden; ersetzt keine vollstaendige Karte."},
    {id:"foto",  c:3, r:5,  f:Y, t:"Etikettfoto = letzter Weg",    s:"Quellenleiter cb_riki_naechster_quellenweg: Produktseite → eingebettete Daten → verlinkte Herstellerdaten → geprueft-strukturiert → erst dann Foto. Das Foto ist Backup, nicht Standard.", p:"Produkte ohne Wortlaut und ohne Produktlink — nur das Foto bleibt."},

    /* ── Gruppe Beschaffung · Marke → Domain → Sitemap → Link → Crawler ── */
    {id:"adr",   c:0, r:6,  f:Y, t:"Adresse finden: Marke → Domain → Sitemap → Produktlink",
      s:"1) marke-domain-raten-takt (9,39; cb_marke_domain_raten_takt) bildet aus der Marke www.marke.de/.com und prueft, ob die Seite antwortet und die Marke nennt → Marken_Domain 'vorgeschlagen'; marken-beleg-nachlauf (22,52) bestaetigt. 2) marken-sitemap-takt (7,37; cb_marken_sitemap_takt) liest sitemap.xml → Marken_Domain_Seite. 3) produktlink-sitemap-takt (12,42; cb_produktlink_aus_sitemap_takt) ordnet den Produktnamen der Seite zu (v_produktseite_kandidat, Naehe ≥ 0,30) → Produkte.Produktlink. Alles kostenlos, kein LLM.",
      p:"v_produktseite_kandidat und v_marken_domain_stand kennen nur Produktstatus 'Aktiv' — ein RIKI-Entwurf ohne EAN bekommt so nie einen Produktlink. Ausserdem braucht es Produkte.Marke; ohne Marke vom Frontbild keine Domain."},
    {id:"herst", c:1, r:6,  f:Y, t:"Crawler: Zutaten von der Produktseite",
      s:"quelle-abruf-takt (17,47; cb_quelle_abruf_takt, 5 Produkte je Lauf) nimmt v_quelle_abruf_offen (Produktlink da, kein Wortlaut, Status Aktiv/Entwurf/pruefen) und ruft je Produkt die Edge-Funktion quelle-abruf-einfach (cb_edge_rufen). Ergebnis: Zutaten_Rohtext mit Quellenart Herstellerseite + Protokoll in product_source_retrieval_attempt (7 Tage Sperre bei Fehlschlag). Handweg fuer Sperren: cb_quelle_stufe2_ergebnis (Chrome-Lauf). Handelsmarken ohne eigene Seite: lmiv-edeka-takt (alle 10 Min; cb_lmiv_edeka_takt) fragt das EDEKA-LMIV-Portal per EAN ab (JSON-Schnittstelle, exakter GTIN-Abgleich) - auch Fremdmarken aus dem EDEKA-Sortiment.",
      p:"Ist die Arbeitsliste leer, fehlt der Nachschub an Produktlinks — nicht die Arbeit."},
    {id:"offd",  c:3, r:6,  f:Y, t:"Open Food Facts: Name, Naehrwerte, Zutaten", s:"off-rohtext-takt (alle 6 Min) und off-namen-takt (alle 3 Min) holen Wortlaut und Namen zur EAN → Zutaten_Rohtext Quellenart Open Food Facts.", p:"Produkte mit EAN, aber ohne Wortlaut."},
    {id:"web",   c:2, r:7,  f:S, t:"Websuche (stillgelegt)",    s:"Ersetzt durch Marke → Domain → Sitemap → Crawler. Ein bewusst stillgelegter Weg ist keine Luecke (E46)."},
    {id:"ki",    c:3, r:7,  f:Y, t:"KI liest das Foto (Backup)", s:"Derselbe Worker wie oben (Edge riki-scan-worker), nur mit Rueckseitenfoto: Zutaten und Naehrwerte → Zutaten_Rohtext Quellenart Etikettfoto. Erst wenn die Herstellerwege dokumentiert gescheitert sind."},

    /* ── Gruppe Verarbeitung ──────────────────────────────────────────── */
    {id:"quelle",c:0, r:8,  f:Y, t:"Herkunft belegt",           s:"Zutaten_Rohtext.Quellenart wird beim Schreiben vom Trigger gesetzt (w595c), nicht nachgetragen. Ein Produkt ohne Wortlaut hat keine belegte Herkunft."},
    {id:"prod",  c:1, r:8,  f:Y, t:"Produkt mit Wortlaut gespeichert", s:"Produkte + Zutaten_Rohtext am selben Produkt_ID. Rohware ohne Etikett (v_kern_rohware) zaehlt nicht."},
    {id:"beleg", c:3, r:8,  f:Y, t:"Belegpruefung: steht es wirklich auf dem Foto?", s:"etikett-belegpruefung-takt (27,57; cb_etikett_belegpruefung_takt) → shadow_v1.etikett_belegpruefung. Antwort 'nein' sperrt den Score mit Grund. Nur fuer Etikettfotos."},
    {id:"zerl",  c:1, r:9,  f:Y, t:"zerlegen: Wortlaut → Referenz → Zeilen",
      s:"referenz-nachlauf (alle 5 Min; cb_referenz_nachlauf_abarbeiten) prueft den Wortlaut gegen die Referenz; w594-zeilen-aus-referenz (alle 15 Min; cb_zeilen_aus_referenz_takt) schreibt daraus Produkt_Zutaten. Der alte rohtext-zerlegen-takt ist abgeschaltet und wird nicht mehr gebraucht.",
      p:"Wortlaut da, aber 0 Zutatenzeilen."},
    {id:"stamm", c:1, r:10, f:F, t:"Name im Stamm, mit Note?",  s:"Produkt_Zutaten.Zutat_ID gegen den Zutaten-Stamm. Offene Bindungen: v_active_product_ingredient_repair_open."},
    {id:"ohnenote",c:0,r:11,f:Y, t:"Im Stamm, aber ohne Note",  s:"v_zutaten_unbewertet_offen. Bewertung nur nach Regelwerk (Skill zutaten-aufloesen), B3 gesperrt fuer Agenten."},
    {id:"bindung",c:1,r:11, f:Y, t:"binden",                    s:"w648-huellen-aufloesen (alle 20 Min; cb_huellen_aufloesen_takt), funktionswort-umhaengen und zutat-dubletten (alle 10 Min) binden die Zeile an die Zutat-ID.", p:"Zeilen ohne Bindung."},
    {id:"bew",   c:1, r:12, f:Y, t:"bewerten",                  s:"score-nachlauf-takt (alle 5 Min; cb_score_nachlauf_abarbeiten) und score-nachrechnen-takt (19,49) → Scores.Clean_Score. Ohne Note faellt der Score mit Grund in Scores.Status weg."},
    {id:"naehr", c:3, r:12, f:Y, t:"Naehrwert-Waechter",        s:"v_naehrwerte_qa_offen, erhoben von shadow-waechter-cache-5min. Kalorien ausserhalb des Moeglichen = Datenfehler.", p:"Jeder Fall ist ein Datenfehler, kein Fehlalarm."},

    /* ── Gruppe Ausgabe ───────────────────────────────────────────────── */
    {id:"nachlauf",c:0,r:13,f:Y, t:"Score-Nachlauf",            s:"Score_Nachlauf-Warteschlange; abgearbeitet vom score-nachlauf-takt.", p:"Solange die Warteschlange nicht leer ist, sind nicht alle Scores auf dem neuesten Regelstand."},
    {id:"frei",  c:1, r:13, f:Y, t:"Freigabe",                  s:"kern-poster-cache-Takt (alle 15 Min) ruft cb_riki_freigabe_takt: Entwurf mit Score, gebundenen Zeilen und ohne Waechtertreffer → Produktstatus Aktiv, Nachpruefung spaeter (Ralph 07.09.). Etikettfoto ohne Belegpruefung bleibt Entwurf.", p:"Entwuerfe mit Score, die auf Freigabe warten."},
    {id:"sperre",c:3, r:13, f:Y, t:"Pruefung durch Waechter",   s:"Dieselben Waechter fuer Bestand und Neuzugang: Naehrwert-Waechter, Belegpruefung, offene Bindung. Ein Treffer sperrt die Ausgabe.", p:"Produkte mit Score trotz offenem Waechtertreffer."},
    {id:"ausgabe",c:1,r:14, f:Y, t:"Ausgabe vollstaendig",      s:"Produktstatus Aktiv + Scores.Clean_Score + Zutaten_Rohtext mit Quellenart. Erst dann ist der Weg zu."}
  ];

  /* Beschriftete Abzweige: von, nach, Text. Sie stehen als Zeile an der Karte,
     nicht als Pfeil im Bild - eine Linie, die niemand lesen kann, hilft nicht. */
  const ABZWEIG = {
    erfassen: "EAN · Rueckseitenfoto · Frontbild · Produktlink — ab hier ist der Weg derselbe",
    kat:   "ja → kurzer Weg zur Ausgabe, trotzdem durch die Waechter · nein → weiter nach unten",
    off:   "ja → vorlaeufige Karte + OFF-Wortlaut · nein (ohne EAN) → Adresse finden → Crawler · erst zuletzt Foto",
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
  /* 🔴 07.09.2026 (#613): Die Aufgaben einer Karte kommen aus der Datenbank
     (cb_admin_kern_poster_karten_work). Frueher stand hier .w mit einer getippten
     Nummer — am 07.09. waren 6 von 19 davon laengst abgenommen. */
  .kf .kn .kfWork{margin-top:7px;display:flex;flex-wrap:wrap;gap:5px;align-items:center}
  .kf .kn .kfWork .kfChip{font-size:11px;font-weight:800;letter-spacing:.02em;
      border:1.5px solid currentColor;border-radius:999px;padding:2px 8px;cursor:pointer;
      background:rgba(255,255,255,.55);line-height:1.5}
  .kf .kn .kfWork .kfChip:hover{background:rgba(255,255,255,.95)}
  .kf .kn .kfWork .kfChip .kfWer{font-weight:600;opacity:.75}
  .kf .kn .kfWork .kfLeer{font-size:11px;font-weight:600;opacity:.6;font-style:italic}
  .kf .kn.kfWahl{outline:3px solid #2563eb;outline-offset:2px}
  .kf .kn[data-knoten]{cursor:pointer}
  /* Die gemessene Zahl ist die Hauptaussage der Karte und steht entsprechend gross. */
  .kf .kn .kfMess{margin-top:8px;padding-top:7px;border-top:1px solid rgba(0,0,0,.10);
      font-size:12.5px;font-weight:700;display:flex;align-items:baseline;gap:7px}
  .kf .kn .kfMess b{font-size:20px;font-weight:800;line-height:1}
  .kf .kn .kfMess span{display:block}
  /* Zeitstempel an jeder Karte: eine Zahl ohne Zeitpunkt ist eine Behauptung. */
  .kf .kn .kfMess .kfZeit{display:block;margin-top:2px;font-style:normal;
      font-size:11px;font-weight:600;opacity:.7}
  /* Wo es klemmt, steht welcher Testfall haengt - eine Zahl ohne Fall
     sagt nicht, was zu tun ist (#616). */
  .kf .kn .kfMess .kfKlemmt{display:block;margin-top:3px;font-style:normal;
      font-size:12px;font-weight:800}
  .kf .kn .kfBestand{margin-top:5px;font-size:11.5px;font-weight:600;opacity:.62;
      line-height:1.4}
  .kf .kn .kfBestand b{font-weight:800}
  .kf .kn .kfMess.kfOhne{font-weight:600;opacity:.7;font-style:italic}
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
      + '<div class="kfWork"><span class="kfLeer">Aufgaben werden geladen …</span></div>'
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
      + '<i class="g"></i>geschlossen — ein Testprodukt ist hier durchgekommen'
      + ' <i class="y"></i>offen'
      + ' <i class="b"></i>Frage mit Abzweig <i class="s"></i>stillgelegt, zaehlt nicht (E46)'
      + '<span class="kfStand">Stand: noch nicht gemessen</span></div></div>';
    verdrahten(el);
    if(opt.client){ messen(opt.client, el); aufgaben(opt.client, el); }
  }

  /* 🔴 07.09.2026 (#613): Ein Klick auf die Karte meldet die Station nach aussen —
     die Steuerungsseite filtert daraufhin ihre Aufgabenliste. Ein Klick auf eine
     Aufgabe meldet die Work-Nummer; die Seite oeffnet dasselbe Panel wie in der
     Liste. Das Poster kennt das Panel nicht und baut es auch nicht nach (A4). */
  function verdrahten(el){
    el.addEventListener("click", function(ev){
      var chip = ev.target.closest ? ev.target.closest(".kfChip") : null;
      if(chip){
        ev.stopPropagation();
        el.dispatchEvent(new CustomEvent("kf:work",
          { bubbles:true, detail:{ work_id: Number(chip.getAttribute("data-work")) } }));
        return;
      }
      var kn = ev.target.closest ? ev.target.closest("[data-knoten]") : null;
      if(!kn) return;
      var id = kn.getAttribute("data-knoten");
      var anAus = !kn.classList.contains("kfWahl");
      Array.prototype.forEach.call(el.querySelectorAll(".kfWahl"),
        function(d){ d.classList.remove("kfWahl"); });
      if(anAus) kn.classList.add("kfWahl");
      el.dispatchEvent(new CustomEvent("kf:karte", { bubbles:true, detail:{
        kasten_id: anAus ? id : null,
        titel: anAus && byId[id] ? byId[id].t : null,
        work_ids: anAus ? (WORK_JE_KARTE[id] || []).map(function(w){ return w.work_id; }) : []
      }}));
    });
  }

  /* Welche Aufgaben an welcher Karte haengen, steht in der Datenbank, nicht hier. */
  var WORK_JE_KARTE = {};

  async function aufgaben(client, el){
    if(!client || !el) return;
    var reihen;
    try{
      var r = await client.rpc("cb_admin_kern_poster_karten_work");
      if(r.error) throw r.error;
      reihen = r.data || [];
    }catch(e){
      Array.prototype.forEach.call(el.querySelectorAll(".kfWork"), function(w){
        w.innerHTML = '<span class="kfLeer">Aufgaben nicht erreichbar</span>';
      });
      return;
    }
    WORK_JE_KARTE = {};
    reihen.forEach(function(x){
      (WORK_JE_KARTE[x.kasten_id] = WORK_JE_KARTE[x.kasten_id] || []).push(x);
    });
    Array.prototype.forEach.call(el.querySelectorAll("[data-knoten]"), function(d){
      var id = d.getAttribute("data-knoten");
      var w = d.querySelector(".kfWork");
      if(!w) return;
      var liste = WORK_JE_KARTE[id] || [];
      if(!liste.length){
        w.innerHTML = '<span class="kfLeer">keine offene Aufgabe</span>';
        return;
      }
      w.innerHTML = liste.map(function(x){
        return '<span class="kfChip" data-work="'+x.work_id+'" title="'+esc(x.work_titel||"")+'">'
          + "#" + x.work_id + ' <span class="kfWer">' + esc(STAND[x.work_status] || x.work_status)
          + " · " + esc(x.owner_agent || "ohne") + "</span></span>";
      }).join("");
    });
  }

  /* Dieselben Worte wie in der Aufgabenliste — zwei Namen fuer denselben Stand
     waeren eine zweite Wahrheit. */
  const STAND = { open:"offen", in_progress:"läuft", ready_for_verification:"zur Abnahme",
                  blocked:"blockiert", disputed:"strittig", decision_ralph:"Ralph entscheidet" };

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

    /* 🔴 07.09.2026 (#613): Jede Karte traegt ihre Zahl MIT dem Zeitpunkt, zu dem
       sie gemessen wurde. Eine Zahl ohne Zeitstempel ist eine Behauptung. */
    var zeitpunkt = stand.gemessen_am
      ? new Date(stand.gemessen_am).toLocaleString("de-DE")
      : "Zeitpunkt unbekannt";
    var gemessen = {};

    stand.kaesten.forEach(function(kx){
      var d = el.querySelector('[data-knoten="'+kx.id+'"]');
      if(!d) return;
      gemessen[kx.id] = true;
      var alt = byId[kx.id];
      if(alt && alt.f === S) return;               // stillgelegt bleibt stillgelegt (E46)
      d.classList.remove("gruen","gelb","rot");
      d.classList.add(kx.ampel === "gruen" ? "gruen" : "gelb");
      var m = d.querySelector(".kfMess");
      if(!m){ m = document.createElement("div"); m.className = "kfMess"; d.appendChild(m); }
      /* 🔴 07.09.2026 (#616, Ralph): "ich will im baum nur sehen was
         funktioniert und wo es klemmt anhand der testfaelle."
         Hauptaussage ist also der DURCHLAUF. Die Bestandszahl steht klein
         darunter — sie ist Hintergrund, nicht das Urteil. */
      var ges = kx.tf_gesamt || 0, durch = kx.tf_durch || 0, haengt = kx.tf_haengt || 0;
      var kopf = ges
        ? "<b>" + durch + "/" + ges + "</b><span>Testfälle durch diese Station"
            + (haengt
                ? '<i class="kfKlemmt">klemmt bei ' + esc(kx.klemmt_bei || "") + "</i>"
                : (durch ? "" : '<i class="kfZeit">noch keiner gelaufen</i>'))
            + '<i class="kfZeit">gemessen ' + esc(zeitpunkt) + "</i></span>"
        : "<b>" + kx.ist + "</b><span>" + esc(kx.messung)
            + '<i class="kfZeit">gemessen ' + esc(zeitpunkt) + "</i></span>";
      m.innerHTML = kopf;
      if(ges){
        var b = d.querySelector(".kfBestand");
        if(!b){ b = document.createElement("div"); b.className = "kfBestand"; d.appendChild(b); }
        b.innerHTML = "Bestand: <b>" + kx.ist + "</b> " + esc(kx.messung);
      }
    });

    /* Eine Karte ohne Messkasten sagt das ausdruecklich. Frueher stand dort eine
       getippte Zahl von gestern - der Zwischenweg, den Ralph abgeschafft hat. */
    Array.prototype.forEach.call(el.querySelectorAll("[data-knoten]"), function(d){
      var id = d.getAttribute("data-knoten");
      if(gemessen[id]) return;
      var alt = byId[id];
      if(alt && (alt.f === S || alt.f === F)) return;   // stillgelegt und Fragen tragen keine Zahl
      if(d.querySelector(".kfMess")) return;
      var m = document.createElement("div");
      m.className = "kfMess kfOhne";
      m.innerHTML = "<span>an dieser Station wird noch nichts gemessen</span>";
      d.appendChild(m);
    });

    if(f){
      /* 🔴 07.09.2026 (#616, Ralph): "im baum soll nur stehen offen = gelb,
         geschlossen/verifiziert = gruen". Gezaehlt wird also der DURCHLAUF,
         nicht mehr, wie viele Bestandszahlen zufaellig auf null stehen. */
      var gruen = stand.kaesten.filter(function(k){ return k.ampel === "gruen"; }).length;
      var klemmen = stand.kaesten.filter(function(k){ return (k.tf_haengt||0) > 0; });
      f.textContent = "gemessen " + zeitpunkt
        + " · " + gruen + " von " + stand.kaesten.length + " Stationen geschlossen"
        + " · " + (stand.testfaelle || 0) + " Testfälle im Prüfsatz"
        + (klemmen.length
            ? " · es klemmt an: " + klemmen.map(function(k){ return k.titel; }).join(", ")
            : (gruen ? "" : " · noch kein Testfall gelaufen"));
    }
  }

  window.KERN_FLUSS = { KNOTEN, ABZWEIG, zeichnen, messen, aufgaben,
                        werJeKarte: function(){ return WORK_JE_KARTE; } };
})();
