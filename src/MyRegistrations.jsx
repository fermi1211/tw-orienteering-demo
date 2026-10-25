import { useState } from 'react';
import { ArrowRight, ArrowLeft, CalendarBlank, MapPin, CheckCircle, Clock, LockSimple, Mountains, FileText, SquaresFour } from '@phosphor-icons/react';

const feeNames={MEMBER:'會員',LEGACY_PREPAID:'舊制已預繳',SINGLE:'單次報名'};
const paymentNames={NOT_REQUIRED:'不需繳款',BANK_TRANSFER:'銀行轉帳',ONSITE:'現場繳費'};
export const isPendingRecord=record=>record.status.includes('待確認帳款');
export const isReconciledRecord=record=>record.status.includes('已完成對帳');

export function createMultipleRecords(events,residency,profile){
  return [
    {id:'DEMO-MULTI-01',event:events[0],group:'公開組 OPEN',fee:'SINGLE',payment:'BANK_TRANSFER',amount:450,last5:'00123',date:'2026-10-20',status:'報名完成(待確認帳款)'},
    {id:'DEMO-MULTI-02',event:{...events[1],state:'open'},group:'男子進階組 MA',fee:'MEMBER',payment:'NOT_REQUIRED',amount:0,last5:'',date:'',status:'報名完成'},
    {id:'DEMO-MULTI-03',event:{...events[2],state:'open'},group:'公開組 OPEN',fee:'SINGLE',payment:residency==='FOREIGN'?'ONSITE':'BANK_TRANSFER',amount:450,last5:residency==='FOREIGN'?'':'00567',date:residency==='FOREIGN'?'':'2026-10-21',status:residency==='FOREIGN'?'報名完成(現場繳費)':'報名完成(已完成對帳)'},
  ].map(record=>({...record,eventId:record.event.id,profile:{...profile},isDemo:true}));
}

export function MyRegistrations({records,defaultEvent,onEdit,onBrief,onExplore,onDemo,notice}){
  const [filter,setFilter]=useState('ALL');
  const eventFor=record=>record.event||defaultEvent;
  const pending=records.filter(isPendingRecord).length;
  const visible=filter==='PENDING'?records.filter(isPendingRecord):records;
  const eventGroups=[...new Set(visible.map(record=>eventFor(record).id))].map(id=>({event:eventFor(visible.find(record=>eventFor(record).id===id)),records:visible.filter(record=>eventFor(record).id===id)})).sort((a,b)=>a.event.date.localeCompare(b.event.date));
  return <main id="main" className="my-registrations-page"><header className="my-registrations-heading"><div>{onExplore&&<button className="text-button" onClick={onExplore}><ArrowLeft size={18}/>返回賽事列表</button>}<p className="eyebrow">我的會員中心</p><h1>我的報名</h1><p>每一場期待，都在這裡。</p></div>{onExplore&&<button className="secondary" onClick={onExplore}>探索更多賽事<ArrowRight size={19}/></button>}</header>
    {records.some(record=>record.isDemo)&&<p className="multi-demo-banner"><SquaresFour size={18}/><span>多場報名示範 · 三場賽事於此情境皆已開放報名，資料僅供預覽。</span></p>}
    {notice&&<p className="my-records-notice" role="status"><CheckCircle size={20}/>{notice}</p>}
    {records.length?<><div className="registration-overview" aria-label="報名總覽"><div><CalendarBlank size={22}/><span>已報名賽事<strong>{new Set(records.map(record=>eventFor(record).id)).size}<small>場</small></strong></span></div><div><FileText size={22}/><span>報名紀錄<strong>{records.length}<small>筆</small></strong></span></div><div className={pending?'has-pending':''}><Clock size={22}/><span>待確認帳款<strong>{pending}<small>筆</small></strong></span></div></div>
      <div className="my-records-toolbar"><div className="my-records-filters" role="group" aria-label="篩選我的報名"><button aria-pressed={filter==='ALL'} onClick={()=>setFilter('ALL')}>全部報名 <span>{records.length}</span></button><button aria-pressed={filter==='PENDING'} onClick={()=>setFilter('PENDING')}>待確認帳款 <span>{pending}</span></button></div><span>依賽事日期由近至遠</span></div>
      {eventGroups.length?<div className="my-event-groups">{eventGroups.map(({event,records:entries})=><section className="my-event-group" key={event.id} aria-labelledby={`my-event-${event.id}`}><header className="my-event-heading"><time dateTime={event.date}><span>{event.date.slice(0,4)}</span><strong>{event.displayDate}</strong></time><div><h2 id={`my-event-${event.id}`}>{event.name}</h2><p><MapPin size={17}/>{event.location}<span>可修改至 {event.deadline}</span></p></div>{onBrief&&<button className="text-button" aria-label={`查看${event.name}資訊`} onClick={()=>onBrief(event)}>賽事資訊<ArrowRight size={17}/></button>}</header>
        {entries.map(record=><article className="my-registration-entry" key={record.id} aria-label={`${event.name} 的報名 ${record.id}`}><header><span className="my-record-id">{record.id}</span><span className={`my-payment-status ${isPendingRecord(record)?'pending':record.payment==='ONSITE'?'onsite':'complete'}`}>{isPendingRecord(record)?<Clock size={17}/>:<CheckCircle size={17}/>}<span>{record.status}</span></span></header><dl><div><dt>參賽組別</dt><dd>{record.group}</dd></div><div><dt>費用類別</dt><dd>{feeNames[record.fee]}</dd></div><div><dt>付款方式</dt><dd>{paymentNames[record.payment]}</dd></div><div><dt>應繳金額</dt><dd className="record-amount">NT${record.amount}</dd></div></dl><footer><p>{isPendingRecord(record)?<><Clock size={17}/>已送出轉帳資料，待主辦單位確認。</>:isReconciledRecord(record)?<><LockSimple size={17}/>繳款資料已鎖定，仍可於期間內轉組。</>:record.payment==='ONSITE'?<><MapPin size={17}/>現場繳費，無需填寫轉帳資料。</>:<><CheckCircle size={17}/>報名已完成，期待在賽場相見。</>}</p>{onEdit&&<button className={isPendingRecord(record)?'primary':'secondary'} aria-label={`${isPendingRecord(record)?'修改組別與繳款資訊':'修改組別'} ${record.id}`} onClick={()=>onEdit(record)}>{isPendingRecord(record)?'修改組別與繳款資訊':'修改組別'}<ArrowRight size={18}/></button>}</footer></article>)}
      </section>)}</div>:<div className="my-records-empty"><CheckCircle size={45} weight="light"/><h2>目前沒有待確認帳款</h2><p>可回到全部報名查看各場賽事。</p><button className="secondary" onClick={()=>setFilter('ALL')}>查看全部報名</button></div>}
      <p className="my-records-footnote">每筆報名獨立保存；同場多筆報名會並列顯示，各自管理組別與繳款資料。</p>
    </>:<div className="my-records-empty"><Mountains size={64} weight="light"/><h2>下一段旅程，等你出發。</h2><p>目前還沒有示範報名紀錄。</p>{onExplore&&<button className="primary" onClick={onExplore}>探索近期賽事<ArrowRight size={19}/></button>}<button className="text-button" onClick={onDemo}>載入多場報名示範</button></div>}
  </main>;
}
