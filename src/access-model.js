import { initialFeedbackTypes } from './feedback-model.js';
export const screenCatalog = [
  {id:'events',name:'賽事列表與賽事資訊',area:'公開畫面',public:true},
  {id:'journal',name:'定向專欄與文章閱讀',area:'公開畫面',public:true},
  {id:'signup',name:'會員註冊',area:'公開畫面',public:true},
  {id:'feedback',name:'意見回饋送出',area:'會員畫面'},
  {id:'registrations',name:'我的報名',area:'會員畫面'},
  {id:'profile',name:'會員資料管理',area:'會員畫面'},
  {id:'register',name:'賽事報名與修改',area:'會員畫面'},
  {id:'admin.registrations',name:'報名名單管理',area:'後台畫面'},
  {id:'admin.events',name:'賽事管理',area:'後台畫面'},
  {id:'admin.history',name:'歷史賽事',area:'後台畫面'},
  {id:'admin.articles',name:'專欄文章管理',area:'後台畫面'},
  {id:'admin.exports',name:'名單與出發序',area:'後台畫面'},
  {id:'admin.settings',name:'參數設定',area:'後台畫面'},
  {id:'admin.tags',name:'會員標注',area:'後台畫面'},
  {id:'admin.feedback',name:'意見回饋管理',area:'後台畫面',adminOnly:true},
  {id:'admin.members',name:'會員主檔管理',area:'後台畫面',adminOnly:true},
  {id:'admin.roles',name:'角色與畫面權限',area:'後台畫面',adminOnly:true},
  {id:'admin.assignments',name:'會員角色指派',area:'後台畫面',adminOnly:true},
];
export const initialRoles = [
  {id:'GUEST',name:'未登入',active:true,system:true,screens:['events','journal','signup']},
  {id:'MEMBER',name:'一般會員',active:true,screens:['events','journal','registrations','profile','register','feedback']},
  {id:'MANAGER',name:'管理員',active:true,screens:screenCatalog.filter(page=>!page.adminOnly&&page.id!=='signup').map(page=>page.id)},
  {id:'ADMIN',name:'系統 admin',active:true,system:true,screens:screenCatalog.map(page=>page.id)},
];
export const initialOptionSets = {
  feedbackTypes:initialFeedbackTypes,
  participantResidencies:[{id:'DOMESTIC',name:'本國人',active:true},{id:'FOREIGN',name:'外國人',active:true}],
  registrationModes:[{id:'SINGLE',name:'單人報名',active:true},{id:'MULTI',name:'多人報名',active:true}],
  registrationFees:[{id:'SINGLE',name:'單次報名',active:true},{id:'MEMBER',name:'會員',active:true},{id:'LEGACY_PREPAID',name:'舊制已預繳',active:true}],
  articleCategories:['定向入門','讀圖技巧','參賽準備'].map(name=>({id:name,name,active:true})),
  memberLabels:[{id:'member',name:'會員',active:true},{id:'legacy-prepaid',name:'舊制已預繳',active:true}],
};
export const optionName=(options,id)=>options.find(option=>option.id===id)?.name || id || '未設定';
export const roleName=(roles,id)=>optionName(roles,id);
export function roleScreenAllowed(roleId,page) {return Boolean(page) && !(page.adminOnly&&roleId!=='ADMIN') && !(roleId==='GUEST'&&!page.public);}
export function canViewScreen(roles,roleId,screenId) {
  const role=roles.find(item=>item.id===roleId),page=screenCatalog.find(item=>item.id===screenId);
  return Boolean(role?.active && roleScreenAllowed(roleId,page) && role.screens?.includes(screenId));
}
export const canEnterAdmin=(roles,roleId)=>screenCatalog.some(page=>page.id.startsWith('admin.')&&canViewScreen(roles,roleId,page.id));
export function sanitizeRole(value) {
  const id=value.id;
  if(id==='ADMIN')return {...value,name:'系統 admin',active:true,system:true,screens:screenCatalog.map(page=>page.id)};
  return {...value,name:id==='GUEST'?'未登入':String(value.name||'').trim(),system:id==='GUEST',active:id==='GUEST'?true:Boolean(value.active),screens:[...new Set((value.screens||[]).filter(screen=>roleScreenAllowed(id,screenCatalog.find(page=>page.id===screen))))]};
}
export function optionErrors(options) {
  const names=options.map(option=>String(option.name||'').trim().toLocaleLowerCase());
  if(names.some(name=>!name))return ['請填寫完整名稱。'];
  if(new Set(names).size!==names.length)return ['名稱不可重複，包含停用項目。'];
  return [];
}
export function assignMemberRole(members,roles,targetId,nextRoleId,actorRole) {
  if(actorRole!=='ADMIN')throw new Error('只有 admin 可以指派角色。');
  const target=members.find(member=>member.id===targetId),role=roles.find(item=>item.id===nextRoleId);
  if(!target||target.role==='ADMIN'||!role?.active||['ADMIN','GUEST'].includes(nextRoleId))throw new Error('此角色無法指派，請選擇啟用中的會員角色。');
  return members.map(member=>member.id===targetId?{...member,role:nextRoleId}:member);
}
export function applyMemberLabels(member,selectedIds,definitions) {
  const existing=member.labelIds||[];
  const allowed=[...new Set(selectedIds)].filter(id=>definitions.some(label=>label.id===id&&(label.active||existing.includes(id))));
  return {...member,labelIds:allowed};
}
