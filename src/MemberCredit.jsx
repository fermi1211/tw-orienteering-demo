import { useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight } from '@phosphor-icons/react';
import './member-credit.css';
export function WalletPaymentChoice({balance,amount,selected,onChange,available=true}){
 if(!available||amount<=0||balance<amount)return null;
 return <fieldset className="wallet-choice"><legend><Wallet size={20}/>儲值金付款</legend><p className="hint">可用 NT${balance} · 本次應繳 NT${amount}</p><label className={!selected?'radio-row selected':'radio-row'}><input type="radio" name="wallet-choice" checked={!selected} onChange={()=>onChange(false)}/><span>使用原付款方式</span></label><label className={selected?'radio-row selected':'radio-row'}><input type="radio" name="wallet-choice" checked={selected} onChange={()=>onChange(true)}/><span>使用儲值金全額付款</span><strong>NT${amount}</strong></label></fieldset>;
}
export function MemberCredit({balance,entries,memberNumber}){
 const [expanded,setExpanded]=useState(false);
 return <section className="member-credit" aria-label="我的儲值金"><header><div><p className="eyebrow">我的儲值金{memberNumber?` · ${memberNumber}`:''}</p><h2><Wallet size={25}/>NT${balance}</h2><p>取消已付款報名退回的金額，可在下次報名足額使用。</p></div><button className="secondary" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'收合明細':'查看收支明細'}</button></header>{expanded&&<div className="credit-entries">{entries.length?entries.slice().reverse().map(entry=><article key={entry.id}>{entry.amount>0?<ArrowDownLeft size={21}/>:<ArrowUpRight size={21}/>}<div><strong>{entry.kind==='CANCELLATION'?'取消報名退回':'報名付款'}{entry.participantName?` · ${entry.participantName}`:''}</strong><p>{entry.eventName||entry.orderId}</p><small>{new Date(entry.at).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false})}</small></div><span className={entry.amount>0?'credit-in':'credit-out'}>{entry.amount>0?'+':'-'}NT${Math.abs(entry.amount)}</span></article>):<p className="hint">目前沒有儲值金收支紀錄。</p>}</div>}</section>;
}
