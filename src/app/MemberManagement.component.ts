import {mobileError} from '../contact-validation.js';
import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { roleName } from "../access-model.js";
import { MemberLabels } from "./MemberTagging.component";
import { MagnifyingGlass, Users, UserCircle, PencilSimple, LockSimple, CheckCircle, IdentificationCard, Phone, Flag, ArrowCounterClockwise, ShieldCheck } from './icon-symbols';
import { memberFieldLabels } from "../demo-members.js";

@Component({selector:'demo-member-editor',standalone:true,imports:[FormValue, IconComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./MemberManagement.MemberEditor.html'})
export class MemberEditor extends ViewController {
validateContact(key:string){
 if(key!=='phone'&&key!=='emergencyPhone')return;
 const problem=mobileError(this.ui.draft[key],key==='phone'?'手機號碼':'緊急聯絡電話');
 this.ui.setErrors((previous:any)=>({...previous,[key]:problem}));
}
private _state_draft:any; private _ready_draft=false;
private setDraft=(next:any)=>{const value=typeof next==='function'?next(this._state_draft):next;if(!Object.is(value,this._state_draft)){this._state_draft=value;this.update();}};
private _state_errors:any; private _ready_errors=false;
private setErrors=(next:any)=>{const value=typeof next==='function'?next(this._state_errors):next;if(!Object.is(value,this._state_errors)){this._state_errors=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    member,
    roles,
    groups,
    Dialog,
    onClose,
    onSave
  } = propsValue;
  const initial: any = () => Object.fromEntries(Object.keys(memberFieldLabels).map((key: any) => [key, member[key] || '']));
  if (!this._ready_draft) {
    const stateInitial: any = initial;
    this._state_draft = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_draft = true;
  }
  const draft: any = this._state_draft;
  const setDraft: any = this.setDraft;
  if (!this._ready_errors) {
    const stateInitial: any = {};
    this._state_errors = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_errors = true;
  }
  const errors: any = this._state_errors;
  const setErrors: any = this.setErrors;
  const dirty: any = Object.keys(memberFieldLabels).some((key: any) => draft[key] !== String(member[key] || ''));
  const divisionOptions: any = [...groups.filter((group: any) => group.active || group.code === member.division)];
  if (!divisionOptions.some((group: any) => group.code === member.division)) divisionOptions.push({
    code: member.division,
    name: member.division,
    active: false
  });
  function change(key: any, value: any) {
    setDraft((previous: any) => ({
      ...previous,
      [key]: value
    }));
    setErrors((previous: any) => ({
      ...previous,
      [key]: undefined
    }));
  }
  function submit(e: any) {
    e.preventDefault();
    const changes: any = Object.fromEntries(Object.keys(memberFieldLabels).map((key: any) => [key, draft[key].trim()]));
    const invalid: any = {};
    for (const key of ['name', 'phone', 'emergencyName', 'emergencyPhone', 'division']) if (!changes[key]) invalid[key] = '請填寫此欄位。';
    for(const key of ['phone','emergencyPhone']){const problem=mobileError(changes[key],key==='phone'?'手機號碼':'緊急聯絡電話');if(problem)invalid[key]=problem;}
    if (changes.name.length > 100) invalid.name = '姓名請填寫 100 字以內。';
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    onSave(member.id, changes);
    onClose();
  }
  const field: any = (key: any, label: any, optional = false) => viewOwner.fragment("fragment3", {
    v0: label,
    v1: optional && viewOwner.fragment("fragment0", {}),
    v2: viewOwner.fragment("fragment1", {
      v0: draft[key],
      v1: !optional,
      v2: key.toLowerCase().includes('phone') ? 'tel' : 'text',
      v3: key === 'name' ? 100 : undefined,
      v4: (e: any) => change(key, e.target.value),
      v5: Boolean(errors[key]),
      v6: errors[key] ? `admin-member-${key}-error` : undefined
    }),
    v3: errors[key] && viewOwner.fragment("fragment2", {
      v0: `admin-member-${key}-error`,
      v1: errors[key]
    })
  });
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,roleName,MemberLabels,MagnifyingGlass,Users,UserCircle,PencilSimple,LockSimple,CheckCircle,IdentificationCard,Phone,Flag,ArrowCounterClockwise,ShieldCheck,memberFieldLabels,MemberEditor,MemberManagement,member,roles,groups,Dialog,onClose,onSave,initial,draft,setDraft,errors,setErrors,dirty,divisionOptions,field,change,submit};
  return null;
}
}

@Component({selector:'demo-member-management',standalone:true,imports:[ViewComponent, FormValue],host:{style:'display: contents'},templateUrl:'./MemberManagement.MemberManagement.html'})
export class MemberManagement extends ViewController {
private _state_q:any; private _ready_q=false;
private setQ=(next:any)=>{const value=typeof next==='function'?next(this._state_q):next;if(!Object.is(value,this._state_q)){this._state_q=value;this.update();}};
private _state_residency:any; private _ready_residency=false;
private setResidency=(next:any)=>{const value=typeof next==='function'?next(this._state_residency):next;if(!Object.is(value,this._state_residency)){this._state_residency=value;this.update();}};
private _state_memberRole:any; private _ready_memberRole=false;
private setMemberRole=(next:any)=>{const value=typeof next==='function'?next(this._state_memberRole):next;if(!Object.is(value,this._state_memberRole)){this._state_memberRole=value;this.update();}};
private _state_editing:any; private _ready_editing=false;
private setEditing=(next:any)=>{const value=typeof next==='function'?next(this._state_editing):next;if(!Object.is(value,this._state_editing)){this._state_editing=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    members,
    roles,
    labels,
    groups,
    Dialog,
    onSave
  } = propsValue;
  if (!this._ready_q) {
    const stateInitial: any = '';
    this._state_q = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_q = true;
  }
  const q: any = this._state_q;
  const setQ: any = this.setQ;
  if (!this._ready_residency) {
    const stateInitial: any = '';
    this._state_residency = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_residency = true;
  }
  const residency: any = this._state_residency;
  const setResidency: any = this.setResidency;
  if (!this._ready_memberRole) {
    const stateInitial: any = '';
    this._state_memberRole = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_memberRole = true;
  }
  const memberRole: any = this._state_memberRole;
  const setMemberRole: any = this.setMemberRole;
  if (!this._ready_editing) {
    const stateInitial: any = null;
    this._state_editing = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_editing = true;
  }
  const editing: any = this._state_editing;
  const setEditing: any = this.setEditing;
  const query: any = q.trim().toLocaleLowerCase();
  const visible: any = members.filter((person: any) => (!residency || person.residency === residency) && (!memberRole || (person.roleIds || [person.role]).includes(memberRole)) && (!query || [person.name, person.nickname, person.email, person.phone, person.number].join(' ').toLocaleLowerCase().includes(query)));
  const person: any = members.find((item: any) => item.id === editing);
  const groupName: any = (code: any) => {
    const group: any = groups.find((item: any) => item.code === code);
    return group ? `${group.name} ${code}` : code;
  };
  const editButton: any = (member: any) => viewOwner.fragment("fragment1", {
    v0: `編輯會員 ${member.number} ${member.name}`,
    v1: () => setEditing(member.id),
    v2: viewOwner.fragment("fragment0", {
      v0: PencilSimple,
      v1: {
        "size": 18
      }
    })
  });
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,roleName,MemberLabels,MagnifyingGlass,Users,UserCircle,PencilSimple,LockSimple,CheckCircle,IdentificationCard,Phone,Flag,ArrowCounterClockwise,ShieldCheck,memberFieldLabels,MemberEditor,MemberManagement,members,roles,labels,groups,Dialog,onSave,q,setQ,residency,setResidency,memberRole,setMemberRole,editing,setEditing,query,visible,person,groupName,editButton};
  return null;
}
}
