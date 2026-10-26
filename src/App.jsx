import { MemberCredit, WalletPaymentChoice } from './MemberCredit.jsx';
import { CancellationDialog } from './CancellationDialog.jsx';
import { cancelParticipants, cancellationQuote, commitRegistration, creditBalance, memberCanCancel, cancellationAllowed, reconcileRegistration } from './member-credit-model.js';
import { FeedbackForm } from './Feedback.jsx';
import { createFeedback } from './feedback-model.js';
import { GroupRegistration } from './GroupRegistration.jsx';
import { projectRegistration, refreshRegistration, isActiveParticipant, orderIdOf } from './registration-order-model.js';
import { initialDemoMembers, memberFieldLabels } from './demo-members.js';
import { canEnterAdmin, canViewScreen, initialOptionSets, initialRoles, roleName } from './access-model.js';
import { EventList } from './EventList.jsx';
import { HistoricalEventDetail } from './HistoricalEventDetail.jsx';
import { initialHistoricalEvents, isHistoricalEvent, publicHistoricalEvent } from './historical-event-model.js';
import { currentCalendarMonth } from './event-calendar-model.js';
import { JournalPage } from './JournalPage.jsx';
import { initialArticles, publicArticles } from './article-model.js';
import { MyRegistrations, createMultipleRecords, isReconciledRecord } from './MyRegistrations.jsx';
import { MemberProfile, createDemoProfile } from './MemberProfile.jsx';
import { SignupPage } from './SignupPage.jsx';
import { EventDetail } from './EventDetail.jsx';
import { AdminWorkspace, initialDefaults, initialEvents, initialRegistrationRows } from './AdminWorkspace.jsx';
import './workspace.css';
import { eventForList, eventState, publicEventData } from './public-event-model.js';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Mountains, CalendarBlank, List, X, ArrowRight, ArrowLeft, CheckCircle, SignOut, UserCircle, ChatCircleDots } from '@phosphor-icons/react';
import '@fontsource/noto-serif-tc/700.css';
import '@fontsource/noto-sans-tc/400.css';
import '@fontsource/noto-sans-tc/500.css';
import '@fontsource/noto-sans-tc/700.css';
const groups = ['男子菁英組 ME','女子菁英組 WE','男子進階組 MA','女子進階組 WA','公開組 OPEN'];
const fees = [{key:'MEMBER',title:'會員',amount:0},{key:'LEGACY_PREPAID',title:'舊制已預繳',amount:0},{key:'SINGLE',title:'單次報名',amount:450}];
const eventName = '冬日森林定向賽';
const money = n => `NT$${n}`;
const events = [
 {id:'winter-forest',name:eventName,date:'2026-12-13',displayDate:'12.13',dateFull:'2026 年 12 月 13 日',location:'新北市 · 林口',deadline:'12.06',deadlineFull:'2026 年 12 月 6 日',state:'open'},
 {id:'city-park',name:'城市公園定向賽',date:'2026-12-20',displayDate:'12.20',dateFull:'2026 年 12 月 20 日',location:'台北市',deadline:'12.13',deadlineFull:'2026 年 12 月 13 日',state:'upcoming'},
 {id:'mountain-trail',name:'山林探索定向賽',date:'2026-12-27',displayDate:'12.27',dateFull:'2026 年 12 月 27 日',location:'桃園市',deadline:'12.20',deadlineFull:'2026 年 12 月 20 日',state:'upcoming'},
];
function Modal({title,onClose,children,wide=false}){
 const ref=useRef(null); const titleId=useId();
 useEffect(()=>{const el=ref.current;el.showModal();const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=before}},[]);
 return <dialog ref={ref} aria-labelledby={titleId} className={wide?'modal wide':'modal'} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===ref.current)onClose()}}><div className="modal-inner"><header className="modal-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label="關閉視窗" type="button" onClick={onClose}><X size={24}/></button></header>{children}</div></dialog>
}
function SingleRegistrationForm({user,profile,onSave,editing=null,onBack,eventInfo,feeOptions=initialOptionSets.registrationFees,balance=0}){
 const availableGroups=eventInfo?.divisions?.map(code=>`${eventInfo.divisionCatalog?.find(group=>group.code===code)?.name||({ME:'男子菁英組',WE:'女子菁英組',MA:'男子進階組',WA:'女子進階組',OPEN:'公開組'}[code])||code} ${code}`)||groups;
 const [step,setStep]=useState(1),[group,setGroup]=useState((editing&&availableGroups.find(group=>group.split(' ').at(-1)===editing.group.split(' ').at(-1)))||editing?.group||(availableGroups.includes(profile.division)?profile.division:availableGroups[0])),[fee,setFee]=useState(editing?.fee||feeOptions.find(option=>option.active)?.id||'SINGLE'),[payment,setPayment]=useState(editing?.payment||'BANK_TRANSFER'),[last5,setLast5]=useState(editing?.last5||''),[date,setDate]=useState(editing?.date||''),[consent,setConsent]=useState(false),[error,setError]=useState(''),[useWallet,setUseWallet]=useState(false);
 const selected={...fees.find(f=>f.key===fee),title:feeOptions.find(option=>option.id===fee)?.name||fees.find(f=>f.key===fee).title,amount:eventInfo?.fees?.[fee]??fees.find(f=>f.key===fee).amount},formEvent=editing?.event||eventInfo||events[0],amount=editing?.amount??selected.amount,walletSelected=!editing&&useWallet&&amount>0&&balance>=amount,walletPayment=walletSelected||payment==='WALLET',bank=fee==='SINGLE'&&payment==='BANK_TRANSFER'&&!walletSelected;

 function submit(e){e.preventDefault();const submittedDate=new FormData(e.currentTarget).get('payment_date')||date;if(!editing&&!feeOptions.some(option=>option.id===fee&&option.active)){setError('目前沒有可選的繳費方式。');return;}if(step===1&&!editing){setStep(2);return}if(bank&&!/^\d{5}$/.test(last5)){setError('請輸入完整的五位數字，包含開頭的 0。');return}if(bank&&!submittedDate){setError('請選擇繳款日期。');return}if(!editing&&!consent){setError('請先閱讀並勾選示範活動告知。');return}try{onSave({...editing,group,fee,payment:fee==='SINGLE'?(walletSelected?'WALLET':payment):'NOT_REQUIRED',amount,last5:bank?last5:'',date:bank?submittedDate:'',id:editing?.id});}catch(e){setError(e.message);}}
 return <form onSubmit={submit} noValidate><p className="dialog-subtitle">{formEvent.date.replaceAll('-','.')} · {formEvent.location}</p>{!editing&&<ol className="steps" aria-label="報名步驟"><li aria-current={step===1?'step':undefined}><span>1</span>選擇組別與費用</li><li aria-current={step===2?'step':undefined}><span>2</span>確認與送出</li></ol>}<div className="profile-line"><span>{profile.name}{user==='FOREIGN'?'（外國人）':'（本國人）'}</span><span>{profile.email}</span></div>
 {(step===1||editing)&&<><label className="field">參賽組別<select value={group} onChange={e=>setGroup(e.target.value)}>{availableGroups.map(g=><option key={g}>{g}</option>)}</select></label>{!editing&&<fieldset><legend>費用類別</legend><div className="radio-list">{fees.filter(f=>feeOptions.some(option=>option.id===f.key&&option.active)).map(base=>({...base,title:feeOptions.find(option=>option.id===base.key)?.name||base.title})).map(f=><label className={fee===f.key?'radio-row selected':'radio-row'} key={f.key}><input type="radio" name="fee" checked={fee===f.key} onChange={()=>{setFee(f.key);setError('')}}/><span>{f.title}</span><strong>{money(eventInfo?.fees?.[f.key]??f.amount)}</strong></label>)}</div></fieldset>}</>}
 {(step===2||editing)&&<>{!editing&&<div className="summary"><div><span>參賽組別</span><strong>{group}</strong></div><div><span>費用類別</span><strong>{selected.title}</strong></div></div>}{fee==='SINGLE'&&<><WalletPaymentChoice balance={balance} amount={amount} selected={walletSelected} onChange={setUseWallet} available={!editing}/>{!editing&&!walletSelected&&<fieldset><legend>付款方式</legend><div className="radio-list"><label className={payment==='BANK_TRANSFER'?'radio-row selected':'radio-row'}><input type="radio" name="payment" checked={payment==='BANK_TRANSFER'} onChange={()=>{setPayment('BANK_TRANSFER');setError('')}}/><span>銀行轉帳</span></label>{user==='FOREIGN'&&<label className={payment==='ONSITE'?'radio-row selected':'radio-row'}><input type="radio" name="payment" checked={payment==='ONSITE'} onChange={()=>{setPayment('ONSITE');setError('')}}/><span>現場繳費</span></label>}</div></fieldset>}{payment==='ADMIN_CONFIRMED'?<p className="notice">管理員已確認繳款；原繳款資料保留。</p>:walletPayment?<p className="notice">使用儲值金付款 {money(amount)}，無需填寫轉帳資訊。</p>:bank?<><div className="notice"><strong>繳款資訊示範</strong><p>正式收款帳戶待主辦單位提供。此範本不收款，請使用任意示範資料測試。</p></div><div className="field-grid"><label className="field">轉出帳號後五碼<input inputMode="numeric" autoComplete="off" maxLength={5} value={last5} onChange={e=>{setLast5(e.target.value.replace(/\D/g,''));setError('')}} placeholder="例如 00123" aria-describedby={error?'form-error':undefined}/></label><label className="field">繳款日期<input type="date" name="payment_date" defaultValue={date} onChange={e=>{setDate(e.target.value);setError('')}}/></label></div></>:<p className="notice">現場繳費金額為 {money(amount)}，不需填寫轉帳資料。</p>}</>}{editing?<p className="hint">費用類別、付款方式與金額維持原報名內容。</p>:<><details className="terms"><summary>閱讀示範活動告知</summary><p>這是介面操作範本，賽事、條款與報名紀錄均為示意。正式活動告知及條款由主辦單位另行提供。</p></details><label className="consent"><input type="checkbox" checked={consent} onChange={e=>{setConsent(e.target.checked);setError('')}}/><span>我已閱讀此示範活動告知</span></label></>}</>}
 {error&&<p id="form-error" className="form-error" role="alert">{error}</p>}<div className="form-footer"><div><span className="hint">應繳金額</span><strong>{money(amount)}</strong></div><button className="primary" type="submit">{editing?'儲存修改':step===1?'下一步':'確認報名'}<ArrowRight size={20}/></button></div>{!editing&&step===2&&<button className="text-button back" type="button" onClick={()=>{setStep(1);setError('')}}><ArrowLeft size={18}/>返回修改組別與費用</button>}{editing&&<button type="button" className="text-button back" onClick={onBack}>返回我的報名</button>}</form>
}
function RegistrationForm(props){
 const [mode,setMode]=useState(props.editing?.mode||props.optionSets.registrationModes.find(option=>option.active)?.id||'SINGLE');
 const modes=props.optionSets.registrationModes.filter(option=>option.active);
 const groups=props.eventInfo?.divisions||props.editing?.event?.divisions||['ME','WE','MA','WA','OPEN'];
 return <>{!props.editing&&<div className="registration-mode" role="group" aria-label="報名方式">{modes.map(option=><button type="button" className="secondary" aria-pressed={mode===option.id} key={option.id} onClick={()=>setMode(option.id)}>{option.name}</button>)}</div>}{!props.editing&&!modes.length?<p className="notice">目前未開放報名方式。</p>:mode==='MULTI'?<GroupRegistration {...props} eventInfo={{...props.eventInfo,divisionCatalog:props.groupCatalog}} groups={groups} feeOptions={props.optionSets.registrationFees}/>:<SingleRegistrationForm {...props} feeOptions={props.optionSets.registrationFees}/>}</>;
}
function AccessDenied({user,roleLabel,onLogin,onLogout,links,onOpen}) {
 return <main id="main" className="access-denied"><UserCircle size={52} weight="light"/><h1>{user?'此身分未開放這個畫面':'請登入後繼續'}</h1><p>{user?`目前身分：${roleLabel}。請選擇已開放的畫面，或聯絡系統 admin 調整角色。`:'此畫面未開放給未登入訪客，可登入示範帳號查看對應權限。'}</p><nav aria-label="可用畫面">{links.map(link=><button className="secondary" key={link.id} onClick={()=>onOpen(link.id)}>{link.name}</button>)}</nav><button className="primary" onClick={user?onLogout:onLogin}>{user?'登出示範帳號':'登入示範帳號'}<ArrowRight size={19}/></button></main>;
}
export function App(){
 const [roles,setRoles]=useState(initialRoles),[optionSets,setOptionSets]=useState(initialOptionSets),[members,setMembers]=useState(initialDemoMembers),[defaults,setDefaults]=useState(initialDefaults);
 const [sessionMemberId,setSessionMemberId]=useState(null);
 const [feedbackRecords,setFeedbackRecords]=useState([]);
 const currentMember=members.find(member=>member.id===sessionMemberId),user=currentMember?.residency||null,memberRole=currentMember?.role||'GUEST';
 const can=screen=>canViewScreen(roles,memberRole,screen),adminAllowed=canEnterAdmin(roles,memberRole);
 const activeGroups=defaults.groups.filter(group=>group.active).map(group=>`${group.name} ${group.code}`);
 function profileFor(member){if(!member)return createDemoProfile();const group=defaults.groups.find(group=>group.code===member.division);return {...createDemoProfile(member.residency,member.role),...Object.fromEntries(['name','email','residency',...Object.keys(memberFieldLabels).filter(key=>key!=='division')].map(key=>[key,member[key]||''])),division:group?`${group.name} ${group.code}`:member.division};}
 const profile=profileFor(currentMember),profileGroups=[...new Set([...activeGroups,profile.division].filter(Boolean))];
 const [catalog,setCatalog]=useState(initialEvents),[historicalEvents,setHistoricalEvents]=useState(initialHistoricalEvents);
 const publicCatalog=useMemo(()=>[...catalog,...historicalEvents.map(publicHistoricalEvent).filter(Boolean)],[catalog,historicalEvents]);
 const [eventListMode,setEventListMode]=useState('list'),[calendarMonth,setCalendarMonth]=useState(()=>currentCalendarMonth());
 const [articleRecords,setArticleRecords]=useState(initialArticles),[selectedArticleId,setSelectedArticleId]=useState(()=>new URLSearchParams(window.location.search).get('article'));
 const publishedArticles=useMemo(()=>publicArticles(articleRecords),[articleRecords]);
 const [registrationState,setRegistrationState]=useState(()=>({rows:initialRegistrationRows.map(row=>({...row,ownerId:row.ownerId||row.memberId||initialDemoMembers.find(member=>member.email===row.email)?.id})),ledger:[]})),[savedOrders,setSavedOrders]=useState({}),[now,setNow]=useState(Date.now);
 const rows=registrationState.rows,ledger=registrationState.ledger;
 const setRows=update=>setRegistrationState(previous=>({...previous,rows:typeof update==='function'?update(previous.rows):update}));
 const [cancelSource,setCancelSource]=useState('MEMBER_SELF');
 const [cancelTarget,setCancelTarget]=useState(null),[financeNotice,setFinanceNotice]=useState('');
 const actor={id:sessionMemberId,role:memberRole,manageRegistrations:can('admin.registrations')};
 const balance=creditBalance(ledger,sessionMemberId);
 const creditPanel=user?<MemberCredit balance={balance} entries={ledger.filter(entry=>entry.memberId===sessionMemberId)} memberNumber={currentMember.number}/>:null;
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer);},[]);
 const [selectedEventId,setSelectedEventId]=useState(()=>new URLSearchParams(window.location.search).get('event')||'winter-forest'),[fromRegistration,setFromRegistration]=useState(false);
 const selectedPublicEvent=publicCatalog.find(event=>event.id===selectedEventId&&event.status==='PUBLISHED'),selectedEvent=selectedPublicEvent||catalog[0],selectedState=eventState(selectedEvent,now);
 const [view,setView]=useState(()=>{const requested=new URLSearchParams(window.location.search).get('view');return ['signup','admin','profile','registrations','journal','detail'].includes(requested)?requested:'events';});
 const [modal,setModal]=useState(null),[menu,setMenu]=useState(false),[loginNext,setLoginNext]=useState(null),[records,setRecords]=useState([]),[current,setCurrent]=useState(null),[accessNotice,setAccessNotice]=useState('');
 const [demoRequested,setDemoRequested]=useState(()=>new URLSearchParams(window.location.search).get('demo')==='multiple'),[recordsNotice,setRecordsNotice]=useState('');
 const publicLinks=[{id:'events',name:'賽事列表'},{id:'journal',name:'定向專欄'},...(user?[{id:'registrations',name:'我的報名'},{id:'profile',name:'會員資料'}]:[{id:'signup',name:'會員註冊'}])].filter(link=>can(link.id));
 const navLinks=[...publicLinks,...(adminAllowed?[{id:'admin',name:'管理後台'}]:[])];
 function landing(role=memberRole){return ['events','journal','registrations','profile','signup'].find(id=>canViewScreen(roles,role,id))||(canEnterAdmin(roles,role)?'admin':'events');}
 useEffect(()=>{document.title=view==='admin'?'管理後台｜台灣定向':view==='journal'?'定向專欄｜台灣定向':view==='profile'?'會員資料管理｜台灣定向':view==='registrations'?'我的報名｜台灣定向':'台灣定向｜賽事報名';},[view]);
 function open(name,demo=demoRequested){setMenu(false);setAccessNotice('');if(name==='records-demo'){showRecordsDemo();return;}if(name==='records')name='registrations';if(['events','signup','admin','profile','registrations','journal'].includes(name)){setView(name);setModal(null);const next=new URL(window.location.href);for(const key of ['demo','article','event','section'])next.searchParams.delete(key);if(name==='journal')setSelectedArticleId(null);if(name==='events')next.searchParams.delete('view');else next.searchParams.set('view',name);if(name==='registrations'&&demo)next.searchParams.set('demo','multiple');window.history.replaceState(null,'',next.pathname+next.search);window.scrollTo(0,0);return;}setModal(name);}
 function readArticle(id){if(!can('journal'))return;open('journal');setSelectedArticleId(id);const next=new URL(window.location.href);next.searchParams.set('article',id);window.history.replaceState(null,'',next.pathname+next.search);}
 function showRecordsDemo(residency=user,member=profile){if(!can('registrations')){open('registrations');return;}const samples=createMultipleRecords(events,residency,member).map(record=>({...record,id:`${record.id}-${sessionMemberId}`,ownerId:sessionMemberId}));setRecords(previous=>[...previous,...samples.filter(sample=>!previous.some(record=>record.id===sample.id&&record.ownerId===sessionMemberId))]);setDemoRequested(true);setRecordsNotice('');open('registrations',true);}
 function editRecord(record){if(record.inactive)return;if(!can('register')||!can('registrations'))return;setCurrent(record);setModal('edit');}
 function selectEvent(event,fromRecords=false){if(!can('events')||!publicCatalog.some(item=>item.id===event.id&&item.status==='PUBLISHED'))return;setSelectedEventId(event.id);setFromRegistration(fromRecords);setMenu(false);setView('detail');setModal(null);const next=new URL(window.location.href);for(const key of ['article','demo','section'])next.searchParams.delete(key);next.searchParams.set('view','detail');next.searchParams.set('event',event.id);window.history.replaceState(null,'',next.pathname+next.search);window.scrollTo(0,0);}
 function requireLogin(next){if(!user){setLoginNext(next);setModal('login');return;}if(next==='register'&&!can('register')){setAccessNotice('目前角色未開放賽事報名畫面。');return;}open(next);}
 function save(value){
  if(!can('register')||!currentMember)throw new Error('請登入後再報名。');
  const previous=records.find(record=>record.id===value.id)||ownRecords.find(record=>record.id===value.id),edit=Boolean(previous);
  if(value.id&&!previous)throw new Error('找不到自己的報名紀錄。');
  const eventId=previous?.eventId||value.eventId||selectedEvent.id,event=catalog.find(item=>item.id===eventId);
  if(!event||eventState(event,now)!=='open')throw new Error('目前不在本場報名期間，請聯絡管理員。');
  const record={...previous,...value,ownerId:sessionMemberId,event:previous?.event||value.event||eventForList(event,now),eventId,profile:previous?.profile||{...profile},id:value.id||`DEMO-${crypto.randomUUID().slice(0,8).toUpperCase()}`,status:value.status||'報名完成(待確認帳款)'};
  const next=commitRegistration(registrationState,record,event,actor),saved=refreshRegistration(record,next.rows);
  setRegistrationState(next);setRecords(prev=>prev.some(record=>record.id===saved.id)?prev.map(r=>r.id===saved.id?saved:r):[...prev,saved]);setCurrent(saved);
  if(edit){setRecordsNotice(`${saved.event.name}（${saved.id}）已儲存修改。`);open('records');}else setModal('success');
 }
 function requestCancellation(ids,source='MEMBER_SELF'){
  if(!currentMember)return;
  const selected=rows.filter(row=>ids.includes(row.id)&&!row.cancelledAt&&!row.deletedAt);
  if(!selected.length){setRecordsNotice('沒有可取消的參賽者。');return;}
  if(selected.some(row=>!cancellationAllowed(actor,source,catalog.find(event=>event.id===row.eventId)))){
   const message=source==='ADMIN_BACKOFFICE'?'後台僅於報名截止後開放取消報名。':'已超過報名截止時間，請聯絡管理員取消。';
   setRecordsNotice(message);setFinanceNotice(message);return;
  }
  setCancelSource(source);setCancelTarget(ids);setFinanceNotice('');
 }
 function confirmCancellation(options){
  if(cancelTarget.some(id=>{const row=rows.find(item=>item.id===id);return !cancellationAllowed(actor,cancelSource,catalog.find(event=>event.id===row?.eventId));}))throw new Error(cancelSource==='ADMIN_BACKOFFICE'?'後台僅於報名截止後開放取消報名。':'已超過報名截止時間，請聯絡管理員取消。');
  const quote=cancellationQuote(registrationState,cancelTarget,actor,options.creditMemberId);
  const next=cancelParticipants(registrationState,cancelTarget,actor,{...options,members,source:cancelSource});
  setRegistrationState(next);setCancelTarget(null);const pending=quote.rows.filter(row=>row.payment==='BANK_TRANSFER'&&row.status==='PENDING').reduce((sum,row)=>sum+row.amount,0);
  const message=`已取消 ${quote.rows.length} 位參賽者，退回儲值金 NT$${quote.amount}。${pending>0?`尚有 NT$${pending} 待核款，確認後自動回存付款會員。`:''}`;
  setFinanceNotice(message);setRecordsNotice(message);
 }
 function reconcileAndCredit(id,reconciled,creditMemberId){
  const next=reconcileRegistration(registrationState,id,reconciled,actor,{members,creditMemberId});
  const returned=next.ledger.reduce((sum,entry)=>sum+entry.amount,0)-ledger.reduce((sum,entry)=>sum+entry.amount,0);
  setRegistrationState(next);setFinanceNotice(reconciled?`${id} 已完成整筆對帳${returned>0?`，取消項目已回存付款會員儲值金 NT$${returned}`:''}。`:`${id} 已取消對帳，回到待確認帳款。`);
 }
 const cancellationDialog=cancelTarget&&currentMember?<CancellationDialog state={registrationState} rowIds={cancelTarget} actor={actor} members={members} Dialog={Modal} onClose={()=>setCancelTarget(null)} onConfirm={confirmCancellation}/>:null;
 const inferredRecords=[...new Set(rows.filter(row=>row.ownerId===sessionMemberId).map(orderIdOf))].filter(id=>!records.some(record=>record.id===id)).map(id=>{const row=rows.find(row=>orderIdOf(row)===id),event=catalog.find(item=>item.id===row.eventId);return {id,ownerId:sessionMemberId,eventId:row.eventId,event:eventForList(event||catalog[0],now),mode:row.orderMode||'SINGLE',profile:{...profile,name:row.name||profile.name,nickname:row.nickname||profile.nickname},group:row.division,fee:row.fee,payment:row.payment,amount:row.amount,status:'報名完成'};});
 const ownRecords=[...records.filter(record=>record.ownerId===sessionMemberId),...inferredRecords].map(record=>refreshRegistration(record,rows));
 function saveProfile(value){if(!currentMember||!can('profile'))return;const patch=Object.fromEntries(['nickname','phone','emergencyName','emergencyPhone','social'].map(key=>[key,value[key]]));patch.division=value.division.split(' ').at(-1);setMembers(previous=>previous.map(member=>member.id===sessionMemberId?{...member,...patch,revision:member.revision+1}:member));}
 function submitFeedback(value){if(!currentMember)throw new Error('請登入會員後再提供意見回饋。');if(!can('feedback'))throw new Error('目前角色未開放意見回饋。');const record=createFeedback(value,optionSets.feedbackTypes,feedbackRecords,currentMember);setFeedbackRecords(previous=>[...previous,record]);return record;}
 const close=()=>setModal(null);
 function logout(){setSessionMemberId(null);setCancelTarget(null);setDemoRequested(false);setRecordsNotice('');setMenu(false);open(landing('GUEST'));}
 function loginAsMember(id,next=loginNext){const member=members.find(item=>item.id===id);if(!member)return;setSessionMemberId(id);if(id!==sessionMemberId){setDemoRequested(false);setRecordsNotice('');}setModal(null);const role=member.role;
  if(next==='records-demo'){if(canViewScreen(roles,role,'registrations')){setRecords(previous=>[...previous.filter(record=>record.ownerId!==id),...createMultipleRecords(events,member.residency,profileFor(member)).map(record=>({...record,id:`${record.id}-${id}`,ownerId:id}))]);setDemoRequested(true);}open('registrations',true);return;}
  if(next==='register'){if(canViewScreen(roles,role,'register')&&canViewScreen(roles,role,'events'))setModal('register');else{open(landing(role));setAccessNotice('目前角色未開放賽事報名畫面。');}return;}
  open(next&&next!=='landing'?next:landing(role));
 }
 const pageAllowed=view==='admin'?adminAllowed:can(view==='detail'?'events':view);
 const loginButton=()=>{setLoginNext(view==='signup'?'events':view==='admin'?'admin':null);setModal('login');};
 if(view==='admin'&&pageAllowed)return <><AdminWorkspace onReconcileRegistration={reconcileAndCredit} onCancelRegistration={row=>requestCancellation([row.id],'ADMIN_BACKOFFICE')} financeNotice={financeNotice} feedbackRecords={feedbackRecords} setFeedbackRecords={setFeedbackRecords} key={sessionMemberId} roles={roles} setRoles={setRoles} optionSets={optionSets} setOptionSets={setOptionSets} members={members} setMembers={setMembers} defaults={defaults} setDefaults={setDefaults} currentMemberId={sessionMemberId} onSwitchMember={id=>{const role=members.find(member=>member.id===id)?.role;loginAsMember(id,canEnterAdmin(roles,role)?'admin':'landing');}} historicalEvents={historicalEvents} setHistoricalEvents={setHistoricalEvents} onOpenHistorical={can('events')?selectEvent:undefined} catalog={catalog} setCatalog={setCatalog} rows={rows} setRows={setRows} savedOrders={savedOrders} setSavedOrders={setSavedOrders} articleRecords={articleRecords} setArticleRecords={setArticleRecords} onOpenArticle={can('journal')?readArticle:undefined} initialRole={memberRole} onExit={()=>open(landing())} onMemberMode={()=>open('profile')} Dialog={Modal}/>{cancellationDialog}</>;
 let content;
 if(!pageAllowed)content=<AccessDenied user={user} roleLabel={roleName(roles,memberRole)} onLogin={loginButton} onLogout={logout} links={navLinks} onOpen={open}/>;
 else if(view==='journal')content=<JournalPage categories={optionSets.articleCategories} articles={publishedArticles} articleId={selectedArticleId} onRead={readArticle} onBack={()=>open('journal')}/>;
 else if(view==='registrations')content=<MyRegistrations canCancel={record=>memberCanCancel(catalog.find(event=>event.id===record.eventId))} creditPanel={creditPanel} onCancel={(record,personId)=>requestCancellation(rows.filter(row=>orderIdOf(row)===record.id&&isActiveParticipant(row)&&(!personId||row.id===personId)).map(row=>row.id))} feeOptions={optionSets.registrationFees} records={ownRecords} defaultEvent={events[0]} onEdit={can('register')?editRecord:undefined} onBrief={can('events')?event=>selectEvent(event,true):undefined} onExplore={can('events')?()=>open('events'):undefined} onDemo={()=>showRecordsDemo()} notice={recordsNotice}/>;
 else if(view==='profile')content=<MemberProfile creditPanel={creditPanel} key={sessionMemberId} profile={profile} role={memberRole} roleLabel={roleName(roles,memberRole)} groups={profileGroups} onSave={saveProfile} onBack={can('events')?()=>open('events'):undefined} onRecords={can('registrations')?()=>open('records'):undefined} onAdmin={adminAllowed?()=>open('admin'):undefined}/>;
 else if(view==='signup')content=<SignupPage groups={activeGroups} onBack={()=>open(landing())} onLogin={()=>{setLoginNext('events');setModal('login');}}/>;
 else if(view==='events')content=<EventList onSelect={selectEvent} catalog={publicCatalog} now={now} mode={eventListMode} onModeChange={setEventListMode} month={calendarMonth} onMonthChange={setCalendarMonth} Dialog={Modal}/>;
 else if(!selectedPublicEvent)content=<main id="main" className="single-event-page"><button className="text-button" onClick={()=>open('events')}>返回賽事列表</button><h1>暫時無法查看此賽事</h1><p>此賽事尚未公開，或本次預覽資料已重設。</p></main>;
 else if(isHistoricalEvent(selectedEvent))content=<HistoricalEventDetail key={selectedEvent.id} event={selectedEvent} onBack={()=>open('events')} Dialog={Modal}/>;
 else content=<EventDetail key={selectedEvent.id} event={selectedEvent} state={selectedState} participation={publicEventData(selectedEvent,rows,savedOrders[selectedEvent.id],now)} user={user} fromRegistration={fromRegistration&&can('registrations')} onBack={()=>open(fromRegistration&&can('registrations')?'records':'events')} onRegister={!user||can('register')?()=>requireLogin('register'):undefined} Dialog={Modal}/>;
 return <><a href="#main" className="skip-link">跳至主要內容</a><header className="site-header"><button className="brand" onClick={()=>open(landing())} aria-label="台灣定向首頁"><Mountains size={49} weight="bold"/><span>台灣定向</span></button><nav className="desktop-nav" aria-label="主選單">{navLinks.map(link=><button key={link.id} aria-current={view===link.id?'page':undefined} onClick={()=>open(link.id)}>{link.name}</button>)}<button className="login-button" onClick={user?logout:loginButton}>{user?<><SignOut size={18}/>登出</>:'登入'}</button></nav><button className="icon-button mobile-menu" aria-expanded={menu} aria-controls="mobile-nav" aria-label={menu?'關閉選單':'開啟選單'} onClick={()=>setMenu(!menu)}>{menu?<X size={26}/>:<List size={26}/>}</button></header><div className="site-header-spacer" aria-hidden="true"/>
 {menu&&<nav id="mobile-nav" className="mobile-nav" aria-label="手機選單">{navLinks.map(link=><button key={link.id} aria-current={view===link.id?'page':undefined} onClick={()=>open(link.id)}>{link.name}</button>)}<button onClick={user?logout:loginButton}>{user?'登出示範帳號':'登入'}</button></nav>}
 {accessNotice&&<p className="access-alert" role="alert">{accessNotice}</p>}{content}<footer className="prototype-note">{(!user||can('feedback'))&&<div><button className="feedback-footer-button" onClick={()=>requireLogin('feedback')}><ChatCircleDots size={20}/>意見回饋</button></div>}UI／UX 互動範本 · 示範資料僅保留於本次預覽<nav className="preview-links" aria-label="畫面預覽">{can('signup')&&<a href="?view=signup" onClick={event=>{event.preventDefault();open('signup');}}>會員註冊畫面</a>}{can('profile')&&<a href="?view=profile" onClick={event=>{event.preventDefault();open('profile');}}>會員資料管理</a>}{can('registrations')&&<a href="?view=registrations&demo=multiple" onClick={event=>{event.preventDefault();showRecordsDemo();}}>多場報名畫面（示範）</a>}{adminAllowed&&<a href="?view=admin" onClick={event=>{event.preventDefault();open('admin');}}>管理後台畫面（預覽）</a>}</nav></footer>
 {cancellationDialog}
 {modal==='feedback'&&user&&can('feedback')&&<FeedbackForm memberNumber={currentMember.number} types={optionSets.feedbackTypes} onSubmit={submitFeedback} onClose={close} Dialog={Modal}/>}
 {modal==='login'&&<Modal title="登入，開始你的下一場定向" onClose={close}><p className="dialog-subtitle">選擇示範會員，預覽已指派角色的可見畫面。請勿輸入真實個資。</p><div className="login-options">{members.map(member=><button className={member.role==='ADMIN'?'primary':'secondary'} key={member.id} onClick={()=>loginAsMember(member.id)}>{member.nickname||member.name} · {roleName(roles,member.role)}{roles.find(role=>role.id===member.role)?.active===false?'（角色停用）':''}<ArrowRight size={18}/></button>)}</div>{can('signup')&&<button className="text-button" onClick={()=>open('signup')}>還沒有帳號？建立會員帳號</button>}</Modal>}
 {modal==='register'&&can('register')&&pageAllowed&&<Modal title={`報名${selectedEvent.name}`} onClose={close} wide><RegistrationForm balance={balance} existingRows={rows} ownerId={sessionMemberId} residencyOptions={optionSets.participantResidencies} groupCatalog={defaults.groups} optionSets={optionSets} profile={profile} user={user} eventInfo={eventForList(selectedEvent,now)} onSave={value=>save({...value,event:eventForList(selectedEvent,now),eventId:selectedEvent.id})}/></Modal>}
 {modal==='edit'&&can('register')&&can('registrations')&&<Modal title={`修改${current.event?.name||eventName}報名`} onClose={close} wide><RegistrationForm balance={balance} existingRows={rows} ownerId={sessionMemberId} residencyOptions={optionSets.participantResidencies} groupCatalog={defaults.groups} optionSets={optionSets} eventInfo={catalog.find(event=>event.id===current.eventId)} key={current.id} profile={profile} user={user} editing={current} onSave={save} onBack={()=>open('records')}/></Modal>}
 {modal==='success'&&can('register')&&<Modal title="你的森林之旅，準備出發" onClose={close}><div className="success-content"><CheckCircle size={56} weight="light"/><p className="success-status">{current.status}</p><p>示範報名編號 <strong>{current.id}</strong></p><div className="summary"><div><span>賽事</span><strong>{current.event?.name||eventName}</strong></div><div><span>組別</span><strong>{current.group}</strong></div><div><span>應繳金額</span><strong>{money(current.amount)}</strong></div></div><p className="hint">此為示範結果，未建立真實報名或寄送郵件。</p>{can('registrations')&&<button className="primary" onClick={()=>open('records')}>查看我的報名<ArrowRight size={20}/></button>}</div></Modal>}
 </>;
}
