/* Univers Coaching : decisions locales explicables ; aucune IA, aucun reseau. */
(function(root){
"use strict";
const DAY=86400000, iso=ms=>new Date(ms).toISOString();
const ts=v=>{const n=Date.parse(v||"");return Number.isFinite(n)?n:NaN;};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||a));
const rows=(s,k)=>Array.isArray(s?.[k])?s[k]:[];
const recent=(a,now,days)=>a.filter(x=>{const t=ts(x?.at||x?.finished);return Number.isFinite(t)&&t<=now&&now-t<=days*DAY;});
function progress(s,now=Date.now()){
 const completed=recent(rows(s,"sessions"),now,28).filter(x=>Number(x.done)>0);
 const last=completed.length?completed.reduce((a,b)=>ts(a.finished)>ts(b.finished)?a:b).finished:null;
 const track=s?.profile?.goalTrack;
 let stage=null;
 if(track&&Number.isFinite(ts(track.startedAt))){
  const started=ts(track.startedAt),target=clamp(track.targetSessions,1,4);
  const done=rows(s,"sessions").filter(x=>Number(x.done)>0&&ts(x.finished)>=started&&ts(x.finished)<=now).length;
  stage={level:clamp(track.level,1,999),target,completed:done,startedAt:track.startedAt,endsAt:iso(started+7*DAY),due:now-started>=7*DAY};
 }
 return {last28:completed.length,last7:completed.filter(x=>now-ts(x.finished)<=7*DAY).length,lastFinished:last,stage};
}
function evaluate(s,options={}){
 const now=Number.isFinite(options.now)?options.now:Date.now(),stats=progress(s,now),p=s?.profile||{};
 const observations=recent(rows(s,"observations"),now,14);
 const find=names=>[...observations].reverse().find(o=>names.includes(o.signal));
 const list=[],add=item=>list.push(item);
 const pain=find(["pain"]);
 if(pain)add({id:"pain-"+pain.id,kind:"safety",priority:100,title:"Prendre en compte la gêne signalée",detail:"Tu as signalé une douleur ou une gêne. N'augmente pas la difficulté de ce mouvement. Si elle persiste, arrête-le et demande un avis adapté.",source:"Retour du "+new Date(ts(pain.at)).toLocaleDateString("fr-FR"),action:"journal",label:"Préciser la situation",safety:true});
 const scheduled=ts(s?.scheduled),last=ts(stats.lastFinished);
 if(Number.isFinite(scheduled)&&scheduled<now-6*3600000&&(!Number.isFinite(last)||last<scheduled)){
  add({id:"scheduled-"+String(s.scheduled),kind:"schedule",priority:82,title:"Cette séance était prévue : qu'en est-il ?",detail:"Une date passée ne prouve pas qu'une séance a été manquée. Confirme ce que tu as fait, puis reporte si nécessaire.",source:"Créneau : "+new Date(scheduled).toLocaleString("fr-FR"),action:"confirmSchedule",label:"Faire le point"});
 }
 const hard=find(["hard"]);
 if(hard||recent(rows(s,"sessions"),now,14).filter(x=>Number(x.effort)>=8).length>=2){
  add({id:"effort-"+(hard?.id||"multiple"),kind:"recovery",priority:76,title:"Réévaluer la difficulté",detail:"Les derniers retours suggèrent de ne pas augmenter le volume pour l'instant. Précise ce qui était difficile.",source:hard?"Observation du "+new Date(ts(hard.at)).toLocaleDateString("fr-FR"):"Plusieurs séances difficiles",action:"journal",label:"Expliquer la difficulté"});
 }
 const constraint=find(["time","schedule","missed"]);
 if(constraint)add({id:"constraint-"+constraint.id,kind:"planning",priority:72,title:"Organiser une séance réaliste",detail:"Ta contrainte mérite un créneau adapté. Les séries déjà réalisées seront conservées.",source:"Observation du "+new Date(ts(constraint.at)).toLocaleDateString("fr-FR"),action:"schedule",label:"Choisir un créneau"});
 if(stats.stage?.due){
  const achieved=stats.stage.completed>=stats.stage.target;
  add({id:"goal-"+stats.stage.startedAt,kind:"goalReview",priority:67,title:achieved?"Étape atteinte : décider de la suite":"Faire le bilan de cette étape",detail:String(stats.stage.completed)+" séance(s) consignées sur "+stats.stage.target+" visée(s) en sept jours. "+(achieved?"Une nouvelle étape est possible, sans augmentation imposée.":"Tu peux conserver ou alléger le prochain objectif."),source:"Étape "+stats.stage.level,action:"goalReview",label:"Examiner l'étape"});
 }else if(!stats.stage){
  add({id:"goal-new",kind:"milestone",priority:54,title:"Définir une étape atteignable",detail:"Une étape de sept jours réévaluée selon les séances réelles. Aucun objectif de poids obligatoire.",source:"Fréquence choisie : "+clamp(p.weekly,1,4)+" par semaine",action:"goalStart",label:"Proposer une étape"});
 }
 if(Number.isFinite(last)&&now-last>=14*DAY){
  add({id:"return-"+stats.lastFinished,kind:"return",priority:61,title:"Reprendre progressivement",detail:"Un temps s'est écoulé depuis la dernière séance consignée. Un redémarrage plus léger est préférable à un rattrapage.",source:"Dernière séance : "+new Date(last).toLocaleDateString("fr-FR"),action:"journal",label:"Parler de la reprise"});
 }
 if(!stats.last28)add({id:"first",kind:"start",priority:46,title:"Observer une première séance réelle",detail:"Commence quand tu es prêt et note ce que tu as vraiment réalisé.",source:"Pas de séance consignée sur les 28 derniers jours",action:"session",label:"Voir ma séance"});
 if(options.hasQuestion)add({id:"question",kind:"question",priority:52,title:"Une précision serait utile",detail:"Le formulaire exploite tes réponses précédentes sans répéter inutilement les mêmes questions.",source:"Profil et journal déjà enregistrés",action:"question",label:"Répondre"});
 if(p.measurementReminders===true){
  const valid=rows(s,"weights").map(w=>ts(w.date)).filter(Number.isFinite),latest=valid.length?Math.max(...valid):NaN;
  if(!Number.isFinite(latest)||now-latest>=30*DAY)add({id:"weigh-"+(Number.isFinite(latest)?new Date(latest).toISOString().slice(0,10):"none"),kind:"measurement",priority:22,title:"Souhaites-tu actualiser ton suivi physique ?",detail:"La mesure est facultative et non jugée. Une pesée isolée ne détermine pas le programme.",source:"Rappel activé dans le profil",action:"measurement",label:"Voir le suivi"});
 }
 add({id:"continue",kind:"steady",priority:5,title:"Continuer à ton rythme",detail:"Ton historique reste accessible. Les prochaines observations guideront les adaptations.",source:"Historique actuel",action:"session",label:"Voir la séance"});
 const snoozed=p.brainState?.snoozed||{};
 const candidates=list.filter(x=>{if(x.safety)return true;const until=ts(snoozed[x.id]);return !Number.isFinite(until)||until<=now;}).sort((a,b)=>b.priority-a.priority);
 return {primary:candidates[0],alternatives:candidates.slice(1,3),statistics:stats,checkedAt:iso(now)};
}
function snooze(s,id,now=Date.now()){
 if(typeof id!=="string"||!id||id.length>140)throw Error("Décision inconnue");
 const p={...(s.profile||{})},old=p.brainState?.snoozed||{},all={...old,[id]:iso(now+DAY)};
 const items=Object.entries(all).filter(([k,v])=>k.length<=140&&Number.isFinite(ts(v))&&ts(v)>now).sort((a,b)=>ts(b[1])-ts(a[1]));
 p.brainState={snoozed:Object.fromEntries(items.slice(0,36))};
 return p;
}
function milestone(s,action,now=Date.now()){
 const p={...(s.profile||{})},previous=p.goalTrack||null;
 if(action==="start"){
  if(previous)throw Error("Une étape existe déjà");
  p.goalTrack={level:1,targetSessions:clamp(p.weekly,1,4),startedAt:iso(now)};
 }else if(action==="review"){
  const stage=progress(s,now).stage;
  if(!previous||!stage?.due)throw Error("Étape non arrivée à échéance");
  const target=stage.completed>=stage.target?Math.min(4,stage.target+1):stage.completed===0?Math.max(1,stage.target-1):stage.target;
  p.goalTrack={level:stage.level+1,targetSessions:target,startedAt:iso(now)};
 }else throw Error("Action inconnue");
 return p;
}
root.CoachBrain=Object.freeze({evaluate,progress,snooze,milestone});
})(typeof window!=="undefined"?window:globalThis);