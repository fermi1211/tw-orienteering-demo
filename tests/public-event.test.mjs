import test from 'node:test';
import assert from 'node:assert/strict';
import { eventState, groupedEvents, publicNickname, publicEventData } from '../src/public-event-model.js';
import { createStartOrder, syncStartOrder, generateSectionTimes } from '../src/event-export-model.js';

const now = Date.parse('2026-10-24T04:00:00Z');
const event = { id:'race', name:'測試賽', starts:'2026-10-25T09:00', status:'PUBLISHED', opens:'2026-10-01T08:00', closes:'2026-10-24T12:00', divisions:['ME','OPEN','WA'], fees:{SINGLE:450} };
const rows = [
  {id:'a',eventId:'race',division:'ME',nickname:'森林旅人',name:'不可公開姓名甲',displayNameOverride:'不可公開顯示覆寫',email:'secret@example.test',phone:'0900000000',last5:'12345',status:'PENDING'},
  {id:'b',eventId:'race',division:'ME',nickname:' ',name:'不可公開姓名乙'},
  {id:'c',eventId:'race',division:'OPEN',nickname:'Alpine Fox',name:'不可公開姓名丙'},
];
const order = () => {
  const value = syncStartOrder(createStartOrder(event),rows);
  return {...value,sections:value.sections.map(section=>generateSectionTimes(section))};
};

test('time boundaries use Taipei dates, include past and closed future races, exclude drafts',()=>{
  assert.equal(eventState(event,now-1),'open');
  assert.equal(eventState(event,now),'closed');
  assert.equal(eventState({...event,starts:'2026-10-24T09:00'},now),'closed');
  assert.equal(eventState({...event,starts:'2026-10-23T23:59'},now),'past');
  assert.equal(eventState({...event,opens:'2026-10-24T12:00'},now-1),'upcoming');
  const source=[event,{...event,id:'past-1',starts:'2026-10-20T09:00'},{...event,id:'past-2',starts:'2026-10-22T09:00'},{...event,id:'draft',status:'DRAFT'}];
  const groups=groupedEvents(source,now);
  assert.deepEqual(groups[1].events.map(item=>item.id),['race']);
  assert.deepEqual(groups[2].events.map(item=>item.id),['past-2','past-1']);
  assert.equal(groups.flatMap(group=>group.events).some(item=>item.id==='draft'),false);
  assert.equal(eventState({...event,starts:'2026-10-24T09:00'},Date.parse('2026-10-24T16:00:00Z')),'past');
});
test('masking preserves only edge graphemes, handles short and blank nicknames',()=>{
  assert.equal(publicNickname(' 森林旅人 ',true),'森**人');
  assert.equal(publicNickname('Alpine Fox',true),'A********x');
  assert.equal(publicNickname('小鹿',true),'**');
  assert.equal(publicNickname('鹿',true),'*');
  assert.equal(publicNickname(' ',true),'未設定暱稱');
  assert.equal(publicNickname(undefined,false),'未設定暱稱');
  assert.equal(publicNickname('👨‍👩‍👧‍👦山林e\u0301',true),'👨‍👩‍👧‍👦**e\u0301');
  assert.equal(publicNickname('森林旅人',false),'森林旅人');
});
test('counts include pending and repeated registrations; exclude deleted, duplicate and other events',()=>{
  const source=[...rows,{...rows[0],id:'repeat'},{...rows[0],id:'deleted',deletedAt:'now'},{...rows[0],id:'disabled',recordState:'DUPLICATE'},{...rows[0],id:'other',eventId:'other'}];
  const data=publicEventData(event,source,null,now);
  assert.equal(data.total,4);
  assert.deepEqual(data.groups.map(group=>[group.code,group.count]),[['ME',3],['OPEN',1],['WA',0]]);
  assert.equal(data.groups.some(group=>'registrations' in group||'starts' in group),false);
});
test('public projection never falls back to legal name, admin display name, start override or contact data',()=>{
  const saved=order(); saved.sections[0].entries[0].nameOverride='不可公開出發覆寫';
  const data=publicEventData({...event,publicVisibility:{registrations:true,startOrder:true}},rows,saved,now);
  assert.equal(data.startOrderReady,true);
  assert.equal(data.groups[0].registrations[0].nickname,'森**人');
  assert.equal(data.groups[0].registrations[1].nickname,'未設定暱稱');
  assert.equal(data.groups[0].starts[0].nickname,'森**人');
  const text=JSON.stringify(data);
  for(const forbidden of ['不可公開','secret@','0900000000','12345','recordId','nameOverride','last5','email']) assert.equal(text.includes(forbidden),false,forbidden);
  assert.deepEqual(Object.keys(data.groups[0].registrations[0]),['nickname','division']);
  assert.deepEqual(Object.keys(data.groups[0].starts[0]),['nickname','time']);
});
test('roster and start visibility/masking are independent and hidden data is absent',()=>{
  const data=publicEventData({...event,publicVisibility:{registrations:true,maskRegistrations:false,startOrder:true,maskStartOrder:true}},rows,order(),now);
  assert.equal(data.groups[0].registrations[0].nickname,'森林旅人');
  assert.equal(data.groups[0].starts[0].nickname,'森**人');
  const hidden=publicEventData({...event,publicVisibility:{registrations:false,startOrder:true,maskStartOrder:false}},rows,order(),now);
  assert.equal('registrations' in hidden.groups[0],false);
  assert.equal(hidden.groups[0].starts[0].nickname,'森林旅人');
  const disabled=publicEventData({...event,publicVisibility:{registrations:true,startOrder:false}},rows,order(),now);
  assert.equal('starts' in disabled.groups[0],false);
});
test('only saved, complete and closed schedules are public, edits/deletions use current roster',()=>{
  const enabled={...event,publicVisibility:{startOrder:true}};
  assert.equal(publicEventData(enabled,rows,null,now).startOrderReady,false);
  assert.equal(publicEventData(enabled,rows,order(),now-1).startOrderReady,false);
  const incomplete=order();incomplete.sections[0].entries[0].time='';
  assert.equal(publicEventData(enabled,rows,incomplete,now).startOrderReady,false);
  const added=[...rows,{...rows[0],id:'new'}];
  assert.equal(publicEventData(enabled,added,order(),now).startOrderReady,false);
  const deleted=rows.map(row=>row.id==='a'?{...row,deletedAt:'now'}:row);
  const data=publicEventData(enabled,deleted,order(),now);
  assert.equal(data.total,2);
  assert.equal(data.startOrderReady,true);
  assert.equal(JSON.stringify(data).includes('森**人'),false);
  const changed=rows.map(row=>row.id==='a'?{...row,division:'OPEN'}:row);
  const transferred=publicEventData(enabled,changed,order(),now);
  assert.equal(transferred.groups.find(group=>group.code==='OPEN').starts.some(row=>row.nickname==='森**人'),true);
});
