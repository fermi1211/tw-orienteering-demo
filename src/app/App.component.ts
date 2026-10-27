import {registrationFeeChoices,feeOptionIdOf} from '../event-options-model.js';
import {ConsentGate} from './consent-gate.component';
import {activityTermsText, consentError} from '../consent-model.js';
import {AuthDialog} from './auth-dialog.component';
import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { MemberCredit, WalletPaymentChoice } from "./MemberCredit.component";
import { CancellationDialog } from "./CancellationDialog.component";
import { cancelParticipants, cancellationQuote, commitRegistration, creditBalance, memberCanCancel, cancellationAllowed, reconcileRegistration } from "../member-credit-model.js";
import { FeedbackForm } from "./Feedback.component";
import { createFeedback } from "../feedback-model.js";
import { GroupRegistration } from "./GroupRegistration.component";
import { projectRegistration, refreshRegistration, isActiveParticipant, orderIdOf } from "../registration-order-model.js";
import { initialDemoMembers, memberFieldLabels } from "../demo-members.js";
import { canEnterAdmin, canViewScreen, initialOptionSets, initialRoles, roleName } from "../access-model.js";
import { EventList } from "./EventList.component";
import { HistoricalEventDetail } from "./HistoricalEventDetail.component";
import { initialHistoricalEvents, isHistoricalEvent, publicHistoricalEvent } from "../historical-event-model.js";
import { currentCalendarMonth } from "../event-calendar-model.js";
import { JournalPage } from "./JournalPage.component";
import { initialArticles, publicArticles } from "../article-model.js";
import { MyRegistrations, createMultipleRecords, isReconciledRecord } from "./MyRegistrations.component";
import { MemberProfile, createDemoProfile } from "./MemberProfile.component";
import { SignupPage } from "./SignupPage.component";
import { EventDetail } from "./EventDetail.component";
import { AdminWorkspace, initialDefaults, initialEvents, initialRegistrationRows } from "./AdminWorkspace.component";
import { eventForList, eventState, publicEventData } from "../public-event-model.js";
import { Mountains, CalendarBlank, List, X, ArrowRight, ArrowLeft, CheckCircle, SignOut, UserCircle, ChatCircleDots } from './icon-symbols';
const groups: any = ['男子菁英組 ME', '女子菁英組 WE', '男子進階組 MA', '女子進階組 WA', '公開組 OPEN'];
const fees: any = [{
  key: 'MEMBER',
  title: '會員',
  amount: 0
}, {
  key: 'LEGACY_PREPAID',
  title: '舊制已預繳',
  amount: 0
}, {
  key: 'SINGLE',
  title: '單次報名',
  amount: 450
}];
const eventName: any = '冬日森林定向賽';
const money: any = (n: any) => `NT$${n}`;
const events: any = [{
  id: 'winter-forest',
  name: eventName,
  date: '2026-12-13',
  displayDate: '12.13',
  dateFull: '2026 年 12 月 13 日',
  location: '新北市 · 林口',
  deadline: '12.06',
  deadlineFull: '2026 年 12 月 6 日',
  state: 'open'
}, {
  id: 'city-park',
  name: '城市公園定向賽',
  date: '2026-12-20',
  displayDate: '12.20',
  dateFull: '2026 年 12 月 20 日',
  location: '台北市',
  deadline: '12.13',
  deadlineFull: '2026 年 12 月 13 日',
  state: 'upcoming'
}, {
  id: 'mountain-trail',
  name: '山林探索定向賽',
  date: '2026-12-27',
  displayDate: '12.27',
  dateFull: '2026 年 12 月 27 日',
  location: '桃園市',
  deadline: '12.20',
  deadlineFull: '2026 年 12 月 20 日',
  state: 'upcoming'
}];
@Component({selector:'demo-modal',standalone:true,imports:[ViewFragmentComponent, ElementBinding, IconComponent],host:{style:'display: contents'},templateUrl:'./App.Modal.html'})
export class Modal extends ViewController {
private _resource_ref:any;
private _resource_titleId:any;
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    title,
    onClose,
    children,
    wide = false
  } = propsValue;
  const ref: any = this._resource_ref ??= {
    current: null
  };
  const titleId: any = this._resource_titleId ??= 'field-' + crypto.randomUUID();
  this.scheduleEffect(0, () => {
    const el: any = ref.current;
    el.showModal();
    const before: any = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      el.close();
      document.body.style.overflow = before;
    };
  }, []);
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,MemberCredit,WalletPaymentChoice,CancellationDialog,cancelParticipants,cancellationQuote,commitRegistration,creditBalance,memberCanCancel,cancellationAllowed,reconcileRegistration,FeedbackForm,createFeedback,GroupRegistration,projectRegistration,refreshRegistration,isActiveParticipant,orderIdOf,initialDemoMembers,memberFieldLabels,canEnterAdmin,canViewScreen,initialOptionSets,initialRoles,roleName,EventList,HistoricalEventDetail,initialHistoricalEvents,isHistoricalEvent,publicHistoricalEvent,currentCalendarMonth,JournalPage,initialArticles,publicArticles,MyRegistrations,createMultipleRecords,isReconciledRecord,MemberProfile,createDemoProfile,SignupPage,EventDetail,AdminWorkspace,initialDefaults,initialEvents,initialRegistrationRows,eventForList,eventState,publicEventData,Mountains,CalendarBlank,List,X,ArrowRight,ArrowLeft,CheckCircle,SignOut,UserCircle,ChatCircleDots,groups,fees,eventName,money,events,Modal,SingleRegistrationForm,RegistrationForm,AccessDenied,App,title,onClose,children,wide,ref,titleId};
  return null;
}
}

