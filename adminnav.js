/* Klassisches Script: app.js und __ADMIN_PAGE müssen vor dem Aufruf bereitstehen. */

function applyAdminMode(){
  if(!ADMIN_MODE) return;
  const bn=document.querySelector('.bottomnav'); if(bn) bn.style.display='';
  const ms=document.getElementById('mehrSheet'); if(ms) ms.style.display='';
  if(!document.getElementById('adminTop')){
    /* adminCrumb bleibt als unsichtbares Schreibziel für adminGo im DOM. */
    /* Build-Kurzform immer aus der letzten Gruppe ableiten; der Titel behält den Vollwert. */
    var _bKurz='', _bVoll='';
    try{
      if(typeof APP_BUILD!=='undefined' && APP_BUILD){
        _bVoll=String(APP_BUILD);
        var _t=_bVoll.split('-');
        _bKurz=_t[_t.length-1]||_bVoll;
      }
    }catch(e){}
    const top=document.createElement('div'); top.id='adminTop';
    top.innerHTML=
       '<div id="adminCrumb" style="display:none"></div>'
      +'<button id="atTodo" onclick="todoDockToggle()" title="Notizen &amp; To-do – bleibt beim Arbeiten offen" style="flex:0 0 auto;margin-right:6px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);font-size:13px;cursor:pointer;white-space:nowrap;position:relative">📝<span id="atTodoN" style="display:none;margin-left:5px;font-size:11px;font-weight:800;background:#ffd9a0;color:#7a4a00;border-radius:20px;padding:0 6px"></span></button>'
      +'<button id="atReload" onclick="adminNeuLaden(this)" title="Version '+esc(_bVoll)+' – neueste holen: leert Cache &amp; Service-Worker und lädt hart neu" style="flex:0 0 auto;margin-right:8px;padding:6px 11px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap" data-voll="'+esc(_bVoll)+'">🔄 <span class="atBuild">'+esc(_bKurz)+'</span></button>'
      +'<button class="atLogout" onclick="doLogout()" title="Abmelden" aria-label="Abmelden">🚪</button>';
    document.body.appendChild(top);
    /* Dockzustand wiederherstellen; geschlossen trotzdem einmal für den Zähler laden. */
    try{
      var _tdAuf=false; try{ _tdAuf=(localStorage.getItem('ri_todoDock')==='1'); }catch(e){}
      setTimeout(function(){
        /* ME ist App-Zustand und kein window-Export. */
        if(!(typeof ME!=="undefined" && ME && ME.is_admin)) return;
        if(_tdAuf){ try{ todoDockToggle(true); }catch(e){} }
        else { try{ todoLoad(); }catch(e){} }
      }, 900);
    }catch(e){}
    /* Esc schliesst das Dock – aber nur, wenn der Fokus nicht in einem Eingabefeld steht. */
    try{ document.addEventListener('keydown', function(ev){
      if(ev.key!=='Escape') return;
      var d=document.getElementById('todoDock'); if(!d || d.style.display==='none') return;
      var a=document.activeElement, tn=a&&a.tagName;
      if(tn==='INPUT'||tn==='TEXTAREA'||tn==='SELECT'){ if(d.contains(a)){ a.blur(); return; } return; }
      todoDockToggle(false);
    }); }catch(e){}
    const nav=document.createElement('div'); nav.id='adminNav';
    var _an=function(k,ico,lbl,oc,extra){ return '<button class="anBtn"'+(extra||'')+' data-k="'+k+'" onclick="'+oc+'"><span class="anIco">'+ico+'</span><span class="anLbl">'+lbl+'</span></button>'; };
    nav.innerHTML=
       _an('dash','📊','Dashboard',"adminGo('dash')")
      /* Ralph-Auftrag 25.08.2026: Benchmark Control direkt hinter dem Dashboard.
         Eigene Arbeitsflaeche als Overlay (wie katKonfigOpen), kein fgTab-Panel —
         damit weder app.js noch admin.html Fachlogik dafuer bekommen. */
      +_an('benchmark','🎯','Benchmark',"benchmarkBoardOpen()")
      +_an('produkterfassung','🗂️','Erfassen',"adminGo('produkterfassung')",' id="amProdErf"')
      +_an('bundles','🧩','Bundles',"adminGo('bundles')")
      +_an('rezepte','🍳','Rezepte',"adminGo('rezepte')")
      +_an('rezzut','🥣','Rezept-Zutaten',"rezZutatenWaecherOpenSafe()")
      +_an('tausch','🔁','Tausch-Tipps',"adminGo('tausch')")
      +_an('mikro','🥗','Nährstoffe',"adminGo('mikro')")
      +_an('dubletten','👯','Dubletten',"adminGo('dubletten')")
      +_an('empfehlungen','⭐','Empfehlungen',"adminGo('empfehlungen')")
      +_an('regelwerk','📖','Regelwerk',"adminGo('regelwerk')",' id="amRegelwerk" style="display:none"')
      +_an('stufen','🎚️','Stufen',"adminGo('stufen')")
      +_an('fotostudio','📸','Fotostudio',"adminGo('fotostudio')")
      +_an('katkonfig','🏷️','Kategorien',"katKonfigOpen()")
      +_an('werangelegt','👤','Wer hat angelegt',"admWerAngelegtOpen()")
      +_an('nutzer','👥','Nutzer',"adminGo('nutzer')");
    /* Menüplaketten aus bereits geladenen Dashboarddaten ableiten. */
    window.adminNavBadges=function(d){
      try{
        var setB=function(k,n){ var b=document.querySelector('#adminNav .anBtn[data-k="'+k+'"]'); if(!b) return;
          var e=b.querySelector('.anBdg');
          if(!e){ e=document.createElement('span'); e.className='anBdg'; b.appendChild(e); }
          if(n>0){ e.textContent=(n>99?'99+':n); e.style.display=''; } else e.style.display='none'; };
        setB('produkterfassung', Number((d&&d.qualitaet&&d.qualitaet.unverifiziert)||0));
      }catch(e){}
    };
    document.body.appendChild(nav);
    /* Der Pfeil-Chip holt das beim Scrollen ausgeblendete Menü zurück. */
    if(!document.getElementById('adminNavPeek')){
      var peek=document.createElement('div'); peek.id='adminNavPeek'; peek.title='Menü einblenden';
      peek.innerHTML='▾ Menü';
      peek.onclick=function(){ document.body.classList.remove('navHidden'); window._navPinned=true; };
      document.body.appendChild(peek);
    }
    /* Einklappknopf als erstes Nav-Kind halten; in der Oben-Lage blendet CSS ihn aus. */
    if(!document.getElementById('adminNavKlapp')){
      var kl=document.createElement('button'); kl.id='adminNavKlapp'; kl.type='button';
      kl.innerHTML='<span class="nkIco">☰</span><span class="nkTxt">Menü</span>';
      kl.onclick=function(){ adminNavSchmalSetzen(!document.body.classList.contains('navSchmal')); };
      nav.insertBefore(kl, nav.firstChild);
    }
  }
  /* matchMedia muss dieselbe 1100px-Grenze wie das CSS verwenden. */
  if(!window._adminNavSeiteBound){
    window._adminNavSeiteBound=true;
    var mq=(window.matchMedia?window.matchMedia('(min-width:1100px)'):null);
    /* Kopfcluster zwischen Body und Seitennavigation umhängen, niemals kopieren. */
    /* Schwarze Kopfleiste einmal anlegen; Sichtbarkeit steuert ausschließlich CSS. */
    var kopfleisteBauen=function(){
      if(document.getElementById('riKopf')) return;
      var k=document.createElement('div'); k.id='riKopf';
      var b=''; try{ if(typeof APP_BUILD!=='undefined'&&APP_BUILD){
        var t=String(APP_BUILD).split('-'); b=t[t.length-1]; } }catch(e){}
      k.innerHTML='<span class="riGi">▦</span>'
        +'<span class="riWm">ROOT<b>COCKPIT</b></span>'
        +'<span class="riR"><span>[ri!] root<b>index</b></span>'
        +(b?'<span title="Build '+esc(String(APP_BUILD))+'">'+esc(b)+'</span>':'')+'</span>';
      document.body.appendChild(k);
    };
    kopfleisteBauen();

    var clusterUmhaengen=function(anSeite){
      var t=document.getElementById('adminTop'), nav=document.getElementById('adminNav');
      if(!t) return;
      if(anSeite && nav){ if(t.parentNode!==nav) nav.appendChild(t); }
      else if(t.parentNode!==document.body) document.body.appendChild(t);
    };
    var setzen=function(an){
      document.body.classList.toggle('navSeite', !!an);
      clusterUmhaengen(!!an);
      if(an){
        /* navHidden beim Wechsel in die Seitenlage ausdrücklich lösen. */
        document.body.classList.remove('navHidden'); window._navPinned=false;
        var s=false; try{ s=(localStorage.getItem('ri_navSchmal')==='1'); }catch(e){}
        document.body.classList.toggle('navSchmal', s);
      } else {
        /* navSchmal gilt nur in Seitenlage; der gespeicherte Wert bleibt erhalten. */
        document.body.classList.remove('navSchmal');
      }
    };
    if(mq){
      setzen(mq.matches);
      if(mq.addEventListener) mq.addEventListener('change', function(e){ setzen(e.matches); });
      else if(mq.addListener) mq.addListener(function(e){ setzen(e.matches); });
    }
    window._adminClusterUmhaengen=clusterUmhaengen;
  }
  /* Bei jedem Durchlauf nachhängen, weil die responsive Bindung nur einmal entsteht. */
  try{ if(window._adminClusterUmhaengen)
         window._adminClusterUmhaengen(document.body.classList.contains('navSeite')); }
  catch(e){ try{ console.warn('Knopf-Cluster:',e); }catch(_){} }
  /* Scroll-Verhalten (nur einmal binden): runterscrollen blendet das Nav aus,
     ganz oben kommt es von selbst zurück, dazwischen holt es der Pfeil-Chip. */
  if(!window._adminNavScrollBound){
    window._adminNavScrollBound=true; window._navLastY=0;
    window.addEventListener('scroll', function(){
      /* Die feste Seitenleiste darf beim Scrollen nicht ausgeblendet werden. */
      if(document.body.classList.contains('navSeite')) return;
      var y=window.scrollY||document.documentElement.scrollTop||0;
      if(y<=36){ document.body.classList.remove('navHidden'); window._navPinned=false; }
      else if(y>90 && y>window._navLastY+4 && !window._navPinned){ document.body.classList.add('navHidden'); }
      window._navLastY=y;
    }, {passive:true});
  }
  /* Feature-Sichtbarkeit nach jedem Aufbau mit dem aktuellen Zustand abgleichen. */
  try{ var _ar=document.getElementById('amRegelwerk'); if(_ar) _ar.style.display=(FEATURES['regelwerk']===true?'':'none'); }catch(e){}
  /* Auth-Ereignisse dürfen die Startnavigation nur einmal auslösen. */
  if(ADMIN_START_DONE) return;
  if(ME&&ME.is_admin){ ADMIN_START_DONE=true; setMode('freigabe'); }
  else { openAdminLogin(); }
}

