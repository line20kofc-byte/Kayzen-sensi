/* Kayzen Sensitivity — static client. No fabricated 'popular' configurations. */
'use strict';
const $ = id => document.getElementById(id);
const IOS_PPI = Object.freeze({
  'iPhone 11':326,'iPhone 12':460,'iPhone 12 mini':476,'iPhone 12 Pro':460,'iPhone 12 Pro Max':458,
  'iPhone 13':460,'iPhone 13 mini':476,'iPhone 13 Pro':460,'iPhone 13 Pro Max':458,
  'iPhone 14':460,'iPhone 14 Plus':458,'iPhone 14 Pro':460,'iPhone 14 Pro Max':460,
  'iPhone 15':460,'iPhone 15 Plus':460,'iPhone 15 Pro':460,'iPhone 15 Pro Max':460,
  'iPhone 16':460,'iPhone 16 Plus':460,'iPhone 16 Pro':460,'iPhone 16 Pro Max':460,
  'iPhone 16e':460,'iPhone 17':460,'iPhone 17e':460,'iPhone 17 Pro':460,'iPhone 17 Pro Max':460,
  'iPhone Air':460,'iPhone 18 Pro':460,'iPhone 18 Pro Max':460
});
const MYTHS = [
  ['Cursor grande deixa a mira mais precisa?','MITO','O cursor grande muda o destaque visual dos controles de acessibilidade, não a sensibilidade do dedo dentro do Free Fire.'],
  ['A velocidade do cursor aumenta a sensi no iPhone?','MITO NO TOUCH','A velocidade de rastreamento é usada com mouse ou trackpad. Ela não altera a sensibilidade do toque do jogador.'],
  ['Ciclos do iPhone melhoram a puxada?','MITO','Ciclos, em Ajustes → Acessibilidade → Controle Assistivo, determinam quantas vezes o escaneamento percorre itens. Não são ciclos de mira nem deixam o arrasto mais rápido.'],
  ['DPI do iPhone é igual à menor largura do Android?','MITO','No iPhone o PPI publicado pelo fabricante indica densidade física da tela. O iOS não oferece o mesmo ajuste de “Menor largura” disponível no Android.'],
  ['DPI 720 ou 960 garante mais capa?','MITO','720 e 960 são números usados em algumas configurações compartilhadas, mas não são melhores para todos. A opção Menor largura (dp) altera a escala visual e pode deixar menus pequenos ou desconfortáveis. Anote o valor original e teste gradualmente.'],
  ['Tamanho da fonte altera a sensibilidade?','MITO','Mudar fonte não altera diretamente as sensibilidades Geral, Red Dot, 2x e 4x dentro do Free Fire.'],
  ['FPS estável melhora a experiência da mira?','VERDADE','Um jogo com FPS estável pode parecer mais responsivo e consistente. FPS e sensibilidade numérica não são a mesma coisa.'],
  ['Sensibilidade ideal é igual para todo mundo?','MITO','O aparelho, o HUD e o jeito de jogar mudam bastante a preferência. Os cinco perfis deste site são pontos de partida experimentais, não resultados comprovados.']
];
const PROFILE_NAMES = ['Equilibrado', 'Controle', 'Ágil', 'Precisão', 'Resposta rápida'];

