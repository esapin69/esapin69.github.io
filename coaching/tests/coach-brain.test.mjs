// node --test coaching/tests/coach-brain.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const sandbox={window:{},Date,Number,Math,Object,String,Array};
runInNewContext(readFileSync(new URL("../coach-brain.js",import.meta.url),"utf8"),sandbox);
const brain=sandbox.window.CoachBrain;
const today=Date.parse("2026-10-18T15:00:00Z"),DAY=86400000;
const state=()=>({profile:{weekly:2,minutes:35},sessions:[],observations:[],weights:[],scheduled:""});
const obs=(signal,id="obs1")=>({id,signal,at:new Date(today-DAY).toISOString()});
const decision=(s,opts={})=>brain.evaluate(s,{now:today,...opts});
test("Un profil inconnu demande une information avant le premier objectif",()=>{
 const q=decision(state(),{hasQuestion:true});assert.equal(q.primary.kind,"question");assert.ok(q.primary.source);
});
test("Les douleurs déclarées précèdent calendrier et objectif",()=>{
 const s=state();s.observations.push(obs("pain"));s.scheduled=new Date(today-DAY).toISOString();
 assert.equal(decision(s).primary.kind,"safety");assert.equal(decision(s).primary.safety,true);
});
test("Séance prévue dépassée : demander une confirmation, pas conclure à une absence",()=>{
 const s=state();s.scheduled=new Date(today-DAY).toISOString();
 assert.equal(decision(s).primary.kind,"schedule");
});
test("Manque de temps et difficulté donnent une prochaine action distincte",()=>{
 const s=state();s.observations.push(obs("time"));assert.equal(decision(s).primary.kind,"planning");
 s.observations.push(obs("hard","obs2"));assert.equal(decision(s).primary.kind,"recovery");
});
test("Les objectifs sont une proposition confirmée, évaluée sur sept jours",()=>{
 const s=state();assert.equal(decision(s).primary.kind,"milestone");
 s.profile=brain.milestone(s,"start",today-8*DAY);
 assert.equal(brain.progress(s,today).stage.due,true);
 s.sessions=[{done:4,finished:new Date(today-7.5*DAY).toISOString()},{done:4,finished:new Date(today-0.5*DAY).toISOString()}];
 assert.equal(brain.progress(s,today).stage.completed,1);
 assert.equal(decision(s).primary.kind,"goalReview");
 s.profile=brain.milestone(s,"review",today);
 assert.equal(s.profile.goalTrack.level,2);assert.equal(s.profile.goalTrack.targetSessions,2);
});
test("Aucune proposition de pesée sans opt-in spécifique",()=>{
 assert.notEqual(decision(state()).primary.kind,"measurement");
 const a=decision(state()).alternatives;assert.ok(!a.some(x=>x.kind==="measurement"));
 const s=state();s.profile.measurementReminders=true;
 assert.ok(decision(s).alternatives.some(x=>x.kind==="measurement"));
});
test("Le report reste limité à une journée et n'efface pas l'historique",()=>{
 const s=state();s.profile=brain.snooze(s,"goal-new",today);
 assert.notEqual(decision(s).primary.kind,"milestone");
 assert.equal(s.profile.weekly,2);
 assert.equal(decision(s,{now:today+DAY+1}).primary.kind,"milestone");
});
test("Reprise prudente après une interruption, sans pénalité",()=>{
 const s=state();s.profile=brain.milestone(s,"start",today-2*DAY);
 s.sessions.push({done:5,finished:new Date(today-20*DAY).toISOString()});
 assert.equal(decision(s).primary.kind,"return");
});
test("Aucune référence à des appels réseau ou un fournisseur IA",()=>{
 const source=readFileSync(new URL("../coach-brain.js",import.meta.url),"utf8");
 assert.ok(!source.includes("fetch("));assert.ok(!source.includes("api.telegram.org"));
 assert.ok(!source.includes("api.openai.com"));
});
