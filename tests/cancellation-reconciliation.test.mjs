import test from 'node:test';
import assert from 'node:assert/strict';
import {cancelParticipants,reconcileRegistration,creditBalance,cancellationAllowed,commitRegistration} from '../src/member-credit-model.js';
import {orderFromRows,isActiveParticipant} from '../src/registration-order-model.js';
import {adminRegistrationActions,cancellationSourceLabel,softDeleteManualRegistration} from '../src/registration-admin-model.js';
const member={id:'payer',role:'MEMBER'},admin={id:'admin',role:'ADMIN',manageRegistrations:true},members=[{id:'payer'},{id:'other'}];
const event={id:'winter',status:'PUBLISHED',closes:'2026-12-06T23:59'};
const before='2026-12-06T23:58:59+08:00',after='2026-12-06T23:59:00+08:00';
const row=(id,patch={})=>({id,orderId:'ORDER',ownerId:'payer',eventId:'winter',source:'GROUP',nickname:id,division:'ME',fee:'SINGLE',payment:'BANK_TRANSFER',status:'PENDING',amount:450,last5:'00123',date:'2026-10-26',...patch});
const state=(rows=[row('one')])=>({rows,ledger:[]});
const cancel=(initial,ids,actor=member,options={})=>cancelParticipants(initial,ids,actor,{members,now:before,...options});
const reconcile=(initial,done=true,options={})=>reconcileRegistration(initial,'ORDER',done,admin,{members,now:after,...options});
test('cancelled pending bank payment remains reconcilable, credits only after confirmation and never restores attendance',()=>{
 const cancelled=cancel(state(),['one']);assert.equal(creditBalance(cancelled.ledger,'payer'),0);assert.equal(cancelled.rows[0].status,'PENDING');
 const order=orderFromRows(cancelled.rows,'ORDER');assert.equal(order.status,'CANCELLED');assert.equal(order.canReconcile,true);assert.equal(order.bank,450);assert.equal(order.pendingCreditAmount,450);
 const paid=reconcile(cancelled);assert.equal(paid.rows[0].status,'RECONCILED');assert.equal(paid.rows[0].cancelledAt,before);assert.equal(isActiveParticipant(paid.rows[0]),false);assert.equal(creditBalance(paid.ledger,'payer'),450);assert.equal(paid.rows[0].creditReturned,450);
 assert.equal(paid.rows[0].reconciliationHistory[0].actor,'admin');assert.equal(paid.rows[0].creditedAt,after);
 assert.equal(reconcile(paid).ledger.length,1);assert.equal(cancel(paid,['one']).ledger.length,1);
 assert.throws(()=>reconcile(paid,false),/已回存/);assert.equal(orderFromRows(paid.rows,'ORDER').canReconcile,false);
});
test('a partly cancelled group is reconciled for the entire original bank amount and credits only the cancelled participant',()=>{
 const cancelled=cancel(state([row('one'),row('two'),row('onsite',{payment:'ONSITE',status:'ONSITE'}),row('free',{fee:'MEMBER',payment:'NOT_REQUIRED',amount:0,status:'COMPLETED'})]),['one']);
 const order=orderFromRows(cancelled.rows,'ORDER');assert.equal(order.bank,900);assert.equal(order.pendingCreditAmount,450);assert.equal(order.participants.length,3);
 const paid=reconcile(cancelled);assert.deepEqual(paid.rows.map(p=>p.status),['RECONCILED','RECONCILED','ONSITE','COMPLETED']);assert.equal(creditBalance(paid.ledger,'payer'),450);assert.equal(paid.rows.find(p=>p.id==='two').creditReturned,undefined);
 const remaining=cancel(paid,['two'],admin,{source:'ADMIN_BACKOFFICE',now:after});assert.equal(creditBalance(remaining.ledger,'payer'),900);assert.equal(remaining.ledger.length,2);
});
test('already reconciled cancellation immediately credits the original payer and stores the real actor, source and timestamp',()=>{
 const cancelled=cancel(state([row('one',{status:'RECONCILED'})]),['one'],admin,{source:'ADMIN_BACKOFFICE',now:after});
 assert.equal(creditBalance(cancelled.ledger,'payer'),450);assert.equal(creditBalance(cancelled.ledger,'admin'),0);
 assert.equal(cancelled.rows[0].cancelledBy,'admin');assert.equal(cancelled.rows[0].cancelledAt,after);assert.equal(cancellationSourceLabel(cancelled.rows[0]),'管理員後台取消');
 const ownAdmin={...admin,id:'payer'};const own=cancel(state(),['one'],ownAdmin,{source:'MEMBER_SELF'});assert.equal(cancellationSourceLabel(own.rows[0]),'參賽者自行取消');assert.equal(own.rows[0].cancelledBy,'payer');
});
test('cutoff boundaries separate member self-cancellation and admin backoffice cancellation, independently of admin ownership',()=>{
 assert.equal(cancellationAllowed(member,'MEMBER_SELF',event,before),true);assert.equal(cancellationAllowed(member,'MEMBER_SELF',event,after),false);
 assert.equal(cancellationAllowed(admin,'ADMIN_BACKOFFICE',event,before),false);assert.equal(cancellationAllowed(admin,'ADMIN_BACKOFFICE',event,after),true);
 assert.equal(cancellationAllowed(admin,'MEMBER_SELF',event,after),false);assert.equal(cancellationAllowed(member,'ADMIN_BACKOFFICE',event,after),false);
 assert.equal(cancellationAllowed(admin,'ADMIN_BACKOFFICE',undefined,after),false);assert.equal(cancellationAllowed(null,'MEMBER_SELF',event,before),false);
 assert.equal(adminRegistrationActions(row('one'),event,Date.parse(before)).canCancel,false);assert.equal(adminRegistrationActions(row('one'),event,Date.parse(after)).canCancel,true);
 assert.equal(adminRegistrationActions(row('one',{cancelledAt:before}),event,Date.parse(after)).canCancel,false);
});
test('only explicitly admin-created registrations can be deleted, even when a self-registration was edited by an admin',()=>{
 for(const source of ['MEMBER','GROUP',undefined]){const initial=[row('one',{source,updatedBy:'admin'})];assert.equal(adminRegistrationActions(initial[0],event).canDelete,false);assert.throws(()=>softDeleteManualRegistration(initial,'one','誤建',admin),/只有後台新增/);}
 for(const source of ['MANUAL_MEMBER','MANUAL_GUEST']){const initial=[row('one',{source})];assert.equal(adminRegistrationActions(initial[0],event).canDelete,true);const deleted=softDeleteManualRegistration(initial,'one','誤建',admin,after);assert.equal(deleted[0].deletedBy,'admin');assert.equal(deleted[0].deletedAt,after);assert.equal(initial[0].deletedAt,undefined);}
 assert.throws(()=>softDeleteManualRegistration([row('one',{source:'MANUAL_MEMBER'})],'one','誤建',member),/沒有管理/);
});
test('unlinked cancelled bank payments require a valid refund member and reject atomically before changing payment status',()=>{
 const cancelled=cancel(state([row('one',{ownerId:null,memberId:null})]),['one'],admin,{source:'ADMIN_BACKOFFICE'});
 assert.throws(()=>reconcile(cancelled),/入帳會員不存在/);assert.equal(cancelled.rows[0].status,'PENDING');assert.equal(cancelled.ledger.length,0);
 const paid=reconcile(cancelled,true,{creditMemberId:'other'});assert.equal(creditBalance(paid.ledger,'other'),450);
 assert.throws(()=>reconcileRegistration(cancelled,'ORDER',true,member,{members}),/沒有管理/);
});
test('withdrawal of reconciliation remains available when no cancelled bank payment was credited',()=>{
 const paid=reconcile(state());assert.equal(orderFromRows(paid.rows,'ORDER').canUndoReconciliation,true);const reset=reconcile(paid,false);assert.equal(reset.rows[0].status,'PENDING');assert.equal(reset.ledger.length,0);
});

