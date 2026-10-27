export const baseFeeNames={MEMBER:'會員',LEGACY_PREPAID:'舊制已預繳',SINGLE:'單次報名'};
export const feeOptionIdOf=value=>value?.feeOptionId||value?.fee;

export function eventDivisionCatalog(event,defaults=[]){
  if(Array.isArray(event?.divisionCatalog))return event.divisionCatalog.map(group=>({...group}));
  const codes=event?.divisions||defaults.filter(group=>group.active!==false).map(group=>group.code);
  return codes.map(code=>({...defaults.find(group=>group.code===code),id:defaults.find(group=>group.code===code)?.id||code,code,name:defaults.find(group=>group.code===code)?.name||code,active:true}));
}

export function eventFeeCatalog(event,defaults=[]){
  if(Array.isArray(event?.feeCatalog))return event.feeCatalog.map(option=>({...option}));
  return Object.entries(event?.fees||{}).map(([kind,amount])=>({id:kind,kind,name:defaults.find(option=>option.id===kind)?.name||baseFeeNames[kind]||kind,amount,active:defaults.find(option=>option.id===kind)?.active!==false}));
}

export function registrationFeeChoices(event,defaults=[],previous=[]){
  const catalog=eventFeeCatalog(event,defaults),choices=catalog.filter(option=>option.active!==false);
  for(const item of previous){
    const id=feeOptionIdOf(item);
    if(!id||choices.some(option=>option.id===id))continue;
    const archived=catalog.find(option=>option.id===id);
    choices.push({...archived,id,kind:item.fee,name:item.feeName||archived?.name||baseFeeNames[item.fee]||item.fee,amount:item.amount,active:false});
  }
  return choices;
}

export function singleEventFee(event){
  const options=eventFeeCatalog(event).filter(option=>option.active!==false&&option.kind==='SINGLE');
  return options.find(option=>option.id==='SINGLE')||options[0];
}

export function legacyEventFees(catalog){
  return Object.fromEntries(Object.keys(baseFeeNames).flatMap(kind=>{
    const option=catalog.find(item=>item.active!==false&&item.kind===kind&&item.id===kind)||catalog.find(item=>item.active!==false&&item.kind===kind);
    return option?[[kind,option.amount]]:[];
  }));
}

export function eventOptionErrors(groups,fees,{published=false}={}){
  const errors=[],activeGroups=groups.filter(group=>group.active!==false),activeFees=fees.filter(fee=>fee.active!==false);
  if(activeGroups.some(group=>!group.code?.trim()||!group.name?.trim()))errors.push('請填寫每個參賽組別的代碼與名稱。');
  if(activeGroups.some(group=>group.code?.trim()&&!/^[A-Z0-9_-]+$/i.test(group.code.trim())))errors.push('組別代碼請使用英文字母、數字、連字號或底線。');
  const codes=groups.map(group=>group.code?.trim().toUpperCase()).filter(Boolean);
  if(new Set(codes).size!==codes.length)errors.push('參賽組別代碼不可重複，包含已刪除的組別。');
  if(activeFees.some(fee=>!fee.name?.trim()))errors.push('請填寫每個報名費用的名稱。');
  if(activeFees.some(fee=>!Number.isSafeInteger(fee.amount)||fee.amount<0))errors.push('報名費用必須是 0 或正整數。');
  if(fees.some(fee=>!Object.hasOwn(baseFeeNames,fee.kind)))errors.push('報名費用的付款規則無效。');
  if(new Set(fees.map(fee=>fee.id)).size!==fees.length||new Set(groups.map(group=>group.id)).size!==groups.length)errors.push('組別或費用識別碼重複。');
  const names=activeFees.map(fee=>fee.name?.normalize('NFKC').trim().toLocaleLowerCase()).filter(Boolean);
  if(new Set(names).size!==names.length)errors.push('報名費用名稱不可重複。');
  if(published&&!activeGroups.length)errors.push('發布賽事至少須有一個參賽組別。');
  if(published&&!activeFees.length)errors.push('發布賽事至少須有一個報名費用。');
  return errors;
}

export function validateFeeSnapshot(row,event,previous){
  const same=previous&&feeOptionIdOf(previous)===feeOptionIdOf(row)&&previous.fee===row.fee;
  const option=eventFeeCatalog(event).find(item=>item.id===feeOptionIdOf(row));
  if(!same&&(!option||option.active===false||option.kind!==row.fee))return '無效或已刪除的報名費用。';
  const expected=same?previous.amount:option.amount;
  if(!Number.isSafeInteger(row.amount)||row.amount<0||row.amount!==expected)return '報名金額已變更，請重新確認系統費用。';
  return '';
}
