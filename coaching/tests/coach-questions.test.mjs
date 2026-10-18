// node --test coaching/tests/coach-questions.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const code=readFileSync(new URL('../coach-questions.js', import.meta.url),'utf8');
const environment={window:{}};
runInNewContext(code,environment);
const coach=environment.window.CoachQuestions;
const seed=()=>({profile:{equipment:'maison',minutes:35,weekly:2,focus:'equilibre'},observations:[],sessions:[]});
test('Une question à la fois et huit repères non répétés',()=>{
 const state=seed(),answers=[];
 for(let i=0;i<8;i++){
  const q=coach.nextQuestion(state);
  assert.ok(q);
  assert.ok(!answers.includes(q.id));
  answers.push(q.id);
  state.profile=coach.respond(state,q.key,q.choices[0].value).profile;
 }
 assert.equal(coach.nextQuestion(state),null);
 assert.equal(coach.progress(state).done,8);
});
test('Question contextuelle et réduction volontaire du créneau',()=>{
 const state=seed();state.observations.push({id:'evt1',signal:'time',at:new Date().toISOString()});
 const question=coach.nextQuestion(state);
 assert.equal(question.id,'short');
 const answer=coach.respond(state,question.key,'20');
 assert.equal(answer.replan,true);
 assert.equal(answer.profile.minutes,20);
 state.profile=answer.profile;
 assert.notEqual(coach.nextQuestion(state)?.key,question.key);
});
test('Douleur déclarée : question prioritaire et prudence',()=>{
 const state=seed();state.observations.push({id:'pain1',signal:'pain',at:new Date().toISOString()});
 const q=coach.nextQuestion(state);
 assert.equal(q.id,'pain');
 const response=coach.respond(state,q.key,'oui');
 assert.equal(response.profile.comfortNote,'oui');
 assert.equal(response.replan,false);
});
test('Refus et reports sont respectés',()=>{
 const state=seed();const q=coach.nextQuestion(state),now=new Date().toISOString();
 state.profile=coach.snooze(state,q.key,now);
 assert.notEqual(coach.nextQuestion(state)?.key,q.key);
});
test('Options inconnues refusées sans écrire dans le profil',()=>{
 const state=seed(),q=coach.nextQuestion(state);
 assert.throws(()=>coach.respond(state,q.key,'__invalid__'));
 assert.equal(coach.progress(state).done,0);
});
test('Limitation du volume des réponses contextuelles',()=>{
 const state=seed();
 for(let i=0;i<55;i++){
  state.observations.push({id:'evt'+i,signal:'time',at:new Date(Date.now()+i).toISOString()});
  const q=coach.nextQuestion(state);
  assert.equal(q.id,'short');
  state.profile=coach.respond(state,q.key,'conserver',new Date(Date.now()+i).toISOString()).profile;
 }
 const answerKeys=Object.keys(state.profile.intake.answers).filter(k=>!k.endsWith(':basic'));
 assert.ok(answerKeys.length<=40);
});
