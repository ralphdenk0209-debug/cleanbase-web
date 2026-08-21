/* ============================================================================
   DASHBOARD „ARBEITSFLÄCHE" (Ralph-Entscheid 30.07.2026)
   ----------------------------------------------------------------------------
   Vorgeschichte: Der Netzplan (Metro-Karte) hat es nicht getroffen — Ralph:
   „möchte eher etwas wie einen graph, aber interaktiv bzw lebend … soll dann mein
   dashboard ersetzen und für die tägliche arbeit sein". Nach drei Mockups sein
   Entscheid: **C als Grundgerüst, der Wächter-Ring aus B als Kopf-Element, A
   (lebender Graph) als Zweitansicht.**

   WARUM NICHT DER REINE GRAPH ALS HAUPTANSICHT — die Begründung gehört hierher,
   damit sie in drei Monaten nicht als Willkür gelesen wird: Ein Kräfte-Graph hat
   keine festen Plätze. Jeden Morgen liegt alles anders, man baut kein
   Muskelgedächtnis auf, und jede Zahl kostet einen Hover. Ralphs Ausgangsproblem
   war „ich verliere den Überblick" — Bewegung hilft dagegen nicht. Deshalb:
   Arbeitsfläche mit festen Plätzen als Werkzeug, Graph zum Erkunden.

   DREI BAUSTEINE
   1) WÄCHTER-RING: 25 Segmente, eines je Wächter, in drei Gruppen (Anlage · Tür ·
      Bestand) durch Lücken getrennt. Blass = still, gefüllt = meldet. Ein Ring statt
      einer Liste, weil niemand 25 Zahlen liest — ein rotes Segment im Augenwinkel
      aber sieht. In der Mitte die eine Zahl, um die es geht.
   2) ARBEITSLISTE „Heute zu tun": wird aus denselben Zahlen ABGELEITET, nicht
      gepflegt. Eine handgeführte Liste veraltet; diese kann es nicht (§4b).
   3) FLUSS: Zuflüsse → Prüfung → Katalog. Dicke = Menge, laufende Punkte = lebendig,
      und ein Zufluss ohne Abnehmer endet im ROTEN RIEGEL. Das ist der Befund vom
      30.07.: 51 Einträge holt niemand ab (§1.11n-hh).

   ALLE ZAHLEN AUS cb_dashboard + cb_netzplan. Keine im Code (§4b, MIKRO_REF-Falle).
   Scheitert ein Abruf, wird es LAUT gemeldet und die Seite fällt auf das alte
   Enterprise-Dashboard zurück — nie stilles Grün (§1.13i).
   NUR FÜR ADMINS, ohne Beta-Flag (Ralph 30.07.: „ist nur Admin!!! kein anderer nutzer“):
   das Dashboard liegt in der Freigabe-Ansicht, die in setMode hart auf ME.is_admin prüft.
   Ein Beta-Flag hätte in der NUTZER-Beta-Liste gestanden und sich dort auf „für alle“
   stellen lassen — ein Schalter, der etwas verspricht, was er nicht halten kann.
   Rückfall auf das alte Dashboard: admin-lokale dritte Ansicht „Klassisch“ im Umschalter.
   ============================================================================ */
/* ===== NETZPLAN ENTFERNT am 30.07.2026 (Ralph: „netzplan kann raus!") =====
   Die Metro-Karte ist durch das Dashboard „Arbeitsfläche" darunter ersetzt.
   VOLLSTÄNDIG GELÖSCHT, nicht deaktiviert (§1.11n-p): toter Code, der DOM-IDs vergibt,
   ist nicht tot — er wartet. npSvg/npStationen/npInfo hätten beim nächsten Umbau still
   mit neuen IDs kollidiert. Was BLEIBT: die RPC cb_netzplan() — sie ist jetzt die
   Datenquelle der Arbeitsfläche. Alter Stand: Git-Verlauf, Build 2026-07-30-1422. */

var _AB={gut:'#0ca30c',warn:'#e0951a',krit:'#dc3a3a',grau:'#9aa1ab',
         zu:'#0d8f9c',pr:'#6a4ac7',kern:'#2e7d46',ink:'#131a24',mut:'#6b7480'};

function dashArbeitCss(){
  if(document.getElementById('dashAbCss')) return;
  var A='#fgDash .ab';
  var css=A+'{--abbg:#f6f7f9;--abcard:#fff;--abink:#131a24;--abmut:#6b7480;--abline:#e6e9ee;'
    +'color:var(--abink);font-size:14px;line-height:1.55}'
   +A+' *{box-sizing:border-box}'
   +A+' .abkopf{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:13px}'
   +A+' .abkopf h2{font-size:19px;font-weight:800;margin:0;letter-spacing:-.2px}'
   +A+' .abkopf .st{font-size:11.5px;color:var(--abmut)}'
   +A+' .abum{display:inline-flex;border:1px solid var(--abline);border-radius:10px;overflow:hidden;background:#fff}'
   +A+' .abum button{background:#fff;border:0;color:var(--abmut);font-size:12px;font-weight:700;padding:6px 13px;cursor:pointer}'
   +A+' .abum button.on{background:var(--abink);color:#fff}'
   +A+' .abbtn{background:#fff;border:1px solid var(--abline);border-radius:9px;padding:6px 12px;'
    +'font-weight:700;font-size:12px;color:var(--abink);cursor:pointer}'
   +A+' .abbtn:hover{border-color:#cfd5de}'
   +A+' .abkpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(178px,1fr));gap:11px;margin-bottom:13px}'
   +A+' .abk{background:#fff;border:1px solid var(--abline);border-radius:14px;padding:12px 14px;'
    +'box-shadow:0 1px 2px rgba(16,24,40,.04)}'
   +A+' .abk .l{font-size:11.5px;color:var(--abmut);font-weight:600}'
   +A+' .abk .v{font-size:27px;font-weight:800;letter-spacing:-1.1px;line-height:1.15;margin-top:1px;'
    +'font-variant-numeric:tabular-nums}'
   +A+' .abk .s{font-size:11.5px;color:var(--abmut)}'
   +A+' .abprojektzeit{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(170px,.8fr);'
    +'gap:11px;margin-bottom:13px}'
   +A+' .abpk{display:flex;align-items:center;gap:12px;min-width:0;background:#fff;'
    +'border:1px solid var(--abline);border-radius:14px;padding:10px 14px;'
    +'box-shadow:0 1px 2px rgba(16,24,40,.04)}'
   +A+' .abpk.go{border-left:4px solid '+_AB.kern+'}'
   +A+' .abpk .abl{font-size:10.5px;font-weight:800;letter-spacing:.08em;color:var(--abmut);'
    +'white-space:nowrap}'
   +A+' .abpk strong{font-size:18px;line-height:1.15;font-variant-numeric:tabular-nums;'
    +'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
   +A+' .abpk.go strong{font-size:21px;color:'+_AB.kern+'}'
   +A+' .abpk small{margin-left:auto;color:var(--abmut);font-size:10.5px;white-space:nowrap}'
   +'@media (max-width:720px){'+A+' .abprojektzeit{grid-template-columns:1fr}'
    +A+' .abpk small{display:none}}'
   +A+' .abbar{height:6px;background:#eef0f4;border-radius:4px;margin-top:8px;overflow:hidden}'
   +A+' .abbar i{display:block;height:6px;border-radius:4px}'
   +A+' .abrow{display:grid;gap:13px;align-items:start;margin-bottom:13px}'
   +A+' .abrow.r1{grid-template-columns:392px minmax(0,1fr)}'
   +A+' .abrow.r2{grid-template-columns:minmax(0,1fr) 320px}'
   /* .r3 seit 15.08.2026: drei gleich breite Kästen (Herzschlag · Herkunft · Bestand).
      Sie standen bis dahin als 320px-Säule rechts NEBEN dem Fluss. Ohne den Fluss wäre
      dort ein leeres Feld über zwei Drittel der Breite geblieben. .r2 bleibt unverändert —
      die Graph-Ansicht benutzt sie weiter (eine Regel ändern, die zwei Ansichten teilen,
      hätte den Graph mitgerissen). */
   +A+' .abrow.r3{grid-template-columns:repeat(3,minmax(0,1fr))}'
   +'@media (max-width:1080px){'+A+' .abrow.r1,'+A+' .abrow.r2,'+A+' .abrow.r3{grid-template-columns:1fr}}'
   +A+' .abp{background:#fff;border:1px solid var(--abline);border-radius:15px;'
    +'box-shadow:0 1px 2px rgba(16,24,40,.04);min-width:0}'
   +A+' .abph{display:flex;align-items:center;gap:9px;padding:11px 15px;border-bottom:1px solid var(--abline);flex-wrap:wrap}'
   +A+' .abph h3{font-size:13.5px;font-weight:700;margin:0;flex:1;min-width:120px}'
   +A+' .abtag{font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px}'
   +A+' .abpad{padding:13px 15px}'
   +A+' .abjob{display:flex;gap:11px;align-items:flex-start;padding:11px 15px;border-bottom:1px solid #f1f3f6;'
    +'text-decoration:none;color:inherit;cursor:pointer;transition:background .12s}'
   +A+' .abjob:last-child{border-bottom:0}'+A+' .abjob:hover{background:#fbfcfd}'
   +A+' .abjob .sv{width:3px;border-radius:3px;align-self:stretch;flex:0 0 3px}'
   +A+' .abjob .nm{font-size:21px;font-weight:800;min-width:50px;text-align:right;letter-spacing:-.7px;'
    +'font-variant-numeric:tabular-nums}'
   +A+' .abjob .tx{flex:1;min-width:0}'
   +A+' .abjob .t1{font-weight:700;font-size:13px}'
   +A+' .abjob .t2{font-size:12px;color:var(--abmut);margin-top:1px}'
   +A+' .abjob .go{font-size:11.5px;font-weight:700;color:#2e7d46;white-space:nowrap;align-self:center}'
   +A+' .abfoot{font-size:11.5px;color:var(--abmut);padding:10px 15px;border-top:1px solid var(--abline)}'
   +A+' .abwg{display:grid;grid-template-columns:repeat(auto-fill,minmax(146px,1fr));gap:7px;padding:13px 15px}'
   +A+' .abwc{border:1px solid var(--abline);border-radius:10px;padding:8px 10px;cursor:pointer;'
    +'background:#fff;transition:transform .12s,box-shadow .12s}'
   +A+' .abwc:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(16,24,40,.08)}'
   +A+' .abwc .g{font-size:9.5px;font-weight:800;letter-spacing:.4px;text-transform:uppercase}'
   +A+' .abwc .n{font-size:11.5px;font-weight:600;line-height:1.3;height:30px;overflow:hidden;margin-top:1px}'
   +A+' .abwc .z{font-size:17px;font-weight:800;letter-spacing:-.5px;font-variant-numeric:tabular-nums}'
   +A+' .abkv{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:5px 0;'
    +'border-bottom:1px dashed var(--abline)}'
   +A+' .abkv:last-child{border-bottom:0}'+A+' .abkv b{font-variant-numeric:tabular-nums}'
   +A+' .abtab{font-size:11.5px;border:1px solid var(--abline);background:#fafbfc;border-radius:999px;'
    +'padding:4px 11px;cursor:pointer;font-weight:600;color:var(--abmut)}'
   +A+' .abtab.on{background:var(--abink);color:#fff;border-color:var(--abink)}'
   +A+' .abseg{cursor:pointer;transition:opacity .15s}'
   +A+' .abfehler{font-size:12.5px;color:#8d2b2b;background:#fdf1f1;border:1px solid #f0c2c2;'
    +'border-radius:10px;padding:9px 12px;margin-bottom:12px}'
   +A+' svg{display:block;width:100%;height:auto}'
   +A+' #abCv{display:block;width:100%;height:560px;cursor:grab}'
   +A+' #abCv.zieh{cursor:grabbing}'
   +A+' .abpill{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;'
    +'background:#f4f6f8;border:1px solid var(--abline);border-radius:999px;padding:3px 9px;margin:0 4px 4px 0}'
   +A+' .abdot{width:8px;height:8px;border-radius:50%;display:inline-block;flex:0 0 auto}'
   /* ===== HERO + BENTO — Durchgang 2 (Ralph-Auftrag „Variante B", 15.08.2026) =====
      Ralphs Vorgaben woertlich: weisse Karten, 14–18px Radius, leichte Schatten,
      Gruen=gut · Blau=neutral · Orange=pruefen · Rot=Blocker · Grau=Hintergrund,
      KEINE bunte Ampelwand. Desktop 4 Spalten · mittel 2 · klein 1.
      Die Farben kommen aus _AB — es wird KEINE zweite Palette aufgemacht (§4.2). */
   +A+' .abhero{background:linear-gradient(135deg,#17502c,#2e7d46);border-radius:16px;'
    +'padding:15px 19px;color:#fff;display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-bottom:14px;'
    +'box-shadow:0 6px 20px rgba(23,80,44,.18)}'
   +A+' .abhero .hzust{font-size:17px;font-weight:800;letter-spacing:-.2px;display:flex;align-items:center;gap:9px}'
   +A+' .abhero .hpunkt{width:11px;height:11px;border-radius:50%;flex:0 0 auto;'
    +'box-shadow:0 0 0 3px rgba(255,255,255,.22)}'
   +A+' .abhero .hzahlen{display:flex;gap:22px;flex-wrap:wrap}'
   +A+' .abhero .hz{min-width:0}'
   +A+' .abhero .hz b{display:block;font-size:20px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums}'
   +A+' .abhero .hz span{font-size:11px;opacity:.82;letter-spacing:.02em}'
   +A+' .abhero .hz.klick{cursor:pointer;border-radius:8px;padding:2px 6px;margin:-2px -6px}'
   +A+' .abhero .hz.klick:hover{background:rgba(255,255,255,.13)}'
   +A+' .abhero .hr{margin-left:auto;display:flex;align-items:center;gap:11px;font-size:12px;opacity:.92}'
   +A+' .abhero .hbtn{background:rgba(255,255,255,.17);border:1px solid rgba(255,255,255,.32);'
    +'color:#fff;padding:6px 13px;border-radius:9px;font-weight:700;cursor:pointer;font-size:12.5px}'
   +A+' .abhero .hbtn:hover{background:rgba(255,255,255,.26)}'
   /* Work #42/E5: der Anordnen-Knopf muss ANGESCHALTET aussehen, solange der
      Modus laeuft — sonst sieht Ralph im Hero nicht, warum das Dashboard
      ploetzlich gestrichelte Rahmen hat. */
   +A+' .abhero .hbtn.on{background:#fff;color:'+_AB.kern+';border-color:#fff;font-weight:800}'
   +'@media (max-width:720px){'+A+' .abhero .hr{margin-left:0;width:100%}}'
   /* Bento: 4 Spalten, die erste Kachel nimmt zwei — „HEUTE" ist die Hauptsache
      und darf nicht so gross wie eine Nebenzahl sein (Ralph: keine zehn gleich
      grossen Kaesten). */
   /* 🔴 KORREKTUR 15.08.2026, am Bild gemessen: bei 4 Spalten und einer doppelt
      breiten Kachel passen nur DREI der vier Kacheln in die Reihe — „Waechter-
      Status" fiel in eine zweite Zeile und wurde dort riesig. Ralphs Bild hat
      vier Kacheln nebeneinander, die erste gross. Das sind 2+1+1+1 = FUENF
      Spalten, nicht vier. */
   +A+' .abbento{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:13px;'
    +'align-items:stretch;margin-bottom:14px}'
   +A+' .abbento .bgross{grid-column:span 2}'
   +'@media (max-width:1180px){'+A+' .abbento{grid-template-columns:repeat(2,minmax(0,1fr))}'
    +A+' .abbento .bgross{grid-column:span 2}}'
   +'@media (max-width:640px){'+A+' .abbento{grid-template-columns:1fr}'
    +A+' .abbento .bgross{grid-column:span 1}}'
   +A+' .abbento .bk{background:#fff;border:1px solid var(--abline);border-radius:16px;'
    +'display:flex;flex-direction:column;min-width:0;overflow:hidden;box-shadow:0 2px 7px rgba(19,26,36,.05)}'
   +A+' .abbento .bkopf{display:flex;align-items:center;gap:8px;padding:11px 14px 0;flex-wrap:wrap}'
   +A+' .abbento .bkopf h3{margin:0;font-size:10.5px;font-weight:800;text-transform:uppercase;'
    +'letter-spacing:.06em;color:var(--abmut);flex:1;min-width:90px}'
   +A+' .abbento .bleib{padding:11px 14px 13px;flex:1;min-width:0}'
   /* 🔴 17.08.2026, Ralph mit Screenshot: „auf stamm ueberblick kann ich nicht
      klicken und da sind keine 740 faelle??" Er hatte recht, und die Ursache war
      nicht der Klick, sondern die HOEHE. Die Kachel fasst 270 px (Ralph 16.08.:
      „die kasten selbe hoehe"), der Inhalt ist auf 13 Zeilen gewachsen — der
      ganze ALT-Block mit Regelfaelle 740 und Quelle offen 554 lag UNTERHALB
      des Randes und war stumm abgeschnitten. Ein Inhalt, der lautlos verschwindet,
      ist schlimmer als einer, der nicht passt.
      Jetzt: die Kachel scrollt, UND man sieht, dass sie es tut. */
   +A+' .abbento .bscroll{overflow-y:auto;overscroll-behavior:contain;'
    +'scrollbar-width:thin;position:relative}'
   +A+' .abbento .bscroll::-webkit-scrollbar{width:7px}'
   +A+' .abbento .bscroll::-webkit-scrollbar-thumb{background:#c9d1da;border-radius:4px}'
   +A+' .abbento .bmehr{position:sticky;bottom:-13px;margin:0 -14px -13px;padding:14px 14px 7px;'
    +'font-size:10.5px;font-weight:700;color:var(--abmut);text-align:center;pointer-events:none;'
    +'background:linear-gradient(180deg,rgba(255,255,255,0) 0%,#fff 55%)}'
   +A+' .abbento .bzahl{font-size:31px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}'
   +A+' .abbento .bunter{font-size:11.5px;color:var(--abmut);margin-top:4px;line-height:1.4}'
   /* Aufgabenzeilen. Jede Zeile springt hin — eine Zahl ohne Weg ist eine Attrappe (Ralph P12). */
   +A+' .abbento .baufg{display:flex;align-items:center;gap:10px;padding:8px 14px;'
    +'border-top:1px solid var(--abline);cursor:pointer}'
   +A+' .abbento .baufg:hover{background:#f7f9fa}'
   /* 🔴 KORREKTUR: die Plakette war fest 22px breit, deshalb wurde bei >99 auf
      „99+" gekuerzt — und 248 sah aus wie 543. Zwei verschiedene Rueckstaende
      duerfen nicht gleich aussehen; genau die Zahl ist ja die Aussage. Jetzt
      waechst die Plakette mit der Stelligkeit (min-width statt width). */
   +A+' .abbento .baufg .bp{flex:0 0 auto;min-width:22px;height:22px;padding:0 5px;'
    +'border-radius:11px;color:#fff;font-size:11px;font-weight:800;display:flex;'
    +'align-items:center;justify-content:center;font-variant-numeric:tabular-nums}'
   /* 🔴 KORREKTUR: bt1/bt2 sind <span> und damit inline — im Bild lief
      „…niemand holt sie abältester Eintrag 31 Tage alt" in EINER Zeile
      ineinander. display:block trennt sie. Am Bild gemessen, nicht im Code
      gefunden: der Rendertest prueft Markup, nicht Umbruch. */
   +A+' .abbento .baufg .bt{flex:1;min-width:0}'
   +A+' .abbento .baufg .bt1{display:block;font-size:12.5px;font-weight:700;'
    +'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
   +A+' .abbento .baufg .bt2{display:block;font-size:11px;color:var(--abmut);'
    +'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px}'
   +A+' .abbento .baufg .bgo{flex:0 0 auto;color:var(--abmut);font-size:15px}'
   +A+' .abbento .bleer{padding:20px 14px;text-align:center;color:var(--abmut);font-size:12.5px}'
   +A+' .abbento .bzeile{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;'
    +'padding:5px 0;border-bottom:1px dashed var(--abline)}'
   +A+' .abbento .bzeile:last-child{border-bottom:0}'
   +A+' .abbento .bzeile b{font-variant-numeric:tabular-nums;flex:0 0 auto}'
   +A+' .abbento .bfuss{font-size:11px;color:var(--abmut);padding:9px 14px;border-top:1px solid var(--abline)}'
   /* 🔴 KORREKTUR: weiter oben steht `.ab svg{width:100%;height:auto}` — fuer den
      grossen Waechter-Ring und den Fluss richtig, fuer den kleinen Kachelring
      verheerend. Er wurde auf Kachelbreite aufgeblasen und sprengte die Zeile.
      Die Breitenangabe im <svg>-Tag allein half nicht: die Regel ist
      spezifischer. Deshalb hier gezielt zurueckgesetzt statt die allgemeine
      Regel anzufassen — die haengt an Bausteinen, die ich nicht anfasse (§2.3). */
   +A+' .abbento .bring{display:flex;align-items:center;gap:12px;padding:4px 0}'
   +A+' .abbento .bring svg{width:62px;height:62px;flex:0 0 auto}'
   +A+' .abbento .bspark{display:flex;align-items:flex-end;gap:2px;height:30px;margin-top:7px}'
   +A+' .abbento .bspark i{flex:1;display:block;border-radius:2px 2px 0 0;background:'+_AB.kern+';opacity:.72}'
   /* ----- Bento-Reihe 2 (Durchgang 3) ----- */
   +A+' .abbento.ab2 .bleib{padding-top:9px}'
   +A+' .abbento .blade{color:var(--abmut);font-size:12px;padding:14px 0;text-align:center}'
   +A+' .abbento .bleerk{color:var(--abmut);font-size:12px;padding:8px 0}'
   +A+' .abbento .babs{font-size:10.5px;font-weight:800;text-transform:uppercase;'
    +'letter-spacing:.05em;color:var(--abmut);margin-bottom:3px}'
   +A+' .abbento .bfehl{font-size:11.5px;line-height:1.45;color:'+_AB.krit+';'
    +'background:#fdf1f1;border:1px solid #f2cfcf;border-radius:9px;padding:9px 10px}'
   /* Die Karte war Ralph zu gross. Sie wird NICHT neu gezeichnet — die Kachel
      begrenzt sie, und das SVG skaliert mit (§22: entKarteDE bleibt unberuehrt). */
   +A+' .abbento .abkarte{max-width:100%;overflow:hidden}'
   +A+' .abbento .abkarte svg{width:100%;height:auto;max-height:210px;display:block}'
   +A+' .abschnell{display:flex;align-items:center;gap:9px;width:100%;text-align:left;'
    +'background:#fff;border:1px solid var(--abline);border-radius:10px;padding:8px 11px;'
    +'margin-bottom:7px;font-size:12.5px;font-weight:700;color:var(--abink);cursor:pointer;'
    +'font-family:inherit}'
   +A+' .abschnell:hover{background:#f5f8f9;border-color:#cfd5de}'
   +A+' .abschnell .ic{font-size:15px;line-height:1}'
   +A+' .abschnell .pf{margin-left:auto;color:var(--abmut)}'
   /* ----- Anordnen-Modus (Work #42, Etappe 5) -----
      Der Modus muss auf den ERSTEN Blick erkennbar sein. Wer nicht sieht, dass
      er im Bearbeiten steckt, haelt eine ausgeblendete Kachel fuer verloren. */
   +A+' .abeleiste{display:flex;align-items:center;gap:9px;flex-wrap:wrap;'
    +'background:#fff8e8;border:1px solid #e8d7a8;border-radius:12px;'
    +'padding:9px 12px;margin-bottom:13px;font-size:12.5px}'
   +A+' .abeleiste b{font-size:12.5px}'
   +A+' .abeleiste .abesp{margin-left:auto;display:flex;gap:7px;flex-wrap:wrap}'
   +A+' .abeb{background:#fff;border:1px solid var(--abline);border-radius:8px;'
    +'padding:5px 9px;font-size:11.5px;font-weight:700;color:var(--abink);'
    +'cursor:pointer;font-family:inherit;white-space:nowrap}'
   +A+' .abeb:hover{background:#f5f8f9;border-color:#cfd5de}'
   +A+' .abeb[disabled]{opacity:.5;cursor:not-allowed}'
   +A+' .abeb.hin{background:#eef6ee;border-color:#bcd9bc}'
   +A+' .abbento .bk.bedit{outline:2px dashed #d9b45f;outline-offset:-2px}'
   +A+' .abbento .bk.bedit.bzieh{opacity:.45}'
   +A+' .abbento .bk.bedit.bziel{outline:2px solid '+_AB.kern+'}'
   +A+' .abedit{display:flex;align-items:center;gap:7px;flex-wrap:wrap;'
    +'background:#fbf3df;border-bottom:1px solid #e8d7a8;padding:6px 10px;'
    +'border-radius:15px 15px 0 0}'
   +A+' .abedit .abgriff{cursor:grab;font-size:14px;color:#9a8a5e}'
   +A+' .abedit .abename{font-size:11px;font-weight:800;text-transform:uppercase;'
    +'letter-spacing:.04em;color:var(--abmut);overflow:hidden;text-overflow:ellipsis;'
    +'white-space:nowrap;min-width:0}'
   +A+' .abedit .abesp{margin-left:auto;display:flex;gap:5px}'
   /* Inhaltsauswahl der freien Kachel */
   +A+' .abwahl{display:flex;flex-wrap:wrap;gap:5px}'
   +A+' .abkz{background:#fff;border:1px solid var(--abline);border-radius:20px;'
    +'padding:4px 9px;font-size:11px;font-weight:700;color:var(--abmut);'
    +'cursor:pointer;font-family:inherit}'
   +A+' .abkz:hover{border-color:#cfd5de}'
   +A+' .abkz.an{background:#eef6ee;border-color:#bcd9bc;color:'+_AB.gut+'}'
   /* ----- Freie Flaeche (Work #42, Umbau 15.08.) -----
      Die Kacheln liegen absolut. Die Flaeche selbst ist relativ und bekommt
      ihre Hoehe aus der untersten Kachel — sonst faellt der Rest der Seite
      in sie hinein. */
   /* display:block hebt das Raster aus .abbento auf — die Kacheln liegen hier
      absolut. Alles ANDERE aus .abbento gilt weiter und soll das auch. */
   +A+' .abfrei{display:block;position:relative;width:100%;margin-bottom:13px}'
   /* Nur was die freie Lage braucht. Aussehen kommt aus .abbento .bk. */
   +A+' .abfrei .bk{position:absolute;overflow:hidden}'
   +A+' .abfrei .bkopf{flex:0 0 auto}'
   +A+' .abfrei .bfuss{flex:0 0 auto}'
   +A+' .abfrei.bearb{background:'
    +'repeating-linear-gradient(0deg,#eef1f5 0 1px,transparent 1px 40px),'
    +'repeating-linear-gradient(90deg,#eef1f5 0 1px,transparent 1px 40px);'
    +'outline:1px dashed #d9b45f;outline-offset:6px;border-radius:8px}'
   +A+' .abfrei.zieht{user-select:none;cursor:grabbing}'
   +A+' .abfrei .bk.bzieh{opacity:.85;box-shadow:0 8px 24px rgba(16,24,40,.18)}'
   +A+' .abfrei .bleib{overflow:auto}'
   /* Der Anfasser fuer die Groesse, unten rechts. */
   +A+' .abziehe{position:absolute;right:0;bottom:0;width:18px;height:18px;'
    +'cursor:nwse-resize;background:linear-gradient(135deg,transparent 50%,#d9b45f 50%);'
    +'border-bottom-right-radius:15px;display:none}'
   +A+' .abfrei.bearb .abziehe{display:block}'
   +A+' .abedit[data-zieh]{cursor:grab}'
   +A+' .abeb.weg{color:'+_AB.krit+';border-color:#f2cfcf}'
   +A+' .abeb.weg:hover{background:#fdf1f1}'
   +A+' .abetitel{flex:1;min-width:60px;font:inherit;font-size:11px;font-weight:800;'
    +'text-transform:uppercase;letter-spacing:.04em;color:var(--abink);'
    +'background:#fff;border:1px solid #e8d7a8;border-radius:6px;padding:2px 6px}'
   /* D3: ausgewaehlt und festgenagelt muessen auf einen Blick zu sehen sein. */
   +A+' .abfrei .bk.bwahl{outline:2px solid '+_AB.kern+';outline-offset:-2px;'
    +'box-shadow:0 4px 16px rgba(31,111,235,.22)}'
   +A+' .abfrei .bk.bfest .abziehe{display:none}'
   +A+' .abfrei .bk.bfest .abedit{background:#eef1f5;border-bottom-color:#dfe4ea;cursor:default}'
   /* D4: Notizkachel */
   +A+' .abnotiz{width:100%;height:100%;min-height:80px;box-sizing:border-box;resize:none;'
    +'font:inherit;font-size:13px;line-height:1.5;color:var(--abink);'
    +'border:1px solid var(--abline);border-radius:9px;padding:8px 10px;background:#fffdf6}'
   +A+' .abnotizText{font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word}'

   /* ======================================================================
      ROOT COCKPIT · C2 · 15.08.2026 — Ralph-Go nach acht Entwurfsrunden.
      Vorlage: bereiche/Mockup-ROOTCOCKPIT.html, dort steht auch, WORAN die
      Optik haengt. Kurz: Foto unter der Kachel, Verlauf darueber, Ueberschrift
      gross in Versalien, Statuspunkte rechts, Standort-Pille im Inhalt.
      🔴 Nur EIN Gruen. Rot und Gelb sind Warnstufen, keine Dekoration.
      ====================================================================== */
   /* Foto und Verlauf: zwei getrennte Ebenen. Der Verlauf deckt frueher als
      bei einer Zeichnung — sonst steht die Beschriftung auf einem Ast. */
   +A+' .abbento .bk{position:relative;overflow:hidden}'
   +A+' .abbento .bfoto{position:absolute;inset:0;z-index:0;background-repeat:no-repeat;'
    +'background-position:center right;background-size:cover;opacity:.55}'
   /* 🔴 16.08., Ralph: „kann man nicht lesen." Er hatte recht, und es war ein
      Rechenfehler von mir: der Verlauf war bis 42 % deckend — genau die Breite,
      auf der in der VORLAGE der Text steht. Meine Kacheln haben aber Zeilen
      ueber die GANZE Breite, und die rechte Haelfte lag damit auf dem Foto.
      Jetzt deckt er bis 72 % voll und laeuft erst danach aus. Das Foto bleibt
      als Stimmung am rechten Rand — der Text steht auf Weiss.
      Merksatz fuer das naechste Mal: ein Verlauf muss zum INHALT passen, nicht
      zur Vorlage, aus der er abgemessen wurde. */
   +A+' .abbento .bschleier{position:absolute;inset:0;z-index:1;background:'
    +'linear-gradient(90deg,#fff 0%,#fff 72%,rgba(255,255,255,.82) 88%,rgba(255,255,255,.25) 100%),'
    +'linear-gradient(0deg,rgba(255,255,255,.62) 0%,rgba(255,255,255,0) 42%)}'
   /* Bei den drei Kacheln, deren Zeilen bis ganz nach rechts laufen, deckt er
      vollstaendig — dort ist Lesbarkeit wichtiger als Atmosphaere. */
   +A+' .abbento .bk.btext .bschleier{background:'
    +'linear-gradient(90deg,#fff 0%,#fff 86%,rgba(255,255,255,.55) 100%)}'
   +A+' .abbento .bkopf,'+A+' .abbento .bleib,'+A+' .abbento .bfuss{position:relative;z-index:2}'
   /* Ueberschrift: aus 10,5px Kleinschrift wird die grosse Versalzeile der
      Vorlage. Das ist der auffaelligste Einzelunterschied. */
   +A+' .abbento .bkopf h3{font-size:15px;font-weight:800;letter-spacing:.02em;'
    +'text-transform:uppercase;color:var(--abink);line-height:1.15}'
   /* Statuspunkte rechts oben — der Zustand steht am Rand, nicht im Text. */
   +A+' .abbento .bleds{margin-left:auto;display:flex;gap:4px;flex:0 0 auto}'
   +A+' .abbento .bleds i{width:9px;height:9px;border-radius:50%;background:#c6cbce;display:block}'
   +A+' .abbento .bleds i.gr{background:'+_AB.gut+'}'
   +A+' .abbento .bleds i.r{background:'+_AB.krit+'}'
   +A+' .abbento .bleds i.ge{background:'+_AB.warn+'}'
   /* Standort-Pille: grauer Chip, Beschriftung grau, Wert gruen. */
   +A+' .abbento .bort{display:inline-flex;align-items:center;gap:5px;background:#eef0f1;'
    +'border-radius:13px;padding:4px 11px;font-size:11.5px;color:var(--abmut);'
    +'margin-bottom:9px;align-self:flex-start;max-width:100%}'
   +A+' .abbento .bort b{color:'+_AB.gut+';font-weight:700}'
   /* Legende mit Pfeil-Chips statt Punkten. */
   +A+' .abbento .bleg{display:flex;gap:13px;flex-wrap:wrap;padding-top:9px}'
   +A+' .abbento .bleg span{display:flex;align-items:center;gap:6px;font-size:10px;'
    +'color:var(--abmut);text-transform:uppercase;letter-spacing:.03em;line-height:1.25}'
   +A+' .abbento .bleg i{width:15px;height:11px;flex:0 0 auto;'
    +'clip-path:polygon(0 0,70% 0,100% 50%,70% 100%,0 100%)}'
   +A+' .abbento .bleg i.gr{background:'+_AB.gut+'}'
   +A+' .abbento .bleg i.ge{background:'+_AB.warn+'}'
   +A+' .abbento .bleg i.r{background:'+_AB.krit+'}'
   /* Markenkachel: der Fluxkompensator fuellt die Flaeche, der Text sitzt
      unten links davor. */
   +A+' .abbento .bmarke{position:relative;display:flex;align-items:center;'
    +'justify-content:center;padding:0;min-height:150px}'
   +A+' .abbento .bmarke svg{position:absolute;inset:0;width:100%;height:100%;opacity:.9}'
   +A+' .abbento .bmtext{position:relative;z-index:2;align-self:flex-end;padding:0 0 10px 2px;'
    +'display:flex;align-items:center;gap:10px;width:100%}'
   +A+' .abbento .bmtext b{font-size:27px;font-weight:800;color:'+_AB.gut+';letter-spacing:-1px}'
   +A+' .abbento .bmtext span{font-size:11px;color:var(--abmut);line-height:1.45}'
   /* ----- Was bei Ralph liegt (16.08.) -----
      Abgesetzt vom Rest der Kachel, damit man auf einen Blick sieht: das hier
      ist deins, das andere ist Arbeit. */
   +A+' .abbento .bralph{margin-top:9px;padding-top:8px;border-top:1px solid var(--abline)}'
   +A+' .abbento .brtitel{font-size:9.5px;font-weight:800;text-transform:uppercase;'
    +'letter-spacing:.08em;color:'+_AB.krit+';margin-bottom:5px}'
   +A+' .abbento .brz{display:flex;align-items:flex-start;gap:9px;padding:6px 0;'
    +'border-bottom:1px solid #f0f2f4;cursor:pointer}'
   +A+' .abbento .brz:last-child{border-bottom:0}'
   +A+' .abbento .brz:hover{background:#fafbfc}'
   +A+' .abbento .brn{flex:0 0 auto;font-size:11px;font-weight:800;color:var(--abmut);'
    +'background:#eef0f1;border-radius:5px;padding:2px 7px;'
    +'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-top:1px}'
   +A+' .abbento .brt{flex:1;min-width:0}'
   /* 🔴 ZWEI Zeilen, nicht eine mit Punkten. Die Titel der Work Items sind
      lang; abgeschnitten steht da „erfassung — Freigabegruende raus aus…" und
      Ralph weiss weiterhin nicht, worum es geht. Umschreiben darf ich sie
      nicht (§1.1) — also bekommen sie Platz. */
   +A+' .abbento .brt .b1{font-size:12.5px;font-weight:600;color:var(--abink);'
    +'line-height:1.32;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;'
    +'overflow:hidden}'
   +A+' .abbento .brt .b2{display:block;font-size:10.5px;color:var(--abmut);margin-top:1px}'
   +A+' .abbento .brp{width:8px;height:8px;border-radius:50%;flex:0 0 auto;margin-top:5px;background:'+_AB.zu+'}'
   +A+' .abbento .brp.krit{background:'+_AB.krit+'}'
   +A+' .abbento .brp.warn{background:'+_AB.warn+'}'
   +A+' .abbento .brmehr{font-size:11px;color:var(--abmut);margin-top:5px}'
   /* Work #34: eine Zeile, die einen Weg hat, sieht auch so aus. Zeilen ohne
      Weg bleiben unveraendert — sonst verspricht die Optik etwas, das fehlt. */
   +A+' .abbento .bzeile.bklick{cursor:pointer;border-radius:6px;margin:0 -4px;padding-left:4px;padding-right:4px}'
   +A+' .abbento .bzeile.bklick:hover{background:#f2f5f8}'
   +A+' .abbento .bpfeil{color:var(--abmut);font-weight:700}'
   /* ----- Befehlszeile (C4) ----- */
   +A+' .abcmd{background:#fff;border:1px solid var(--abline);border-radius:10px;'
    +'margin-top:2px;position:relative}'
   +A+' .abcmdz{display:flex;align-items:center;gap:9px;padding:10px 13px;'
    +'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px}'
   +A+' .abcmdpf{color:'+_AB.gut+';font-weight:700;flex:0 0 auto}'
   +A+' .abcmdz input{flex:1;background:transparent;border:0;outline:0;color:var(--abink);'
    +'font-family:inherit;font-size:13px;min-width:0;padding:0}'
   +A+' .abcmdz input::placeholder{color:#a8b0b6}'
   +A+' .abcmdcur{width:8px;height:15px;background:'+_AB.gut+';display:inline-block;'
    +'animation:abBlink 1.05s steps(1) infinite;flex:0 0 auto}'
   +'@keyframes abBlink{0%,50%{opacity:1}51%,100%{opacity:0}}'
   +A+' .abcmdkb{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;'
    +'color:var(--abmut);border:1px solid var(--abline);border-radius:4px;padding:2px 6px;flex:0 0 auto}'
   +A+' .abcmdl{border-top:1px solid var(--abline);max-height:0;overflow:hidden;'
    +'transition:max-height .15s}'
   +A+' .abcmd.auf .abcmdl{max-height:240px;overflow:auto}'
   +A+' .abcmdv{display:flex;align-items:center;gap:11px;padding:8px 13px;font-size:12.5px;'
    +'cursor:pointer;border-bottom:1px solid #f0f2f4}'
   +A+' .abcmdv:last-child{border-bottom:0}'
   +A+' .abcmdv.sel{background:#f5f8f9}'
   +A+' .abcmdv .b{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:'+_AB.gut+';'
    +'font-weight:700;flex:0 0 124px}'
   +A+' .abcmdv .t{color:var(--abmut);flex:1;min-width:0;overflow:hidden;'
    +'text-overflow:ellipsis;white-space:nowrap}'
   +A+' .abcmdv .z{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;'
    +'color:var(--abmut);flex:0 0 auto}'
   /* ----- Meilenstein-Zeitleiste (C5) ----- */
   +A+' .abzeit{background:#fff;border:1px solid var(--abline);border-radius:10px;'
    +'margin-top:2px;overflow:hidden}'
   +A+' .abzk{display:flex;align-items:center;gap:11px;padding:10px 13px 8px}'
   +A+' .abzk b{font-size:13.5px;font-weight:800;text-transform:uppercase;letter-spacing:.02em;'
    +'color:var(--abink)}'
   +A+' .abzz{font-size:11.5px;color:var(--abmut)}'
   +A+' .abzsp{margin-left:auto;display:flex;gap:6px}'
   /* Die Bahn: Monate als Abschnitte, darin die Punkte nach Datum. */
   +A+' .abzb{position:relative;height:132px;margin:0 13px 13px;background:#f4f6f7;'
    +'border-radius:7px;overflow:hidden}'
   +A+' .abzm{position:absolute;top:0;bottom:0;border-right:1px solid #e4e7e9}'
   +A+' .abzm span{position:absolute;left:7px;top:5px;font-size:9.5px;font-weight:800;'
    +'letter-spacing:.08em;color:#a8b0b6}'
   +A+' .abzl{position:absolute;left:0;right:0;top:12px;height:2px;background:#dfe3e6}'
   +A+' .abzheute{position:absolute;top:0;bottom:0;width:2px;background:'+_AB.kern+';z-index:3}'
   +A+' .abzheute span{position:absolute;top:2px;left:4px;font-size:9px;font-weight:800;'
    +'letter-spacing:.06em;color:'+_AB.kern+';white-space:nowrap}'
   +A+' .abzziel{position:absolute;right:0;top:0;bottom:0;width:5px;background:'+_AB.gut+';z-index:3}'
   +A+' .abzziel span{position:absolute;top:4px;right:9px;font-size:9.5px;font-weight:800;'
    +'letter-spacing:.05em;color:'+_AB.gut+';text-align:right;line-height:1.25;white-space:nowrap}'
   /* Ein Meilenstein: Punkt auf der Bahn, Beschriftung daneben. */
   +A+' .abzp{position:absolute;display:flex;align-items:center;gap:6px;z-index:2;'
    +'transform:translateX(-4px);max-width:210px}'
   +A+' .abzp i{width:9px;height:9px;border-radius:50%;background:'+_AB.warn+';flex:0 0 auto;'
    +'border:2px solid #fff;box-shadow:0 0 0 1px '+_AB.warn+'}'
   +A+' .abzp span{font-size:10.5px;color:var(--abink);background:rgba(255,255,255,.86);'
    +'padding:1px 5px;border-radius:3px;white-space:nowrap;overflow:hidden;'
    +'text-overflow:ellipsis;max-width:150px}'
   +A+' .abzp em{font-style:normal;font-size:9px;color:var(--abmut);'
    +'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-top:1px}'
   +A+' .abzp.ok i{background:'+_AB.gut+';box-shadow:0 0 0 1px '+_AB.gut+'}'
   +A+' .abzp.ok span{color:var(--abmut);text-decoration:line-through}'
   +A+' .abzp.spaet i{background:'+_AB.krit+';box-shadow:0 0 0 1px '+_AB.krit+'}'
   +A+' .abzp.spaet span{color:'+_AB.krit+';font-weight:700}'
   +A+' .abzeit.bearb .abzp{cursor:pointer}'
   +A+' .abzeit.bearb .abzp:hover span{background:#fff;box-shadow:0 0 0 1px '+_AB.kern+'}'
   +A+' .abzeit.bearb .abzb{outline:2px dashed #d9b45f;outline-offset:-3px}'
   /* Punktwolken in den vergangenen Monaten — wie in der Vorlage. Sie zeigen
      KEINE Daten und tun auch nicht so: sie sind Struktur, damit die alten
      Abschnitte nicht leer wirken. Deshalb ohne Beschriftung und blass. */
   +A+' .abzwolke i{position:absolute;width:5px;height:5px;border-radius:50%;'
    +'background:'+_AB.gut+';opacity:.22;pointer-events:none}'

   /* ----- Halbkreis und Balkenzeilen (Luecken 3-5, nach der Vorlage) ----- */
   +A+' .abbento .bhalb{display:flex;flex-direction:column;align-items:center;margin-top:2px}'
   +A+' .abbento .bhalb .pz{font-size:25px;font-weight:400;color:var(--abink);margin-top:-30px}'
   +A+' .abbento .bhalb .pl{font-size:11.5px;color:var(--abmut);margin-top:1px}'
   +A+' .abbento .bpaar{display:flex;gap:8px;width:100%;margin:10px 0 9px}'
   +A+' .abbento .bpaar>div{flex:1;background:#eef0f1;border-radius:4px;padding:8px 9px;'
    +'display:flex;align-items:center;gap:8px}'
   +A+' .abbento .bpaar .ic2{font-size:13px;color:var(--abmut)}'
   +A+' .abbento .bpaar .v{font-size:18px;font-weight:400;color:'+_AB.gut+';line-height:1}'
   +A+' .abbento .bpaar .l{font-size:8.5px;color:var(--abmut);text-transform:uppercase;'
    +'letter-spacing:.05em;margin-top:3px}'
   /* Balkenzeile: die Zahl steht IM Balken, die Schwellen als Pillen davor. */
   +A+' .abbento .bbz{display:flex;align-items:center;gap:9px;margin-bottom:6px}'
   +A+' .abbento .bbz .nm{flex:0 0 122px;font-size:12px;color:var(--abink);line-height:1.25}'
   +A+' .abbento .bbz .schw{display:flex;gap:3px;margin-top:3px}'
   +A+' .abbento .bbz .schw i{font-size:8.5px;font-weight:700;padding:1px 4px;border-radius:2px;'
    +'font-style:normal}'
   +A+' .abbento .bbz .schw i.ge{background:#fdf0cf;color:#8a6300}'
   +A+' .abbento .bbz .schw i.r{background:#fbdedb;color:#a3271e}'
   +A+' .abbento .bbz .werte{flex:1;display:flex;gap:5px}'
   +A+' .abbento .bbz .werte b{flex:1;background:'+_AB.gut+';color:#fff;font-size:12.5px;'
    +'font-weight:700;text-align:center;padding:5px 0;border-radius:2px}'
   +A+' .abbento .bbz .werte b.ge{background:'+_AB.warn+'}'
   +A+' .abbento .bbz .werte b.r{background:'+_AB.krit+'}'

   /* ----- DUNKLE DARSTELLUNG (Luecke 1) -----
      🔴 NUR Farbwerte. Kein zweiter Aufbau, keine zweite Kachelliste. */
   +'body.dashDunkel '+A+'{--abbg:#0b0d0e;--abcard:#17191b;--abink:#eef1f2;'
    +'--abmut:#9299a0;--abline:#292d30}'
   +'body.dashDunkel '+A+' .abbento .bk{background:#17191b}'
   +'body.dashDunkel '+A+' .abbento .bfoto{opacity:.4;filter:saturate(.75) brightness(.85)}'
   +'body.dashDunkel '+A+' .abbento .bschleier{background:'
    +'linear-gradient(90deg,#17191b 0%,#17191b 72%,rgba(23,25,27,.85) 88%,rgba(23,25,27,.3) 100%),'
    +'linear-gradient(0deg,rgba(23,25,27,.62) 0%,rgba(23,25,27,0) 42%)}'
   +'body.dashDunkel '+A+' .abbento .bk.btext .bschleier{background:'
    +'linear-gradient(90deg,#17191b 0%,#17191b 86%,rgba(23,25,27,.6) 100%)}'
   +'body.dashDunkel '+A+' .abbento .bort,'
   +'body.dashDunkel '+A+' .abbento .bpaar>div{background:#202325}'
   +'body.dashDunkel '+A+' .abcmd,'
   +'body.dashDunkel '+A+' .abzeit{background:#17191b;border-color:#292d30}'
   +'body.dashDunkel '+A+' .abzb{background:#101214}'
   +'body.dashDunkel '+A+' .abzp span{background:rgba(23,25,27,.86);color:#eef1f2}'
   +'body.dashDunkel '+A+' .abbento .bleds i{background:#3a4045}'
   +'body.dashDunkel '+A+' .abbento .bkopf h3{color:#eef1f2}'
   +'body.dashDunkel '+A+' .abzk b{color:#eef1f2}';
  var st=document.createElement('style'); st.id='dashAbCss'; st.textContent=css; document.head.appendChild(st);
}

