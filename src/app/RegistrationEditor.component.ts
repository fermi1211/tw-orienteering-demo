import {registrationFeeChoices,singleEventFee,feeOptionIdOf} from '../event-options-model.js';
import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { initialDemoMembers } from "../demo-members.js";
import { ArrowRight, LockSimple, UserCircle, UserPlus } from './icon-symbols';
const fees: any = {
  MEMBER: '會員',
  LEGACY_PREPAID: '舊制已預繳',
  SINGLE: '單次報名'
};
const methods: any = {
  NOT_REQUIRED: '不需繳款資料',
  BANK_TRANSFER: '銀行轉帳',
  ONSITE: '現場繳費',
  ADMIN_CONFIRMED: '管理員確認已繳款',
  WALLET: '儲值金付款'
};
@Component({selector:'demo-registration-editor',standalone:true,imports:[FormValue, IconComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./RegistrationEditor.RegistrationEditor.html'})
export class RegistrationEditor extends ViewController {
private _state_source:any; private _ready_source=false;
private setSource=(next:any)=>{const value=typeof next==='function'?next(this._state_source):next;if(!Object.is(value,this._state_source)){this._state_source=value;this.update();}};
private _state_memberId:any; private _ready_memberId=false;
private setMemberId=(next:any)=>{const value=typeof next==='function'?next(this._state_memberId):next;if(!Object.is(value,this._state_memberId)){this._state_memberId=value;this.update();}};
private _state_division:any; private _ready_division=false;
private setDivision=(next:any)=>{const value=typeof next==='function'?next(this._state_division):next;if(!Object.is(value,this._state_division)){this._state_division=value;this.update();}};
private _state_fee:any; private _ready_fee=false;
private setFee=(next:any)=>{const value=typeof next==='function'?next(this._state_fee):next;if(!Object.is(value,this._state_fee)){this._state_fee=value;this.update();}};
private _state_payment:any; private _ready_payment=false;
private setPayment=(next:any)=>{const value=typeof next==='function'?next(this._state_payment):next;if(!Object.is(value,this._state_payment)){this._state_payment=value;this.update();}};
private _state_displayName:any; private _ready_displayName=false;
private setDisplayName=(next:any)=>{const value=typeof next==='function'?next(this._state_displayName):next;if(!Object.is(value,this._state_displayName)){this._state_displayName=value;this.update();}};
private _state_paidOption:any; private _ready_paidOption=false;
private setPaidOption=(next:any)=>{const value=typeof next==='function'?next(this._state_paidOption):next;if(!Object.is(value,this._state_paidOption)){this._state_paidOption=value;this.update();}};
private _state_errors:any; private _ready_errors=false;
private setErrors=(next:any)=>{const value=typeof next==='function'?next(this._state_errors):next;if(!Object.is(value,this._state_errors)){this._state_errors=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    serverError,
    initial,
    event,
    Dialog,
    onClose,
    onSave,
    memberCatalog = initialDemoMembers
  } = propsValue;
  const choices=registrationFeeChoices(event,[],initial?[initial]:[]);
  const guestFee=singleEventFee(event);
  if (!this._ready_source) {
    const stateInitial: any = 'MEMBER';
    this._state_source = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_source = true;
  }
  const source: any = this._state_source;
  const setSource: any = this.setSource;
  if (!this._ready_memberId) {
    const stateInitial: any = '';
    this._state_memberId = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_memberId = true;
  }
  const memberId: any = this._state_memberId;
  const setMemberId: any = this.setMemberId;
  if (!this._ready_division) {
    const stateInitial: any = initial?.division || event.divisions[0] || '';
    this._state_division = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_division = true;
  }
  const division: any = this._state_division;
  const setDivision: any = this.setDivision;
  if (!this._ready_fee) {
    const stateInitial: any = (initial&&feeOptionIdOf(initial))||guestFee?.id||choices[0]?.id||'';
    this._state_fee = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_fee = true;
  }
  const fee: any = this._state_fee;
  const setFee: any = this.setFee;
  if (!this._ready_payment) {
    const stateInitial: any = 'BANK_TRANSFER';
    this._state_payment = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_payment = true;
  }
  const payment: any = this._state_payment;
  const setPayment: any = this.setPayment;
  if (!this._ready_displayName) {
    const stateInitial: any = initial?.displayNameOverride || '';
    this._state_displayName = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_displayName = true;
  }
  const displayName: any = this._state_displayName;
  const setDisplayName: any = this.setDisplayName;
  if (!this._ready_paidOption) {
    const stateInitial: any = '';
    this._state_paidOption = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_paidOption = true;
  }
  const paidOption: any = this._state_paidOption;
  const setPaidOption: any = this.setPaidOption;
  if (!this._ready_errors) {
    const stateInitial: any = {};
    this._state_errors = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_errors = true;
  }
  const errors: any = this._state_errors;
  const setErrors: any = this.setErrors;
  const members: any = memberCatalog;
  const person: any = initial || members.find((member: any) => member.id === memberId),
    guest: any = initial ? initial.source === 'MANUAL_GUEST' : source === 'GUEST';
  const selected=choices.find((option:any)=>option.id===fee);
  const feeKind=selected?.kind;
  const divisionChoices=[...new Set([...event.divisions,...(initial?[initial.division]:[])])];
  const bank: any = !initial && !guest && feeKind === 'SINGLE' && payment === 'BANK_TRANSFER';
  function submit(e: any) {
    e.preventDefault();
    const data: any = new FormData(e.currentTarget),
      invalid: any = {};
    if (!initial && !guest && !person) invalid.member = '請選擇一位已註冊會員。';
    if(!initial&&guest&&!guestFee)invalid.fee='本場沒有可用的單次報名費用，請先設定報名費用。';
    if(!initial&&!guest&&(!selected||selected.active===false))invalid.fee='請選擇有效的報名費用。';
    if (!division) invalid.division = '請選擇參賽組別。';
    if (guest && !displayName.trim()) invalid.displayName = '請填寫姓名或顯示名稱。';
    if (!initial && guest && !paidOption) invalid.paidOption = '請選擇已繳款或現場繳費。';
    if (bank && !/^\d{5}$/.test(String(data.get('last5') || ''))) invalid.last5 = '請填寫完整五位數字，包含開頭的 0。';
    if (bank && !data.get('date')) invalid.date = '請填寫繳款日期。';
    if (!initial && !guest && !data.has('consent')) invalid.consent = '請確認已取得參賽者同意。';
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    if (initial) {
      onSave({
        ...initial,
        division,
        displayNameOverride: displayName.trim() || null
      });
      return;
    }
    if (guest) {
      onSave({
        source: 'MANUAL_GUEST',
        memberId: null,
        eventId: event.id,
        displayNameOverride: displayName.trim(),
        name: null,
        nickname: null,
        email: null,
        residency: null,
        division,
        fee: 'SINGLE',
        feeOptionId:guestFee.id,
        feeName:guestFee.name,
        payment: paidOption === 'PAID' ? 'ADMIN_CONFIRMED' : 'ONSITE',
        status: paidOption === 'PAID' ? 'MANUALLY_PAID' : 'ONSITE',
        amount: guestFee.amount,
        last5: '',
        date: '',
        bankVersion: null
      });
      return;
    }
    const method: any = feeKind === 'SINGLE' ? payment : 'NOT_REQUIRED';
    onSave({
      name: person.name,
      nickname: person.nickname,
      email: person.email,
      residency: person.residency,
      phone: person.phone,
      emergencyName: person.emergencyName,
      emergencyPhone: person.emergencyPhone,
      id: undefined,
      memberId: person.id,
      source: 'MANUAL_MEMBER',
      eventId: event.id,
      division,
      displayNameOverride: null,
      fee:feeKind,
      feeOptionId:selected.id,
      feeName:selected.name,
      payment: method,
      amount: selected.amount,
      last5: bank ? String(data.get('last5')) : '',
      date: bank ? String(data.get('date')) : '',
      bankVersion: bank ? '示範版本 1' : null,
      status: feeKind !== 'SINGLE' ? 'COMPLETED' : method === 'ONSITE' ? 'ONSITE' : 'PENDING',
      consentSource: 'ADMIN_RECORDED'
    });
  }
  const error: any = (key: any) => errors[key] && viewOwner.fragment("fragment0", {
    v0: `roster-${key}-error`,
    v1: errors[key]
  });
  const divisionField: any = viewOwner.fragment("fragment3", {
    v0: viewOwner.fragment("fragment2", {
      v0: true,
      v1: division,
      v2: (e: any) => setDivision(e.target.value),
      v3: [...new Set([...event.divisions, ...(initial ? [initial.division] : [])])].map((code: any) => viewOwner.fragment("fragment1", {
        v0: code
      }, code))
    }),
    v1: error('division')
  });
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,initialDemoMembers,ArrowRight,LockSimple,UserCircle,UserPlus,fees,methods,RegistrationEditor,serverError,initial,event,Dialog,onClose,onSave,memberCatalog,source,setSource,memberId,setMemberId,division,setDivision,fee,setFee,payment,setPayment,displayName,setDisplayName,paidOption,setPaidOption,errors,setErrors,members,person,guest,bank,choices,guestFee,selected,feeKind,divisionChoices,error,divisionField,submit};
  return null;
}
}
