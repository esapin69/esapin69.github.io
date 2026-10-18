(()=>{
"use strict";
const PROJECT="https://gjgpcrnmzktnhtbbvmle.supabase.co";
const KEY="sb_publishable_KnQc8oUO-6WlTMuewqOXSg_UGuKXkgy";
const STORE="univers-coaching-vivant-v2", AUTH="univers-coaching-auth-v1";
const $=id=>document.getElementById(id);
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
const uid=()=>crypto.randomUUID();
const timestamp=()=>new Date().toISOString();
const blank=()=>({version:2,profile:{name:"",objective:"",constraints:"",equipment:"maison",minutes:35,weekly:2,focus:"equilibre"},observations:[],sessions:[],weights:[],current:null,scheduled:"",proposal:null,revision:0,pending:[]});
const loadLocal=(key)=>{try{const obj=JSON.parse(localStorage.getItem(key)||"null");return obj&&obj.version===2&&obj.profile?{...blank(),...obj}:blank();}catch(_){return blank();}};
let session=null, identity=null, state=loadLocal(STORE+"-guest"),section="today",feedbackOpen=false,busy=false;
function toast(message){$("toast").textContent=message;$("toast").classList.remove("hidden");setTimeout(()=>$("toast").classList.add("hidden"),4000);}
function cacheKey(){return STORE+"-"+(identity?identity.id:"guest");}
function cache(){try{localStorage.setItem(cacheKey(),JSON.stringify(state));}catch(_){toast("Stockage local saturé : exporte une sauvegarde.");}}
const patterns=["jambes","poussee","tirage","hanches","centre","epaules"];
const labels={jambes:"Jambes",poussee:"Pectoraux et triceps",tirage:"Dos",hanches:"Fessiers",centre:"Gainage",epaules:"Épaules"};
const library={
 maison:{
 jambes:[["Squats","10–12 répétitions","🦵","Pieds à plat, plier hanches et genoux avec contrôle."],["Squats sur chaise","10–12 répétitions","🦵","Descendre vers une chaise stable et se relever sans élan."]],
 poussee:[["Pompes inclinées","6–10 répétitions","💪","Utiliser un support stable et garder le corps aligné."],["Pompes au mur","10–12 répétitions","💪","Pousser doucement contre le mur sans creuser le dos."]],
 tirage:[["Rowing sac à dos léger","10–12 répétitions","🏋️","Sac fermé, dos neutre, tirer vers le ventre."],["Rowing avec bouteilles","10–12 répétitions","🏋️","Coudes près du tronc, contrôler la descente."]],
 hanches:[["Pont fessier","12–15 répétitions","⬆️","Lever le bassin sans cambrure excessive."],["Charnière de hanches","10–12 répétitions","⬆️","Reculer les hanches et garder le dos neutre."]],
 centre:[["Dead bug","20–30 secondes","🛡️","Sur le dos, alterner les membres opposés en gardant le bassin stable."],["Bird dog","20–30 secondes","🛡️","À quatre pattes, bras et jambe opposés sans rotation du bassin."]],
 epaules:[["Élévations légères","10–12 répétitions","↗️","Bouteilles légères, sans haussement des épaules."],["Rotations externes","10–12 répétitions","↗️","Coudes près du buste et mouvement confortable."]]
 },
 salle:{
 jambes:[["Presse à cuisses","10–12 répétitions","🦵","Régler le siège, pieds à plat et contrôle du retour."],["Squat guidé léger","10–12 répétitions","🦵","Charge légère, mouvement contrôlé et amplitude confortable."]],
 poussee:[["Développé poitrine guidé","8–12 répétitions","💪","Siège ajusté, pousser sans verrouillage brusque."],["Pompes inclinées","8–12 répétitions","💪","Support stable et corps aligné."]],
 tirage:[["Tirage horizontal","10–12 répétitions","🏋️","Tirer les poignées vers l'abdomen sans balancer le buste."],["Tirage vertical","10–12 répétitions","🏋️","Ramener vers le haut de poitrine avec contrôle."]],
 hanches:[["Leg curl assis","10–12 répétitions","⬆️","Machine ajustée, fléchir les genoux doucement."],["Hip thrust léger","10–12 répétitions","⬆️","Soulever le bassin sans hyperextension."]],
 centre:[["Gainage sur tapis","20–30 secondes","🛡️","Garder le corps aligné et respirer."],["Dead bug sur tapis","20–30 secondes","🛡️","Stabiliser le tronc pendant l'alternance."]],
 epaules:[["Élévations latérales","10–12 répétitions","↗️","Charge légère et épaules basses."],["Développé épaules guidé","8–12 répétitions","↗️","Amplitude sans douleur et charge légère."]]
 }
};
async function http(path,method,body,token){
 const headers={apikey:KEY,"Content-Type":"application/json"};
 if(token)headers.Authorization="Bearer "+token;
 if(method==="POST"&&path.includes("coach_profiles"))headers.Prefer="resolution=merge-duplicates,return=representation";
 else if(method==="POST"&&path.includes("coach_events"))headers.Prefer="resolution=ignore-duplicates,return=minimal";
 else if(method==="POST"&&path.startsWith("/rest/"))headers.Prefer="return=representation";
 const res=await fetch(PROJECT+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),cache:"no-store"});
 let data=null;try{data=await res.json();}catch(_){}
 if(!res.ok){const error=new Error((data&&((data.msg||data.error_description||data.message||data.error)))||("Erreur serveur "+res.status));error.code=res.status;throw error;}
 return data;
}
function authStatus(message){
 $("account-status").textContent=identity?"Compte connecté : données privées enregistrables dans Univers Creatif.":"Sans connexion, ton suivi reste uniquement sur cet appareil.";
 $("auth-guest").classList.toggle("hidden",!!identity);
 $("auth-user").classList.toggle("hidden",!identity);
 $("signed-email").textContent=identity?(identity.email||"Compte connecté"):"";
 const legacy=!!localStorage.getItem("univers-coaching-profil-v1");$("import-legacy").classList.toggle("hidden",!identity||!legacy||!!localStorage.getItem("coach-legacy-imported-"+(identity?.id||"")));
 $("sync-status").textContent=message||"";
}
async function refresh(){
 if(!session?.refresh_token)throw Error("Connexion expirée.");
 const result=await http("/auth/v1/token?grant_type=refresh_token","POST",{refresh_token:session.refresh_token});
 if(!result.access_token)throw Error("Session non renouvelable.");
 session={access_token:result.access_token,refresh_token:result.refresh_token||session.refresh_token};sessionStorage.setItem(AUTH,JSON.stringify(session));return session;
}
async function authed(path,method="GET",body){
 if(!session)throw Error("Connecte-toi d'abord.");
 try{return await http(path,method,body,session.access_token);}
 catch(err){if(err.code!==401)return Promise.reject(err);await refresh();return await http(path,method,body,session.access_token);}
}
function recordEvent(kind,payload){
 const event={id:uid(),kind,payload,at:timestamp()};state.pending.push(event);
 if(kind==="journal")state.observations.push({id:event.id,at:event.at,signal:payload.signal||"none",text:payload.text||""});
 if(kind==="session")state.sessions.push({id:event.id,...payload,finished:event.at});
 if(kind==="measurement")state.weights.push({id:event.id,...payload});
 cache();if(identity)flushPending().catch(err=>authStatus("Synchronisation en attente : "+err.message));
}
async function flushPending(){
 if(!identity||busy||!state.pending.length)return;
 busy=true;try{
  while(state.pending.length){const evt=state.pending[0];await authed("/rest/v1/coach_events?on_conflict=id","POST",{id:evt.id,user_id:identity.id,kind:evt.kind,payload:evt.payload,occurred_at:evt.at});state.pending.shift();cache();}
  authStatus("Synchronisé avec Supabase.");
 }finally{busy=false;}
}
function eventFromCloud(row){
 const p=row.payload||{},v={id:row.id,at:row.occurred_at,signal:p.signal||"none",text:p.text||""};
 if(row.kind==="journal")return {type:"observation",value:v};
 if(row.kind==="session")return {type:"session",value:{id:row.id,...p,finished:row.occurred_at}};
 if(row.kind==="measurement")return {type:"weight",value:{id:row.id,...p}};
 return null;
}
async function cloudRead(){
 const obj=blank();
 const row=await authed("/rest/v1/coach_profiles?select=*&user_id=eq."+encodeURIComponent(identity.id)+"&limit=1");
 if(Array.isArray(row)&&row[0]){
   const p=row[0];obj.profile={...obj.profile,name:p.display_name||"",objective:p.objective||"",constraints:p.constraints_text||"",...(p.preferences||{})};
 }
 const plans=await authed("/rest/v1/coach_plan_versions?select=*&user_id=eq."+encodeURIComponent(identity.id)+"&order=version.desc&limit=1");
 if(Array.isArray(plans)&&plans[0]&&plans[0].plan?.exercises){obj.current=plans[0].plan;obj.revision=plans[0].version;}
 let offset=0;
 while(true){
  const rows=await authed("/rest/v1/coach_events?select=id,kind,payload,occurred_at&user_id=eq."+encodeURIComponent(identity.id)+"&order=occurred_at.asc,id.asc&limit=500&offset="+offset);
  if(!Array.isArray(rows))throw Error("Historique illisible.");
  for(const row of rows){if(row.kind==="goal"&&row.payload?.goalTrack)obj.profile.goalTrack=row.payload.goalTrack;
   if(row.kind==="schedule"&&row.payload&&typeof row.payload.date==="string")obj.scheduled=row.payload.date;
   if(row.kind==="checkin"&&row.payload&&row.payload.plan_id===obj.current?.id&&Array.isArray(row.payload.checks)){
     for(const entry of row.payload.checks){const ex=obj.current.exercises.find(e=>e.id===entry.id);if(ex&&Array.isArray(entry.checks)&&entry.checks.length===ex.sets)ex.checks=entry.checks.map(Boolean);}
   }
   const evt=eventFromCloud(row);if(!evt)continue;if(evt.type==="observation")obj.observations.push(evt.value);if(evt.type==="session")obj.sessions.push(evt.value);if(evt.type==="weight")obj.weights.push(evt.value);
  }
  offset+=rows.length;if(rows.length<500)break;
 }
 return obj;
}
async function saveProfile(){
 if(!identity){cache();return;}
 const p=state.profile;
 await authed("/rest/v1/coach_profiles?on_conflict=user_id","POST",{user_id:identity.id,display_name:p.name,objective:p.objective,constraints_text:p.constraints,preferences:{equipment:p.equipment,minutes:p.minutes,weekly:p.weekly,focus:p.focus,experience:p.experience||"",scheduleType:p.scheduleType||"",recovery:p.recovery||"",comfortNote:p.comfortNote||"",intake:p.intake||{},goalTrack:p.goalTrack||null,brainState:p.brainState||{},measurementReminders:p.measurementReminders===true},updated_at:timestamp()});
 authStatus("Profil sauvegardé sur Supabase.");
}
async function savePlan(){
 if(!identity){cache();return;}
 await authed("/rest/v1/coach_plan_versions","POST",{id:uid(),user_id:identity.id,version:state.revision,plan:state.current});
 authStatus("Programme enregistré dans l'historique du compte.");
}
async function authenticate(mode){
 const email=$("auth-email").value.trim(),password=$("auth-password").value;
 if(!email.includes("@")||password.length<12){toast("Saisis un e-mail valide et un mot de passe d'au moins 12 caractères.");return;}
 $("signin").disabled=$("signup").disabled=true;
 try{
  const response=mode==="signup"?await http("/auth/v1/signup","POST",{email,password}):await http("/auth/v1/token?grant_type=password","POST",{email,password});
  if(!response.access_token){authStatus("Inscription reçue : vérifie ton e-mail puis connecte-toi. Aucun compte local n'a été associé.");return;}
  await setSession(response);
 }catch(err){authStatus("Connexion impossible : "+err.message);}
 finally{$("signin").disabled=$("signup").disabled=false;$("auth-password").value="";}
}
async function setSession(value){
 const previousSession=session,previousIdentity=identity,previousState=state;
 try{
 session={access_token:value.access_token,refresh_token:value.refresh_token};
 const me=await authed("/auth/v1/user");
 if(!me?.id)throw Error("Utilisateur non identifié.");
 identity={id:me.id,email:me.email};
 // Never import another person's guest account automatically.
 const remote=await cloudRead();
 // Reconcile only events cached for this verified account, never another person's guest data.
 const previous=loadLocal(STORE+"-"+identity.id),pending=Array.isArray(previous.pending)?previous.pending:[];
 const remoteIDs=new Set([...remote.observations,...remote.sessions,...remote.weights].map(x=>x.id));
 for(const evt of pending){
  if(!evt||!evt.id||remoteIDs.has(evt.id))continue;
  remote.pending.push(evt);
  if(evt.kind==="journal")remote.observations.push({id:evt.id,at:evt.at,signal:evt.payload?.signal||"none",text:evt.payload?.text||""});
  else if(evt.kind==="session")remote.sessions.push({id:evt.id,...evt.payload,finished:evt.at});
  else if(evt.kind==="measurement")remote.weights.push({id:evt.id,...evt.payload});
  else if(evt.kind==="schedule"&&evt.payload?.date)remote.scheduled=evt.payload.date;
  else if(evt.kind==="checkin"&&evt.payload?.plan_id===remote.current?.id&&Array.isArray(evt.payload?.checks)){
   for(const item of evt.payload.checks){
    const movement=remote.current.exercises.find(e=>e.id===item.id);
    if(movement&&Array.isArray(item.checks)&&item.checks.length===movement.sets)movement.checks=item.checks.map(Boolean);
   }
  }
 }
 state=remote;
 sessionStorage.setItem(AUTH,JSON.stringify(session));
 if(!remote.current){ensure();await savePlan();}
 cache();
 if(state.pending.length)try{await flushPending();}catch(err){authStatus("Événements conservés, mais non synchronisés : "+err.message);}
 render();
 }catch(err){identity=previousIdentity;session=previousSession;state=previousState;throw err;}
}
async function restore(){
 try{const saved=JSON.parse(sessionStorage.getItem(AUTH)||"null");if(!saved?.access_token||!saved?.refresh_token)return;await setSession(saved);}
 catch(err){identity=null;session=null;sessionStorage.removeItem(AUTH);state=loadLocal(STORE+"-guest");authStatus("Reconnecte-toi pour accéder au suivi en ligne : "+err.message);render();}
}
async function logout(){
 if(!identity)return;
 if(state.pending.length){try{await flushPending();}catch(err){authStatus("Déconnexion interrompue, données encore non synchronisées : "+err.message);return;}
  if(state.pending.length){authStatus("Synchronisation toujours en cours : attends avant de quitter le compte.");return;}
 }
 const signedId=identity.id,token=session?.access_token;
 identity=null;session=null;sessionStorage.removeItem(AUTH);localStorage.removeItem(STORE+"-"+signedId);
 state=loadLocal(STORE+"-guest");render();authStatus("Déconnecté. Les données du compte ne sont plus affichées.");
 try{if(token)await http("/auth/v1/logout","POST",{},token);}catch(_){}
}
const lastSignal=()=>[...state.observations].reverse().find(x=>!["none","migration"].includes(x.signal))||null;
function buildPlan(){
 const signal=lastSignal(),recent=state.sessions.slice(-3),p=state.profile;
 const difficult=p.recovery==="fatigue"||recent.filter(s=>Number(s.effort)>=8).length>=2||signal?.signal==="hard";
 const short=signal?.signal==="time",minutes=short?Math.min(p.minutes,20):p.minutes;
 const old=state.current;
 let order=[...patterns];if(p.focus==="haut")order.sort((a,b)=>Number(["poussee","tirage","epaules"].includes(b))-Number(["poussee","tirage","epaules"].includes(a)));if(p.focus==="bas")order.sort((a,b)=>Number(["jambes","hanches"].includes(b))-Number(["jambes","hanches"].includes(a)));
 const count=minutes<=20?4:minutes<=35?5:6,sets=difficult?2:(recent.length>=2&&recent.slice(-2).every(s=>s.complete&&s.effort<=5)?3:2);
 const exercises=order.slice(0,count).map((cat,i)=>{
  const v=library[p.equipment][cat][(state.revision+i)%2];return {id:uid(),category:cat,title:v[0],reps:v[1],symbol:v[2],instruction:v[3],sets,checks:Array(sets).fill(false),rest:difficult?90:75};
 });
 return {id:uid(),revision:state.revision+1,created:timestamp(),minutes,exercises,needsSafetyReview:signal?.signal==="pain"||["oui","incertain"].includes(p.comfortNote),reason:"Plan révisable fondé sur tes disponibilités et sur tes retours explicitement enregistrés.",previousPlanId:old?.id||null};
}
function ensure(){if(!state.current){state.current=buildPlan();state.revision++;cache();}}
function signalSuggestion(){
 const sig=lastSignal(),sessions=state.sessions.slice(-3);let kind="steady",title="Maintenir le rythme",reason="Après la séance, indique ce que tu as réellement fait. Les changements seront proposés, pas imposés.";
 if(sig?.signal==="pain"){kind="pause";title="Clarifier la gêne";reason="Tu as signalé une gêne. Aucun accroissement de difficulté automatique. Si le mouvement fait mal, interromps-le et demande un avis adapté.";}
 else if(sig?.signal==="time"){kind="lighter";title="Réduire la durée";reason="Tu as signalé une contrainte de temps : mieux vaut une séance courte réalisable.";}
 else if(sig?.signal==="hard"||sessions.filter(s=>s.effort>=8).length>=2){kind="lighter";title="Alléger le volume";reason="Les derniers retours indiquent une difficulté élevée : privilégions le contrôle.";}
 else if(sig?.signal==="missed"){kind="reschedule";title="Replanifier";reason="Une séance manquée ne justifie jamais une surcharge de rattrapage.";}
 else if(sig?.signal==="schedule"){kind="reschedule";title="Adapter le créneau";reason="Tu as signalé un changement de planning. Choisis une date réaliste.";}
 else if(sig?.signal==="easy"&&sessions.length>=2&&sessions.slice(-2).every(s=>s.complete&&s.effort<=5)){kind="reassess";title="Revoir la progression";reason="Plusieurs séances ont été bien réalisées. On peut envisager une progression modérée si la technique reste maîtrisée.";}
 state.proposal={kind,title,reason};$("recommendation").textContent=title+" — "+reason;
 $("accept-suggestion").textContent=kind==="pause"?"Voir mes notes":kind==="reschedule"?"Choisir mon créneau":kind==="steady"?"Démarrer ma séance":"Préparer la prochaine séance";
}
function percent(){
 const ex=state.current.exercises,total=ex.reduce((n,e)=>n+e.sets,0),done=ex.reduce((n,e)=>n+e.checks.filter(Boolean).length,0);
 $("training-meta").textContent=done+" / "+total+" séries";$("training-bar").style.width=(total?Math.round(done/total*100):0)+"%";
 return {done,total};
}
function exercisesUI(){
 const root=$("exercises");root.replaceChildren();
 for(const ex of state.current.exercises){
  const box=el("article","exercise"),head=el("div","exercise-head"),mark=el("span","symbol",ex.symbol),info=el("div","name");
  info.append(el("h3","",ex.title),el("small","",labels[ex.category]||ex.category));head.append(mark,info);
  const reps=el("p","meta",ex.sets+" séries × "+ex.reps+" · récupération "+ex.rest+" sec"),series=el("div","series");
  ex.checks.forEach((done,i)=>{const label=el("label"),input=el("input");input.type="checkbox";input.checked=done;input.setAttribute("aria-label",ex.title+", série "+(i+1));input.addEventListener("change",()=>{ex.checks[i]=input.checked;cache();percent();if(identity){recordEvent("checkin",{plan_id:state.current.id,checks:state.current.exercises.map(e=>({id:e.id,checks:[...e.checks]}))});}});label.append(input,el("span","","Série "+(i+1)));series.append(label);});
  const detail=el("details"),summary=el("summary","mini","Conseils techniques"),text=el("p","instruction",ex.instruction);detail.append(summary,text);box.append(head,reps,series,detail);root.append(box);
 }
 percent();
}
function eventBox(label,body){const box=el("article","entry");box.append(el("div","date",label),el("p","",body));return box;}
function lists(){
 $("notes").replaceChildren();if(!state.observations.length)$("notes").append(el("p","muted","Aucun retour pour le moment."));
 else for(const obs of [...state.observations].reverse().slice(0,60))$("notes").append(eventBox(new Date(obs.at).toLocaleString("fr-FR")+" · "+obs.signal,obs.text));
 $("history").replaceChildren();if(!state.sessions.length)$("history").append(el("p","muted","La première séance enregistrée apparaîtra ici."));
 else for(const s of [...state.sessions].reverse().slice(0,40))$("history").append(eventBox(new Date(s.finished).toLocaleString("fr-FR"),(s.complete?"Terminée":"Partielle")+" — "+s.done+"/"+s.total+" séries, difficulté "+s.effort+"/10. "+(s.comment||"")));
 $("weight-history").replaceChildren();if(!state.weights.length)$("weight-history").append(el("p","muted","Aucune mesure. C'est facultatif."));
 else for(const w of [...state.weights].reverse().slice(0,40))$("weight-history").append(eventBox(w.date,w.value.toFixed(1)+" kg"));
}

