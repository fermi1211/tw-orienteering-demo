import { isActiveParticipant } from './registration-order-model.js';
export const exportDisplayName = row => row.displayNameOverride?.trim() || row.nickname?.trim() || row.name?.trim() || '';
export function activeEventRows(rows, eventId) {
  return rows.filter(row => row.eventId === eventId && isActiveParticipant(row));
}
export function registrationClosed(event, now = Date.now()) {
  if (event.status !== 'PUBLISHED' || !event.closes) return false;
  const deadline = Date.parse(`${event.closes.length === 16 ? event.closes + ':00' : event.closes}+08:00`);
  return Number.isFinite(deadline) && now >= deadline;
}
export const timeMinutes = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '') ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3)) : null;
const minuteTime = value => `${String(Math.floor(value / 60)).padStart(2,'0')}:${String(value % 60).padStart(2,'0')}`;
export function createStartOrder(event) {
  const elite = event.divisions.filter(code => ['ME','WE'].includes(code));
  const other = event.divisions.filter(code => !elite.includes(code));
  return { title:'Startlist', sections:[
    {id:'elite',title:'菁英組',theme:'green',divisions:elite,start:'09:20',interval:1,parallel:1,rowsPerColumn:13,entries:[]},
    {id:'other',title:'進階／公開組',theme:'orange',divisions:other,start:'09:30',interval:1,parallel:2,rowsPerColumn:13,entries:[]},
  ].filter(section => section.divisions.length) };
}
export function assignStartDivision(order, sectionId, code, checked) {
  if (!order.sections.some(section => section.id === sectionId)) return order;
  return {...order, sections: order.sections.map(section => ({
    ...section,
    divisions: section.id === sectionId
      ? checked ? [...new Set([...section.divisions, code])] : section.divisions.filter(value => value !== code)
      : checked ? section.divisions.filter(value => value !== code) : [...section.divisions],
  }))};
}
export function syncStartOrder(order, rows) {
  const previous = new Map([...(order.detachedEntries||[]),...order.sections.flatMap(section => section.entries)].map(entry => [entry.recordId,entry]));
  const assigned = new Set();
  const sections=order.sections.map(section => {
    const eligible = rows.filter(row => section.divisions.includes(row.division) && !assigned.has(row.id));
    eligible.forEach(row => assigned.add(row.id));
    const ids = new Set(eligible.map(row=>row.id));
    const entries = section.entries.filter(entry=>ids.delete(entry.recordId)).map(entry=>({...entry}));
    eligible.filter(row=>ids.has(row.id)).forEach(row=>entries.push({...previous.get(row.id),recordId:row.id,time:previous.get(row.id)?.time || ''}));
    return {...section,entries};
  });
  return {...order,sections,detachedEntries:rows.filter(row=>!assigned.has(row.id)).map(row=>({...previous.get(row.id),recordId:row.id,time:previous.get(row.id)?.time||''}))};
}
export function entryName(entry, row) { return typeof entry.nameOverride === 'string' ? entry.nameOverride : exportDisplayName(row); }
export function moveStartEntry(entries, index, direction) {
  const destination = index + direction;
  if (destination < 0 || destination >= entries.length) return entries;
  const result = [...entries], times = entries.map(entry=>entry.time);
  [result[index],result[destination]]=[result[destination],result[index]];
  return result.map((entry,i)=>({...entry,time:times[i]}));
}
export function generateSectionTimes(section) {
  const start = timeMinutes(section.start), interval = Number(section.interval), parallel = Number(section.parallel);
  if (start === null || !Number.isInteger(interval) || interval < 1 || interval > 60 || !Number.isInteger(parallel) || parallel < 1 || parallel > 4) throw new Error('請填有效起始時間、1–60 分鐘間隔及 1–4 位同時出發人數。');
  if (section.entries.length && start + Math.floor((section.entries.length-1)/parallel)*interval >= 1440) throw new Error('出發時間會跨越午夜，請調整起始時間、間隔或同時出發人數。');
  return {...section,entries:section.entries.map((entry,index)=>({...entry,time:minuteTime(start + Math.floor(index/parallel)*interval)}))};
}
export function validateStartOrder(order, rows) {
  const errors = [], used = new Set(), rowMap = new Map(rows.map(row=>[row.id,row]));
  if (!order.title.trim()) errors.push('請填寫表單標題。');
  for (const section of order.sections) {
    if (!section.title.trim()) errors.push('請填寫所有分區標題。');
    if (!Number.isInteger(Number(section.parallel)) || Number(section.parallel)<1 || Number(section.parallel)>4) errors.push('同時出發人數需為 1–4 位。');
    if (!Number.isInteger(Number(section.rowsPerColumn)) || Number(section.rowsPerColumn)<5 || Number(section.rowsPerColumn)>25) errors.push('每欄列數需為 5–25 列。');
    for (const entry of section.entries) {
      const row = rowMap.get(entry.recordId);
      if (!row || !section.divisions.includes(row.division)) { errors.push('名單已變更，請重新整理本次出發序名單。'); continue; }
      if (used.has(entry.recordId)) errors.push('同一筆報名不可重複編入分區。');
      used.add(entry.recordId);
      if (!entryName(entry,row).trim()) errors.push(`${entry.recordId} 尚未填寫顯示名稱。`);
      if (timeMinutes(entry.time) === null) errors.push(`${entry.recordId} 尚未填寫有效出發時間。`);
    }
  }
  if (rows.some(row=>!used.has(row.id))) errors.push('仍有報名者尚未分配至出發分區。');
  if (!rows.length) errors.push('本場沒有可匯出的有效報名。');
  return [...new Set(errors)];
}
export function startReportSections(order, rows) {
  const map = new Map(rows.map(row=>[row.id,row]));
  return order.sections.map(section=>({...section,entries:section.entries.filter(entry=>map.has(entry.recordId)).map(entry=>({recordId:entry.recordId,name:entryName(entry,map.get(entry.recordId)).trim(),time:entry.time || '待排'}))}));
}
export function entryColumns(event, rows, rowsPerColumn = 13) {
  const preferred = ['WE','ME','WA','MA','OPEN'];
  const codes = [...preferred.filter(code=>event.divisions.includes(code)),...event.divisions.filter(code=>!preferred.includes(code)),...new Set(rows.filter(row=>!event.divisions.includes(row.division)).map(row=>row.division))];
  return codes.flatMap(code=>{
    const names = rows.filter(row=>row.division===code).map(exportDisplayName);
    if (!names.length) return [{label:code,cells:[]}];
    return Array.from({length:Math.ceil(names.length/rowsPerColumn)},(_,index)=>({label:code,cells:names.slice(index*rowsPerColumn,(index+1)*rowsPerColumn)}));
  });
}