/* Abgeleitete Summen EINMAL berechnen — sonst rechnet jede Kachel ihre eigene
   Wahrheit, und zwei Zahlen auf derselben Seite widersprechen sich (§1.2c). */
function _abAbl(np){
  var w=(np&&np.waechter)||[], z=(np&&np.zufluesse)||[];
  var grp=function(m){ return w.filter(function(x){return x.moment===m;}); };
  var sum=function(a){ return a.reduce(function(s,x){return s+(Number(x.offen)||0);},0); };
  var zs=function(weg){ return z.filter(function(x){return x.weg===weg;})
                          .reduce(function(s,x){return s+(Number(x.wartend)||0);},0); };
  return {
    gate_offen:sum(w.filter(function(x){return x.gate===true;})),
    gate_anzahl:w.filter(function(x){return x.gate===true;}).length,
    anlage:{n:grp('anlage').length,o:sum(grp('anlage'))},
    tuer:{n:grp('tuer').length,o:sum(grp('tuer'))},
    bestand:{n:grp('bestand').length,o:sum(grp('bestand'))},
    melden:w.filter(function(x){return (Number(x.offen)||0)>0;}).length,
    sackgasse:zs('keiner'), handarbeit:zs('hand'), automatik:zs('auto'),
    wartend:z.reduce(function(s,x){return s+(Number(x.wartend)||0);},0)
  };
}
function _abWf(w){ return (Number(w.offen)||0)===0 ? _AB.gut : (w.gate===true?_AB.krit:_AB.warn); }
function _abZf(z){ return (Number(z.wartend)||0)===0 ? _AB.gut : (z.weg==='keiner'?_AB.krit:_AB.warn); }

/* Die Dashboard-Auswahl kennt genau Arbeitsfläche und Architektur. */
function _abUmschalter(ans){
  var b=[['flaeche','Arbeitsfläche','Hero, Kacheln, Ring und Arbeitsliste'],
         ['architektur','Architektur','Wirkdiagramm — Knoten, Kanten und Wächter aus der Datenbank']];
  return '<span class="abum">'+b.map(function(x){
    return '<button data-ans="'+x[0]+'" class="'+(ans===x[0]?'on':'')+'" title="'+x[2]+'">'
      +x[1]+'</button>'; }).join('')+'</span>';
}
function _abUmschalterNach(){
  var box=document.getElementById('fgDash'); if(!box) return;
  box.querySelectorAll('.abum button[data-ans]').forEach(function(b){
    b.addEventListener('click',function(){ dashArbeitAnsichtSet(b.dataset.ans); });
  });
  var nb=document.getElementById('abNeu');
  if(nb) nb.addEventListener('click',function(){
    /* Work #121: „Aktualisieren" muss auch das Cockpit neu holen. Ohne diese
       Zeile haette der Knopf die Seite neu gebaut und dieselbe alte Lage
       wieder hingeschrieben — ein Knopf, der so tut, als haette er gemessen. */
    _AB_CK=null; _AB_CK_FEHLER=null;
    if(typeof loadDashboard==='function') loadDashboard();
  });
}

function dashArbeitAnsichtGet(){
  try{
    var v=localStorage.getItem('ri_dash_ansicht');
    if(v==='architektur') return v;
    if(v!=='flaeche') localStorage.setItem('ri_dash_ansicht','flaeche');
    return 'flaeche';
  }
  catch(e){ return 'flaeche'; }
}
function dashArbeitAnsichtSet(v){
  v=(v==='architektur')?'architektur':'flaeche';
  try{ localStorage.setItem('ri_dash_ansicht',v); }
  catch(e){ /* §1.13i: kein leerer Fangblock. Merkt sich die Wahl dann nicht - kein Beinbruch,
     aber man soll es sehen koennen, statt es zu suchen. */
    try{ console.warn('Ansicht-Wahl konnte nicht gespeichert werden:',e); }catch(_){} }
  if(typeof loadDashboard==='function') loadDashboard();
}

/* ===========================================================================
   ARCHITEKTUR / WIRKDIAGRAMM — Work #29 (Ralph-Entscheid 15.08.2026)

   Die Erfassungs-Architektur liegt seit 15.08. in shadow_v1.architecture_* und
   wird ueber cb_admin_architektur_* gelesen und gepflegt. Diese Ansicht rendert
   sie. Die HTML-Datei bereiche/wirkdiagramm-erfassung.html ist damit nur noch
   Import- und Archivquelle, nicht mehr die Wahrheit.

   🔴 KEINE ZWEITE KNOTEN-KONSTANTE (§4.2, Ralph-Auflage zu diesem Durchgang).
   In dieser Datei steht kein einziger Knoten, keine Lane-Liste, keine
   Statusliste und keine Zahl. Alles kommt aus der RPC:
     - die Kopfzahlen aus a.counts, SERVERSEITIG gezaehlt und hier nur angezeigt.
       Nicht nachgerechnet — eine nachgerechnete Bilanz ist die zweite Wahrheit,
       die §26 und §28.4 gerade verhindern sollen.
     - die Reihenfolge der Bahnen aus dem kleinsten sort_order ihrer Knoten,
       also ABGELEITET statt gepflegt. Verschiebt ChatGPT einen Knoten, wandert
       die Bahn mit, ohne dass hier jemand etwas nachtraegt.
     - die Auswahlwerte der Schreibfelder aus den tatsaechlich vorkommenden
       Werten. Kommt serverseitig ein neuer Status dazu, steht er hier, ohne
       dass diese Datei angefasst werden muss.

   Geschrieben wird ausschliesslich ueber cb_admin_architektur_node_setzen und
   cb_admin_architektur_verifizieren, beide mit Pflichtbegruendung.
   =========================================================================== */
function arCss(){
  if(document.getElementById('arCssTag')) return;
  var s=document.createElement('style'); s.id='arCssTag';
  s.textContent=[
   '.arWrap{font-size:13px}',
   '.arKopf{display:flex;flex-wrap:wrap;gap:9px;align-items:center;margin:0 0 12px}',
   '.arZ{display:flex;flex-direction:column;padding:7px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card);min-width:74px}',
   '.arZ b{font-size:17px;line-height:1.15}',
   '.arZ span{font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.03em}',
   '.arZ.on{outline:2px solid var(--k-2563eb,#2563eb);outline-offset:1px}',
   '.arZ[role=button]{cursor:pointer}',
   '.arBahn{margin:16px 0 0}',
   '.arBahnT{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 7px;padding-bottom:4px;border-bottom:1px solid var(--line)}',
   '.arGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:9px}',
   '.arK{border:1px solid var(--line);border-left-width:4px;border-radius:9px;background:var(--card);padding:9px 11px}',
   '.arK[data-st=gut]{border-left-color:#16a34a}',
   '.arK[data-st=lueck]{border-left-color:#d97706}',
   '.arK[data-st=bruch]{border-left-color:#dc2626}',
   '.arK[data-st=grenze]{border-left-color:#64748b}',
   '.arKt{font-weight:650;font-size:13px;margin:0 0 3px;display:flex;gap:6px;align-items:baseline}',
   '.arAdr{font-size:10.5px;color:var(--muted);font-weight:500;flex:0 0 auto}',
   '.arKs{color:var(--muted);font-size:11.5px;line-height:1.45}',
   '.arKm{font-size:11.5px;margin-top:5px;line-height:1.45}',
   '.arP{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;padding:1px 6px;border-radius:999px;margin:5px 4px 0 0;border:1px solid var(--line)}',
   '.arP.p1{background:#fee2e2;color:#991b1b;border-color:#fecaca}',
   '.arP.p2{background:#ffedd5;color:#9a3412;border-color:#fed7aa}',
   '.arP.p3{background:#f1f5f9;color:#475569}',
   '.arP.rev{background:#fef9c3;color:#854d0e;border-color:#fde68a}',
   '.arP.ver{background:#dcfce7;color:#166534;border-color:#bbf7d0}',
   '.arP.ent{background:#dbeafe;color:#1e40af;border-color:#bfdbfe}',
   '.arP.own{background:transparent;color:var(--muted)}',
   '.arDet{margin-top:8px;font-size:11.5px}',
   '.arDet>summary{cursor:pointer;color:var(--muted);font-size:11px;user-select:none}',
   '.arDet dl{margin:7px 0 0;display:grid;grid-template-columns:auto 1fr;gap:3px 9px}',
   '.arDet dt{color:var(--muted);font-size:10.5px;text-transform:uppercase;letter-spacing:.03em;white-space:nowrap}',
   '.arDet dd{margin:0;font-size:11.5px;word-break:break-word}',
   '.arKante{display:block;font-size:11px;color:var(--muted);margin-top:2px}',
   '.arForm{margin-top:9px;padding-top:8px;border-top:1px dashed var(--line);display:grid;gap:6px}',
   '.arForm label{font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.03em}',
   '.arForm select,.arForm input,.arForm textarea{width:100%;padding:5px 7px;border:1px solid var(--line);border-radius:7px;background:var(--bg,#fff);color:var(--ink);font-size:12px;font-family:inherit}',
   '.arForm .arRow{display:flex;gap:6px}',
   '.arBtn{padding:5px 11px;border:1px solid var(--line);border-radius:7px;background:var(--card);color:var(--ink);font-size:11.5px;font-weight:650;cursor:pointer}',
   '.arBtn.pri{background:#1d4ed8;color:#fff;border-color:#1d4ed8}',
   '.arBtn:disabled{opacity:.5;cursor:not-allowed}',
   '.arMsg{font-size:11.5px;margin-top:6px}',
   '.arWa{border:1px solid #fecaca;background:#fef2f2;border-radius:9px;padding:9px 11px;margin:0 0 12px}',
   '.arWa ul{margin:6px 0 0;padding-left:17px}',
   '.arWa li{font-size:11.5px;margin-bottom:3px}',
   '.arLeer{color:var(--muted);font-size:12px;padding:16px 0}'
  ].join('\n');
  document.head.appendChild(s);
}

function arFilterGet(){
  try{ return localStorage.getItem('ri_ar_filter')||'alle'; }catch(e){ return 'alle'; }
}
function arFilterSet(v){
  try{ localStorage.setItem('ri_ar_filter',v); }
  catch(e){ try{ console.warn('Architektur-Filter nicht speicherbar:',e); }catch(_){} }
  arRender();
}

/* Beide Abrufe getrennt gefangen: faellt der Waechter aus, soll das Diagramm
   trotzdem stehen — und der Grund sichtbar sein, nicht im Nichts verschwinden. */
async function arLaden(){
  var out={a:null,w:null,aFehler:'',wFehler:''};
  try{
    var r=await client.rpc('cb_admin_architektur_liste',{p_diagram_key:'produkterfassung'});
    if(r&&r.error) throw r.error;
    var d=r&&r.data; if(typeof d==='string') d=JSON.parse(d);
    out.a=d;
  }catch(e){
    out.aFehler=(e&&e.message)?String(e.message):String(e);
    try{ console.error('[Architektur] cb_admin_architektur_liste:',e); }catch(_){}
  }
  try{
    var rw=await client.rpc('cb_admin_architektur_waechter',{p_diagram_key:'produkterfassung'});
    if(rw&&rw.error) throw rw.error;
    var dw=rw&&rw.data; if(typeof dw==='string') dw=JSON.parse(dw);
    out.w=Array.isArray(dw)?dw:[];
  }catch(e){
    out.wFehler=(e&&e.message)?String(e.message):String(e);
    try{ console.error('[Architektur] cb_admin_architektur_waechter:',e); }catch(_){}
  }
  window._arDaten=out;
  return out;
}

/* Welche Knoten der aktive Filter zeigt. Die Kopfzahlen kommen aus a.counts und
   werden hier NICHT nachgerechnet; diese Funktion entscheidet nur, was sichtbar
   ist — sie behauptet keine Bilanz. */
function arGefiltert(nodes,filter){
  return nodes.filter(function(n){
    if(n.is_archived) return false;
    switch(filter){
      case 'prio1':    return String(n.priority)==='1';
      case 'offen':    return n.review_state!=='current';
      case 'entscheid':return !!n.decision_text;
      case 'arbeit':   return n.status==='lueck'||n.status==='bruch';
      case 'verif':    return !!n.verified_at;
      default:         return true;
    }
  });
}

function arHtml(){
  var D=window._arDaten||{}, a=D.a, w=D.w||[];
  var kopf='<div class="ab"><div class="abkopf"><h2>Architektur · Wirkdiagramm</h2>'
    +'<span class="st">aus der Datenbank — cb_admin_architektur_liste</span>'
    +'<span style="margin-left:auto;display:flex;gap:9px;align-items:center">'
    +_abUmschalter('architektur')
    +'<button class="abbtn" id="abNeu">↻ Aktualisieren</button></span></div></div>';

  if(!a || !a.nodes){
    return kopf+'<div class="arWrap"><div style="color:var(--k-dc2626);font-size:12.5px">'
      +'<b>Architektur nicht verfügbar.</b> Grund: '+esc(D.aFehler||'cb_admin_architektur_liste hat nichts geliefert')
      +'</div></div>';
  }

  var nodes=a.nodes||[], edges=a.edges||[], c=a.counts||{}, dia=a.diagram||{};
  var filter=arFilterGet();

  /* Nachbarn je Knoten aus den Kanten — ebenfalls abgeleitet, nicht gepflegt. */
  var raus={}, rein={};
  edges.forEach(function(e){
    if(e.is_active===false) return;
    (raus[e.from_node_key]=raus[e.from_node_key]||[]).push(e);
    (rein[e.to_node_key]=rein[e.to_node_key]||[]).push(e);
  });
  var titelVon={}; nodes.forEach(function(n){ titelVon[n.node_key]=n.title||n.node_key; });

  /* Die Kopfzahlen: NUR anzeigen, was der Server gezaehlt hat. Steht ein
     Schluessel nicht in counts, wird die Kachel weggelassen statt geraten. */
  var kacheln=[['gesamt','Knoten','alle'],['gut','gut','—'],['lueck','Lücke','arbeit'],
               ['bruch','Bruch','arbeit'],['grenze','Grenze','—'],['prio1','Prio 1','prio1'],
               ['review_offen','Review offen','offen'],['ralph_entscheid','bei Ralph','entscheid']];
  var zahlen=kacheln.filter(function(k){ return c[k[0]]!=null; }).map(function(k){
    var klick=(k[2]!=='—');
    return '<div class="arZ'+(klick&&filter===k[2]?' on':'')+'"'
      +(klick?' role="button" tabindex="0" data-fil="'+esc(k[2])+'"':'')
      +'><b>'+esc(String(c[k[0]]))+'</b><span>'+esc(k[1])+'</span></div>';
  }).join('');

  var filterLeiste='<div class="arKopf">'+zahlen
    +'<div style="margin-left:auto;display:flex;gap:6px;align-items:center">'
    +'<span style="font-size:11px;color:var(--muted)">Filter</span>'
    +'<select id="arFil" class="arBtn" style="font-weight:500">'
    +[['alle','alle Knoten'],['arbeit','nur Lücke und Bruch'],['prio1','nur Prio 1'],
      ['offen','Review offen'],['entscheid','Entscheidung bei Ralph'],['verif','verifiziert']]
      .map(function(o){ return '<option value="'+o[0]+'"'+(filter===o[0]?' selected':'')+'>'+o[1]+'</option>'; }).join('')
    +'</select></div></div>';

  /* Waechter: kritische Meldungen zuerst, der Rest zusammengefasst. */
  var waBlock='';
  if(D.wFehler){
    waBlock='<div class="arWa"><b>Wächter nicht abrufbar.</b> Grund: '+esc(D.wFehler)+'</div>';
  }else if(w.length){
    var krit=w.filter(function(x){ return x.severity==='kritisch'; });
    waBlock='<div class="arWa"><b>Wächter: '+esc(String(w.length))+' Meldungen</b>'
      +(krit.length?' · '+esc(String(krit.length))+' kritisch':'')
      +'<ul>'+krit.slice(0,6).map(function(x){
          return '<li><b>'+esc(x.title||x.node_key)+'</b> — '+esc(x.problem||'')
            +(x.owner_agent?' <span style="color:var(--muted)">('+esc(x.owner_agent)+')</span>':'')+'</li>';
        }).join('')
      +(krit.length>6?'<li style="color:var(--muted)">… und '+esc(String(krit.length-6))+' weitere kritische</li>':'')
      +'</ul></div>';
  }

  var sicht=arGefiltert(nodes,filter);
  if(!sicht.length){
    return kopf+'<div class="arWrap">'+filterLeiste+waBlock
      +'<div class="arLeer">Kein Knoten passt zu diesem Filter.</div></div>';
  }

  /* Bahnenreihenfolge ABGELEITET aus dem kleinsten sort_order je Bahn. */
  var bahnMin={};
  nodes.forEach(function(n){
    var s=(n.sort_order==null)?1e9:Number(n.sort_order);
    if(bahnMin[n.lane]==null||s<bahnMin[n.lane]) bahnMin[n.lane]=s;
  });
  var bahnen=Object.keys(bahnMin).sort(function(x,y){ return bahnMin[x]-bahnMin[y]; });

  /* Adresse Bahn.Position — berechnet, nicht gepflegt (§26.7). Sie zaehlt ueber
     ALLE Knoten der Bahn, nicht nur die sichtbaren; sonst wuerde ein Filter die
     Adressen verschieben und der Verweis waere beim naechsten Mal falsch. */
  var adr={};
  bahnen.forEach(function(b){
    nodes.filter(function(n){ return n.lane===b; })
      .sort(function(x,y){ return (x.sort_order||0)-(y.sort_order||0); })
      .forEach(function(n,i){ adr[n.node_key]=(bahnen.indexOf(b)+1)+'.'+(i+1); });
  });

  /* Auswahlwerte aus dem Bestand ableiten statt hier zu hinterlegen. */
  function werte(feld){
    var s={}; nodes.forEach(function(n){ if(n[feld]!=null&&n[feld]!=='') s[String(n[feld])]=1; });
    return Object.keys(s).sort();
  }
  var stWerte=werte('status'), prWerte=werte('priority'), rvWerte=werte('review_state');

  var koerper=bahnen.map(function(b){
    var drin=sicht.filter(function(n){ return n.lane===b; })
      .sort(function(x,y){ return (x.sort_order||0)-(y.sort_order||0); });
    if(!drin.length) return '';
    return '<div class="arBahn"><div class="arBahnT">'+esc(b)+' · '+esc(String(drin.length))+'</div>'
      +'<div class="arGrid">'+drin.map(function(n){
        var pl='';
        if(n.priority!=null) pl+='<span class="arP p'+esc(String(n.priority))+'">Prio '+esc(String(n.priority))+'</span>';
        if(n.review_state!=='current') pl+='<span class="arP rev">Review offen</span>';
        if(n.verified_at) pl+='<span class="arP ver">🔒 verifiziert</span>';
        if(n.decision_text) pl+='<span class="arP ent">🙋 bei Ralph</span>';
        if(n.owner_agent) pl+='<span class="arP own">'+esc(n.owner_agent)+'</span>';

        var nb='';
        (rein[n.node_key]||[]).forEach(function(e){
          nb+='<span class="arKante">← '+esc(titelVon[e.from_node_key]||e.from_node_key)
            +(e.edge_type&&e.edge_type!=='flow'?' ['+esc(e.edge_type)+']':'')
            +(e.label?' · '+esc(e.label):'')+'</span>'; });
        (raus[n.node_key]||[]).forEach(function(e){
          nb+='<span class="arKante">→ '+esc(titelVon[e.to_node_key]||e.to_node_key)
            +(e.edge_type&&e.edge_type!=='flow'?' ['+esc(e.edge_type)+']':'')
            +(e.label?' · '+esc(e.label):'')+'</span>'; });

        var dl='';
        function zeile(t,v){ if(v==null||v==='') return; dl+='<dt>'+esc(t)+'</dt><dd>'+esc(String(v))+'</dd>'; }
        zeile('Schlüssel',n.node_key);
        zeile('Beleg',n.evidence_text);
        zeile('Entscheidung',n.decision_text);
        zeile('Status',n.status); zeile('Review',n.review_state);
        zeile('Verifiziert',n.verified_at?(String(n.verified_at).slice(0,10)+(n.verified_by_agent?' · '+n.verified_by_agent:'')):null);
        zeile('Prüfnotiz',n.verification_note);
        zeile('Herkunft',n.source_ref);
        zeile('Work',n.work_id);
        zeile('Geändert',String(n.updated_at||'').slice(0,10)+(n.updated_by_agent?' · '+n.updated_by_agent:''));

        var form='<div class="arForm" data-key="'+esc(n.node_key)+'">'
          +'<div class="arRow">'
          +'<div style="flex:1"><label>Status</label><select data-f="status">'
          +stWerte.map(function(v){ return '<option'+(v===n.status?' selected':'')+'>'+esc(v)+'</option>'; }).join('')
          +'</select></div>'
          +'<div style="flex:1"><label>Prio</label><select data-f="priority">'
          +'<option value=""'+(n.priority==null?' selected':'')+'>—</option>'
          +prWerte.map(function(v){ return '<option'+(String(n.priority)===v?' selected':'')+'>'+esc(v)+'</option>'; }).join('')
          +'</select></div>'
          +'<div style="flex:1"><label>Review</label><select data-f="review_state">'
          +rvWerte.map(function(v){ return '<option'+(v===n.review_state?' selected':'')+'>'+esc(v)+'</option>'; }).join('')
          +'</select></div></div>'
          +'<div><label>Begründung — Pflicht</label>'
          +'<input type="text" data-f="reason" placeholder="warum diese Änderung, mit Messung"></div>'
          +'<div class="arRow"><button class="arBtn pri" data-akt="setzen">Änderung speichern</button>'
          +'<button class="arBtn" data-akt="verif">🔒 verifizieren</button></div>'
          +'<div class="arMsg" data-rolle="msg"></div></div>';

        return '<div class="arK" data-st="'+esc(n.status||'')+'" data-key="'+esc(n.node_key)+'">'
          +'<div class="arKt"><span class="arAdr">'+esc(adr[n.node_key]||'')+'</span>'
          +'<span>'+esc(n.title||n.node_key)+'</span></div>'
          +(n.summary?'<div class="arKs">'+esc(n.summary)+'</div>':'')
          +(n.metric?'<div class="arKm">'+esc(n.metric)+'</div>':'')
          +'<div>'+pl+'</div>'
          +'<details class="arDet"><summary>Details, Nachbarn und Pflege</summary>'
          +(nb?'<div style="margin-top:6px">'+nb+'</div>':'')
          +(dl?'<dl>'+dl+'</dl>':'')
          +form
          +'</details></div>';
      }).join('')+'</div></div>';
  }).join('');

  var fuss='<div style="margin-top:16px;font-size:11px;color:var(--muted)">'
    +esc(dia.title||'Wirkdiagramm')+' · '+esc(String(nodes.length))+' Knoten · '
    +esc(String(edges.length))+' Kanten · Stand '+esc(String(dia.updated_at||'').slice(0,16).replace('T',' '))
    +' · Herkunft '+esc(dia.source_ref||'—')
    +' — gepflegt wird in der Datenbank, nicht in der HTML-Datei.</div>';

  return kopf+'<div class="arWrap">'+filterLeiste+waBlock+koerper+fuss+'</div>';
}

function arRender(){
  var box=document.getElementById('fgDash'); if(!box) return;
  arCss();
  box.innerHTML=arHtml();
  arNach();
}

function arNach(){
  var box=document.getElementById('fgDash'); if(!box) return;
  _abUmschalterNach();
  var sel=document.getElementById('arFil');
  if(sel) sel.addEventListener('change',function(){ arFilterSet(sel.value); });
  box.querySelectorAll('.arZ[data-fil]').forEach(function(z){
    z.addEventListener('click',function(){ arFilterSet(z.dataset.fil); });
    z.addEventListener('keydown',function(ev){
      if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); arFilterSet(z.dataset.fil); } });
  });
  box.querySelectorAll('.arForm').forEach(function(f){
    var key=f.dataset.key;
    var msg=f.querySelector('[data-rolle=msg]');
    function sag(t,farbe){ if(msg){ msg.textContent=t; msg.style.color=farbe||'var(--muted)'; } }
    function grund(){ var i=f.querySelector('[data-f=reason]'); return i?i.value.trim():''; }
    f.querySelectorAll('button[data-akt]').forEach(function(b){
      b.addEventListener('click',async function(){
        var g=grund();
        if(!g){ sag('Ohne Begründung wird nichts geschrieben — eine Änderung ohne Grund ist beim nächsten Lesen nicht nachvollziehbar.','#b45309'); return; }
        var akt=b.dataset.akt;
        var alt=b.textContent;
        b.disabled=true; b.textContent='…';
        try{
          if(akt==='verif'){
            var rv=await client.rpc('cb_admin_architektur_verifizieren',
              {p_diagram_key:'produkterfassung',p_node_key:key,p_agent:'claude',p_note:g});
            if(rv&&rv.error) throw rv.error;
            sag('Verifiziert gespeichert. Wird beim Neuladen sichtbar.','#166534');
          }else{
            var patch={};
            f.querySelectorAll('[data-f]').forEach(function(el){
              var name=el.dataset.f; if(name==='reason') return;
              var v=el.value;
              patch[name]=(v===''||v==='—')?null:(name==='priority'?Number(v):v);
            });
            var rs=await client.rpc('cb_admin_architektur_node_setzen',
              {p_diagram_key:'produkterfassung',p_node_key:key,p_patch:patch,p_reason:g,p_agent:'claude'});
            if(rs&&rs.error) throw rs.error;
            sag('Gespeichert. Wird beim Neuladen sichtbar.','#166534');
          }
        }catch(e){
          /* Kein leerer Fangblock (§11.4): der Grund steht sichtbar am Knoten,
             nicht nur in der Konsole — sonst sieht ein misslungener Schreibvorgang
             aus wie ein gelungener. */
          var t=(e&&e.message)?String(e.message):String(e);
          sag('Nicht gespeichert: '+t,'#dc2626');
          try{ console.error('[Architektur] Schreiben fehlgeschlagen',key,e); }catch(_){}
        }
        b.disabled=false; b.textContent=alt;
      });
    });
  });
}
if(typeof window!=='undefined'){
  window.arRender=arRender; window.arLaden=arLaden; window.arFilterSet=arFilterSet;
}

/* ---------------------------------------------------------------------------
   WÄCHTER-RING (aus Mockup B). 25 Segmente, drei Gruppen, feste Plätze.
   --------------------------------------------------------------------------- */
function _abRing(np,A){
  var w=(np&&np.waechter)||[];
  var ord=['anlage','tuer','bestand'], liste=[];
  ord.forEach(function(m){ w.filter(function(x){return x.moment===m;}).forEach(function(x){ liste.push(x); }); });
  if(!liste.length) return '<div class="abpad" style="color:'+_AB.krit+';font-size:12.5px">'
    +'Wächter nicht ladbar — der Ring bleibt leer. Grau heißt hier: wir wissen es nicht.</div>';
  var CXv=196, CYv=196, R1=112, R2=146, luecke=0.06;
  var span=(Math.PI*2 - luecke*3)/liste.length, a=-Math.PI/2, letzt=liste[0].moment, s='';
  var pol=function(r,ang){ return [(CXv+Math.cos(ang)*r).toFixed(1),(CYv+Math.sin(ang)*r).toFixed(1)]; };
  liste.forEach(function(o,i){
    if(o.moment!==letzt){ a+=luecke; letzt=o.moment; }
    var a2=a+span*0.86, f=_abWf(o), still=(Number(o.offen)||0)===0;
    var p1=pol(R2,a),p2=pol(R2,a2),p3=pol(R1,a2),p4=pol(R1,a);
    s+='<path class="abseg" data-w="'+i+'" d="M'+p1[0]+' '+p1[1]+'A'+R2+' '+R2+' 0 0 1 '+p2[0]+' '+p2[1]
      +'L'+p3[0]+' '+p3[1]+'A'+R1+' '+R1+' 0 0 0 '+p4[0]+' '+p4[1]+'Z" fill="'+f+'" opacity="'
      +(still?'0.26':'1')+'"><title>'+esc(o.name)+' — '+(still?'still':(o.offen+' offen'))
      +(o.gate===true?' · Go-Live-Gate':'')+'\n'+esc(o.kurz||'')+'</title></path>';
    a=a2+span*0.14;
  });
  [['Anlage',-Math.PI/2+0.2],['Tür',0.5],['Bestand',2.5]].forEach(function(l){
    var p=pol(R2+15,l[1]);
    s+='<text x="'+p[0]+'" y="'+p[1]+'" text-anchor="middle" font-size="10" font-weight="700" '
      +'fill="#9aa1ab" letter-spacing=".4">'+l[0]+'</text>';
  });
  var k=(np&&np.extra)||{};
  s+='<circle cx="'+CXv+'" cy="'+CYv+'" r="'+(R1-8)+'" fill="#fff" stroke="#eceff3"/>'
    +'<text x="'+CXv+'" y="'+(CYv-14)+'" text-anchor="middle" font-size="40" font-weight="800" '
    +'fill="'+_AB.kern+'" letter-spacing="-1.8">'+(_abKernZahl(np,'aktiv'))+'</text>'
    +'<text x="'+CXv+'" y="'+(CYv+7)+'" text-anchor="middle" font-size="11" fill="#8b93a0">aktive Produkte</text>'
    +'<text x="'+CXv+'" y="'+(CYv+31)+'" text-anchor="middle" font-size="12.5" font-weight="700" '
    +'fill="'+_AB.ink+'">Ø '+(_abKernZahl(np,'schnitt'))+' Index</text>'
    +'<text x="'+CXv+'" y="'+(CYv+50)+'" text-anchor="middle" font-size="10.5" fill="#8b93a0">'
    +(_abKernZahl(np,'ohne'))+' bewusst ohne Zahl</text>';
  return '<div style="padding:6px 10px 10px"><svg viewBox="0 0 392 392" id="abRing">'+s+'</svg></div>';
}
/* Kern-Zahlen kommen aus cb_dashboard und werden hier nur GELESEN. */
var _abD=null;
/* np gehoert dazu: der Anordnen-Modus zeichnet die Kacheln neu und braucht
   dieselben Daten wie der Erstaufbau — sonst holt er sie ein zweites Mal und
   zeigt womoeglich einen anderen Stand als der Rest der Seite (§4.2). */
