import test from 'node:test';
import assert from 'node:assert/strict';
import { adminFeedback,createFeedback,feedbackErrors,feedbackTypeName,initialFeedbackTypes,setFeedbackResolved,FEEDBACK_DESCRIPTION_LIMIT } from '../src/feedback-model.js';
import { canViewScreen, initialRoles, sanitizeRole } from '../src/access-model.js';
const member={id:'member-1',number:'MBR-0001'};
const time='2026-10-26T02:30:00.000Z';
const draft={typeId:'BUG',description:'  手機報名遇到顯示問題\n請協助確認。  '};
test('new feedback requires an active category and a bounded nonempty description',()=>{
 for(const value of [{...draft,typeId:'missing'},{...draft,description:'  '},{...draft,description:'a'.repeat(FEEDBACK_DESCRIPTION_LIMIT+1)},{...draft,description:null}])assert.ok(Object.keys(feedbackErrors(value,initialFeedbackTypes)).length);
 assert.ok(feedbackErrors(draft,initialFeedbackTypes.map(type=>({...type,active:false}))).typeId);
 assert.throws(()=>createFeedback(draft,[]));assert.deepEqual(feedbackErrors(draft,initialFeedbackTypes),{});
});
test('submission retains only the two inputs and tracking metadata, starts open and numbers sequentially',()=>{
 const first=createFeedback({...draft,email:'private@example.test',name:'私密姓名',memberNumber:'FORGED',role:'ADMIN',status:'RESOLVED'},initialFeedbackTypes,[],member,time);
 assert.equal(first.memberNumber,'MBR-0001');assert.equal(first.memberId,'member-1');assert.throws(()=>createFeedback(draft,initialFeedbackTypes,[]));assert.throws(()=>createFeedback(draft,initialFeedbackTypes,[],{id:'no-number'}));
 assert.equal(first.status,'OPEN');assert.equal(first.number,1);assert.equal(first.description,draft.description.trim());assert.equal(first.resolvedAt,null);assert.deepEqual(first.statusHistory,[]);
 assert.equal('email'in first,false);assert.equal('name'in first,false);assert.equal('role'in first,false);
 const next=createFeedback(draft,initialFeedbackTypes,[first],member,time);assert.equal(next.number,2);assert.notEqual(next.id,first.id);
});
test('admin can resolve, reopen and retain history; repeated status updates do not duplicate history',()=>{
 const first=createFeedback(draft,initialFeedbackTypes,[],member,time),rows=[first],done=setFeedbackResolved(rows,first.id,true,'ADMIN',time);
 assert.equal(done[0].status,'RESOLVED');assert.equal(done[0].resolvedAt,time);assert.equal(first.status,'OPEN');assert.equal(done[0].statusHistory.length,1);
 const repeated=setFeedbackResolved(done,first.id,true,'ADMIN',time);assert.equal(repeated[0].statusHistory.length,1);
 const reopened=setFeedbackResolved(done,first.id,false,'ADMIN',time);assert.equal(reopened[0].status,'OPEN');assert.equal(reopened[0].resolvedAt,null);assert.equal(reopened[0].statusHistory.length,2);assert.equal(reopened[0].id,first.id);
});
test('non-admin cannot read records or change status even when a custom role requests feedback management',()=>{
 const rows=[createFeedback(draft,initialFeedbackTypes,[],member,time)];
 for(const role of ['GUEST','MEMBER','MANAGER','custom']){assert.throws(()=>adminFeedback(rows,role));assert.throws(()=>setFeedbackResolved(rows,rows[0].id,true,role));assert.equal(canViewScreen(initialRoles,role,'admin.feedback'),false);}
 const custom=sanitizeRole({id:'custom',name:'admin-like',active:true,screens:['admin.feedback']});assert.deepEqual(custom.screens,[]);
 assert.equal(canViewScreen(initialRoles,'ADMIN','admin.feedback'),true);
});
test('only signed-in roles have feedback permission; guest remains denied even if assigned',()=>{
 assert.equal(canViewScreen(initialRoles,'GUEST','feedback'),false);
 for(const role of ['MEMBER','MANAGER','ADMIN'])assert.equal(canViewScreen(initialRoles,role,'feedback'),true);
 const guest=initialRoles.map(role=>role.id==='GUEST'?{...role,screens:role.screens.filter(id=>id!=='feedback')}:role);assert.equal(canViewScreen(guest,'GUEST','feedback'),false);
});
test('renaming and disabling a category preserves old feedback and names while preventing new selection',()=>{
 const record=createFeedback(draft,initialFeedbackTypes,[],member,time),renamed=initialFeedbackTypes.map(type=>type.id==='BUG'?{...type,name:'錯誤回報',active:false}:type);
 assert.equal(feedbackTypeName(record,renamed),'錯誤回報');assert.equal(feedbackTypeName(record,[]),'問題回報');assert.ok(feedbackErrors(draft,renamed).typeId);assert.equal(adminFeedback([record],'ADMIN').length,1);
});
