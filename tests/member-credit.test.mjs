import test from 'node:test';
import assert from 'node:assert/strict';
import { commitRegistration,cancelParticipants,creditBalance,cancellationQuote,memberCanCancel } from '../src/member-credit-model.js';
import { orderFromRows,projectRegistration,setOrderReconciliation,validateParticipants } from '../src/registration-order-model.js';
import {activeEventRows} from '../src/event-export-model.js';
const actor={id:'payer',role:'MEMBER'},manager={id:'manager',role:'MANAGER',manageRegistrations:true},members=[{id:'payer',number:'MBR-0001'},{id:'other',number:'MBR-0002'}];
const event={id:'event',name:'測試定向賽',divisions:['ME','WE','OPEN'],fees:{SINGLE:450,MEMBER:0,LEGACY_PREPAID:0}};
const person=(id,name='隊員甲',payment='BANK_TRANSFER',residency='DOMESTIC')=>({id,name,group:'ME',fee:'SINGLE',payment,residency,amount:450});
const record=(id,participants=[person(`${id}-p`)])=>({id,mode:'MULTI',ownerId:'payer',eventId:'event',event,profile:{nickname:'付款會員',residency:'DOMESTIC'},participants,status:'報名完成(待確認帳款)',last5:'00123',date:'2026-10-26'});
const paidState=()=>({rows:projectRegistration({...record('paid'),status:'報名完成(已完成對帳)'}),ledger:[]});
const cancel=(state,ids,who=actor,options={})=>cancelParticipants(state,ids,who,{members,...options});
test('per-participant nationality is required and onsite payment never inherits the payer nationality',()=>{
 assert.ok(validateParticipants([person('a','甲','ONSITE','DOMESTIC')],event.divisions,{requireResidency:true}));
 assert.ok(validateParticipants([person('a','甲','BANK_TRANSFER','')],event.divisions,{requireResidency:true}));
 assert.equal(validateParticipants([person('a','甲','ONSITE','FOREIGN')],event.divisions,{requireResidency:true}),'');
 const rows=projectRegistration(record('mixed',[person('a','甲','BANK_TRANSFER','DOMESTIC'),person('b','乙','ONSITE','FOREIGN')]));assert.deepEqual(rows.map(row=>row.residency),['DOMESTIC','FOREIGN']);
});
test('duplicate names are blocked within the draft and across active registrations for the same event and payer',()=>{
 assert.ok(validateParticipants([person('a',' Team  A '),person('b','Ｔｅａｍ A')],event.divisions));
 const existing=projectRegistration(record('old'));const next=record('new');assert.throws(()=>commitRegistration({rows:existing,ledger:[]},next,event,actor),/重複/);
 const differentOwner={...next,ownerId:'other'};assert.doesNotThrow(()=>commitRegistration({rows:existing,ledger:[]},differentOwner,event,{id:'other'}));
 const differentEvent={...event,id:'another'},another={...next,eventId:'another'};assert.doesNotThrow(()=>commitRegistration({rows:existing,ledger:[]},another,differentEvent,actor));
});
test('reconciled cancellation returns exactly the participant amount to the original payer, only once',()=>{
 const initial=paidState(),next=cancel(initial,['paid-p']);assert.equal(creditBalance(next.ledger,'payer'),450);assert.equal(creditBalance(next.ledger,'other'),0);assert.equal(next.rows[0].recordState,'CANCELLED');assert.equal(next.rows[0].status,'RECONCILED');assert.equal(next.rows[0].amount,450);
 assert.equal(cancel(next,['paid-p']),next);assert.equal(next.ledger.length,1);assert.equal(initial.rows[0].cancelledAt,undefined);
});
test('unconfirmed bank and onsite payments cancel without creating credit',()=>{
 const initial={rows:projectRegistration(record('pending',[person('a','甲'),person('b','乙','ONSITE','FOREIGN')])),ledger:[]};const next=cancel(initial,['a','b']);assert.equal(next.ledger.length,0);assert.equal(next.rows.length,2);assert.ok(next.rows.every(row=>row.cancelledAt));
});
test('manager cancellation credits the payer rather than the manager; other members cannot cancel',()=>{
 const initial=paidState();assert.throws(()=>cancel(initial,['paid-p'],{id:'other',role:'MEMBER'}),/不可取消/);
 const next=cancel(initial,['paid-p'],manager);assert.equal(creditBalance(next.ledger,'payer'),450);assert.equal(creditBalance(next.ledger,'manager'),0);assert.equal(next.ledger[0].actorId,'manager');
});
test('admin-created paid records without a payer require an explicit valid member',()=>{
 const initial={rows:[{id:'manual',eventId:'event',fee:'SINGLE',payment:'ADMIN_CONFIRMED',status:'MANUALLY_PAID',amount:450,nickname:'無帳號隊員'}],ledger:[]};
 assert.throws(()=>cancellationQuote(initial,['manual'],manager),/指定/);assert.throws(()=>cancel(initial,['manual'],manager,{creditMemberId:'unknown'}),/不存在/);
 const next=cancel(initial,['manual'],manager,{creditMemberId:'other'});assert.equal(creditBalance(next.ledger,'other'),450);
});
test('sufficient credit pays the entire registration without transfer data and debits only once',()=>{
 const funded=cancel(paidState(),['paid-p']),walletRecord={...record('wallet',[person('wallet-p','隊員甲','WALLET')]),last5:'',date:''};
 const paid=commitRegistration(funded,walletRecord,event,actor);assert.equal(creditBalance(paid.ledger,'payer'),0);assert.equal(paid.rows.find(row=>row.id==='wallet-p').status,'WALLET_PAID');assert.equal(paid.rows.find(row=>row.id==='wallet-p').last5,'');
 const replay=commitRegistration(paid,walletRecord,event,actor);assert.equal(replay.ledger.length,2);assert.equal(creditBalance(replay.ledger,'payer'),0);
 const returned=cancel(paid,['wallet-p']);assert.equal(creditBalance(returned.ledger,'payer'),450);assert.equal(cancel(returned,['wallet-p']).ledger.length,3);
});
test('insufficient or stale credit fails atomically and can never overdraw a different account',()=>{
 const initial={rows:[],ledger:[]},wallet={...record('wallet',[person('p','隊員','WALLET')]),last5:'',date:''};assert.throws(()=>commitRegistration(initial,wallet,event,actor),/不足/);assert.equal(initial.rows.length,0);assert.equal(initial.ledger.length,0);
 const funded=cancel(paidState(),['paid-p']);assert.throws(()=>commitRegistration(funded,{...wallet,ownerId:'other'},event,{id:'other'}),/不足/);assert.equal(creditBalance(funded.ledger,'payer'),450);
});
test('mixed partial wallet payments and forged amounts or reused participant identifiers are rejected',()=>{
 const funded=cancel(paidState(),['paid-p']);assert.throws(()=>commitRegistration(funded,record('mixed',[person('a','甲','WALLET'),person('b','乙')]),event,actor),/部分混付/);
 assert.throws(()=>commitRegistration(funded,record('wrong',[{...person('a'),amount:1}]),event,actor),/金額/);
 assert.throws(()=>commitRegistration(paidState(),record('other-order',[person('paid-p','其他隊員')]),event,actor),/編號衝突/);
});
test('cancelled participants leave public counts and cannot be reconciled or restored via editing',()=>{
 const next=cancel(paidState(),['paid-p']);assert.equal(activeEventRows(next.rows,'event').length,0);assert.equal(orderFromRows(next.rows,'paid').status,'CANCELLED');assert.equal(orderFromRows(next.rows,'paid').returned,450);
 assert.deepEqual(setOrderReconciliation(next.rows,'paid',false),next.rows);assert.throws(()=>commitRegistration(next,record('paid'),event,actor),/已取消/);
 const repeatedName=record('new');assert.doesNotThrow(()=>commitRegistration(next,repeatedName,event,actor));
});
test('paid financial fields stay locked while unpaid edits retain removed records for history',()=>{
 const paid=paidState();assert.throws(()=>commitRegistration(paid,record('paid',[{...person('paid-p'),fee:'MEMBER',amount:0,payment:'NOT_REQUIRED'}]),event,actor),/已付款/);
 const initial=commitRegistration({rows:[],ledger:[]},record('two',[person('a','甲'),person('b','乙')]),event,actor);const edited=commitRegistration(initial,record('two',[person('a','甲')]),event,actor);assert.equal(edited.rows.length,2);assert.equal(edited.rows.find(row=>row.id==='b').recordState,'REMOVED');assert.equal(activeEventRows(edited.rows,'event').length,1);
});
test('a refunded wallet order cannot reuse its old debit to pay newly added people',()=>{
 const funded=cancel(paidState(),['paid-p']);const first={...record('wallet',[person('a','甲','WALLET'),{...person('free','乙'),fee:'MEMBER',payment:'NOT_REQUIRED',amount:0}]),last5:'',date:''};
 const paid=commitRegistration(funded,first,event,actor),returned=cancel(paid,['a']);
 const changed={...record('wallet',[person('new-id','丙','WALLET'),{...person('free','乙'),fee:'MEMBER',payment:'NOT_REQUIRED',amount:0}]),last5:'',date:''};
 assert.throws(()=>commitRegistration(returned,changed,event,actor),/新增參賽者/);assert.equal(creditBalance(returned.ledger,'payer'),450);
});

test('member cancellation is allowed strictly before Taipei registration close, including before registration opens',()=>{
 const activity={opens:'2026-10-20T08:00',closes:'2026-12-06T23:59'};
 assert.equal(memberCanCancel(activity,'2026-10-01T00:00:00+08:00'),true);
 assert.equal(memberCanCancel(activity,'2026-12-06T23:58:59+08:00'),true);
 assert.equal(memberCanCancel(activity,'2026-12-06T15:59:00Z'),false);
 assert.equal(memberCanCancel(activity,'2026-12-07T00:00:00+08:00'),false);
 assert.equal(memberCanCancel({closes:'invalid'}),false);
 assert.equal(memberCanCancel({}),false);
});