test('editing a backend-created registration from the member side preserves its original admin source',()=>{
 const initial=state([row('one',{orderId:'one',source:'MANUAL_MEMBER',residency:'DOMESTIC'})]);
 const saved=commitRegistration(initial,{id:'one',ownerId:'payer',eventId:'winter',mode:'SINGLE',profile:{name:'隊員甲',nickname:'隊員甲',residency:'DOMESTIC'},group:'ME',fee:'SINGLE',payment:'BANK_TRANSFER',amount:450,last5:'00123',date:'2026-10-26'},{...event,divisions:['ME'],fees:{SINGLE:450,MEMBER:0,LEGACY_PREPAID:0}},member);
 assert.equal(saved.rows[0].source,'MANUAL_MEMBER');assert.equal(adminRegistrationActions(saved.rows[0],event).canDelete,true);
});

test('editing the remaining free participant preserves cancelled pending-bank payment details for later reconciliation',()=>{
 const initial=state([row('one'),row('free',{fee:'MEMBER',payment:'NOT_REQUIRED',amount:0,status:'COMPLETED'})]);
 const cancelled=cancel(initial,['one']);
 const edited=commitRegistration(cancelled,{id:'ORDER',ownerId:'payer',eventId:'winter',mode:'MULTI',profile:{nickname:'付款會員'},participants:[{id:'free',name:'免費隊員',group:'ME',fee:'MEMBER',payment:'NOT_REQUIRED',amount:0,residency:'DOMESTIC'}],last5:'',date:''},{...event,divisions:['ME'],fees:{SINGLE:450,MEMBER:0,LEGACY_PREPAID:0}},member);
 assert.equal(edited.rows.find(row=>row.id==='one').last5,'00123');assert.equal(edited.rows.find(row=>row.id==='one').date,'2026-10-26');
 assert.equal(creditBalance(reconcile(edited).ledger,'payer'),450);
});
