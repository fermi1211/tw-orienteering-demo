export const FEEDBACK_DESCRIPTION_LIMIT = 1000;
export const initialFeedbackTypes = [
  {id:'BUG',name:'問題回報',active:true},
  {id:'FEATURE',name:'功能許願',active:true},
  {id:'IMPROVEMENT',name:'優化建議',active:true},
];
export function feedbackErrors(value,types){
  const errors={};
  if(!types.some(type=>type.id===value.typeId&&type.active))errors.typeId='請選擇目前開放的回饋類型。';
  if(typeof value.description!=='string'||!value.description.trim())errors.description='請填寫問題描述。';
  else if(value.description.trim().length>FEEDBACK_DESCRIPTION_LIMIT)errors.description=`問題描述請保持在 ${FEEDBACK_DESCRIPTION_LIMIT.toLocaleString()} 字元內。`;
  return errors;
}
export function createFeedback(value,types,records=[],member,now=new Date().toISOString()){
  if(!member?.id||!member?.number)throw new Error('請登入會員後再提供意見回饋。');
  const errors=feedbackErrors(value,types);
  if(Object.keys(errors).length)throw new Error(Object.values(errors)[0]);
  return {id:crypto.randomUUID(),memberId:member.id,memberNumber:member.number,number:records.reduce((max,item)=>Math.max(max,item.number),0)+1,typeId:value.typeId,typeNameSnapshot:types.find(type=>type.id===value.typeId).name,description:value.description.trim(),createdAt:now,status:'OPEN',resolvedAt:null,statusHistory:[]};
}
export function adminFeedback(records,role){if(role!=='ADMIN')throw new Error('只有 admin 可以查看意見回饋。');return records;}
export function setFeedbackResolved(records,id,resolved,role,now=new Date().toISOString()){
  adminFeedback(records,role);
  const status=resolved?'RESOLVED':'OPEN';
  return records.map(record=>record.id===id&&record.status!==status?{...record,status,resolvedAt:resolved?now:null,statusHistory:[...record.statusHistory,{from:record.status,to:status,actor:role,at:now}]}:record);
}
export const feedbackTypeName=(record,types)=>types.find(type=>type.id===record.typeId)?.name||record.typeNameSnapshot;
