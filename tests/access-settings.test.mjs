import test from 'node:test';
import assert from 'node:assert/strict';
import { applyMemberLabels, assignMemberRole, canEnterAdmin, canViewScreen, initialOptionSets, initialRoles, optionErrors, optionName, sanitizeRole, screenCatalog } from '../src/access-model.js';
import { initialDemoMembers } from '../src/demo-members.js';
import { normalizeArticle, saveArticleRecord, publicArticles } from '../src/article-model.js';

test('new, inactive, missing and unknown roles/screens deny access without fallback',()=>{
  const blank={id:'custom',name:'新角色',active:true,screens:[]},inactive={...blank,id:'inactive',active:false,screens:['events','admin.articles']};
  for(const id of ['custom','inactive','missing'])for(const page of screenCatalog)assert.equal(canViewScreen([...initialRoles,blank,inactive],id,page.id),false);
  assert.equal(canEnterAdmin([...initialRoles,inactive],'inactive'),false);
  assert.equal(canViewScreen(initialRoles,'MEMBER','unimplemented'),false);
});
test('guest cannot receive member or backend screens even if supplied in stored input',()=>{
  const guest=sanitizeRole({id:'GUEST',name:'未登入',active:false,screens:screenCatalog.map(page=>page.id)});
  assert.equal(guest.active,true);assert.deepEqual(guest.screens,['events','journal','signup']);
  assert.equal(canViewScreen([{...guest,screens:['profile','admin.members']}],'GUEST','profile'),false);
  assert.equal(canEnterAdmin([{...guest,screens:['admin.members']}],'GUEST'),false);
});
test('admin is retained with every screen checked; ordinary roles cannot grant admin-only management',()=>{
  const admin=sanitizeRole({id:'ADMIN',name:'renamed',active:false,screens:[]});
  assert.equal(admin.active,true);assert.equal(admin.name,'系統 admin');assert.equal(admin.screens.length,screenCatalog.length);
  const other=sanitizeRole({id:'custom',name:'系統 admin',active:true,screens:['admin.roles','admin.assignments','admin.members','admin.articles','admin.articles','unknown']});
  assert.deepEqual(other.screens,['admin.articles']);assert.equal(canViewScreen([other],'custom','admin.roles'),false);
});
test('checked screens alone control member and backend visibility',()=>{
  const role=sanitizeRole({id:'editor',name:'專欄編輯',active:true,screens:['journal','admin.articles']});
  assert.equal(canViewScreen([role],'editor','journal'),true);assert.equal(canEnterAdmin([role],'editor'),true);
  assert.equal(canViewScreen([role],'editor','events'),false);assert.equal(canViewScreen([role],'editor','admin.events'),false);
});
test('role assignment is admin-only and refuses guest, admin, disabled or unknown targets',()=>{
  const roles=[...initialRoles,{id:'editor',name:'編輯',active:true,screens:['journal']},{id:'inactive',name:'停用',active:false,screens:['events']}];
  for(const id of ['GUEST','ADMIN','inactive','missing'])assert.throws(()=>assignMemberRole(initialDemoMembers,roles,'member-1',id,'ADMIN'));
  assert.throws(()=>assignMemberRole(initialDemoMembers,roles,'member-admin','MEMBER','ADMIN'));
  assert.throws(()=>assignMemberRole(initialDemoMembers,roles,'member-1','editor','MANAGER'));
  const next=assignMemberRole(initialDemoMembers,roles,'member-1','editor','ADMIN');
  assert.equal(next[0].role,'editor');assert.equal(initialDemoMembers[0].role,'MEMBER');assert.equal(next[0].email,initialDemoMembers[0].email);
});
test('role deactivation preserves assignments but removes access immediately',()=>{
  const members=assignMemberRole(initialDemoMembers,initialRoles,'member-1','MANAGER','ADMIN');
  const roles=initialRoles.map(role=>role.id==='MANAGER'?{...role,active:false}:role);
  assert.equal(members[0].role,'MANAGER');assert.equal(canEnterAdmin(roles,members[0].role),false);assert.equal(canViewScreen(roles,members[0].role,'events'),false);
});
test('label assignments accept multiple active tags and preserve existing inactive tags only',()=>{
  const labels=[...initialOptionSets.memberLabels,{id:'old',name:'停用標籤',active:false}],member={...initialDemoMembers[0],labelIds:['old']};
  const next=applyMemberLabels(member,['member','legacy-prepaid','old','member','unknown'],labels);
  assert.deepEqual(next.labelIds,['member','legacy-prepaid','old']);assert.equal(next.role,member.role);assert.deepEqual(member.labelIds,['old']);
  const removed=applyMemberLabels(next,[],labels);assert.deepEqual(applyMemberLabels(removed,['old'],labels).labelIds,[]);
});
test('renaming tags/categories preserves stable associations and duplicate option names are rejected',()=>{
  const labels=initialOptionSets.memberLabels.map(label=>label.id==='member'?{...label,name:'年度會員'}:label);
  assert.equal(optionName(labels,'member'),'年度會員');assert.deepEqual(optionErrors([{name:' 同名 '},{name:'同名'}]),['名稱不可重複，包含停用項目。']);assert.ok(optionErrors([{name:' '}]).length);
});
test('new parameter category IDs survive draft and published article normalization',()=>{
  const category='option-new-category',draft={title:'新分類文章',category,content:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'內文'}]}]}};
  assert.equal(normalizeArticle(draft).category,category);
  const record=saveArticleRecord({id:'new'},draft,true);
  assert.equal(publicArticles([record])[0].category,category);
  assert.equal(optionName([{id:category,name:'新增的分類',active:false}],record.published.category),'新增的分類');
});

test('multiple assigned roles merge active screens and never bypass admin-only checks',()=>{
 const roles=[...initialRoles,{id:'editor',name:'編輯',active:true,screens:['admin.articles']},{id:'inactive',name:'停用',active:false,screens:['admin.events']},{id:'spoof',name:'假管理員',active:true,screens:['admin.roles']}];
 const next=assignMemberRole(initialDemoMembers,roles,'member-1',['MEMBER','editor'],'ADMIN');
 assert.deepEqual(next[0].roleIds,['MEMBER','editor']);
 assert.equal(canViewScreen(roles,next[0].roleIds,'profile'),true);
 assert.equal(canViewScreen(roles,next[0].roleIds,'admin.articles'),true);
 assert.equal(canEnterAdmin(roles,next[0].roleIds),true);
 assert.equal(canViewScreen(roles,['MEMBER','inactive'],'admin.events'),false);
 assert.equal(canViewScreen(roles,['MEMBER','spoof'],'admin.roles'),false);
 assert.throws(()=>assignMemberRole(initialDemoMembers,roles,'member-1',[],'ADMIN'));
 assert.throws(()=>assignMemberRole(initialDemoMembers,roles,'member-1',['MEMBER','ADMIN'],'ADMIN'));
});