var _abNp=null;
function _abKernZahl(np,was){
  var k=(_abD&&_abD.katalog)||{}, q=(_abD&&_abD.qualitaet)||{};
  if(was==='aktiv')   return k.aktiv==null?'–':k.aktiv;
  if(was==='schnitt') return k.schnitt_score==null?'–':String(k.schnitt_score).replace('.',',');
  if(was==='ohne')    return q.ohne_score==null?'–':q.ohne_score;
  return '–';
}

/* ---------------------------------------------------------------------------
   ARBEITSLISTE — abgeleitet, nicht gepflegt.
   --------------------------------------------------------------------------- */
/* 🔴 15.08.2026 AUFGETEILT (Durchgang 2): die ERHEBUNG steht jetzt in
   _abJobsListe, das MARKUP in _abJobs. Grund: die neue Bento-Kachel „Heute"
   braucht dieselben Aufgaben in anderer Form. Haette ich sie dort neu erhoben,
   gaebe es zwei Vorstellungen davon, was dringend ist — und irgendwann
   widersprechen sich zwei Kacheln auf derselben Seite (§4.2).
   Die Reihenfolge, die Schwellen und die Texte sind UNVERAENDERT uebernommen. */
function _abJobsListe(np,A){
  var jobs=[], z=(np&&np.zufluesse)||[], w=(np&&np.waechter)||[];
  z.filter(function(x){return x.weg==='keiner'&&(Number(x.wartend)||0)>0;}).forEach(function(x){
    /* 🔴 16.08.2026, Ralph: „die scanns koennen weit nach hinten, keine prio."
       Betroffen ist GENAU EIN Zufluss — 'barcode' (Barcode-Scan ohne Foto),
       gemessen 87 wartend. Er stand auf p:0 und damit ganz oben.
       KLEINE RICHTIGSTELLUNG: Ralph nennt sie „die off importe". Die 87 sind
       aber die Scan-Warteschlange ohne Etikettfoto; der OpenFoodFacts-Cache
       ist ein anderer Zufluss ('scancache', gemessen 48). Zurueckgestuft habe
       ich die 87 — das ist die Zahl, die er genannt hat. */
    var hinten=(x.id==='barcode');
    jobs.push({p:hinten?9:0, n:x.wartend,
      t1:x.name+(hinten?' — liegen bewusst hinten':' — niemand holt sie ab'),
      t2:hinten
        ? ('keine Prio (Ralph 16.08.) · ältester Eintrag '
           +(x.aeltester_tage==null?'?':x.aeltester_tage)+' Tage alt')
        : ('ältester Eintrag '+(x.aeltester_tage==null?'?':x.aeltester_tage)+' Tage alt · '+(x.hinweis||'')),
      go:hinten?'später →':'Weg festlegen →', f:hinten?_AB.grau:_AB.krit, ziel:'scan'});
  });
  if(A.gate_offen>0) jobs.push({p:1,n:A.gate_offen,t1:'Go-Live-Gate blockiert',
    t2:'diese Fälle verhindern jede Freigabe',go:'Wächter →',f:_AB.krit,ziel:'waechter'});
  z.filter(function(x){return x.weg==='hand'&&(Number(x.wartend)||0)>0;}).forEach(function(x){
    /* 🔴 16.08.2026, Ralph: „oof nach hinten, ja." Gemeint ist der
       OpenFoodFacts-Cache (Zufluss 'scancache', gemessen 48 wartend). Er stand
       auf p:2, jetzt p:9 — gleichauf mit den Barcode-Scans ganz unten.
       Beide sind damit zurueckgestuft, aber KEINER ist verschwunden. */
    var hinten=(x.id==='scancache');
    jobs.push({p:hinten?9:2, n:x.wartend,
      t1:x.name+(hinten?' — liegen bewusst hinten':' prüfen'),
      t2:hinten
        ? ('keine Prio (Ralph 16.08.) · ältester '
           +(x.aeltester_tage==null?'?':x.aeltester_tage)+' Tage · Vorstufe, wird erst Katalog wenn du sie übernimmst')
        : ('ältester '+(x.aeltester_tage==null?'?':x.aeltester_tage)+' Tage · nur du kannst das'),
      go:hinten?'später →':'Öffnen →', f:hinten?_AB.grau:_AB.warn, ziel:'scan'});
  });
  w.filter(function(x){return x.moment==='bestand'&&(Number(x.offen)||0)>0;})
   .sort(function(a,b){return b.offen-a.offen;}).slice(0,3).forEach(function(x){
    jobs.push({p:3,n:x.offen,t1:x.name,t2:(x.kurz||'')+' · blockiert nichts, will Nacharbeit',
      go:'Liste →',f:_AB.warn,ziel:'waechter'});
  });
  var td=((np&&np.extra)||{}).todos;
  if(td>0) jobs.push({p:4,n:td,t1:'Offene Notizen im Notizbuch',
    t2:'eigene Merkzettel und Prüfaufträge',go:'Notizbuch →',f:_AB.warn,ziel:'todo'});
  if(np&&np.wochenlauf&&np.wochenlauf.protokolliert===false)
    jobs.push({p:5,n:'?',t1:'Wochenlauf protokolliert sich nicht',
      t2:'wir wissen nicht, ob er lief — den Schlüssel schreibt niemand',
      go:'offen',f:_AB.grau,ziel:null});
  jobs.sort(function(a,b){ return a.p-b.p || ((Number(b.n)||0)-(Number(a.n)||0)); });
  return jobs;
}

/* 🔴 OHNE AUFRUFER seit 20.08.2026, Work #121 — bewusst stehengelassen, nicht
   geloescht (§3.7, P9). Die Detailliste „Alle offenen Punkte" zeigte dieselben
   sechs Zufluesse wie die Kachel „Eingang"; seit die Kachel echte Drilllisten
   oeffnet, ist diese hier die zweite Anzeige derselben Sache.
   NICHT VERWECHSELN: _abJobsListe (die Daten) lebt weiter — die freie Kachel
   vom Typ „liste" liest sie. Tot ist nur dieses Markup. */
function _abJobs(np,A){
  var jobs=_abJobsListe(np,A);
  if(!jobs.length) return '<div class="abpad" style="color:'+_AB.gut+';font-weight:700;font-size:13px">'
    +'Nichts offen. Alle Zuflüsse leer, alle Wächter still.</div>';
  return jobs.map(function(j){
    return '<div class="abjob" data-ziel="'+(j.ziel||'')+'">'
      +'<span class="sv" style="background:'+j.f+'"></span>'
      +'<span class="nm" style="color:'+j.f+'">'+j.n+'</span>'
      +'<span class="tx"><span class="t1">'+esc(j.t1)+'</span>'
      +'<div class="t2">'+esc(j.t2)+'</div></span>'
      +'<span class="go">'+esc(j.go)+'</span></div>';
  }).join('')+'<div class="abfoot">'+jobs.length+' Punkte · abgeleitet aus Wächtern und Zuflüssen — '
    +'nichts von Hand gepflegt, kann also nicht veralten.</div>';
}

/* ---------------------------------------------------------------------------
   🔴 15.08.2026, Ralph-Auftrag: HIER STAND DER FLUSS (_abFluss, 60 Zeilen).
   Ein SVG-Diagramm Zufluss → Prüfung → Live, mit Strichdicke nach Menge,
   laufenden Punkten und rotem Riegel bei Zuflüssen ohne Abnehmer.

   ERSATZLOS ENTFERNT, nicht auskommentiert und nicht hinter if(false) gelegt —
   sonst wäre es totes Werkzeug wie ladeStammPanel und ladeNutzungPanel, die
   beide monatelang im Code standen und beim Suchen jedes Mal Zeit gekostet
   haben. Rücksprungpunkt mit dem vollständigen Code:
   webseite/_sicherungen/2026-08-15-work22-hauptnav/app.js

   WAS DABEI NICHT VERLORENGEGANGEN IST, vor dem Löschen einzeln geprüft:
   · die Zahlen — np.zufluesse wird weiter von _abAbl, _abJobsListe und dem
     Graph gelesen. Nur die Zeichnung ist weg, nicht die Quelle.
   · die Aussage „Zufluss ohne Abnehmer" — sie steht im Hero als eigene Zahl
     und in der Kachel „Heute — offene Aufgaben" als eigene Zeile.
   · der Drilldown — die Hero-Zahlen sprangen ohnehin nach #abDetail
     („Alle offenen Punkte"), nie in den Fluss (Ralph P12 eingehalten).
   · _abZf (Farbe je Zufluss) bleibt stehen, der Graph benutzt sie.
   --------------------------------------------------------------------------- */
/* 🔴 OHNE AUFRUFER seit 20.08.2026, Work #121 — stehengelassen, nicht geloescht.
   Der „Herzschlag" zeigte dieselben drei Takte, die jetzt in der Kachel
   „Betrieb & Schnellzugriff" stehen (gemessen: cb_netzplan liefert 3,
   cockpit.karten.schnell.takte liefert dieselben 3). */
function _abTakte(np){
  var t=(np&&np.takte)||[], s='';
  t.forEach(function(x,i){
    var ser=Number(x.fehler_serie)||0, m=(x.minuten_her==null?null:Number(x.minuten_her));
    var f=ser>0?_AB.krit:_AB.gut;
    s+='<div class="abkv"><span><span class="abdot" style="background:'+f+';margin-right:7px"></span>'
      +esc(x.takt)+'</span><b style="color:'+f+'">'
      +(ser>0?'scheitert '+ser+'×':(m==null?'—':(m<1?'gerade eben':'vor '+m+' Min')))+'</b></div>';
  });
  if(!t.length) s+='<div class="abkv"><span>Takte</span><b style="color:'+_AB.grau
    +'">noch nicht protokolliert</b></div>';
  var pr=(np&&np.wochenlauf&&np.wochenlauf.protokolliert)===true;
  s+='<div class="abkv"><span><span class="abdot" style="background:'+(pr?_AB.gut:_AB.grau)
    +';margin-right:7px"></span>Wochenlauf</span><b style="color:'+(pr?_AB.gut:_AB.grau)+'">'
    +(pr?esc(String(np.wochenlauf.wert)):'nicht protokolliert')+'</b></div>'
    +'<div style="font-size:11px;color:'+_AB.mut+';margin-top:7px">Grau heißt: wir wissen es nicht — '
    +'nicht: es ist in Ordnung.</div>';
  return s;
}
function _abQuellen(np){
  var q=(np&&np.bestand)||[]; if(!q.length) return '<div style="font-size:12px;color:'+_AB.mut+'">keine Angabe</div>';
  var max=Math.max.apply(null,q.map(function(x){return Number(x.anzahl)||0;}))||1;
  return q.map(function(x){
    return '<div style="font-size:12px;margin-bottom:7px"><div style="display:flex;justify-content:space-between">'
      +'<span>'+esc(x.typ)+'</span><b style="font-variant-numeric:tabular-nums">'+x.anzahl+'</b></div>'
      +'<div class="abbar"><i style="width:'+((Number(x.anzahl)||0)/max*100)+'%;background:'+_AB.kern
      +';opacity:.75"></i></div></div>';
  }).join('');
}

/* ============================================================================
   HERO + BENTO-REIHE 1  ·  Dashboard Variante B, Durchgang 2  ·  15.08.2026
   ----------------------------------------------------------------------------
   §22 zuerst geprueft: NICHTS hiervon ist neu erhoben. Alle Zahlen kommen aus
   _abAbl(np) — derselben Ableitung, die die alte KPI-Reihe benutzte. Die
   Aufgabenliste ist _abJobs, der Ring ist _abRing; beide bleiben unveraendert
   und werden nur anders eingerahmt. Es gibt keine zweite Rechnung (§4.2).

   🔴 KEINE MOCKUP-ZAHLEN. Ralphs Auftragstext nannte „System gesund · 248
   Aufgaben · 4 kritische Bereiche". 248 stimmt und ist die Summe der wartenden
   Zuflüsse (gemessen 15.08.: 19+85+47+21+51+25). „4 kritische Bereiche" liess
   sich NICHT belegen — gemessen sind 6 offene Gate-Waechter und 2 Zufluesse
   ohne Abnehmer. Es wird deshalb benannt, was gemessen ist, statt eine Zahl
   nachzustellen, die zufaellig zum Mockup passt (§1.1).
   ========================================================================== */
/* ============================================================================
   COCKPIT v2  ·  Work #121  ·  20.08.2026
   ----------------------------------------------------------------------------
   EINE Quelle fuer die sichtbaren Standardzahlen: cb_admin_dashboard_cockpit_v2.
   Vorher erhob jede Kachel ihre Zahl selbst aus cb_dashboard und cb_netzplan —
   dieselbe Frage an mehreren Orten (§4.2). ChatGPT hat den Vertrag am 18.08.
   gebaut; angeschlossen war er nie. Gemessen 20.08. mit grep in app.js:
   0 Aufrufer. Wieder §22 — nicht gebaut, nur nicht verbunden.

   🔴 ER LAEDT NACH, NICHT VORHER. Gemessen 20.08. mit EXPLAIN (ANALYZE):
   3.806 ms kalt, 2.915 ms warm. Eine Kachel, die den Seitenaufbau drei
   Sekunden blockiert, waere ein Rueckschritt — derselbe Fall wie
   cb_admin_stamm_waechter mit 4,9 s in Work #17.

   🔴 SOLANGE NICHTS DA IST, STEHT „laedt" DA — keine alte Zahl aus einer
   zweiten Quelle als Platzhalter. Genau das waere die Doppelung, die dieser
   Umbau beseitigt.
   ========================================================================== */
var _AB_CK=null, _AB_CK_FEHLER=null, _AB_CK_LAEUFT=false;

/* Rangfolge der Dringlichkeit. Steht an EINER Stelle, damit Farbe, Satz und
   Reihenfolge nicht auseinanderlaufen koennen. */
var _AB_CK_RANG={kritisch:0, warnung:1, aktion:2, hinweis:3};
var _AB_CK_FARBE={kritisch:'#ff8a8a', warnung:'#ffcf6b', aktion:'#9ec9ff', hinweis:'#b7f0c8'};
var _AB_CK_ZUST={kritisch:'Eingriff nötig', warnung:'Läuft, mit Auffälligkeiten',
                 aktion:'Wartet auf dich', hinweis:'Läuft'};

function _abCkAttention(){
  var a=(_AB_CK&&_AB_CK.hero&&_AB_CK.hero.attention)||[];
  return a.slice().sort(function(x,y){
    var rx=_AB_CK_RANG[x&&x.severity], ry=_AB_CK_RANG[y&&y.severity];
    if(rx==null) rx=9; if(ry==null) ry=9;
    return (rx-ry)||((Number(y&&y.count)||0)-(Number(x&&x.count)||0));
  });
}

/* Alle drill_keys, die im gelieferten Cockpit-Objekt WIRKLICH vorkommen —
   eingesammelt, nicht abgeschrieben. Ein Schluessel, den der Server nicht
   nennt, bekommt keinen Knopf. */
function _abCkDrillSet(){
  var s={};
  (function geh(o){
    if(!o||typeof o!=='object') return;
    if(Array.isArray(o)){ o.forEach(geh); return; }
    Object.keys(o).forEach(function(k){
      var v=o[k];
      if(k==='drill_key' && typeof v==='string' && v) s[v]=1;
      else if(k==='drills' && v && typeof v==='object'){
        Object.keys(v).forEach(function(dk){ if(typeof v[dk]==='string' && v[dk]) s[v[dk]]=1; });
      }
      else geh(v);
    });
  })(_AB_CK);
  return s;
}
function _abCkDrillBekannt(k){
  if(!k || !_AB_CK) return false;
  return _abCkDrillSet()[k]===1;
}

async function _abCockpitHolen(neu){
  if(_AB_CK_LAEUFT) return;
  if(_AB_CK && !neu) return;
  _AB_CK_LAEUFT=true; _AB_CK_FEHLER=null;
  try{
    var r=await client.rpc('cb_admin_dashboard_cockpit_v2');
    if(r&&r.error) throw r.error;
    var o=r&&r.data; if(typeof o==='string') o=JSON.parse(o);
    if(!o) throw new Error('cb_admin_dashboard_cockpit_v2 hat nichts geliefert');
    if(o.ok===false) throw new Error(o.grund||'abgelehnt');
    _AB_CK=o;
  }catch(e){
    /* Kein leerer Fangblock (§11.4): der Grund steht in der Oberflaeche UND
       in der Konsole. Ein Dashboard, das schweigend leer bleibt, ist der
       Fehlertyp, den dieses Projekt am haeufigsten hatte. */
    _AB_CK=null; _AB_CK_FEHLER=(e&&e.message)||String(e);
    try{ console.error('[Cockpit v2]',e); }catch(_){}
  }
  _AB_CK_LAEUFT=false;
  try{ _abHeroFuellen(); }catch(e){ try{ console.warn('[Cockpit v2] Hero:',e); }catch(_){} }
  try{ _abNeuZeichnen(); }catch(e){ try{ console.warn('[Cockpit v2] Kacheln:',e); }catch(_){} }
}

/* Der Zustandssatz links im Hero. Er kommt aus DENSELBEN attention-Punkten wie
   die Zahlen rechts — vorher stand hier A.gate_offen aus cb_netzplan, waehrend
   das Cockpit gate_faelle fuehrt. Zwei Zahlen fuer dieselbe Frage; gemessen
   20.08.: 248 gegen 242. */
function _abHeroZustHtml(){
  var farbe, zust, warum;
  if(_AB_CK_FEHLER){
    farbe='#ff8a8a'; zust='Lage unbekannt';
    warum='cb_admin_dashboard_cockpit_v2 antwortet nicht: '+_AB_CK_FEHLER;
  } else if(!_AB_CK){
    farbe='#c9d2dd'; zust='Lage wird geladen';
    warum='cb_admin_dashboard_cockpit_v2 braucht rund drei Sekunden — die Seite wartet nicht darauf';
  } else {
    var a=_abCkAttention();
    if(!a.length){
      farbe='#7ee2a2'; zust='Ruhig';
      warum='Nichts verlangt gerade dein Eingreifen.';
    } else {
      var top=a[0];
      farbe=_AB_CK_FARBE[top.severity]||'#c9d2dd';
      zust=_AB_CK_ZUST[top.severity]||'Auffällig';
      warum=String(top.text||top.titel||'');
      if(a.length>1) warum+=' · und '+(a.length-1)+' weitere';
    }
  }
  return '<div class="hzust"><span class="hpunkt" style="background:'+farbe+'"></span>'+esc(zust)+'</div>'
    +'<div style="font-size:11.5px;opacity:.85;margin-top:3px">'+esc(warum)+'</div>';
}

/* Die Zahlen rechts im Hero: AUSSCHLIESSLICH hero.attention (§121, Kriterium 3).
   Die drei alten Zahlen (Vorgaenge warten · ohne Abnehmer · Waechter melden)
   sind ERSETZT, nicht ergaenzt — sie stehen weiterhin in den Kacheln „Eingang"
   und „Qualitaet" und muessen nicht zweimal auf dieselbe Seite (Kriterium 8). */
function _abHeroZahlenHtml(){
  if(_AB_CK_FEHLER) return '<div class="hz"><b>–</b><span>keine Lagemeldung</span></div>';
  if(!_AB_CK) return '<div class="hz"><b>…</b><span>lädt</span></div>';
  var a=_abCkAttention();
  if(!a.length) return '<div class="hz"><b>0</b><span>offene Punkte</span></div>';
  return a.slice(0,4).map(function(x){
    var f=_AB_CK_FARBE[x.severity]||'#c9d2dd';
    /* 🔴 POSITIVLISTE, KEINE AUSSCHLUSSLISTE (§3.3). Ein action_key ist NICHT
       automatisch ein drill_key. Gemessen 20.08. gegen alle 22 Schluessel:
       20 liefern eine Liste, `qualitaet` und `eingang` antworten mit
       „Unbekannter Dashboard-Drill". Ein erster Entwurf schloss nur `eingang`
       aus — `qualitaet` haette ein Fehlerfenster geoeffnet, also genau den
       toten Knopf, den Kriterium 4 verbietet.
       Die Liste wird nicht von Hand gefuehrt: sie ergibt sich aus den
       drill_keys, die im Cockpit-Objekt selbst stehen (§28.4). */
    var key=_abCkDrillBekannt(x.action_key)?x.action_key:'';
    return '<div class="hz'+(key?' klick':'')+'"'
      +(key?' data-drill="'+esc(key)+'" data-drill-titel="'+esc(String(x.titel||''))+'"':'')
      +'><b style="color:'+f+'">'+esc(String(x.count==null?'–':x.count))+'</b>'
      +'<span title="'+esc(String(x.text||''))+'">'+esc(String(x.titel||x.id||''))+'</span></div>';
  }).join('');
}

/* Beide Haelften nachtragen, ohne den Hero neu zu bauen: in der rechten Spalte
   haengen Anordnen, Dunkel, Umschalter und Aktualisieren. Wer den ganzen Hero
   ersetzt, wirft deren Verdrahtung weg — und merkt es erst, wenn ein Knopf
   nichts mehr tut. */
function _abHeroFuellen(){
  var z=document.getElementById('abHeroZust');
  if(z) z.innerHTML=_abHeroZustHtml();
  var n=document.getElementById('abHeroZahlen');
  if(n){
    n.innerHTML=_abHeroZahlenHtml();
    /* 🔴 Der Hero liegt AUSSERHALB von #abBentoBox — _abNeuZeichnen und damit
       _abBentoNach fassen ihn nicht an. Wer das uebersieht, baut anklickbare
       Zahlen, die auf nichts hoeren. Deshalb hier, direkt am Container. */
    n.querySelectorAll('[data-drill]').forEach(function(x){
      x.addEventListener('click',function(){
        if(_AB_EDIT) return;
        _abDrillOeffnen(x.getAttribute('data-drill'), x.getAttribute('data-drill-titel')||'');
      });
    });
  }
}

/* ============================================================================
   HERO  ·  Work #121, Stufe 2  ·  20.08.2026
   ----------------------------------------------------------------------------
   Der Hero traegt jetzt genau eine Lage: die aus cb_admin_dashboard_cockpit_v2.
   Die Parameter d, np und A werden nicht mehr fuer Zahlen benutzt — sie bleiben
   in der Signatur, weil dashArbeitHtml und der Anordnen-Modus sie uebergeben
   und eine Signaturaenderung an dieser Stelle nichts verbessert (§11.3).
   ========================================================================== */
function _abHero(d,np,A,ans){
  return '<div class="abhero">'
    +'<div id="abHeroZust">'+_abHeroZustHtml()+'</div>'
    +'<div class="hzahlen" id="abHeroZahlen">'+_abHeroZahlenHtml()+'</div>'
    +'<div class="hr"><span id="abStand"></span>'
      +'<button class="hbtn" id="abAnordnen" type="button" '
        +'title="Kacheln anordnen, ein-/ausblenden, Breite umschalten">🧩 Anordnen</button>'
      +'<button class="hbtn" id="abDunkel" type="button" '
        +'title="Helle oder dunkle Darstellung">🌙 Dunkel</button>'
      +_abUmschalter(ans)
      +'<button class="hbtn" id="abNeu">↻ Aktualisieren</button></div>'
  +'</div>';
}

/* Kachelrahmen. Eine Stelle, damit die vier Kacheln nicht viermal leicht
   unterschiedlich aussehen. */
function _abKachel(titel, tag, inhalt, fuss, gross, zus){
  zus=zus||{};
  /* Foto und Schleier liegen UNTER dem Inhalt. Zwei getrennte Ebenen, damit
     der Verlauf unabhaengig vom Bild eingestellt werden kann — beim ersten
     Versuch steckte beides in einer, und jede Aenderung am Verlauf hat das
     Bild mitverschoben. */
  var _foto = zus.foto
    ? '<div class="bfoto" style="background-image:url(bg-'+zus.foto+'.jpg)"></div>'
      +'<div class="bschleier"></div>'
    : '';
  var _leds = zus.leds
    ? '<span class="bleds">'+String(zus.leds).split(' ').map(function(f){
        return '<i class="'+f+'"></i>'; }).join('')+'</span>'
    : '';
  return '<div class="bk'+(gross?' bgross':'')+(zus.klasse||'')+'"'+(zus.attr||'')
    +(zus.stil?' style="'+zus.stil+'"':'')+'>'
    +_foto
    +(zus.vor||'')
    +'<div class="bkopf"><h3>'+titel+'</h3>'+(tag||'')+_leds+'</div>'
    +inhalt
    +(fuss?'<div class="bfuss">'+fuss+'</div>':'')
  +'</div>';
}

/* ============================================================================
   DRILL — jede Zahl wird eine Arbeitsliste  ·  Work #121, Stufe 4  ·  20.08.2026
   ----------------------------------------------------------------------------
   Ralphs Satz zum Auftrag: „Jede auffaellige Zahl muss in eine echte
   Arbeitsliste fuehren." Die Liste kommt von
   cb_admin_dashboard_cockpit_drill(p_key, p_limit) — SERVERSEITIG, in einem
   Vertrag mit festen Feldern: kind · id · title · info · age_days.

   🔴 KEIN TOTER KNOPF (Kriterium 4). Ein Sprung entsteht nur, wenn es fuer
   `kind` einen VORHANDENEN Weg gibt. Gibt es keinen, bleibt die Zeile eine
   Zeile — das ist ehrlich, ein Knopf, der nichts tut, waere es nicht.
   Gemessen 20.08.: fuer `work` gibt es im Frontend keine Queue-Ansicht; genau
   deshalb steht dort kein Knopf und die Serverliste selbst ist die Antwort.

   Das Panel liegt als Overlay ueber der Seite und benutzt Inline-Stile: so
   muss dashArbeitCss nicht angefasst werden, an dem parallel gearbeitet wird.
   ========================================================================== */
var _AB_DRILL_ZIEL={
  produkt: function(r){ if(typeof openFgEditor==='function'){ _abDrillZu(); openFgEditor(r.id); } },
  stamm:   function(){ if(typeof adminGo==='function'){ _abDrillZu(); adminGo('stamm'); } },
  scan:    function(){ if(typeof scanEingangOeffnen==='function'){ _abDrillZu(); scanEingangOeffnen(); } },
  scan_cache: function(){ if(typeof scanEingangOeffnen==='function'){ _abDrillZu(); scanEingangOeffnen(); } }
  /* work · kontakt · tagebuch_wunsch · riki: im Frontend gibt es dafuer heute
     keinen Weg. Sie bekommen deshalb keinen Knopf, sondern nur die Zeile. */
};

function _abDrillBox(){
  var b=document.getElementById('abDrillBox');
  if(b) return b;
  b=document.createElement('div');
  b.id='abDrillBox';
  b.style.cssText='position:fixed;inset:0;z-index:9000;display:none;'
    +'background:rgba(15,23,32,.42);backdrop-filter:blur(2px)';
  b.addEventListener('click',function(e){ if(e.target===b) _abDrillZu(); });
  document.body.appendChild(b);
  return b;
}
function _abDrillZu(){
  var b=document.getElementById('abDrillBox'); if(b) b.style.display='none';
}
if(typeof window!=='undefined') window._abDrillZu=_abDrillZu;

function _abDrillRahmen(titel,inhalt){
  return '<div style="position:absolute;right:0;top:0;bottom:0;width:min(560px,92vw);'
    +'background:var(--card,#fff);color:var(--ink,#1b2733);box-shadow:-8px 0 28px rgba(0,0,0,.22);'
    +'display:flex;flex-direction:column">'
    +'<div style="display:flex;align-items:center;gap:10px;padding:13px 16px;'
      +'border-bottom:1px solid var(--line,#dbe3ea);flex:0 0 auto">'
      +'<b style="font-size:14px">'+esc(titel)+'</b>'
      +'<button type="button" onclick="_abDrillZu()" style="margin-left:auto;border:1px solid '
        +'var(--line,#dbe3ea);border-radius:8px;background:var(--bg,#f4f6f8);color:inherit;'
        +'padding:5px 11px;font-size:12.5px;cursor:pointer">Schließen ✕</button>'
    +'</div>'
    +'<div style="flex:1 1 auto;overflow:auto;padding:10px 16px 18px">'+inhalt+'</div>'
  +'</div>';
}

async function _abDrillOeffnen(key,titel){
  if(!key) return;
  var b=_abDrillBox();
  b.style.display='block';
  b.innerHTML=_abDrillRahmen(titel||key,'<div class="blade">lädt…</div>');
  try{
    var r=await client.rpc('cb_admin_dashboard_cockpit_drill',{p_key:key,p_limit:50});
    if(r&&r.error) throw r.error;
    var o=r&&r.data; if(typeof o==='string') o=JSON.parse(o);
    if(!o) throw new Error('cb_admin_dashboard_cockpit_drill hat nichts geliefert');
    if(o.ok===false) throw new Error(o.grund||'abgelehnt');
    var rows=o.rows||[];
    var h=rows.length
      ? '<div style="font-size:11.5px;opacity:.7;margin-bottom:8px">'
          +rows.length+' von '+(o.count==null?rows.length:o.count)+' — Schlüssel '+esc(key)+'</div>'
        + rows.map(function(x,i){
            var hatZiel=!!_AB_DRILL_ZIEL[x.kind];
            var alt=(x.age_days==null)?'':(' · '+x.age_days+' Tage alt');
            return '<div style="display:flex;gap:9px;align-items:flex-start;padding:7px 0;'
              +'border-bottom:1px solid var(--line,#eef2f6)">'
              +'<span style="flex:0 0 auto;font-size:11px;opacity:.6;min-width:26px;'
                +'padding-top:2px">'+(i+1)+'</span>'
              +'<span style="flex:1 1 auto;min-width:0">'
                +'<div style="font-size:12.5px;font-weight:600;overflow-wrap:anywhere">'
                  +esc(String(x.title||x.id||''))+'</div>'
                +'<div style="font-size:11px;opacity:.7">'+esc(String(x.info||''))
                  +esc(alt)+' · '+esc(String(x.id||''))+'</div>'
              +'</span>'
              +(hatZiel
                ? '<button type="button" class="abdrillgo" data-kind="'+esc(String(x.kind))
                    +'" data-id="'+esc(String(x.id))+'" style="flex:0 0 auto;border:1px solid '
                    +'var(--line,#dbe3ea);border-radius:8px;background:var(--bg,#f4f6f8);'
                    +'color:inherit;padding:4px 10px;font-size:12px;cursor:pointer">öffnen ›</button>'
                : '')
            +'</div>';
          }).join('')
      : '<div class="bleer">Diese Liste ist leer — die Zahl war 0 oder ist inzwischen abgearbeitet.</div>';
    b.innerHTML=_abDrillRahmen(titel||key,h);
    b.querySelectorAll('.abdrillgo').forEach(function(btn){
      btn.addEventListener('click',function(){
        var f=_AB_DRILL_ZIEL[btn.dataset.kind];
        if(f) f({id:btn.dataset.id, kind:btn.dataset.kind});
      });
    });
  }catch(e){
    b.innerHTML=_abDrillRahmen(titel||key,
      '<div class="bfehl"><b>Liste nicht ladbar.</b><br>'+esc((e&&e.message)||String(e))+'</div>');
    try{ console.error('[Drill] '+key,e); }catch(_){}
  }
}

/* ============================================================================
   KACHEL-REGISTER  ·  Work #42, Etappe 1  ·  15.08.2026
   ----------------------------------------------------------------------------
   Bis hierher stand die ANORDNUNG im Code: _abBento und _abBento2 riefen ihre
   Kacheln in fester Reihenfolge auf. Ab jetzt steht sie in EINER Liste, und der
   Code laeuft ueber die Liste. Das Verhalten ist unveraendert — genau das ist
   der Zweck: E1 ist die risikolose Etappe, die Ausgabe muss zeichengleich
   bleiben (Abnahme: Screenshot vorher/nachher identisch).

   §22 hat sich wieder ausgezahlt: _abKachel gab es bereits. Neu gebaut wurde
   nichts; zusammengefuehrt wurde nur der EINE Sonderweg, den _abBento2 mit
   seiner eigenen kleinen kachel()-Funktion noch hatte.

   Ein Eintrag: id · reihe · titel · breit · bau(c) -> {tag,inhalt,fuss}
   Alternativ roh(c) -> fertiges Markup, fuer Kacheln, die ihren Rahmen selbst
   mitbringen (Schnellzugriff). Etappe 2 legt eine Konfiguration darueber;
   liegt keine vor, gilt diese Liste als Rueckfall.
   ========================================================================== */
/* 🔴 C2, 15.08.2026 — ROOT-COCKPIT-OPTIK (Ralph-Go: „ja, kannst du so bauen").
   Jede Kachel bekommt ein FOTO als Hintergrund. Die Dateien liegen FLACH in
   webseite/ als bg-*.jpg — nicht in einem Unterordner: deploy.command kopiert
   nur regulaere Dateien direkt aus webseite/ und ueberspringt Ordner. Waeren
   sie unten drin, waeren sie gebaut und trotzdem nie live (gemessen, C1).
   `foto` ist die Kennung ohne Vorsilbe und Endung. Fehlt sie, bleibt die
   Kachel weiss — kein Fehler, nur ohne Bild. */
var _AB_KACHELN=[
  /* 🔴 20.08.2026, Work #121: die IDs bleiben unveraendert — gespeicherte
     Layouts aus Work #42 duerfen nicht migriert werden muessen (Kriterium 2).
     Geaendert sind nur die BESCHRIFTUNGEN, damit jede Kachel sagt, welche
     Frage sie beantwortet: Arbeit · Eingang · Qualitaet · Katalog · Stamm ·
     RIKI · Nutzung · Betrieb. Vorher hiessen zwei davon nach ihrer Herkunft
     („Wächter-Status", „Letzte Aktivitäten") statt nach ihrem Zweck. */
  {id:'aufgaben',  reihe:1, titel:'Arbeit',                   breit:true,  bau:_abkAufgaben, foto:'flusslauf', leds:'r ge', text:true},
  {id:'bestand',   reihe:1, titel:'Katalog',                  breit:false, bau:_abkBestand,  foto:'kiesel',    leds:'gr gr'},
  {id:'riki',      reihe:1, titel:'RIKI',                     breit:false, bau:_abkRiki,     foto:'kaskade',   leds:'gr'},
  {id:'waechter',  reihe:1, titel:'Qualität',                 breit:false, bau:_abkWaechter, foto:'stroem',    leds:'r ge'},
  {id:'aktivitaet',reihe:2, titel:'Eingang',                  breit:true,  bau:_abkAkt,      foto:'wellen',    leds:'gr', text:true},
  {id:'region',    reihe:2, titel:'Nutzer &amp; Regionen',    breit:false, bau:_abkRegion,   foto:'regionen',  leds:'gr'},
  {id:'stammu',    reihe:2, titel:'Stamm',                    breit:false, bau:_abkStammU,   foto:'stamm',     leds:'ge gr'},
  {id:'schnell',   reihe:2, titel:'Betrieb &amp; Schnellzugriff', breit:false, roh:_abSchnell},
  /* C3, 15.08.: zwei neue Kacheln, beide mit ECHTEN Zahlen aus vorhandenen
     RPCs. §22 hat sich wieder ausgezahlt — gesucht statt gebaut:
       Stamm    -> cb_admin_stamm_waechter()      (das Dashboard ruft ihn schon)
       Wirkkette-> cb_admin_architektur_liste()   (seit 15.08. in der Datenbank)
     Die Deutschlandkarte wurde NICHT gebaut: entKarteDE und
     cb_bundesland_zaehlung gibt es seit Juli, sie haengen in der Kachel
     „Nutzer & Regionen". Im Entwurf hatte ich sie nachgezeichnet — das waere
     die zweite Kopie gewesen (§4.2). */
  {id:'marke',     reihe:1, titel:'Root Index',                breit:false, bau:_abkMarke},
  {id:'wirk',      reihe:2, titel:'Wirkkette',                 breit:false, bau:_abkWirk,     foto:'ringe',  leds:'r ge', text:true},
  /* Die freie Kachel: Ralph bestimmt ihren INHALT, nicht nur ihren Platz.
     Sie steht in der gespeicherten Standardvariante auf aus - wer sie will,
     schaltet sie im Anordnen-Modus ein. Ein Dashboard, das sich von selbst um
     eine Kachel erweitert, waere eine Ueberraschung, keine Verbesserung. */
  {id:'frei',      reihe:1, titel:'Meine Zahlen',             breit:false, bau:_abkFrei, waehlbar:true}
];

/* ============================================================================
   KENNZAHL-REGISTER  ·  Work #42, „inhalt bestimmen"  ·  15.08.2026
   ----------------------------------------------------------------------------
   Ralphs Auftrag hiess „container verschieben, INHALT BESTIMMEN usw." Das
   Verschieben steht; hier kommt der Inhalt.

   🔴 KURATIERTE LISTE, kein freier Datenbankzugriff aus dem Browser (§10.2).
   Waehlbar ist genau das, was das Dashboard ohnehin schon geladen hat - keine
   einzige zusaetzliche Abfrage, keine neue Zaehlung. Jede Zahl hier hat ihre
   Quelle in denselben Daten wie die Kacheln daneben; damit kann keine zweite
   Wahrheit entstehen (§4.2).

   Erweitern heisst: eine Zeile in dieser Liste. Nicht: eine Migration.
   ========================================================================== */
