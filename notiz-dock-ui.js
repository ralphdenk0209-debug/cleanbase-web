function todoRender(){
  if(!(ME&&ME.is_admin)) return;
  var v=document.getElementById("todoView"); if(!v) return;
  v.innerHTML='<div style="max-width:720px;margin:0 auto;padding:14px 6px 40px"><div style="background:var(--card,#fff);color:var(--ink);border:1px solid var(--line);border-radius:14px;padding:18px 18px 20px">'
    +'<div style="font-weight:800;font-size:20px;margin:0 2px 2px">📝 To-do</div>'
    +'<div style="font-size:12.5px;color:var(--muted);margin:0 2px 14px">Deine Notizen &amp; Aufgaben. Wird automatisch gespeichert. Zum Bearbeiten in den Text klicken.</div>'
    +'<div style="display:flex;gap:6px;margin-bottom:14px"><input id="todoInput" placeholder="Neue Aufgabe…" onkeydown="if(event.key===\'Enter\')todoAdd()" style="flex:1;padding:9px 11px;border:1px solid var(--line);border-radius:9px;font-size:14px;background:var(--bg);color:var(--ink)"><button onclick="todoAdd()" style="padding:9px 16px;border:0;border-radius:9px;background:var(--green);color:var(--auf-gruen);font-weight:700;font-size:13px;cursor:pointer">+ Hinzufügen</button></div>'
    +'<div id="todoMsg" style="font-size:12px;color:var(--k-dc2626);margin:0 2px 8px;min-height:0"></div>'
    +'<div id="todoList" style="font-size:13px;color:var(--muted)">Lade …</div>'
  +'</div></div>';
  todoLoad();
}
/* Das Dock ist eine zweite Ansicht derselben To-do-Daten und bleibt beim Weiterarbeiten offen.
   Eigene todoDock-IDs verhindern doppelte DOM-IDs mit der To-do-Seite. */