const PUBLIC_POSTS = Array.isArray(window.KAYZEN_PUBLIC_PROFILES)?window.KAYZEN_PUBLIC_PROFILES:[];
let LIVE_POSTS=[]; // Configurações completas extraídas de trechos de pesquisa, identificadas como NÃO TESTADAS.
function canonicalModel(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(samsung|xiaomi|motorola|apple)\b/g,'').replace(/\bgalaxy\s+/g,'').replace(/\bmoto\s+/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function publishedFor(model,platformValue){const key=canonicalModel(model);return [...LIVE_POSTS,...PUBLIC_POSTS].filter(x=>canonicalModel(x.model)===key&&(platformValue==='ios' ? x.dpi==null : x.dpi!=null))}
function autoDpiMessage(){if(platform!=='android')return;const model=currentModel(),posts=publishedFor(model,platform);$('autoDpiValue').textContent=!model?'Digite o modelo do celular':posts.length?`${posts.map(x=>x.dpi+' dp').join(' · ')}  • publicados pela comunidade`:'Sem fonte para este modelo: 400, 520, 600, 720 e 960 dp são faixas de TESTE, não recomendações comprovadas.';}

let platform='android';
let profiles=[];
let sessionKey='';
const secureStorage = {read(key,def){try{const v=JSON.parse(localStorage.getItem(key));return v==null?def:v}catch{return def}},write(key,v){try{localStorage.setItem(key,JSON.stringify(v))}catch{}}};
let favorites=secureStorage.read('kayzen_favorites_v1',[]);
if(!Array.isArray(favorites))favorites=[];
let savedSettings=secureStorage.read('kayzen_form_v1',{});
const escapeHTML=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function setMessage(id,msg,error=false){const el=$(id);el.textContent=msg;el.classList.toggle('error',error)}
function changeScreen(screen){document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id===screen));document.querySelectorAll('[data-screen]').forEach(e=>e.classList.toggle('active',e.dataset.screen===screen));if(screen==='favoritos')drawFavorites();if(screen==='pesquisa')updateSearchTarget();window.scrollTo({top:0,behavior:'instant'});if(location.hash!=='#'+screen)history.replaceState(null,'','#'+screen)}
function choosePlatform(value){platform=value==='ios'?'ios':'android';document.querySelectorAll('[data-platform]').forEach(e=>e.classList.toggle('selected',e.dataset.platform===platform));$('iphoneBox').hidden=platform!=='ios';$('iosPpiBox').hidden=platform!=='ios';$('cyclesBox').hidden=platform!=='ios';$('trackingBox').hidden=platform!=='ios';$('androidDpiBox').hidden=platform==='ios';autoDpiMessage();$('modelBox').hidden=platform==='ios' && $('iphoneModel').value!=='Outro iPhone';$('model').placeholder=platform==='ios'?'Digite o modelo exato do iPhone':'Ex: Redmi Note 13, Galaxy A54...';updatePpi();saveSettings()}
function updatePpi(){const model=$('iphoneModel').value;const ppi=IOS_PPI[model];$('ppiValue').textContent=ppi?`${ppi} PPI (densidade física, não alterável)`:'PPI ainda não cadastrado — consulte as especificações Apple';$('modelBox').hidden=!(platform==='ios' && model==='Outro iPhone') && platform==='ios';saveSettings()}
function saveSettings(){const v={platform,model:$('model').value,iphoneModel:$('iphoneModel').value,game:$('game').value,style:$('style').value,speed:$('speed').value,cycles:$('cycles').value,tracking:$('tracking').value};secureStorage.write('kayzen_form_v1',v)}
function currentModel(){return platform==='ios'?($('iphoneModel').value==='Outro iPhone'?$('model').value.trim():$('iphoneModel').value):$('model').value.trim()}
function getForm(){const model=currentModel();if(model.length<3)throw Error('Selecione ou digite um modelo de celular válido.');const posts=publishedFor(model,platform);return {platform,model,game:$('game').value,style:$('style').value,speed:$('speed').value,androidDpi:platform==='android'?(posts[0]?.dpi ?? 400):null,dpiFromSource:platform==='android'&&posts.length>0,ppi:platform==='ios'?IOS_PPI[model]||null:null,cycles:platform==='ios'?Number($('cycles').value):null,tracking:platform==='ios'?$('tracking').value:null}}
const clamp=(x,min,max)=>Math.max(min,Math.min(max,Math.round(x)));
// Cinco faixas experimentais (inclui 720 e teto 960) quando a fonte não cobre os cinco perfis.
// Estes são valores de "Menor largura" em dp, NÃO o PPI do hardware.
 // 720 aparece em publicações de Free Fire; isso não o valida para qualquer celular.
