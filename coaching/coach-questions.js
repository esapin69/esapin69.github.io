/* Univers Coaching — questionnaire adaptatif local. Aucune requête réseau, aucun appel IA. */
(function(root){
"use strict";
const QUESTIONS=[
 {id:"objective",title:"Qu'aimerais-tu améliorer en premier ?",reason:"Pour définir un objectif réaliste qui pourra changer.",choices:[["forme","Retrouver la forme"],["muscle","Me renforcer"],["force","Gagner en force"],["libre","Je préfère le préciser moi-même"]]},
 {id:"experience",title:"Comment décrirais-tu ton expérience ?",reason:"Pour proposer un départ progressif, sans deviner tes capacités.",choices:[["debut","Je débute"],["retour","Je reprends après une pause"],["habitue","Je m'entraîne déjà"]]},
 {id:"place",title:"Où peux-tu réellement t'entraîner ?",reason:"Pour ne pas proposer de matériel inaccessible.",choices:[["maison","Chez moi, avec peu de matériel"],["salle","En salle de sport"],["variable","Cela change selon les semaines"]]},
 {id:"time",title:"Quel créneau est tenable actuellement ?",reason:"Une séance réalisable vaut mieux qu'un planning impossible.",choices:[["20","Environ 20 minutes"],["35","Environ 35 minutes"],["50","Environ 50 minutes"]]},
 {id:"week",title:"Combien de séances réalistes par semaine ?",reason:"On pourra ajuster ce rythme à tout moment.",choices:[["1","Une séance"],["2","Deux séances"],["3","Trois séances"],["4","Quatre séances"]]},
 {id:"schedule",title:"Tes horaires changent-ils souvent ?",reason:"Pour ne pas te pousser à suivre un agenda trop rigide.",choices:[["stable","Plutôt stables"],["variable","Horaires changeants"],["imprevisible","Difficiles à prévoir"]]},
 {id:"focus",title:"Souhaites-tu donner une priorité au programme ?",reason:"Sans oublier le reste du corps.",choices:[["equilibre","Tout le corps"],["haut","Haut du corps"],["bas","Bas du corps"]]},
 {id:"recovery",title:"Comment te sens-tu entre les séances ?",reason:"Le ressenti compte autant que la séance prévue.",choices:[["bien","Je récupère plutôt bien"],["variable","Cela varie beaucoup"],["fatigue","Je suis souvent fatigué"]]},
 {id:"pain",title:"As-tu signalé une gêne pendant un mouvement ?",reason:"Une douleur ne doit pas provoquer une hausse automatique de difficulté.",choices:[["oui","Oui, je préfère adapter ou interrompre"],["incertain","Je ne sais pas, je veux rester prudent"],["non","Pas de gêne signalée maintenant"]],contextual:true},
 {id:"short",title:"Pour la prochaine séance, quel format est réaliste ?",reason:"Tu as parlé d'un manque de temps ou d'une séance manquée.",choices:[["20","20 minutes pour reprendre"],["35","35 minutes si possible"],["conserver","Garder la durée actuelle"]],contextual:true},
 {id:"effort",title:"Quel ajustement souhaites-tu après cette difficulté ?",reason:"Je m'appuie sur ton dernier retour, sans imposer une charge.",choices:[["alléger","Alléger la prochaine séance"],["maintenir","Conserver le programme et en discuter"],["pause","Faire une pause et reprendre plus tard"]],contextual:true}
];
const BY_ID=Object.fromEntries(QUESTIONS.map(q=>[q.id,q]));
const basic=["objective","experience","place","time","week","schedule","focus","recovery"];
const formats={forme:"Retrouver une activité régulière",muscle:"Me renforcer progressivement",force:"Développer ma force avec maîtrise"};
const empty=()=>({answers:{},skipped:{},updatedAt:null});
function currentIntake(s){const obj=s?.profile?.intake;return obj&&typeof obj==="object"?{...empty(),...obj,answers:obj.answers&&typeof obj.answers==="object"?{...obj.answers}:{},skipped:obj.skipped&&typeof obj.skipped==="object"?{...obj.skipped}:{}}:empty();}
function recentSignal(s,types){
 const observations=Array.isArray(s?.observations)?s.observations:[];
 for(let i=observations.length-1;i>=0;i--){const o=observations[i];if(types.includes(o?.signal)&&o?.id)return {signal:o.signal,id:String(o.id),at:o.at||""};}
 return null;
}
function triggeredQuestions(s){
 const pain=recentSignal(s,["pain"]);
 const short=recentSignal(s,["time","missed","schedule"]);
 const hard=recentSignal(s,["hard"]);
 const out=[];
 if(pain)out.push({id:"pain",trigger:pain.id});
 if(short)out.push({id:"short",trigger:short.id});
 if(hard)out.push({id:"effort",trigger:hard.id});
 return out;
}
function nextQuestion(s,now=Date.now()){
 const intake=currentIntake(s);
 const candidates=[...triggeredQuestions(s),...basic.map(id=>({id,trigger:"basic"}))];
 for(const c of candidates){
  const q=BY_ID[c.id],key=c.id+":"+c.trigger;
  if(!q)continue;
  if(Object.prototype.hasOwnProperty.call(intake.answers,key))continue;
  const skipped=Date.parse(intake.skipped[key]||"");
  if(Number.isFinite(skipped)&&now-skipped<7*24*60*60*1000)continue;
  return {...q,key,choices:q.choices.map(([value,label])=>({value,label})),progress:basic.filter(id=>Object.prototype.hasOwnProperty.call(intake.answers,id+":basic")).length,total:basic.length};
 }
 return null;
}
function respond(s,key,value,date=new Date().toISOString()){
 const questionId=String(key||"").split(":")[0],q=BY_ID[questionId];
 if(!q||!q.choices.some(x=>x[0]===value)||typeof key!=="string"||(!key.endsWith(":basic")&&!q.contextual))throw Error("Réponse invalide.");
 const intake=currentIntake(s),profile={...(s?.profile||{})};
 intake.answers[key]={value,at:date};delete intake.skipped[key];intake.updatedAt=date;
 // Keep the first answers and only the 40 most recent context-specific decisions, avoiding unbounded storage and quota growth.
 for(const field of ["answers","skipped"]){
  const keys=Object.keys(intake[field]).filter(k=>!k.endsWith(":basic")).sort((a,b)=>{
   const ta=field==="answers"?intake[field][a]?.at:intake[field][a];
   const tb=field==="answers"?intake[field][b]?.at:intake[field][b];
   return Date.parse(tb||"")-Date.parse(ta||"");
  });
  for(const stale of keys.slice(40))delete intake[field][stale];
 }
 profile.intake=intake;
 let replan=false,signal=null,explicitWarning=null;
 if(questionId==="objective"){if(formats[value])profile.objective=formats[value];else explicitWarning="Tu peux préciser ton objectif dans Profil."; }
 if(questionId==="experience")profile.experience=value;
 if(questionId==="place"){if(["maison","salle"].includes(value)){profile.equipment=value;replan=true;}else explicitWarning="Le matériel changeant se règle avant chaque séance dans Profil.";}
 if(questionId==="time"){profile.minutes=Number(value);replan=true;}
 if(questionId==="week")profile.weekly=Number(value);
 if(questionId==="schedule")profile.scheduleType=value;
 if(questionId==="focus"){profile.focus=value;replan=true;}
 if(questionId==="recovery")profile.recovery=value;
 if(questionId==="pain"){if(value!=="non")explicitWarning="En cas de douleur, interromps le mouvement concerné et sollicite un avis adapté. Aucun diagnostic ici.";profile.comfortNote=value;}
 if(questionId==="short"){if(value!=="conserver"){profile.minutes=Number(value);replan=true;} }
 if(questionId==="effort"){if(value==="alléger")signal="hard";if(value==="pause")explicitWarning="Fais une pause aussi longtemps que nécessaire. Tu pourras reprendre progressivement.";}
 return {profile,replan,signal,message:explicitWarning||"Réponse mémorisée. Tu pourras la changer dans ton profil."};
}
function snooze(s,key,date=new Date().toISOString()){
 const p={...s.profile},intake=currentIntake(s);intake.skipped[key]=date;intake.updatedAt=date;p.intake=intake;return p;
}
function progress(s){const a=currentIntake(s).answers;return{done:basic.filter(id=>Object.prototype.hasOwnProperty.call(a,id+":basic")).length,total:basic.length};}
root.CoachQuestions=Object.freeze({nextQuestion,respond,snooze,progress,questions:QUESTIONS});
})(typeof window!=="undefined"?window:globalThis);
