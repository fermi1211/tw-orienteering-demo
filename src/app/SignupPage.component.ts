import {ConsentGate} from './consent-gate.component';
import {DEFAULT_SIGNUP_NOTICE, consentError} from '../consent-model.js';
import {emailError,mobileError} from '../contact-validation.js';
import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { ArrowLeft, ArrowRight, CheckCircle, GoogleLogo, LockSimple } from './icon-symbols';
const empty: any = {
  name: '',
  email: '',
  phone: '',
  residency: '',
  nickname: '',
  password: '',
  emergencyName: '',
  emergencyPhone: '',
  division: '',
  social: ''
};
@Component({selector:'demo-signup-page',standalone:true,imports:[ConsentGate, FormValue, IconComponent, EventSummary],host:{style:'display: contents'},templateUrl:'./SignupPage.SignupPage.html'})
export class SignupPage extends ViewController {
 termsRead=false;
 consentAttempts=0;
 get consentContent(){return this.props['notice'] || DEFAULT_SIGNUP_NOTICE;}
validateContact(key:string){
 const problem=key==='email'?emailError(this.ui.data.email):key==='phone'?mobileError(this.ui.data.phone):key==='emergencyPhone'?mobileError(this.ui.data.emergencyPhone,'緊急聯絡電話'):null;
 if(problem!==null)this.ui.setErrors((previous:any)=>({...previous,[key]:problem}));
}
private _state_method:any; private _ready_method=false;
private setMethod=(next:any)=>{const value=typeof next==='function'?next(this._state_method):next;if(!Object.is(value,this._state_method)){this._state_method=value;this.update();}};
private _state_step:any; private _ready_step=false;
private setStep=(next:any)=>{const value=typeof next==='function'?next(this._state_step):next;if(!Object.is(value,this._state_step)){this._state_step=value;this.update();}};
private _state_data:any; private _ready_data=false;
private setData=(next:any)=>{const value=typeof next==='function'?next(this._state_data):next;if(!Object.is(value,this._state_data)){this._state_data=value;this.update();}};
private _state_errors:any; private _ready_errors=false;
private setErrors=(next:any)=>{const value=typeof next==='function'?next(this._state_errors):next;if(!Object.is(value,this._state_errors)){this._state_errors=value;this.update();}};
private _state_consent:any; private _ready_consent=false;
private setConsent=(next:any)=>{const value=typeof next==='function'?next(this._state_consent):next;if(!Object.is(value,this._state_consent)){this._state_consent=value;this.update();}};
private _state_complete:any; private _ready_complete=false;
private setComplete=(next:any)=>{const value=typeof next==='function'?next(this._state_complete):next;if(!Object.is(value,this._state_complete)){this._state_complete=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    groups,
    onBack,
    onLogin
  } = propsValue;
  if (!this._ready_method) {
    const stateInitial: any = 'EMAIL';
    this._state_method = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_method = true;
  }
  const method: any = this._state_method;
  const setMethod: any = this.setMethod;
  if (!this._ready_step) {
    const stateInitial: any = 1;
    this._state_step = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_step = true;
  }
  const step: any = this._state_step;
  const setStep: any = this.setStep;
  if (!this._ready_data) {
    const stateInitial: any = empty;
    this._state_data = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_data = true;
  }
  const data: any = this._state_data;
  const setData: any = this.setData;
  if (!this._ready_errors) {
    const stateInitial: any = {};
    this._state_errors = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_errors = true;
  }
  const errors: any = this._state_errors;
  const setErrors: any = this.setErrors;
  if (!this._ready_consent) {
    const stateInitial: any = false;
    this._state_consent = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_consent = true;
  }
  const consent: any = this._state_consent;
  const setConsent: any = this.setConsent;
  if (!this._ready_complete) {
    const stateInitial: any = false;
    this._state_complete = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_complete = true;
  }
  const complete: any = this._state_complete;
  const setComplete: any = this.setComplete;
  const update: any = (key: any) => (event: any) => {
    setData((previous: any) => ({
      ...previous,
      [key]: event.target.value
    }));
    setErrors((previous: any) => ({
      ...previous,
      [key]: ''
    }));
  };
  function useGoogle() {
    setMethod('GOOGLE');
    setData((previous: any) => ({
      ...previous,
      name: previous.name || '示範會員',
      email: emailError(previous.email) ? 'runner@example.test' : previous.email.trim(),
      password: ''
    }));
    setErrors({});
    setStep(2);
  }
  function submit(event: any) {
    event.preventDefault();
    const next: any = {};
    if (step === 1 || method === 'GOOGLE') {
      if (!data.name.trim()) next.name = '請填寫姓名。';
      const emailProblem=emailError(data.email),phoneProblem=mobileError(data.phone);
      if(emailProblem)next.email=emailProblem;
      if(phoneProblem)next.phone=phoneProblem;
      if (!data.residency) next.residency = '請選擇本國人或外國人。';
      if (method === 'EMAIL' && data.password.length < 8) next.password = '示範密碼請輸入至少 8 個字元。';
    }
    if (step === 2) {
      if (!data.emergencyName.trim()) next.emergencyName = '請填寫緊急聯絡人。';
      const emergencyProblem=mobileError(data.emergencyPhone,'緊急聯絡電話');
      if(emergencyProblem)next.emergencyPhone=emergencyProblem;
      if (!data.division) next.division = '請選擇預設報名組別。';
      viewOwner.consentAttempts++;
      const consentProblem=consentError(viewOwner.termsRead,consent);
      if(consentProblem)next.consent=consentProblem;
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    if (step === 1) {
      setStep(2);
      window.scrollTo(0, 0);
      return;
    }
    setData((previous: any) => ({
      ...previous,
      email:previous.email.trim(),phone:previous.phone.trim(),emergencyPhone:previous.emergencyPhone.trim(),
      password: ''
    }));
    setComplete(true);
    window.scrollTo(0, 0);
  }
  const field: any = (key: any, label: any, type = 'text', optional = false, placeholder = '') => viewOwner.fragment("fragment4", {
    v0: viewOwner.fragment("fragment1", {
      v0: `signup-${key}`,
      v1: label,
      v2: optional && viewOwner.fragment("fragment0", {})
    }),
    v1: viewOwner.fragment("fragment2", {
      v0: `signup-${key}`,
      v1: key,
      v2: type,
      v3: !optional,
      v4: placeholder,
      v5: data[key],
      v6: update(key),
      v7: Boolean(errors[key]),
      v8: errors[key] ? `error-${key}` : undefined
    }),
    v2: errors[key] && viewOwner.fragment("fragment3", {
      v0: `error-${key}`,
      v1: errors[key]
    })
  }, key);
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,ArrowLeft,ArrowRight,CheckCircle,GoogleLogo,LockSimple,empty,SignupPage,groups,onBack,onLogin,method,setMethod,step,setStep,data,setData,errors,setErrors,consent,setConsent,complete,setComplete,update,field,useGoogle,submit};
  return null;
}
}
