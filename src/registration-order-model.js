const feeSnapshot=value=>({...value?.feeOptionId?{feeOptionId:value.feeOptionId}:{},...value?.feeName?{feeName:value.feeName}:{}});
export const orderIdOf=row=>row.orderId||row.id;
export const paymentStatusText={PENDING:'報名完成(待確認帳款)',RECONCILED:'報名完成(已完成對帳)',COMPLETED:'報名完成',ONSITE:'報名完成(現場繳費)',MANUALLY_PAID:'報名完成(已繳款)',WALLET_PAID:'報名完成(儲值金付款)',CANCELLED:'已取消報名'};
export const isActiveParticipant=row=>!row.deletedAt&&!row.cancelledAt&&!row.removedAt&&!['DELETED','DUPLICATE','CANCELLED','REMOVED'].includes(row.recordState||row.record_state);
export const normalizedParticipantName=name=>String(name||'').normalize('NFKC').trim().replace(/\s+/gu,' ').toLocaleLowerCase();
export const paidParticipant=row=>row.amount>0&&((row.payment==='BANK_TRANSFER'&&row.status==='RECONCILED')||(row.payment==='ADMIN_CONFIRMED'&&row.status==='MANUALLY_PAID')||(row.payment==='WALLET'&&row.status==='WALLET_PAID'));
export function orderTotals(participants){return participants.reduce((total,p)=>({amount:total.amount+Number(p.amount||0),bank:total.bank+(p.payment==='BANK_TRANSFER'?Number(p.amount||0):0),onsite:total.onsite+(p.payment==='ONSITE'?Number(p.amount||0):0),wallet:total.wallet+(p.payment==='WALLET'?Number(p.amount||0):0)}),{amount:0,bank:0,onsite:0,wallet:0});}
export const isBankReconciliationRow=row=>row.payment==='BANK_TRANSFER'&&!row.removedAt&&(row.recordState||row.record_state)!=='REMOVED'&&(!row.cancelledAt||row.status==='PENDING');
export function orderFromRows(rows,id){
 const all=rows.filter(row=>orderIdOf(row)===id);if(!all.length)return null;
 const billable=all.filter(row=>!row.cancelledAt&&!row.removedAt&&!['CANCELLED','REMOVED'].includes(row.recordState||row.record_state));
 const participants=billable.filter(isActiveParticipant),bankRows=all.filter(isBankReconciliationRow);
 const status=!billable.length?'CANCELLED':bankRows.some(row=>row.status==='PENDING')?'PENDING':bankRows.length?'RECONCILED':billable.some(row=>row.payment==='WALLET')?'WALLET_PAID':billable.some(row=>row.payment==='ONSITE')?'ONSITE':billable.some(row=>row.payment==='ADMIN_CONFIRMED')?'MANUALLY_PAID':'COMPLETED';
 return {id,participants,all,...orderTotals(billable),bankRows,bank:orderTotals(bankRows).bank,canReconcile:bankRows.some(row=>row.status==='PENDING'),canUndoReconciliation:bankRows.length>0&&bankRows.every(row=>row.status==='RECONCILED')&&!all.some(row=>row.payment==='BANK_TRANSFER'&&row.creditReturned>0),pendingCreditAmount:bankRows.filter(row=>row.cancelledAt&&row.status==='PENDING').reduce((sum,row)=>sum+row.amount,0),originalAmount:orderTotals(all).amount,returned:all.reduce((sum,row)=>sum+(row.creditReturned||0),0),status,last5:(bankRows[0]||all.find(row=>row.payment==='BANK_TRANSFER'))?.last5||'',date:(bankRows[0]||all.find(row=>row.payment==='BANK_TRANSFER'))?.date||'',ownerName:all[0].orderOwnerName?.trim()||all[0].nickname?.trim()||all[0].name||'無會員聯絡人'};
}
/** Match the roster's order IDs while retaining complete order accounting. */
export function ordersForRoster(rows,matchingRows,eventId){
 const eventRows=rows.filter(row=>row.eventId===eventId);
 const ids=[...new Set(matchingRows.filter(row=>row.eventId===eventId).map(orderIdOf))];
 return ids.map(id=>orderFromRows(eventRows,id)).filter(Boolean);
}
export function setOrderReconciliation(rows,id,reconciled,actor='管理員',now=new Date().toISOString()){
 const order=orderFromRows(rows,id);if(!order||!order.bankRows.length||(!reconciled&&!order.canUndoReconciliation))return rows;
 const status=reconciled?'RECONCILED':'PENDING';return rows.map(row=>orderIdOf(row)===id&&isBankReconciliationRow(row)&&row.status!==status?{...row,status,reconciliationHistory:[...(row.reconciliationHistory||[]),{from:row.status,to:status,actor,at:now}]}:row);
}
export function updateOrderBank(rows,id,patch,actor='會員'){return rows.map(row=>{if(orderIdOf(row)!==id||!isBankReconciliationRow(row)||(row.last5===patch.last5&&row.date===patch.date))return row;return {...row,...patch,bankHistory:[...(row.bankHistory||[]),{before:{last5:row.last5,date:row.date},after:patch,actor,at:new Date().toISOString()}]};});}
export function projectRegistration(record){
 const participants=record.participants||[{id:record.id,name:record.profile?.nickname||record.profile?.name,group:record.group,...feeSnapshot(record),fee:record.fee,payment:record.payment,amount:record.amount,residency:record.profile?.residency}];
 return participants.map(p=>({id:p.id||record.id,orderId:record.id,orderMode:record.mode||'SINGLE',ownerId:record.ownerId,orderOwnerName:record.profile?.nickname||record.profile?.name,eventId:record.eventId,eventName:record.event?.name||'',source:record.mode==='MULTI'?'GROUP':'MEMBER',name:record.mode==='MULTI'?null:record.profile?.name,nickname:p.name,email:record.profile?.email,residency:p.residency,division:p.group.split(' ').at(-1),fee:p.fee,...feeSnapshot(p),payment:p.payment,amount:p.amount,last5:p.payment==='BANK_TRANSFER'?record.last5:'',date:p.payment==='BANK_TRANSFER'?record.date:'',status:p.payment==='WALLET'?'WALLET_PAID':p.payment==='BANK_TRANSFER'?(record.status?.includes('已完成對帳')?'RECONCILED':'PENDING'):p.payment==='ONSITE'?'ONSITE':'COMPLETED'}));
}
export function refreshRegistration(record,rows){
 const order=orderFromRows(rows,record.id);if(!order)return record;
 const person=row=>({id:row.id,name:row.displayNameOverride||row.nickname||row.name,group:row.division,fee:row.fee,...feeSnapshot(row),payment:row.payment,amount:row.amount,residency:row.residency,status:row.status,creditReturned:row.creditReturned||0,pendingCredit:row.cancelledAt&&row.payment==='BANK_TRANSFER'&&row.status==='PENDING',cancelledAt:row.cancelledAt,cancellationSource:row.cancellationSource});
 return {...record,...(record.mode!=='MULTI'?feeSnapshot(order.participants[0]):{}),amount:order.amount,originalAmount:order.originalAmount,creditReturned:order.returned,pendingCreditAmount:order.pendingCreditAmount,bankAmount:order.bank,onsiteAmount:order.onsite,walletAmount:order.wallet,inactive:!order.participants.length,financialLocked:order.all.some(row=>isActiveParticipant(row)&&paidParticipant(row)),last5:order.last5,date:order.date,status:paymentStatusText[order.status],cancelledParticipants:order.all.filter(row=>row.cancelledAt).map(person),participants:record.mode==='MULTI'?order.participants.map(person):undefined,payment:record.mode==='MULTI'?'MIXED':order.participants[0]?.payment||record.payment,group:record.mode==='MULTI'?`${order.participants.length} 位參賽者`:order.participants[0]?.division||record.group};
}
export function validateParticipants(participants,groups,context={}){
 if(!participants.length)return '請至少新增一位參賽者。';
 if(participants.some(p=>!p.name?.trim()))return '請填寫每位參賽者的名稱。';
 if(participants.some(p=>!groups.includes(p.group)))return '請為每位參賽者選擇有效組別。';
 if(context.requireResidency&&participants.some(p=>!['DOMESTIC','FOREIGN'].includes(p.residency)))return '請為每位參賽者選擇本國人或外國人。';
 if(participants.some(p=>p.payment==='ONSITE'&&p.residency!=='FOREIGN'&&context.requireResidency))return '本國人單次報名須使用銀行轉帳或足額儲值金。';
 const names=new Set();
 for(const person of participants){const key=normalizedParticipantName(person.name);if(names.has(key))return `參賽者「${person.name.trim()}」姓名重複，請先修正。`;names.add(key);}
 if(context.ownerId&&context.eventId){const existing=(context.existingRows||[]).filter(row=>isActiveParticipant(row)&&row.eventId===context.eventId&&(row.ownerId||row.memberId)===context.ownerId&&!(context.orderId&&orderIdOf(row)===context.orderId));for(const row of existing){if(names.has(normalizedParticipantName(row.displayNameOverride||row.nickname||row.name)))return `同一會員在本賽事已有參賽者「${row.displayNameOverride||row.nickname||row.name}」，不可重複報名。`;}}
 return '';
}