@Component({selector:'demo-single-registration-form',standalone:true,imports:[ConsentGate, FormValue, IconComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./App.SingleRegistrationForm.html'})
export class SingleRegistrationForm extends ViewController {
 termsRead=false;
 consentAttempts=0;
 get consentContent(){return activityTermsText(this.props['eventInfo']);}
private _state_step:any; private _ready_step=false;
private setStep=(next:any)=>{const value=typeof next==='function'?next(this._state_step):next;if(!Object.is(value,this._state_step)){this._state_step=value;this.update();}};
private _state_group:any; private _ready_group=false;
private setGroup=(next:any)=>{const value=typeof next==='function'?next(this._state_group):next;if(!Object.is(value,this._state_group)){this._state_group=value;this.update();}};
private _state_fee:any; private _ready_fee=false;
private setFee=(next:any)=>{const value=typeof next==='function'?next(this._state_fee):next;if(!Object.is(value,this._state_fee)){this._state_fee=value;this.update();}};
private _state_payment:any; private _ready_payment=false;
private setPayment=(next:any)=>{const value=typeof next==='function'?next(this._state_payment):next;if(!Object.is(value,this._state_payment)){this._state_payment=value;this.update();}};
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
    user,
    profile,
    onSave,
    editing = null,
    onBack,
    eventInfo,
    feeOptions = initialOptionSets.registrationFees,
    balance = 0
  } = propsValue;
  const groupCodes=[...new Set([...(eventInfo?.divisions||[]),...(editing?[editing.group.split(' ').at(-1)]:[])])];
  const choices=registrationFeeChoices(eventInfo,feeOptions,editing?[editing]:[]);
  const availableGroups: any = groupCodes.length?groupCodes.map((code: any) => `${eventInfo.divisionCatalog?.find((group: any) => group.code === code)?.name || {
    ME: '男子菁英組',
    WE: '女子菁英組',
    MA: '男子進階組',
    WA: '女子進階組',
    OPEN: '公開組'
  }[code] || code} ${code}`):groups;
  if (!this._ready_step) {
    const stateInitial: any = 1;
    this._state_step = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_step = true;
  }
  const step: any = this._state_step;
  const setStep: any = this.setStep;
  if (!this._ready_group) {
    const stateInitial: any = editing && availableGroups.find((group: any) => group.split(' ').at(-1) === editing.group.split(' ').at(-1)) || editing?.group || (availableGroups.includes(profile.division) ? profile.division : availableGroups[0]);
    this._state_group = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_group = true;
  }
  const group: any = this._state_group;
  const setGroup: any = this.setGroup;
  if (!this._ready_fee) {
    const stateInitial: any = (editing&&feeOptionIdOf(editing)) || choices[0]?.id || '';
    this._state_fee = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_fee = true;
  }
  const fee: any = this._state_fee;
  const setFee: any = this.setFee;
  if (!this._ready_payment) {
    const stateInitial: any = editing?.payment || 'BANK_TRANSFER';
    this._state_payment = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_payment = true;
  }
  const payment: any = this._state_payment;
  const setPayment: any = this.setPayment;
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
  const chosen:any=choices.find((option:any)=>option.id===fee);
  const selected:any={...chosen,title:editing?.feeName||chosen?.name||'未選擇費用'};
  const feeKind=chosen?.kind;
  const formEvent:any=eventInfo||editing?.event||events[0],
    amount:any=editing?.amount??chosen?.amount??0,
    walletSelected:any=!editing&&feeKind==='SINGLE'&&useWallet&&amount>0&&balance>=amount,
    walletPayment:any=walletSelected||payment==='WALLET',
    bank:any=feeKind==='SINGLE'&&payment==='BANK_TRANSFER'&&!walletSelected;
  function submit(e: any) {
    e.preventDefault();
    const submittedDate: any = new FormData(e.currentTarget).get('payment_date') || date;
    if (!editing && !choices.some((option: any) => option.id === fee && option.active!==false)) {
      setError('目前沒有可選的繳費方式。');
      return;
    }
    if (step === 1 && !editing) {
      setStep(2);
      return;
    }
    if (!editing) {
      viewOwner.consentAttempts++;
      const consentProblem=consentError(viewOwner.termsRead,consent);
      if(consentProblem){setError(consentProblem);return;}
    }
    if (bank && !/^\d{5}$/.test(last5)) {
      setError('請輸入完整的五位數字，包含開頭的 0。');
      return;
    }
    if (bank && !submittedDate) {
      setError('請選擇繳款日期。');
      return;
    }
    try {
      onSave({
        ...editing,
        group,
        fee:feeKind,
        feeOptionId:fee,
        feeName:selected.title,
        payment: feeKind === 'SINGLE' ? walletSelected ? 'WALLET' : payment : 'NOT_REQUIRED',
        amount,
        last5: bank ? last5 : '',
        date: bank ? submittedDate : '',
        id: editing?.id
      });
    } catch (e) {
      setError(e.message);
    }
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,MemberCredit,WalletPaymentChoice,CancellationDialog,cancelParticipants,cancellationQuote,commitRegistration,creditBalance,memberCanCancel,cancellationAllowed,reconcileRegistration,FeedbackForm,createFeedback,GroupRegistration,projectRegistration,refreshRegistration,isActiveParticipant,orderIdOf,initialDemoMembers,memberFieldLabels,canEnterAdmin,canViewScreen,initialOptionSets,initialRoles,roleName,EventList,HistoricalEventDetail,initialHistoricalEvents,isHistoricalEvent,publicHistoricalEvent,currentCalendarMonth,JournalPage,initialArticles,publicArticles,MyRegistrations,createMultipleRecords,isReconciledRecord,MemberProfile,createDemoProfile,SignupPage,EventDetail,AdminWorkspace,initialDefaults,initialEvents,initialRegistrationRows,eventForList,eventState,publicEventData,Mountains,CalendarBlank,List,X,ArrowRight,ArrowLeft,CheckCircle,SignOut,UserCircle,ChatCircleDots,groups,fees,eventName,money,events,Modal,SingleRegistrationForm,RegistrationForm,AccessDenied,App,user,profile,onSave,editing,onBack,eventInfo,feeOptions,choices,feeKind,balance,availableGroups,step,setStep,group,setGroup,fee,setFee,payment,setPayment,last5,setLast5,date,setDate,consent,setConsent,error,setError,useWallet,setUseWallet,selected,formEvent,amount,walletSelected,walletPayment,bank,submit};
  return null;
}
}

@Component({selector:'demo-registration-form',standalone:true,imports:[ViewComponent],host:{style:'display: contents'},templateUrl:'./App.RegistrationForm.html'})
export class RegistrationForm extends ViewController {
private _state_mode:any; private _ready_mode=false;
private setMode=(next:any)=>{const value=typeof next==='function'?next(this._state_mode):next;if(!Object.is(value,this._state_mode)){this._state_mode=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const props: any = propsValue;
  if (!this._ready_mode) {
    const stateInitial: any = props.editing?.mode || props.optionSets.registrationModes.find((option: any) => option.active)?.id || 'SINGLE';
    this._state_mode = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_mode = true;
  }
  const mode: any = this._state_mode;
  const setMode: any = this.setMode;
  const modes: any = props.optionSets.registrationModes.filter((option: any) => option.active);
  const groups:any=[...new Set([...(props.eventInfo?.divisions||props.editing?.event?.divisions||['ME','WE','MA','WA','OPEN']),...(props.editing?.participants||[]).map((p:any)=>p.group)])];
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,MemberCredit,WalletPaymentChoice,CancellationDialog,cancelParticipants,cancellationQuote,commitRegistration,creditBalance,memberCanCancel,cancellationAllowed,reconcileRegistration,FeedbackForm,createFeedback,GroupRegistration,projectRegistration,refreshRegistration,isActiveParticipant,orderIdOf,initialDemoMembers,memberFieldLabels,canEnterAdmin,canViewScreen,initialOptionSets,initialRoles,roleName,EventList,HistoricalEventDetail,initialHistoricalEvents,isHistoricalEvent,publicHistoricalEvent,currentCalendarMonth,JournalPage,initialArticles,publicArticles,MyRegistrations,createMultipleRecords,isReconciledRecord,MemberProfile,createDemoProfile,SignupPage,EventDetail,AdminWorkspace,initialDefaults,initialEvents,initialRegistrationRows,eventForList,eventState,publicEventData,Mountains,CalendarBlank,List,X,ArrowRight,ArrowLeft,CheckCircle,SignOut,UserCircle,ChatCircleDots,groups,fees,eventName,money,events,Modal,SingleRegistrationForm,RegistrationForm,AccessDenied,App,props,mode,setMode,modes};
  return null;
}
}

@Component({selector:'demo-access-denied',standalone:true,imports:[ViewFragmentComponent, ViewAnchor, ViewComponent],host:{style:'display: contents'},templateUrl:'./App.AccessDenied.html'})
export class AccessDenied extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    user,
    roleLabel,
    onLogin,
    onLogout,
    links,
    onOpen
  } = propsValue;
  return viewOwner.fragment("fragment7", {
    v0: viewOwner.fragment("fragment0", {
      v0: UserCircle,
      v1: {
        "size": 52,
        "weight": "light"
      }
    }),
    v1: viewOwner.fragment("fragment1", {
      v0: user ? '此身分未開放這個畫面' : '請登入後繼續'
    }),
    v2: viewOwner.fragment("fragment2", {
      v0: user ? `目前身分：${roleLabel}。請選擇已開放的畫面，或聯絡系統 admin 調整角色。` : '此畫面未開放給未登入訪客，可登入示範帳號查看對應權限。'
    }),
    v3: viewOwner.fragment("fragment4", {
      v0: links.map((link: any) => viewOwner.fragment("fragment3", {
        v0: () => onOpen(link.id),
        v1: link.name
      }, link.id))
    }),
    v4: viewOwner.fragment("fragment6", {
      v0: user ? onLogout : onLogin,
      v1: user ? '登出示範帳號' : '登入示範帳號',
      v2: viewOwner.fragment("fragment5", {
        v0: ArrowRight,
        v1: {
          "size": 19
        }
      })
    })
  });
}
}

