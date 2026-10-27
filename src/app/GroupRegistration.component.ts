import {registrationFeeChoices,feeOptionIdOf} from '../event-options-model.js';
import {ConsentGate} from './consent-gate.component';
import {activityTermsText, consentError} from '../consent-model.js';
import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { ArrowRight, ArrowLeft, Plus, Trash, Users } from './icon-symbols';
import { orderTotals, validateParticipants } from "../registration-order-model.js";
import { WalletPaymentChoice } from "./MemberCredit.component";

@Component({selector:'demo-group-registration',standalone:true,imports:[ConsentGate, FormValue, IconComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./GroupRegistration.GroupRegistration.html'})
export class GroupRegistration extends ViewController {
 termsRead=false;
 consentAttempts=0;
 get consentContent(){return activityTermsText(this.props['eventInfo']);}
private _state_participants:any; private _ready_participants=false;
private setParticipants=(next:any)=>{const value=typeof next==='function'?next(this._state_participants):next;if(!Object.is(value,this._state_participants)){this._state_participants=value;this.update();}};
private _state_step:any; private _ready_step=false;
private setStep=(next:any)=>{const value=typeof next==='function'?next(this._state_step):next;if(!Object.is(value,this._state_step)){this._state_step=value;this.update();}};
private _state_last5:any; private _ready_last5=false;
private setLast5=(next:any)=>{const value=typeof next==='function'?next(this._state_last5):next;if(!Object.is(value,this._state_last5)){this._state_last5=value;this.update();}};
private _state_date:any; private _ready_date=false;
private setDate=(next:any)=>{const value=typeof next==='function'?next(this._state_date):next;if(!Object.is(value,this._state_date)){this._state_date=value;this.update();}};
private _state_consent:any; private _ready_consent=false;
private setConsent=(next:any)=>{const value=typeof next==='function'?next(this._state_consent):next;if(!Object.is(value,this._state_consent)){this._state_consent=value;this.update();}};
private _state_error:any; private _ready_error=false;
private setError=(next:any)=>{const value=typeof next==='function'?next(this._state_error):next;if(!Object.is(value,this._state_error)){this._state_error=value;this.update();}};
private _state_useWallet:any; private _ready_useWallet=false;
private setUseWallet=(next:any)=>{const value=typeof next==='function'?next(this._state_useWallet):next;if(!Object.is(value,this._state_useWallet)){this._state_useWallet=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    profile,
    eventInfo,
    editing,
    onSave,
    onBack,
    groups,
    feeOptions,
    residencyOptions,
    existingRows = [],
    ownerId,
    balance = 0
  } = propsValue;
  const choices: any = registrationFeeChoices(eventInfo,feeOptions,editing?.participants||[]);
  const make: any = () => ({
    id: `PERSON-${crypto.randomUUID().slice(0, 8)}`,
    name: '',
    group: groups[0],
    residency: '',
    fee: choices.find((o:any)=>o.active!==false)?.kind||'',
    feeOptionId:choices.find((o:any)=>o.active!==false)?.id||'',
    feeName:choices.find((o:any)=>o.active!==false)?.name||'',
    payment: choices.find((o:any)=>o.active!==false)?.kind === 'SINGLE' ? 'BANK_TRANSFER' : 'NOT_REQUIRED',
    amount:choices.find((o:any)=>o.active!==false)?.amount??0
  });
  if (!this._ready_participants) {
    const stateInitial: any = () => editing?.participants || [{
      ...make(),
      name: profile.nickname || profile.name,
      residency: profile.residency
    }];
    this._state_participants = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_participants = true;
  }
  const participants: any = this._state_participants;
  const setParticipants: any = this.setParticipants;
  if (!this._ready_step) {
    const stateInitial: any = 1;
    this._state_step = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_step = true;
  }
  const step: any = this._state_step;
  const setStep: any = this.setStep;
  if (!this._ready_last5) {
    const stateInitial: any = editing?.last5 || '';
    this._state_last5 = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_last5 = true;
  }
  const last5: any = this._state_last5;
  const setLast5: any = this.setLast5;
  if (!this._ready_date) {
    const stateInitial: any = editing?.date || '';
    this._state_date = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_date = true;
  }
  const date: any = this._state_date;
  const setDate: any = this.setDate;
  if (!this._ready_consent) {
    const stateInitial: any = false;
    this._state_consent = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_consent = true;
  }
  const consent: any = this._state_consent;
  const setConsent: any = this.setConsent;
  if (!this._ready_error) {
    const stateInitial: any = '';
    this._state_error = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_error = true;
  }
  const error: any = this._state_error;
  const setError: any = this.setError;
  if (!this._ready_useWallet) {
    const stateInitial: any = false;
    this._state_useWallet = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_useWallet = true;
  }
  const useWallet: any = this._state_useWallet;
  const setUseWallet: any = this.setUseWallet;
  const locked: any = Boolean(editing?.financialLocked),
    totals: any = orderTotals(participants),
    walletSelected: any = !editing && useWallet && totals.amount > 0 && balance >= totals.amount,
    bank: any = !walletSelected && participants.some((p: any) => p.payment === 'BANK_TRANSFER');
  const context: any = {
    requireResidency: true,
    existingRows,
    ownerId,
    eventId: eventInfo.id,
    orderId: editing?.id
  };
  function update(id: any, patch: any) {
    setParticipants((prev: any) => prev.map((p: any) => p.id === id ? {
      ...p,
      ...patch
    } : p));
    setUseWallet(false);
    setError('');
  }
  function feeChange(p:any,id:any){
    const choice=choices.find((option:any)=>option.id===id);
    const original=editing?.participants?.find((old:any)=>old.id===p.id&&feeOptionIdOf(old)===id);
    if(!choice||choice.active===false&&!original)return;
    update(p.id,{fee:choice.kind,feeOptionId:choice.id,feeName:original?.feeName||choice.name,amount:original?.amount??choice.amount,payment:choice.kind==='SINGLE'?'BANK_TRANSFER':'NOT_REQUIRED'});
  }
  function submit(e: any) {
    e.preventDefault();
    const invalid: any = validateParticipants(participants, groups, context);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (participants.some((p: any) => !choices.some((option: any) => option.id === feeOptionIdOf(p) && (option.active!==false||editing?.participants?.some((old:any)=>old.id===p.id&&feeOptionIdOf(old)===option.id))))) {
      setError('請選擇啟用的繳費方式。');
      return;
    }
    if (step === 1) {
      setStep(2);
      setError('');
      return;
    }
    if (!editing) {
      viewOwner.consentAttempts++;
      const consentProblem=consentError(viewOwner.termsRead,consent);
      if(consentProblem){setError(consentProblem);return;}
    }
    const submittedDate: any = String(new FormData(e.currentTarget).get('payment_date') || date);
    if (bank && (!/^\d{5}$/.test(last5) || !submittedDate)) {
      setError('請填寫完整五位轉出帳號末碼與繳款日期。');
      return;
    }
    try {
      onSave({
        ...editing,
        mode: 'MULTI',
        participants: participants.map((p: any) => ({
          ...p,
          name: p.name.trim(),
          payment: walletSelected && p.fee === 'SINGLE' ? 'WALLET' : p.payment
        })),
        group: `${participants.length} 位參賽者`,
        amount: totals.amount,
        fee: 'MULTI',
        payment: 'MIXED',
        last5: bank ? last5 : '',
        date: bank ? submittedDate : ''
      });
    } catch (e) {
      setError(e.message);
    }
  }
  const groupLabel: any = (group: any) => `${eventInfo.divisionCatalog?.find((item: any) => item.code === group)?.name || ''} ${group}`.trim();
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,ArrowRight,ArrowLeft,Plus,Trash,Users,orderTotals,validateParticipants,WalletPaymentChoice,GroupRegistration,profile,eventInfo,editing,onSave,onBack,groups,feeOptions,residencyOptions,existingRows,ownerId,balance,choices,make,participants,setParticipants,step,setStep,last5,setLast5,date,setDate,consent,setConsent,error,setError,useWallet,setUseWallet,locked,totals,walletSelected,bank,context,groupLabel,update,feeChange,submit};
  return null;
}
}