function todoDockEl(){
  var d=document.getElementById('todoDock');
  if(d) return d;
  d=document.createElement('div'); d.id='todoDock';
  d.style.cssText='position:fixed;right:12px;top:56px;width:340px;max-width:calc(100vw - 24px);'
    +'max-height:calc(100vh - 76px);display:none;flex-direction:column;z-index:9500;'
    +'background:var(--card,#fff);color:var(--ink);border:1px solid var(--line);border-radius:14px;'
    +'box-shadow:0 18px 46px rgba(20,40,70,.26);overflow:hidden';
  d.innerHTML='<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line);flex:0 0 auto">'
      +'<span style="font-weight:800;font-size:14px">📝 Notizen</span>'
      +'<span id="todoDockN" style="font-size:11.5px;color:var(--muted)"></span>'
      +'<button onclick="todoDockToggle(false)" title="schließen" style="margin-left:auto;border:0;background:transparent;color:var(--muted);font-size:17px;line-height:1;cursor:pointer;padding:0 2px">✕</button>'
    +'</div>'
    +'<div style="padding:9px 12px 6px;flex:0 0 auto"><input id="todoDockInput" placeholder="Notiz eintippen, Enter…" '
      +'onkeydown="if(event.key===\'Enter\'){event.preventDefault();todoAdd(\'dock\');}" '
      +'style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid var(--line);border-radius:9px;font-size:13px;background:var(--bg);color:var(--ink)">'
      +'<div id="todoDockMsg" style="font-size:11.5px;color:var(--k-dc2626);margin-top:4px"></div></div>'
    +'<div id="todoDockList" style="flex:1 1 auto;min-height:0;overflow:auto;padding:2px 8px 10px;font-size:13px"></div>';
  document.body.appendChild(d);
  return d;
}
function todoDockToggle(force){
  var d=todoDockEl();
  var auf=(typeof force==='boolean')?force:(d.style.display==='none'||!d.style.display);
  d.style.display=auf?'flex':'none';
  try{ localStorage.setItem('ri_todoDock', auf?'1':'0'); }catch(e){}
  if(auf){ todoLoad(); try{ var i=document.getElementById('todoDockInput'); if(i) i.focus(); }catch(e){} }
}
/* Der Kopfleisten-Zähler zeigt nur offene Aufgaben und bleibt bei null verborgen. */
function todoBadge(){
  var b=document.getElementById('atTodoN'); if(!b) return;
  var offen=((window._todo)||[]).filter(function(o){return !o.erledigt;}).length;
  b.textContent=offen?String(offen):''; b.style.display=offen?'':'none';
}
function todoDockRender(){
  var l=document.getElementById('todoDockList'); if(!l) return;
  var arr=(window._todo)||[], offen=arr.filter(function(o){return !o.erledigt;});
  var n=document.getElementById('todoDockN'); if(n) n.textContent=arr.length?(offen.length+' offen'):'';
  if(!arr.length){ l.innerHTML='<div style="color:var(--muted);padding:8px 4px">Noch nichts notiert.</div>'; return; }
  /* Offene Aufgaben stehen vor erledigten Aufgaben. */
  var sort=offen.concat(arr.filter(function(o){return o.erledigt;}));
  l.innerHTML=sort.map(function(o){
    var done=!!o.erledigt;
    return '<div style="display:flex;align-items:flex-start;gap:8px;padding:6px 4px;border-bottom:1px solid var(--line)">'
      +'<input type="checkbox" '+(done?'checked':'')+' onchange="todoToggle('+o.id+')" style="width:16px;height:16px;flex:none;margin-top:2px;cursor:pointer;accent-color:var(--green)">'
      +(done
        ? '<span style="flex:1;color:var(--muted);text-decoration:line-through;word-break:break-word">'+esc(o.text)+'</span>'
        : '<textarea rows="1" onchange="todoEdit('+o.id+',this.value)" oninput="this.style.height=\'auto\';this.style.height=this.scrollHeight+\'px\'" style="flex:1;min-width:0;border:0;background:transparent;color:var(--ink);font:inherit;resize:none;overflow:hidden;padding:1px 0">'+esc(o.text)+'</textarea>')
      +'<button onclick="todoDel('+o.id+')" title="löschen" style="flex:none;border:0;background:transparent;color:var(--muted);font-size:14px;cursor:pointer">✕</button>'
    +'</div>';
  }).join('');
  try{ l.querySelectorAll('textarea').forEach(function(t){ t.style.height='auto'; t.style.height=t.scrollHeight+'px'; }); }catch(e){}
}
if(typeof window!=='undefined'){ window.todoDockToggle=todoDockToggle; window.todoDockRender=todoDockRender; window.todoBadge=todoBadge; }
async function todoLoad(){
  var l=document.getElementById("todoList");   /* darf fehlen: Das Dock läuft auch ohne die To-do-Seite. */
  try{ var r=await client.rpc("cb_todo_list"); if(r.error) throw new Error(r.error.message); window._todo=(r&&r.data)||[]; todoListRender(); try{ todoDockRender(); }catch(e){} try{ todoBadge(); }catch(e){} }
  catch(e){ var msg="Konnte die Liste nicht laden: "+(e&&e.message?e.message:e);
    if(l){ l.style.color="var(--k-dc2626)"; l.textContent=msg; }
    var dm=document.getElementById("todoDockMsg"); if(dm) dm.textContent=msg;   /* Ladefehler müssen in der verfügbaren Ansicht sichtbar bleiben. */ }
}
function todoListRender(){
  var l=document.getElementById("todoList"); if(!l) return; var arr=window._todo||[];
  var offen=arr.filter(function(o){return !o.erledigt;}).length;
  if(!arr.length){ l.style.color="var(--muted)"; l.innerHTML="Noch keine Eintraege — schreib oben deine erste Aufgabe."; return; }
  l.style.color="var(--ink)";
  l.innerHTML='<div style="font-size:12px;color:var(--muted);margin-bottom:6px">'+offen+' offen · '+arr.length+' gesamt</div>'
    + arr.map(function(o){
    var done=o.erledigt;
    return '<div style="display:flex;align-items:center;gap:9px;padding:8px 4px;border-bottom:1px solid var(--line)">'
      +'<input type="checkbox" '+(done?'checked':'')+' onchange="todoToggle('+o.id+')" style="width:17px;height:17px;flex:none;cursor:pointer;accent-color:var(--green)">'
      +(done
        ? '<span style="flex:1;font-size:14px;color:var(--muted);text-decoration:line-through">'+esc(o.text)+'</span>'
        : '<input value="'+esc(o.text)+'" onchange="todoEdit('+o.id+',this.value)" style="flex:1;font-size:14px;border:0;background:transparent;color:var(--ink);padding:4px 2px">')
      +'<button onclick="todoDel('+o.id+')" title="Loeschen" style="flex:none;border:0;background:transparent;color:var(--muted);font-size:15px;cursor:pointer">✕</button>'
    +'</div>';
  }).join("");
}
/* woher unterscheidet Dock-Eingabe und To-do-Seite. */
async function todoAdd(woher){
  var id=(woher==="dock")?"todoDockInput":"todoInput";
  var inp=document.getElementById(id);
  if(!inp){ id=(id==="todoInput")?"todoDockInput":"todoInput"; inp=document.getElementById(id); }
  if(!inp) return;
  var msg=document.getElementById(id==="todoDockInput"?"todoDockMsg":"todoMsg");
  var t=(inp.value||"").trim(); if(!t) return; inp.value="";
  if(msg) msg.textContent="";
  try{ var r=await client.rpc("cb_todo_add",{p_text:t}); if(r.error) throw new Error(r.error.message); await todoLoad();
    var i2=document.getElementById(id); if(i2) i2.focus(); }
  catch(e){ if(msg) msg.textContent="Fehler beim Speichern: "+(e&&e.message?e.message:e); }
}
async function todoToggle(id){ try{ await client.rpc("cb_todo_toggle",{p_id:id}); await todoLoad(); }catch(e){} }
async function todoEdit(id,val){ try{ await client.rpc("cb_todo_edit",{p_id:id,p_text:val}); }catch(e){} }
async function todoDel(id){ try{ await client.rpc("cb_todo_del",{p_id:id}); await todoLoad(); }catch(e){} }
if(typeof window!=='undefined'){ window.todoRender=todoRender; window.todoAdd=todoAdd; window.todoToggle=todoToggle; window.todoEdit=todoEdit; window.todoDel=todoDel; }