var _AB_KENNZAHLEN=[
  {id:'aktiv',      titel:'aktive Produkte',      wert:function(c){ return _abKz(c.d,'katalog','aktiv'); }},
  {id:'entwurf',    titel:'Entwürfe',             wert:function(c){ return _abKz(c.d,'katalog','entwurf'); }},
  {id:'schnitt',    titel:'Index-Schnitt',        wert:function(c){ var v=_abKz(c.d,'katalog','schnitt_score');
                                                     return v==null?null:String(v).replace('.',','); }},
  {id:'ohne_score', titel:'ohne Index-Zahl',      warn:true, wert:function(c){ return _abKz(c.d,'qualitaet','ohne_score'); }},
  {id:'zutaten',    titel:'Zutaten im Stamm',     wert:function(c){ return _abKz(c.np,'extra','zutaten'); }},
  {id:'rezepte',    titel:'Rezepte',              wert:function(c){ return _abKz(c.np,'extra','rezepte'); }},
  {id:'nutzer',     titel:'Nutzer gesamt',        wert:function(c){ return _abKz(c.d,'nutzer','gesamt'); }},
  {id:'aktiv30',    titel:'aktiv, 30 Tage',       wert:function(c){ return _abKz(c.d,'nutzer','aktiv_30t'); }},
  {id:'premium',    titel:'Premium',              wert:function(c){ return _abKz(c.d,'nutzer','premium'); }},
  {id:'tagebuch',   titel:'Tagebuch, 7 Tage',     wert:function(c){ return _abKz(c.d,'nutzung','eintraege_7t'); }},
  {id:'wartend',    titel:'Vorgänge warten',      wert:function(c){ return c.A?c.A.wartend:null; }},
  {id:'sackgasse',  titel:'ohne Abnehmer',        warn:true, wert:function(c){ return c.A?c.A.sackgasse:null; }},
  {id:'melden',     titel:'Wächter melden',       warn:true, wert:function(c){ return c.A?c.A.melden:null; }},
  {id:'gate',       titel:'Gate-Fälle',           warn:true, wert:function(c){ return c.A?c.A.gate_offen:null; }},
  {id:'riki_monat', titel:'Riki, Monat',          wert:function(c){ var r=(c.d&&c.d.riki)||{}, v=Number(r.monat_usd);
                                                     return isNaN(v)?null:v.toFixed(2).replace('.',',')+' $'; }},
  {id:'regelwerk',  titel:'Regelwerk-Bereiche',   wert:function(c){ var r=(c.np&&c.np.regelwerk); return r?r.length:null; }}
];
/* Ein Griff, damit keine 16 eigene Null-Pruefungen entstehen. */
function _abKz(quelle, gruppe, feld){
  var g=(quelle&&quelle[gruppe])||{};
  var v=g[feld];
  return (v==null||v==='')?null:v;
}
var _AB_FREI_VORGABE=['aktiv','ohne_score','wartend','melden'];

/* ============================================================================
   EIGENE KACHELN  ·  Work #42  ·  15.08.2026
   ----------------------------------------------------------------------------
   🔴 RICHTIGSTELLUNG. Ralph: „neue kacheln einfuegen und loeschen glaub ich
   sind schon drin." Waren sie NICHT. Bis Build 3070 gab es genau die neun
   Kacheln aus dem Code; „✕" hat eine davon nur AUSGEBLENDET. Neu anlegen ging
   gar nicht. Hier steht es jetzt wirklich.

   DER UNTERSCHIED, der auch in der Oberflaeche sichtbar ist:
     · Kacheln aus dem Code (Aufgaben, Datenbestand, Riki …) kann man
       AUSBLENDEN, nicht loeschen — sie gehoeren zur App, nicht zum Layout.
       Zeichen: ✕. Sie kommen ueber die Leiste zurueck.
     · Selbst angelegte Kacheln kann man LOESCHEN. Zeichen: 🗑. Sie stehen nur
       im Layout, also verschwinden sie mit ihm.
   Ein Loeschknopf, der in Wahrheit nur ausblendet, waere eine Luege in der
   Oberflaeche - und ein Ausblendknopf, der in Wahrheit loescht, ein Datenverlust.
   ========================================================================== */
var _AB_TYPEN={
  frei: {titel:'Meine Zahlen', bau:function(c,x){ return _abkFrei(c,x); }, waehlbar:true},
  /* D4, Ralph: „notizen wird spaeter eine kachel." Die einzige Kachelart, die
     KEINE Datenfrage aufwirft — der Inhalt kommt von ihm. */
  notiz:{titel:'Notiz',        bau:function(c,x){ return _abkNotiz(c,x); }, text:true},
  /* D5-D7. 🔴 ALLE DREI ARBEITEN NUR MIT DATEN, DIE DAS DASHBOARD SCHON HAT.
     Ralph hat „weiter d5 bis d7" gesagt, aber die offenen Fragen dazu nicht
     beantwortet - welche Reihen ueber Zeit, welche Filter, ob Bilder gemeint
     waren. Statt zu raten (§1) ist jede Art auf das begrenzt, was messbar
     vorliegt; was fehlt, sagt die Kachel selbst. */
  verlauf:{titel:'Verlauf',    bau:function(c,x){ return _abkVerlauf(c,x); }, reihe:true},
  liste:  {titel:'Liste',      bau:function(c,x){ return _abkListe(c,x); },   quelle:true},
  bild:   {titel:'Bild',       bau:function(c,x){ return _abkBild(c,x); },    text:true}
};

/* ---- MARKE mit Fluxkompensator -------------------------------------------
   Ralph wollte ihn ausdruecklich als Hintergrund. Ein Foto gibt es davon nicht,
   also gezeichnet — und zwar EINMAL hier, nicht als Datei: eine Zeichnung, die
   sich aus drei Zahlen ergibt, gehoert in den Code, nicht in ein Bild. */
function _abkMarke(){
  var G=_AB.gut, S='#8c969b', l='', cx=150, cy=98;
  l+='<defs><radialGradient id="riKern"><stop offset="0" stop-color="'+G+'" stop-opacity=".9"/>'
    +'<stop offset="1" stop-color="'+G+'" stop-opacity="0"/></radialGradient></defs>';
  [-90,150,30].forEach(function(grad){
    var w=grad*Math.PI/180, ex=cx+Math.cos(w)*66, ey=cy+Math.sin(w)*66;
    l+='<line x1="'+cx+'" y1="'+cy+'" x2="'+ex+'" y2="'+ey+'" stroke="'+G
      +'" stroke-width="8" stroke-linecap="round" opacity=".35"/>'
      +'<line x1="'+cx+'" y1="'+cy+'" x2="'+ex+'" y2="'+ey+'" stroke="'+G
      +'" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>'
      +'<circle cx="'+ex+'" cy="'+ey+'" r="10" fill="none" stroke="'+S+'" stroke-width="1.8" opacity=".5"/>'
      +'<circle cx="'+ex+'" cy="'+ey+'" r="4.5" fill="'+G+'" opacity=".8"/>';
  });
  l+='<circle cx="'+cx+'" cy="'+cy+'" r="42" fill="url(#riKern)" opacity=".5"/>'
    +'<circle cx="'+cx+'" cy="'+cy+'" r="28" fill="none" stroke="'+G
    +'" stroke-width="1" opacity=".45" stroke-dasharray="4 7"/>'
    +'<circle cx="'+cx+'" cy="'+cy+'" r="19" fill="none" stroke="'+S+'" stroke-width="2.2" opacity=".6"/>'
    +'<circle cx="'+cx+'" cy="'+cy+'" r="12" fill="'+G+'" opacity=".9"/>';
  return {
    tag:'',
    inhalt:'<div class="bleib bmarke">'
      +'<svg viewBox="0 0 300 196" preserveAspectRatio="xMidYMid meet">'+l+'</svg>'
      +'<div class="bmtext"><b>[ri!]</b><span>Root Index<br>Erfassen · Bewerten · Freigeben</span></div>'
      +'</div>',
    fuss:''
  };
}

/* ---- WIRKKETTE ------------------------------------------------------------
   Laedt NACH, wie die anderen Kacheln der zweiten Reihe: cb_admin_architektur_liste
   liefert das ganze Diagramm, das ist nichts fuer den Seitenaufbau (Work #17). */
function _abkWirk(){
  return {
    tag:'<span class="abtag" style="background:#eef0f4;color:'+_AB.mut+'">Architektur</span>',
    inhalt:'<div class="bleib" id="abWirk"><div class="blade">lädt…</div></div>',
    fuss:''
  };
}

/* ---- D5 VERLAUF ------------------------------------------------------------
   🔴 EHRLICH GEZAEHLT: im Dashboard liegt GENAU EINE Reihe ueber Zeit vor -
   der taegliche Riki-Verbrauch (d.riki_verlauf, 14 Tage). Mehr ist nicht da.
   Die Auswahlliste hat deshalb einen Eintrag. Das ist kein Versehen und wird
   auch nicht mit erfundenen Reihen aufgefuellt; kommt serverseitig eine dazu,
   ist es hier eine Zeile. */
var _AB_REIHEN=[
  {id:'riki', titel:'Riki-Verbrauch je Tag', einheit:'$',
   werte:function(c){
     return (((c.d||{}).riki_verlauf)||[]).map(function(p){
       return {marke:p.tag, wert:Number(p.usd)||0}; });
   }}
];
function _abkVerlauf(c,x){
  var wahl=(x&&x.reihe_id)||_AB_REIHEN[0].id;
  var r=_AB_REIHEN.filter(function(y){ return y.id===wahl; })[0]||_AB_REIHEN[0];
  if(_AB_EDIT){
    return {
      tag:'<span class="abtag" style="background:#fbf3df;color:#8a7440">Reihe wählen</span>',
      inhalt:'<div class="bleib"><div class="abwahl">'
        + _AB_REIHEN.map(function(y){
            var an=(y.id===r.id);
            return '<button type="button" class="abkz'+(an?' an':'')+'" data-abreihe="'+esc(y.id)
              +'" data-kid="'+esc(x?x.id:'')+'">'+(an?'✓ ':'+ ')+esc(y.titel)+'</button>'; }).join('')
        +'</div><div class="bunter" style="margin-top:8px">Mehr Reihen gibt es zurzeit nicht — '
        +'sobald der Server eine liefert, steht sie hier.</div></div>',
      fuss:''
    };
  }
  var w=[]; try{ w=r.werte(c)||[]; }catch(e){ w=[]; }
  if(!w.length) return {tag:'', inhalt:'<div class="bleib"><div class="bleerk">'
    +'Für „'+esc(r.titel)+'" liegen keine Tageswerte vor.</div></div>', fuss:''};
  var max=Math.max.apply(null,[0.0001].concat(w.map(function(p){ return p.wert; })));
  var summe=w.reduce(function(a,p){ return a+p.wert; },0);
  return {
    tag:'<span class="abtag" style="background:#eef0f4;color:'+_AB.mut+'">'+w.length+' Tage</span>',
    inhalt:'<div class="bleib"><div class="bzahl" style="color:'+_AB.kern+'">'
      +summe.toFixed(2).replace('.',',')+' '+esc(r.einheit)+'</div>'
      +'<div class="bunter">'+esc(r.titel)+'</div>'
      +'<div class="bspark" style="height:60px">'
      + w.map(function(p){
          return '<i title="'+esc(String(p.marke))+': '+p.wert.toFixed(2)+'" style="height:'
            +Math.max(2,Math.round(p.wert/max*56))+'px"></i>'; }).join('')
      +'</div></div>',
    fuss:''
  };
}

/* ---- D6 LISTE --------------------------------------------------------------
   Auch hier nur Vorhandenes: die Arbeitsliste aus _abJobsListe (dieselbe
   Quelle wie die Kachel „Heute") und die Waechter, die melden. KEINE neue
   Abfrage, KEINE zweite Zaehlung (§4.2). */
var _AB_QUELLEN=[
  {id:'aufgaben', titel:'Offene Aufgaben',
   zeilen:function(c){
     return (_abJobsListe(c.np,c.A)||[]).map(function(j){
       return {links:j.t1, rechts:j.n, warn:(j.p===0), ziel:j.ziel}; });
   }},
  {id:'melder', titel:'Wächter, die melden',
   zeilen:function(c){
     return (((c.np||{}).waechter)||[])
       .filter(function(w){ return (Number(w.offen)||0)>0; })
       .sort(function(a,b){ return (Number(b.offen)||0)-(Number(a.offen)||0); })
       .map(function(w){ return {links:w.name, rechts:w.offen, warn:(w.gate===true)}; });
   }}
];
function _abkListe(c,x){
  var wahl=(x&&x.quelle)||_AB_QUELLEN[0].id;
  var q=_AB_QUELLEN.filter(function(y){ return y.id===wahl; })[0]||_AB_QUELLEN[0];
  var max=Number(x&&x.anzahl)||8;
  if(_AB_EDIT){
    return {
      tag:'<span class="abtag" style="background:#fbf3df;color:#8a7440">Quelle wählen</span>',
      inhalt:'<div class="bleib"><div class="abwahl">'
        + _AB_QUELLEN.map(function(y){
            var an=(y.id===q.id);
            return '<button type="button" class="abkz'+(an?' an':'')+'" data-abquelle="'+esc(y.id)
              +'" data-kid="'+esc(x?x.id:'')+'">'+(an?'✓ ':'+ ')+esc(y.titel)+'</button>'; }).join('')
        +'</div><div class="bunter" style="margin-top:8px">Zeigt die '+max+' obersten Zeilen. '
        +'Die Kachel höher ziehen zeigt mehr.</div></div>',
      fuss:''
    };
  }
  var z=[]; try{ z=q.zeilen(c)||[]; }catch(e){ z=[]; }
  return {
    tag:'<span class="abtag" style="background:#eef0f4;color:'+_AB.mut+'">'+z.length+'</span>',
    inhalt:'<div class="bleib">'
      +(z.length
        ? z.slice(0,max).map(function(r){
            return _abZeile(esc(String(r.links)), r.rechts, r.warn?_AB.krit:null); }).join('')
          +(z.length>max?'<div class="bunter" style="margin-top:6px">und '+(z.length-max)+' weitere</div>':'')
        : '<div class="bleerk">Nichts offen — '+esc(q.titel)+'.</div>')
      +'</div>',
    fuss:''
  };
}

/* ---- D7 BILD ---------------------------------------------------------------
   🔴 NUR UEBER EINE ADRESSE, KEIN HOCHLADEN. Hochladen braeuchte einen
   Ablageort fuer Dateien (Storage) samt Rechten - das ist ChatGPTs Haelfte
   (§31) und war nicht beauftragt. Mit einer Adresse geht es sofort und ohne
   fremde Entscheidung. Was das NICHT kann, steht in der Kachel, nicht nur hier. */
function _abkBild(c,x){
  var url=(x&&typeof x.text==='string')?x.text.trim():'';
  if(_AB_EDIT){
    return {
      tag:'<span class="abtag" style="background:#fbf3df;color:#8a7440">Bildadresse</span>',
      inhalt:'<div class="bleib"><input class="abetitel" style="width:100%;text-transform:none;'
        +'font-size:12px;font-weight:600" data-abnotiz="'+esc(x?x.id:'')+'" value="'+esc(url)+'" '
        +'placeholder="https://… — Adresse eines Bildes"></div>',
      fuss:'Hochladen geht hier nicht — dafür fehlt ein Ablageort für Dateien.'
    };
  }
  if(!url) return {tag:'', inhalt:'<div class="bleib"><div class="bleerk">'
    +'Kein Bild hinterlegt — „🧩 Anordnen" öffnen und eine Adresse eintragen.</div></div>', fuss:''};
  return {
    tag:'',
    inhalt:'<div class="bleib" style="padding:0"><img src="'+esc(url)+'" alt="" '
      +'style="display:block;width:100%;height:100%;object-fit:contain" '
      +'onerror="this.style.display=\'none\';this.insertAdjacentHTML(\'afterend\','
      +'\'&lt;div class=&quot;bleerk&quot; style=&quot;padding:10px&quot;&gt;'
      +'Bild nicht ladbar — Adresse prüfen.&lt;/div&gt;\')"></div>',
    fuss:''
  };
}

/* Notizkachel. Der Text liegt im Layout und wird mit ihm gespeichert — also
   fuer alle Admins sichtbar, wie alles andere auch (Ralph-Entscheid C).
   🔴 Das ist KEIN Ersatz fuer das Notizbuch (📝): dort haengen To-dos mit
   Zaehler. Hier steht ein Zettel auf dem Schreibtisch. Wer beides
   zusammenwirft, hat zwei Orte fuer dieselbe Aufgabe. */
function _abkNotiz(c,x){
  var t=(x&&typeof x.text==='string')?x.text:'';
  if(_AB_EDIT){
    return {
      tag:'<span class="abtag" style="background:#fbf3df;color:#8a7440">Text</span>',
      inhalt:'<div class="bleib"><textarea class="abnotiz" data-abnotiz="'+esc(x?x.id:'')+'" '
        +'placeholder="Notiz schreiben — sie wird mit dem Layout gespeichert">'+esc(t)+'</textarea></div>',
      fuss:t.length+' Zeichen'
    };
  }
  return {
    tag:'',
    inhalt:'<div class="bleib"><div class="abnotizText">'
      + (t ? esc(t).replace(/\n/g,'<br>')
           : '<span class="bleerk">Leere Notiz — „🧩 Anordnen" öffnen und schreiben.</span>')
      +'</div></div>',
    fuss:''
  };
}

function _abFreiWahl(x){
  var w=(x&&x.inhalt&&x.inhalt.length)?x.inhalt:_AB_FREI_VORGABE;
  /* Nur bekannte Kennzahlen - eine gespeicherte, spaeter entfernte id wird
     uebergangen statt als leere Zeile gezeigt (§3.4: fehlend ist nicht 0). */
  return w.filter(function(id){
    return _AB_KENNZAHLEN.some(function(k){ return k.id===id; }); });
}

function _abkFrei(c,x){
  var gewaehlt=_abFreiWahl(x);
  if(_AB_EDIT){
    /* Im Anordnen-Modus zeigt die Kachel die AUSWAHL, nicht die Zahlen. */
    return {
      tag:'<span class="abtag" style="background:#fbf3df;color:#8a7440">Inhalt wählen</span>',
      inhalt:'<div class="bleib"><div class="abwahl">'
        + _AB_KENNZAHLEN.map(function(k){
            var an=gewaehlt.indexOf(k.id)>=0;
            return '<button type="button" class="abkz'+(an?' an':'')+'" '
              +'data-abkz="'+esc(k.id)+'" data-kid="'+esc(x?x.id:'frei')+'">'
              +(an?'✓ ':'+ ')+esc(k.titel)+'</button>';
          }).join('')
        +'</div></div>',
      fuss:gewaehlt.length+' von '+_AB_KENNZAHLEN.length+' gewählt · Klick schaltet um'
    };
  }
  return {
    tag:'',
    inhalt:'<div class="bleib">'
      + (gewaehlt.length
          ? gewaehlt.map(function(id){
              var k=_AB_KENNZAHLEN.filter(function(y){ return y.id===id; })[0];
              var v=null; try{ v=k.wert(c); }catch(e){ v=null; }
              return _abZeile(esc(k.titel), (v==null?'–':v),
                (k.warn && Number(v)>0)?_AB.warn:null);
            }).join('')
          : '<div class="bleerk">Noch nichts gewählt — „🧩 Anordnen" öffnen.</div>')
      +'</div>',
    fuss:''
  };
}

/* ============================================================================
   LAYOUT-KONFIGURATION  ·  Work #42, Etappe 2  ·  15.08.2026
   ----------------------------------------------------------------------------
   Ralph-Entscheid: der Editor wird von IHM bedient, die Wirkung gilt fuer ALLE
   Admins. Also liegt die Konfiguration in der Datenbank (nicht im Browser) und
   es gibt keine Fassung „nur fuer Ralph".

   _AB_LAYOUT ist die eine Stelle, an der eine gespeicherte Anordnung ankommt.
   Bleibt sie leer, gilt _AB_KACHELN — der Rueckfall ist damit IMMER da und
   braucht keine Datenbank. E4 fuellt sie aus dem RPC; hier wird nur gelesen.

   Vier Regeln, damit nichts still verschwindet (source_completeness):
     1. Keine Konfiguration        -> Registerreihenfolge, unveraendert.
     2. Unbekannte id in der Konf. -> uebergangen, aber GEZAEHLT und gemeldet.
        Der Code sagt, welche Kacheln es gibt, nicht die gespeicherte Liste.
     3. Kachel im Code, aber NICHT in der Konfiguration -> sie bleibt SICHTBAR
        und haengt sich hinten an ihre Reihe. Eine neu gebaute Kachel darf nicht
        deshalb unsichtbar sein, weil ein aelteres Layout sie nicht kennt.
     4. aus:true blendet aus — das ist eine ENTSCHEIDUNG, kein Datenverlust.

   🔴 Beim Ausblenden einer nachladenden Kachel (abAkt · abRegion · abStammU)
   faellt nur der Container weg; _abBento2Laden prueft mit getElementById und
   schreibt dann nirgendwohin. Der RPC-Aufruf laeuft trotzdem — unnoetig, aber
   ungefaehrlich. Notiert statt hier mitgebaut (§29 R3), gehoert in E5.
   ========================================================================== */
var _AB_LAYOUT=null;

/* ============================================================================
   FREIE FLAECHE  ·  Work #42, Umbau  ·  15.08.2026
   ----------------------------------------------------------------------------
   🔴 RALPH, WOERTLICH: „ich wollte einen freien editor, z.b. wie powerpoint, in
   dem kann ich auch bilder schieben, vergroessern verkleinern und wenn ich
   will, uebereinander legen."

   Bis hierher war es ein RASTER: die Kacheln standen in zwei Reihen, und
   „anordnen" hiess nur, ihre Reihenfolge zu tauschen. Das war nicht der
   Auftrag, sondern die naechstliegende Umsetzung davon - mein Fehler.

   Ab jetzt ist es eine FLAECHE. Jede Kachel hat vier Zahlen und eine fuenfte:
     x, b  — waagerecht, in logischen Einheiten 0.._AB_LW (nicht in Pixeln,
             damit dieselbe Anordnung auf jedem Bildschirm gleich aussieht)
     y, h  — senkrecht, in Bildpunkten
     z     — was oben liegt, wenn sich zwei ueberlappen
   Ueberlappen ist ausdruecklich erlaubt, nicht ein Fehler, der verhindert wird.

   WAS DIESER UMBAU KOSTET, ehrlich gesagt: das alte Raster ordnete sich auf
   schmalen Bildschirmen selbst um (5 Spalten -> 2 -> 1). Eine frei gelegte
   Flaeche kann das nicht - sie skaliert stattdessen mit. Auf dem Telefon wird
   das Dashboard damit klein statt umgebrochen. Das Adminboard ist ein
   Schreibtischwerkzeug; wenn du es anders willst, ist das eine Entscheidung
   und kein Nachbessern.
   ========================================================================== */
var _AB_LW=1200;        /* logische Breite der Flaeche */
var _AB_RASTER=10;      /* Fangraster waagerecht, in logischen Einheiten */
var _AB_RASTERY=10;     /* Fangraster senkrecht, in Bildpunkten */
var _AB_MINB=140, _AB_MINH=90;
var _AB_HOEHE=270;   /* eine Hoehe fuer alle Kacheln (Ralph 15.08.) */   /* kleiner geht nicht - sonst ist nichts mehr lesbar */

function _abLayoutZahl(v){ var n=Number(v); return (v==null||v===''||isNaN(n))?null:n; }

/* Die Standardaufteilung: daraus bekommt jede Kachel ihre erste Lage, solange
   niemand sie verschoben hat. Sie ist HERGELEITET, nicht gespeichert - eine
   neue Kachel im Code bekommt so von selbst einen Platz statt bei 0,0 zu
   liegen und alles zu verdecken. */
function _abStandardLagen(){
  /* 🔴 15.08., Ralph: „und die kasten selbe höhe". Vorher waren Reihe 1 und 2
     unterschiedlich hoch (250/300) — das sah aus wie ein Versehen, weil die
     Kacheln nebeneinander unterschiedlich weit nach unten reichten. Jetzt
     EINE Hoehe fuer alle. Wer eine andere will, zieht sie im Anordnen-Modus. */
  var k={}, x=0, y=0, zeile=0;
  _AB_KACHELN.forEach(function(t){
    var b=t.breit?590:285, h=_AB_HOEHE;
    if(x+b>_AB_LW){ x=0; y+=zeile+20; zeile=0; }
    k[t.id]={x:x, y:y, b:b, h:h, z:1};
    x+=b+20; zeile=Math.max(zeile,h);
  });
  return k;
}

/* Die wirksame Lage einer Kachel: gespeichert, sonst hergeleitet. Einzelne
   fehlende Werte werden einzeln ergaenzt - eine halb gespeicherte Lage darf
   nicht die ganze Kachel auf 0,0 werfen. */
function _abLage(id, e, std){
  var s=(std||_abStandardLagen())[id]||{x:0,y:0,b:285,h:250,z:1};
  e=e||{};
  return {
    x:(e.x==null?s.x:e.x), y:(e.y==null?s.y:e.y),
    b:Math.max(_AB_MINB,(e.b==null?s.b:e.b)),
    h:Math.max(_AB_MINH,(e.h==null?s.h:e.h)),
    z:(e.z==null?s.z:e.z)
  };
}

/* Nimmt eine gespeicherte Anordnung an und gibt einen BERICHT zurueck, statt
   still zu schlucken, was nicht passt. Der Bericht ist der Beleg dafuer, dass
   Regel 2 und 3 gegriffen haben. */
function _abLayoutSetzen(cfg){
  var bericht={uebernommen:0, unbekannt:[], ergaenzt:[], eigene:0, name:''};
  var liste=(cfg&&cfg.kacheln)||[];
  if(!liste.length){ _AB_LAYOUT=null; return bericht; }
  var bekannt={};
  _AB_KACHELN.forEach(function(x){ bekannt[x.id]=true; });
  var rein=[], gesehen={};
  liste.forEach(function(e,i){
    if(!e||!e.id) return;
    /* Eine id, die der Code nicht kennt, ist nur dann Unrat, wenn sie auch
       keinen bekannten TYP traegt. Mit Typ ist es eine selbst angelegte
       Kachel - die MUSS durchkommen, sonst loescht das Laden sie weg. */
    var eigen=(!bekannt[e.id] && e.typ && _AB_TYPEN[e.typ]);
    if(!bekannt[e.id] && !eigen){ bericht.unbekannt.push(String(e.id)); return; }
    if(gesehen[e.id]) return;
    gesehen[e.id]=true;
    if(eigen) bericht.eigene++;
    rein.push({
      id:e.id,
      typ:(eigen?e.typ:null),
      titel:(eigen?(e.titel||_AB_TYPEN[e.typ].titel):null),
      reihe:(e.reihe==null?null:Number(e.reihe)),
      pos:(e.pos==null?i:Number(e.pos)),
      breit:(e.breit==null?null:!!e.breit),
      aus:!!e.aus,
      sperre:!!e.sperre,
      text:(typeof e.text==='string'?e.text:null),
      reihe_id:(e.reihe_id||null), quelle:(e.quelle||null), anzahl:_abLayoutZahl(e.anzahl),
      /* inhalt reist mit, auch wenn diese Fassung damit nichts anfangen kann —
         eine gespeicherte Auswahl darf nicht verlorengehen, nur weil sie
         gerade niemand liest. */
      inhalt:(Array.isArray(e.inhalt)?e.inhalt.slice():null),
      /* Freie Lage: x/breite in logischen Einheiten (0.._AB_LW), y/hoehe in
         Bildpunkten, z fuer „was liegt oben". Fehlt eine davon, rechnet
         _abLage() sie aus der Standardaufteilung aus — nie geraten, nur
         hergeleitet, und immer sichtbar (§3.4). */
      x:_abLayoutZahl(e.x), y:_abLayoutZahl(e.y), b:_abLayoutZahl(e.b), h:_abLayoutZahl(e.h), z:_abLayoutZahl(e.z)
    });
  });
  _AB_KACHELN.forEach(function(x){ if(!gesehen[x.id]) bericht.ergaenzt.push(x.id); });
  bericht.uebernommen=rein.length;
  bericht.name=(cfg&&cfg.name)||'';
  _AB_LAYOUT = rein.length ? {name:bericht.name, kacheln:rein} : null;
  return bericht;
}

/* ALLE sichtbaren Kacheln mit ihrer Lage, von hinten nach vorn sortiert.
   Das ist ab jetzt die EINE Liste, aus der gezeichnet wird - es gibt keine
   Reihen mehr, nur noch Lagen. */
function _abKachelFlaeche(){
  var std=_abStandardLagen(), konf={};
  if(_AB_LAYOUT) _AB_LAYOUT.kacheln.forEach(function(e){ konf[e.id]=e; });

  /* 🔴 20.08.2026, Work #121 Kriterium 2 — GEMESSENER FEHLER, nicht vermutet.
     Ein gespeichertes Layout ist immer AELTER als das Register. Kacheln, die
     nach dem Speichern dazukamen, hatten bis heute ihre Code-Standardlage —
     und die liegt auf einem Platz, den das gespeicherte Layout laengst anders
     vergeben hat. Gemessen am echten Layout „Standard 15.08." aus der Ablage
     (Work #44): `marke` lag genau auf `frei`. Zwei Kacheln uebereinander, und
     niemand haette den Grund gesehen.
     Ab jetzt bekommen ergaenzte Kacheln einen Platz UNTERHALB von allem
     Gespeicherten — dieselbe Regel, nach der _abKachelNeu eine neue Kachel
     ablegt. Ohne gespeichertes Layout aendert sich nichts: dann gelten die
     Standardlagen wie bisher. */
  var nachtrag={};
  if(_AB_LAYOUT){
    var unten=0;
    _AB_LAYOUT.kacheln.forEach(function(e){
      if(e.aus) return;
      var l=_abLage(e.id, e, std);
      unten=Math.max(unten, l.y+l.h);
    });
    var xLauf=0, zeileY=unten? unten+20 : 0, zeileH=0;
    _AB_KACHELN.forEach(function(x){
      if(konf[x.id]) return;                          /* steht im Layout */
      var s=std[x.id]||{b:285,h:250};
      var b=Math.max(_AB_MINB, s.b), h=Math.max(_AB_MINH, s.h);
      if(xLauf+b>_AB_LW){ xLauf=0; zeileY+=zeileH+20; zeileH=0; }
      nachtrag[x.id]={x:xLauf, y:zeileY, b:b, h:h, z:1};
      xLauf+=b+20; zeileH=Math.max(zeileH,h);
    });
  }

  var raus=[];
  _AB_KACHELN.forEach(function(x,i){
    var e=konf[x.id] || nachtrag[x.id];
    if(e&&e.aus) return;                              /* ausgeblendet */
    var lage=_abLage(x.id, e, std);
    var k=x;
    if(e&&e.inhalt) k={id:x.id,titel:x.titel,bau:x.bau,roh:x.roh,waehlbar:x.waehlbar,
                       reihe:x.reihe,breit:x.breit,inhalt:e.inhalt};
    raus.push({k:k, lage:lage, i:i});
  });
  /* Dazu die selbst angelegten. Sie stehen NUR im Layout, nicht im Code. */
  if(_AB_LAYOUT) _AB_LAYOUT.kacheln.forEach(function(e,j){
    if(!e.typ || e.aus) return;
    var t=_AB_TYPEN[e.typ]; if(!t) return;
    if(_AB_KACHELN.some(function(x){ return x.id===e.id; })) return;
    raus.push({
      k:{id:e.id, typ:e.typ, titel:e.titel||t.titel, bau:t.bau,
         waehlbar:t.waehlbar, inhalt:e.inhalt, text:e.text, eigen:true,
         /* 🔴 NICHT `reihe`: das Feld traegt bei den Code-Kacheln die Reihennummer
            aus dem alten Raster. Beide Bedeutungen auf einem Namen — der erste
            Testlauf hat genau das gemeldet (T15m), weil die gespeicherte Reihe
            beim Rundlauf verschwand. Zwei Bedeutungen, zwei Namen. */
         reihe_id:e.reihe_id, quelle:e.quelle, anzahl:e.anzahl},
      lage:_abLage(e.id, e, std), i:1000+j});
  });
  /* Kleines z zuerst zeichnen; bei Gleichstand entscheidet die Registerfolge,
     damit die Reihenfolge nie zufaellig ist. */
  raus.sort(function(a,b){ return (a.lage.z-b.lage.z)||(a.i-b.i); });
  return raus;
}




/* ============================================================================
   ANORDNEN-MODUS  ·  Work #42, Etappe 5  ·  15.08.2026
   ----------------------------------------------------------------------------
   Ralph bedient, die Wirkung gilt fuer alle Admins (Entscheid C). Hier steht
   die BEDIENUNG; die Ablage kommt aus Work #44 und wird in E4 angeschlossen.

   Bis dahin wirkt eine Aenderung nur in der offenen Sitzung. Das steht in der
   Leiste als Satz, nicht im Kleingedruckten — ein Editor, der so tut, als haette
   er gespeichert, ist schlimmer als einer ohne Speicherknopf.

   🔴 Ausblenden ist KEINE Sackgasse: ausgeblendete Kacheln stehen mit Namen in
   der Leiste und lassen sich einzeln zurueckholen. Sonst waere „aus" ein Knopf,
   den man nur einmal druecken kann — und die Kachel gilt als verloren.
   ========================================================================== */
var _AB_EDIT=false;
var _AB_VORHER=null;   /* Stand beim Betreten, fuer „Verwerfen" */
var _AB_VARIANTEN=[];  /* [{name,standard}] aus der Datenbank */
var _AB_VARNAME='';    /* Name der gerade geladenen Variante */
var _AB_GELADEN=false; /* Riegel: einmal holen, nicht bei jedem Neuzeichnen */
var _AB_MELDUNG='';    /* letzter Satz fuer die Leiste — Erfolg UND Fehler */
var _AB_MAUS=false;    /* Fenster-Zuhoerer genau einmal anmelden */
var _AB_BEWEGEN=null, _AB_LOS=null;

/* ============================================================================
   ABLAGE ANSCHLIESSEN  ·  Work #42, Etappe 4  ·  15.08.2026
   ----------------------------------------------------------------------------
   §22 hat sich zum vierten Mal ausgezahlt: die Serverseite war schon da.
   ChatGPT hatte zu Work #44 geliefert — Tabelle dashboard_layout_variant plus
   cb_admin_dashboard_layout_standard() · _varianten() · _speichern(). Es fehlte
   genau ein Weg: eine BENANNTE Variante lesen. Den hat Claude als exakte
   Schwester von _standard() ergaenzt (Migration dashboard_layout_variante_laden),
   Hinweis dazu steht in Work #44.

   Gespeichert wird immer als STANDARD — Ralphs Entscheid C: er bedient, und was
   er anpasst, sehen alle Admins. Eine Variante, die niemand sieht, waere ein
   viertes Layout an einem fuenften Ort.

   🔴 Faellt das Laden aus, bleibt die Codereihenfolge stehen und der Grund steht
   IN der Leiste. Ein Dashboard, das wegen einer fehlgeschlagenen Abfrage leer
   oder wahllos sortiert erscheint, waere schlimmer als eines ohne Ablage.
   ========================================================================== */
async function _abLayoutHolen(){
  if(_AB_GELADEN) return;
  _AB_GELADEN=true;                        /* vor dem await, sonst laufen zwei */
  try{
    var r=await client.rpc('cb_admin_dashboard_layout_standard');
    if(r.error) throw r.error;
    var cfg=r.data; if(typeof cfg==='string') cfg=JSON.parse(cfg);
    if(cfg&&cfg.kacheln&&cfg.kacheln.length){
      var b=_abLayoutSetzen(cfg);
      _AB_VARNAME=b.name||'';
      _AB_MELDUNG='Layout „'+(_AB_VARNAME||'ohne Namen')+'" geladen'
        +(b.unbekannt.length?' · '+b.unbekannt.length+' unbekannte übergangen ('+b.unbekannt.join(', ')+')':'')
        +(b.ergaenzt.length?' · '+b.ergaenzt.length+' neue hinten angehängt':'');
      _abNeuZeichnen();
    }
  }catch(e){
    _AB_MELDUNG='⚠ Gespeichertes Layout nicht ladbar — es gilt die Standardanordnung. '
      +esc((e&&e.message)||String(e));
    try{ console.warn('[Layout] laden:',e); }catch(_){}
  }
  _abVariantenHolen();
}

async function _abVariantenHolen(){
  try{
    var r=await client.rpc('cb_admin_dashboard_layout_varianten');
    if(r.error) throw r.error;
    var v=r.data; if(typeof v==='string') v=JSON.parse(v);
    _AB_VARIANTEN=(v&&v.rows)||[];
    if(_AB_EDIT) _abNeuZeichnen();
  }catch(e){ try{ console.warn('[Layout] Varianten:',e); }catch(_){} }
}

async function _abVarianteWaehlen(name){
  if(!name) return;
  try{
    var r=await client.rpc('cb_admin_dashboard_layout_laden',{p_name:name});
    if(r.error) throw r.error;
    var cfg=r.data; if(typeof cfg==='string') cfg=JSON.parse(cfg);
    if(!cfg){ _AB_MELDUNG='❌ Variante „'+name+'" gibt es nicht (mehr).'; }
    else{
      _abMerken();                       /* auch ein Variantenwechsel ist EIN Zug */
      var b=_abLayoutSetzen(cfg);
      _AB_VARNAME=b.name||name;
      _AB_MELDUNG='Variante „'+_AB_VARNAME+'" geladen — noch nicht gespeichert.';
    }
  }catch(e){ _AB_MELDUNG='❌ '+((e&&e.message)||String(e)); }
  _abNeuZeichnen();
}

async function _abLayoutSpeichern(){
  var el=document.getElementById('abVarName');
  var name=((el&&el.value)||'').trim()||_AB_VARNAME||'Standard';
  var kacheln=_abLayoutAktuell().kacheln;
  var knopf=document.querySelector('[data-abe="speichern"]');
  if(knopf){ knopf.disabled=true; knopf.textContent='… speichert'; }
  try{
    var r=await client.rpc('cb_admin_dashboard_layout_speichern',
      {p_name:name, p_kacheln:kacheln, p_als_standard:true});
    if(r.error) throw r.error;
    _AB_VARNAME=name;
    _AB_MELDUNG='✅ „'+name+'" gespeichert · '+kacheln.length+' Kacheln · gilt für alle Admins.';
  }catch(e){
    /* Kein Schein-Erfolg: der Fehler steht im Klartext da, wo gedrueckt wurde. */
    _AB_MELDUNG='❌ NICHT gespeichert: '+((e&&e.message)||String(e));
    try{ console.error('[Layout] speichern:',e); }catch(_){}
  }
  await _abVariantenHolen();
  _abNeuZeichnen();
}

