import { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, Trash, Users } from '@phosphor-icons/react';
import { orderTotals, validateParticipants } from './registration-order-model.js';
import { WalletPaymentChoice } from './MemberCredit.jsx';
import './group-registration.css';
export function GroupRegistration({profile,eventInfo,editing,onSave,onBack,groups,feeOptions,residencyOptions,existingRows=[],ownerId,balance=0}){
 const choices=feeOptions.filter(option=>option.active||editing?.participants?.some(p=>p.fee===option.id));
 const make=()=>({id:`PERSON-${crypto.randomUUID().slice(0,8)}`,name:'',group:groups[0],residency:'',fee:choices[0]?.id||'SINGLE',payment:choices[0]?.id==='SINGLE'?'BANK_TRANSFER':'NOT_REQUIRED',amount:eventInfo?.fees?.[choices[0]?.id||'SINGLE']??450});
 const [participants,setParticipants]=useState(()=>editing?.participants||[{...make(),name:profile.nickname||profile.name,residency:profile.residency}]);
 const [step,setStep]=useState(1),[last5,setLast5]=useState(editing?.last5||''),[date,setDate]=useState(editing?.date||''),[consent,setConsent]=useState(false),[error,setError]=useState(''),[useWallet,setUseWallet]=useState(false);
 const locked=Boolean(editing?.financialLocked),totals=orderTotals(participants),walletSelected=!editing&&useWallet&&totals.amount>0&&balance>=totals.amount,bank=!walletSelected&&participants.some(p=>p.payment==='BANK_TRANSFER');
 const context={requireResidency:true,existingRows,ownerId,eventId:eventInfo.id,orderId:editing?.id};
 function update(id,patch){setParticipants(prev=>prev.map(p=>p.id===id?{...p,...patch}:p));setUseWallet(false);setError('');}
 function feeChange(p,fee){update(p.id,{fee,amount:editing?.participants?.find(old=>old.id===p.id&&old.fee===fee)?.amount??eventInfo?.fees?.[fee]??(fee==='SINGLE'?450:0),payment:fee==='SINGLE'?'BANK_TRANSFER':'NOT_REQUIRED'});}
 function submit(e){
  e.preventDefault();const invalid=validateParticipants(participants,groups,context);if(invalid){setError(invalid);return;}
  if(participants.some(p=>!choices.some(option=>option.id===p.fee))){setError('請選擇啟用的繳費方式。');return;}
  if(step===1){setStep(2);setError('');return;}
  const submittedDate=String(new FormData(e.currentTarget).get('payment_date')||date);
  if(bank&&(!/^\d{5}$/.test(last5)||!submittedDate)){setError('請填寫完整五位轉出帳號末碼與繳款日期。');return;}
  if(!editing&&!consent){setError('請閱讀並同意活動告知。');return;}
  try{onSave({...editing,mode:'MULTI',participants:participants.map(p=>({...p,name:p.name.trim(),payment:walletSelected&&p.fee==='SINGLE'?'WALLET':p.payment})),group:`${participants.length} 位參賽者`,amount:totals.amount,fee:'MULTI',payment:'MIXED',last5:bank?last5:'',date:bank?submittedDate:''});}catch(e){setError(e.message);}
 }
 const groupLabel=group=>`${eventInfo.divisionCatalog?.find(item=>item.code===group)?.name||''} ${group}`.trim();
 return <form className="group-registration" onSubmit={submit} noValidate>
  <ol className="steps" aria-label="多人報名步驟"><li aria-current={step===1?'step':undefined}><span>1</span>參賽者資料</li><li aria-current={step===2?'step':undefined}><span>2</span>繳費與確認</li></ol>
  <div className="group-heading"><div><h3><Users size={21}/>一起出發，共 {participants.length} 人</h3><p className="hint">報名聯絡人：{profile.nickname||profile.name}</p></div>{step===1&&!locked&&<button className="secondary" type="button" onClick={()=>{setParticipants(prev=>[...prev,make()]);setError('');setUseWallet(false);}}><Plus size={18}/>新增參賽者</button>}</div>
  {step===1?<>
   <p className="hint">每位參賽者請各自選擇本國／外國人；同一會員在本賽事不能重複填寫相同名稱。{locked?'已付款的人數、費用或付款方式變更，請聯絡管理員。':'可直接修改下方資料。'}</p>
   <div className="group-table-scroll" tabIndex={0} role="region" aria-label="參賽者報名資料"><table className="group-table"><caption className="sr-only">多人報名資料</caption><thead><tr><th>序號</th><th>名稱</th><th>本國／外國人</th><th>報名組別</th><th>繳費方式</th>{!locked&&<th>操作</th>}</tr></thead><tbody>{participants.map((p,index)=><tr key={p.id}>
    <td className="participant-number">{index+1}</td>
    <td data-label="名稱"><input aria-label={`參賽者 ${index+1} 名稱`} required value={p.name} maxLength={80} onChange={e=>update(p.id,{name:e.target.value})}/></td>
    <td data-label="本國／外國人"><select aria-label={`參賽者 ${index+1} 本國／外國人`} required value={p.residency||''} onChange={e=>update(p.id,{residency:e.target.value,...(p.payment==='ONSITE'&&e.target.value==='DOMESTIC'?{payment:'BANK_TRANSFER'}:{})})}><option value="">請選擇</option>{residencyOptions.filter(option=>option.active||option.id===p.residency).map(option=><option value={option.id} key={option.id}>{option.name}</option>)}</select></td>
    <td data-label="報名組別"><select aria-label={`參賽者 ${index+1} 報名組別`} value={p.group} onChange={e=>update(p.id,{group:e.target.value})}>{groups.map(group=><option key={group} value={group}>{groupLabel(group)}</option>)}</select></td>
    <td data-label="繳費方式"><select aria-label={`參賽者 ${index+1} 繳費方式`} value={p.fee} disabled={locked} onChange={e=>feeChange(p,e.target.value)}>{choices.filter(f=>!locked||f.id===p.fee).map(f=><option key={f.id} value={f.id}>{f.name} · NT${f.id===p.fee?p.amount:eventInfo.fees[f.id]}</option>)}</select>{p.fee==='SINGLE'&&(p.payment==='WALLET'?<small>已使用儲值金付款</small>:p.residency==='FOREIGN'?<select aria-label={`參賽者 ${index+1} 付款方式`} value={p.payment} disabled={locked} onChange={e=>update(p.id,{payment:e.target.value})}><option value="BANK_TRANSFER">銀行轉帳</option><option value="ONSITE">現場繳費</option></select>:null)}</td>
    {!locked&&<td className="participant-actions"><button type="button" className="icon-button danger-text" aria-label={`刪除參賽者 ${index+1}`} onClick={()=>{setParticipants(prev=>prev.filter(item=>item.id!==p.id));setError('');setUseWallet(false);}}><Trash size={19}/></button></td>}
   </tr>)}</tbody></table></div>{!participants.length&&<p className="notice">尚無參賽者，請新增後繼續。</p>}
  </>:<>
   <div className="group-review">{participants.map((p,index)=><div key={p.id}><span>{index+1}. {p.name}<small>{groupLabel(p.group)} · {residencyOptions.find(option=>option.id===p.residency)?.name} · {choices.find(f=>f.id===p.fee)?.name}{walletSelected&&p.fee==='SINGLE'?'／儲值金':p.payment==='ONSITE'?'／現場繳費':p.payment==='WALLET'?'／儲值金':''}</small></span><strong>NT${p.amount}</strong></div>)}</div>
   <WalletPaymentChoice balance={balance} amount={totals.amount} selected={walletSelected} onChange={setUseWallet} available={!editing}/>
   <div className="group-totals"><div><span>應繳總額</span><strong>NT${totals.amount}</strong></div><div><span>本次合併轉帳</span><strong>NT${walletSelected?0:totals.bank}</strong></div>{(walletSelected||totals.wallet>0)&&<div><span>儲值金付款</span><strong>NT${walletSelected?totals.amount:totals.wallet}</strong></div>}{!walletSelected&&totals.onsite>0&&<div><span>另於現場繳費</span><strong>NT${totals.onsite}</strong></div>}</div>
   {walletSelected&&<p className="notice">將全額扣除儲值金，無需填寫轉帳資訊；付款後餘額 NT${balance-totals.amount}。</p>}
   {bank&&<><p className="notice">整筆報名共用一筆轉帳資料。正式收款帳戶待主辦提供，此預覽不收款。</p><div className="field-grid"><label className="field">轉出帳號後五碼<input inputMode="numeric" maxLength={5} value={last5} onChange={e=>setLast5(e.target.value.replace(/\D/g,''))}/></label><label className="field">繳款日期<input type="date" name="payment_date" defaultValue={date} onInput={e=>setDate(e.currentTarget.value)} onChange={e=>setDate(e.target.value)}/></label></div></>}
   {!editing&&<><details className="terms"><summary>閱讀示範活動告知</summary><p>請確認所有參賽者已同意報名。本範本不建立真實報名或收款。</p></details><label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>已取得所有參賽者同意並閱讀活動告知</label></>}
  </>}
  {error&&<p role="alert" className="form-error">{error}</p>}<div className="form-footer"><div><span className="hint">{participants.length} 位參賽者 · 應繳總額</span><strong>NT${totals.amount}</strong></div><button type="submit" className="primary">{step===1?'下一步':editing?'儲存修改':'確認多人報名'}<ArrowRight size={19}/></button></div>{step===2&&<button type="button" className="text-button back" onClick={()=>setStep(1)}><ArrowLeft size={18}/>返回修改參賽者</button>}{editing&&<button type="button" className="text-button back" onClick={onBack}>返回我的報名</button>}
 </form>;
}
