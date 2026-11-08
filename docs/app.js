'use strict';
const titleArt=" ___  ___   ___    _      _       _    _   _  _  _   ___  _  _  ___  ___\n/ __|| __| / __|  /_\\    | |     /_\\  | | | || \\| | / __|| || || __|| _ \\\n\\__ \\| _| | (_ | / _ \\   | |__  / _ \\ | |_| || .` || (__ | __ || _| |   /\n|___/|___| \\___|/_/ \\_\\  |____|/_/ \\_\\ \\___/ |_|\\_| \\___||_||_||___||_|_\\";
const authorArt=" _    __   __ ___  ___    _    _  _  ___  ___\n| |   \\ \\ / /| _ \\|_ _|  /_\\  | \\| |/ __|| _ \\\n| |__  \\ V / |   / | |  / _ \\ | .` |\\__ \\|  _/\n|____|  |_|  |_|_\\|___|/_/ \\_\\|_|\\_||___/|_|";
document.querySelectorAll('[data-brand]').forEach(container=>{for(const [art,label,extra] of [[titleArt,'Sega Launcher',''],[authorArt,'LyriansP',' author']]){const pre=document.createElement('pre');pre.className='ascii'+extra;pre.textContent=art;pre.setAttribute('role','img');pre.setAttribute('aria-label',label);container.append(pre);}});
let names = ['Aladdin','Comix Zone','Contra - Hard Corps','Dragon Ball Z','Earthworm Jim','Golden Axe','Golden Axe III (Japan)','Lion King',"Michael Jackson’s Moonwalker",'Mortal Combat 5','Mortal Kombat 2','Mortal Kombat 3','Shinobi III - Return of the Ninja Master','Sonic & Knuckles','Sonic and Knuckles & Sonic 3','Sonic the Hedgehog','Sonic the Hedgehog 2','Sonic the Hedgehog 3','Street Fighter II’ - Special Champion Edition','Streets of Rage','Streets of Rage 2','Streets of Rage 3','Teenage Mutant Hero Turtles - The Hyperstone Heist','Tiny Toon Adventures - Buster’s Hidden Treasure','Ultimate Mortal Kombat 3'];
const $ = selector => document.querySelector(selector);
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); } catch { /* El catálogo sigue funcionando sin almacenamiento. */ } };