function _abEditRahmen(x){
  var g=_abGesperrt(x.id);
  return {
    klasse:' bedit'+(_abGewaehlt(x.id)?' bwahl':'')+(g?' bfest':''),
    attr:'',
    vor:'<div class="abedit" data-zieh="'+esc(x.id)+'" title="Zum Verschieben hier anfassen">'
      +'<span class="abgriff">⠿</span>'
      +(x.eigen
         ? '<input class="abetitel" data-abtitel="'+esc(x.id)+'" value="'+esc(x.titel)+'" '
           +'title="Überschrift ändern">'
         : '<span class="abename">'+x.titel+'</span>')
      +'<span class="abesp">'
      +'<button type="button" class="abeb" data-abe="sperre" data-kid="'+esc(x.id)+'" '
        +'title="'+(g?'Kachel wieder freigeben':'Kachel festnageln, damit sie nicht verrutscht')+'">'
        +(g?'🔒':'🔓')+'</button>'
      +(x.eigen
         ? '<button type="button" class="abeb" data-abe="kopie" data-kid="'+esc(x.id)+'" '
           +'title="Kachel duplizieren">⧉</button>'
         : '')
      +'<button type="button" class="abeb" data-abe="vor" data-kid="'+esc(x.id)+'" '
        +'title="nach vorn holen">▲</button>'
      +'<button type="button" class="abeb" data-abe="zurueck" data-kid="'+esc(x.id)+'" '
        +'title="nach hinten legen">▼</button>'
      /* Zwei verschiedene Knoepfe, weil es zwei verschiedene Dinge sind. */
      +(x.eigen
         ? '<button type="button" class="abeb weg" data-abe="weg" data-kid="'+esc(x.id)+'" '
           +'title="Diese selbst angelegte Kachel löschen">🗑</button>'
         : '<button type="button" class="abeb" data-abe="aus" data-kid="'+esc(x.id)+'" '
           +'title="Ausblenden — die Kachel gehört zur App und bleibt oben abrufbar">✕</button>')
      +'</span></div>'
      +'<i class="abziehe" data-groesse="'+esc(x.id)+'" title="Größe ziehen"></i>'
  };
}

/* ============================================================================
   AUSWAHL, TASTATUR, DUPLIZIEREN, SPERREN  ·  Work #52, Stufe D3  ·  15.08.2026
   ----------------------------------------------------------------------------
   Vier Dinge in EINEM Durchgang, weil alle vier an derselben Sache haengen:
   an der Frage „welche Kachel ist gemeint". Getrennt gebaut waere es dreimal
   derselbe Umbau (§2.2).

     · Auswaehlen: Klick auf den Kachelkopf. Mit Umschalt kommt eine dazu.
     · Tastatur:   Pfeiltasten schieben die Auswahl, mit Umschalt fein.
     · Duplizieren: nur EIGENE Kacheln. Eine Code-Kachel zweimal zu zeigen
       hiesse, dieselbe Zahl an zwei Orten zu haben (§4.2) — das ist genau der
       Fehler, den dieses Projekt seit Wochen jagt.
     · Sperren: eine fertig gelegte Kachel laesst sich festnageln, damit sie
       beim Arbeiten an der Nachbarin nicht verrutscht.
   ========================================================================== */
var _AB_WAHL=[];

/* 🔴 Kennung fuer eine neue Kachel. Der Zaehler ist NICHT Zierde: die erste
   Fassung nahm nur Date.now(), und beim Duplizieren im selben Millisekundenwert
   bekam die Kopie DIESELBE Kennung wie das Original — der Doppelte-Filter warf
   sie sofort wieder weg. Sichtbar war nur „der Knopf tut nichts". Gefunden vom
   Ablauftest T13k, nicht beim Ausprobieren. */
var _AB_ID_ZAEHLER=0;
function _abNeueId(){ return 'k'+Date.now().toString(36)+'-'+(++_AB_ID_ZAEHLER); }

function _abWahlSetzen(id, dazu){
  if(!id){ _AB_WAHL=[]; return; }
  if(!dazu){ _AB_WAHL=[id]; return; }
  var i=_AB_WAHL.indexOf(id);
  if(i>=0) _AB_WAHL.splice(i,1); else _AB_WAHL.push(id);
}
function _abGewaehlt(id){ return _AB_WAHL.indexOf(id)>=0; }

/* Gesperrt heisst: nicht schieben, nicht ziehen, nicht mit den Pfeiltasten
   bewegen. Ausblenden und Loeschen bleiben moeglich — eine Sperre gegen das
   Verrutschen ist keine Sperre gegen das Aufraeumen. */
function _abGesperrt(id){
  if(!_AB_LAYOUT) return false;
  var e=_AB_LAYOUT.kacheln.filter(function(k){ return k.id===id; })[0];
  return !!(e&&e.sperre);
}
function _abSperreUm(id){
  _abEditAendern(function(l,find){ var e=find(id); if(e) e.sperre=!e.sperre; });
}

/* Die Auswahl um einen Betrag verschieben — ein Zug fuer ALLE ausgewaehlten,
   nicht einer je Kachel. Sonst braeuchte man fuenf Mal Rueckgaengig fuer
   einen Tastendruck. */
function _abWahlSchieben(dx, dy){
  var ids=_AB_WAHL.filter(function(id){ return !_abGesperrt(id); });
  if(!ids.length) return false;
  /* 🔴 Erst rechnen, dann aendern. Am Rand bewegt sich nichts mehr — dann darf
     auch kein Zug auf den Rueckgaengig-Stapel wandern. Sonst druecken zehn
     Tastendruecke am Rand zehn Schritte auf den Stapel, die alle nichts
     rueckgaengig machen, und der Nutzer haelt „zurueck" fuer kaputt. */
  var ziel={}, aendert=false;
  ids.forEach(function(id){
    var lage=_abLage(id, (_AB_LAYOUT&&_AB_LAYOUT.kacheln.filter(function(k){return k.id===id;})[0])||null);
    var nx=Math.max(0, Math.min(_AB_LW-lage.b, lage.x+dx));
    var ny=Math.max(0, lage.y+dy);
    ziel[id]={x:nx, y:ny};
    if(nx!==lage.x||ny!==lage.y) aendert=true;
  });
  if(!aendert) return false;
  _abEditAendern(function(l,find){
    ids.forEach(function(id){
      var e=find(id); if(!e||!ziel[id]) return;
      e.x=ziel[id].x; e.y=ziel[id].y;
    });
  });
  return true;
}

/* Duplizieren. Der Zwilling liegt leicht versetzt — genau uebereinander waere
   er unsichtbar, und man haelt den Knopf fuer kaputt. */
function _abDuplizieren(id){
  var q=_abKachelFlaeche().filter(function(e){ return e.k.id===id; })[0];
  if(!q){ return; }
  if(!q.k.eigen){
    _AB_MELDUNG='Nur selbst angelegte Kacheln lassen sich duplizieren — eine Kachel der App zweimal zu zeigen hieße, dieselbe Zahl an zwei Orten zu führen.';
    _abNeuZeichnen(); return;
  }
  _abMerken();
  var cfg=_abLayoutAktuell();
  var alt=cfg.kacheln.filter(function(e){ return e.id===id; })[0];
  var neu=_abTief(alt);
  neu.id=_abNeueId();
  neu.titel=(alt.titel||'Kachel')+' (Kopie)';
  neu.x=Math.min(_AB_LW-neu.b, neu.x+20); neu.y=neu.y+20;
  neu.sperre=false;
  cfg.kacheln.push(neu);
  _abLayoutSetzen(cfg);
  _abWahlSetzen(neu.id,false);
  _AB_MELDUNG='Kopie angelegt — noch nicht gespeichert.';
  _abNeuZeichnen();
}

/* Eine Lage aendern. Laeuft ueber dieselbe eine Spur wie alles andere. */
function _abLageSetzen(id, neu){
  if(_abGesperrt(id)) return;
  _abEditAendern(function(l,find){
    var e=find(id); if(!e) return;
    if(neu.x!=null) e.x=Math.max(0, Math.round(neu.x/_AB_RASTER)*_AB_RASTER);
    if(neu.y!=null) e.y=Math.max(0, Math.round(neu.y/_AB_RASTERY)*_AB_RASTERY);
    if(neu.b!=null) e.b=Math.max(_AB_MINB, Math.min(_AB_LW,
                       Math.round(neu.b/_AB_RASTER)*_AB_RASTER));
    if(neu.h!=null) e.h=Math.max(_AB_MINH, Math.round(neu.h/_AB_RASTERY)*_AB_RASTERY);
    if(neu.z!=null) e.z=neu.z;
  });
}

/* ============================================================================
   EINRASTEN AN NACHBARN  ·  Work #52, Stufe D2  ·  15.08.2026
   ----------------------------------------------------------------------------
   Bisher fing eine Kachel nur am 10er-Raster. Buendige Kanten entstanden damit
   nur zufaellig: zwei Kacheln konnten 10 Einheiten versetzt stehen und sahen
   schief aus, obwohl beide „im Raster" lagen.

   Jetzt sucht die gezogene Kachel waehrend der Bewegung nach Kanten der
   ANDEREN Kacheln und faengt daran. Gefangen wird an:
     · linker Kante, Mitte, rechter Kante   (waagerecht)
     · Oberkante, Mitte, Unterkante         (senkrecht)
     · den beiden Raendern der Flaeche
     · und an „Kante an Kante" — rechte Kante der einen auf linke der anderen,
       damit zwei Kacheln buendig nebeneinander sitzen statt mit 3 Einheiten Luft.

   Die gefundene Linie wird ANGEZEIGT. Ein Fang, den man nicht sieht, fuehlt
   sich wie ein Ruckeln an; erst die Linie macht daraus eine Hilfe.
   ========================================================================== */
var _AB_FANG=14;    /* logische Einheiten, in denen gefangen wird */
var _AB_FANGY=10;   /* Bildpunkte senkrecht */

/* Liefert die korrigierte Lage und die Linien, die dabei getroffen wurden.
   Reine Rechnung, kein DOM — deshalb pruefbar. */
function _abFangen(id, n, andere){
  andere=andere||_abKachelFlaeche().filter(function(e){ return e.k.id!==id; })
                                   .map(function(e){ return e.lage; });
  var xz=[0,_AB_LW], yz=[0];
  andere.forEach(function(g){
    xz.push(g.x, g.x+g.b/2, g.x+g.b);
    yz.push(g.y, g.y+g.h/2, g.y+g.h);
  });
  var lx=[], ly=[], erg={x:n.x, y:n.y, b:n.b, h:n.h};

  /* Waagerecht: die drei Kanten der bewegten Kachel gegen alle Ziele. */
  var kandidatenX=[{eigen:n.x, art:'l'}, {eigen:n.x+n.b/2, art:'m'}, {eigen:n.x+n.b, art:'r'}];
  var bestX=null;
  kandidatenX.forEach(function(k){
    xz.forEach(function(ziel){
      var d=Math.abs(k.eigen-ziel);
      if(d<=_AB_FANG && (!bestX || d<bestX.d)) bestX={d:d, ziel:ziel, art:k.art};
    });
  });
  if(bestX){
    erg.x = bestX.art==='l' ? bestX.ziel
          : bestX.art==='m' ? bestX.ziel-n.b/2
          : bestX.ziel-n.b;
    lx.push(bestX.ziel);
  }
  var kandidatenY=[{eigen:n.y, art:'o'}, {eigen:n.y+n.h/2, art:'m'}, {eigen:n.y+n.h, art:'u'}];
  var bestY=null;
  kandidatenY.forEach(function(k){
    yz.forEach(function(ziel){
      var d=Math.abs(k.eigen-ziel);
      if(d<=_AB_FANGY && (!bestY || d<bestY.d)) bestY={d:d, ziel:ziel, art:k.art};
    });
  });
  if(bestY){
    erg.y = bestY.art==='o' ? bestY.ziel
          : bestY.art==='m' ? bestY.ziel-n.h/2
          : bestY.ziel-n.h;
    ly.push(bestY.ziel);
  }
  erg.x=Math.max(0,erg.x); erg.y=Math.max(0,erg.y);
  return {x:erg.x, y:erg.y, b:erg.b, h:erg.h, linienX:lx, linienY:ly};
}

/* Dasselbe fuer das Ziehen an der Ecke: hier wandern nur rechte und untere
   Kante, die linke obere bleibt liegen. */
function _abFangenGroesse(id, n, andere){
  andere=andere||_abKachelFlaeche().filter(function(e){ return e.k.id!==id; })
                                   .map(function(e){ return e.lage; });
  var xz=[_AB_LW], yz=[];
  andere.forEach(function(g){ xz.push(g.x, g.x+g.b); yz.push(g.y, g.y+g.h); });
  var lx=[], ly=[], b=n.b, h=n.h, bd=null, hd=null;
  xz.forEach(function(ziel){
    var d=Math.abs((n.x+n.b)-ziel);
    if(d<=_AB_FANG && (bd===null||d<bd)){ bd=d; b=ziel-n.x; lx[0]=ziel; }
  });
  yz.forEach(function(ziel){
    var d=Math.abs((n.y+n.h)-ziel);
    if(d<=_AB_FANGY && (hd===null||d<hd)){ hd=d; h=ziel-n.y; ly[0]=ziel; }
  });
  return {x:n.x, y:n.y, b:Math.max(_AB_MINB,b), h:Math.max(_AB_MINH,h),
          linienX:lx.filter(function(v){return v!=null;}),
          linienY:ly.filter(function(v){return v!=null;})};
}

/* Neue Kachel. Sie landet UNTEN auf der Flaeche, nicht bei 0,0 - sonst
   verdeckt sie beim Anlegen alles und man haelt das Dashboard fuer kaputt. */
function _abKachelNeu(typ){
  typ=typ||'frei';
  var t=_AB_TYPEN[typ]; if(!t) return;
  var unten=0;
  _abKachelFlaeche().forEach(function(e){ unten=Math.max(unten, e.lage.y+e.lage.h); });
  _abMerken();
  var cfg=_abLayoutAktuell();
  cfg.kacheln.push({id:_abNeueId(), typ:typ, titel:t.titel, aus:false,
    x:0, y:unten+20, b:285, h:250, z:1,
    inhalt:(t.text?null:_AB_FREI_VORGABE.slice()),
    text:(t.text?'':null)});
  _abLayoutSetzen(cfg);
  _AB_MELDUNG='Neue Kachel unten auf der Fläche angelegt — noch NICHT gespeichert.';
  _abNeuZeichnen();
}

/* Loeschen gibt es NUR fuer selbst angelegte Kacheln. Eine Kachel aus dem Code
   kann man ausblenden; sie zu loeschen wuerde eine Funktion der App entfernen,
   und das entscheidet kein Layout. */
function _abKachelWeg(id){
  var eigen=_abKachelFlaeche().filter(function(e){ return e.k.id===id && e.k.eigen; })[0];
  if(!eigen){ _AB_MELDUNG='Diese Kachel gehört zur App und kann nur ausgeblendet werden (✕).';
    _abNeuZeichnen(); return; }
  var cfg=_abLayoutAktuell(), vorher=cfg.kacheln.length;
  cfg.kacheln=cfg.kacheln.filter(function(e){ return e.id!==id; });
  if(cfg.kacheln.length===vorher) return;
  _abMerken();
  _abLayoutSetzen(cfg);
  _AB_MELDUNG='Kachel gelöscht — noch nicht gespeichert. „Verwerfen" holt sie zurück.';
  _abNeuZeichnen();
}

function _abTitelSetzen(id, titel){
  titel=String(titel||'').trim();
  if(!titel) return;
  _abEditAendern(function(l,find){ var e=find(id); if(e&&e.typ) e.titel=titel; });
}

/* „nach vorn" heisst: eins ueber den hoechsten, der GERADE sichtbar ist.
   Nicht z+1 — sonst klettert eine Kachel nach zwei Klicks ueber alles,
   ohne dass man sieht, warum. */
function _abStapel(id, nachVorn){
  var l=_abKachelFlaeche();
  var werte=l.map(function(e){ return e.lage.z; });
  var hoch=Math.max.apply(null,[1].concat(werte));
  var tief=Math.min.apply(null,[1].concat(werte));
  _abLageSetzen(id, {z: nachVorn ? hoch+1 : tief-1});
}

/* Der aktuelle Zustand als Konfiguration — abgeleitet aus dem, was wirklich
   gezeichnet wird, nicht aus einer zweiten Buchfuehrung (§4.2). */
function _abLayoutAktuell(){
  var raus=[], drin={};
  _abKachelFlaeche().forEach(function(e,i){
    drin[e.k.id]=true;
    raus.push({id:e.k.id, reihe:e.k.reihe, pos:i, breit:!!e.k.breit, aus:false,
               typ:e.k.typ||null, titel:(e.k.eigen?e.k.titel:null),
               sperre:_abGesperrt(e.k.id), text:(e.k.text==null?null:e.k.text),
               reihe_id:(e.k.reihe_id||null), quelle:(e.k.quelle||null), anzahl:(e.k.anzahl||null),
               x:e.lage.x, y:e.lage.y, b:e.lage.b, h:e.lage.h, z:e.lage.z,
               inhalt:(e.k.inhalt&&e.k.inhalt.length)?e.k.inhalt.slice():null});
  });
  /* Ausgeblendete gehen NICHT verloren — sie behalten Reihe und Breite. */
  if(_AB_LAYOUT) _AB_LAYOUT.kacheln.forEach(function(e){
    if(drin[e.id]) return;
    var reg=_AB_KACHELN.filter(function(k){ return k.id===e.id; })[0];
    raus.push({id:e.id, reihe:(e.reihe==null?(reg?reg.reihe:1):e.reihe),
               pos:(e.pos==null?999:e.pos),
               breit:(e.breit==null?!!(reg&&reg.breit):e.breit), aus:true,
               typ:e.typ||null, titel:e.titel||null,
               sperre:!!e.sperre, text:(e.text==null?null:e.text),
               reihe_id:(e.reihe_id||null), quelle:(e.quelle||null), anzahl:(e.anzahl||null),
               x:e.x, y:e.y, b:e.b, h:e.h, z:e.z,
               inhalt:(e.inhalt&&e.inhalt.length)?e.inhalt.slice():null});
  });
  return {name:(_AB_LAYOUT&&_AB_LAYOUT.name)||'', kacheln:raus};
}

function _abAusgeblendet(){
  if(!_AB_LAYOUT) return [];
  return _AB_LAYOUT.kacheln.filter(function(e){ return e.aus; }).map(function(e){
    var reg=_AB_KACHELN.filter(function(k){ return k.id===e.id; })[0];
    return {id:e.id, titel:(reg?reg.titel:e.id)};
  });
}

function _abEditLeiste(){
  /* Eine WARNUNG darf nicht im Anordnen-Modus versteckt sein: wer die Leiste nie
     oeffnet, saehe sonst nie, dass sein gespeichertes Layout nicht geladen
     werden konnte (§1.7 keine stillen Fehler). */
  if(!_AB_EDIT){
    return (_AB_MELDUNG && /^[⚠❌]/.test(_AB_MELDUNG))
      ? '<div class="abeleiste" style="background:#fdf1f1;border-color:#f2cfcf">'+_AB_MELDUNG+'</div>'
      : '';
  }
  var weg=_abAusgeblendet();
  return '<div class="abeleiste">'
    +'<b>🧩 Anordnen</b>'
    +'<span style="color:'+_AB.mut+'">Kacheln ziehen · Breite umschalten · ausblenden. '
      +'<b>Gilt nur in dieser Sitzung</b> — die Ablage für alle Admins folgt (#44).</span>'
    +(weg.length
       ? '<span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
         +'<span style="color:'+_AB.mut+'">ausgeblendet:</span>'
         + weg.map(function(w){
             return '<button type="button" class="abeb hin" data-abe="ein" data-kid="'
               +esc(w.id)+'" title="wieder einblenden">+ '+w.titel+'</button>'; }).join('')
         +'</span>'
       : '')
    +(_AB_VARIANTEN.length>1
       ? '<select id="abVarWahl" class="abeb" title="gespeicherte Variante laden">'
         +'<option value="">– Variante laden –</option>'
         + _AB_VARIANTEN.map(function(v){
             return '<option value="'+esc(v.name)+'"'+(v.name===_AB_VARNAME?' selected':'')+'>'
               +esc(v.name)+(v.standard?' ★':'')+'</option>'; }).join('')
         +'</select>'
       : '')
    +'<input id="abVarName" class="abeb" style="font-weight:600;min-width:150px" '
      +'value="'+esc(_AB_VARNAME||'Standard')+'" '
      +'title="Name, unter dem gespeichert wird" placeholder="Name des Layouts">'
    +'<span class="abesp" style="margin-left:0">'
    +'<button type="button" class="abeb" data-abe="zurueck1"'
      +(_AB_ZURUECK.length?'':' disabled')
      +' title="Rückgängig (Strg+Z)">↶ zurück'
      +(_AB_ZURUECK.length?' <b>'+_AB_ZURUECK.length+'</b>':'')+'</button>'
    +'<button type="button" class="abeb" data-abe="vor1"'
      +(_AB_VOR.length?'':' disabled')
      +' title="Wiederherstellen (Strg+Umschalt+Z)">↷ vor'
      +(_AB_VOR.length?' <b>'+_AB_VOR.length+'</b>':'')+'</button>'
    +'</span>'
    +'<button type="button" class="abeb hin" data-abe="neu" data-typ="frei" '
      +'title="Kachel mit Zahlen anlegen — erscheint unten auf der Fläche">+ Zahlen</button>'
    +'<button type="button" class="abeb hin" data-abe="neu" data-typ="notiz" '
      +'title="Notizzettel anlegen — dein Text, mit dem Layout gespeichert">+ Notiz</button>'
    +'<button type="button" class="abeb hin" data-abe="neu" data-typ="verlauf" '
      +'title="Verlauf über Tage — zurzeit gibt es eine Reihe: Riki-Verbrauch">+ Verlauf</button>'
    +'<button type="button" class="abeb hin" data-abe="neu" data-typ="liste" '
      +'title="Liste aus einer vorhandenen Quelle: offene Aufgaben oder meldende Wächter">+ Liste</button>'
    +'<button type="button" class="abeb hin" data-abe="neu" data-typ="bild" '
      +'title="Bild über eine Adresse — Hochladen geht noch nicht">+ Bild</button>'
    +'<span class="abesp">'
    +'<button type="button" class="abeb" data-abe="standard" '
      +'title="Zurück auf die im Code hinterlegte Anordnung — noch nicht gespeichert">↺ Standard</button>'
    +'<button type="button" class="abeb" data-abe="verwerfen">Verwerfen</button>'
    +'<button type="button" class="abeb hin" data-abe="speichern" '
      +'title="Speichert als Standard — gilt sofort für alle Admins">💾 Speichern</button>'
    +'<button type="button" class="abeb" data-abe="fertig">✓ Fertig</button>'
    +'</span>'
    +(_AB_MELDUNG?'<div style="flex-basis:100%;font-size:11.5px;color:'+_AB.mut+'">'
       +_AB_MELDUNG+'</div>':'')
    +'</div>';
}

/* ============================================================================
   RUECKGAENGIG  ·  Work #52, Stufe D1  ·  15.08.2026
   ----------------------------------------------------------------------------
   Bis hierher gab es nur „Verwerfen" — alles oder nichts. Ein falsch gezogener
   Rahmen war damit nur zu beheben, indem man die ganze Sitzung wegwarf. Wer so
   arbeitet, probiert nichts aus, und genau das Ausprobieren ist der Sinn eines
   Editors.

   WIE ES FUNKTIONIERT, in einem Satz: vor jeder Aenderung wird der ganze
   Zustand als Kopie auf einen Stapel gelegt; „Rueckgaengig" nimmt die oberste
   Kopie zurueck und legt den aktuellen Stand auf den Gegenstapel.

   🔴 EIN ZUG PRO HANDGRIFF, nicht pro Bildpunkt. Beim Schieben wird die Lage
   erst beim LOSLASSEN eingetragen — sonst laegen nach einem Zug 200 Schritte
   auf dem Stapel und „Rueckgaengig" bewegte die Kachel um einen Pixel.

   NICHT gemerkt wird das erste Laden aus der Datenbank: sonst koennte man
   „hinter" den Ausgangszustand zurueckgehen, und das Dashboard stuende ohne
   das gespeicherte Layout da, das es gerade geholt hat.
   ========================================================================== */
var _AB_ZURUECK=[], _AB_VOR=[];
var _AB_STAPEL_MAX=40;   /* mehr braucht niemand, und der Speicher bleibt endlich */

function _abTief(x){ return x?JSON.parse(JSON.stringify(x)):null; }

/* Vor einer Aenderung aufrufen. Der Gegenstapel wird geleert: wer nach einem
   Rueckgaengig etwas Neues tut, hat den alten Weg verlassen. */
function _abMerken(){
  _AB_ZURUECK.push(_abTief(_abLayoutAktuell()));
  if(_AB_ZURUECK.length>_AB_STAPEL_MAX) _AB_ZURUECK.shift();
  _AB_VOR.length=0;
}

/* Modus umschalten. Steht als FUNKTION hier und nicht im Klick-Handler, weil
   an ihm zwei Dinge haengen, die man sonst nur durch Klicken pruefen koennte:
   der Verwerfen-Bezugspunkt und das Leeren der Stapel. Beim ersten Testlauf
   lagen deshalb 12 fremde Zuege auf dem Stapel — der Test hat den Bau
   korrigiert, nicht umgekehrt. */
function _abEditModus(an){
  an=!!an;
  if(an && !_AB_EDIT){
    _AB_VORHER=_abTief(_AB_LAYOUT);
    /* Der Stapel gehoert der Bearbeitung, nicht der Seite. Beim Oeffnen leer:
       sonst koennte man hinter den Zustand zurueckgehen, mit dem man angefangen
       hat, und „Verwerfen" und „Rueckgaengig" wuerden sich widersprechen. */
    _AB_ZURUECK.length=0; _AB_VOR.length=0; _AB_MELDUNG='';
  }
  _AB_EDIT=an;
  return _AB_EDIT;
}

function _abZurueck(){
  if(!_AB_ZURUECK.length){ _AB_MELDUNG='Nichts mehr rückgängig zu machen.'; _abNeuZeichnen(); return; }
  _AB_VOR.push(_abTief(_abLayoutAktuell()));
  _abLayoutSetzen(_AB_ZURUECK.pop());
  _AB_MELDUNG='Rückgängig — noch '+_AB_ZURUECK.length+' Schritt(e) zurück möglich.';
  _abNeuZeichnen();
}

function _abVor(){
  if(!_AB_VOR.length){ _AB_MELDUNG='Nichts zum Wiederherstellen.'; _abNeuZeichnen(); return; }
  _AB_ZURUECK.push(_abTief(_abLayoutAktuell()));
  _abLayoutSetzen(_AB_VOR.pop());
  _AB_MELDUNG='Wiederhergestellt.';
  _abNeuZeichnen();
}

/* Ein ganzer Layoutwechsel (Standard, Verwerfen, andere Variante) ist EIN Zug —
   auch er muss sich zurueckholen lassen, sonst ist ein Fehlgriff auf „Standard"
   genauso teuer wie vorher die ganze Sitzung. */
function _abLayoutWechsel(cfg, satz){
  _abMerken();
  _abLayoutSetzen(cfg);
  if(satz) _AB_MELDUNG=satz;
  _abNeuZeichnen();
}

/* Eine Aenderung, ein Weg: alles laeuft ueber _abLayoutSetzen und zeichnet neu. */
function _abEditAendern(fn){
  _abMerken();
  var cfg=_abLayoutAktuell();
  fn(cfg.kacheln, function(id){
    for(var i=0;i<cfg.kacheln.length;i++) if(cfg.kacheln[i].id===id) return cfg.kacheln[i];
    return null;
  });
  cfg.kacheln.forEach(function(e,i){ if(e.pos==null) e.pos=i; });
  _abLayoutSetzen(cfg);
  _abNeuZeichnen();
}

/* 15.08. ENTFERNT beim Umbau auf die freie Flaeche: _abKachelListe,
   _abReihe und _abEditVerschieben waren der RASTER-Zeichner (zwei Reihen,
   Plaetze tauschen). Sie hatten nach dem Umbau keinen Aufrufer mehr. Stehen
   lassen hiesse zwei Anordnungslogiken im selben Code (§4.2) - genau der
   Fehler, gegen den die Regel geschrieben ist.
   RUECKHOLBAR: der letzte Stand MIT diesen drei Funktionen ist Build
   2026-08-15-3040 und liegt im ausgelieferten Repo (git). Es wurde KEINE
   zusaetzliche Sicherungsdatei angelegt — das hier ist die Fundstelle. */

/* ============================================================================
   BEFEHLSZEILE · C4 · 15.08.2026, Work #63
   ----------------------------------------------------------------------------
   Ralph zum ersten Entwurf: „das einzige coole von dir ist der cursor, der ist
   aber ohne funktion." Hier hat er eine.

   🔴 SIE SPRINGT UEBER adminGo — den EINEN Weg in einen Adminbereich, den es
   schon gibt (§4.2, §22). Keine zweite Sprungtabelle: waere hier eine, wuerde
   sie beim naechsten neuen Bereich vergessen und zeigte ins Leere.
   Die Zahlen daneben kommen aus denselben Daten, die das Dashboard ohnehin
   geladen hat — keine zusaetzliche Abfrage.
   ========================================================================== */
function _abBefehle(d,np,A){
  var k=(d&&d.katalog)||{}, ex=(np&&np.extra)||{};
  var z=function(v){ return (v==null?'—':String(v)); };
  return [
    {b:'produkte',       t:'Produktliste — alle aktiven',          z:z(k.aktiv),      go:'produkte'},
    {b:'erfassen',       t:'Neues Produkt erfassen',               z:'—',             go:'produkterfassung'},
    {b:'zu verifizieren',t:'Posteingang: Entwürfe, Scans, Audit',  z:z(A&&A.wartend), go:'zuverif'},
    {b:'scan',           t:'Scan-Eingang',                         z:'—',             go:'scans'},
    {b:'stamm',          t:'Zutatenstamm — neu und alt',           z:z(ex.zutaten),   go:'stamm'},
    {b:'rezepte',        t:'Rezepte',                              z:z(ex.rezepte),   go:'rezepte'},
    {b:'regelwerk',      t:'Bewertungsregeln',                     z:'—',             go:'regelwerk'},
    {b:'empfehlungen',   t:'Empfehlungen',                         z:'—',             go:'empfehlungen'},
    {b:'dashboard',      t:'Zurück zur Übersicht',                 z:'—',             go:'dash'},
    {b:'anordnen',       t:'Kacheln schieben, Größe, anlegen',     z:'—',             go:'#anordnen'},
    {b:'aktualisieren',  t:'Zahlen neu holen',                     z:'—',             go:'#neu'}
  ];
}

function _abCmdHtml(){
  return '<div class="abcmd" id="abCmd">'
    +'<div class="abcmdz">'
      +'<span class="abcmdpf">root-index /</span>'
      +'<input id="abCmdIn" autocomplete="off" spellcheck="false" '
        +'placeholder="Bereich oder Befehl tippen …">'
      +'<span class="abcmdcur"></span>'
      +'<span class="abcmdkb">↑↓</span><span class="abcmdkb">⏎</span><span class="abcmdkb">⌘K</span>'
    +'</div>'
    +'<div class="abcmdl" id="abCmdListe"></div>'
  +'</div>';
}

var _AB_CMD_SEL=0;
function _abCmdNach(box){
  var cmd=document.getElementById('abCmd'), inp=document.getElementById('abCmdIn'),
      liste=document.getElementById('abCmdListe');
  if(!cmd||!inp||!liste) return;
  var alle=_abBefehle(_abD,_abNp,(_abNp&&typeof _abAbl==='function')?_abAbl(_abNp):null);
  var treffer=function(){
    var q=inp.value.trim().toLowerCase();
    if(!q) return alle.slice(0,6);
    return alle.filter(function(x){
      return x.b.indexOf(q)>=0 || x.t.toLowerCase().indexOf(q)>=0; });
  };
  var male=function(){
    var t=treffer();
    if(_AB_CMD_SEL>=t.length) _AB_CMD_SEL=Math.max(0,t.length-1);
    liste.innerHTML = t.length
      ? t.map(function(x,i){
          return '<div class="abcmdv'+(i===_AB_CMD_SEL?' sel':'')+'" data-go="'+esc(x.go)+'">'
            +'<span class="b">'+esc(x.b)+'</span><span class="t">'+esc(x.t)+'</span>'
            +'<span class="z">'+esc(x.z)+'</span></div>'; }).join('')
      : '<div class="abcmdv"><span class="t">Kein Befehl dazu — bekannt sind: '
        +esc(alle.map(function(x){ return x.b; }).join(', '))+'</span></div>';
    liste.querySelectorAll('.abcmdv[data-go]').forEach(function(e){
      e.onmousedown=function(ev){ ev.preventDefault(); fuehre(e.getAttribute('data-go')); };
    });
  };
  var fuehre=function(go){
    inp.value=''; _AB_CMD_SEL=0; cmd.classList.remove('auf'); inp.blur();
    try{
      if(go==='#anordnen'){ var an=document.getElementById('abAnordnen'); if(an) an.click(); return; }
      if(go==='#neu'){ var n=document.getElementById('abNeu'); if(n) n.click(); return; }
      /* Der EINE Weg in einen Adminbereich. Keine zweite Sprungtabelle. */
      if(typeof adminGo==='function') adminGo(go);
    }catch(e){ try{ console.warn('[Befehlszeile]',go,e); }catch(_){} }
  };
  inp.addEventListener('focus',function(){ cmd.classList.add('auf'); male(); });
  inp.addEventListener('blur', function(){ setTimeout(function(){ cmd.classList.remove('auf'); },130); });
  inp.addEventListener('input',function(){ _AB_CMD_SEL=0; male(); });
  inp.addEventListener('keydown',function(ev){
    var t=treffer();
    if(ev.key==='ArrowDown'){ ev.preventDefault(); _AB_CMD_SEL=Math.min(t.length-1,_AB_CMD_SEL+1); male(); }
    else if(ev.key==='ArrowUp'){ ev.preventDefault(); _AB_CMD_SEL=Math.max(0,_AB_CMD_SEL-1); male(); }
    else if(ev.key==='Enter'){ ev.preventDefault(); if(t[_AB_CMD_SEL]) fuehre(t[_AB_CMD_SEL].go); }
    else if(ev.key==='Escape'){ inp.value=''; inp.blur(); }
  });
  /* ⌘K bzw. Strg+K einmal am Fenster — nicht bei jedem Neuzeichnen neu. */
  if(!window._abCmdTaste){
    window._abCmdTaste=true;
    window.addEventListener('keydown',function(ev){
      if(!(ev.metaKey||ev.ctrlKey)) return;
      if(String(ev.key).toLowerCase()!=='k') return;
      var i=document.getElementById('abCmdIn'); if(!i) return;
      ev.preventDefault(); i.focus();
    });
  }
  male();
}

var _AB_PROJEKT_TIMER=null;
var _AB_BERLIN_FORMAT=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});

function _abBerlinTeile(wert){
  var o={};
  _AB_BERLIN_FORMAT.formatToParts(new Date(wert)).forEach(function(x){
    if(x.type!=='literal') o[x.type]=Number(x.value);
  });
  return {jahr:o.year,monat:o.month,tag:o.day,stunde:o.hour,minute:o.minute,sekunde:o.second};
}

function _abBerlinZeitpunkt(jahr,monat,tag,stunde,minute,sekunde){
  var soll=Date.UTC(jahr,monat-1,tag,stunde,minute,sekunde), utc=soll;
  for(var i=0;i<3;i++){
    var p=_abBerlinTeile(utc);
    utc+=soll-Date.UTC(p.jahr,p.monat-1,p.tag,p.stunde,p.minute,p.sekunde);
  }
  return new Date(utc);
}

function _abProjektzeitWerte(jetzt){
  var nun=jetzt==null?new Date():new Date(jetzt);
  var ziel=_abBerlinZeitpunkt(2026,10,1,0,0,0);
  var rest=ziel-nun, countdown='LIVE';
  if(rest>0){
    var gesamtMinuten=Math.ceil(rest/60000);
    var tage=Math.floor(gesamtMinuten/1440);
    var stunden=Math.floor((gesamtMinuten%1440)/60);
    var minuten=gesamtMinuten%60;
    countdown=tage+' Tage · '+stunden+' Std · '+minuten+' Min';
  }
  var heute=_abBerlinTeile(nun);
  var projekttage=Math.max(0,Math.round(
    (Date.UTC(heute.jahr,heute.monat-1,heute.tag)-Date.UTC(2026,5,25))/86400000
  ));
  return {countdown:countdown,projekttage:projekttage,
    projektText:projekttage+' '+(projekttage===1?'Tag':'Tage')};
}

function _abProjektzeitHtml(){
  var z=_abProjektzeitWerte();
  return '<div class="abprojektzeit" aria-label="Projektzeit">'
    +'<div class="abpk go"><span class="abl">GO-LIVE</span><strong id="abGoLive">'
      +z.countdown+'</strong><small>01.10.2026 · 00:00 Berlin</small></div>'
    +'<div class="abpk"><span class="abl">PROJEKT</span><strong id="abProjektTage">'
      +z.projektText+'</strong><small>seit 25.06.2026</small></div>'
    +'</div>';
}

function _abProjektzeitRender(jetzt){
  var z=_abProjektzeitWerte(jetzt);
  var go=document.getElementById('abGoLive'); if(go) go.textContent=z.countdown;
  var pr=document.getElementById('abProjektTage'); if(pr) pr.textContent=z.projektText;
  return z;
}

function _abProjektzeitStart(){
  _abProjektzeitRender();
  if(_AB_PROJEKT_TIMER!==null) return;
  _AB_PROJEKT_TIMER=setInterval(function(){
    if(!document.getElementById('abGoLive')){
      clearInterval(_AB_PROJEKT_TIMER); _AB_PROJEKT_TIMER=null; return;
    }
    _abProjektzeitRender();
  },60000);
}

/* ============================================================================
   MEILENSTEIN-ZEITLEISTE BIS GO-LIVE · C5 · 15.08.2026, Work #63
   ----------------------------------------------------------------------------
   Ralph-Entscheid: „energie strom weg" — der Ereignisstrom faellt weg. Statt
   der letzten Stunde zeigt die Leiste den WEG BIS GO-LIVE am 01.10.2026.

   🔴 EINE WAHRHEIT, ZWEI ANZEIGEN. Ein Meilenstein traegt hoechstens einen
   Verweis auf einen Wirkdiagramm-Knoten und einen auf ein Work Item. Der
   Fortschritt wird NICHT hier gepflegt — er steht dort. Wer ihn hier zusaetzlich
   fuehrt, hat zwei Listen, die auseinanderlaufen (§4.2, §28.4).

   Die Lage auf der Leiste ergibt sich aus dem DATUM, nicht aus einer gepflegten
   Position. Verschiebt Ralph ein Datum, wandert der Punkt mit.
   ========================================================================== */