const EXPERIMENTAL_DPI_LEVELS=Object.freeze([400,520,600,720,960]);
function availableExperimentalDpis(publishedDpis,needed){
  const existing=publishedDpis.filter(Number.isFinite);
  const selection=[];
  const preferred=EXPERIMENTAL_DPI_LEVELS.slice(-needed);
  for(const target of preferred){
    const available = v=>v>=250&&v<=960&&![...existing,...selection].some(x=>Math.abs(x-v)<12);
    let dpi=target;
    if(!available(dpi)){
      const meaningfulAlternatives=[840,900,660,480,760,880,560,360];
      let found=meaningfulAlternatives.find(available);
      if(found==null){
        for(let delta=12;delta<=710;delta+=12){
          const alt=[target-delta,target+delta].find(available);
          if(alt!=null){found=alt;break}
        }
      }
      dpi=found??400;
    }
    selection.push(dpi);
  }
  return selection;
}
const DRAG_LEVELS=['Médio','Controlado','Rápido','Muito controlado','Muito rápido'];
function generateProfiles(form){
  const styleBase={balanced:[165,155,148,140,92,128],rush:[184,180,167,154,103,142],precision:[147,145,133,120,85,113]};
  const posts=publishedFor(form.model,form.platform);
  const base=posts.length ? posts[0].values : (styleBase[form.style]||styleBase.balanced);
  const speedDelta={slow:9,normal:0,fast:-7}[form.speed]||0;
  const variants=[0,-13,11,-7,6],step=[0,3,-2,1,-3];
  const sourceCount=Math.min(5,posts.length);
  const dpis=form.platform==='android'?availableExperimentalDpis(posts.slice(0,sourceCount).map(p=>Number(p.dpi)),5-sourceCount):[];
  let fallbackDpiIndex=0;
  return PROFILE_NAMES.map((name,i)=>{
    const post=posts[i]||null;
    const values=post?[...post.values]:base.map((v,j)=>clamp(v+variants[i]+speedDelta+(j>=4?step[i]:0),0,200));
    const dpi= form.platform==='android' ? (post?.dpi ?? dpis[fallbackDpiIndex++]) : null;
    return {id:`v3|${form.platform}|${form.model}|${form.game}|${form.style}|${form.speed}|${i}|${post?.url||''}`,name:post?(post.site==='Busca indexada'?'Trecho indexado • não testado':`Publicado por ${post.author}`):name,number:i+1,form:{...form},values,dpi,
      source:post?{url:post.url,author:post.author,site:post.site||'Mobileverso • comunidade',button:post.button}:null,
      dragSuggested:DRAG_LEVELS[i],created:new Date().toISOString()};
  });
}
function profileText(p){const v=p.values,ios=p.form.platform==='ios';const dpiTxt=ios?`PPI físico do iPhone: ${p.form.ppi||'não cadastrado'} (não é ajustável)`:`DPI/menor largura publicado ou experimental: ${p.dpi} dp`;
  const provenance=p.source?`Publicado por ${p.source.author} em ${p.source.site}\nFonte: ${p.source.url}`:'Experimento calculado automaticamente, NÃO testado no modelo. Em Android, valores altos como 720 e 960 podem comprometer a leitura; anote a menor largura original.';
  return `KAYZEN SENSITIVITY • ${p.source?'CONFIGURAÇÃO PUBLICADA':'PERFIL EXPERIMENTAL'}\n${p.form.model} — ${p.form.game}\n${p.name}\nGeral: ${v[0]}\nRed Dot: ${v[1]}\nMira 2x: ${v[2]}\nMira 4x: ${v[3]}\nAWM: ${v[4]}\nOlhadinha: ${v[5]}\n${dpiTxt}\n${provenance}\nSugestão de arrasto: ${p.dragSuggested}\n${ios?`Ciclos do Controle Assistivo: ${p.form.cycles}; velocidade de cursor: ${p.form.tracking} (não alteram a mira por toque)`:''}`;}