@Component({selector:'demo-app',standalone:true,imports:[ViewFragmentComponent, ViewAnchor, ViewComponent, IconComponent],host:{style:'display: contents'},templateUrl:'./App.App.html'})
export class App extends ViewController {
private _state_roles:any; private _ready_roles=false;
private setRoles=(next:any)=>{const value=typeof next==='function'?next(this._state_roles):next;if(!Object.is(value,this._state_roles)){this._state_roles=value;this.update();}};
private _state_optionSets:any; private _ready_optionSets=false;
private setOptionSets=(next:any)=>{const value=typeof next==='function'?next(this._state_optionSets):next;if(!Object.is(value,this._state_optionSets)){this._state_optionSets=value;this.update();}};
private _state_members:any; private _ready_members=false;
private setMembers=(next:any)=>{const value=typeof next==='function'?next(this._state_members):next;if(!Object.is(value,this._state_members)){this._state_members=value;this.update();}};
private _state_defaults:any; private _ready_defaults=false;
private setDefaults=(next:any)=>{const value=typeof next==='function'?next(this._state_defaults):next;if(!Object.is(value,this._state_defaults)){this._state_defaults=value;this.update();}};
private _state_sessionMemberId:any; private _ready_sessionMemberId=false;
private setSessionMemberId=(next:any)=>{const value=typeof next==='function'?next(this._state_sessionMemberId):next;if(!Object.is(value,this._state_sessionMemberId)){this._state_sessionMemberId=value;this.update();}};
private _state_feedbackRecords:any; private _ready_feedbackRecords=false;
private setFeedbackRecords=(next:any)=>{const value=typeof next==='function'?next(this._state_feedbackRecords):next;if(!Object.is(value,this._state_feedbackRecords)){this._state_feedbackRecords=value;this.update();}};
private _state_catalog:any; private _ready_catalog=false;
private setCatalog=(next:any)=>{const value=typeof next==='function'?next(this._state_catalog):next;if(!Object.is(value,this._state_catalog)){this._state_catalog=value;this.update();}};
private _state_historicalEvents:any; private _ready_historicalEvents=false;
private setHistoricalEvents=(next:any)=>{const value=typeof next==='function'?next(this._state_historicalEvents):next;if(!Object.is(value,this._state_historicalEvents)){this._state_historicalEvents=value;this.update();}};
private _state_eventListMode:any; private _ready_eventListMode=false;
private setEventListMode=(next:any)=>{const value=typeof next==='function'?next(this._state_eventListMode):next;if(!Object.is(value,this._state_eventListMode)){this._state_eventListMode=value;this.update();}};
private _state_calendarMonth:any; private _ready_calendarMonth=false;
private setCalendarMonth=(next:any)=>{const value=typeof next==='function'?next(this._state_calendarMonth):next;if(!Object.is(value,this._state_calendarMonth)){this._state_calendarMonth=value;this.update();}};
private _state_articleRecords:any; private _ready_articleRecords=false;
private setArticleRecords=(next:any)=>{const value=typeof next==='function'?next(this._state_articleRecords):next;if(!Object.is(value,this._state_articleRecords)){this._state_articleRecords=value;this.update();}};
private _state_selectedArticleId:any; private _ready_selectedArticleId=false;
private setSelectedArticleId=(next:any)=>{const value=typeof next==='function'?next(this._state_selectedArticleId):next;if(!Object.is(value,this._state_selectedArticleId)){this._state_selectedArticleId=value;this.update();}};
private _state_registrationState:any; private _ready_registrationState=false;
private setRegistrationState=(next:any)=>{const value=typeof next==='function'?next(this._state_registrationState):next;if(!Object.is(value,this._state_registrationState)){this._state_registrationState=value;this.update();}};
private _state_savedOrders:any; private _ready_savedOrders=false;
private setSavedOrders=(next:any)=>{const value=typeof next==='function'?next(this._state_savedOrders):next;if(!Object.is(value,this._state_savedOrders)){this._state_savedOrders=value;this.update();}};
private _state_now:any; private _ready_now=false;
private setNow=(next:any)=>{const value=typeof next==='function'?next(this._state_now):next;if(!Object.is(value,this._state_now)){this._state_now=value;this.update();}};
private _state_cancelSource:any; private _ready_cancelSource=false;
private setCancelSource=(next:any)=>{const value=typeof next==='function'?next(this._state_cancelSource):next;if(!Object.is(value,this._state_cancelSource)){this._state_cancelSource=value;this.update();}};
private _state_cancelTarget:any; private _ready_cancelTarget=false;
private setCancelTarget=(next:any)=>{const value=typeof next==='function'?next(this._state_cancelTarget):next;if(!Object.is(value,this._state_cancelTarget)){this._state_cancelTarget=value;this.update();}};
private _state_financeNotice:any; private _ready_financeNotice=false;
private setFinanceNotice=(next:any)=>{const value=typeof next==='function'?next(this._state_financeNotice):next;if(!Object.is(value,this._state_financeNotice)){this._state_financeNotice=value;this.update();}};
private _state_selectedEventId:any; private _ready_selectedEventId=false;
private setSelectedEventId=(next:any)=>{const value=typeof next==='function'?next(this._state_selectedEventId):next;if(!Object.is(value,this._state_selectedEventId)){this._state_selectedEventId=value;this.update();}};
private _state_fromRegistration:any; private _ready_fromRegistration=false;
private setFromRegistration=(next:any)=>{const value=typeof next==='function'?next(this._state_fromRegistration):next;if(!Object.is(value,this._state_fromRegistration)){this._state_fromRegistration=value;this.update();}};
private _state_view:any; private _ready_view=false;
private setView=(next:any)=>{const value=typeof next==='function'?next(this._state_view):next;if(!Object.is(value,this._state_view)){this._state_view=value;this.update();}};
private _state_modal:any; private _ready_modal=false;
private setModal=(next:any)=>{const value=typeof next==='function'?next(this._state_modal):next;if(!Object.is(value,this._state_modal)){this._state_modal=value;this.update();}};
private _state_menu:any; private _ready_menu=false;
private setMenu=(next:any)=>{const value=typeof next==='function'?next(this._state_menu):next;if(!Object.is(value,this._state_menu)){this._state_menu=value;this.update();}};
private _state_loginNext:any; private _ready_loginNext=false;
private setLoginNext=(next:any)=>{const value=typeof next==='function'?next(this._state_loginNext):next;if(!Object.is(value,this._state_loginNext)){this._state_loginNext=value;this.update();}};
private _state_records:any; private _ready_records=false;
private setRecords=(next:any)=>{const value=typeof next==='function'?next(this._state_records):next;if(!Object.is(value,this._state_records)){this._state_records=value;this.update();}};
private _state_current:any; private _ready_current=false;
private setCurrent=(next:any)=>{const value=typeof next==='function'?next(this._state_current):next;if(!Object.is(value,this._state_current)){this._state_current=value;this.update();}};
private _state_accessNotice:any; private _ready_accessNotice=false;
private setAccessNotice=(next:any)=>{const value=typeof next==='function'?next(this._state_accessNotice):next;if(!Object.is(value,this._state_accessNotice)){this._state_accessNotice=value;this.update();}};
private _state_demoRequested:any; private _ready_demoRequested=false;
private setDemoRequested=(next:any)=>{const value=typeof next==='function'?next(this._state_demoRequested):next;if(!Object.is(value,this._state_demoRequested)){this._state_demoRequested=value;this.update();}};
private _state_recordsNotice:any; private _ready_recordsNotice=false;
private setRecordsNotice=(next:any)=>{const value=typeof next==='function'?next(this._state_recordsNotice):next;if(!Object.is(value,this._state_recordsNotice)){this._state_recordsNotice=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  if (!this._ready_roles) {
    const stateInitial: any = initialRoles;
    this._state_roles = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_roles = true;
  }
  const roles: any = this._state_roles;
  const setRoles: any = this.setRoles;
  if (!this._ready_optionSets) {
    const stateInitial: any = initialOptionSets;
    this._state_optionSets = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_optionSets = true;
  }
  const optionSets: any = this._state_optionSets;
  const setOptionSets: any = this.setOptionSets;
  if (!this._ready_members) {
    const stateInitial: any = initialDemoMembers;
    this._state_members = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_members = true;
  }
  const members: any = this._state_members;
  const setMembers: any = this.setMembers;
  if (!this._ready_defaults) {
    const stateInitial: any = initialDefaults;
    this._state_defaults = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_defaults = true;
  }
  const defaults: any = this._state_defaults;
  const setDefaults: any = this.setDefaults;
  if (!this._ready_sessionMemberId) {
    const stateInitial: any = null;
    this._state_sessionMemberId = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_sessionMemberId = true;
  }
  const sessionMemberId: any = this._state_sessionMemberId;
  const setSessionMemberId: any = this.setSessionMemberId;
  if (!this._ready_feedbackRecords) {
    const stateInitial: any = [];
    this._state_feedbackRecords = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_feedbackRecords = true;
  }
  const feedbackRecords: any = this._state_feedbackRecords;
  const setFeedbackRecords: any = this.setFeedbackRecords;
  const currentMember: any = members.find((member: any) => member.id === sessionMemberId),
    user: any = currentMember?.residency || null,
    memberRole: any = currentMember?.role || 'GUEST';
  const can: any = (screen: any) => canViewScreen(roles, currentMember?.roleIds || memberRole, screen),
    adminAllowed: any = canEnterAdmin(roles, currentMember?.roleIds || memberRole);
  const activeGroups: any = defaults.groups.filter((group: any) => group.active).map((group: any) => `${group.name} ${group.code}`);
  function profileFor(member: any) {
    if (!member) return createDemoProfile();
    const group: any = defaults.groups.find((group: any) => group.code === member.division);
    return {
      ...createDemoProfile(member.residency, member.role),
      ...Object.fromEntries(['name', 'email', 'residency', ...Object.keys(memberFieldLabels).filter((key: any) => key !== 'division')].map((key: any) => [key, member[key] || ''])),
      division: group ? `${group.name} ${group.code}` : member.division
    };
  }
  const profile: any = profileFor(currentMember),
    profileGroups: any = [...new Set([...activeGroups, profile.division].filter(Boolean))];
  if (!this._ready_catalog) {
    const stateInitial: any = initialEvents;
    this._state_catalog = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_catalog = true;
  }
  const catalog: any = this._state_catalog;
  const setCatalog: any = this.setCatalog;
  if (!this._ready_historicalEvents) {
    const stateInitial: any = initialHistoricalEvents;
    this._state_historicalEvents = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_historicalEvents = true;
  }
  const historicalEvents: any = this._state_historicalEvents;
  const setHistoricalEvents: any = this.setHistoricalEvents;
  const publicCatalog: any = (() => [...catalog, ...historicalEvents.map(publicHistoricalEvent).filter(Boolean)])();
  if (!this._ready_eventListMode) {
    const stateInitial: any = 'list';
    this._state_eventListMode = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_eventListMode = true;
  }
  const eventListMode: any = this._state_eventListMode;
  const setEventListMode: any = this.setEventListMode;
  if (!this._ready_calendarMonth) {
    const stateInitial: any = () => currentCalendarMonth();
    this._state_calendarMonth = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_calendarMonth = true;
  }
  const calendarMonth: any = this._state_calendarMonth;
  const setCalendarMonth: any = this.setCalendarMonth;
  if (!this._ready_articleRecords) {
    const stateInitial: any = initialArticles;
    this._state_articleRecords = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_articleRecords = true;
  }
  const articleRecords: any = this._state_articleRecords;
  const setArticleRecords: any = this.setArticleRecords;
  if (!this._ready_selectedArticleId) {
    const stateInitial: any = () => new URLSearchParams(window.location.search).get('article');
    this._state_selectedArticleId = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_selectedArticleId = true;
  }
  const selectedArticleId: any = this._state_selectedArticleId;
  const setSelectedArticleId: any = this.setSelectedArticleId;
  const publishedArticles: any = (() => publicArticles(articleRecords))();
  if (!this._ready_registrationState) {
    const stateInitial: any = () => ({
      rows: initialRegistrationRows.map((row: any) => ({
        ...row,
        ownerId: row.ownerId || row.memberId || initialDemoMembers.find((member: any) => member.email === row.email)?.id
      })),
      ledger: []
    });
    this._state_registrationState = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_registrationState = true;
  }
  const registrationState: any = this._state_registrationState;
  const setRegistrationState: any = this.setRegistrationState;
  if (!this._ready_savedOrders) {
    const stateInitial: any = {};
    this._state_savedOrders = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_savedOrders = true;
  }
  const savedOrders: any = this._state_savedOrders;
  const setSavedOrders: any = this.setSavedOrders;
  if (!this._ready_now) {
    const stateInitial: any = Date.now;
    this._state_now = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_now = true;
  }
  const now: any = this._state_now;
  const setNow: any = this.setNow;
  const rows: any = registrationState.rows,
    ledger: any = registrationState.ledger;
  const setRows: any = (update: any) => setRegistrationState((previous: any) => ({
    ...previous,
    rows: typeof update === 'function' ? update(previous.rows) : update
  }));
  if (!this._ready_cancelSource) {
    const stateInitial: any = 'MEMBER_SELF';
    this._state_cancelSource = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_cancelSource = true;
  }
  const cancelSource: any = this._state_cancelSource;
  const setCancelSource: any = this.setCancelSource;
  if (!this._ready_cancelTarget) {
    const stateInitial: any = null;
    this._state_cancelTarget = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_cancelTarget = true;
  }
  const cancelTarget: any = this._state_cancelTarget;
  const setCancelTarget: any = this.setCancelTarget;
  if (!this._ready_financeNotice) {
    const stateInitial: any = '';
    this._state_financeNotice = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_financeNotice = true;
  }
  const financeNotice: any = this._state_financeNotice;
  const setFinanceNotice: any = this.setFinanceNotice;
  const actor: any = {
    id: sessionMemberId,
    role: memberRole,
    manageRegistrations: can('admin.registrations')
  };
  const balance: any = creditBalance(ledger, sessionMemberId);
  const creditPanel: any = user ? viewOwner.fragment("fragment0", {
    v0: MemberCredit,
    v1: {
      "balance": balance,
      "entries": ledger.filter((entry: any) => entry.memberId === sessionMemberId),
      "memberNumber": currentMember.number
    }
  }) : null;
  this.scheduleEffect(0, () => {
    const timer: any = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  if (!this._ready_selectedEventId) {
    const stateInitial: any = () => new URLSearchParams(window.location.search).get('event') || 'winter-forest';
    this._state_selectedEventId = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_selectedEventId = true;
  }
  const selectedEventId: any = this._state_selectedEventId;
  const setSelectedEventId: any = this.setSelectedEventId;
  if (!this._ready_fromRegistration) {
    const stateInitial: any = false;
    this._state_fromRegistration = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_fromRegistration = true;
  }
  const fromRegistration: any = this._state_fromRegistration;
  const setFromRegistration: any = this.setFromRegistration;
  const selectedPublicEvent: any = publicCatalog.find((event: any) => event.id === selectedEventId && event.status === 'PUBLISHED'),
    selectedEvent: any = selectedPublicEvent || catalog[0],
    selectedState: any = eventState(selectedEvent, now);
  if (!this._ready_view) {
    const stateInitial: any = () => {
      const requested: any = new URLSearchParams(window.location.search).get('view');
      return ['signup', 'admin', 'profile', 'registrations', 'journal', 'detail'].includes(requested) ? requested : 'events';
    };
    this._state_view = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_view = true;
  }
  const view: any = this._state_view;
  const setView: any = this.setView;
  if (!this._ready_modal) {
    const stateInitial: any = null;
    this._state_modal = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_modal = true;
  }
  const modal: any = this._state_modal;
  const setModal: any = this.setModal;
  if (!this._ready_menu) {
    const stateInitial: any = false;
    this._state_menu = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_menu = true;
  }
  const menu: any = this._state_menu;
  const setMenu: any = this.setMenu;
  if (!this._ready_loginNext) {
    const stateInitial: any = null;
    this._state_loginNext = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_loginNext = true;
  }
  const loginNext: any = this._state_loginNext;
  const setLoginNext: any = this.setLoginNext;
  if (!this._ready_records) {
    const stateInitial: any = [];
    this._state_records = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_records = true;
  }
  const records: any = this._state_records;
  const setRecords: any = this.setRecords;
  if (!this._ready_current) {
    const stateInitial: any = null;
    this._state_current = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_current = true;
  }
  const current: any = this._state_current;
  const setCurrent: any = this.setCurrent;
  if (!this._ready_accessNotice) {
    const stateInitial: any = '';
    this._state_accessNotice = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_accessNotice = true;
  }
  const accessNotice: any = this._state_accessNotice;
  const setAccessNotice: any = this.setAccessNotice;
  if (!this._ready_demoRequested) {
    const stateInitial: any = () => new URLSearchParams(window.location.search).get('demo') === 'multiple';
    this._state_demoRequested = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_demoRequested = true;
  }
  const demoRequested: any = this._state_demoRequested;
  const setDemoRequested: any = this.setDemoRequested;
  if (!this._ready_recordsNotice) {
    const stateInitial: any = '';
    this._state_recordsNotice = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_recordsNotice = true;
  }
  const recordsNotice: any = this._state_recordsNotice;
  const setRecordsNotice: any = this.setRecordsNotice;
  const publicLinks: any = [{
    id: 'events',
    name: '賽事列表'
  }, {
    id: 'journal',
    name: '定向專欄'
  }, ...(user ? [{
    id: 'registrations',
    name: '我的報名'
  }, {
    id: 'profile',
    name: '會員資料'
  }] : [{
    id: 'signup',
    name: '會員註冊'
  }])].filter((link: any) => can(link.id));
  const navLinks: any = [...publicLinks, ...(adminAllowed ? [{
    id: 'admin',
    name: '管理後台'
  }] : [])];
  function landing(role = memberRole) {
    return ['events', 'journal', 'registrations', 'profile', 'signup'].find((id: any) => canViewScreen(roles, role, id)) || (canEnterAdmin(roles, role) ? 'admin' : 'events');
  }
  this.scheduleEffect(1, () => {
    document.title = view === 'admin' ? '管理後台｜台灣定向' : view === 'journal' ? '定向專欄｜台灣定向' : view === 'profile' ? '會員資料管理｜台灣定向' : view === 'registrations' ? '我的報名｜台灣定向' : '台灣定向｜賽事報名';
  }, [view]);
  function open(name: any, demo = demoRequested) {
    setMenu(false);
    setAccessNotice('');
    if (name === 'records-demo') {
      showRecordsDemo();
      return;
    }
    if (name === 'records') name = 'registrations';
    if (['events', 'signup', 'admin', 'profile', 'registrations', 'journal'].includes(name)) {
      setView(name);
      setModal(null);
      const next: any = new URL(window.location.href);
      for (const key of ['demo', 'article', 'event', 'section']) next.searchParams.delete(key);
      if (name === 'journal') setSelectedArticleId(null);
      if (name === 'events') next.searchParams.delete('view');else next.searchParams.set('view', name);
      if (name === 'registrations' && demo) next.searchParams.set('demo', 'multiple');
      window.history.replaceState(null, '', next.pathname + next.search);
      window.scrollTo(0, 0);
      return;
    }
    setModal(name);
  }
  function readArticle(id: any) {
    if (!can('journal')) return;
    open('journal');
    setSelectedArticleId(id);
    const next: any = new URL(window.location.href);
    next.searchParams.set('article', id);
    window.history.replaceState(null, '', next.pathname + next.search);
  }
  function showRecordsDemo(residency = user, member = profile) {
    if (!can('registrations')) {
      open('registrations');
      return;
    }
    const samples: any = createMultipleRecords(events, residency, member).map((record: any) => ({
      ...record,
      id: `${record.id}-${sessionMemberId}`,
      ownerId: sessionMemberId
    }));
    setRecords((previous: any) => [...previous, ...samples.filter((sample: any) => !previous.some((record: any) => record.id === sample.id && record.ownerId === sessionMemberId))]);
    setDemoRequested(true);
    setRecordsNotice('');
    open('registrations', true);
  }
  function editRecord(record: any) {
    if (record.inactive) return;
    if (!can('register') || !can('registrations')) return;
    setCurrent(record);
    setModal('edit');
  }
  function selectEvent(event: any, fromRecords = false) {
    if (!can('events') || !publicCatalog.some((item: any) => item.id === event.id && item.status === 'PUBLISHED')) return;
    setSelectedEventId(event.id);
    setFromRegistration(fromRecords);
    setMenu(false);
    setView('detail');
    setModal(null);
    const next: any = new URL(window.location.href);
    for (const key of ['article', 'demo', 'section']) next.searchParams.delete(key);
    next.searchParams.set('view', 'detail');
    next.searchParams.set('event', event.id);
    window.history.replaceState(null, '', next.pathname + next.search);
    window.scrollTo(0, 0);
  }
  function requireLogin(next: any) {
    if (!user) {
      setLoginNext(next);
      setModal('login');
      return;
    }
    if (next === 'register' && !can('register')) {
      setAccessNotice('目前角色未開放賽事報名畫面。');
      return;
    }
    open(next);
  }
  function save(value: any) {
    if (!can('register') || !currentMember) throw new Error('請登入後再報名。');
    const previous: any = records.find((record: any) => record.id === value.id) || ownRecords.find((record: any) => record.id === value.id),
      edit: any = Boolean(previous);
    if (value.id && !previous) throw new Error('找不到自己的報名紀錄。');
    const eventId: any = previous?.eventId || value.eventId || selectedEvent.id,
      event: any = catalog.find((item: any) => item.id === eventId);
    if (!event || eventState(event, now) !== 'open') throw new Error('目前不在本場報名期間，請聯絡管理員。');
    const record: any = {
      ...previous,
      ...value,
      ownerId: sessionMemberId,
      event: previous?.event || value.event || eventForList(event, now),
      eventId,
      profile: previous?.profile || {
        ...profile
      },
      id: value.id || `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      status: value.status || '報名完成(待確認帳款)'
    };
    const next: any = commitRegistration(registrationState, record, event, actor),
      saved: any = refreshRegistration(record, next.rows);
    setRegistrationState(next);
    setRecords((prev: any) => prev.some((record: any) => record.id === saved.id) ? prev.map((r: any) => r.id === saved.id ? saved : r) : [...prev, saved]);
    setCurrent(saved);
    if (edit) {
      setRecordsNotice(`${saved.event.name}（${saved.id}）已儲存修改。`);
      open('records');
    } else setModal('success');
  }
  function requestCancellation(ids: any, source = 'MEMBER_SELF') {
    if (!currentMember) return;
    const selected: any = rows.filter((row: any) => ids.includes(row.id) && !row.cancelledAt && !row.deletedAt);
    if (!selected.length) {
      setRecordsNotice('沒有可取消的參賽者。');
      return;
    }
    if (selected.some((row: any) => !cancellationAllowed(actor, source, catalog.find((event: any) => event.id === row.eventId)))) {
      const message: any = source === 'ADMIN_BACKOFFICE' ? '後台僅於報名截止後開放取消報名。' : '已超過報名截止時間，請聯絡管理員取消。';
      setRecordsNotice(message);
      setFinanceNotice(message);
      return;
    }
    setCancelSource(source);
    setCancelTarget(ids);
    setFinanceNotice('');
  }
  function confirmCancellation(options: any) {
    if (cancelTarget.some((id: any) => {
      const row: any = rows.find((item: any) => item.id === id);
      return !cancellationAllowed(actor, cancelSource, catalog.find((event: any) => event.id === row?.eventId));
    })) throw new Error(cancelSource === 'ADMIN_BACKOFFICE' ? '後台僅於報名截止後開放取消報名。' : '已超過報名截止時間，請聯絡管理員取消。');
    const quote: any = cancellationQuote(registrationState, cancelTarget, actor, options.creditMemberId);
    const next: any = cancelParticipants(registrationState, cancelTarget, actor, {
      ...options,
      members,
      source: cancelSource
    });
    setRegistrationState(next);
    setCancelTarget(null);
    const pending: any = quote.rows.filter((row: any) => row.payment === 'BANK_TRANSFER' && row.status === 'PENDING').reduce((sum: any, row: any) => sum + row.amount, 0);
    const message: any = `已取消 ${quote.rows.length} 位參賽者，退回儲值金 NT$${quote.amount}。${pending > 0 ? `尚有 NT$${pending} 待核款，確認後自動回存付款會員。` : ''}`;
    setFinanceNotice(message);
    setRecordsNotice(message);
  }
  function reconcileAndCredit(id: any, reconciled: any, creditMemberId: any) {
    const next: any = (reconcileRegistration as any)(registrationState, id, reconciled, actor, {
      members,
      creditMemberId
    });
    const returned: any = next.ledger.reduce((sum: any, entry: any) => sum + entry.amount, 0) - ledger.reduce((sum: any, entry: any) => sum + entry.amount, 0);
    setRegistrationState(next);
    setFinanceNotice(reconciled ? `${id} 已完成整筆對帳${returned > 0 ? `，取消項目已回存付款會員儲值金 NT$${returned}` : ''}。` : `${id} 已取消對帳，回到待確認帳款。`);
  }
  const cancellationDialog: any = cancelTarget && currentMember ? viewOwner.fragment("fragment1", {
    v0: CancellationDialog,
    v1: {
      "state": registrationState,
      "rowIds": cancelTarget,
      "actor": actor,
      "members": members,
      "Dialog": Modal,
      "onClose": () => setCancelTarget(null),
      "onConfirm": confirmCancellation
    }
  }) : null;
  const inferredRecords: any = [...new Set(rows.filter((row: any) => row.ownerId === sessionMemberId).map(orderIdOf))].filter((id: any) => !records.some((record: any) => record.id === id)).map((id: any) => {
    const row: any = rows.find((row: any) => orderIdOf(row) === id),
      event: any = catalog.find((item: any) => item.id === row.eventId);
    return {
      id,
      ownerId: sessionMemberId,
      eventId: row.eventId,
      event: eventForList(event || catalog[0], now),
      mode: row.orderMode || 'SINGLE',
      profile: {
        ...profile,
        name: row.name || profile.name,
        nickname: row.nickname || profile.nickname
      },
      group: row.division,
      fee: row.fee,
      payment: row.payment,
      amount: row.amount,
      status: '報名完成'
    };
  });
  const ownRecords: any = [...records.filter((record: any) => record.ownerId === sessionMemberId), ...inferredRecords].map((record: any) => refreshRegistration(record, rows));
  function saveProfile(value: any) {
    if (!currentMember || !can('profile')) return;
    const patch: any = Object.fromEntries(['nickname', 'phone', 'emergencyName', 'emergencyPhone', 'social'].map((key: any) => [key, value[key]]));
    patch.division = value.division.split(' ').at(-1);
    setMembers((previous: any) => previous.map((member: any) => member.id === sessionMemberId ? {
      ...member,
      ...patch,
      revision: member.revision + 1
    } : member));
  }
  function submitFeedback(value: any) {
    if (!currentMember) throw new Error('請登入會員後再提供意見回饋。');
    if (!can('feedback')) throw new Error('目前角色未開放意見回饋。');
    const record: any = createFeedback(value, optionSets.feedbackTypes, feedbackRecords, currentMember);
    setFeedbackRecords((previous: any) => [...previous, record]);
    return record;
  }
  const close: any = () => setModal(null);
  function logout() {
    setSessionMemberId(null);
    setCancelTarget(null);
    setDemoRequested(false);
    setRecordsNotice('');
    setMenu(false);
    open(landing('GUEST'));
  }
  function loginAsMember(id: any, next = loginNext) {
    const member: any = members.find((item: any) => item.id === id);
    if (!member) return;
    setSessionMemberId(id);
    if (id !== sessionMemberId) {
      setDemoRequested(false);
      setRecordsNotice('');
    }
    setModal(null);
    const role: any = member.role;
    if (next === 'records-demo') {
      if (canViewScreen(roles, role, 'registrations')) {
        setRecords((previous: any) => [...previous.filter((record: any) => record.ownerId !== id), ...createMultipleRecords(events, member.residency, profileFor(member)).map((record: any) => ({
          ...record,
          id: `${record.id}-${id}`,
          ownerId: id
        }))]);
        setDemoRequested(true);
      }
      open('registrations', true);
      return;
    }
    if (next === 'register') {
      if (canViewScreen(roles, role, 'register') && canViewScreen(roles, role, 'events')) setModal('register');else {
        open(landing(role));
        setAccessNotice('目前角色未開放賽事報名畫面。');
      }
      return;
    }
    open(next && next !== 'landing' ? next : landing(role));
  }
  const pageAllowed: any = view === 'admin' ? adminAllowed : can(view === 'detail' ? 'events' : view);
  const loginButton: any = () => {
    setLoginNext(view === 'signup' ? 'events' : view === 'admin' ? 'admin' : null);
    setModal('login');
  };
  if (view === 'admin' && pageAllowed) return viewOwner.fragment("fragment3", {
    v0: viewOwner.fragment("fragment2", {
      v0: AdminWorkspace,
      v1: {
        "onReconcileRegistration": reconcileAndCredit,
        "onCancelRegistration": (row: any) => requestCancellation([row.id], 'ADMIN_BACKOFFICE'),
        "financeNotice": financeNotice,
        "feedbackRecords": feedbackRecords,
        "setFeedbackRecords": setFeedbackRecords,
        "key": sessionMemberId,
        "roles": roles,
        "setRoles": setRoles,
        "optionSets": optionSets,
        "setOptionSets": setOptionSets,
        "members": members,
        "setMembers": setMembers,
        "defaults": defaults,
        "setDefaults": setDefaults,
        "currentMemberId": sessionMemberId,
        "onSwitchMember": (id: any) => {
          const role: any = members.find((member: any) => member.id === id)?.role;
          loginAsMember(id, canEnterAdmin(roles, role) ? 'admin' : 'landing');
        },
        "historicalEvents": historicalEvents,
        "setHistoricalEvents": setHistoricalEvents,
        "onOpenHistorical": can('events') ? selectEvent : undefined,
        "catalog": catalog,
        "setCatalog": setCatalog,
        "rows": rows,
        "setRows": setRows,
        "savedOrders": savedOrders,
        "setSavedOrders": setSavedOrders,
        "articleRecords": articleRecords,
        "setArticleRecords": setArticleRecords,
        "onOpenArticle": can('journal') ? readArticle : undefined,
        "initialRole": memberRole,
        "roleIds": currentMember?.roleIds || [memberRole],
        "onExit": () => open(landing()),
        "onMemberMode": () => open('profile'),
        "Dialog": Modal
      }
    }),
    v1: cancellationDialog
  });
  let content: any;
  if (!pageAllowed) content = viewOwner.fragment("fragment4", {
    v0: AccessDenied,
    v1: {
      "user": user,
      "roleLabel": roleName(roles, memberRole),
      "onLogin": loginButton,
      "onLogout": logout,
      "links": navLinks,
      "onOpen": open
    }
  });else if (view === 'journal') content = viewOwner.fragment("fragment5", {
    v0: JournalPage,
    v1: {
      "categories": optionSets.articleCategories,
      "articles": publishedArticles,
      "articleId": selectedArticleId,
      "onRead": readArticle,
      "onBack": () => open('journal')
    }
  });else if (view === 'registrations') content = viewOwner.fragment("fragment6", {
    v0: MyRegistrations,
    v1: {
      "canCancel": (record: any) => memberCanCancel(catalog.find((event: any) => event.id === record.eventId)),
      "creditPanel": creditPanel,
      "onNavigate": open,
      "onLogout": logout,
      "onCancel": (record: any, personId: any) => requestCancellation(rows.filter((row: any) => orderIdOf(row) === record.id && isActiveParticipant(row) && (!personId || row.id === personId)).map((row: any) => row.id)),
      "feeOptions": optionSets.registrationFees,
      "records": ownRecords,
      "defaultEvent": events[0],
      "onEdit": can('register') ? editRecord : undefined,
      "onBrief": can('events') ? (event: any) => selectEvent(event, true) : undefined,
      "onExplore": can('events') ? () => open('events') : undefined,
      "onDemo": () => showRecordsDemo(),
      "notice": recordsNotice
    }
  });else if (view === 'profile') content = viewOwner.fragment("fragment7", {
    v0: MemberProfile,
    v1: {
      "creditPanel": creditPanel,
      "onNavigate": open,
      "onLogout": logout,
      "key": sessionMemberId,
      "profile": profile,
      "role": memberRole,
      "roleLabel": roleName(roles, memberRole),
      "groups": profileGroups,
      "onSave": saveProfile,
      "onBack": can('events') ? () => open('events') : undefined,
      "onRecords": can('registrations') ? () => open('records') : undefined,
      "onAdmin": adminAllowed ? () => open('admin') : undefined
    }
  });else if (view === 'signup') content = viewOwner.fragment("fragment8", {
    v0: SignupPage,
    v1: {
      "groups": activeGroups,
      "notice": defaults.notice,
      "event": selectedEvent,
      "onBack": () => open(landing()),
      "onLogin": () => {
        setLoginNext('events');
        setModal('login');
      }
    }
  });else if (view === 'events') content = viewOwner.fragment("fragment9", {
    v0: EventList,
    v1: {
      "onSelect": selectEvent,
      "catalog": publicCatalog,
      "now": now,
      "mode": eventListMode,
      "onModeChange": setEventListMode,
      "month": calendarMonth,
      "onMonthChange": setCalendarMonth,
      "Dialog": Modal
    }
  });else if (!selectedPublicEvent) content = viewOwner.fragment("fragment13", {
    v0: viewOwner.fragment("fragment10", {
      v0: () => open('events')
    }),
    v1: viewOwner.fragment("fragment11", {}),
    v2: viewOwner.fragment("fragment12", {})
  });else if (isHistoricalEvent(selectedEvent)) content = viewOwner.fragment("fragment14", {
    v0: HistoricalEventDetail,
    v1: {
      "key": selectedEvent.id,
      "event": selectedEvent,
      "onBack": () => open('events'),
      "Dialog": Modal
    }
  });else content = viewOwner.fragment("fragment15", {
    v0: EventDetail,
    v1: {
      "key": selectedEvent.id,
      "event": selectedEvent,
      "state": selectedState,
      "participation": publicEventData(selectedEvent, rows, savedOrders[selectedEvent.id], now),
      "user": user,
      "fromRegistration": fromRegistration && can('registrations'),
      "onBack": () => open(fromRegistration && can('registrations') ? 'records' : 'events'),
      "onRegister": !user || can('register') ? () => requireLogin('register') : undefined,
      "Dialog": Modal
    }
  });
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,MemberCredit,WalletPaymentChoice,CancellationDialog,cancelParticipants,cancellationQuote,commitRegistration,creditBalance,memberCanCancel,cancellationAllowed,reconcileRegistration,FeedbackForm,createFeedback,GroupRegistration,projectRegistration,refreshRegistration,isActiveParticipant,orderIdOf,initialDemoMembers,memberFieldLabels,canEnterAdmin,canViewScreen,initialOptionSets,initialRoles,roleName,EventList,HistoricalEventDetail,initialHistoricalEvents,isHistoricalEvent,publicHistoricalEvent,currentCalendarMonth,JournalPage,initialArticles,publicArticles,MyRegistrations,createMultipleRecords,isReconciledRecord,MemberProfile,createDemoProfile,SignupPage,EventDetail,AdminWorkspace,initialDefaults,initialEvents,initialRegistrationRows,eventForList,eventState,publicEventData,Mountains,CalendarBlank,List,X,ArrowRight,ArrowLeft,CheckCircle,SignOut,UserCircle,ChatCircleDots,groups,fees,eventName,money,events,Modal,SingleRegistrationForm,RegistrationForm,AccessDenied,App,roles,setRoles,optionSets,setOptionSets,members,setMembers,defaults,setDefaults,sessionMemberId,setSessionMemberId,feedbackRecords,setFeedbackRecords,currentMember,user,memberRole,can,adminAllowed,activeGroups,profile,profileGroups,catalog,setCatalog,historicalEvents,setHistoricalEvents,publicCatalog,eventListMode,setEventListMode,calendarMonth,setCalendarMonth,articleRecords,setArticleRecords,selectedArticleId,setSelectedArticleId,publishedArticles,registrationState,setRegistrationState,savedOrders,setSavedOrders,now,setNow,rows,ledger,setRows,cancelSource,setCancelSource,cancelTarget,setCancelTarget,financeNotice,setFinanceNotice,actor,balance,creditPanel,selectedEventId,setSelectedEventId,fromRegistration,setFromRegistration,selectedPublicEvent,selectedEvent,selectedState,view,setView,modal,setModal,menu,setMenu,loginNext,setLoginNext,records,setRecords,current,setCurrent,accessNotice,setAccessNotice,demoRequested,setDemoRequested,recordsNotice,setRecordsNotice,publicLinks,navLinks,cancellationDialog,inferredRecords,ownRecords,close,pageAllowed,loginButton,content,profileFor,landing,open,readArticle,showRecordsDemo,editRecord,selectEvent,requireLogin,save,requestCancellation,confirmCancellation,reconcileAndCredit,saveProfile,submitFeedback,logout,loginAsMember};
  return viewOwner.fragment("fragment73", {
    v0: viewOwner.fragment("fragment16", {}),
    v1: viewOwner.fragment("fragment28", {
      v0: viewOwner.fragment("fragment19", {
        v0: () => open(landing()),
        v1: viewOwner.fragment("fragment17", {
          v0: Mountains,
          v1: {
            "size": 49,
            "weight": "bold"
          }
        }),
        v2: viewOwner.fragment("fragment18", {})
      }),
      v1: viewOwner.fragment("fragment24", {
        v0: navLinks.map((link: any) => viewOwner.fragment("fragment20", {
          v0: view === link.id ? 'page' : undefined,
          v1: () => open(link.id),
          v2: link.name
        }, link.id)),
        v1: viewOwner.fragment("fragment23", {
          v0: user ? logout : loginButton,
          v1: user ? viewOwner.fragment("fragment22", {
            v0: viewOwner.fragment("fragment21", {
              v0: SignOut,
              v1: {
                "size": 18
              }
            })
          }) : '登入'
        })
      }),
      v2: viewOwner.fragment("fragment27", {
        v0: menu,
        v1: menu ? '關閉選單' : '開啟選單',
        v2: () => setMenu(!menu),
        v3: menu ? viewOwner.fragment("fragment25", {
          v0: X,
          v1: {
            "size": 26
          }
        }) : viewOwner.fragment("fragment26", {
          v0: List,
          v1: {
            "size": 26
          }
        })
      })
    }),
    v2: viewOwner.fragment("fragment29", {}),
    v3: menu && viewOwner.fragment("fragment32", {
      v0: navLinks.map((link: any) => viewOwner.fragment("fragment30", {
        v0: view === link.id ? 'page' : undefined,
        v1: () => open(link.id),
        v2: link.name
      }, link.id)),
      v1: viewOwner.fragment("fragment31", {
        v0: user ? logout : loginButton,
        v1: user ? '登出示範帳號' : '登入'
      })
    }),
    v4: accessNotice && viewOwner.fragment("fragment33", {
      v0: accessNotice
    }),
    v5: content,
    v6: viewOwner.fragment("fragment42", {
      v0: (!user || can('feedback')) && viewOwner.fragment("fragment36", {
        v0: viewOwner.fragment("fragment35", {
          v0: () => requireLogin('feedback'),
          v1: viewOwner.fragment("fragment34", {
            v0: ChatCircleDots,
            v1: {
              "size": 20
            }
          })
        })
      }),
      v1: viewOwner.fragment("fragment41", {
        v0: can('signup') && viewOwner.fragment("fragment37", {
          v0: (event: any) => {
            event.preventDefault();
            open('signup');
          }
        }),
        v1: can('profile') && viewOwner.fragment("fragment38", {
          v0: (event: any) => {
            event.preventDefault();
            open('profile');
          }
        }),
        v2: can('registrations') && viewOwner.fragment("fragment39", {
          v0: (event: any) => {
            event.preventDefault();
            showRecordsDemo();
          }
        }),
        v3: adminAllowed && viewOwner.fragment("fragment40", {
          v0: (event: any) => {
            event.preventDefault();
            open('admin');
          }
        })
      })
    }),
    v7: cancellationDialog,
    v8: modal === 'feedback' && user && can('feedback') && viewOwner.fragment("fragment43", {
      v0: FeedbackForm,
      v1: {
        "memberNumber": currentMember.number,
        "types": optionSets.feedbackTypes,
        "onSubmit": submitFeedback,
        "onClose": close,
        "Dialog": Modal
      }
    }),
    v9: modal === 'login' && viewOwner.fragment("fragment49", {
      v0: AuthDialog,
      v1: {onClose:close,onLogin:loginAsMember,onSignup:()=>open('signup'),members,roles}
    }),
    v10: modal === 'register' && can('register') && pageAllowed && viewOwner.fragment("fragment51", {
      v0: Modal,
      v1: {
        "title": `報名${selectedEvent.name}`,
        "onClose": close,
        "wide": true,
        children: [viewOwner.fragment("fragment50", {
          v0: RegistrationForm,
          v1: {
            "balance": balance,
            "existingRows": rows,
            "ownerId": sessionMemberId,
            "onViewRecords":()=>open("records"),
            "onBack":close,
            "residencyOptions": optionSets.participantResidencies,
            "groupCatalog": defaults.groups,
            "optionSets": optionSets,
            "profile": profile,
            "user": user,
            "eventInfo": eventForList(selectedEvent, now),
            "onSave": (value: any) => save({
              ...value,
              event: eventForList(selectedEvent, now),
              eventId: selectedEvent.id
            })
          }
        })]
      }
    }),
    v11: modal === 'edit' && can('register') && can('registrations') && viewOwner.fragment("fragment53", {
      v0: Modal,
      v1: {
        "title": `修改${current.event?.name || eventName}報名`,
        "onClose": close,
        "wide": true,
        children: [viewOwner.fragment("fragment52", {
          v0: RegistrationForm,
          v1: {
            "balance": balance,
            "existingRows": rows,
            "ownerId": sessionMemberId,
            "onViewRecords":()=>open("records"),
            "residencyOptions": optionSets.participantResidencies,
            "groupCatalog": defaults.groups,
            "optionSets": optionSets,
            "eventInfo": catalog.find((event: any) => event.id === current.eventId),
            "key": current.id,
            "profile": profile,
            "user": user,
            "editing": current,
            "onSave": save,
            "onBack": () => open('records')
          }
        })]
      }
    }),
    v12: modal === 'success' && can('register') && viewOwner.fragment("fragment72", {
      v0: Modal,
      v1: {
        "title": "報名已建立（示意）",
        "onClose": close,
        children: [viewOwner.fragment("fragment71", {
          v0: viewOwner.fragment("fragment54", {
            v0: CheckCircle,
            v1: {
              "size": 56,
              "weight": "light"
            }
          }),
          v1: viewOwner.fragment("fragment55", {
            v0: current.status
          }),
          v2: viewOwner.fragment("fragment57", {
            v0: viewOwner.fragment("fragment56", {
              v0: current.id
            })
          }),
          v3: viewOwner.fragment("fragment67", {
            v0: viewOwner.fragment("fragment60", {
              v0: viewOwner.fragment("fragment58", {}),
              v1: viewOwner.fragment("fragment59", {
                v0: current.event?.name || eventName
              })
            }),
            v1: viewOwner.fragment("fragment63", {
              v0: viewOwner.fragment("fragment61", {}),
              v1: viewOwner.fragment("fragment62", {
                v0: current.group
              })
            }),
            v2: viewOwner.fragment("fragment66", {
              v0: viewOwner.fragment("fragment64", {}),
              v1: viewOwner.fragment("fragment65", {
                v0: money(current.amount)
              })
            })
          }),
          v4: viewOwner.fragment("fragment68", {}),
          v5: can('registrations') && viewOwner.fragment("fragment70", {
            v0: () => open('records'),
            v1: viewOwner.fragment("fragment69", {
              v0: ArrowRight,
              v1: {
                "size": 20
              }
            })
          })
        })]
      }
    })
  });
}
}