function renderGuided(){
 const engine=window.CoachQuestions,root=$("guided-choices");root.replaceChildren();
 if(!engine){$("guided-heading").textContent="Parcours indisponible";$("guided-reason").textContent="Tes séances et ton historique restent accessibles.";return;}
 const q=engine.nextQuestion(state),p=engine.progress(state);
 $("guided-progress").textContent=p.done+" / "+p.total+" repères";
 $("guided-heading").textContent=q?"Apprendre à te connaître":"Tes premiers repères sont prêts";
 $("guided-later").disabled=!q;
 $("guided-question").textContent=q?q.title:"Le coach utilisera tes prochains retours pour adapter les questions.";
 $("guided-reason").textContent=q?q.reason:"Pas de questionnaire sans fin : le coach te reposera une question seulement si un nouveau retour le justifie.";
 $("guided-feedback").textContent="";
 if(!q)return;
 for(const option of q.choices){
  const button=el("button","guided-option",option.label);
  button.type="button";button.setAttribute("aria-label",option.label);
  button.addEventListener("click",()=>acceptGuided(q,option.value));
  root.append(button);
 }
}
async function acceptGuided(q,value){
 const engine=window.CoachQuestions;
 let decision;try{decision=engine.respond(state,q.key,value);}catch(err){toast("Réponse refusée : "+err.message);return;}
 state.profile=decision.profile;cache();
 if(identity)try{await saveProfile();}catch(err){authStatus("Réponse conservée sur cet appareil, synchronisation indisponible : "+err.message);}
 if(decision.replan&&!hasChecked()){
  try{await newPlan();}catch(err){authStatus("Nouveau programme à synchroniser : "+err.message);render();}
 }else render();
 $("guided-feedback").textContent=decision.message;
}
async function postponeGuided(){
 const engine=window.CoachQuestions,q=engine?.nextQuestion(state);
 if(!q)return;
 state.profile=engine.snooze(state,q.key);cache();
 if(identity)try{await saveProfile();}catch(err){authStatus("Report sauvegardé localement : "+err.message);}
 render();toast("Question reportée, sans perdre tes informations.");
}