var _AB_MEILEN=[], _AB_ZIEL='2026-10-01', _AB_MEILEN_EDIT=false;

function _abTag(d){ var t=new Date(d); return isNaN(t)?null:t; }
function _abDatDe(d){
  var t=_abTag(d); if(!t) return '—';
  return String(t.getDate()).padStart(2,'0')+'.'+String(t.getMonth()+1).padStart(2,'0')+'.';
}

function _abZeitHtml(){
  var ziel=_abTag(_AB_ZIEL)||new Date();
  var heute=new Date();
  /* Der Anfang der Leiste: der frueheste Meilenstein oder heute — je nachdem,
     was frueher ist. Sonst stuende ein ueberfaelliger Punkt ausserhalb. */
  var start=heute;
  _AB_MEILEN.forEach(function(m){ var t=_abTag(m.faellig); if(t&&t<start) start=t; });
  start=new Date(start.getFullYear(),start.getMonth(),1);
  var spanne=Math.max(1, ziel-start);
  var pos=function(d){ var t=_abTag(d); if(!t) return 0;
    return Math.max(0,Math.min(100, (t-start)/spanne*100)); };

  /* Monatsabschnitte */
  var monate='', m=new Date(start), i=0;
  while(m<=ziel && i<14){
    var naechster=new Date(m.getFullYear(),m.getMonth()+1,1);
    var a=pos(m), b=Math.min(100,pos(naechster>ziel?ziel:naechster));
    monate+='<div class="abzm" style="left:'+a.toFixed(2)+'%;width:'+(b-a).toFixed(2)+'%">'
      +'<span>'+m.toLocaleDateString('de-DE',{month:'short',year:'2-digit'}).toUpperCase()+'</span></div>';
    m=naechster; i++;
  }

  var offen=_AB_MEILEN.filter(function(x){ return !x.erledigt; }).length;
  var tage=Math.ceil((ziel-heute)/86400000);

  var punkte=_AB_MEILEN.map(function(x,n){
    var p=pos(x.faellig), spaet=(!x.erledigt && _abTag(x.faellig) && _abTag(x.faellig)<heute);
    return '<div class="abzp'+(x.erledigt?' ok':'')+(spaet?' spaet':'')
      +'" style="left:'+p.toFixed(2)+'%;top:'+(18+(n%3)*29)+'px" data-mid="'+x.id+'" '
      +'title="'+esc(x.titel)+' · '+_abDatDe(x.faellig)+(x.notiz?' — '+esc(x.notiz):'')+'">'
      +'<i></i><span>'+esc(x.titel)+'</span>'
      +(x.node_key?'<em>'+esc(x.node_key)+'</em>':'')
      +(x.work_id?'<em>#'+x.work_id+'</em>':'')
      +'</div>';
  }).join('');

  return '<div class="abzeit'+(_AB_MEILEN_EDIT?' bearb':'')+'" id="abZeit">'
    +'<div class="abzk">'
      +'<b>Weg bis Go-Live</b>'
      +'<span class="abzz">'+(tage>0?tage+' Tage':'Ziel erreicht')+' · '+offen+' offen</span>'
      +'<span class="abzsp">'
        +'<button type="button" class="abeb" data-mz="neu">+ Meilenstein</button>'
        +'<button type="button" class="abeb'+(_AB_MEILEN_EDIT?' hin':'')+'" data-mz="edit">'
          +(_AB_MEILEN_EDIT?'✓ fertig':'✎ bearbeiten')+'</button>'
      +'</span>'
    +'</div>'
    +'<div class="abzb">'
      + monate
      + _abZeitWolken(start, heute, pos)
      +'<div class="abzl"></div>'
      +'<div class="abzheute" style="left:'+pos(heute).toFixed(2)+'%"><span>HEUTE</span></div>'
      +'<div class="abzziel"><span>GO LIVE<br>'+_abDatDe(_AB_ZIEL)+'</span></div>'
      + punkte
    +'</div>'
  +'</div>';
}

/* Punktwolken in den vergangenen Abschnitten — wie in der Vorlage.
   🔴 SIE ZEIGEN KEINE DATEN und tun auch nicht so: keine Beschriftung, keine
   Zahl, sehr blass. Sie sind Struktur, damit die vergangenen Wochen nicht
   leer wirken. Punkte, die nach Daten AUSSEHEN, aber keine sind, waeren
   genau die Attrappe, gegen die dieses Projekt anschreibt. */
function _abZeitWolken(start, heute, pos){
  var a=pos(start), b=pos(heute);
  if(b-a<3) return '';
  var h='<div class="abzwolke" style="position:absolute;left:'+a.toFixed(2)+'%;width:'
    +(b-a).toFixed(2)+'%;top:0;bottom:0;pointer-events:none">';
  /* Feste Verteilung statt Zufall: sonst tanzen die Punkte bei jedem
     Neuzeichnen und man haelt es fuer Bewegung in den Daten. */
  var n=Math.min(90, Math.round((b-a)*2.2));
  for(var i=0;i<n;i++){
    var x=((i*37)%100), y=18+((i*53)%70);
    h+='<i style="left:'+x+'%;top:'+y+'%"></i>';
  }
  return h+'</div>';
}

async function _abZeitLaden(){
  try{
    var r=await client.rpc('cb_admin_meilensteine');
    if(r.error) throw r.error;
    var j=r.data; if(typeof j==='string') j=JSON.parse(j);
    _AB_MEILEN=(j&&j.rows)||[];
    if(j&&j.ziel) _AB_ZIEL=j.ziel;
  }catch(e){
    _AB_MEILEN=[];
    try{ console.warn('[Meilensteine]',e); }catch(_){}
  }
  var b=document.getElementById('abZeitBox');
  if(b){ b.innerHTML=_abZeitHtml(); _abZeitNach(b); }
}

