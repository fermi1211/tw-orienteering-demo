import test from 'node:test';
import assert from 'node:assert/strict';
import {eventDivisionCatalog,eventFeeCatalog,registrationFeeChoices,singleEventFee,legacyEventFees,eventOptionErrors,validateFeeSnapshot} from '../src/event-options-model.js';
import {commitRegistration} from '../src/member-credit-model.js';
import {refreshRegistration,projectRegistration} from '../src/registration-order-model.js';
import {eventForList} from '../src/public-event-model.js';
const fee={id:'early',kind:'SINGLE',name:'早鳥報名',amount:390,active:true};
const event={id:'e',name:'測試定向賽',status:'PUBLISHED',starts:'2026-12-13',opens:'2026-10-20T00:00',closes:'2026-12-06T23:59',divisions:['TRY'],divisionCatalog:[{id:'try',code:'TRY',name:'體驗組',active:true}],feeCatalog:[fee],fees:{SINGLE:390}};
const actor={id:'owner'};
const single={id:'order',ownerId:'owner',eventId:'e',event,profile:{name:'測試甲',nickname:'森林甲',residency:'DOMESTIC'},group:'TRY',fee:'SINGLE',feeOptionId:'early',feeName:'早鳥報名',payment:'BANK_TRANSFER',amount:390,last5:'00123',date:'2026-10-28'};
const empty=()=>({rows:[],ledger:[]});
test('local catalogs copy defaults and keep event scopes independent',()=>{
 const defaults=[{id:'open',code:'OPEN',name:'公開組',active:true}],legacy={divisions:['OPEN'],fees:{MEMBER:0,SINGLE:450}};
 const groups=eventDivisionCatalog(legacy,defaults),fees=eventFeeCatalog(legacy);groups[0].name='本場公開組';fees[1].amount=300;
 assert.equal(defaults[0].name,'公開組');assert.equal(legacy.fees.SINGLE,450);assert.equal(eventDivisionCatalog(legacy,defaults)[0].name,'公開組');
 assert.deepEqual(legacyEventFees([fee]),{SINGLE:390});assert.equal(singleEventFee(event).id,'early');assert.equal(eventForList(event).singleFee,390);
});
test('per-event option validation blocks incomplete, duplicate, invalid prices and empty published choices',()=>{
 assert.deepEqual(eventOptionErrors(event.divisionCatalog,[fee],{published:true}),[]);
 for(const amount of [-1,0.5,null,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])assert.ok(eventOptionErrors(event.divisionCatalog,[{...fee,amount}]).length);
 assert.ok(eventOptionErrors([{id:'a',code:'TRY',name:''}],[fee]).length);
 assert.ok(eventOptionErrors([...event.divisionCatalog,{id:'b',code:'try',name:'重複'}],[fee]).length);
 assert.ok(eventOptionErrors(event.divisionCatalog,[fee,{...fee,id:'b'}]).length);
 assert.ok(eventOptionErrors([],[],{published:true}).length);assert.deepEqual(eventOptionErrors([],[]),[]);
});
test('single registration preserves the selected option identity and amount through rows and receipts',()=>{
 const state=commitRegistration(empty(),single,event,actor),row=state.rows[0],receipt=refreshRegistration(single,state.rows);
 assert.equal(row.fee,'SINGLE');assert.equal(row.feeOptionId,'early');assert.equal(row.feeName,'早鳥報名');assert.equal(row.amount,390);assert.equal(row.status,'PENDING');
 assert.equal(receipt.feeOptionId,'early');assert.equal(receipt.feeName,'早鳥報名');assert.equal(receipt.amount,390);
});
test('multiple fee options share existing payment rules without losing individual identities',()=>{
 const free={id:'member',kind:'MEMBER',name:'本場會員',amount:0,active:true},ev={...event,feeCatalog:[fee,free]};
 const participants=[{id:'p1',name:'甲',group:'TRY',fee:'SINGLE',feeOptionId:'early',feeName:fee.name,payment:'BANK_TRANSFER',residency:'DOMESTIC',amount:390},{id:'p2',name:'乙',group:'TRY',fee:'MEMBER',feeOptionId:'member',feeName:free.name,payment:'NOT_REQUIRED',residency:'DOMESTIC',amount:0},{id:'p3',name:'丙',group:'TRY',fee:'SINGLE',feeOptionId:'early',feeName:fee.name,payment:'ONSITE',residency:'FOREIGN',amount:390}];
 const record={...single,mode:'MULTI',participants},state=commitRegistration(empty(),record,ev,actor),receipt=refreshRegistration(record,state.rows);
 assert.equal(receipt.amount,780);assert.equal(receipt.bankAmount,390);assert.equal(receipt.onsiteAmount,390);assert.deepEqual(receipt.participants.map(p=>p.feeOptionId),['early','member','early']);
 assert.throws(()=>commitRegistration(empty(),{...record,participants:[{...participants[2],residency:'DOMESTIC'}]},ev,actor),/本國人/);
});
test('changing prices or removing options preserves existing registrations but blocks new use',()=>{
 const state=commitRegistration(empty(),single,event,actor),changed={...event,divisions:['OTHER'],feeCatalog:[{...fee,amount:500,active:false}]};
 const saved=commitRegistration(state,single,changed,actor);assert.equal(saved.rows[0].amount,390);assert.equal(saved.rows[0].division,'TRY');
 assert.equal(registrationFeeChoices(changed).length,0);assert.equal(registrationFeeChoices(changed,[],[single])[0].amount,390);
 assert.throws(()=>commitRegistration(empty(),single,{...changed,divisions:['TRY']},actor),/已刪除/);
 const second={...single,id:'another',profile:{...single.profile,nickname:'另一人'}};assert.throws(()=>commitRegistration(state,second,changed,actor),/組別/);
 assert.throws(()=>commitRegistration(state,{...single,amount:500},changed,actor),/金額/);
});
test('forged fee IDs, price or workflow kind never enter accounting',()=>{
 assert.ok(validateFeeSnapshot({...single,feeOptionId:'missing'},event));
 assert.throws(()=>commitRegistration(empty(),{...single,amount:1},event,actor),/金額/);
 assert.throws(()=>commitRegistration(empty(),{...single,fee:'MEMBER',amount:0,payment:'NOT_REQUIRED'},event,actor),/無效/);
});
test('paid orders cannot swap same-priced items that have different identities',()=>{
 const state=commitRegistration(empty(),single,event,actor);state.rows[0].status='RECONCILED';const ev={...event,feeCatalog:[fee,{...fee,id:'standard',name:'一般報名'}]};
 assert.throws(()=>commitRegistration(state,{...single,feeOptionId:'standard'},ev,actor),/已付款/);
});
test('legacy rows still project without optional fee metadata',()=>{
 const {feeOptionId,feeName,...legacy}=single;const row=projectRegistration(legacy)[0];assert.equal(Object.hasOwn(row,'feeOptionId'),false);assert.equal(Object.hasOwn(row,'feeName'),false);
 assert.equal(validateFeeSnapshot({...row,amount:450},{fees:{SINGLE:450}}),'');
});