let currentBrain=null;
function renderBrain(){
 const model=window.CoachBrain;
 if(!model){$("brain-title").textContent="Suivi local indisponible";$("brain-explanation").textContent="Le reste des séances reste disponible.";return;}
 const nextQuestion=window.CoachQuestions?.nextQuestion(state);
 const result=model.evaluate(state,{hasQuestion:!!nextQuestion});
 const choice=result.primary;currentBrain=choice;
 $("brain-title").textContent=choice.title;
 $("brain-explanation").textContent=choice.detail;
 $("brain-source").textContent="Pourquoi cette proposition ? "+choice.source;
 $("brain-summary").textContent="Sur les 7 derniers jours : "+result.statistics.last7+" séance(s) réellement consignées."+(result.statistics.stage?" Étape "+result.statistics.stage.level+" : "+result.statistics.stage.completed+"/"+result.statistics.stage.target+" séance(s).":"");
 $("brain-act").textContent=choice.label;
 $("brain-later").disabled=!!choice.safety;
 $("brain-followup").classList.add("hidden");$("brain-followup").replaceChildren();
}
async function rememberCoachProfile(){
 cache();if(identity)try{await saveProfile();}catch(error){authStatus("Préférence sauvegardée localement, pas encore dans Supabase : "+error.message);}
}
function chooseBrainAction(){
 if(!currentBrain)return;
 const decision=currentBrain,action=decision.action,container=$("brain-followup");
 container.replaceChildren();container.classList.add("hidden");
 if(action==="journal"){view("journal");$("journal-text").focus();return;}
 if(action==="question"){document.getElementById("guided-card").scrollIntoView({behavior:"smooth",block:"start"});return;}
 if(action==="schedule"){view("today");$("start-date").focus();return;}
 if(action==="measurement"){view("evolution");$("weight").focus();return;}
 if(action==="session"){document.getElementById("exercises").scrollIntoView({behavior:"smooth",block:"start"});return;}
 if(action==="confirmSchedule"){
  container.classList.remove("hidden");
  container.append(el("p","muted","Confirme ce qui s'est réellement passé :"));
  const done=el("button","secondary","J'ai effectué la séance");
  const missed=el("button","secondary","Je ne l'ai pas faite");
  done.type=missed.type="button";
  done.addEventListener("click",()=>{container.classList.add("hidden");document.getElementById("exercises").scrollIntoView({behavior:"smooth",block:"start"});toast("Coche les séries réellement faites puis enregistre ton bilan.");});
  missed.addEventListener("click",()=>{const previous=state.scheduled;state.scheduled="";recordEvent("journal",{signal:"missed",text:"Séance initialement prévue le "+previous+" déclarée non réalisée. Un report est possible sans rattrapage punitif."});recordEvent("schedule",{date:""});render();toast("Séance non réalisée enregistrée. Un report est possible.");});
  container.append(done,missed);return;
 }
 if(action==="goalStart"||action==="goalReview"){
  const stats=window.CoachBrain.progress(state).stage,proposed=action==="goalStart"?Math.max(1,Math.min(4,Number(state.profile.weekly)||2)):stats.completed>=stats.target?Math.min(4,stats.target+1):stats.completed===0?Math.max(1,stats.target-1):stats.target;
  container.classList.remove("hidden");
  container.append(el("p","muted","Proposition : "+proposed+" séance(s) réaliste(s) sur les sept prochains jours. À ajuster ensemble, sans obligation ni pénalité."));
  const yes=el("button","primary","Accepter cette étape"),no=el("button","secondary","Pas maintenant");
  yes.type=no.type="button";
  yes.addEventListener("click",async()=>{
   try{
    state.profile=window.CoachBrain.milestone(state,action==="goalStart"?"start":"review");
    cache();recordEvent("goal",{goalTrack:state.profile.goalTrack,reason:"Étape acceptée par la personne"});
    await rememberCoachProfile();render();toast("Étape mémorisée. Elle sera réévaluée à partir des séances réellement consignées.");
   }catch(err){toast("Étape non modifiée : "+err.message);}
  });
  no.addEventListener("click",()=>{container.replaceChildren();container.classList.add("hidden");});
  container.append(yes,no);return;
 }
}
async function postponeBrainAction(){
 if(!currentBrain||currentBrain.safety){toast("Le message de prudence reste disponible.");return;}
 try{state.profile=window.CoachBrain.snooze(state,currentBrain.id);await rememberCoachProfile();render();toast("Rappel dans le site reporté de 24 h.");}
 catch(err){toast("Impossible de reporter : "+err.message);}
}

