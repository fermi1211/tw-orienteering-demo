import { publicNickname } from './public-event-model.js';

export const materialSchemas = {
  registrations: { title: '報名名單', columns: [{key:'nickname',label:'暱稱'},{key:'division',label:'組別'}] },
  startOrder: { title: '出發序', columns: [{key:'nickname',label:'暱稱'},{key:'division',label:'組別'},{key:'time',label:'出發時間',type:'time'}] },
  results: { title: '成績公告', columns: [{key:'nickname',label:'暱稱'},{key:'division',label:'組別'},{key:'rank',label:'名次'},{key:'result',label:'成績'}] },
};
export const historicalFeeLabels = { MEMBER:'會員', LEGACY_PREPAID:'舊制已預繳', SINGLE:'單次報名' };
const text = value => typeof value === 'string' ? value.trim() : '';
const hasFee = value => value !== undefined && value !== null && String(value).trim() !== '';
const validDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value;
};
export const isHistoricalEvent = event => event?.kind === 'HISTORICAL';
export function emptyMaterial() { return {mode:'none',images:[],rows:[],masked:true}; }
export function emptyHistoricalEvent() {
  return {kind:'HISTORICAL',name:'',starts:'',location:'',status:'DRAFT',description:'',attachments:{images:[],documents:[]},mapLocation:null,divisions:[],fees:{},terms:[],materials:Object.fromEntries(Object.keys(materialSchemas).map(key=>[key,emptyMaterial()]))};
}
export function historicalErrors(event) {
  const errors=[];
  if (!text(event.name)) errors.push('請填寫賽事名稱。');
  if (!validDate(event.starts || '')) errors.push('請選擇有效的活動日期。');
  if (!text(event.location)) errors.push('請填寫活動地點。');
  for (const [key,value] of Object.entries(event.fees || {})) {
    if (hasFee(value) && (!Number.isSafeInteger(Number(value)) || Number(value)<0)) errors.push(`${historicalFeeLabels[key] || '報名'}費用須為 0 或正整數，或留空。`);
  }
  for (const [key,schema] of Object.entries(materialSchemas)) {
    const material=event.materials?.[key];
    if (material?.mode !== 'table') continue;
    const rows=(material.rows || []).filter(row=>schema.columns.some(column=>text(row[column.key])));
    if (rows.some(row=>!text(row.nickname))) errors.push(`「${schema.title}」每筆有內容的資料都須填寫暱稱，或移除該列。`);
    if (key==='startOrder' && rows.some(row=>text(row.time) && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(row.time))) errors.push('出發時間請使用有效的 24 小時時間。');
  }
  if ((event.terms || []).some(term=>(text(term.title)||text(term.content)) && (!text(term.title)||!text(term.content)))) errors.push('有填寫的條款請同時填妥標題與內容，或移除。');
  const point=event.mapLocation;
  if (point && (!Number.isFinite(point.lat)||!Number.isFinite(point.lng)||Math.abs(point.lat)>85||Math.abs(point.lng)>180)) errors.push('請設定有效的活動地圖位置，或清除位置。');
  return errors;
}
export function normalizeHistoricalEvent(event) {
  const materials=Object.fromEntries(Object.entries(materialSchemas).map(([key,schema])=>{
    const source=event.materials?.[key] || emptyMaterial();
    return [key,{mode:['images','table'].includes(source.mode)?source.mode:'none',masked:source.masked !== false,images:source.images || [],rows:(source.rows || []).map(row=>({id:row.id,...Object.fromEntries(schema.columns.map(column=>[column.key,text(row[column.key])]))})).filter(row=>row.nickname)}];
  }));
  return {...event,kind:'HISTORICAL',name:text(event.name),starts:event.starts,location:text(event.location),description:text(event.description),divisions:[...new Set((event.divisions || []).map(text).filter(Boolean))],fees:Object.fromEntries(Object.keys(historicalFeeLabels).filter(key=>hasFee(event.fees?.[key])&&Number.isSafeInteger(Number(event.fees[key]))&&Number(event.fees[key])>=0).map(key=>[key,Number(event.fees[key])])),terms:(event.terms || []).filter(term=>text(term.title)&&text(term.content)).map(term=>({id:term.id,title:text(term.title),content:text(term.content)})),attachments:event.attachments || {images:[],documents:[]},materials};
}

// Keep unpublished content and inactive report modes out of the public component.
export function publicHistoricalEvent(event) {
  if (!isHistoricalEvent(event) || event.status !== 'PUBLISHED') return null;
  const value=normalizeHistoricalEvent(event), materials={};
  for (const [key,schema] of Object.entries(materialSchemas)) {
    const material=value.materials[key];
    if (material.mode==='images' && material.images.length) materials[key]={mode:'images',images:material.images.map(({id,file,label})=>({id,file,label}))};
    if (material.mode==='table' && material.rows.length) materials[key]={mode:'table',rows:material.rows.map(row=>Object.fromEntries(schema.columns.map(column=>[column.key,column.key==='nickname'?publicNickname(row.nickname,material.masked):row[column.key]])))};
  }
  return {id:value.id,kind:value.kind,status:value.status,name:value.name,starts:value.starts,location:value.location,description:value.description,divisions:value.divisions,fees:value.fees,terms:value.terms.map(({title,content})=>({title,content})),mapLocation:value.mapLocation,attachments:value.attachments,materials};
}

export const initialHistoricalEvents = [
  {...emptyHistoricalEvent(),id:'history-campus',status:'PUBLISHED',name:'校園定向體驗（歷史示範）',starts:'2026-10-04',location:'台北市 · 校園場地（示意）'},
  {...emptyHistoricalEvent(),id:'history-riverside',status:'PUBLISHED',name:'河岸定向交流賽（歷史示範）',starts:'2026-10-18',location:'新北市 · 河岸公園（示意）',description:'以地圖串起河岸的風景。這份歷史活動資料使用虛構暱稱，示範名單、出發序與成績的回顧方式。',divisions:['菁英組','公開組'],fees:{SINGLE:350},materials:{
    registrations:{mode:'table',masked:true,images:[],rows:[{id:'hr1',nickname:'河岸旅人',division:'菁英組'},{id:'hr2',nickname:'森林小鹿',division:'公開組'}]},
    startOrder:{mode:'table',masked:true,images:[],rows:[{id:'hs1',nickname:'河岸旅人',division:'菁英組',time:'09:00'},{id:'hs2',nickname:'森林小鹿',division:'公開組',time:'09:02'}]},
    results:{mode:'table',masked:true,images:[],rows:[{id:'hc1',nickname:'河岸旅人',division:'菁英組',rank:'1',result:'32:15'},{id:'hc2',nickname:'森林小鹿',division:'公開組',rank:'1',result:'45:08'}]},
  }},
];
