import { registrationClosed } from './event-export-model.js';
import { isActiveParticipant, orderFromRows, setOrderReconciliation, orderIdOf, paidParticipant, projectRegistration, updateOrderBank, validateParticipants } from './registration-order-model.js';
export const creditBalance=(ledger,memberId)=>ledger.filter(entry=>entry.memberId===memberId).reduce((sum,entry)=>sum+entry.amount,0);
export function memberCanCancel(event, now=Date.now()){
 const closes=event?.closes;
 if(!closes||event.kind==='HISTORICAL')return false;
 const cutoff=Date.parse(/(?:Z|[+-]\d{2}:\d{2})$/.test(closes)?closes:`${closes}+08:00`);
 return Number.isFinite(cutoff)&&Number(new Date(now))<cutoff;
}
const canManage=actor=>actor?.role==='ADMIN'||actor?.manageRegistrations===true;
const ensureMember=actor=>{if(!actor?.id)throw new Error('請先登入會員。');};
export function commitRegistration(state,record,event,actor,now=new Date().toISOString()){
 ensureMember(actor);if(record.ownerId!==actor.id)throw new Error('不可修改他人的報名。');
 if(record.eventId!==event.id)throw new Error('賽事資料不一致。');
 let projected=projectRegistration(record),old=state.rows.filter(row=>orderIdOf(row)===record.id);
 if(new Set(projected.map(row=>row.id)).size!==projected.length||projected.some(row=>state.rows.some(existing=>existing.id===row.id&&orderIdOf(existing)!==record.id)))throw new Error('參賽者編號衝突，請重新建立。');
 if(old.some(row=>row.ownerId!==actor.id))throw new Error('不可修改他人的報名。');
 const items=projected.map(row=>({name:row.nickname,group:row.division,residency:row.residency,payment:row.payment}));
 const invalid=validateParticipants(items,event.divisions,{requireResidency:true,existingRows:state.rows,ownerId:actor.id,eventId:event.id,orderId:record.id});if(invalid)throw new Error(invalid);
 if(old.some(row=>row.cancelledAt&&projected.some(next=>next.id===row.id)))throw new Error('已取消參賽者不能從編輯表單復原，請重新報名。');
 const oldActive=old.filter(isActiveParticipant),locked=oldActive.some(paidParticipant);
 if(locked&&(oldActive.length!==projected.length||oldActive.some(row=>!projected.some(next=>next.id===row.id&&next.amount===row.amount&&next.fee===row.fee&&next.payment===row.payment))))throw new Error('已付款的參賽人數、費用及付款方式請聯絡管理員處理；取消報名請使用取消功能。');
 for(const row of projected){const previous=old.find(item=>item.id===row.id);const expected=previous&&previous.fee===row.fee?previous.amount:event.fees[row.fee];if(!Number.isSafeInteger(row.amount)||row.amount<0||row.amount!==expected)throw new Error('報名金額已變更，請重新確認系統費用。');if(!['MEMBER','LEGACY_PREPAID','SINGLE'].includes(row.fee))throw new Error('無效費用類別。');if(row.fee!=='SINGLE'&&row.payment!=='NOT_REQUIRED')throw new Error('免繳款項目不可使用付款方式。');if(row.fee==='SINGLE'&&!['BANK_TRANSFER','ONSITE','WALLET'].includes(row.payment)&&!(previous?.payment==='ADMIN_CONFIRMED'&&row.payment===previous.payment))throw new Error('請選擇有效付款方式。');if(previous?.cancelledAt||previous?.deletedAt)throw new Error('停用參賽者不可從一般編輯表單修改。');}
 const bank=projected.some(row=>row.payment==='BANK_TRANSFER');if(bank&&(!/^\d{5}$/.test(record.last5)||!record.date))throw new Error('請填寫完整銀行轉帳資料。');
 let ledger=state.ledger;
 const walletRows=projected.filter(row=>row.payment==='WALLET'),walletDue=walletRows.reduce((sum,row)=>sum+row.amount,0),paymentKey=`wallet-pay:${record.id}`;
 const existingDebit=ledger.find(entry=>entry.key===paymentKey);
 if(walletRows.length&&existingDebit&&walletRows.some(row=>!old.some(previous=>previous.id===row.id&&!previous.cancelledAt&&previous.payment==='WALLET'&&previous.status==='WALLET_PAID')))throw new Error('原儲值金付款不能支付新增參賽者，請另建報名。');
 if(walletRows.length&&!existingDebit){
  if(projected.some(row=>row.fee==='SINGLE'&&row.payment!=='WALLET'))throw new Error('儲值金須支付整筆應繳金額，不提供部分混付。');
  if(walletDue<=0||creditBalance(ledger,actor.id)<walletDue)throw new Error('儲值金餘額不足，請改用原付款方式。');
  ledger=[...ledger,{id:crypto.randomUUID(),key:paymentKey,memberId:actor.id,amount:-walletDue,kind:'PAYMENT',orderId:record.id,eventId:event.id,eventName:event.name,actorId:actor.id,at:now}];
 }
 projected=projected.map(row=>{const previous=old.find(item=>item.id===row.id);return {...previous,...row,source:previous?.source||row.source,...(previous&&previous.payment===row.payment&&previous.amount===row.amount?{status:previous.status}:{})};});
 const removed=oldActive.filter(row=>!projected.some(next=>next.id===row.id));
 const retained=state.rows.filter(row=>!projected.some(next=>next.id===row.id)).map(row=>removed.some(item=>item.id===row.id)?{...row,recordState:'REMOVED',removedAt:now}:row);
 return {rows:bank?updateOrderBank([...retained,...projected],record.id,{last5:record.last5,date:record.date},actor.id):[...retained,...projected],ledger};
}
export function cancellationQuote(state,rowIds,actor,creditMemberId){
 ensureMember(actor);const selected=state.rows.filter(row=>rowIds.includes(row.id));if(!selected.length)throw new Error('找不到報名紀錄。');
 if(selected.some(row=>(row.ownerId||row.memberId)!==actor.id)&&!canManage(actor))throw new Error('不可取消他人的報名。');
 if(selected.some(row=>!Number.isSafeInteger(row.amount)||row.amount<0))throw new Error('報名金額無效，請先核對帳務。');
 const rows=selected.filter(row=>!row.cancelledAt),credits=rows.filter(paidParticipant).map(row=>({rowId:row.id,memberId:row.ownerId||row.memberId||(canManage(actor)?creditMemberId:null),amount:row.amount}));
 if(credits.some(entry=>!entry.memberId))throw new Error('本筆未關聯付款會員，請管理員先指定儲值金入帳會員。');
 return {rows,credits,amount:credits.reduce((sum,entry)=>sum+entry.amount,0)};
}
export function cancellationAllowed(actor,source,event,now=Date.now()){
 if(!actor?.id)return false;
 return source==='ADMIN_BACKOFFICE'?canManage(actor)&&Boolean(event)&&registrationClosed(event,Number(new Date(now))):source==='MEMBER_SELF'&&memberCanCancel(event,now);
}
function settleCancelledCredits(state,actor,{members=[],creditMemberId,now=new Date().toISOString()}={}){
 const refundable=state.rows.filter(row=>row.cancelledAt&&paidParticipant(row)&&!row.creditReturned);
 const ledger=[...state.ledger];
 const patches=new Map();
 for(const row of refundable){
  if(!Number.isSafeInteger(row.amount)||row.amount<0)throw new Error('報名金額無效，請先核對帳務。');
  const memberId=row.ownerId||row.memberId||row.creditMemberId||creditMemberId;
  if(!members.some(member=>member.id===memberId))throw new Error('入帳會員不存在，請指定原付款會員。');
  const key=`cancel:${row.id}`;
  if(!ledger.some(entry=>entry.key===key))ledger.push({id:crypto.randomUUID(),key,memberId,amount:row.amount,kind:'CANCELLATION',orderId:orderIdOf(row),rowId:row.id,eventId:row.eventId,eventName:row.eventName||'',participantName:row.displayNameOverride||row.nickname||row.name,actorId:actor.id,at:now});
  patches.set(row.id,{creditReturned:row.amount,creditMemberId:memberId,creditedAt:now});
 }
 return {rows:state.rows.map(row=>patches.has(row.id)?{...row,...patches.get(row.id)}:row),ledger};
}
export function cancelParticipants(state,rowIds,actor,{reason='',creditMemberId,members=[],source=canManage(actor)?'ADMIN_BACKOFFICE':'MEMBER_SELF',now=new Date().toISOString()}={}){
 if(!['ADMIN_BACKOFFICE','MEMBER_SELF'].includes(source)||source==='ADMIN_BACKOFFICE'&&!canManage(actor))throw new Error('沒有後台取消權限。');
 const quote=cancellationQuote(state,rowIds,actor,creditMemberId);if(!quote.rows.length)return state;
 if(source==='MEMBER_SELF'&&quote.rows.some(row=>(row.ownerId||row.memberId)!==actor.id))throw new Error('不可自行取消他人的報名。');
 if(quote.credits.some(entry=>!members.some(member=>member.id===entry.memberId)))throw new Error('入帳會員不存在，無法取消已付款報名。');
 const ids=new Set(quote.rows.map(row=>row.id));
 const rows=state.rows.map(row=>ids.has(row.id)?{...row,recordState:'CANCELLED',cancelledAt:now,cancellationSource:source,cancellationReason:reason.trim(),cancelledBy:actor.id,creditReturned:0,creditMemberId:row.ownerId||row.memberId||creditMemberId||null}:row);
 const scoped={rows:rows.filter(row=>ids.has(row.id)),ledger:state.ledger};
 const settled=settleCancelledCredits(scoped,actor,{members,creditMemberId,now});
 return {rows:rows.map(row=>settled.rows.find(item=>item.id===row.id)||row),ledger:settled.ledger};
}
export function reconcileRegistration(state,id,reconciled,actor,{members=[],creditMemberId,now=new Date().toISOString()}={}){
 ensureMember(actor);if(!canManage(actor))throw new Error('沒有管理對帳的權限。');
 const order=orderFromRows(state.rows,id);if(!order)throw new Error('找不到報名紀錄。');
 if(!reconciled&&order.all.some(row=>row.payment==='BANK_TRANSFER'&&row.creditReturned>0))throw new Error('本筆銀行款已回存儲值金，無法取消對帳。');
 const rows=setOrderReconciliation(state.rows,id,reconciled,actor.id,now);
 if(!reconciled)return {...state,rows};
 const scoped=settleCancelledCredits({rows:rows.filter(row=>orderIdOf(row)===id),ledger:state.ledger},actor,{members,creditMemberId,now});
 return {rows:rows.map(row=>scoped.rows.find(item=>item.id===row.id)||row),ledger:scoped.ledger};
}
