/* ============================================================================
   fahrplan-ui.js — die Fahrplanseite (Work #182, Ralph-Entscheid A, 21.08.2026)
   ----------------------------------------------------------------------------
   WAS DIESE DATEI IST
   Eine eigenstaendige Seite. Sie laedt NICHT app.js, NICHT dashboard-ui.js und
   NICHT ui.css. Grund: beim Bau lief parallel die Frontend-Modularisierung
   (Work #154 ff.) in genau diesen Dateien. Eine eigene Datei kollidiert nicht.

   WAS SIE NICHT TUT — und warum das eine Regel ist, kein Zufall
   · Sie erfindet KEINE Reihenfolge. Die Sortierung der Aufgaben kommt komplett
     aus cb_admin_agent_work_liste (ORDER BY im Server: decision_ralph → blocked
     → ready_for_verification → open → in_progress → Rest, dann priority desc,
     dann created_at). Hier wird die gelieferte Reihenfolge NUR gerendert.
   · Sie erfindet KEINEN Status. Es wird nichts abgeleitet, nichts umgerechnet.
   · Sie filtert NICHT im Browser. Status- und Zustaendigkeitsfilter werden als
     p_status / p_owner an den Server durchgereicht.
   · Sie SCHREIBT nichts. Meilensteine werden hier nur gelesen; bearbeitet
     werden sie weiterhin an der einen bestehenden Stelle im Dashboard
     (dashboard-ui.js, "Weg bis Go-Live"). Eine Regel, ein Ort.

   Das Einzige, was hier gerechnet wird, sind Tage bis zum Zieldatum — und das
   Zieldatum liefert der Server (cb_admin_meilensteine → .ziel).
   ============================================================================ */