function profileHTML(p){
  const saved=favorites.some(f=>f.id===p.id),v=p.values,ios=p.form.platform==='ios';
  const dpiText=ios?(p.form.ppi?`${p.form.ppi} PPI`:'PPI não cadastrado'):`${p.dpi} dp`;
  const dpiHelp=ios?'Densidade física fixa; o DPI publicado em vídeos para iOS não é uma configuração ajustável.':(p.source?'Valor publicado por jogador. Não é uma recomendação comprovada.':p.dpi>=720?'DPI ALTO EXPERIMENTAL: 720–960 pode reduzir muito a legibilidade ou alterar o HUD. Ajuste com cautela e anote o valor original.':'Alternativa experimental; não foi testada no seu aparelho.');
  const speedText=escapeHTML(p.dragSuggested||'Médio');
  return `<article class="profile-card"><div class="profile-head"><div><span class="smallcaps">${p.source?'PERFIL PUBLICADO':'PERFIL EXPERIMENTAL'} ${String(p.number).padStart(2,'0')}</span><h3>${escapeHTML(p.name)}</h3></div><span class="number-tag">#0${p.number}</span></div>
  <div class="dpi-highlight"><div><span>${ios?'DPI / PPI DO IPHONE':'DPI DO PERFIL (MENOR LARGURA)'}</span><strong>${escapeHTML(dpiText)}</strong></div><small>${escapeHTML(dpiHelp)}</small></div>
  <div class="stats">${[['Geral',v[0]],['Red Dot',v[1]],['Mira 2x',v[2]],['Mira 4x',v[3]],['AWM',v[4]],['Olhadinha',v[5]]].map(([l,val])=>`<div class="stat"><label>${l}</label><strong>${val}</strong></div>`).join('')}</div>
  <div class="profile-note"><strong>Arrasto sugerido:</strong> ${speedText} (experimental)<br>${p.source?`<strong>Fonte:</strong> ${escapeHTML(p.source.site)} · ${escapeHTML(p.source.author)}<br>`:''}${ios?`<strong>Ciclos:</strong> ${p.form.cycles} (acessibilidade) · <strong>Vel. cursor:</strong> ${escapeHTML(p.form.tracking)} (não afetam o toque)`:`<strong>Antes de alterar:</strong> anote a menor largura original do seu aparelho`}<br>${escapeHTML(p.form.model)}</div>
  <div class="card-actions"><button type="button" data-copy="${escapeHTML(p.id)}">⧉ Copiar</button><button type="button" class="${saved?'saved':''}" data-favorite="${escapeHTML(p.id)}">${saved?'♥ Salvo':'♡ Salvar'}</button></div>${p.source?`<a class="source-btn" href="${escapeHTML(p.source.url)}" target="_blank" rel="noopener noreferrer">Ver configuração original ↗</a>`:''}</article>`;
}
function drawProfiles(){const root=$('profileCards');root.innerHTML=profiles.map(profileHTML).join('');$('resultsSection').hidden=!profiles.length}
function drawFavorites(){const root=$('favoritesList');root.innerHTML=favorites.length?favorites.map(profileHTML).join(''):'<div class="notice-card">Ainda não há perfis favoritos. Gere configurações na aba Início e toque em “Salvar”.</div>';updateFavCount()}
function updateFavCount(){$('favCount').textContent=favorites.length}
function allKnownProfiles(){const map=new Map([...profiles,...favorites].map(p=>[p.id,p]));return map}
async function copyProfile(id){const p=allKnownProfiles().get(id);if(!p)return;const txt=profileText(p);try{await navigator.clipboard.writeText(txt);setMessage('formMessage','Configuração copiada!')}catch{const area=document.createElement('textarea');area.value=txt;document.body.appendChild(area);area.select();const ok=document.execCommand('copy');area.remove();setMessage('formMessage',ok?'Configuração copiada.':'Não foi possível copiar; use o navegador em HTTPS.',!ok)}}
function toggleFavorite(id){const p=allKnownProfiles().get(id);if(!p)return;const old=favorites.findIndex(x=>x.id===id);if(old>=0)favorites.splice(old,1);else favorites.unshift(p);favorites=favorites.slice(0,100);secureStorage.write('kayzen_favorites_v1',favorites);updateFavCount();drawProfiles();drawFavorites()}
function updateSearchTarget(){const model=currentModel();$('searchTarget').textContent=model?`${platform==='ios'?'iPhone':'Android'} • ${model} • ${$('game').value}`:'Selecione o aparelho na aba Início para fazer a busca.'}
function manualSearchLinks(form){
  const root=$('researchResults');root.replaceChildren();const query=`${form.model} ${form.game} sensi dpi`;const info=document.createElement('div');info.className='notice-card';
  info.textContent='O TikTok não fornece resultados públicos completos para consulta automática neste site sem uma fonte de busca configurada. Abra a pesquisa de vídeos ou consulte as publicações da comunidade já disponíveis nos perfis.';root.append(info);
  [['Pesquisar no TikTok','https://www.tiktok.com/search?q='],['Pesquisar vídeos TikTok no Google','https://www.google.com/search?q=site%3Atiktok.com%20'],['Pesquisar comunidade Free Fire','https://www.google.com/search?q=site%3Amobileverso.com.br%2Ffreefire%2Fsensi%20']].forEach(([label,prefix])=>{
    const a=document.createElement('a');a.href=prefix+encodeURIComponent(query);a.target='_blank';a.rel='noopener noreferrer';a.textContent=label+' ↗';a.className='manual-link';root.append(a)
  });
}
function safeURL(url){try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null}}
function drawSources(data){const root=$('researchResults');root.replaceChildren();const profiles=data.perfis_encontrados||[],sources=data.fontes||[];if(!profiles.length){const el=document.createElement('div');el.className='notice-card';el.textContent='Nenhum perfil completo e vinculado ao modelo foi encontrado nos trechos. Veja as fontes ou use os perfis experimentais offline.';root.append(el)}for(const item of profiles){let el=document.createElement('article');el.className='source';let title=document.createElement('h4');title.textContent=item.titulo;el.append(title);let badge=document.createElement('span');badge.className='pill';badge.textContent='EXTRAÍDO DE TRECHO • NÃO TESTADO';el.append(badge);let p=document.createElement('p');p.textContent=Object.entries(item.valores||{}).map(([k,v])=>`${k.replaceAll('_',' ')}: ${v}`).join(' · ');el.append(p);const href=safeURL(item.url);if(href){let a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Abrir fonte ↗';a.style.color='#dbadff';el.append(a)}root.append(el)}if(sources.length){let heading=document.createElement('h3');heading.textContent='Páginas encontradas';root.append(heading)}for(const source of sources){const href=safeURL(source.url);if(!href)continue;const el=document.createElement('article');el.className='source';const h=document.createElement('h4');const a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=source.titulo;h.append(a);el.append(h);let p=document.createElement('p');p.textContent=source.resumo||'Trecho indisponível';el.append(p);root.append(el)}}
async function searchOnline(fromGenerate=false){
  let form;try{form=getForm()}catch(e){setMessage('searchMessage',e.message,true);return}
  setMessage('searchMessage','Pesquisando resultados indexados do TikTok e outras fontes...');$('searchOnline').disabled=true;
  if(fromGenerate)setMessage('formMessage','Perfis iniciais carregados. Procurando publicações online para este modelo...');
  try{
    const params=new URLSearchParams({model:form.model,game:form.game,platform:form.platform});
    const cacheKey='kayzen_live_v5_'+params;
    const cached=secureStorage.read(cacheKey,null);
    let data;
    if(cached&&Number(cached.at)>Date.now()-6*3600*1000&&Array.isArray(cached.data?.sources))data=cached.data;
    else{
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),17000);
      let result;
      try{result=await fetch('/.netlify/functions/search?'+params,{signal:controller.signal,headers:{Accept:'application/json'}})}finally{clearTimeout(timer)}
      const payload=await result.json().catch(()=>({error:'Resposta inválida do servidor'}));
      if(!result.ok)throw Error(payload.error||'Pesquisa indisponível');
      data=payload;
      secureStorage.write(cacheKey,{at:Date.now(),data});
    }
    const sources=Array.isArray(data.sources)?data.sources:[];
    // Nunca adivinhar campos ausentes: usar no máximo cinco configurações COM TODOS os valores explícitos no trecho.
    const extracted=sources.filter(s=>s.modelMatch&&s.settings&&typeof s.settings==='object'&&(
      form.platform==='ios'||(Array.isArray(s.dpis)&&s.dpis.length)));
    const next=extracted.slice(0,5).map((s,i)=>({model:form.model,author:'fonte indexada #'+(i+1),site:'Busca indexada',dpi:form.platform==='android'?Number(s.dpis[0]):null,
      values:['geral','red_dot','mira_2x','mira_4x','awm','olhadinha'].map(key=>Number(s.settings[key])),button:null,url:s.url}));
    if(currentModel()===form.model && platform===form.platform && $('game').value===form.game){
      LIVE_POSTS=next;
      if(fromGenerate||profiles.length){profiles=generateProfiles(form);drawProfiles();autoDpiMessage()}
    }
    drawSources({perfis_encontrados:sources.filter(s=>s.modelMatch&&(s.dpis?.length||s.settings)).map(s=>({titulo:s.title,url:s.url,valores:{...(s.dpis?.length?{DPI_citado:s.dpis.join(', ')}:{}),...(s.settings||{})}})),
      fontes:sources.map(s=>({titulo:s.title,url:s.url,resumo:s.snippet}))});
    setMessage('searchMessage',`${sources.length} fonte(s) encontradas; ${next.length} configuração(ões) completas identificadas. Os resultados precisam de conferência na fonte.`);
    if(fromGenerate)setMessage('formMessage',next.length?`${next.length} configuração(ões) completas localizadas em trechos indexados. Confira as fontes na aba Pesquisa; as demais opções são experimentais.`:'Busca concluída: não houve configurações completas verificáveis nos trechos. Os cinco perfis exibidos são dados publicados previamente ou testes experimentais.');
    manualSearchLinksAppend(form);
  }catch(e){
    manualSearchLinks(form);
    const msg=String(e.message||'Pesquisa indisponível');
    setMessage('searchMessage',msg,true);
    if(fromGenerate)setMessage('formMessage','Mostrando os perfis iniciais. Busca online não disponível: '+msg,true);
  }finally{$('searchOnline').disabled=false}
}
function manualSearchLinksAppend(form){const target=$('researchResults');const q=encodeURIComponent(`${form.model} ${form.game} sensi dpi`);const a=document.createElement('a');a.className='manual-link';a.href='https://www.tiktok.com/search?q='+q;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Abrir pesquisa no TikTok ↗';target.append(a)}
function showMyths(){$('mythsList').innerHTML=MYTHS.map(([q,t,a],i)=>`<details class="myth" ${i===0?'open':''}><summary><span class="tag">${t}</span><span>${escapeHTML(q)}</span></summary><p>${escapeHTML(a)}</p></details>`).join('')}
function detect(){const ua=navigator.userAgent||'';if(/iPad|iPhone|iPod/i.test(ua)){choosePlatform('ios');setMessage('formMessage','iOS detectado. Escolha manualmente o modelo exato: o Safari não fornece essa informação com confiança.');return}if(/Android/i.test(ua)){choosePlatform('android');const m=ua.match(/Android\s*[\d.]+;\s*([^;\)]{3,75})(?:[;)])/i);if(m){let cand=m[1].replace(/\s*Build\/.*$/i,'').trim();if(cand.length>=4&&!/^(?:wv|mobile|linux|en-us)$/i.test(cand))$('model').value=cand}setMessage('formMessage','Android detectado. Confira o modelo; o DPI será sugerido automaticamente.');autoDpiMessage();saveSettings();return}setMessage('formMessage','Não foi possível identificar o celular automaticamente. Selecione Android ou iPhone.');}
function onGenerate(){try{const form=getForm();saveSettings();profiles=generateProfiles(form);sessionKey=form.model;drawProfiles();setMessage('formMessage',`${profiles.filter(p=>p.source).length} perfil(is) publicado(s) e ${profiles.filter(p=>!p.source).length} experimental(is). DPI indicado automaticamente; anote sua menor largura original antes de mudar.`);$('resultsSection').scrollIntoView({behavior:'smooth',block:'start'});searchOnline(true)}catch(e){setMessage('formMessage',e.message,true)}}
function hydrate(){for(const [name,val] of Object.entries(savedSettings)){if(name==='platform')continue;const el=$(name);if(el&&val!=null)el.value=String(val)}choosePlatform(savedSettings.platform||(/iPhone|iPad|iPod/.test(navigator.userAgent)?'ios':'android'));if(platform==='ios'&&$('iphoneModel').value==='')$('iphoneModel').value='iPhone 13';updatePpi();updateFavCount();showMyths();updateSearchTarget();autoDpiMessage()}
for(const button of document.querySelectorAll('[data-screen]'))button.addEventListener('click',()=>changeScreen(button.dataset.screen));
for(const button of document.querySelectorAll('[data-platform]'))button.addEventListener('click',()=>choosePlatform(button.dataset.platform));
for(const el of document.querySelectorAll('input,select'))el.addEventListener('change',()=>{saveSettings();updateSearchTarget();autoDpiMessage()});
$('iphoneModel').addEventListener('change',updatePpi);
$('generate').addEventListener('click',onGenerate);$('detect').addEventListener('click',detect);$('searchOnline').addEventListener('click',searchOnline);
document.addEventListener('click',e=>{const cp=e.target.closest('[data-copy]'),fav=e.target.closest('[data-favorite]');if(cp)copyProfile(cp.dataset.copy);if(fav)toggleFavorite(fav.dataset.favorite)});
hydrate();const initial=location.hash.replace('#','');if(['inicio','pesquisa','favoritos','mitos'].includes(initial))changeScreen(initial);
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
