/* Intro-Overlay: gecodete Animation, nur einmal pro Sitzung (Kaltstart), ueberspringbar */
function riHideIntro(){ var o=document.getElementById('introOverlay'); if(!o) return; o.classList.add('hide'); setTimeout(function(){ if(o&&o.parentNode) o.style.display='none'; },600); }
/* ===========================================================================
   DIE VERWANDLUNG

   Das Y (drei Arme, gruen) dreht sich EINMAL ganz herum. Waehrend der Drehung
   wandern die drei Arme auf ihre Plaetze, ein vierter waechst aus der Mitte,
   und die Farben trennen sich: Zutaten gruen, Zusatzstoffe blau, Verarbeitung
   lila, Naehrwert orange.

   Der Kern ist von Anfang an das, was er am Ende ist - ein dunkles Fenster mit
   Ring. Er waechst nur mit, statt sich zu verwandeln.

   Am Ende zaehlt die Skala 0 -> 100. KEINE Beispielzahl: eine "72" waere im
   ersten Moment der App eine erfundene Zahl. Die Skala zeigt den WERTEBEREICH.

   Genau 360 Grad - nicht 405. Sonst landen die Arme schraeg statt in den Ecken,
   und das Ende sieht anders aus als die Startseite.
   =========================================================================== */
function riIntroLauf(){
  var CX=150, CY=100;
  var YARM=[-90, 150, 30];                       // Y: oben, unten-links, unten-rechts
  var SARM=[                                     // Schaltplan: die vier Ecken
    {ax:-124, ay:-66, kx:-76, ky:-66, ex:-38, ey:-24, col:[61,219,122]},
    {ax: 124, ay:-66, kx: 76, ky:-66, ex: 38, ey:-24, col:[90,182,255]},
    {ax:-124, ay: 66, kx:-76, ky: 66, ex:-38, ey: 24, col:[183,155,255]},
    {ax: 124, ay: 66, kx: 76, ky: 66, ex: 38, ey: 24, col:[255,194,75]}
  ];
  var GRUEN=[94,242,160];
  function li(a,b,t){ return a+(b-a)*t; }
  function co(a,b,t){ return 'rgb('+Math.round(li(a[0],b[0],t))+','+Math.round(li(a[1],b[1],t))+','+Math.round(li(a[2],b[2],t))+')'; }

  var rot=document.getElementById('ifRot'), kern=document.getElementById('ifKern');
  var zahl=document.getElementById('ifZahl'), wort=document.getElementById('introWort');
  var claim=document.querySelector('#introOverlay .introClaim');
  if(!rot) return;

  /* Die Pfade stehen im HTML auf d="" - ohne einen ersten Zeichenlauf ist das
     Bild LEER. Genau das sah man in der Startverzoegerung: ein nackter Ring.
     > Ein Startbild, das erst der zweite Frame malt, ist kein Startbild.
     Deshalb: erst das Y zeichnen (me=0), dann die Uhr starten. */
  function zeichne(me){
    for(var i=0;i<4;i++){
      var p=document.getElementById('ifP'+(i+1)), c=document.getElementById('ifK'+(i+1)), z=SARM[i];
      var sx, sy;
      if(i<3){ var r=YARM[i]*Math.PI/180; sx=Math.cos(r)*54; sy=Math.sin(r)*54; }
      else { sx=0; sy=0; p.setAttribute('opacity', me.toFixed(2)); c.setAttribute('opacity', me.toFixed(2)); }
      var ax=li(sx,z.ax,me),      ay=li(sy,z.ay,me);
      var kx=li(sx*0.62,z.kx,me), ky=li(sy*0.62,z.ky,me);
      var ex=li(sx*0.30,z.ex,me), ey=li(sy*0.30,z.ey,me);
      p.setAttribute('d','M'+(CX+ax)+' '+(CY+ay)+' L'+(CX+kx)+' '+(CY+ky)+' L'+(CX+ex)+' '+(CY+ey));
      p.setAttribute('stroke', co(GRUEN, z.col, me));
      c.setAttribute('cx', CX+ax); c.setAttribute('cy', CY+ay);
      c.setAttribute('fill', co(GRUEN, z.col, me));
    }
    kern.setAttribute('r', li(10, 34, me));
  }
  zeichne(0);                                    // das Y steht, bevor irgendetwas laeuft

  var D=2500, t0=performance.now()+600;          // 0,6 s Ruhe: erst sieht man das Y
  function frame(now){
    if(now<t0){ requestAnimationFrame(frame); return; }
    var t=Math.min(1,(now-t0)/D);
    var e = t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
    rot.style.transform='rotate('+(e*360)+'deg)';

    var m=Math.max(0,Math.min(1,(t-0.20)/0.60));
    zeichne(m<.5 ? 2*m*m : 1-Math.pow(-2*m+2,2)/2);

    if(t>=1){
      /* Erst jetzt die Skala - sie waechst aus dem Nichts und zaehlt 0 -> 100. */
      zahl.setAttribute('opacity','1');
      var z0=performance.now();
      (function zaehl(n){
        var s=Math.min(1,(n-z0)/1000), se=1-Math.pow(1-s,3);
        zahl.textContent=Math.round(se*100);
        zahl.setAttribute('font-size', (16+se*18).toFixed(1));
        if(s<1) requestAnimationFrame(zaehl);
      })(z0);
      if(wort)  wort.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:600,delay:500,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
/* Bei abgeschalteter Bewegung: sofort der Endzustand. Kein Ruckeln, aber auch
   kein leerer Bildschirm - man sieht, worum es geht. */
function riIntroSofort(){
  var rot=document.getElementById('ifRot'), kern=document.getElementById('ifKern');
  var zahl=document.getElementById('ifZahl'), wort=document.getElementById('introWort');
  var claim=document.querySelector('#introOverlay .introClaim');
  if(!rot) return;
  var CX=150, CY=100;
  var S=[{ax:-124,ay:-66,kx:-76,ky:-66,ex:-38,ey:-24,c:'#3DDB7A'},
         {ax: 124,ay:-66,kx: 76,ky:-66,ex: 38,ey:-24,c:'#5AB6FF'},
         {ax:-124,ay: 66,kx:-76,ky: 66,ex:-38,ey: 24,c:'#B79BFF'},
         {ax: 124,ay: 66,kx: 76,ky: 66,ex: 38,ey: 24,c:'#FFC24B'}];
  S.forEach(function(z,i){
    var p=document.getElementById('ifP'+(i+1)), c=document.getElementById('ifK'+(i+1));
    p.setAttribute('d','M'+(CX+z.ax)+' '+(CY+z.ay)+' L'+(CX+z.kx)+' '+(CY+z.ky)+' L'+(CX+z.ex)+' '+(CY+z.ey));
    p.setAttribute('stroke',z.c); p.setAttribute('opacity','1');
    c.setAttribute('cx',CX+z.ax); c.setAttribute('cy',CY+z.ay); c.setAttribute('fill',z.c); c.setAttribute('opacity','1');
  });
  kern.setAttribute('r','34');
  zahl.textContent='100'; zahl.setAttribute('opacity','1');
  if(wort)  wort.style.opacity='1';
  if(claim) claim.style.opacity='1';
}