(function () {
  "use strict";

  /* Zugangsdaten wie in app.js. Derselbe storageKey heisst: wer in der App
     angemeldet ist, ist hier angemeldet — gleiche Herkunft, gleiche Sitzung. */
  var SUPABASE_URL = "https://haurbpfkfaaehorirzee.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhdXJicGZrZmFhZWhvcmlyemVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDY2OTYsImV4cCI6MjA5Nzk4MjY5Nn0.6U0bD0m2kYM2iL0KJ9fbCFvcQMXAglr8GvwmPwyHqyw";

  var client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true, autoRefreshToken: true, detectSessionInUrl: true,
      storage: window.localStorage, storageKey: "sb-cleanbase-auth"
    }
  });

  /* ---- Beschriftung ------------------------------------------------------
     Nur Uebersetzung fuer die Anzeige. Die Schluessel links sind die echten
     Statuswerte aus der Datenbank; es kommt keiner dazu und keiner weg.
     Steht ein unbekannter Status in den Daten, wird er ROH angezeigt — lieber
     ein technischer Name als ein stillschweigend verschluckter Zustand. */
  var STATUS_TEXT = {
    decision_ralph:         "Ralph entscheidet",
    blocked:                "blockiert",
    disputed:               "strittig",
    ready_for_verification: "wartet auf Pruefung",
    open:                   "offen",
    in_progress:            "in Arbeit",
    verified:               "abgenommen",
    done:                   "fertig",
    cancelled:              "verworfen"
  };
  var STATUS_ZEICHEN = {
    decision_ralph: "🙋", blocked: "⛔", disputed: "⚖",
    ready_for_verification: "🔎", open: "○", in_progress: "⏳",
    verified: "✅", done: "✅", cancelled: "✖"
  };
  var OWNER_TEXT = { claude: "Claude", chatgpt: "ChatGPT", shared: "gemeinsam", riki: "RIKI", ralph: "Ralph" };

  /* Welche Filterknoepfe angeboten werden. Die Liste ist bewusst fest und
     entspricht den Statuswerten, die der Server kennt — sie wird nicht aus den
     geladenen Daten abgeleitet, sonst verschwaende ein Knopf, sobald gerade
     kein Fall dieses Status existiert, und man haelt den Filter fuer kaputt. */
  var FILTER_STATUS = ["decision_ralph", "blocked", "disputed", "ready_for_verification", "open", "in_progress", "verified"];
  var FILTER_OWNER  = ["claude", "chatgpt", "shared"];

  /* ---- Zustand der Seite (Anzeige, nicht Fachlogik) ---------------------- */
  var Z = {
    status: null,      // null = alle; sonst genau ein Statuswert → p_status
    owner: null,       // null = alle; sonst genau ein Agent   → p_owner
    aufgaben: [],
    meilensteine: [],
    ziel: null,
    offen: {}          // work_id → true, wenn die Karte aufgeklappt ist
  };

  /* ---- kleine Helfer ----------------------------------------------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function el(id) { return document.getElementById(id); }

  /* Datum: die Datenbank liefert JJJJ-MM-TT. Kein Date-Objekt fuer die
     Anzeige — ein "2026-10-01" wuerde je nach Zeitzone zum 30.09. werden. */
  function datDe(iso) {
    var m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[3] + "." + m[2] + "." + m[1] : (iso || "");
  }
  function zeitDe(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) +
           ", " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }
  /* Tage zwischen zwei Kalendertagen, ohne Uhrzeit — reine Rechnung. */
  function tageBis(iso) {
    var m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    var ziel = Date.UTC(+m[1], +m[2] - 1, +m[3]);
    var n = new Date();
    var heute = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
    return Math.round((ziel - heute) / 86400000);
  }
  function statusText(s)   { return STATUS_TEXT[s] || s || "ohne Status"; }
  function statusZeichen(s){ return STATUS_ZEICHEN[s] || "•"; }
  function ownerText(o)    { return OWNER_TEXT[o] || o || "niemand"; }

  /* ---- Laden -------------------------------------------------------------
     Beide Leseweg-Funktionen pruefen serverseitig auf Admin und werfen sonst
     "Nur Admins." Das wird hier nicht abgefangen und schoengeredet, sondern
     angezeigt: eine leere Seite ohne Grund ist schlimmer als eine Fehlermeldung. */
  async function ladeMeilensteine() {
    var r = await client.rpc("cb_admin_meilensteine");
    if (r.error) throw r.error;
    var j = r.data;
    if (typeof j === "string") j = JSON.parse(j);
    Z.meilensteine = (j && j.rows) || [];
    Z.ziel = (j && j.ziel) || null;
  }

  async function ladeAufgaben() {
    var r = await client.rpc("cb_admin_agent_work_liste", {
      p_owner: Z.owner, p_status: Z.status, p_product_id: null, p_limit: 500
    });
    if (r.error) throw r.error;
    /* Reihenfolge unangetastet uebernehmen — sie ist das Ergebnis des Servers. */
    Z.aufgaben = r.data || [];
  }

  /* ---- Zeichnen: Kopfzahl ------------------------------------------------ */
  function zeichneKopf() {
    var box = el("fpKopfZahlen");
    if (!box) return;
    var t = Z.ziel ? tageBis(Z.ziel) : null;
    var offen = Z.meilensteine.filter(function (m) { return !m.erledigt; }).length;
    box.innerHTML =
      kachel(t == null ? "–" : (t > 0 ? t : 0), t == null ? "Zieldatum fehlt"
            : (t > 0 ? "Tage bis Go-Live" : "Go-Live-Termin erreicht"),
            Z.ziel ? datDe(Z.ziel) : "") +
      kachel(offen + " / " + Z.meilensteine.length, "Meilensteine offen", "") +
      kachel(Z.aufgaben.length, "Aufgaben in dieser Ansicht", filterSatz());
  }
  function kachel(zahl, text, klein) {
    return '<div class="fpKachel"><b>' + esc(zahl) + '</b><span>' + esc(text) + '</span>' +
           (klein ? '<i>' + esc(klein) + '</i>' : '') + '</div>';
  }
  function filterSatz() {
    if (!Z.status && !Z.owner) return "ungefiltert";
    var t = [];
    if (Z.status) t.push(statusText(Z.status));
    if (Z.owner) t.push(ownerText(Z.owner));
    return t.join(" · ");
  }

  /* ---- Zeichnen: Meilensteine -------------------------------------------
     Senkrechte Achse. Die Reihenfolge liefert der Server (faellig, sortierung,
     id) — hier wird nicht nachsortiert. "ueberfaellig" ist keine Statuslogik,
     sondern der Vergleich zweier Daten, und er faerbt nur. */
  function zeichneMeilensteine() {
    var box = el("fpMeilen");
    if (!box) return;
    if (!Z.meilensteine.length) {
      box.innerHTML = '<p class="fpLeer">Keine Meilensteine hinterlegt.</p>';
      return;
    }
    var h = '<ol class="fpAchse">';
    Z.meilensteine.forEach(function (m) {
      var t = tageBis(m.faellig);
      var spaet = !m.erledigt && t != null && t < 0;
      h += '<li class="fpMs' + (m.erledigt ? ' ok' : '') + (spaet ? ' spaet' : '') + '">' +
             '<span class="fpMsPunkt" aria-hidden="true"></span>' +
             '<div class="fpMsKopf">' +
               '<b>' + esc(m.titel) + '</b>' +
               '<span class="fpMsDat">' + esc(datDe(m.faellig)) +
                 (m.erledigt ? ' · erledigt'
                   : (t == null ? '' : (t < 0 ? ' · ' + Math.abs(t) + ' Tage ueberfaellig'
                                              : ' · in ' + t + ' Tagen'))) +
               '</span>' +
             '</div>' +
             (m.notiz ? '<p class="fpMsNotiz">' + esc(m.notiz) + '</p>' : '') +
             '<div class="fpMsVerweis">' +
               (m.node_key ? '<span class="fpTag">Knoten ' + esc(m.node_key) + '</span>' : '') +
               (m.work_id ? '<button type="button" class="fpTag fpTagKlick" data-springe="' +
                   esc(m.work_id) + '">Aufgabe #' + esc(m.work_id) + ' ansehen</button>' : '') +
             '</div>' +
           '</li>';
    });
    h += '</ol>';
    h += '<p class="fpHinweis">Meilensteine werden hier nur angezeigt. Aendern kannst du ' +
         'sie an der Stelle, an der sie schon immer bearbeitet werden: im Dashboard, ' +
         'Kachel „Weg bis Go-Live“.</p>';
    box.innerHTML = h;
  }

  /* ---- Zeichnen: Filterleiste -------------------------------------------- */
  function zeichneFilter() {
    var box = el("fpFilter");
    if (!box) return;
    var h = '<div class="fpFilterZeile"><span class="fpFilterTitel">Status</span>' +
            knopf("status", null, "alle");
    FILTER_STATUS.forEach(function (s) {
      h += knopf("status", s, statusZeichen(s) + " " + statusText(s));
    });
    h += '</div><div class="fpFilterZeile"><span class="fpFilterTitel">Zustaendig</span>' +
         knopf("owner", null, "alle");
    FILTER_OWNER.forEach(function (o) { h += knopf("owner", o, ownerText(o)); });
    h += '</div>';
    box.innerHTML = h;
  }
  function knopf(art, wert, text) {
    var aktiv = (art === "status" ? Z.status : Z.owner) === wert;
    return '<button type="button" class="fpF' + (aktiv ? ' an' : '') +
           '" data-f="' + art + '" data-w="' + esc(wert == null ? "" : wert) + '"' +
           (aktiv ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>' +
           esc(text) + '</button>';
  }

  /* ---- Zeichnen: Aufgabenliste ------------------------------------------ */
  function zeichneAufgaben() {
    var box = el("fpListe");
    if (!box) return;
    if (!Z.aufgaben.length) {
      box.innerHTML = '<p class="fpLeer">Keine Aufgabe passt zu diesem Filter. ' +
                      'Das ist ein Ergebnis, kein Fehler.</p>';
      return;
    }
    var h = "";
    var letzterStatus = " ";
    Z.aufgaben.forEach(function (w) {
      /* Zwischenueberschrift, wenn im Serverstrom ein neuer Status beginnt.
         Das gruppiert NICHT um — es beschriftet nur die vorhandene Reihenfolge. */
      if (w.status !== letzterStatus) {
        letzterStatus = w.status;
        h += '<h3 class="fpGruppe s-' + esc(w.status) + '">' +
             statusZeichen(w.status) + " " + esc(statusText(w.status)) + '</h3>';
      }
      var auf = !!Z.offen[w.work_id];
      h += '<article class="fpKarte s-' + esc(w.status) + (auf ? ' auf' : '') +
             '" id="work-' + esc(w.work_id) + '">' +
             '<button type="button" class="fpKarteKopf" data-auf="' + esc(w.work_id) + '" ' +
               'aria-expanded="' + (auf ? 'true' : 'false') + '">' +
               '<span class="fpNr">#' + esc(w.work_id) + '</span>' +
               '<span class="fpTitel">' + esc(w.title) + '</span>' +
               '<span class="fpMeta">' + esc(ownerText(w.owner_agent)) +
                 (w.area ? ' · ' + esc(w.area) : '') +
                 (w.priority == null ? '' : ' · Prio ' + esc(w.priority)) +
               '</span>' +
               '<span class="fpPfeil" aria-hidden="true">▾</span>' +
             '</button>' +
             (auf ? detail(w) : '') +
           '</article>';
    });
    box.innerHTML = h;
  }

  function detail(w) {
    var h = '<div class="fpDetail">';
    if (w.description)         h += absatz("Auftrag", w.description);
    if (w.acceptance_criteria) h += absatz("Woran es gemessen wird", w.acceptance_criteria);
    if (w.result_note)         h += absatz("Ergebnis", w.result_note);
    if (w.verification_note)   h += absatz("Pruefung", w.verification_note);
    h += '<p class="fpZeiten">angelegt ' + esc(zeitDe(w.created_at)) +
         ' · zuletzt ' + esc(zeitDe(w.updated_at)) +
         (w.verified_at ? ' · abgenommen ' + esc(zeitDe(w.verified_at)) : '') +
         (w.created_by_agent ? ' · von ' + esc(ownerText(w.created_by_agent)) : '') +
         (w.verifier_agent ? ' · Pruefer ' + esc(ownerText(w.verifier_agent)) : '') +
         '</p>';
    h += '</div>';
    return h;
  }
  function absatz(titel, text) {
    return '<div class="fpAbs"><h4>' + esc(titel) + '</h4><p>' + esc(text) + '</p></div>';
  }

  /* ---- Verdrahtung -------------------------------------------------------
     Ein Zuhoerer auf dem Rumpf statt einer pro Knopf: innerHTML wirft Handler
     weg, und ein Knopf ohne Handler ist genau der tote Knopf, den niemand
     bemerkt, bis er gedrueckt wird. */
  function verdrahte() {
    document.addEventListener("click", function (ev) {
      /* Ein Klick kann einen Textknoten treffen — der hat kein closest().
         Deshalb erst auf das umgebende Element hochgehen. */
      var t = ev.target;
      if (t && t.nodeType === 3) t = t.parentNode;
      if (!t || typeof t.closest !== "function") return;

      var f = t.closest("[data-f]");
      if (f) {
        var art = f.getAttribute("data-f");
        var wert = f.getAttribute("data-w") || null;
        if (art === "status") Z.status = wert; else Z.owner = wert;
        neuLaden();
        return;
      }
      var a = t.closest("[data-auf]");
      if (a) {
        var id = a.getAttribute("data-auf");
        Z.offen[id] = !Z.offen[id];
        zeichneAufgaben();
        var k = el("work-" + id);
        if (k && Z.offen[id]) k.scrollIntoView({ block: "nearest", behavior: "smooth" });
        return;
      }
      var s = t.closest("[data-springe]");
      if (s) {
        springeZu(s.getAttribute("data-springe"));
        return;
      }
    });
  }

  /* Sprung von einem Meilenstein zur verknuepften Aufgabe. Findet die Aufgabe
     im aktuellen Filter nicht statt, wird der Filter zurueckgesetzt und erneut
     geladen — sonst springt man ins Leere und haelt die Verknuepfung fuer kaputt. */
  async function springeZu(workId) {
    var da = Z.aufgaben.some(function (w) { return String(w.work_id) === String(workId); });
    if (!da) {
      Z.status = null; Z.owner = null;
      await neuLaden();
      da = Z.aufgaben.some(function (w) { return String(w.work_id) === String(workId); });
    }
    if (!da) {
      meldung("Aufgabe #" + workId + " ist in der Liste nicht enthalten. " +
              "Moeglich, wenn sie aelter ist als die letzten 500 Eintraege.");
      return;
    }
    Z.offen[workId] = true;
    zeichneAufgaben();
    var k = el("work-" + workId);
    if (k) k.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function meldung(text) {
    var m = el("fpMeldung");
    if (!m) return;
    m.textContent = text;
    m.hidden = !text;
  }

  function ladebalken(an) {
    var l = el("fpLaden");
    if (l) l.hidden = !an;
  }

  async function neuLaden() {
    ladebalken(true);
    meldung("");
    try {
      await ladeAufgaben();
    } catch (e) {
      fehler(e);
      ladebalken(false);
      return;
    }
    zeichneFilter();
    zeichneAufgaben();
    zeichneKopf();
    ladebalken(false);
  }

  function fehler(e) {
    var txt = (e && (e.message || e.error_description || e.details)) || String(e);
    if (/Nur Admins/i.test(txt)) {
      txt = "Diese Seite zeigt nur Admins etwas. Melde dich in der App an " +
            "(root-index.de) und lade diese Seite neu.";
    }
    meldung(txt);
    try { console.error("[Fahrplan]", e); } catch (_) {}
  }

  /* ---- Start ------------------------------------------------------------- */
  async function start() {
    verdrahte();
    zeichneFilter();
    ladebalken(true);
    var probleme = [];
    try { await ladeMeilensteine(); } catch (e) { probleme.push(e); }
    try { await ladeAufgaben(); }     catch (e) { probleme.push(e); }
    zeichneMeilensteine();
    zeichneAufgaben();
    zeichneKopf();
    ladebalken(false);
    if (probleme.length) fehler(probleme[0]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
