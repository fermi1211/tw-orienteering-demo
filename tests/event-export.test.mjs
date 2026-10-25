import test from 'node:test';
import assert from 'node:assert/strict';
import {activeEventRows,registrationClosed,createStartOrder,syncStartOrder,entryName,moveStartEntry,generateSectionTimes,validateStartOrder,entryColumns} from '../src/event-export-model.js';
import {reportTables} from '../src/roster-image.js';

const event={id:'race',status:'PUBLISHED',closes:'2026-10-24T12:00',divisions:['ME','WE','MA','OPEN']};
const rows=[{id:'a',eventId:'race',division:'ME',name:'原姓名',nickname:' 山徑 ',displayNameOverride:'公告名'},{id:'b',eventId:'race',division:'ME',name:'原姓名',nickname:''},{id:'c',eventId:'race',division:'OPEN',name:'第三位',status:'PENDING'}];
test('cutoff uses Taiwan time and never enables draft events',()=>{
  assert.equal(registrationClosed(event,Date.parse('2026-10-24T03:59:59Z')),false);
  assert.equal(registrationClosed(event,Date.parse('2026-10-24T04:00:00Z')),true);
  assert.equal(registrationClosed({...event,status:'DRAFT'},Date.parse('2026-10-25T04:00Z')),false);
  assert.equal(registrationClosed({...event,closes:'invalid'},Date.now()),false);
});
test('exports only active event records, including unpaid and repeated people',()=>{
  const source=[...rows,{...rows[0],id:'deleted',deletedAt:'now'},{...rows[0],id:'duplicate',record_state:'DUPLICATE'},{...rows[0],id:'other',eventId:'other'}];
  assert.deepEqual(activeEventRows(source,'race').map(row=>row.id),['a','b','c']);
  assert.deepEqual(entryColumns(event,rows).find(column=>column.label==='ME').cells,['公告名','原姓名']);
});
test('wave timing is generated explicitly and crossing midnight rejects atomically',()=>{
  const section={start:'09:30',interval:2,parallel:2,entries:rows.map(row=>({recordId:row.id,time:''}))};
  assert.deepEqual(generateSectionTimes(section).entries.map(entry=>entry.time),['09:30','09:30','09:32']);
  assert.deepEqual(section.entries.map(entry=>entry.time),['','','']);
  assert.throws(()=>generateSectionTimes({...section,start:'23:59'}),/午夜/);
  assert.throws(()=>generateSectionTimes({...section,interval:0}),/有效/);
});
test('moving a person preserves slot times, not their previous slot',()=>{
  const entries=[{recordId:'a',time:'09:20',nameOverride:'公告名'},{recordId:'b',time:'09:21'}];
  assert.deepEqual(moveStartEntry(entries,1,-1).map(entry=>[entry.recordId,entry.time]),[['b','09:20'],['a','09:21']]);
  assert.equal(moveStartEntry(entries,0,-1),entries);
});
test('roster synchronization removes deleted people and keeps overrides through reassignment',()=>{
  let order=syncStartOrder(createStartOrder(event),rows);
  order.sections[0].entries[0]={recordId:'a',nameOverride:'出發表專用',time:'09:20'};
  const changed=[{...rows[0],division:'OPEN'},rows[2]];
  order=syncStartOrder(order,changed);
  assert.deepEqual(order.sections.flatMap(section=>section.entries.map(entry=>entry.recordId)),['c','a']);
  const entry=order.sections[1].entries.find(entry=>entry.recordId==='a');
  assert.equal(entryName(entry,changed[0]),'出發表專用');
  assert.equal(entry.time,'09:20');
  assert.equal(rows[0].displayNameOverride,'公告名');
});
test('unassigned and blank names or times prevent final export',()=>{
  let order=syncStartOrder(createStartOrder(event),rows);
  assert.match(validateStartOrder(order,rows).join(' '),/出發時間/);
  order={...order,sections:order.sections.map(generateSectionTimes)};
  assert.deepEqual(validateStartOrder(order,rows),[]);
  order.sections[0].entries[0].nameOverride=' ';
  assert.match(validateStartOrder(order,rows).join(' '),/顯示名稱/);
  assert.match(validateStartOrder({...order,sections:[]},rows).join(' '),/尚未分配/);
});
test('temporarily unassigning a division preserves edited names and times',()=>{
  let order=syncStartOrder(createStartOrder(event),rows);
  order.sections[0].entries[0]={recordId:'a',time:'09:25',nameOverride:'保留自訂名稱'};
  order.sections[0].divisions=[];
  order=syncStartOrder(order,rows);
  assert.equal(order.detachedEntries.find(entry=>entry.recordId==='a').time,'09:25');
  order.sections[1].divisions.push('ME');
  order=syncStartOrder(order,rows);
  assert.equal(order.sections[1].entries.find(entry=>entry.recordId==='a').nameOverride,'保留自訂名稱');
  assert.equal(order.detachedEntries.length,0);
});
test('column wrapping and simultaneous waves never drop or duplicate names',()=>{
  const many=Array.from({length:31},(_,index)=>({...rows[0],id:`id-${index}`,displayNameOverride:`選手${index}`}));
  assert.equal(entryColumns(event,many,13).filter(column=>column.label==='ME').length,3);
  assert.equal(entryColumns(event,many,13).flatMap(column=>column.cells).length,31);
  const tables=reportTables('start',event,[],{sections:[{title:'自訂標頭',theme:'orange',parallel:2,entries:[{name:'甲',time:'09:30'},{name:'乙',time:'09:30'},{name:'丙',time:'09:31'}]}]});
  assert.deepEqual(tables[0].rows,[['09:30','甲','乙'],['09:31','丙','']]);
});