function render(){
 feedbackOpen=false;document.querySelectorAll(".feedback").forEach(n=>n.remove());
 ensure();const p=state.profile;
 $("greeting").textContent=p.name?"Ta prochaine étape, "+p.name:"Ta prochaine étape";
 $("session-state").textContent=state.current.needsSafetyReview?"Gêne signalée":state.scheduled?"Planifiée":"À programmer";
 $("next-reason").textContent=state.current.needsSafetyReview?"En cas de douleur, interromps le mouvement concerné.":state.scheduled?"Prochaine séance : "+new Date(state.scheduled).toLocaleString("fr-FR"):"Séance indicative de "+state.current.minutes+" minutes.";
 $("start-date").value=state.scheduled||"";
 $("who").value=p.name;$("why").value=p.objective;$("constraints").value=p.constraints;$("equipment").value=p.equipment;$("minutes").value=String(p.minutes);$("weekly").value=String(p.weekly);$("focus").value=p.focus;$("measurement-reminders").checked=p.measurementReminders===true;
 if(!$("weigh-date").value)$("weigh-date").value=new Date().toLocaleDateString("en-CA");
 document.querySelectorAll(".tab").forEach(b=>{const active=b.dataset.tab===section;b.classList.toggle("active",active);if(active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
 document.querySelectorAll(".pane").forEach(pane=>pane.classList.toggle("hidden",pane.id!==section));
 signalSuggestion();exercisesUI();lists();authStatus();renderGuided();renderBrain();
}
function view(name){section=name;render();window.scrollTo({top:0,behavior:"instant"});}
function hasChecked(){return state.current?.exercises.some(ex=>ex.checks.some(Boolean));}
async function newPlan(){
 if(hasChecked()&&!confirm("Des séries ont été cochées. Enregistrer un bilan partiel puis préparer une nouvelle séance ?"))return;
 if(hasChecked())await finishSession(5,"Programme adapté pendant une séance partielle.",true);
 state.current=buildPlan();state.revision++;cache();
 if(identity)try{await savePlan();}catch(e){authStatus("Programme enregistré localement. Serveur : "+e.message);}
 render();toast("Nouvelle version du programme prête.");
}
async function finishSession(effort,comment,partial=false){
 const c=state.current,done=c.exercises.reduce((n,e)=>n+e.checks.filter(Boolean).length,0),total=c.exercises.reduce((n,e)=>n+e.sets,0);
 if(!done){toast("Commence par cocher une série réalisée.");return false;}
 recordEvent("session",{plan_id:c.id,plan_revision:c.revision,complete:done===total,done,total,effort,comment,minutes:c.minutes,exercises:c.exercises.map(e=>({title:e.title,sets:e.sets,checked:e.checks.filter(Boolean).length}))});
 if(!partial){state.current=buildPlan();state.revision++;cache();if(identity)try{await savePlan();}catch(e){authStatus("Plan sauvegardé localement, synchronisation du plan à reprendre : "+e.message);}}
 render();toast("Séance enregistrée dans ton histoire.");return true;
}
function calendar(){
 const val=$("start-date").value||state.scheduled;if(!val){toast("Choisis une date et une heure.");return;}
 const date=new Date(val);if(Number.isNaN(date.getTime())){toast("Date invalide.");return;}
 const end=new Date(date.getTime()+state.current.minutes*60000);
 const format=d=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
 const protect=s=>String(s).replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
 const summary="Séance coaching — "+state.current.exercises.length+" exercices";
 const desc=["Échauffement : 5 min",...state.current.exercises.map((e,i)=>(i+1)+". "+e.title+" — "+e.sets+" séries de "+e.reps+" ; pause "+e.rest+" sec"),"Retour au calme : 3 min","Voir : https://esapin69.github.io/coaching/coach-vivant.html"];
 const evt=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Univers Coaching//FR","CALSCALE:GREGORIAN","BEGIN:VEVENT","UID:"+state.current.id+"@univers-coaching.esapin","DTSTAMP:"+format(new Date()),"DTSTART:"+format(date),"DTEND:"+format(end),"SUMMARY:"+protect(summary),"DESCRIPTION:"+protect(desc.join("\n")),"BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Séance de musculation","TRIGGER:-PT30M","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
 const blob=new Blob([evt],{type:"text/calendar;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="seance-univers-coaching.ics";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast("Fichier calendrier préparé. Ouvre-le dans ton application d'agenda.");
}
function exportData(){
 const pack={format:"univers-coaching-export-v2",exported:timestamp(),data:state};const blob=new Blob([JSON.stringify(pack,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="sauvegarde-univers-coaching-"+new Date().toISOString().slice(0,10)+".json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast("Sauvegarde exportée.");
}
function eventsToImport(data){
 return [...(data.observations||[]).map(o=>({kind:"journal",payload:{signal:o.signal||"none",text:o.text||""}})),...(data.sessions||[]).map(s=>({kind:"session",payload:{...s}})),...(data.weights||[]).map(w=>({kind:"measurement",payload:{...w}}))];
}
async function importData(file){
 if(!file)return;
 if(file.size>3e6){toast("Sauvegarde trop volumineuse.");return;}
 try{
 const parsed=JSON.parse(await file.text());if(parsed.format!=="univers-coaching-export-v2"||!parsed.data?.profile||!Array.isArray(parsed.data.sessions)||!Array.isArray(parsed.data.weights)||!Array.isArray(parsed.data.observations))throw Error("Format incompatible.");
 if(!confirm("Importer cette sauvegarde remplacera le suivi affiché"+(identity?" et créera des événements dans ton compte":"")+" ?"))return;
 if(identity){toast("Pour éviter les doublons entre comptes, l'import d'archives dans le cloud doit être réalisé par une procédure de rapprochement dédiée. Déconnecte-toi pour lire cette sauvegarde localement.");return;}
 state={...blank(),...parsed.data,pending:[]};cache();render();toast("Sauvegarde locale restaurée.");
 }catch(e){toast("Import impossible : "+e.message);}
}
async function init(){
 $("brain-act").addEventListener("click",chooseBrainAction);
 $("brain-later").addEventListener("click",postponeBrainAction);
 $("guided-later").addEventListener("click", postponeGuided);
 $("guided-profile").addEventListener("click",()=>view("prefs"));
 document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>view(b.dataset.tab)));
 $("signin").addEventListener("click",()=>authenticate("signin"));
 $("signup").addEventListener("click",()=>authenticate("signup"));
 $("signout").addEventListener("click",logout);
 $("import-legacy").addEventListener("click",async()=>{
   if(!identity)return;
   let old;try{old=JSON.parse(localStorage.getItem("univers-coaching-profil-v1")||"null");}catch(_){}
   if(!old?.profile){toast("Ancien profil introuvable.");return;}
   if(!confirm("Récupérer les préférences de l'ancien programme dans CE compte ? Les notes d'anciennes séances seront importées, mais les séries de l'ancien module resteront visibles dans celui-ci."))return;
   const p=old.profile;
   state.profile={...state.profile,name:String(p.name||state.profile.name||"").slice(0,60),objective:String(p.goal||state.profile.objective||"").slice(0,3000),equipment:p.place==="salle"?"salle":"maison",minutes:[20,35,50].includes(Number(p.duration))?Number(p.duration):state.profile.minutes,weekly:[1,2,3,4].includes(Number(p.days))?Number(p.days):state.profile.weekly,focus:["haut","bas"].includes(p.focus)?p.focus:"equilibre"};
   try{await saveProfile();for(const h of Array.isArray(old.history)?old.history.slice(-100):[]){recordEvent("journal",{signal:"legacy",text:"Ancien programme : "+String(h.title||"Séance")+" — "+String(h.stamp||"date non indiquée")+" (archive d'origine conservée)."});}await flushPending();localStorage.setItem("coach-legacy-imported-"+identity.id,"1");render();toast("Ancien profil et historique disponibles dans ce compte.");}
   catch(err){authStatus("Import incomplet, reprise possible : "+err.message);}
 });
 $("sync").addEventListener("click",async()=>{try{if(busy){toast("La synchronisation est déjà en cours.");return;}await flushPending();if(state.pending.length){toast("Des événements sont encore en attente.");return;}const remote=await cloudRead();state=remote;cache();render();toast("Données rechargées.");}catch(e){authStatus("Synchronisation impossible : "+e.message);}});
 $("add-note").addEventListener("click",()=>{const text=$("journal-text").value.trim();if(!text){toast("Écris ton observation.");return;}const signal=document.querySelector("input[name=signal]:checked")?.value||"none";recordEvent("journal",{text,signal});$("journal-text").value="";render();toast("Observation enregistrée.");});
 $("save-prefs").addEventListener("click",async()=>{const before=JSON.stringify({equipment:state.profile.equipment,minutes:state.profile.minutes,focus:state.profile.focus});state.profile={...state.profile,name:$("who").value.trim().slice(0,60),objective:$("why").value.trim().slice(0,3000),constraints:$("constraints").value.trim().slice(0,5000),equipment:$("equipment").value,minutes:Number($("minutes").value),weekly:Number($("weekly").value),focus:$("focus").value,measurementReminders:$("measurement-reminders").checked===true};cache();try{await saveProfile();}catch(e){authStatus("Profil local conservé ; cloud non synchronisé : "+e.message);}const changed=before!==JSON.stringify({equipment:state.profile.equipment,minutes:state.profile.minutes,focus:state.profile.focus});if(changed&&!hasChecked())await newPlan();else{toast(changed?"Repères sauvegardés. Une séance est en cours : tes séries sont conservées.":"Repères sauvegardés sans effacer ton histoire.");render();}});
 $("add-weight").addEventListener("click",()=>{const n=Number($("weight").value),date=$("weigh-date").value;if(!(n>=1&&n<=500)||!/^\d{4}-\d{2}-\d{2}$/.test(date)){toast("Saisis une date et une mesure cohérente.");return;}recordEvent("measurement",{date,value:n});$("weight").value="";render();toast("Mesure enregistrée sans jugement.");});
 $("save-schedule").addEventListener("click",()=>{const value=$("start-date").value;if(!value||Number.isNaN(new Date(value).getTime())){toast("Choisis un créneau valable.");return;}state.scheduled=value;cache();if(identity)recordEvent("schedule",{date:value});render();toast("Créneau conservé.");});
 $("ics").addEventListener("click",calendar);
 $("accept-suggestion").addEventListener("click",async()=>{
  const k=state.proposal?.kind;if(k==="pause"){view("journal");return;}if(k==="reschedule"){$("start-date").focus();return;}
  if(k==="lighter"||k==="reassess"){await newPlan();return;}document.getElementById("exercises").scrollIntoView({behavior:"smooth",block:"start"});
 });
 $("skip-suggestion").addEventListener("click",()=>toast("Ton choix est respecté. Aucune progression imposée."));
 $("complete").addEventListener("click",()=>{
  if(feedbackOpen)return;feedbackOpen=true;
  const box=el("div","feedback"),title=el("h3","","Retour sur cette séance"),desc=el("p","help","Note la difficulté ressentie, puis enregistre même une séance partielle."),label=el("label","","Difficulté ressentie (1 facile à 10 difficile)"),select=el("select","field");
  select.id="effort";for(let i=1;i<=10;i++){const op=el("option","",i+"/10");op.value=i;if(i===6)op.selected=true;select.append(op);}
  const noteLabel=el("label","","Commentaire facultatif"),textarea=el("textarea","field");textarea.rows=3;textarea.maxLength=2000;textarea.placeholder="Ce que tu as réellement vécu…";
  const btn=el("button","primary wide","Enregistrer mon bilan");btn.type="button";btn.addEventListener("click",async()=>{if(await finishSession(Number(select.value),textarea.value.trim())){feedbackOpen=false;box.remove();}});
  box.append(title,desc,label,select,noteLabel,textarea,btn);$("session-content")?.append(box);
  if(!$("session-content"))$("exercises").after(box);
 });
 $("reset-sets").addEventListener("click",()=>{if(!confirm("Décocher les séries en cours sans effacer l'historique ?"))return;for(const ex of state.current.exercises)ex.checks=Array(ex.sets).fill(false);cache();render();});
 $("backup").addEventListener("click",exportData);
 $("import-trigger").addEventListener("click",()=>$("import-file").click());
 $("import-file").addEventListener("change",e=>{importData(e.target.files?.[0]);e.target.value="";});
 $("erase").addEventListener("click",()=>{if(identity){toast("Pour supprimer les données de ton compte, utilise le bouton voisin.");return;}if(!confirm("Effacer toutes les données locales de ce navigateur ?"))return;localStorage.removeItem(cacheKey());state=blank();render();toast("Données locales effacées.");});
 $("erase-cloud").addEventListener("click",async()=>{
   if(!identity){toast("Connecte-toi au compte à supprimer.");return;}
   if(!confirm("Cette action supprimera définitivement les séances, pesées, notes, objectifs et programmes du compte connecté. Les autres univers resteront intacts. Continuer ?"))return;
   const typed=prompt('Tape exactement SUPPRIMER pour confirmer la suppression irréversible de tes données Coaching.');
   if(typed!=="SUPPRIMER"){toast("Suppression annulée.");return;}
   const owner=identity.id;
   try{
     await authed("/rest/v1/rpc/coach_purge_own_data","POST",{});
     localStorage.removeItem(STORE+"-"+owner);
     state=blank();cache();render();toast("Données Coaching du compte supprimées. Le compte de connexion est conservé.");
   }catch(err){authStatus("Suppression non confirmée : "+err.message);}
 });
 render();await restore();authStatus();
}
init().catch(e=>{authStatus("Initialisation incomplète : "+e.message);});
})();