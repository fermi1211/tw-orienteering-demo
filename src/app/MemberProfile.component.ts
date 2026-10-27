import {mobileError} from '../contact-validation.js';
import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { ArrowLeft, ArrowRight, UserCircle, LockSimple, CheckCircle, IdentificationCard, Phone, Flag } from './icon-symbols';
export const createDemoProfile: any = (residency = 'DOMESTIC', role = 'MEMBER') => ({
  name: role === 'ADMIN' ? '示範系統管理員' : role === 'MEMBER' ? '示範會員' : '示範管理員',
  email: role === 'ADMIN' ? 'admin@example.test' : role === 'MEMBER' ? 'runner@example.test' : 'manager@example.test',
  residency,
  nickname: role === 'MEMBER' ? '林間旅人' : '森林領隊',
  phone: '0900000000',
  emergencyName: '示範聯絡人',
  emergencyPhone: '0900000001',
  division: '公開組 OPEN',
  social: ''
});
@Component({selector:'demo-member-profile',standalone:true,imports:[ViewFragmentComponent, FormValue, IconComponent, MemberNavigation],host:{style:'display: contents'},templateUrl:'./MemberProfile.MemberProfile.html'})
export class MemberProfile extends ViewController {
validateContact(key:string){
 if(key!=='phone'&&key!=='emergencyPhone')return;
 const problem=mobileError(this.ui.draft[key],key==='phone'?'手機號碼':'緊急聯絡電話');
 this.ui.setErrors((previous:any)=>({...previous,[key]:problem}));
}
openWallet=()=>this.setPanel("wallet");
private _state_draft:any; private _ready_draft=false;
private setDraft=(next:any)=>{const value=typeof next==='function'?next(this._state_draft):next;if(!Object.is(value,this._state_draft)){this._state_draft=value;this.update();}};
private _state_errors:any; private _ready_errors=false;
private setErrors=(next:any)=>{const value=typeof next==='function'?next(this._state_errors):next;if(!Object.is(value,this._state_errors)){this._state_errors=value;this.update();}};
private _state_saved:any; private _ready_saved=false;
private setSaved=(next:any)=>{const value=typeof next==='function'?next(this._state_saved):next;if(!Object.is(value,this._state_saved)){this._state_saved=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    creditPanel,
    profile,
    role,
    roleLabel,
    groups,
    onSave,
    onBack,
    onRecords,
    onAdmin
  } = propsValue;
  if (!this._ready_draft) {
    const stateInitial: any = profile;
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
  if (!this._ready_saved) {
    const stateInitial: any = false;
    this._state_saved = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_saved = true;
  }
  const saved: any = this._state_saved;
  const setSaved: any = this.setSaved;
  const dirty: any = JSON.stringify(draft) !== JSON.stringify(profile);
  function change(key: any, value: any) {
    setDraft((previous: any) => ({
      ...previous,
      [key]: value
    }));
    setErrors((previous: any) => ({
      ...previous,
      [key]: null
    }));
    setSaved(false);
  }
  function submit(event: any) {
    event.preventDefault();
    const next: any = {
      ...draft,
      phone: draft.phone.trim(),
      emergencyName: draft.emergencyName.trim(),
      emergencyPhone: draft.emergencyPhone.trim(),
      nickname: draft.nickname.trim(),
      social: draft.social.trim()
    };
    const invalid: any = {};
    for (const key of ['phone', 'emergencyName', 'emergencyPhone', 'division']) if (!next[key]) invalid[key] = '請填寫此欄位。';
    for(const key of ['phone','emergencyPhone']){const problem=mobileError(next[key],key==='phone'?'手機號碼':'緊急聯絡電話');if(problem)invalid[key]=problem;}
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      setSaved(false);
      return;
    }
    onSave(next);
    setDraft(next);
    setSaved(true);
  }
  function field(key: any, label: any, optional = false) {
    return viewOwner.fragment("fragment3", {
      v0: label,
      v1: optional && viewOwner.fragment("fragment0", {}),
      v2: viewOwner.fragment("fragment1", {
        v0: draft[key],
        v1: key.toLowerCase().includes('phone') ? 'tel' : 'text',
        v2: key === 'phone' ? 'tel' : 'off',
        v3: (event: any) => change(key, event.target.value),
        v4: !optional,
        v5: Boolean(errors[key]),
        v6: errors[key] ? `profile-${key}-error` : undefined
      }),
      v3: errors[key] && viewOwner.fragment("fragment2", {
        v0: `profile-${key}-error`,
        v1: errors[key]
      })
    });
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,ArrowLeft,ArrowRight,UserCircle,LockSimple,CheckCircle,IdentificationCard,Phone,Flag,createDemoProfile,MemberProfile,creditPanel,profile,role,roleLabel,groups,onSave,onBack,onRecords,onAdmin,draft,setDraft,errors,setErrors,saved,setSaved,dirty,change,submit,field};
  return null;
}
}
