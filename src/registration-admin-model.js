import { registrationClosed } from './event-export-model.js';
export const isManualRegistration=row=>['MANUAL_MEMBER','MANUAL_GUEST'].includes(row.source);
export const cancellationSourceLabel=row=>row.cancellationSource==='ADMIN_BACKOFFICE'?'管理員後台取消':row.cancellationSource==='MEMBER_SELF'?'參賽者自行取消':'舊紀錄未記載來源';
export function adminRegistrationActions(row,event,now=Date.now()){
 const available=!row.cancelledAt&&!row.deletedAt&&!row.removedAt;
 return {canDelete:available&&isManualRegistration(row),canCancel:available&&Boolean(event)&&registrationClosed(event,now)};
}
export function softDeleteManualRegistration(rows,id,reason,actor,now=new Date().toISOString()){
 if(!actor?.id||!(actor.role==='ADMIN'||actor.manageRegistrations))throw new Error('沒有管理報名的權限。');
 const row=rows.find(item=>item.id===id);
 if(!row||!isManualRegistration(row)||row.cancelledAt||row.removedAt)throw new Error('只有後台新增的有效報名可刪除。');
 if(!reason?.trim())throw new Error('請填寫刪除原因。');
 return rows.map(item=>item.id===id?{...item,deletedAt:now,deleteReason:reason.trim(),deletedBy:actor.id}:item);
}
