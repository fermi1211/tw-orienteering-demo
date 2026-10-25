import { eventForList } from './public-event-model.js';

export const taipeiDate = (now=Date.now()) => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei'}).format(new Date(now));
export const currentCalendarMonth = (now=Date.now()) => taipeiDate(now).slice(0,7);
export function shiftCalendarMonth(month,offset) {
  const [year,number]=month.split('-').map(Number), date=new Date(Date.UTC(year,number-1+offset,1));
  return date.toISOString().slice(0,7);
}
export function calendarDays(month) {
  const [year,number]=month.split('-').map(Number), first=new Date(`${month}-01T00:00:00Z`), last=new Date(Date.UTC(year,number,0)).getUTCDate();
  const count=Math.ceil((first.getUTCDay()+last)/7)*7;
  return Array.from({length:count},(_,index)=>{const day=index-first.getUTCDay()+1;return day>0&&day<=last?`${month}-${String(day).padStart(2,'0')}`:null;});
}
export function calendarEvents(catalog,month,now=Date.now()) {
  const dates=new Map();
  for (const event of catalog.filter(event=>event.status==='PUBLISHED' && event.starts?.slice(0,7)===month).map(event=>eventForList(event,now)).sort((a,b)=>(a.starts||'').localeCompare(b.starts||'')||a.name.localeCompare(b.name,'zh-TW'))) {
    if(!dates.has(event.date))dates.set(event.date,[]);
    dates.get(event.date).push(event);
  }
  return dates;
}
