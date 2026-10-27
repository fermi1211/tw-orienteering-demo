import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { CheckCircle, LockSimple, PencilSimple, Plus, ShieldCheck, UserCircle } from './icon-symbols';
import { assignMemberRole, canViewScreen, optionErrors, roleName, roleScreenAllowed, sanitizeRole, screenCatalog } from "../access-model.js";

@Component({selector:'demo-role-editor',standalone:true,imports:[ScreenDialog],host:{style:'display: contents'},templateUrl:'./RoleManagement.RoleEditor.html'})
export class RoleEditor extends ViewController {
private _state_draft:any; private _ready_draft=false;
private setDraft=(next:any)=>{const value=typeof next==='function'?next(this._state_draft):next;if(!Object.is(value,this._state_draft)){this._state_draft=value;this.update();}};
private _state_error:any; private _ready_error=false;
private setError=(next:any)=>{const value=typeof next==='function'?next(this._state_error):next;if(!Object.is(value,this._state_error)){this._state_error=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    initial,
    roles,
    onSave,
    onClose,
    Dialog
  } = propsValue;
  if (!this._ready_draft) {
    const stateInitial: any = initial;
    this._state_draft = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_draft = true;
  }
  const draft: any = this._state_draft;
  const setDraft: any = this.setDraft;
  if (!this._ready_error) {
    const stateInitial: any = '';
    this._state_error = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_error = true;
  }
  const error: any = this._state_error;
  const setError: any = this.setError;
  const areas: any = [...new Set(screenCatalog.map((page: any) => page.area))];
  function submit(event: any) {
    event.preventDefault();
    const next: any = sanitizeRole(draft),
      problems: any = optionErrors([...roles.filter((role: any) => role.id !== next.id), next]);
    if (problems.length) {
      setError(problems[0]);
      return;
    }
    onSave(next);
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,CheckCircle,LockSimple,PencilSimple,Plus,ShieldCheck,UserCircle,assignMemberRole,canViewScreen,optionErrors,roleName,roleScreenAllowed,sanitizeRole,screenCatalog,RoleEditor,RoleManagement,AssignmentEditor,MemberRoleAssignments,initial,roles,onSave,onClose,Dialog,draft,setDraft,error,setError,areas,submit};
  return null;
}
}

@Component({selector:'demo-role-management',standalone:true,imports:[ViewComponent, IconComponent],host:{style:'display: contents'},templateUrl:'./RoleManagement.RoleManagement.html'})
export class RoleManagement extends ViewController {
 permissionDraft:any[]=[];
 startMatrix(){this.permissionDraft=this.ui.roles.map((role:any)=>({...role,screens:[...role.screens]}));this.setPanel('matrix');}
 togglePermission(roleId:string,pageId:string,checked:boolean){this.permissionDraft=this.permissionDraft.map(role=>role.id===roleId?{...role,screens:checked?[...new Set([...role.screens,pageId])]:role.screens.filter((id:string)=>id!==pageId)}:role);this.update();}
 saveMatrix(){this.ui.setRoles(this.permissionDraft.map((role:any)=>this.ui.sanitizeRole(role)));this.ui.setNotice('畫面權限已儲存。');this.closePanel();}

private _state_editing:any; private _ready_editing=false;
private setEditing=(next:any)=>{const value=typeof next==='function'?next(this._state_editing):next;if(!Object.is(value,this._state_editing)){this._state_editing=value;this.update();}};
private _state_notice:any; private _ready_notice=false;
private setNotice=(next:any)=>{const value=typeof next==='function'?next(this._state_notice):next;if(!Object.is(value,this._state_notice)){this._state_notice=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    roles,
    setRoles,
    members,
    Dialog
  } = propsValue;
  if (!this._ready_editing) {
    const stateInitial: any = null;
    this._state_editing = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_editing = true;
  }
  const editing: any = this._state_editing;
  const setEditing: any = this.setEditing;
  if (!this._ready_notice) {
    const stateInitial: any = '';
    this._state_notice = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_notice = true;
  }
  const notice: any = this._state_notice;
  const setNotice: any = this.setNotice;
  function save(value: any) {
    const {
      isNew,
      ...role
    } = value;
    setRoles((previous: any) => isNew ? [...previous, role] : previous.map((item: any) => item.id === role.id ? role : item));
    setEditing(null);
    setNotice(`「${role.name}」權限已儲存。`);
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,CheckCircle,LockSimple,PencilSimple,Plus,ShieldCheck,UserCircle,assignMemberRole,canViewScreen,optionErrors,roleName,roleScreenAllowed,sanitizeRole,screenCatalog,RoleEditor,RoleManagement,AssignmentEditor,MemberRoleAssignments,roles,setRoles,members,Dialog,editing,setEditing,notice,setNotice,save};
  return null;
}
}