function adminNavSchmalSetzen(schmal){
  try{ document.body.classList.toggle('navSchmal', !!schmal); }catch(e){ return; }
  try{ localStorage.setItem('ri_navSchmal', schmal?'1':'0'); }catch(e){}
  var k=document.getElementById('adminNavKlapp');
  if(k) k.title = schmal ? 'Menü ausklappen' : 'Menü einklappen';
}
if(typeof window!=='undefined'){ window.adminNavSchmalSetzen=adminNavSchmalSetzen; }

function adminDrawerToggle(){ var d=document.getElementById('adminDrawer'),s=document.getElementById('adminScrim'); if(!d)return; var open=d.classList.toggle('open'); if(s)s.classList.toggle('open',open); }

function adminDrawerClose(){ var d=document.getElementById('adminDrawer'),s=document.getElementById('adminScrim'); if(d)d.classList.remove('open'); if(s)s.classList.remove('open'); }
if(typeof window!=='undefined'){ window.adminDrawerToggle=adminDrawerToggle; window.adminDrawerClose=adminDrawerClose; }

function adminGo(k){
  /* 🔴 22.08.2026, Work #199: 'kontakt' fehlte hier. fgTab kennt das Panel
     (kontakt:'fgPanelKontakt'), adminGo aber nicht — es fiel in den else-Zweig
     und rief navTo('kontakt'), eine Seite, die es nicht gibt. Aufgefallen beim
     Anschliessen des Drills: 21 Produktwuensche warten, die Ansicht dafuer gibt
     es seit Langem, nur der Weg dorthin ging ins Leere. */
  const fg={dash:1,scans:1,bundles:1,rezepte:1,empfehlungen:1,zuverif:1,regelwerk:1,produkterfassung:1,kontakt:1};
  if(k==='stamm'){ try{ navTo('freigabe'); }catch(e){} try{ fgTab('stamm'); }catch(e){} return; }
  if(fg[k]){ try{ navTo('freigabe'); }catch(e){} try{ fgTab(k); }catch(e){} }
  else { try{ navTo(k); }catch(e){} }
  try{ document.querySelectorAll('#adminNav .anBtn').forEach(b=>{ b.classList.toggle('active', b.getAttribute('data-k')===k); }); }catch(e){}
  try{ var cr=document.getElementById('adminCrumb'); if(cr) cr.textContent=AD_TITLES[k]||''; }catch(e){}
  try{ document.body.classList.toggle('peLightBg', k==='produkterfassung'); }catch(e){}
  /* Freigabeleiste beim Bereichswechsel schließen; der Editor öffnet sie bei Bedarf neu. */
  try{ feFreigabeLeisteHide(); }catch(e){}
  try{ adminDrawerClose(); }catch(e){}
}
if(typeof window!=='undefined') window.adminGo=adminGo;