function validateCatalog(data){if(!data||!Array.isArray(data.games)||!data.games.length||data.games.length>5000||data.games.some(n=>typeof n!=='string'||!n.trim()||n.length>250)||new Set(data.games).size!==data.games.length)throw new Error('Catálogo inválido');return data.games;}
try {const cached=read('sega-web-catalog',null);if(cached)names=validateCatalog(cached);} catch {}
const stored = read('sega-web-favorites',[]);
const favorites = new Set(Array.isArray(stored) ? stored.filter(n => Number.isInteger(n) && n >= 0 && n < names.length) : []);
let page = 0, selected = 0, favoritesOnly = false;
const pageSize = 8;
function results() { const terms = $('#search').value.toLocaleLowerCase('es').trim().split(/\s+/).filter(Boolean); return names.map((name,id) => ({name,id})).filter(game => (!favoritesOnly || favorites.has(game.id)) && terms.every(term => game.name.toLocaleLowerCase('es').includes(term))); }
function toggle(id) { favorites.has(id) ? favorites.delete(id) : favorites.add(id); save('sega-web-favorites',[...favorites]); render(); }
function render() {
  document.querySelectorAll('[data-game-count]').forEach(el=>el.textContent=names.length); $('.counter b').textContent=names.length;
  const matches = results(), pages = Math.max(1,Math.ceil(matches.length/pageSize)); page = Math.min(page,pages-1);
  if (matches.length && !matches.some(game => game.id === selected)) selected = matches[0].id;
  const list = $('#games'); list.replaceChildren();
  if (!matches.length) { const empty = document.createElement('p'); empty.className='empty'; empty.textContent = favoritesOnly ? 'Todavía no hay favoritos que coincidan. Marcá un juego con ☆.' : 'Sin coincidencias. Probá con otro nombre.'; list.append(empty); }
  for (const game of matches.slice(page*pageSize,(page+1)*pageSize)) {
    const row=document.createElement('div'); row.className='game'+(game.id===selected?' selected':'');
    const select=document.createElement('button'); select.className='game-select'; select.type='button'; select.setAttribute('aria-pressed',String(game.id===selected));
    const number=document.createElement('span'); number.className='number'; number.textContent=String(game.id+1).padStart(2,'0');
    const text=document.createElement('span'); text.textContent=game.name; select.append(number,text); select.addEventListener('click',()=>{selected=game.id; render();});
    const fav=document.createElement('button'); fav.className='fav'; fav.type='button'; fav.textContent=favorites.has(game.id)?'★':'☆'; fav.setAttribute('aria-pressed',String(favorites.has(game.id))); fav.setAttribute('aria-label',(favorites.has(game.id)?'Quitar de favoritos: ':'Agregar a favoritos: ')+game.name); fav.addEventListener('click',()=>toggle(game.id));
    row.append(select,fav); list.append(row);
  }
  $('#result-count').textContent=matches.length+' de '+names.length+' juegos'; $('#page-count').textContent=(matches.length?page+1:0)+' / '+(matches.length?pages:0); $('#previous').disabled=page===0; $('#next').disabled=page>=pages-1;
  $('.selected-panel').hidden=!matches.length;
  $('#selected-id').textContent='ARCHIVO '+String(selected+1).padStart(2,'0')+' / '+names.length; $('#selected-name').textContent=names[selected]; $('#detail-favorite').textContent=favorites.has(selected)?'★ Quitar de favoritos':'☆ Guardar en favoritos'; $('#detail-favorite').setAttribute('aria-pressed',String(favorites.has(selected)));
}
$('#search').addEventListener('input',()=>{page=0;render();}); $('#favorites-filter').addEventListener('click',()=>{favoritesOnly=!favoritesOnly;page=0;$('#favorites-filter').setAttribute('aria-pressed',String(favoritesOnly));render();});
$('#previous').addEventListener('click',()=>{page--;render();}); $('#next').addEventListener('click',()=>{page++;render();}); $('#detail-favorite').addEventListener('click',()=>toggle(selected));
function theme(name) { if (!['cyan','green','amber','purple'].includes(name)) name='cyan'; document.body.dataset.theme=name; document.querySelectorAll('[data-theme]').forEach(button=>{if(button.tagName==='BUTTON')button.setAttribute('aria-pressed',String(button.dataset.theme===name));});save('sega-web-theme',name); }
document.querySelectorAll('button[data-theme]').forEach(button=>button.addEventListener('click',()=>theme(button.dataset.theme))); theme(read('sega-web-theme','cyan'));
let bootFrame=0, bootTimeout=0, previousFocus=null;
function finishBoot(){ clearTimeout(bootTimeout); cancelAnimationFrame(bootFrame); $('#boot').hidden=true; $('#page').inert=false; document.body.style.overflow=''; if(previousFocus?.isConnected)previousFocus.focus(); }
function startBoot(){clearTimeout(bootTimeout);bootTimeout=setTimeout(finishBoot,4000);previousFocus=document.activeElement;$('#boot').hidden=false;$('#page').inert=true;document.body.style.overflow='hidden';$('#boot').setAttribute('tabindex','-1');$('#boot').focus();const start=performance.now();const tick=now=>{const progress=Math.min(100,Math.floor((now-start)/40));$('#boot-fill').style.width=progress+'%';$('#boot-number').textContent=String(progress).padStart(2,'0')+'%';$('.progress').setAttribute('aria-valuenow',String(progress));if(progress<100)bootFrame=requestAnimationFrame(tick);else finishBoot();};cancelAnimationFrame(bootFrame);bootFrame=requestAnimationFrame(tick); }

document.addEventListener('keydown',event=>{if(!$('#boot').hidden){if(event.key==='Tab'){event.preventDefault();$('#boot').setAttribute('tabindex','-1');$('#boot').focus();}return;}if(event.key==='/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();$('#search').focus();}if(event.key==='Escape' && document.activeElement===$('#search')){$('#search').value='';page=0;render();$('#search').blur();}});
render();startBoot();

async function refreshCatalog(){
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
 try {
  const response=await fetch('https://api.github.com/repos/Lyrians/segalauncher/contents/games.json?ref=main&t='+Date.now(),{cache:'no-store',signal:controller.signal});
  if(!response.ok)throw new Error('HTTP '+response.status);
  const payload=await response.json();
  const data=payload.content?JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.content.replace(/\s/g,'')),c=>c.charCodeAt(0)))):payload;
  const next=validateCatalog(data);
  const marked=[...favorites].map(id=>names[id]);const selectedName=names[selected];
  names=next;favorites.clear();marked.forEach(name=>{const id=names.indexOf(name);if(id>=0)favorites.add(id);});
  selected=Math.max(0,names.indexOf(selectedName));save('sega-web-favorites',[...favorites]);save('sega-web-catalog',data);render();
 } catch { /* Se conserva el catálogo integrado o la última copia válida. */ }
 finally{clearTimeout(timeout);}
}
refreshCatalog();
setInterval(refreshCatalog,300000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshCatalog();});