function _abZeitNach(box){
  box.querySelectorAll('[data-mz]').forEach(function(b){
    b.addEventListener('click',function(){
      var w=b.getAttribute('data-mz');
      if(w==='edit'){ _AB_MEILEN_EDIT=!_AB_MEILEN_EDIT;
        box.innerHTML=_abZeitHtml(); _abZeitNach(box); return; }
      if(w==='neu'){
        var t=window.prompt('Was ist der Meilenstein?'); if(!t) return;
        var d=window.prompt('Bis wann? (TT.MM.JJJJ)','30.09.2026'); if(!d) return;
        var m=String(d).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if(!m){ alert('Datum bitte als TT.MM.JJJJ'); return; }
        _abMeilenSetzen(null,{titel:t,
          faellig:m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0')});
      }
    });
  });
  /* Ein Klick auf einen Punkt hakt ihn ab — aber NUR im Bearbeiten-Modus.
     Sonst wuerde ein Fehlklick beim Lesen den Plan aendern. */
  box.querySelectorAll('.abzp[data-mid]').forEach(function(e){
    e.addEventListener('click',function(){
      if(!_AB_MEILEN_EDIT) return;
      var id=Number(e.getAttribute('data-mid'));
      var m=_AB_MEILEN.filter(function(x){ return Number(x.id)===id; })[0];
      if(!m) return;
      _abMeilenSetzen(id,{erledigt:!m.erledigt});
    });
  });
}

async function _abMeilenSetzen(id, feld){
  try{
    var r=await client.rpc('cb_admin_meilenstein_setzen',{
      p_id:id, p_titel:(feld.titel==null?null:feld.titel),
      p_faellig:(feld.faellig==null?null:feld.faellig),
      p_node_key:null, p_work_id:null,
      p_erledigt:(feld.erledigt==null?null:feld.erledigt),
      p_notiz:null, p_sortierung:null});
    if(r.error) throw r.error;
  }catch(e){
    try{ console.error('[Meilenstein] speichern:',e); }catch(_){}
    alert('Nicht gespeichert: '+((e&&e.message)||e));
  }
  await _abZeitLaden();
}

/* Hilfslinien zeichnen. Sie liegen IN der Flaeche und verschwinden mit dem
   Loslassen — sie sind Werkzeug, nicht Inhalt, und stehen deshalb in keiner
   Konfiguration. */
function _abHilfslinien(xs, ys){
  var f=document.getElementById('abFlaeche'); if(!f) return;
  f.querySelectorAll('.abhilf').forEach(function(e){ e.remove(); });
  (xs||[]).forEach(function(v){
    var i=document.createElement('i'); i.className='abhilf x';
    i.style.left=(v/_AB_LW*100)+'%'; f.appendChild(i);
  });
  (ys||[]).forEach(function(v){
    var i=document.createElement('i'); i.className='abhilf y';
    i.style.top=v+'px'; f.appendChild(i);
  });
}

/* Verdrahtung ALLES, was in den Bento-Reihen haengt. Wird beim Erstaufbau und
   nach jedem Neuzeichnen im Anordnen-Modus gerufen — dieselbe Fassung, nicht
   zwei (§4.2). innerHTML wirft die Handler weg, deshalb muss das so laufen. */
function _abBentoNach(box){
  box=box||document.getElementById('fgDash'); if(!box) return;

  box.querySelectorAll('.baufg[data-job]').forEach(function(j){
    j.addEventListener('click',function(){
      if(_AB_EDIT) return;                 /* im Anordnen-Modus wird nicht gesprungen */
      _abSprung(j.getAttribute('data-job'));
    });
  });
  /* Schnellzugriff: adminGo statt eigener Navigation — es gibt genau einen Weg
     in einen Adminbereich (§4.2). */
  box.querySelectorAll('.abschnell[data-go]').forEach(function(b){
    b.addEventListener('click',function(){
      if(_AB_EDIT) return;
      var k=b.getAttribute('data-go');
      try{ if(typeof adminGo==='function') adminGo(k); }
      catch(e){ try{ console.warn('Schnellzugriff:',k,e); }catch(_){} }
    });
  });

  /* Work #121: die sechs Schnellzugriffe aus dem Cockpit. Jeder Schluessel
     zeigt auf einen vorhandenen Weg — oder auf die Serverliste. */
  box.querySelectorAll('.abschnellv2[data-akey]').forEach(function(b){
    b.addEventListener('click',function(){
      if(_AB_EDIT) return;
      var w=_AB_SCHNELL_WEG[b.getAttribute('data-akey')];
      if(!w) return;
      try{
        if(w.go && typeof adminGo==='function') adminGo(w.go);
        else if(w.drill) _abDrillOeffnen(w.drill, w.drillTitel||'');
        else if(w.fn) w.fn();
      }catch(e){ try{ console.warn('Schnellzugriff:',b.dataset.akey,e); }catch(_){} }
    });
  });

  /* Work #121: die Linkliste kommt aus der ausgelieferten Datei Links.md.
     Sie laedt nach wie alles andere — eine Datei ueber das Netz zu holen darf
     den Kachelaufbau nicht aufhalten. */
  if(box.querySelector('#abLinks')) { try{ _abLinksLaden(); }
    catch(e){ try{ console.warn('[Links]',e); }catch(_){} } }

  /* Work #121: jede Zahl mit drill_key oeffnet die Serverliste. EINE Stelle
     fuer alle Kacheln — der Anordnen-Modus zeichnet sie neu und ruft dieselbe
     Verdrahtung wieder auf. */
  box.querySelectorAll('[data-drill]').forEach(function(z){
    z.style.cursor='pointer';
    z.addEventListener('click',function(){
      if(_AB_EDIT) return;
      _abDrillOeffnen(z.getAttribute('data-drill'), z.getAttribute('data-drill-titel')||'');
    });
  });

  /* Work Items in der Arbeit-Kachel: eine Zeile oeffnet die volle Liste, weil
     es fuer ein einzelnes Work Item im Frontend keine Ansicht gibt. */
  box.querySelectorAll('.brz[data-work]').forEach(function(z){
    z.style.cursor='pointer';
    z.addEventListener('click',function(){
      if(_AB_EDIT) return;
      _abDrillOeffnen('arbeit_attention','Arbeit — was bei dir liegt');
    });
  });

  /* ---- Anordnen-Modus: Knoepfe ------------------------------------------- */
  box.querySelectorAll('[data-abe]').forEach(function(b){
    b.addEventListener('click',function(ev){
      ev.stopPropagation();
      var was=b.getAttribute('data-abe'), id=b.getAttribute('data-kid');
      if(was==='aus')       _abEditAendern(function(l,find){ var e=find(id); if(e) e.aus=true; });
      else if(was==='ein')  _abEditAendern(function(l,find){ var e=find(id); if(e) e.aus=false; });
      else if(was==='vor')     _abStapel(id,true);
      else if(was==='zurueck') _abStapel(id,false);
      else if(was==='weg')     _abKachelWeg(id);
      else if(was==='neu')     _abKachelNeu(b.getAttribute('data-typ'));
      else if(was==='sperre')  _abSperreUm(id);
      else if(was==='kopie')   _abDuplizieren(id);
      else if(was==='standard')  _abLayoutWechsel(null,
        'Standardanordnung aus dem Code — noch NICHT gespeichert.');
      else if(was==='verwerfen') _abLayoutWechsel(_AB_VORHER,
        'Zurück auf den Stand beim Öffnen.');
      else if(was==='zurueck1')  _abZurueck();
      else if(was==='vor1')      _abVor();
      else if(was==='speichern'){ _abLayoutSpeichern(); }
      else if(was==='fertig'){ _AB_EDIT=false;
        /* 🔴 15.08., Ralph: Luecke 1 — Hell/Dunkel gab es im Entwurf, in der App
       nicht. Der Schalter aendert NUR die Farbwerte des Dashboards, nichts an
       Aufbau oder Inhalt: eine zweite Bauart waere eine zweite Wahrheit. Die
       Wahl wird gemerkt, sonst muesste man sie bei jedem Aufruf neu treffen. */
    var du=document.getElementById('abDunkel');
    if(du) du.addEventListener('click',function(){
      var an2=!document.body.classList.contains('dashDunkel');
      document.body.classList.toggle('dashDunkel', an2);
      du.classList.toggle('on', an2);
      du.textContent=an2?'☀ Hell':'🌙 Dunkel';
      try{ localStorage.setItem('ri_dashDunkel', an2?'1':'0'); }catch(e){}
    });
    try{
      if(localStorage.getItem('ri_dashDunkel')==='1'){
        document.body.classList.add('dashDunkel');
        if(du){ du.classList.add('on'); du.textContent='☀ Hell'; }
      }
    }catch(e){}

    var an=document.getElementById('abAnordnen'); if(an) an.classList.remove('on');
        _abNeuZeichnen(); }
    });
  });

  /* Inhalt einer waehlbaren Kachel umschalten. Dieselbe eine Aenderungsspur
     wie Breite und Ein/Aus - kein zweiter Schreibweg (§4.2). */
  box.querySelectorAll('[data-abkz]').forEach(function(b){
    b.addEventListener('click',function(ev){
      ev.stopPropagation();
      var kz=b.getAttribute('data-abkz'), id=b.getAttribute('data-kid');
      _abEditAendern(function(l,find){
        var e=find(id); if(!e) return;
        var w=(e.inhalt&&e.inhalt.length)?e.inhalt.slice():_AB_FREI_VORGABE.slice();
        var i=w.indexOf(kz);
        if(i>=0) w.splice(i,1); else w.push(kz);
        e.inhalt=w;
      });
    });
  });

  /* Reihe bzw. Quelle einer Verlaufs- oder Listenkachel umschalten — dieselbe
     eine Aenderungsspur wie alles andere. */
  box.querySelectorAll('[data-abreihe]').forEach(function(b){
    b.addEventListener('click',function(ev){ ev.stopPropagation();
      var w=b.getAttribute('data-abreihe'), id=b.getAttribute('data-kid');
      _abEditAendern(function(l,find){ var e=find(id); if(e) e.reihe_id=w; });
    });
  });
  box.querySelectorAll('[data-abquelle]').forEach(function(b){
    b.addEventListener('click',function(ev){ ev.stopPropagation();
      var w=b.getAttribute('data-abquelle'), id=b.getAttribute('data-kid');
      _abEditAendern(function(l,find){ var e=find(id); if(e) e.quelle=w; });
    });
  });
  box.querySelectorAll('[data-abnotiz]').forEach(function(t){
    t.addEventListener('mousedown',function(ev){ ev.stopPropagation(); });
    t.addEventListener('change',function(){
      var id=t.getAttribute('data-abnotiz'), wert=t.value;
      _abEditAendern(function(l,find){ var e=find(id); if(e) e.text=wert; });
    });
  });
  box.querySelectorAll('[data-abtitel]').forEach(function(f){
    f.addEventListener('change',function(){ _abTitelSetzen(f.getAttribute('data-abtitel'), f.value); });
    f.addEventListener('mousedown',function(ev){ ev.stopPropagation(); });  /* nicht schieben */
  });

  var vw=document.getElementById('abVarWahl');
  if(vw) vw.addEventListener('change',function(){ _abVarianteWaehlen(vw.value); });

  /* ---- Schieben und Groesse ziehen ---------------------------------------
     Kein HTML5-Drag: das kann nur „von A auf B fallen lassen" und kennt keine
     freie Lage. Hier wird mit der Maus gerechnet — waagerecht in logischen
     Einheiten, damit dieselbe Anordnung auf jedem Bildschirm gleich aussieht.
     Waehrend des Ziehens wird nur der Stil der einen Kachel angefasst; erst
     beim Loslassen geht die neue Lage durch die normale Aenderungsspur. */
  if(_AB_EDIT){
    var flaeche=document.getElementById('abFlaeche');
    var lauf=null;
    var jeEinheit=function(){
      var br=flaeche?flaeche.getBoundingClientRect().width:_AB_LW;
      return br/_AB_LW;   /* Bildpunkte je logischer Einheit */
    };
    var starten=function(ev, id, modus){
      _abWahlSetzen(id, ev.shiftKey);
      if(_abGesperrt(id)){
        _AB_MELDUNG='Diese Kachel ist festgenagelt (🔒). Erst freigeben, dann schieben.';
        _abNeuZeichnen(); return;
      }
      var el=box.querySelector('.bk[data-kid="'+id+'"]'); if(!el) return;
      var l=_abKachelFlaeche().filter(function(e){ return e.k.id===id; })[0];
      if(!l) return;
      /* Die Lagen der anderen EINMAL beim Anfassen holen, nicht bei jedem
         Mausschritt: sie aendern sich waehrend des Ziehens nicht, und
         hundertmal dieselbe Liste zu bauen macht das Ziehen zaeh. */
      lauf={id:id, modus:modus, el:el, start:l.lage,
            andere:_abKachelFlaeche().filter(function(e){ return e.k.id!==id; })
                                     .map(function(e){ return e.lage; }),
            mx:ev.clientX, my:ev.clientY, f:jeEinheit(), neu:null};
      el.classList.add('bzieh');
      if(flaeche) flaeche.classList.add('zieht');
      ev.preventDefault();
    };
    var bewegen=function(ev){
      if(!lauf) return;
      var dx=(ev.clientX-lauf.mx)/(lauf.f||1), dy=ev.clientY-lauf.my;
      var s=lauf.start, n;
      if(lauf.modus==='ziehen'){
        n={x:Math.max(0,Math.min(_AB_LW-s.b, s.x+dx)), y:Math.max(0,s.y+dy), b:s.b, h:s.h};
        n=_abFangen(lauf.id, n, lauf.andere);
      }else{
        n={x:s.x, y:s.y, b:Math.max(_AB_MINB,Math.min(_AB_LW-s.x, s.b+dx)),
           h:Math.max(_AB_MINH, s.h+dy)};
        n=_abFangenGroesse(lauf.id, n, lauf.andere);
      }
      _abHilfslinien(n.linienX, n.linienY);
      lauf.neu=n;
      lauf.el.style.left=(n.x/_AB_LW*100)+'%';
      lauf.el.style.top=Math.round(n.y)+'px';
      lauf.el.style.width=(n.b/_AB_LW*100)+'%';
      lauf.el.style.height=Math.round(n.h)+'px';
    };
    var loslassen=function(){
      if(!lauf) return;
      var l=lauf; lauf=null;
      l.el.classList.remove('bzieh');
      if(flaeche) flaeche.classList.remove('zieht');
      _abHilfslinien([],[]);
      if(l.neu) _abLageSetzen(l.id, l.neu);   /* erst hier wird es gespeichert */
    };
    box.querySelectorAll('[data-zieh]').forEach(function(g){
      g.addEventListener('mousedown',function(ev){
        if(ev.target.closest&&ev.target.closest('button')) return;  /* Knopf bleibt Knopf */
        starten(ev, g.getAttribute('data-zieh'), 'ziehen');
      });
    });
    box.querySelectorAll('[data-groesse]').forEach(function(g){
      g.addEventListener('mousedown',function(ev){
        starten(ev, g.getAttribute('data-groesse'), 'groesse');
      });
    });
    /* Die beiden Zuhoerer haengen am FENSTER, nicht an der Kachel: sonst bleibt
       eine Kachel kleben, sobald die Maus schneller ist als das Nachzeichnen
       und den Rand verlaesst. Sie werden EINMAL angemeldet und rufen den
       jeweils aktuellen Rechner - jedes Neuzeichnen sonst einen neuen Zuhoerer
       anhaengen, und nach zehn Umbauten liefen zehn davon. */
    _AB_BEWEGEN=bewegen; _AB_LOS=loslassen;
    if(!_AB_MAUS){
      _AB_MAUS=true;
      window.addEventListener('mousemove',function(ev){ if(_AB_BEWEGEN) _AB_BEWEGEN(ev); });
      window.addEventListener('mouseup',  function(){    if(_AB_LOS)     _AB_LOS(); });
      /* Strg+Z / Cmd+Z. Nur im Anordnen-Modus, und nicht waehrend jemand in ein
         Feld schreibt — dort gehoert das Rueckgaengig dem Textfeld. */
      window.addEventListener('keydown',function(ev){
        if(!_AB_EDIT) return;
        var z=document.activeElement;
        if(z && (z.tagName==='INPUT'||z.tagName==='TEXTAREA'||z.isContentEditable)) return;
        if(ev.ctrlKey||ev.metaKey){
          if(String(ev.key).toLowerCase()!=='z') return;
          ev.preventDefault();
          if(ev.shiftKey) _abVor(); else _abZurueck();
          return;
        }
        /* Pfeiltasten: grob 10, mit Umschalt fein 1. Die Feinstufe ist der
           einzige Weg, unter das Fangraster zu kommen — ohne sie waere „genau
           hier hin" mit der Tastatur unmoeglich. */
        var s=ev.shiftKey?1:10, dx=0, dy=0;
        if(ev.key==='ArrowLeft')  dx=-s;
        else if(ev.key==='ArrowRight') dx=s;
        else if(ev.key==='ArrowUp')    dy=-s;
        else if(ev.key==='ArrowDown')  dy=s;
        else if(ev.key==='Escape'){ _abWahlSetzen(null); _abNeuZeichnen(); return; }
        else return;
        if(_abWahlSchieben(dx,dy)){ ev.preventDefault(); _abNeuZeichnen(); }
      });
    }
  }

  _abCmdNach(box);
  /* Die Zeitleiste laedt NACH — sie darf den Seitenaufbau nicht aufhalten. */
  if(document.getElementById('abZeitBox')){
    try{ _abZeitLaden(); }catch(e){ try{ console.warn('[Zeitleiste]',e); }catch(_){} }
  }

  /* Reihe 2 laedt NACH — sie darf den Seitenaufbau nicht aufhalten (Work #17). */
  if(document.getElementById('abAkt')||document.getElementById('abRegion')
     ||document.getElementById('abStammU')||document.getElementById('abWirk')
     ||document.getElementById('abRalph')){
    try{ _abBento2Laden(_abD); }
    catch(e){ try{ console.error('Bento-Reihe 2:',e); }catch(_){} }
  }
}

function _abNeuZeichnen(){
  var box=document.getElementById('abBentoBox'); if(!box) return;
  var A=null;
  try{ if(_abNp && typeof _abAbl==='function') A=_abAbl(_abNp); }catch(e){}
  box.innerHTML=_abEditLeiste()+_abProjektzeitHtml()+_abBento(_abD,_abNp,A)+_abBento2()
    +'<div id="abZeitBox"></div>'+_abCmdHtml();
  _abBentoNach(box);
}

/* Zeile Beschriftung/Wert. Stand vorher zweimal als lokales z() in _abBento. */
function _abZeile(l,v,f){
  return '<div class="bzeile"><span>'+l+'</span><b'
    +(f?' style="color:'+f+'"':'')+'>'+(v==null?'–':v)+'</b></div>';
}

/* ---- 1) HEUTE — OFFENE AUFGABEN (doppelt breit) ---------------------------
   Die Liste kommt aus _abJobsListe, damit es nicht zwei Vorstellungen davon
   gibt, was dringend ist. */
/* 🔴 20.08.2026, Work #121: die Kachel heisst jetzt fachlich ARBEIT und zeigt
   ausschliesslich Work Items — nicht mehr die Zufluesse aus dem Netzplan. Die
   gehoeren in die Kachel „Eingang" und standen hier ein zweites Mal (§4.2).
   Die Liste kommt aus cockpit.karten.aufgaben.top; sie wird SERVERSEITIG
   sortiert und gefiltert. Vorher holte _abRalphLaden 200 Zeilen und filterte
   im Browser — genau die „Browserzaehlung aus Rohdaten", die der Auftrag
   ausdruecklich verbietet. */
function _abkAufgaben(c){
  var ck=_abCkKarte('aufgaben');
  if(!ck) return {tag:'', inhalt:_abCkLadeHtml(), fuss:''};
  var top=ck.top||[];
  var jh=top.length
    ? top.slice(0,5).map(function(x){
        var l=_AB_RALPH_LAGE[x.status]||(x.decision_needed===true
              ? {t:'Du entscheidest', f:'krit'} : {t:_abCkStatusWort(x.status), f:'zu'});
        return '<div class="brz" data-work="'+esc(String(x.work_id))+'" title="'+esc(x.title||'')+'">'
          +'<span class="brn">#'+esc(String(x.work_id))+'</span>'
          +'<span class="brt"><span class="b1">'+esc(_abRalphKurz(x.title))+'</span>'
          +'<span class="b2">'+esc(l.t)+' · '+esc(x.owner_agent||'')+'</span></span>'
          +'<span class="brp '+l.f+'"></span></div>';
      }).join('')
    : '<div class="bleer">Nichts wartet auf dich — alles abgearbeitet.</div>';
  var w=function(v){ return (Number(v)||0)>0 ? _AB.warn : null; };
  return {
    tag:'<span class="abtag" style="background:'+((Number(ck.bei_ralph)||0)>0?'#fdf1f1':'#eef0f4')
      +';color:'+((Number(ck.bei_ralph)||0)>0?_AB.krit:_AB.mut)+'">'
      +(Number(ck.bei_ralph)||0)+' bei dir</span>',
    inhalt:'<div class="bleib"><div class="bralph">'+jh+'</div>'
      +'<div style="margin-top:8px">'
        + _abCkZeile('wartet auf Abnahme',   ck.wartet_abnahme,       ck.drill_key)
        + _abCkZeile('blockiert oder Streit',ck.blockiert_oder_streit,ck.drill_key, w(ck.blockiert_oder_streit))
        + _abCkZeile('länger als 24 h in Arbeit', ck.in_arbeit_alt_24h, ck.drill_key)
      +'</div></div>',
    fuss:top.length>5
      ? ('und '+(top.length-5)+' weitere — jede Zahl öffnet die volle Liste')
      : 'Jede Zahl öffnet die volle Liste.'
  };
}

/* Statuswort fuer Ralph, nicht fuer Agenten. Der Queue-Status heisst
   „ready_for_verification"; das sagt ihm nichts (§32.2a). */
function _abCkStatusWort(s){
  return {ready_for_verification:'Wartet auf Abnahme', in_progress:'In Arbeit',
          open:'Offen', blocked:'Hängt fest', disputed:'Rückfrage',
          decision_ralph:'Du entscheidest'}[s] || String(s||'');
}

/* ---- Was bei RALPH liegt --------------------------------------------------
   Nur was WIRKLICH bei ihm liegt, nicht die ganze Queue: Punkte mit
   „decision_ralph", „disputed" oder „blocked". Alles andere ist Arbeit von
   Claude oder ChatGPT und gehoert nicht auf sein Dashboard.

   🔴 DIE ERKLAERUNG WIRD NICHT ERFUNDEN. Sie ist der Titel des Work Items,
   nur aufgeraeumt: der Bereichsvorsatz („erfassung — ") faellt weg, weil er
   danebensteht. Kein Umschreiben, kein Ausschmuecken — Ralph muss den Punkt
   im Work Item wiederfinden koennen. */
function _abRalphKurz(titel){
  var t=String(titel||'');
  /* Bereichsvorsatz und die interne Marke „#42/E3" fallen weg — beides steht
     entweder daneben oder sagt Ralph nichts. Der Rest bleibt Wort fuer Wort. */
  t=t.replace(/^(erfassung|dashboard|benutzersicht|produkterfassung|frontend|data|qa)\b\s*/i,'');
  t=t.replace(/^#\d+(\/\w+)?\s*/,'');
  t=t.replace(/^[—–-]\s*/,'');
  return t;
}
var _AB_RALPH_LAGE={
  decision_ralph:{t:'Du entscheidest', f:'krit'},
  disputed:      {t:'Rückfrage an dich', f:'warn'},
  blocked:       {t:'Hängt fest', f:'warn'}
};
/* 🔴 _abRalphLaden IST ENTFERNT (Work #121, 20.08.2026) — bewusst, mit
   Begruendung statt stillschweigend (§3.7).
   Sie holte 200 Zeilen aus cb_admin_agent_work_liste und filterte, sortierte
   und zaehlte sie IM BROWSER. Damit gab es zwei Vorstellungen davon, was „bei
   Ralph liegt": ihre und die des Servers. Gemessen 20.08.: der Filter hier
   ergab 5 Punkte, cockpit.hero.ralph_entscheidungen sagt 2 — weil er
   „decision_needed an einem erledigten Item" nicht mitzaehlt und der Browser
   schon.
   Die Kachel liest jetzt cockpit.karten.aufgaben. Der Container #abRalph ist
   dabei geblieben, nur ohne Nachlader: die Zeilen stehen sofort im Markup. */

/* ============================================================================
   COCKPIT-KACHELN  ·  Work #121, Stufe 3  ·  20.08.2026
   ----------------------------------------------------------------------------
   Jede der acht Kacheln liest ihre Zahlen aus _AB_CK.karten.<id>. Solange
   nichts da ist, steht „laedt" — KEINE Zahl aus der alten Quelle als
   Zwischenstand. Genau das waere die Doppelung, die dieser Umbau beseitigt:
   cb_dashboard und cb_netzplan haben andere Definitionen und liefern andere
   Zahlen (gemessen 20.08.: Gate 248 gegen 242, Stamm 941 gegen 944).
   ========================================================================== */
function _abCkKarte(id){ return (_AB_CK && _AB_CK.karten && _AB_CK.karten[id]) || null; }

function _abCkLadeHtml(){
  if(_AB_CK_FEHLER)
    return '<div class="bleib"><div class="bleer">Keine Zahlen — '+esc(_AB_CK_FEHLER)+'</div></div>';
  return '<div class="bleib"><div class="blade">lädt…</div></div>';
}

/* Eine Zeile mit anklickbarer Zahl. Ohne drill_key bleibt sie stumm — ein
   Knopf, der nichts oeffnet, ist schlimmer als eine Zahl ohne Knopf (§121,
   Kriterium 4: 0 tote Buttons). */
function _abCkZeile(l,v,key,farbe){
  var kl=key?' class="bzeile bdrill" data-drill="'+esc(key)+'" data-drill-titel="'+esc(l)+'"'
            :' class="bzeile"';
  return '<div'+kl+'><span>'+l+'</span><b'
    +(farbe?' style="color:'+farbe+'"':'')+'>'+(v==null?'–':v)+'</b></div>';
}

/* ---- 2) KATALOG ----------------------------------------------------------- */
function _abkBestand(c){
  var ck=_abCkKarte('bestand');
  if(!ck) return {tag:'', inhalt:_abCkLadeHtml(), fuss:''};
  var dr=ck.drills||{};
  var w=function(v){ return (Number(v)||0)>0 ? _AB.warn : null; };
  return {
    tag:'',
    inhalt:'<div class="bleib"><div class="bzahl" style="color:'+_AB.kern+'">'
      +(ck.aktiv==null?'–':ck.aktiv)+'</div>'
    +'<div class="bunter">aktive Produkte</div>'
    +'<div style="margin-top:9px">'
      + _abCkZeile('ohne Index-Zahl', ck.ohne_score,    dr.ohne_score,  w(ck.ohne_score))
      + _abCkZeile('ohne Quelle',     ck.ohne_quelle,   dr.ohne_quelle, w(ck.ohne_quelle))
      + _abCkZeile('unverifiziert',   ck.unverifiziert, null,           w(ck.unverifiziert))
      + _abCkZeile('EAN fehlt',       ck.ean_fehlt,     dr.ean_fehlt,   w(ck.ean_fehlt))
    +'</div></div>',
    fuss:'Nur Lücken, an denen man arbeiten kann — jede Zahl mit Liste ist anklickbar.'
  };
}

/* ---- 3) RIKI-BUDGET -------------------------------------------------------
   Budget, Verbrauch, Aufrufe und Fehler kommen aus dem Cockpit. Der
   14-Tage-Verlauf NICHT: den fuehrt der Vertrag nicht, er steht weiterhin in
   cb_dashboard.riki_verlauf. Das ist keine zweite Zaehlung derselben Groesse,
   sondern eine Groesse, die es nur an einem Ort gibt (§3.4: was fehlt, wird
   nicht erfunden — und was da ist, wird nicht weggeworfen). */
function _abkRiki(c){
  var d=c.d||{};
  var ck=_abCkKarte('riki');
  if(!ck) return {tag:'', inhalt:_abCkLadeHtml(), fuss:''};
  var lim=Number(ck.monatslimit_usd)||0, verbr=Number(ck.monat_usd)||0;
  var anteil=lim?Math.max(0,Math.min(1,verbr/lim)):0;
  var bf=anteil>=0.9?_AB.krit:anteil>=0.6?_AB.warn:_AB.gut;
  var jetzt=new Date(), tagNr=jetzt.getDate();
  var tageMon=new Date(jetzt.getFullYear(),jetzt.getMonth()+1,0).getDate();
  var prog=(tagNr>0?verbr/tagNr*tageMon:0), progOk=(lim? prog<=lim : true);
  var rv=(d.riki_verlauf||[]).slice(-14);
  var rvMax=Math.max.apply(null,[0.0001].concat(rv.map(function(x){ return Number(x.usd)||0; })));
  var spark=rv.length
    ? '<div class="bspark">'+rv.map(function(x){ var v=Number(x.usd)||0;
        return '<i title="'+esc(x.tag)+': '+v.toFixed(2)+' $" style="height:'
          +Math.max(2,Math.round(v/rvMax*28))+'px"></i>'; }).join('')+'</div>'
    : '<div class="bunter">noch keine Tageswerte</div>';
  return {
    tag:'',
    inhalt:'<div class="bleib"><div class="bzahl" style="color:'+bf+'">'
      +(lim? verbr.toFixed(2).replace('.',',')+' $' : '–')+'</div>'
    +'<div class="bunter">'+(lim? 'von '+lim.toFixed(0)+' $ im Monat' : 'kein Limit hinterlegt')+'</div>'
    +(lim?'<div class="abbar" style="margin-top:8px"><i style="width:'+Math.round(anteil*100)
      +'%;background:'+bf+'"></i></div>':'')
    +spark
    +'<div style="margin-top:7px">'
      + _abCkZeile('Aufrufe heute', ck.heute_calls, null)
      + _abCkZeile('Fehler, 24 h', ck.fehler_24h, ck.drill_key,
                   ((Number(ck.fehler_24h)||0)>0?_AB.krit:null))
    +'</div></div>',
    fuss:lim ? ('Prognose Monatsende ~'+prog.toFixed(0)+' $ · '
      +(progOk?'im Rahmen':'<b style="color:'+_AB.krit+'">über Budget</b>')
      +' — läuft es voll, blockt Riki. Gewollt.') : ''
  };
}

/* ---- 4) WÄCHTER-STATUS ----------------------------------------------------
   🔴 15.08.: nachgezogen auf die Vorlage — Halbkreis mit zwei Wertkaesten und
   Balkenzeilen mit der ZAHL IM BALKEN samt Schwellwert-Pillen davor.
   Die Schwellen sind NICHT erfunden: „meldet" ist >0, „blockiert" ist das
   Gate-Kennzeichen aus den Daten. Was es nicht gibt, steht auch nicht da —
   einen Verlauf ueber Zeit (−2h ▸ −1h ▸ JETZT wie in der Vorlage) speichert
   der Server nicht, deshalb gibt es hier keine Zeitkette. Sie zu zeichnen und
   mit dem heutigen Wert dreimal zu fuellen waere eine Luege im Bild. */
function _abkWaechter(c){
  var ck=_abCkKarte('waechter');
  if(!ck) return {tag:'', inhalt:_abCkLadeHtml(), fuss:''};
  var g=ck.gate||[];
  var still=g.filter(function(x){ return (Number(x.offen)||0)===0; }).length;
  var quote=g.length? Math.round(still/g.length*100) : 0;
  /* Halbkreis: 81er Radius, wie in der Vorlage. Der gefuellte Teil ist der
     STILLE Anteil — die gute Richtung ist der Fortschritt. */
  var bogen=function(anteil){
    var a=Math.PI*(1-Math.max(0,Math.min(1,anteil)));
    return {x:(98+81*Math.cos(a)).toFixed(1), y:(97-81*Math.sin(a)).toFixed(1)};
  };
  var e=bogen(quote/100);
  var farbe=quote>=80?_AB.gut:(quote>=40?_AB.warn:_AB.krit);
  var faelle=Number(ck.gate_faelle)||0;

  /* 🔴 JEDE Zahl traegt ihren MESSSTAND (§121, Kriterium 5). Vorher stand hier
     eine Zahl ohne Alter — und eine Cache-Zahl von vorgestern sieht genauso aus
     wie eine von heute frueh. Gemessen 20.08.: „Zutaten-Regeln" war 78,3 Stunden
     alt, waehrend die uebrigen sieben 13,1 Stunden alt waren. */
  var zeile=function(x){
    var offen=Number(x.offen)||0;
    var f=offen>0?'r':'gr';
    var alt=Number(x.alter_stunden);
    var frisch=(x.frisch===true);
    var std=isNaN(alt)?'Stand unbekannt'
      :(alt<48? ('vor '+alt.toFixed(1).replace('.',',')+' h')
              : ('vor '+Math.round(alt/24)+' Tagen'));
    return '<div class="bbz'+(x.drill_key&&offen>0?' bdrill':'')+'"'
      +(x.drill_key&&offen>0?' data-drill="'+esc(x.drill_key)+'" data-drill-titel="'+esc(x.name||x.id)+'"':'')
      +'>'
      +'<span class="nm">'+esc(x.name||x.id||'')
        +'<span class="schw"><i class="'+(frisch?'gr':'ge')+'">'+esc(std)+'</i></span></span>'
      +'<span class="werte"><b class="'+f+'">'+offen+'</b></span>'
    +'</div>';
  };
  return {
    tag:(faelle>0
      ? '<span class="abtag" style="background:#fdf1f1;color:'+_AB.krit+'" '
        +'title="Summe der offenen Fälle bei den Wächtern, die die Freigabe blockieren">'
        +faelle+' Gate-Fälle</span>'
      : '<span class="abtag" style="background:#effaef;color:'+_AB.gut+'">Gate frei</span>'),
    inhalt:'<div class="bleib">'
      +'<div class="bort">Gate-Wächter: <b>'+g.length+'</b>'
        +(ck.messung_veraltet===true
          ? ' · <span style="color:'+_AB.warn+'">ein Messstand ist veraltet</span>' : '')
      +'</div>'
      +'<div class="bhalb">'
        +'<svg viewBox="0 0 196 106" width="180" height="98">'
          +'<path d="M17,97 A81,81 0 0,1 179,97" fill="none" stroke="#d5dade" stroke-width="16"/>'
          +'<path d="M17,97 A81,81 0 0,1 '+e.x+','+e.y+'" fill="none" stroke="'+farbe
            +'" stroke-width="16"/>'
        +'</svg>'
        +'<div class="pz">'+quote+' %</div>'
        +'<div class="pl">still — '+(g.length-still)+' melden</div>'
      +'</div>'
      + g.filter(function(x){ return (Number(x.offen)||0)>0; }).map(zeile).join('')
      + (still===g.length && g.length
          ? '<div class="bleer">Kein Gate-Wächter meldet etwas.</div>' : '')
      +'<div class="bleg">'
        +'<span><i class="gr"></i>frisch gemessen</span>'
        +'<span><i class="ge"></i>Messstand alt</span>'
        +'<span><i class="r"></i>offene Fälle</span>'
      +'</div>'
    +'</div>',
    fuss:(Number(ck.weitere_beobachtungen_mit_faellen)||0)>0
      ? (ck.weitere_beobachtungen_mit_faellen+' weitere Beobachtungen haben Fälle, blockieren aber nicht.')
      : ''
  };
}

/* Die Flaeche zeichnen. EIN Behaelter, absolute Lagen, Ueberlappung erlaubt. */
function _abFlaeche(c){
  var l=_abKachelFlaeche(), unten=0;
  l.forEach(function(e){ unten=Math.max(unten, e.lage.y+e.lage.h); });
  var h='<div class="abbento abfrei'+(_AB_EDIT?' bearb':'')+'" id="abFlaeche" '
    +'style="height:'+(unten+16)+'px">';
  l.forEach(function(e){
    var g=e.lage, x=e.k;
    var stil='position:absolute;left:'+(g.x/_AB_LW*100).toFixed(4)+'%;top:'+g.y+'px;'
      +'width:'+(g.b/_AB_LW*100).toFixed(4)+'%;height:'+g.h+'px;z-index:'+g.z+';overflow:hidden';
    var zus=_AB_EDIT?_abEditRahmen(x):{};
    zus=Object.assign({}, zus, {stil:stil, foto:x.foto, leds:x.leds,
      /* text:true => Zeilen laufen bis ganz rechts, der Verlauf deckt voll. */
      klasse:(zus.klasse||'')+(x.text?' btext':''),
      attr:(zus.attr||'')+' data-kid="'+esc(x.id)+'"'});
    if(x.roh){
      var r=x.roh(c,x);
      r=r.replace('<div class="bk"','<div class="bk'+(zus.klasse||'')+'"'+zus.attr
        +' style="'+stil+'"');
      if(zus.vor) r=r.replace(/>/, '>'+zus.vor);
      h+=r; return;
    }
    var t=x.bau(c,x)||{};
    h+=_abKachel(x.titel, t.tag||'', t.inhalt||'', t.fuss||'', false, zus);
  });
  return h+'</div>';
}

function _abBento(d,np,A){
  return _abFlaeche({d:d||{},np:np||{},A:A});
}

/* ============================================================================
   BENTO-REIHE 2  ·  Durchgang 3  ·  15.08.2026
   ----------------------------------------------------------------------------
   §22 zuerst gesucht, und es hat sich wieder gelohnt: NICHTS hiervon ist neu.
     · „Letzte Aktivitaeten"  -> cb_top_aufrufe / cb_top_suchen. Beide standen in
       `ladeNutzungPanel` — einer Funktion, die NIRGENDS gerufen wird und deren
       Container `#dashNutzung` in keinem Markup steht. Totes Werkzeug, genau wie
       `ladeStammPanel`. Es fehlte nicht, es war nur nicht angeschlossen.
     · „Nutzer & Regionen"    -> dashKarteLoad + entKarteDE, vorhanden.
     · „Stamm-Ueberblick"     -> cb_admin_stamm_waechter, dieselbe Quelle wie der
       Stammwaechter. KEINE zweite Zaehlung (§4.2).
     · „Schnellzugriff"       -> adminGo, vorhanden.

   🔴 ALLE VIER LADEN NACH. Der Seitenaufbau darf nicht auf sie warten —
   cb_admin_stamm_waechter braucht gemessene 4,9 s und laeuft in den Timeout
   (Work #17). Eine Kachel, die den Rest der Seite blockiert, waere ein
   Rueckschritt gegenueber dem, was vorher da war.

   15.08. Work #42/E1: die drei nachladenden Kacheln stehen jetzt im Register
   oben. Ihr Inhalt ist unveraendert der Ladeplatzhalter mit derselben ID —
   die Nachlader (abAkt · abRegion · abStammU) suchen weiterhin dieselben
   Container und wurden NICHT angefasst.
   ========================================================================== */
/* ---- 5) EINGANG (id bleibt „aktivitaet") -----------------------------------
   🔴 20.08.2026, Work #121: die Kachel zeigt die sechs echten ZUFLUESSE mit
   Wartemenge und Alter, nicht mehr „Meistgeoeffnete Produkte / erfolglose
   Suchen". Die ID bleibt, damit gespeicherte Layouts aus Work #42 nicht
   migriert werden muessen — nur ihr fachlicher Inhalt ist definiert worden.

   WAS DABEI WEGFAELLT, und das steht hier statt es zu verschweigen: die
   30-Tage-Nutzung aus cb_top_aufrufe / cb_top_suchen. Beide RPCs bleiben
   unangetastet in der Datenbank; sie haben nur keinen Platz mehr im
   Standard-Dashboard. Ralph kann sie ueber die freie Kachel zurueckholen. */
function _abkAkt(c){
  var ck=_abCkKarte('aktivitaet');
  if(!ck) return {tag:'', inhalt:_abCkLadeHtml(), fuss:''};
  var q=ck.queues||[];
  var wegWort={auto:'Automatik', hand:'von Hand', keiner:'kein Weg'};
  var zeilen=q.map(function(x){
    var n=Number(x.wartend)||0;
    var kein=(x.weg==='keiner');
    var alter=(x.aeltester_tage==null)?'':(' · ältester '+x.aeltester_tage+' T');
    return '<div class="bzeile'+(x.drill_key?' bdrill':'')+'"'
      +(x.drill_key?' data-drill="'+esc(x.drill_key)+'" data-drill-titel="'+esc(x.name||x.id)+'"':'')
      +'><span>'+esc(x.name||x.id||'')
        +'<i style="font-style:normal;opacity:.7"> — '+esc(wegWort[x.weg]||String(x.weg||''))
        +esc(alter)+'</i></span>'
      +'<b'+(kein&&n>0?' style="color:'+_AB.warn+'"':'')+'>'+n+'</b></div>';
  }).join('');
  var ohne=Number(ck.ohne_automatischen_weg)||0;
  return {
    tag:'<span class="abtag" style="background:'+(ohne>0?'#fff6e6':'#eef0f4')+';color:'
      +(ohne>0?_AB.warn:_AB.mut)+'">'+ohne+' ohne automatischen Weg</span>',
    inhalt:'<div class="bleib">'
      +(zeilen||'<div class="bleer">Kein Zufluss wartet.</div>')
      +'</div>',
    fuss:'Anklickbare Zeilen öffnen die wartenden Einträge.'
  };
}

/* ---- 7) NUTZUNG (id bleibt „region") ---------------------------------------
   Ralph-Korrektur 18.08.: die Deutschlandkarte BLEIBT. Sie wird weiterhin von
   dashKarteLoad/entKarteDE gezeichnet — kein zweiter Kartenzeichner (§4.2,
   Kriterium 11). Die Nutzungswerte darueber kommen aus dem Cockpit. */
function _abkRegion(c){
  var ck=_abCkKarte('region');
  var kopf=ck
    ? '<div style="margin-bottom:7px">'
        + _abCkZeile('Nutzer gesamt', ck.nutzer_gesamt, null)
        + _abCkZeile('aktiv, 7 Tage', ck.aktiv_7t, null)
        + _abCkZeile('Premium', ck.premium, null)
        + _abCkZeile('Tagebuch, 7 Tage', ck.tagebuch_7t, null)
      +'</div>'
    : '<div class="blade">Nutzungswerte laden…</div>';
  return {tag:'', inhalt:'<div class="bleib">'+kopf
    +'<div id="abRegion"><div class="blade">Karte lädt…</div></div></div>', fuss:''};
}

/* ---- 6) STAMM (id bleibt „stammu") -----------------------------------------
   🔴 20.08.2026, Work #121, Kriterium 6: die Kachel nennt NICHT mehr
   public.Zutaten_Stamm. Die Zahlen kommen aus der Canonical-Wahrheit im
   Cockpit. Der bisherige Nachlader rief cb_admin_stamm_waechter mit gemessenen
   4,9 s (Work #17) — er ist damit aus dem Seitenaufbau raus. */
function _abkStammU(c){
  var ck=_abCkKarte('stammu');
  if(!ck) return {tag:'', inhalt:_abCkLadeHtml(), fuss:''};
  var dr=ck.drills||{};
  var w=function(v){ return (Number(v)||0)>0 ? _AB.warn : null; };
  return {
    tag:'<span class="abtag" style="background:#eef0f4;color:'+_AB.mut+'">Canonical</span>',
    inhalt:'<div class="bleib"><div class="bzahl" style="color:'+_AB.kern+'">'
      +(ck.aktiv==null?'–':ck.aktiv)+'</div>'
    +'<div class="bunter">aktive Canonical-Zutaten</div>'
    +'<div style="margin-top:9px">'
      + _abCkZeile('wirklich unbewertet', ck.wirklich_unbewertet, null, w(ck.wirklich_unbewertet))
      + _abCkZeile('nie gebunden',        ck.nie_gebunden,   dr.nie_gebunden,   w(ck.nie_gebunden))
      + _abCkZeile('ohne Kategorie',      ck.ohne_kategorie, dr.ohne_kategorie, w(ck.ohne_kategorie))
    +'</div></div>',
    fuss:'Canonical ist die Wahrheit — der Legacy-Zeilenzähler ist keine Kennzahl mehr.'
  };
}

/* Die zweite Reihe ist mit dem Umbau auf die freie Flaeche entfallen — ihre
   vier Kacheln liegen jetzt in derselben Flaeche wie die anderen. Die Funktion
   bleibt als leere Huelle stehen, weil dashArbeitHtml sie ruft; entfernt wird
   sie erst, wenn der Aufrufer angefasst wird (§2.3: keine Nebenaenderung). */
function _abBento2(){ return ''; }

/* Schnellzugriff. Reine Wege, keine Zahlen — deshalb sofort da und ohne Nachladen.
   Die Ziele sind adminGo-Schluessel, die es WIRKLICH gibt (aus der fg-Tabelle in
   adminGo gelesen, nicht geraten). */
/* ---- 8) BETRIEB & SCHNELLZUGRIFF (id bleibt „schnell") ---------------------
   🔴 20.08.2026, Work #121: die sechs action keys kommen jetzt vom Server und
   werden auf VORHANDENE Wege gemappt. Kein Weg wird erfunden (Kriterium 7).
   Gemessen 20.08. an adminGo: dash · scans · bundles · rezepte · empfehlungen ·
   zuverif · regelwerk · produkterfassung · stamm sind die Tabs; alles andere
   laeuft ueber navTo. Fuer `work_queue` gibt es im Frontend KEINE Ansicht —
   der Knopf oeffnet deshalb die Serverliste, statt ins Leere zu zeigen.

   Dazu die Betriebstakte aus cockpit.karten.schnell.takte: Name, Alter,
   Fehlerserie. Ralphs Vorgabe „keine rohen HTML-Fehlermeldungen im Kacheltext"
   ist eingehalten — es steht nur, wann es zuletzt lief und ob es haengt. */
var _AB_SCHNELL_WEG={
  erfassung:   {ic:'✏️', go:'produkterfassung'},
  scan:        {ic:'📷', fn:function(){ if(typeof scanEingangOeffnen==='function') scanEingangOeffnen(); }},
  stamm:       {ic:'🧬', go:'stamm'},
  waechter:    {ic:'🛡️', fn:function(){ _abSprung('waechter'); }},
  wirkdiagramm:{ic:'🕸️', fn:function(){ if(typeof dashArbeitAnsichtSet==='function') dashArbeitAnsichtSet('architektur'); }},
  work_queue:  {ic:'📋', drill:'arbeit_attention', drillTitel:'Work Queue — was offen ist'}
};

function _abSchnell(){
  var ck=_abCkKarte('schnell');
  var akt=(ck&&ck.aktionen)||[];
  var knoepfe=akt.map(function(a){
    var w=_AB_SCHNELL_WEG[a.key];
    if(!w) return '';                       /* unbekannter Schluessel: kein Knopf */
    return '<button type="button" class="abschnell abschnellv2" data-akey="'+esc(a.key)+'">'
      +'<span class="ic">'+w.ic+'</span>'+esc(a.label||a.key)+'<span class="pf">›</span></button>';
  }).join('');

  var takte=((ck&&ck.takte)||[]).map(function(t){
    var min=Number(t.minuten_her);
    var alt=isNaN(min)?'–':(min<90? (Math.round(min)+' min her')
                                  : (Math.round(min/60)+' h her'));
    var serie=Number(t.fehler_serie)||0;
    var f=(serie>0)?_AB.krit:((!isNaN(min)&&min>1440)?_AB.warn:null);
    return '<div class="bzeile"><span>'+esc(t.takt||'')+'</span><b'
      +(f?' style="color:'+f+'"':'')+'>'+esc(alt)+(serie>0?(' · '+serie+'× Fehler'):'')+'</b></div>';
  }).join('');

  var auto=ck ? (ck.autopilot_an===true
      ? '<div class="bzeile"><span>Etikett-Autopilot</span><b style="color:'+_AB.gut+'">läuft</b></div>'
      : '<div class="bzeile'+((Number(ck.foto_wartend)||0)>0?' bdrill':'')+'"'
        +((Number(ck.foto_wartend)||0)>0?' data-drill="scan_foto" data-drill-titel="Wartende Etikettfotos"':'')
        +'><span>Etikett-Autopilot</span><b style="color:'+_AB.krit+'">aus · '
        +(Number(ck.foto_wartend)||0)+' warten</b></div>')
    : '';

  return '<div class="bk"><div class="bkopf"><h3>Betrieb &amp; Schnellzugriff</h3></div>'
    +'<div class="bleib" style="padding-top:6px">'
    + (ck ? (auto+takte+'<div style="height:7px"></div>'+knoepfe)
          : '<div class="blade">lädt…</div>')
    +'<div id="abLinks" style="margin-top:9px"><div class="blade">Linkliste lädt…</div></div>'
    +'</div></div>';
}

/* ============================================================================
   LINKLISTE  ·  Work #121, Kriterium 12/13  ·  20.08.2026
   ----------------------------------------------------------------------------
   Ralph-Entscheid 20.08. (Weg A): die vorhandene Liste wird AUSGELIEFERT, nicht
   abgeschrieben. Die Datei ist von "06 Betrieb/Links.md" nach
   "webseite/Links.md" GEZOGEN — nicht kopiert. Es gibt sie weiterhin genau
   einmal, Ralph pflegt sie unverändert in Obsidian, und die Wikilinks [[Links]]
   bleiben heil, weil der Dateiname derselbe ist.

   🔴 WAS DAMIT ÖFFENTLICH WIRD, und das steht hier statt im Kleingedruckten:
   deploy.command kopiert ALLE regulären Dateien direkt aus webseite/. Die Datei
   ist damit unter root-index.de/Links.md abrufbar — für jeden, auch ohne
   Anmeldung. Sie enthält keine Schlüssel und keine Passwörter (nachgelesen,
   nicht vermutet), aber die Adresse des GitHub-Repos steht darin. Wer das nicht
   will, nimmt die Zeile aus der Datei; das Dashboard zeigt dann eine Gruppe
   weniger und sonst nichts.

   Gelesen wird das Markdown so, wie Ralph es schreibt: „## Überschrift" wird
   eine Gruppe, „| Name | https://… |" wird eine Zeile. Was keine URL enthält,
   wird übersprungen — die drei unbelegten Punkte am Ende der Datei sind
   ausdrücklich als Lücke markiert und sollen keine Knöpfe werden (§1.2).
   ========================================================================== */
function _abLinksAusMd(md){
  var gruppen=[], aktuell=null;
  String(md||'').split('\n').forEach(function(z){
    var h=/^##\s+(.+?)\s*$/.exec(z);
    if(h){ aktuell={titel:h[1], links:[]}; gruppen.push(aktuell); return; }
    if(!aktuell) return;
    if(z.indexOf('|')!==0) return;
    var sp=z.split('|').map(function(x){ return x.trim(); }).filter(function(x,i,a){
      return !(i===0&&x==='') && !(i===a.length-1&&x===''); });
    if(sp.length<2) return;
    var url=/(https?:\/\/[^\s)|]+)/.exec(sp[1]);
    if(!url) return;                       /* „je Produkt", „vom Nutzer" — kein Link */
    var name=sp[0].replace(/\*\*/g,'').replace(/\s*\(.*?\)\s*$/,'').trim();
    if(!name) return;
    aktuell.links.push({name:name, url:url[1]});
  });
  return gruppen.filter(function(g){ return g.links.length; });
}

async function _abLinksLaden(){
  var box=document.getElementById('abLinks'); if(!box) return;
  try{
    var r=await fetch('Links.md?cb='+Date.now());
    if(!r.ok) throw new Error('HTTP '+r.status);
    var g=_abLinksAusMd(await r.text());
    if(!g.length){ box.innerHTML='<div class="bleer">Links.md enthält keine Linkzeilen.</div>'; return; }
    var anzahl=g.reduce(function(s,x){ return s+x.links.length; },0);
    /* 🔴 AUFGEKLAPPT waeren es sieben Zeilen zusaetzlich zu vier Betriebszeilen
       und sechs Knoepfen — auf 300 px Kachelhoehe eine Scrollwueste. Gemessen
       mit dem Zeilenzaehler aus test-work121-cockpit.js. Als <details> kostet
       die Liste EINE Zeile, bis Ralph sie braucht. Der Browser merkt sich das
       nicht; das waere ein zweiter Speicherort fuer eine Anzeigeeinstellung
       und ist es nicht wert. */
    box.innerHTML='<details><summary style="cursor:pointer;font-size:11px;'
      +'font-weight:700;letter-spacing:.02em;text-transform:uppercase;'
      +'color:var(--abmut);padding:3px 0">Links · '+anzahl+' aus Links.md</summary>'
      + g.map(function(x){
          return '<div class="bzeile" style="align-items:flex-start"><span>'+esc(x.titel)+'</span>'
            +'<b style="font-weight:500;text-align:right">'
            + x.links.map(function(l){
                return '<a href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer" '
                  +'title="'+esc(l.url)+'" style="color:inherit">'+esc(l.name)+'</a>';
              }).join(' · ')
            +'</b></div>';
        }).join('')
      +'</details>';
  }catch(e){
    box.innerHTML='<div class="bfehl"><b>Linkliste nicht ladbar.</b><br>'
      +esc((e&&e.message)||String(e))+'</div>';
    try{ console.warn('[Links]',e); }catch(_){}
  }
}

/* Nachladen. Jede Kachel EINZELN und mit eigenem Fangblock: faellt eine aus,
   stehen die anderen drei trotzdem (§11.4 — und der Grund landet sichtbar in
   der Kachel, nicht nur in der Konsole). */
async function _abBento2Laden(d){
  var setz=function(id,html){ var e=document.getElementById(id); if(e) e.innerHTML=html; };
  var fehl=function(id,e,was){
    var m=(e&&e.message)||String(e);
    setz(id,'<div class="bfehl"><b>'+esc(was)+' nicht ladbar.</b><br>'+esc(m)+'</div>');
    try{ console.error('[Bento2] '+was, e); }catch(_){}
  };

  /* --- Eingang, Stamm, Arbeit: kommen seit Work #121 aus dem Cockpit --------
     Drei Nachlader sind hier ENTFERNT, jeder mit seinem Grund (§3.7):
       · cb_top_aufrufe / cb_top_suchen — die Kachel „aktivitaet" zeigt jetzt
         die Zuflüsse. Beide RPCs bleiben in der Datenbank, sie haben nur
         keinen Platz mehr im Standard-Dashboard.
       · cb_admin_stamm_waechter — 4,9 s gemessen (Work #17); die Stammzahlen
         stehen im Cockpit und kommen aus Canonical statt aus dem Legacy-Stamm.
       · cb_admin_agent_work_liste — siehe _abRalphLaden weiter oben.
     Die Deutschlandkarte (#abRegion) laedt weiterhin nach: sie ist ein
     Kartenzeichner, keine Zahl (Kriterium 11). */

  /* --- Wirkkette (C3, 15.08.) ---------------------------------------------
     Zahlen aus cb_admin_architektur_liste. Sie kommen SERVERSEITIG gezaehlt
     aus dem Feld `counts` — hier wird nichts nachgerechnet, sonst gaebe es
     eine zweite Bilanz neben der des Diagramms (§4.2, §28.4). */
  (async function(){
    if(!document.getElementById('abWirk')) return;
    try{
      var r=await client.rpc('cb_admin_architektur_liste',{p_diagram_key:'produkterfassung'});
      if(r.error) throw r.error;
      var j=r.data; if(typeof j==='string') j=JSON.parse(j);
      var c=(j&&j.counts)||{};
      var z=function(l,v,f){ return '<div class="bzeile"><span>'+l+'</span><b'
        +(f?' style="color:'+f+'"':'')+'>'+(v==null?'–':v)+'</b></div>'; };
      setz('abWirk',
        '<div class="bort">Knoten gesamt: <b>'+(c.gesamt==null?'–':c.gesamt)+'</b></div>'
        + z('Bruch', c.bruch, (Number(c.bruch)>0?_AB.krit:null))
        + z('Lücke', c.lueck, (Number(c.lueck)>0?_AB.warn:null))
        + z('grün oder Grenze', (Number(c.gut)||0)+(Number(c.grenze)||0), _AB.gut)
        + z('Prio ① — blockiert das Ziel', c.prio1, (Number(c.prio1)>0?_AB.warn:null))
        + z('Prüfung offen', c.review_offen)
        + (Number(c.ralph_entscheid)>0
            ? '<div class="bleg" style="padding-top:8px"><span><i class="r"></i>'
              +c.ralph_entscheid+' wartet auf deine Entscheidung</span></div>' : '')
      );
    }catch(e){ fehl('abWirk',e,'Wirkkette'); }
  })();

  /* --- Nutzer & Regionen --------------------------------------------------- */
  (async function(){
    var u=(d&&d.nutzer)||{};
    var kopf='<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:8px">'
      +'<div><div class="bzahl" style="font-size:24px;color:'+_AB.kern+'">'
        +(u.gesamt==null?'–':u.gesamt)+'</div>'
      +'<div class="bunter">Nutzer gesamt</div></div>'
      +'<div><div class="bzahl" style="font-size:24px;color:'+_AB.mut+'">'
        +(u.aktiv_30t==null?'–':u.aktiv_30t)+'</div>'
      +'<div class="bunter">aktiv, 30 Tage</div></div>'
      +'<div><div class="bzahl" style="font-size:24px;color:'+_AB.mut+'">'
        +(u.premium==null?'–':u.premium)+'</div>'
      +'<div class="bunter">Premium</div></div></div>';
    setz('abRegion',kopf+'<div id="abKarte" class="abkarte"><div class="blade">Karte lädt…</div></div>');
    try{
      var r=await client.rpc('cb_bundesland_zaehlung');
      var k=r&&r.data; if(typeof k==='string') k=JSON.parse(k);
      if(r&&r.error) throw r.error;
      var box=document.getElementById('abKarte'); if(!box) return;
      if(!(k&&k.ok)){ box.innerHTML='<div class="bleerk">Keine Regionsdaten.</div>'; return; }
      var ges=Number(k.gesamt_mit_angabe)||0;
      if(!ges){ box.innerHTML='<div class="bleerk">Noch keine Angabe zum Bundesland.</div>'; return; }
      /* entKarteDE ist die BESTEHENDE Kartenfunktion — nicht nachgebaut (§22).
         Ralph wollte die Karte kleiner; das macht die Kachelbreite, nicht ein
         zweiter Zeichner. */
      box.innerHTML=entKarteDE(k.laender, ges, Number(u.gesamt)||0);
    }catch(e){
      var b=document.getElementById('abKarte');
      if(b) b.innerHTML='<div class="bfehl">Karte nicht ladbar.<br>'
        +esc((e&&e.message)||String(e))+'</div>';
      try{ console.error('[Bento2] Karte', e); }catch(_){}
    }
  })();

  /* --- Stamm-Ueberblick ----------------------------------------------------
     🔴 20.08.2026, Work #121: RIEGEL statt Loeschung. Die Standardkachel
     „Stamm" liest ihre Zahlen jetzt aus dem Cockpit und legt keinen Container
     #abStammU mehr an — dieser Block liefe also ins Leere und wuerde dabei
     trotzdem die 4,9-Sekunden-RPC ziehen. Der Riegel ist derselbe wie beim
     Wirkketten-Block darunter. Der Code bleibt stehen, samt seiner
     Waechter-Drilldowns, falls die alte Kachel zurueckgeholt wird (§3.7:
     abschalten schlaegt loeschen). */
  (async function(){
    if(!document.getElementById('abStammU')) return;
    var zweiter=false;
    try{
      var r=await client.rpc('cb_admin_stamm_waechter');
      /* Ein automatischer Nachschlag, wie beim Stammwaechter oben — dieselbe
         Ursache (#17), deshalb dieselbe Behandlung und nicht eine zweite. */
      if(r.error && /timeout|canceling statement/i.test(r.error.message||'')){
        zweiter=true;
        setz('abStammU','<div class="blade">erster Versuch zu langsam — zweiter läuft…</div>');
        await new Promise(function(w){ setTimeout(w,700); });
        r=await client.rpc('cb_admin_stamm_waechter');
      }
      if(r.error) throw r.error;
      var s=r.data||{}, N=s.neu||{}, AL=s.alt||{};
      /* 🔴 16.08.2026, Work #34, Ralph-Entscheid A: „nur die Anzeige wie unten
         bringt nichts, da muss ich schon etwas machen oder entscheiden koennen."
         Weg A heisst: JEDE Zahl fuehrt zu ihren Zeilen. Entscheiden kommt spaeter,
         je Waechter — geraten wird kein Knopf (§1).
         §22 ZUM SECHSTEN MAL: der Leseweg war schon da. cb_admin_stamm_waechter_liste
         deckt vier Waechter ab (regelfaelle · widersprueche_aktiv · doppelte_note ·
         quelle_offen), „unbewertet" laeuft ueber cb_admin_stamm_neu_liste(p_bewertung).
         Nichts davon wurde neu gebaut.
         Die uebrigen sechs haben SERVERSEITIG keine Liste. Sie bleiben deshalb
         bewusst stumpf und sagen im Titel, warum — eine Zahl, die so tut, als
         fuehrte sie irgendwohin, ist schlimmer als eine, die es zugibt. */
      var z=function(l,v,warn,wk){
        var n=Number(v)||0, klick=(wk&&n>0);
        return '<div class="bzeile'+(klick?' bklick':'')+'"'
          +(klick?' data-wk="'+esc(wk)+'" data-wl="'+esc(l)+'" data-wn="'+n+'" role="button" tabindex="0"'
                  +' title="Klick zeigt die '+n+' betroffenen Zeilen"'
                : (wk===null&&n>0?' title="Für diesen Wächter gibt es serverseitig noch keine Liste — als Work Item gemeldet."':''))
          +'><span>'+l+(klick?' <span class="bpfeil">›</span>':'')+'</span><b'
          +(warn&&n>0?' style="color:'+_AB.warn+'"':'')+'>'
          +(v==null?'–':v)+'</b></div>'; };
      /* 🔴 15.08.2026, Ralph: „den Stammwaechter oben brauchen wir dann nicht mehr, der ist
         unten in Stamm-Ueberblick — ggf. fehlendes unten ergaenzen."
         GEMESSENE DIFFERENZ vor dem Ergaenzen: die Kachel zeigte 6 von 12 Zahlen. Es fehlten
         vier des neuen Stamms (Reviewproblem · retired ohne Nachfolger · Alias auf nicht aktiv ·
         Legacy-Bindung auf nicht aktiv) und zwei des alten (Regelfaelle · Notenkonflikte) —
         ausgerechnet die vier ROTEN, also die, bei denen etwas zu tun ist. Dazu fehlten der
         Weg in den Stamm-Bereich (Ralph P12: was einen Weg hat, behaelt ihn) und der Hinweis,
         woher die Alt-Zahlen kommen.
         Die Reihenfolge ist woertlich die der Box oben uebernommen, damit niemand zwei
         Anordnungen derselben Zahlen im Kopf halten muss. */
      /* 🔴 17.08.2026, Ralph zum zweiten Mal: „da ist nirgends 740."
         Er hatte wieder recht, und Scrollen war die falsche Antwort. Die Kachel
         zeigte 13 Zeilen, davon FUENF mit Wert 0 — und ausgerechnet die beiden
         groessten Zahlen des ganzen Blocks (Regelfaelle 740, Quelle offen 554)
         standen ganz unten, verdraengt von Nullen. Wer zweimal scrollen muss,
         um die wichtigste Zahl zu sehen, findet sie nicht.
         JETZT: stille Zeilen werden je Block zu EINER Zeile zusammengefasst.
         Nichts ist versteckt — die Namen stehen darin, und wo eine 0 steht, gibt
         es ohnehin nichts anzuklicken. 13 Zeilen -> 9. */
      var still=[], sichtbar=function(l,v,warn,wk){
        if(Number(v)===0){ still.push(l); return ''; }
        return z(l,v,warn,wk);
      };
      var stillZeile=function(){
        if(!still.length) return '';
        var t=still.slice(); still=[];
        return '<div class="bzeile" style="opacity:.62" title="'+esc(t.join(' · '))+'">'
          +'<span>'+t.length+' still</span><b style="color:'+_AB.gut+'">✓</b></div>'
          +'<div style="font-size:10px;color:'+_AB.mut+';line-height:1.35;margin:-2px 0 2px">'
          +esc(t.join(' · '))+'</div>';
      };
      setz('abStammU',
         '<div class="babs" style="color:'+_AB.kern+'">Neu · Canonical, maßgeblich</div>'
        + z('aktiv',N.active_total)
        + sichtbar('unbewertet',N.unbewertet,true,'neu:unbewertet')
        + sichtbar('ohne Profil',N.ohne_profil,true,'neu:ohne_profil')
        + sichtbar('Reviewproblem',N.bewertet_nicht_approved,true,'neu:reviewproblem')
        + sichtbar('retired ohne Nachfolger',N.retired_ohne_nachfolger,true,'neu:retired')
        + sichtbar('Alias auf nicht aktiv',N.auto_alias_auf_nichtaktiv,true,'neu:alias')
        + sichtbar('Legacy-Bindung auf nicht aktiv',N.legacy_bindung_auf_nichtaktiv,true,'neu:legacy')
        + stillZeile()
        +'<div class="babs" style="margin-top:10px;color:'+_AB.grau+'">Alt · Legacy, Übergang</div>'
        + z('Einträge',AL.gesamt)
        + sichtbar('Regelfälle',AL.regelfaelle,true,'alt:regelfaelle')
        + sichtbar('Quelle offen',AL.quelle_offen,true,'alt:quelle_offen')
        + sichtbar('Widersprüche',AL.widersprueche_aktiv,true,'alt:widersprueche_aktiv')
        + sichtbar('Notenkonflikte',AL.doppelte_note,true,'alt:doppelte_note')
        + stillZeile()
        +'<div style="font-size:10.5px;color:'+_AB.mut+';margin-top:7px;line-height:1.4">'
        /* Work #112, 20.08.2026: dieselbe Korrektur wie im Freigabe-Tab. Diese
           Kachel ist seit #121 abgeschaltet, der Satz aber nicht weniger falsch
           — und wer sie zurueckholt, holt sonst die geloeschte Tabelle mit. */
        +'Alt-Zahlen aus <code>shadow_v1.legacy_ingredient_source_ref</code>, nicht aus dem '
        +'Canonical-Stamm — Kontrolle für den Übergang.</div>'
        +'<button type="button" class="bgo2" onclick="navTo(\'freigabe\');fgTab(\'stamm\')" '
        +'style="margin-top:9px;padding:5px 11px;border:1px solid var(--line);border-radius:8px;'
        +'background:var(--card);color:var(--ink);font-size:12px;font-weight:700;cursor:pointer">'
        +'Stamm öffnen →</button>'
        +(zweiter?'<div style="font-size:10.5px;color:'+_AB.warn+';margin-top:7px;line-height:1.4">'
          +'⚠ erst im zweiten Anlauf geladen — die Abfrage liegt auf der Zeitgrenze.</div>':'')
        +'<div class="bmehr" id="abStammMehr" style="display:none">↓ weiter scrollen</div>');
      _abStammKlickNach();
      _abStammMehrPruefen();
    }catch(e){
      /* Derselbe Timeout wie beim Stammwaechter (#17). Hier steht er in einer
         Kachel und blockiert nichts — mit Knopf statt Sackgasse. */
      var m=(e&&e.message)||String(e);
      var to=/timeout|canceling statement/i.test(m);
      setz('abStammU','<div class="bfehl"><b>Zahlen fehlen.</b><br>'
        +(to?'Die Abfrage brauchte zu lange (bekannt, Datenbankseite).':esc(m))
        +'<br><button type="button" class="abschnell" style="margin-top:7px" '
        +'onclick="_abStammUNach()">nochmal holen</button></div>');
      try{ console.error('[Bento2] Stamm', e); }catch(_){}
    }
  })();
}
/* ---------------------------------------------------------------------------
   WORK #34, Weg A: eine Stamm-Waechterzahl fuehrt zu ihren Zeilen.
   🔴 KEINE ZWEITE LISTE. Die Zeilen kommen so, wie der Server sie fuehrt —
   es wird nichts umbenannt, nichts gerechnet, nichts weggelassen. Angezeigt
   werden die Felder, die die Zeile hat; der Rest steht darunter als Feld:Wert.
   Fuer Produkte und Zutaten gibt es einen Weg weiter, sonst nicht.
   --------------------------------------------------------------------------- */
var _AB_STAMM_WEG={
  /* Woher die Zeilen kommen — GEMESSEN aus pg_get_functiondef, nicht geraten.
     'liste'  : cb_admin_stamm_waechter_liste(p_waechter,…) kennt genau diese vier.
     'unbew'  : cb_admin_stamm_neu_liste(…,p_bewertung='ohne') aus Work #14. */
  'alt:regelfaelle':        {art:'liste', key:'regelfaelle'},
  'alt:widersprueche_aktiv':{art:'liste', key:'widersprueche_aktiv'},
  'alt:doppelte_note':      {art:'liste', key:'doppelte_note'},
  'alt:quelle_offen':       {art:'liste', key:'quelle_offen'},
  'neu:unbewertet':         {art:'unbew'},
  /* 🔴 17.08.2026: ChatGPT hat die fuenf fehlenden Listen nachgeliefert. GEMESSEN
     durch Aufruf jedes Schluessels, nicht aus dem Funktionstext gelesen — mein
     erster Versuch suchte per Muster im Quelltext und fand sie NICHT, obwohl sie
     da waren. Derselbe Fehlertyp wie beim abgeschnittenen Regeltext (§31.2):
     ein Werkzeug mit unvollstaendiger Sicht antwortet trotzdem.
     Gemessen 17.08.: ohne_profil 3 · reviewproblem 1 · retired 0 · alias 0 ·
     legacy 0 · regelfaelle 740 · quelle_offen 554 · widersprueche 0 · doppelte 0. */
  'neu:ohne_profil':        {art:'liste', key:'ohne_profil'},
  'neu:reviewproblem':      {art:'liste', key:'reviewproblem'},
  'neu:retired':            {art:'liste', key:'retired_ohne_nachfolger'},
  'neu:alias':              {art:'liste', key:'alias_auf_nicht_aktiv'},
  'neu:legacy':             {art:'liste', key:'legacy_bindung_auf_nicht_aktiv'}
};
/* Zeigt den Scroll-Hinweis NUR, wenn wirklich etwas unter dem Rand liegt —
   gemessen an scrollHeight gegen clientHeight, nicht angenommen. */
function _abStammMehrPruefen(){
  var b=document.getElementById('abStammU'), h=document.getElementById('abStammMehr');
  if(!b||!h) return;
  var mehr=function(){ return b.scrollHeight - b.clientHeight > 8; };
  var setz=function(){ h.style.display=(mehr() && b.scrollTop + b.clientHeight < b.scrollHeight - 8)?'':'none'; };
  setz();
  b.addEventListener('scroll',setz);
  try{ addEventListener('resize',setz); }catch(e){}
}
/* Wovon handeln diese Zeilen? Zaehlt die Befunde der GELADENEN Zeilen. */
function _waVerteilung(rows, geladen, total){
  var z={}, n=0;
  (rows||[]).forEach(function(r){
    var k=String(r.detail||'').split(' · ')[0];
    if(!k) return; z[k]=(z[k]||0)+1; n++;
  });
  var l=Object.keys(z).map(function(k){ return {k:k,n:z[k]}; })
        .sort(function(a,b){ return b.n-a.n; });
  if(!n || l.length>6) return '';                 /* zu bunt, sagt nichts aus */
  if(l.length===1 && geladen<3) return '';        /* zu wenig, um etwas zu sagen */
  return '<div style="background:#f5f7f9;border-radius:9px;padding:8px 11px;margin-bottom:10px;'
    +'font-size:12px;line-height:1.5">'
    +'<b>Wovon handeln sie:</b> '
    +l.map(function(x){ return esc(x.k)+' <b>'+x.n+'×</b>'; }).join(' · ')
    +'<div style="font-size:10.5px;color:var(--muted,#6b7a85);margin-top:3px">'
    +'gezählt über die '+geladen+' geladenen Zeilen'
    +(total!=null&&total>geladen?', nicht über alle '+total:'')+'</div></div>';
}
function _abStammKlickNach(){
  var box=document.getElementById('abStammU'); if(!box) return;
  box.querySelectorAll('.bzeile.bklick').forEach(function(r){
    var auf=function(){ _abStammZeilen(r.dataset.wk, r.dataset.wl, Number(r.dataset.wn)); };
    r.addEventListener('click',auf);
    r.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); auf(); } });
  });
}
async function _abStammZeilen(wk, label, kachelZahl){
  var w=_AB_STAMM_WEG[wk]; if(!w) return;
  var ov=document.getElementById('waFaelleOv');
  if(!ov){ ov=document.createElement('div'); ov.id='waFaelleOv';
    ov.style.cssText='position:fixed;inset:0;z-index:9998;display:flex;align-items:flex-start;'
      +'justify-content:center;background:rgba(20,32,48,.45);overflow:auto;padding:24px 12px';
    ov.onclick=function(e){ if(e.target===ov) ov.remove(); };
    document.body.appendChild(ov); }
  ov.innerHTML='<div style="background:var(--card,#fff);color:var(--ink,#22343a);border-radius:16px;'
    +'max-width:820px;width:100%;box-shadow:0 20px 60px rgba(20,40,70,.32);padding:20px;margin:auto">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">'
    +'<div style="font-weight:800;font-size:17px">🛡️ '+esc(label||wk)+'</div>'
    +'<button onclick="var o=document.getElementById(\'waFaelleOv\');if(o)o.remove()" '
    +'style="border:0;background:var(--bg,#eef2f5);border-radius:8px;width:30px;height:30px;'
    +'cursor:pointer;font-size:16px">✕</button></div>'
    +'<div id="waFaelleBody" style="font-size:13px;color:var(--muted,#6b7a85);margin-top:10px">Lade Zeilen …</div></div>';
  try{
    var rows=[], total=null;
    if(w.art==='liste'){
      var r=await client.rpc('cb_admin_stamm_waechter_liste',{p_waechter:w.key,p_limit:200,p_offset:0});
      if(r.error) throw new Error(r.error.message);
      var d=r.data||{}; total=d.total; rows=(d.rows||[]).map(_waZeileDeuten);
    }else{
      /* Work #14: derselbe Weg, den der Stamm-Bereich schon benutzt. */
      var r2=await client.rpc('cb_admin_stamm_neu_liste',
        {p_suche:null,p_status:'active',p_limit:200,p_offset:0,p_bewertung:'ohne'});
      if(r2.error) throw new Error(r2.error.message);
      var d2=r2.data||{}; total=d2.total;
      rows=(d2.rows||d2.zeilen||[]).map(_waZeileDeuten);
    }
    var b=document.getElementById('waFaelleBody'); if(!b) return;
    if(!rows.length){ b.innerHTML='<div style="color:#1e6b42">Keine offenen Zeilen — still. ✓</div>'; return; }
    b.style.color='var(--ink,#22343a)';
    /* 🔴 17.08.2026, durch Ralphs Screenshot gefunden: die Kachel zeigte
       „Regelfaelle 4", die Liste lieferte 740 Zeilen. Zwei Zahlen fuer denselben
       Waechter — die Kachel liest den Zwischenspeicher, die Liste die View (§4.2).
       Ich kann das hier nicht heilen, beide Quellen gehoeren nicht mir. Aber ein
       Widerspruch, der niemandem auffaellt, ist gefaehrlicher als einer, der
       danebensteht. Also steht er daneben. */
    var streit=(kachelZahl!=null && total!=null && Number(kachelZahl)!==Number(total));
    b.innerHTML=(streit
      ? '<div style="background:#fdf1f1;border:1px solid #e6b8b8;border-radius:9px;padding:9px 11px;'
        +'margin-bottom:9px;font-size:12px;line-height:1.45;color:#8a2b2b">'
        +'<b>Die Kachel sagt '+esc(String(kachelZahl))+', diese Liste hat '+esc(String(total))+'.</b><br>'
        +'Beides kommt vom Server, aber aus zwei Quellen: die Kachelzahl aus einem '
        +'Zwischenspeicher, die Liste direkt aus der Prüfsicht. Gemeldet — verlass dich '
        +'auf die Liste, nicht auf die Kachelzahl.</div>'
      : '')
      +'<div style="margin-bottom:6px;color:var(--muted,#6b7a85)">'
      +rows.length+' von '+(total==null?rows.length:total)+' Zeilen'
      +(total!=null&&total>rows.length?' — die ersten 200':'')+'</div>'
      /* 🔴 17.08.: Ralphs Liste war 200-mal dieselbe Zeile. Gemessen am ganzen
         Bestand sind 739 der 740 „Regelfaelle" derselbe Fall (Bewertung fehlt)
         und nur EINER eine echte Regelverletzung. Diese Verteilung gehoert an
         den Anfang, sonst blaettert man 200 Zeilen fuer eine Erkenntnis.
         Gezaehlt wird NUR ueber die geladenen Zeilen — und das steht auch dabei,
         damit die Zahl nicht fuer den Gesamtbestand gehalten wird (§1.3). */
      +_waVerteilung(rows, rows.length, total)
      +rows.map(function(x){
        var prod=(x.typ==='produkt');
        return '<div style="display:flex;align-items:flex-start;gap:8px;padding:9px 0;'
          +'border-top:1px solid var(--line,#e3e9ec)">'
          +'<div style="flex:1 1 240px;min-width:0">'
          +'<div style="font-weight:700">'+esc(x.name||x.id)+'</div>'
          +'<div style="font-size:11.5px;color:var(--muted,#6b7a85)">'+esc(x.detail||'')+'</div></div>'
          +(prod?'<button onclick="dashOpenProdukt(\''+esc(x.id)+'\');'
              +'var o=document.getElementById(\'waFaelleOv\');if(o)o.remove()" '
              +'style="flex:0 0 auto;border:1px solid #107e3e;background:#eef8f1;color:#1e6b42;'
              +'border-radius:9px;padding:7px 13px;font-weight:700;font-size:12.5px;cursor:pointer">'
              +'Öffnen ›</button>':'')
        +'</div>'; }).join('')
      +'<div style="font-size:11px;color:var(--muted,#6b7a85);margin-top:10px;line-height:1.45">'
      +'🔴 Weg A (Ralph 16.08.): hier wird <b>gezeigt</b>, noch nicht entschieden. '
      +'Was du je Wächter tun können sollst, steht noch nicht fest — ein geratener Knopf '
      +'wäre schlimmer als keiner.</div>';
  }catch(e){
    var b2=document.getElementById('waFaelleBody');
    if(b2){ b2.style.color='#cf5442'; b2.textContent='Konnte die Zeilen nicht laden: '+((e&&e.message)||e); }
    try{ console.warn('[Stamm-Zeilen]',wk,e); }catch(_){}
  }
}
if(typeof window!=='undefined'){ window._abStammZeilen=_abStammZeilen; }