@Component({selector:'demo-assignment-editor',standalone:true,imports:[ScreenDialog],host:{style:'display: contents'},templateUrl:'./RoleManagement.AssignmentEditor.html'})
export class AssignmentEditor extends ViewController {
 saveRoles(event:Event){event.preventDefault();try{this.ui.onSave(this.ui.member.id,this.ui.role);this.ui.onClose();}catch(error:any){this.ui.setError(error.message);}}

private _state_role:any; private _ready_role=false;
private setRole=(next:any)=>{const value=typeof next==='function'?next(this._state_role):next;if(!Object.is(value,this._state_role)){this._state_role=value;this.update();}};
private _state_error:any; private _ready_error=false;
private setError=(next:any)=>{const value=typeof next==='function'?next(this._state_error):next;if(!Object.is(value,this._state_error)){this._state_error=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    member,
    roles,
    onSave,
    onClose,
    Dialog
  } = propsValue;
  if (!this._ready_role) {
    const stateInitial: any = member.roleIds || [member.role];
    this._state_role = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_role = true;
  }
  const role: any = this._state_role;
  const setRole: any = this.setRole;
  if (!this._ready_error) {
    const stateInitial: any = '';
    this._state_error = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_error = true;
  }
  const error: any = this._state_error;
  const setError: any = this.setError;
  const options: any = roles.filter((item: any) => !['ADMIN', 'GUEST'].includes(item.id) && (item.active || item.id === member.role));
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,CheckCircle,LockSimple,PencilSimple,Plus,ShieldCheck,UserCircle,assignMemberRole,canViewScreen,optionErrors,roleName,roleScreenAllowed,sanitizeRole,screenCatalog,RoleEditor,RoleManagement,AssignmentEditor,MemberRoleAssignments,member,roles,onSave,onClose,Dialog,role,setRole,error,setError,options};
  return null;
}
}

@Component({selector:'demo-member-role-assignments',standalone:true,imports:[ViewComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./RoleManagement.MemberRoleAssignments.html'})
export class MemberRoleAssignments extends ViewController {
 permissionSources(member:any,pageId:string){return (member.roleIds||[member.role]).filter((id:string)=>this.ui.canViewScreen(this.ui.roles,id,pageId)).map((id:string)=>this.ui.roleName(this.ui.roles,id)).join('、');}

 effectiveMember:any=null;
 closeEffective=()=>{this.effectiveMember=null;this.update();};

private _state_query:any; private _ready_query=false;
private setQuery=(next:any)=>{const value=typeof next==='function'?next(this._state_query):next;if(!Object.is(value,this._state_query)){this._state_query=value;this.update();}};
private _state_editing:any; private _ready_editing=false;
private setEditing=(next:any)=>{const value=typeof next==='function'?next(this._state_editing):next;if(!Object.is(value,this._state_editing)){this._state_editing=value;this.update();}};
private _state_notice:any; private _ready_notice=false;
private setNotice=(next:any)=>{const value=typeof next==='function'?next(this._state_notice):next;if(!Object.is(value,this._state_notice)){this._state_notice=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    members,
    setMembers,
    roles,
    actorRole,
    Dialog
  } = propsValue;
  if (!this._ready_query) {
    const stateInitial: any = '';
    this._state_query = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_query = true;
  }
  const query: any = this._state_query;
  const setQuery: any = this.setQuery;
  if (!this._ready_editing) {
    const stateInitial: any = null;
    this._state_editing = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_editing = true;
  }
  const editing: any = this._state_editing;
  const setEditing: any = this.setEditing;
  if (!this._ready_notice) {
    const stateInitial: any = '';
    this._state_notice = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_notice = true;
  }
  const notice: any = this._state_notice;
  const setNotice: any = this.setNotice;
  const shown: any = members.filter((member: any) => `${member.name} ${member.nickname} ${member.number}`.toLowerCase().includes(query.trim().toLowerCase()));
  function save(id: any, role: any) {
    const next: any = assignMemberRole(members, roles, id, role, actorRole);
    setMembers(next);
    setNotice(`已將 ${members.find((member: any) => member.id === id).number} 指派為「${roleName(roles, role)}」。`);
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,CheckCircle,LockSimple,PencilSimple,Plus,ShieldCheck,UserCircle,assignMemberRole,canViewScreen,optionErrors,roleName,roleScreenAllowed,sanitizeRole,screenCatalog,RoleEditor,RoleManagement,AssignmentEditor,MemberRoleAssignments,members,setMembers,roles,actorRole,Dialog,query,setQuery,editing,setEditing,notice,setNotice,shown,save};
  return null;
}
}
