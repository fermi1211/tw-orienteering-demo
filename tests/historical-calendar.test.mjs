import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyHistoricalEvent,historicalErrors,normalizeHistoricalEvent,publicHistoricalEvent} from '../src/historical-event-model.js';
import {calendarDays,calendarEvents,currentCalendarMonth,shiftCalendarMonth,taipeiDate} from '../src/event-calendar-model.js';
import {eventForList,eventState,groupedEvents} from '../src/public-event-model.js';
const now=Date.parse('2026-10-25T10:00:00+08:00');
const event=(extra={})=>({...emptyHistoricalEvent(),id:'history',status:'PUBLISHED',name:'過往定向',starts:'2026-10-04',location:'河岸',...extra});

test('three required historical fields suffice without inventing optional information',()=>{
  const value=normalizeHistoricalEvent(event());
  assert.deepEqual(historicalErrors(value),[]);
  const published=publicHistoricalEvent(value);
  assert.deepEqual(published.fees,{});assert.deepEqual(published.divisions,[]);assert.deepEqual(published.terms,[]);assert.deepEqual(published.materials,{});
  assert.equal(published.mapLocation,null);assert.equal(published.description,'');
  assert.equal(eventForList(value,now).singleFee,undefined);assert.equal(eventForList(value,now).deadline,'');
});
test('required fields, real dates, negative fees, incomplete terms and invalid map points are rejected',()=>{
  assert.equal(historicalErrors(event({name:' ',starts:'2026-02-30',location:''})).length,3);
  assert.equal(historicalErrors(event({starts:'2024-02-29'})).length,0);
  assert.ok(historicalErrors(event({fees:{SINGLE:-1}})).length);
  assert.ok(historicalErrors(event({fees:{SINGLE:'1.5'}})).length);
  assert.ok(historicalErrors(event({terms:[{title:'條款',content:''}]})).length);
  assert.ok(historicalErrors(event({mapLocation:{lat:91,lng:121}})).length);
});
test('blank or absent fees stay absent while an explicit zero remains visible',()=>{
  const value=normalizeHistoricalEvent(event({fees:{MEMBER:'',LEGACY_PREPAID:null,SINGLE:'0'}}));
  assert.deepEqual(value.fees,{SINGLE:0});assert.equal(eventForList(value,now).singleFee,0);
  assert.deepEqual(normalizeHistoricalEvent(event({fees:{SINGLE:'abc'}})).fees,{});
});
test('only selected report modes reach the public projection, with nickname masking and no private fields',()=>{
  const value=event({privateNote:'secret',materials:{
    registrations:{mode:'table',masked:true,images:[{id:'hidden'}],rows:[{id:'r1',nickname:'河岸旅人',division:'ME',name:'真實姓名',email:'private@example.test'}]},
    startOrder:{mode:'none',rows:[{nickname:'不可公開',time:'09:00'}],images:[]},
    results:{mode:'images',rows:[{nickname:'隱藏表單'}],images:[{id:'img',file:'image fixture',label:'成績表',secret:'hidden'}]},
  }});
  const published=publicHistoricalEvent(value);
  assert.deepEqual(published.materials.registrations,{mode:'table',rows:[{nickname:'河**人',division:'ME'}]});
  assert.equal(published.materials.startOrder,undefined);
  assert.deepEqual(published.materials.results,{mode:'images',images:[{id:'img',file:'image fixture',label:'成績表'}]});
  const serialized=JSON.stringify(published);for(const secret of ['secret','真實姓名','private@example.test','不可公開','隱藏表單','r1'])assert.equal(serialized.includes(secret),false);
});
test('empty reports and unpublished history are excluded; unmasking is independent per report',()=>{
  assert.equal(publicHistoricalEvent(event({status:'DRAFT'})),null);
  const value=event({materials:{registrations:{mode:'table',rows:[],images:[]},startOrder:{mode:'images',images:[]},results:{mode:'table',masked:false,rows:[{nickname:'森林小鹿',rank:'1',result:'33:12'}]}}});
  assert.deepEqual(Object.keys(publicHistoricalEvent(value).materials),['results']);
  assert.equal(publicHistoricalEvent(value).materials.results.rows[0].nickname,'森林小鹿');
});
test('partial table rows need a nickname and valid supplied start times; optional cells may stay empty',()=>{
  const material={mode:'table',rows:[{nickname:'',division:'ME',time:'09:00'}]};
  assert.ok(historicalErrors(event({materials:{startOrder:material}})).length);
  material.rows[0].nickname='森林旅人';material.rows[0].time='25:00';assert.ok(historicalErrors(event({materials:{startOrder:material}})).length);
  material.rows[0].time='';assert.deepEqual(historicalErrors(event({materials:{startOrder:material}})),[]);
});
test('historical events never open registration and drafts stay out of both public list and calendar',()=>{
  const value=event({starts:'2027-01-01',opens:'2026-01-01T00:00',closes:'2028-01-01T00:00'});
  assert.equal(eventState(value,now),'past');
  const catalog=[event(),event({id:'draft',status:'DRAFT'})];
  assert.equal(groupedEvents(catalog,now).find(section=>section.key==='past').events.length,1);
  assert.equal(calendarEvents(catalog,'2026-10',now).get('2026-10-04').length,1);
});
test('calendar uses Taipei month, crosses year boundaries and places leap dates on the correct weekday',()=>{
  assert.equal(taipeiDate(Date.parse('2026-10-31T16:30:00Z')),'2026-11-01');
  assert.equal(currentCalendarMonth(Date.parse('2026-10-31T16:30:00Z')),'2026-11');
  assert.equal(shiftCalendarMonth('2026-12',1),'2027-01');assert.equal(shiftCalendarMonth('2027-01',-1),'2026-12');
  const days=calendarDays('2024-02');assert.equal(days.indexOf('2024-02-01'),4);assert.equal(days.filter(Boolean).length,29);assert.equal(days.length%7,0);
  assert.equal(calendarDays('2026-02').filter(Boolean).length,28);
});
test('calendar keeps every same-day event while excluding adjacent months',()=>{
  const dates=calendarEvents([event({id:'one'}),event({id:'two'}),event({id:'next',starts:'2026-11-04'})],'2026-10',now);
  assert.equal(dates.size,1);assert.deepEqual(dates.get('2026-10-04').map(item=>item.id),['one','two']);
});