/* Eigener Einstieg fuer den Wiederholen-Knopf — er darf nicht die ganze Reihe
   neu laden, nur seine Kachel. */
async function _abStammUNach(){
  var e=document.getElementById('abStammU'); if(!e) return;
  e.innerHTML='<div class="blade">lädt…</div>';
  try{ await _abBento2Laden(_abD); }catch(x){ try{ console.error('_abStammUNach',x); }catch(_){} }
}
if(typeof window!=='undefined') window._abStammUNach=_abStammUNach;

/* Kleiner Ring fuer die Kachel. Bewusst NUR eine Zusammenfassung — den
   klickbaren Ring mit Einzelsegmenten gibt es weiter unten in voller Groesse
   (_abRing). Hier waere er zu klein zum Treffen. */
function _abRingKlein(w,A){
  var ges=w.length||1, still=ges-A.melden;
  var u=2*Math.PI*26, anteil=still/ges;
  var f=(A.gate_offen>0)?_AB.krit:(A.melden>0?_AB.warn:_AB.gut);
  return '<svg width="62" height="62" viewBox="0 0 62 62" style="flex:0 0 auto">'
    +'<circle cx="31" cy="31" r="26" fill="none" stroke="#eef0f4" stroke-width="7"/>'
    +'<circle cx="31" cy="31" r="26" fill="none" stroke="'+f+'" stroke-width="7" '
      +'stroke-linecap="round" stroke-dasharray="'+(u*anteil).toFixed(1)+' '+u.toFixed(1)+'" '
      +'transform="rotate(-90 31 31)"/></svg>';
}

/* --------------------------------------------------------------------------- */
function dashArbeitHtml(d,np,fehler){
  _abD=d; _abNp=np;
  var A=_abAbl(np);
  var ri=(d&&d.riki)||{}, k=(d&&d.katalog)||{}, q=(d&&d.qualitaet)||{}, ex=(np&&np.extra)||{};
  var lim=Number(ri.monatslimit_usd)||0, verbr=Number(ri.monat_usd)||0;
  var ans=dashArbeitAnsichtGet();
  var h='<div class="ab">';
  /* 🔴 DURCHGANG 2 (15.08.2026): Kopfzeile und KPI-Reihe sind durch Hero + Bento
     ERSETZT, nicht ergaenzt. Beides zu zeigen hiesse, dieselbe Zahl zweimal auf
     eine Seite zu schreiben — und zwei Zahlen auf derselben Seite widersprechen
     sich irgendwann (§4.2). Der Umschalter und der Aktualisieren-Knopf sind in
     den Hero gewandert und behalten ihre IDs (#abStand, #abNeu), damit
     _abUmschalterNach() unveraendert weiterfunktioniert.
     Was aus der KPI-Reihe wohin ging: Katalog + Index-Schnitt -> Kachel
     „Datenbestand" · Wartestapel -> Hero · Waechter melden -> Hero und Kachel
     „Waechter-Status" · Riki-Budget -> Kachel „Riki-Budget". Keine Zahl ist
     weggefallen. */
  h+=_abHero(d,np,A,ans);
  if(fehler) h+='<div class="abfehler"><b>Live-Daten unvollständig.</b> '+esc(fehler)
    +' — betroffene Felder bleiben leer oder grau. Grau heißt: wir wissen es nicht.</div>';

  /* Beide Bento-Reihen liegen in EINEM Behaelter, damit der Anordnen-Modus sie
     zusammen neu zeichnen kann, ohne die Seite neu zu laden. */
  h+='<div id="abBentoBox">'+_abEditLeiste()+_abProjektzeitHtml()+_abBento(d,np,A)+_abBento2()
    +'<div id="abZeitBox"></div>'+_abCmdHtml()+'</div>';

  /* ==========================================================================
     DETAILEBENE UNTER DEM BENTO  ·  entdoppelt am 20.08.2026, Work #121
     --------------------------------------------------------------------------
     🔴 HIER STANDEN VIER BLOECKE, DREI DAVON ZEIGTEN DIESELBEN ZAHLEN NOCH
     EINMAL. Bis heute war das begruendet: „hier sitzen die Drilldowns, die das
     Bento nicht hat" (Ralph P12). Seit #121 HAT das Bento Drilldowns — jede
     Zahl mit drill_key oeffnet cb_admin_dashboard_cockpit_drill mit echten
     Zeilen. Damit faellt die Begruendung weg, und was bleibt, ist eine zweite
     Anzeige derselben Sache (§4.2, Kriterium 8).

     GEMESSEN 20.08. gegen cb_netzplan, bevor etwas entfernt wurde:
       · „Alle offenen Punkte"  = dieselben 6 Zufluesse wie die Kachel Eingang
       · „Herzschlag"           = dieselben 3 Takte wie die Kachel Betrieb
       · „Zutaten im Stamm 705" = Legacy-Zaehler; das Cockpit sagt 944 aus
         Canonical. ZWEI Zahlen fuer dieselbe Frage, und #121 verbietet den
         Altstamm-Zeilencount als Kennzahl ausdruecklich.
       · „Tagebuch, 7 Tage"     = steht in der Kachel Nutzung (131)
     WAS BLEIBT, weil es diese Zahlen NUR hier gibt:
       · der Waechterring und das Raster darunter — 23 Waechter, das Cockpit
         fuehrt nur die 8 Gate-Waechter. Die uebrigen 15 haetten sonst keinen Ort.
       · „Woher der Katalog stammt" — 6 Quellen mit Zahlen, im Cockpit nicht.
       · Rezepte und Regelwerk-Bereiche — ebenfalls nirgends sonst.

     KEIN WEG GEHT VERLOREN (Ralph P12): die Zeilen von _abJobs sprangen an eine
     Stelle der Seite; die Kachel Eingang oeffnet stattdessen die Serverliste
     der wartenden Eintraege. Das ist mehr, nicht weniger. _abJobsListe bleibt
     unangetastet — die freie Kachel vom Typ „liste" liest sie weiter.
     ========================================================================== */
  h+='<div class="abrow r1" id="abDetail">'
    +'<div class="abp"><div class="abph"><h3>Alle Wächter im Einzelnen</h3>'
    +'<span class="abtag" style="background:#eef0f4;color:'+_AB.mut+'">'+A.melden+' von '
    +((np&&np.waechter)||[]).length+' melden</span></div>'
    +_abRing(np,A)
    +'<div class="abfoot">Jedes Segment ist ein Wächter · blass = still · Zeiger drauf für Klartext · '
    +'⛔ blockiert die Freigabe. <b>Die Kachel „Qualität" oben zeigt nur die '
    +'Gate-Wächter</b> — hier stehen alle.</div></div>'
    +'<div class="abp abpad"><div style="font-weight:700;font-size:12.5px;margin-bottom:8px">'
    +'Woher der Katalog stammt</div>'+_abQuellen(np)
    +'<div style="margin-top:11px;padding-top:9px;border-top:1px solid var(--line)">'
    +'<div class="abkv"><span>Rezepte</span><b>'+(ex.rezepte==null?'–':ex.rezepte)+'</b></div>'
    +'<div class="abkv"><span>Regelwerk</span><b>'+(((np&&np.regelwerk)||[]).length)+' Bereiche</b></div>'
    +'</div></div></div>';

  /* Reihe 3: Wächter-Raster */
  h+='<div class="abp"><div class="abph"><h3>Alle Wächter</h3>'
    +'<span class="abtab on" data-wf="alle">alle '+((np&&np.waechter)||[]).length+'</span>'
    +'<span class="abtab" data-wf="melden">melden ('+A.melden+')</span>'
    +'<span class="abtab" data-wf="gate">Go-Live-Gate</span>'
    +'<span class="abtab" data-wf="anlage">Anlage</span>'
    +'<span class="abtab" data-wf="tuer">Tür</span>'
    +'<span class="abtab" data-wf="bestand">Bestand</span></div>'
    +'<div class="abwg" id="abWg"></div><div class="abfoot" id="abWf"></div></div>';

  h+='</div>';
  return h;
}

/* ---------------------------------------------------------------------------
   Nach dem Rendern verdrahten. Getrennt, weil innerHTML die Handler wegwirft.
   --------------------------------------------------------------------------- */
function dashArbeitNach(d,np){
  var A=_abAbl(np), box=document.getElementById('fgDash'); if(!box) return;
  var st=document.getElementById('abStand');
  if(st&&np&&np.stand){
    try{ st.textContent='Stand '+new Date(np.stand)
      .toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }
    catch(e){ st.textContent='Stand unbekannt';
      try{ console.warn('Stand-Zeit nicht lesbar:',np.stand,e); }catch(_){} }
  }
  _abUmschalterNach();

  /* Ring-Segmente: Klick springt in die passende Wächter-Gruppe */
  var wl=[]; ['anlage','tuer','bestand'].forEach(function(m){
    ((np&&np.waechter)||[]).filter(function(x){return x.moment===m;}).forEach(function(x){ wl.push(x); }); });
  box.querySelectorAll('#abRing .abseg').forEach(function(p){
    var w=wl[Number(p.dataset.w)]; if(!w) return;
    p.addEventListener('mouseenter',function(){ p.setAttribute('opacity','1'); });
    p.addEventListener('mouseleave',function(){ p.setAttribute('opacity',(Number(w.offen)||0)===0?'0.26':'1'); });
    p.addEventListener('click',function(){ _abWfSet(w.moment,np,A); });
  });
  /* Arbeitsliste: Sprünge in die bestehenden Ansichten - keine neuen Wege */
  /* 🔴 15.08.2026: der Sprung steht jetzt an EINER Stelle und wird von der alten
     Liste UND von den neuen Bento-Zeilen benutzt. Vorher haette die Kachel ihre
     eigene Sprungtabelle gebraucht — zwei Orte, die auseinanderlaufen (§4.2). */
  /* 15.08. Work #42/E5: aus der lokalen Variablen wurde eine Funktion im
     Dateikopf-Rang — der Anordnen-Modus verdrahtet die Bento-Zeilen neu und
     kommt an eine Closure hier drin nicht heran. Inhalt unveraendert. */
  box.querySelectorAll('.abjob[data-ziel]').forEach(function(j){
    j.addEventListener('click',function(){ _abSprung(j.dataset.ziel); });
  });
  _abNachRest(box,d,np,A);
}

function _abSprung(z){
    try{
      if(z==='scan'&&typeof scanEingangOeffnen==='function') scanEingangOeffnen();
      else if(z==='todo'&&typeof todoDockAuf==='function') todoDockAuf();
      else if(z==='waechter'){ var g=document.getElementById('abWg'); if(g) g.scrollIntoView({behavior:'smooth',block:'center'}); }
      /* 'fluss' bleibt als Schluessel bestehen, damit ein alter, noch im DOM stehender
         data-ziel-Wert nicht ins Leere laeuft — beide zeigen auf dieselbe Stelle. */
      else if(z==='punkte'||z==='fluss'){ var f=document.getElementById('abDetail'); if(f) f.scrollIntoView({behavior:'smooth',block:'start'}); }
    }catch(e){ try{ console.warn('Sprung fehlgeschlagen:',z,e); }catch(_){} }
}

function _abNachRest(box,d,np,A){
  box.querySelectorAll('.abhero [data-hero]').forEach(function(x){
    x.addEventListener('click',function(){ _abSprung(x.getAttribute('data-hero')); });
  });
  /* Alles, was IN den Bento-Reihen haengt, wird an EINER Stelle verdrahtet —
     der Anordnen-Modus zeichnet sie neu und braucht dieselbe Verdrahtung.
     Zwei Fassungen davon waeren genau der Fall aus §4.2. */
  _abBentoNach(box);
  _abProjektzeitStart();
  /* Gespeichertes Layout holen — NACH dem ersten Zeichnen, nicht davor. Das
     Dashboard darf nicht auf eine Abfrage warten (dieselbe Regel wie Reihe 2,
     Work #17). Der Riegel in _abLayoutHolen sorgt dafuer, dass es genau einmal
     laeuft und das Neuzeichnen es nicht wieder anstoesst. */
  try{ _abLayoutHolen(); }catch(e){ try{ console.warn('[Layout]',e); }catch(_){} }
  /* Work #121: dieselbe Regel wie beim Layout — erst zeichnen, dann holen.
     Das Cockpit braucht gemessene 2,9 bis 3,8 s; solange steht „lädt" in Hero
     und Kacheln, und zwar sichtbar statt als leere Flaeche. */
  try{ _abCockpitHolen(); }catch(e){ try{ console.warn('[Cockpit v2]',e); }catch(_){} }
  var an=document.getElementById('abAnordnen');
  if(an) an.addEventListener('click',function(){
    an.classList.toggle('on', _abEditModus(!_AB_EDIT));
    _abNeuZeichnen();
  });
  box.querySelectorAll('.abtab[data-wf]').forEach(function(t){
    t.addEventListener('click',function(){
      box.querySelectorAll('.abtab[data-wf]').forEach(function(x){x.classList.remove('on');});
      t.classList.add('on'); _abWgMal(t.dataset.wf,np,A);
    });
  });
  if(document.getElementById('abWg')) _abWgMal('alle',np,A);
}
function _abWfSet(m,np,A){
  var box=document.getElementById('fgDash'); if(!box) return;
  box.querySelectorAll('.abtab[data-wf]').forEach(function(x){
    x.classList.toggle('on', x.dataset.wf===m); });
  _abWgMal(m,np,A);
  var g=document.getElementById('abWg'); if(g) g.scrollIntoView({behavior:'smooth',block:'center'});
}
/* Welche Quelle hat schon eine kuratierte Fallliste? GEMESSEN aus
   pg_get_functiondef('cb_waechter_faelle') am 16.08.2026 — nicht geraten.
   Diese neun bringen zusaetzlich den Befundtext und (bei 3) die Abhak-Knoepfe;
   die uebrigen 16 gehen ueber cb_admin_waechter_faelle_view. */
var _AB_WNR={
  'v_zutaten_qa_offen':1, 'v_zutaten_qa_r9':2, 'v_naehrwerte_qa_offen':3,
  'v_kategorie_qa_offen':4, 'v_zusatzstoffe_qa_offen':5, 'v_zusatzstoffe_neu_offen':6,
  'v_quelle_qa_offen':7, 'v_zutaten_namenlos_offen':8, 'v_score_achse_fehlt_offen':9
};
function _abWgMal(f,np,A){
  var g=document.getElementById('abWg'); if(!g) return;
  var l=((np&&np.waechter)||[]).slice();
  if(f==='melden') l=l.filter(function(x){return (Number(x.offen)||0)>0;});
  else if(f==='gate') l=l.filter(function(x){return x.gate===true;});
  else if(['anlage','tuer','bestand'].indexOf(f)>=0) l=l.filter(function(x){return x.moment===f;});
  l.sort(function(a,b){ return (Number(b.offen)||0)-(Number(a.offen)||0)
    || String(a.name).localeCompare(String(b.name)); });
  var MOM={anlage:'ANLAGE',tuer:'TÜR',bestand:'BESTAND'};
  /* 🔴 16.08.2026: die Kacheln waren NICHT klickbar (Ralph: „ich kann nicht
     klicken, nicht passiert und nichts wird angezeigt"). Der Weg dorthin war
     seit Monaten da — dashWaechterFaelle mit dem vollen Ueberlagerungsfenster,
     Oeffnen-Knopf und Abhaken. Es fehlte nur die Verdrahtung (§22). */
  g.innerHTML=l.map(function(w){
    var n=Number(w.offen)||0, fb=_abWf(w), still=n===0;
    var nr=_AB_WNR[w.view]||'';
    return '<div class="abwc" role="button" tabindex="0"'
      +' data-wview="'+esc(w.view||'')+'" data-wnr="'+nr+'" data-wname="'+esc(w.name||'')+'"'
      +' style="border-color:'+(still?'#e6e9ee':fb+'44')+';background:'
      +(still?'#fff':(w.gate===true?'#fdf1f1':'#fdf9ef'))+'" title="'+esc(w.kurz||'')
      +' · Quelle: '+esc(w.view||'')+' · Klick zeigt die Fälle">'
      +'<div class="g" style="color:'+fb+'">'+(w.gate===true?'⛔ GATE':(MOM[w.moment]||''))+'</div>'
      +'<div class="n">'+esc(w.name)+'</div>'
      +'<div class="z" style="color:'+(still?'#c6cbd3':fb)+'">'+(still?'still':n)+'</div></div>';
  }).join('')||'<div style="font-size:12.5px;color:'+_AB.mut+';padding:4px">Kein Wächter in dieser Auswahl.</div>';
  g.querySelectorAll('.abwc').forEach(function(c){
    var auf=function(){
      var nr=Number(c.dataset.wnr)||null;
      dashWaechterFaelle(nr, encodeURIComponent(c.dataset.wname||''), c.dataset.wview||'');
    };
    c.addEventListener('click',auf);
    c.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); auf(); } });
  });
  var wf=document.getElementById('abWf');
  if(wf) wf.innerHTML='<b>'+l.length+'</b> angezeigt · '+A.melden+' von '
    +((np&&np.waechter)||[]).length+' melden etwas · Go-Live-Gate: <b style="color:'
    +(A.gate_offen?_AB.krit:_AB.gut)+'">'+A.gate_offen+'</b> offen (muss 0 sein) · '
    +'Prüfpunkte: Anlage '+A.anlage.n+' · Tür '+A.tuer.n+' · Bestand '+A.bestand.n;
}

/* ---------------------------------------------------------------------------
   GRAPH-ANSICHT (Mockup A). Eigene Physik, kein CDN.
   --------------------------------------------------------------------------- */
var _abG={lauf:false,N:[],L:[],zieh:null,offen:null,filter:'alle',ruhe:false,sel:null};
function _abGraphStop(){ _abG.lauf=false; }
function _abGraphStart(np,A){
  var cv=document.getElementById('abCv'); if(!cv) return;
  var cx=cv.getContext('2d'), W=0;
  function groesse(){ var r=cv.getBoundingClientRect(); cv.width=r.width*devicePixelRatio;
    cv.height=560*devicePixelRatio; cx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); W=r.width; }
  groesse(); addEventListener('resize',groesse);

  function baue(){
    _abG.N=[]; _abG.L=[];
    var add=function(o){ _abG.N.push(Object.assign({vx:0,vy:0,r:9},o)); };
    add({id:'kern',t:'Root Index',art:'kern',farbe:_AB.kern,r:26,x:W*0.55,y:280,
         zahl:_abKernZahl(np,'aktiv'),unter:'aktive Produkte · Ø '+_abKernZahl(np,'schnitt')+' Index'});
    ((np&&np.zufluesse)||[]).forEach(function(z,i){
      var n=Number(z.wartend)||0;
      add({id:'zf'+i,t:String(z.name).split(' (')[0],art:'zufluss',z:z,farbe:_abZf(z),
        r:9+Math.min(15,Math.sqrt(n)*2.6),x:120,y:70+i*76,zahl:n,unter:z.was||''});
      _abG.L.push({a:'zf'+i,b:'pp0',len:z.weg==='keiner'?250:180,tot:z.weg==='keiner'});
    });
    [['anlage','Prüfpunkt Anlage',A.anlage],['tuer','Prüfpunkt Tür',A.tuer],
     ['bestand','Prüfpunkt Bestand',A.bestand]].forEach(function(p,i){
      var gate=((np&&np.waechter)||[]).filter(function(w){
        return w.moment===p[0]&&w.gate===true&&(Number(w.offen)||0)>0; }).length;
      add({id:'pp'+i,t:p[1],art:'pruef',moment:p[0],
        farbe:gate>0?_AB.krit:(p[2].o>0?_AB.warn:_AB.gut),
        r:13+Math.min(11,Math.sqrt(p[2].o)),x:W*0.36,y:120+i*150,zahl:p[2].o,
        unter:p[2].n+' Wächter · '+p[2].o+' Meldungen'});
      _abG.L.push({a:'pp'+i,b:'kern',len:200});
    });
    _abG.L.push({a:'pp0',b:'pp1',len:150}); _abG.L.push({a:'pp1',b:'pp2',len:150});
    ((np&&np.takte)||[]).forEach(function(t,i){
      var ser=Number(t.fehler_serie)||0;
      add({id:'tk'+i,t:t.takt,art:'takt',farbe:ser>0?_AB.krit:_AB.gut,r:11,x:W*0.8,y:90+i*70,
        puls:ser===0,unter:(ser>0?'scheitert '+ser+'×':'läuft')
          +(t.minuten_her==null?'':' · vor '+t.minuten_her+' Min')});
      _abG.L.push({a:'tk'+i,b:i===0?'kern':'pp0',len:210});
    });
    if(_abG.offen){
      var ws=((np&&np.waechter)||[]).filter(function(w){return w.moment===_abG.offen;});
      var p=_abG.N.filter(function(n){return n.moment===_abG.offen;})[0];
      if(p) ws.forEach(function(w,i){
        var ang=(i/ws.length)*Math.PI*2, n=Number(w.offen)||0;
        add({id:'w'+i,t:w.name,art:'waechter',w:w,farbe:n===0?_AB.grau:(w.gate===true?_AB.krit:_AB.warn),
          r:6+Math.min(9,Math.sqrt(n)*1.5),x:p.x+Math.cos(ang)*105,y:p.y+Math.sin(ang)*105,
          zahl:n,unter:w.kurz||''});
        _abG.L.push({a:p.id,b:'w'+i,len:100,duenn:true});
      });
    }
  }
  function sicht(n){
    if(_abG.filter==='probleme') return (Number(n.zahl)||0)>0||n.art==='kern'||n.farbe===_AB.krit;
    return true;
  }
  function finde(id){ for(var i=0;i<_abG.N.length;i++) if(_abG.N[i].id===id) return _abG.N[i]; return null; }
  var t0=0;
  function schritt(ts){
    if(!_abG.lauf) return;
    var dt=Math.min(32,ts-t0)||16; t0=ts;
    var vis=_abG.N.filter(sicht);
    if(!_abG.ruhe){
      for(var i=0;i<vis.length;i++) for(var j=i+1;j<vis.length;j++){
        var a=vis[i],b=vis[j],dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy; if(d2<1)d2=1;
        var dd=Math.sqrt(d2), soll=(a.r+b.r)*2.1+32;
        if(dd<soll*2.4){ var kk=Math.min(2.2,soll*soll/d2)*0.55;
          a.vx-=dx/dd*kk;a.vy-=dy/dd*kk;b.vx+=dx/dd*kk;b.vy+=dy/dd*kk; }
      }
      _abG.L.forEach(function(l){
        var a=finde(l.a),b=finde(l.b); if(!a||!b||!sicht(a)||!sicht(b)) return;
        var dx=b.x-a.x,dy=b.y-a.y,dd=Math.hypot(dx,dy)||1,kk=(dd-l.len)*0.0055;
        a.vx+=dx/dd*kk*10;a.vy+=dy/dd*kk*10;b.vx-=dx/dd*kk*10;b.vy-=dy/dd*kk*10;
      });
      vis.forEach(function(n){
        if(n===_abG.zieh) return;
        n.vx+=(W*0.5-n.x)*0.0009*(n.art==='kern'?4:1);
        n.vy+=(280-n.y)*0.0009*(n.art==='kern'?4:1);
        n.vx*=0.86;n.vy*=0.86; n.x+=n.vx*dt*0.06; n.y+=n.vy*dt*0.06;
        n.x=Math.max(n.r+66,Math.min(W-n.r-66,n.x));
        n.y=Math.max(n.r+22,Math.min(560-n.r-22,n.y));
      });
    }
    cx.clearRect(0,0,W,560);
    _abG.L.forEach(function(l){
      var a=finde(l.a),b=finde(l.b); if(!a||!b||!sicht(a)||!sicht(b)) return;
      if(l.tot){
        var dx=b.x-a.x,dy=b.y-a.y,dd=Math.hypot(dx,dy)||1;
        var ex=a.x+dx/dd*dd*0.42, ey=a.y+dy/dd*dd*0.42;
        cx.strokeStyle='#e8b4b4';cx.lineWidth=2;cx.setLineDash([6,5]);
        cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(ex,ey);cx.stroke();cx.setLineDash([]);
        cx.strokeStyle=_AB.krit;cx.lineWidth=4;cx.beginPath();
        cx.moveTo(ex-dy/dd*9,ey+dx/dd*9);cx.lineTo(ex+dy/dd*9,ey-dx/dd*9);cx.stroke();
        return;
      }
      cx.strokeStyle=l.duenn?'#e9ecf1':'#dfe3ea'; cx.lineWidth=l.duenn?1:1.6;
      cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke();
    });
    _abG.N.filter(sicht).forEach(function(n){
      if(n.puls){ var p=(Math.sin(ts/560)+1)/2;
        cx.strokeStyle=n.farbe;cx.globalAlpha=0.16+p*0.2;cx.lineWidth=2;
        cx.beginPath();cx.arc(n.x,n.y,n.r+6+p*7,0,7);cx.stroke();cx.globalAlpha=1; }
      if(n.id===_abG.sel){ cx.strokeStyle=n.farbe;cx.globalAlpha=0.3;cx.lineWidth=8;
        cx.beginPath();cx.arc(n.x,n.y,n.r+5,0,7);cx.stroke();cx.globalAlpha=1; }
      cx.fillStyle='#fff';cx.beginPath();cx.arc(n.x,n.y,n.r,0,7);cx.fill();
      cx.strokeStyle=n.farbe;cx.lineWidth=n.art==='kern'?4:3;cx.stroke();
      if(Number(n.zahl)>0||n.art==='kern'){ cx.fillStyle=n.farbe;
        cx.font='700 '+Math.max(10,Math.min(15,n.r))+'px system-ui';
        cx.textAlign='center';cx.textBaseline='middle';cx.fillText(n.zahl,n.x,n.y); }
      cx.fillStyle=_AB.ink;cx.font=(n.art==='kern'?'700 12.5px':'600 11.5px')+' system-ui';
      cx.textAlign='center';cx.textBaseline='top';cx.fillText(n.t,n.x,n.y+n.r+5);
    });
    requestAnimationFrame(schritt);
  }
  function treffer(mx,my){
    var c=_abG.N.filter(sicht);
    for(var i=c.length-1;i>=0;i--) if(Math.hypot(c[i].x-mx,c[i].y-my)<=c[i].r+6) return c[i];
    return null;
  }
  cv.addEventListener('mousedown',function(e){ var r=cv.getBoundingClientRect();
    _abG.zieh=treffer(e.clientX-r.left,e.clientY-r.top); if(_abG.zieh) cv.classList.add('zieh'); });
  addEventListener('mousemove',function(e){ if(!_abG.zieh) return; var r=cv.getBoundingClientRect();
    _abG.zieh.x=e.clientX-r.left; _abG.zieh.y=e.clientY-r.top; _abG.zieh.vx=_abG.zieh.vy=0; });
  addEventListener('mouseup',function(){ _abG.zieh=null; cv.classList.remove('zieh'); });
  cv.addEventListener('click',function(e){ var r=cv.getBoundingClientRect();
    var n=treffer(e.clientX-r.left,e.clientY-r.top); if(!n) return;
    _abG.sel=n.id;
    if(n.art==='pruef'){ _abG.offen=(_abG.offen===n.moment)?null:n.moment; baue(); }
    _abGDet(n,np,A); });
  var rb=document.getElementById('abRuhe');
  if(rb) rb.addEventListener('click',function(){ _abG.ruhe=!_abG.ruhe;
    rb.textContent=_abG.ruhe?'Bewegung an':'Bewegung aus'; });
  document.querySelectorAll('#fgDash .abtab[data-gf]').forEach(function(t){
    t.addEventListener('click',function(){
      document.querySelectorAll('#fgDash .abtab[data-gf]').forEach(function(x){x.classList.remove('on');});
      t.classList.add('on'); _abG.filter=t.dataset.gf; });
  });
  baue(); _abG.lauf=true; _abGDet(finde('kern'),np,A); requestAnimationFrame(schritt);
}
function _abGDet(n,np,A){
  var d=document.getElementById('abDet'); if(!d||!n) return;
  var art={zufluss:'Zufluss',pruef:'Prüfpunkt',takt:'Takt',kern:'Kern',waechter:'Wächter'}[n.art]||'';
  var h='<div style="font-weight:800;font-size:15px;display:flex;gap:8px;align-items:center">'
    +'<span class="abdot" style="background:'+n.farbe+'"></span>'+esc(n.t)+'</div>'
    +'<div style="font-size:11.5px;color:'+_AB.mut+';margin-top:2px">'+art+'</div>'
    +'<div style="font-size:12.5px;color:'+_AB.mut+';line-height:1.6;margin-top:9px">'+esc(n.unter||'')+'</div>';
  if(n.art==='zufluss'&&n.z){
    h+='<div class="abkv"><span>wartet</span><b>'+(n.z.wartend||0)+'</b></div>'
      +'<div class="abkv"><span>ältester</span><b>'
      +(n.z.aeltester_tage==null?'—':n.z.aeltester_tage+' Tage')+'</b></div>';
    if(n.z.weg==='keiner') h+='<div style="font-size:11.5px;color:#8d2b2b;background:#fdf1f1;'
      +'border:1px solid #f0c2c2;border-radius:9px;padding:8px 10px;margin-top:9px">'
      +'Sackgasse: keine Automatik greift hier. '+esc(n.z.hinweis||'')+'</div>';
  }
  if(n.art==='pruef'){
    var ws=((np&&np.waechter)||[]).filter(function(w){return w.moment===n.moment;})
      .sort(function(a,b){return (Number(b.offen)||0)-(Number(a.offen)||0);});
    h+='<div class="abkv"><span>Wächter hier</span><b>'+ws.length+'</b></div>'
      +'<div class="abkv"><span>davon Gate</span><b>'+ws.filter(function(w){return w.gate===true;}).length+'</b></div>'
      +'<div style="max-height:240px;overflow:auto;margin-top:8px">';
    ws.forEach(function(w){
      var nn=Number(w.offen)||0;
      h+='<div style="display:flex;gap:8px;align-items:center;font-size:12px;padding:5px 0;'
        +'border-bottom:1px solid #f2f4f7"><span class="abdot" style="width:7px;height:7px;background:'
        +_abWf(w)+'"></span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;'
        +'white-space:nowrap">'+(w.gate===true?'⛔ ':'')+esc(w.name)+'</span>'
        +'<b style="color:'+(nn===0?_AB.grau:_abWf(w))+'">'+nn+'</b></div>';
    });
    h+='</div>';
  }
  d.innerHTML=h;
}

if(typeof window!=='undefined'){
  window.dashArbeitAnsichtSet=dashArbeitAnsichtSet;
  window.dashArbeitHtml=dashArbeitHtml;
  window.dashArbeitNach=dashArbeitNach;
}
