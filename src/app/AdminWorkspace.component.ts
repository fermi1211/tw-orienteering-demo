import {eventDivisionCatalog,eventFeeCatalog,eventOptionErrors,legacyEventFees,validateFeeSnapshot,feeOptionIdOf,registrationFeeChoices} from '../event-options-model.js';
import {ConsentGate} from './consent-gate.component';
import {activityTermsText, DEFAULT_SIGNUP_NOTICE, DEFAULT_ACTIVITY_NOTICE} from '../consent-model.js';
import {mediaPolicy,setImageLimit} from '../media-policy.js';
import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { adminRegistrationActions, cancellationSourceLabel, softDeleteManualRegistration } from "../registration-admin-model.js";
import { FeedbackManagement } from "./Feedback.component";
import { RegistrationOrders } from "./RegistrationOrders.component";
import { orderIdOf, orderFromRows, isActiveParticipant, validateParticipants } from "../registration-order-model.js";
import { OptionParameters } from "./OptionParameters.component";
import { RoleManagement, MemberRoleAssignments } from "./RoleManagement.component";
import { MemberTagging } from "./MemberTagging.component";
import { canViewScreen, roleName } from "../access-model.js";
import { HistoricalEventManagement } from "./HistoricalEventManagement.component";
import { EventExports } from "./EventExports.component";
import { PublicVisibilitySettings } from "./PublicEventParticipation.component";
import { defaultVisibility } from "../public-event-model.js";
import { registrationClosed } from "../event-export-model.js";
import { EventAttachments } from "./EventAttachments.component";
import { MemberManagement } from "./MemberManagement.component";
import { memberFieldLabels } from "../demo-members.js";
import { RegistrationEditor } from "./RegistrationEditor.component";
const ArticleManagement={load:()=>import('./ArticleManagement.component').then(module=>module.ArticleManagement)};
const EventLocationPicker={load:()=>import('./EventLocationPicker.component').then(module=>module.EventLocationPicker)};
import { Mountains, ArrowLeft, ArrowRight, Users, CalendarBlank, SlidersHorizontal, ShieldCheck, DownloadSimple, Plus, CheckCircle, LockSimple, X, PencilSimple, Trash, ArrowCounterClockwise, UserCircle, IdentificationCard, ListNumbers, ChatCircleDots } from './icon-symbols';
const groupDefaults: any = [['ME', '男子菁英組'], ['WE', '女子菁英組'], ['MA', '男子進階組'], ['WA', '女子進階組'], ['OPEN', '公開組']].map(([code, name]) => ({
  id: code,
  code,
  name,
  active: true
}));
const feeLabels: any = {
  MEMBER: '會員',
  LEGACY_PREPAID: '舊制已預繳',
  SINGLE: '單次報名'
};
export const initialDefaults: any = {
  groups: groupDefaults,
  fees: {
    MEMBER: 0,
    LEGACY_PREPAID: 0,
    SINGLE: 450
  },
  bank: {
    name: '',
    code: '',
    accountName: '',
    number: '',
    branch: '',
    instructions: ''
  },
  notice: DEFAULT_SIGNUP_NOTICE,
  requiresConsent: true,
  template: DEFAULT_ACTIVITY_NOTICE,
  templateRequired: true
};
const paymentLabels: any = {
  NOT_REQUIRED: '不需繳款資料',
  BANK_TRANSFER: '銀行轉帳',
  ONSITE: '現場繳費',
  ADMIN_CONFIRMED: '管理員確認已繳款',
  WALLET: '儲值金付款'
};
const statusLabels: any = {
  COMPLETED: '報名完成',
  PENDING: '報名完成(待確認帳款)',
  RECONCILED: '報名完成(已完成對帳)',
  ONSITE: '報名完成(現場繳費)',
  MANUALLY_PAID: '報名完成(已繳款)',
  WALLET_PAID: '報名完成(儲值金付款)'
};
export const initialEvents: any = [{
  id: 'winter-forest',
  name: '冬日森林定向賽',
  starts: '2026-12-13T09:00',
  location: '新北市林口',
  opens: '2026-10-20T08:00',
  closes: '2026-12-06T23:59',
  mapLocation: {
    lat: 25.077,
    lng: 121.389,
    approximate: true
  },
  status: 'PUBLISHED',
  revision: 2,
  divisions: ['ME', 'WE', 'MA', 'WA', 'OPEN'],
  fees: {
    MEMBER: 0,
    LEGACY_PREPAID: 0,
    SINGLE: 450
  },
  terms: [{
    id: 't1',
    title: '示範活動告知',
    content: '示範活動條款，正式內容待主辦單位提供。',
    required: true
  }]
}, {
  id: 'city-park',
  name: '城市公園定向賽',
  starts: '2026-12-20T09:00',
  location: '台北市',
  opens: '2026-11-01T08:00',
  closes: '2026-12-13T23:59',
  mapLocation: {
    lat: 25.033,
    lng: 121.565,
    approximate: true
  },
  status: 'PUBLISHED',
  revision: 1,
  divisions: ['ME', 'WE', 'MA', 'WA', 'OPEN'],
  fees: {
    MEMBER: 0,
    LEGACY_PREPAID: 0,
    SINGLE: 450
  },
  terms: []
}, {
  id: 'mountain-trail',
  name: '山林探索定向賽',
  starts: '2026-12-27T09:00',
  location: '桃園市',
  opens: '2026-11-08T08:00',
  closes: '2026-12-20T23:59',
  mapLocation: {
    lat: 24.993,
    lng: 121.301,
    approximate: true
  },
  status: 'PUBLISHED',
  revision: 1,
  divisions: ['ME', 'WE', 'MA', 'WA', 'OPEN'],
  fees: {
    MEMBER: 0,
    LEGACY_PREPAID: 0,
    SINGLE: 450
  },
  terms: []
}, {
  id: 'spring-draft',
  name: '春日林間定向賽',
  starts: '2027-01-10T09:00',
  location: '場地待確認',
  opens: '2026-12-01T08:00',
  closes: '2027-01-03T23:59',
  status: 'DRAFT',
  revision: 1,
  divisions: ['ME', 'WE', 'MA', 'WA', 'OPEN'],
  fees: {
    MEMBER: 0,
    LEGACY_PREPAID: 0,
    SINGLE: 450
  },
  terms: []
}, {
  id: 'autumn-closed-demo',
  name: '秋日定向賽（已截止示範）',
  starts: '2026-10-18T09:00',
  location: '新北市',
  opens: '2026-09-01T08:00',
  closes: '2026-10-11T23:59',
  status: 'PUBLISHED',
  revision: 1,
  divisions: ['ME', 'WE', 'MA', 'WA', 'OPEN'],
  fees: {
    MEMBER: 0,
    LEGACY_PREPAID: 0,
    SINGLE: 450
  },
  terms: []
}];
const initialRows: any = [{
  id: 'DEMO-260001',
  name: '示範選手甲',
  nickname: '林間小鹿',
  division: 'OPEN',
  fee: 'SINGLE',
  payment: 'BANK_TRANSFER',
  status: 'PENDING',
  amount: 450,
  last5: '00123',
  date: '2026-10-20'
}, {
  id: 'DEMO-260002',
  name: '示範選手乙',
  nickname: '山徑',
  division: 'ME',
  fee: 'MEMBER',
  payment: 'NOT_REQUIRED',
  status: 'COMPLETED',
  amount: 0
}, {
  id: 'DEMO-260003',
  name: '示範選手丙',
  nickname: 'Forest Runner',
  division: 'MA',
  fee: 'SINGLE',
  payment: 'ONSITE',
  status: 'ONSITE',
  amount: 450
}, {
  id: 'DEMO-260004',
  name: '示範選手丁',
  nickname: ' ',
  division: 'WE',
  fee: 'LEGACY_PREPAID',
  payment: 'NOT_REQUIRED',
  status: 'COMPLETED',
  amount: 0
}, {
  id: 'DEMO-260005',
  name: '示範選手戊',
  nickname: '指南針',
  division: 'WA',
  fee: 'SINGLE',
  payment: 'BANK_TRANSFER',
  status: 'RECONCILED',
  amount: 450,
  last5: '00567',
  date: '2026-10-20'
}, {
  id: 'DEMO-260006',
  name: '示範選手己',
  nickname: '苔蘚',
  division: 'OPEN',
  fee: 'SINGLE',
  payment: 'BANK_TRANSFER',
  status: 'PENDING',
  amount: 450,
  last5: '00345',
  date: '2026-10-21'
}, {
  id: 'DEMO-260007',
  name: '示範選手甲',
  nickname: '林間小鹿',
  division: 'MA',
  fee: 'MEMBER',
  payment: 'NOT_REQUIRED',
  status: 'COMPLETED',
  amount: 0
}].map((row: any, index: any) => ({
  ...row,
  eventId: 'winter-forest',
  email: `demo-${index + 1}@example.test`,
  residency: row.payment === 'ONSITE' ? 'FOREIGN' : 'DOMESTIC',
  phone: '0900000000',
  emergencyName: '示範聯絡人',
  emergencyPhone: '0900000001',
  bankVersion: row.payment === 'BANK_TRANSFER' ? '示範版本 1' : null
}));
const closedDemoRows: any = Array.from({
  length: 32
}, (_: any, index: any) => ({
  ...initialRows[index % initialRows.length],
  id: `DEMO-CLOSED-${String(index + 1).padStart(3, '0')}`,
  eventId: 'autumn-closed-demo',
  name: `示範選手${String(index + 1).padStart(2, '0')}`,
  nickname: index % 5 === 0 ? '' : `森林旅人${String(index + 1).padStart(2, '0')}`,
  division: index < 20 ? index % 2 ? 'ME' : 'WE' : ['WA', 'MA', 'OPEN'][(index - 20) % 3]
}));
export const initialRegistrationRows: any = [...initialRows, ...closedDemoRows];
const displayName: any = (row: any) => row.displayNameOverride?.trim() || row.nickname?.trim() || row.name;
const canReconcile: any = (row: any) => !row.removedAt && row.fee === 'SINGLE' && row.payment === 'BANK_TRANSFER' && row.status === 'PENDING';
const price: any = (n: any) => `NT$${n}`;
@Component({selector:'demo-event-editor',standalone:true,imports:[ScreenDialog,ConsentGate, ViewComponent, IconComponent],host:{style:'display: contents'},templateUrl:'./AdminWorkspace.EventEditor.html'})
export class EventEditor extends ViewController {
 localGroups:any[]|null=null;
 localFees:any[]|null=null;
 addGroup(){this.localGroups=[...this.localGroups!,{id:crypto.randomUUID(),code:'',name:'',active:true}];this.update();}
 addFee(){this.localFees=[...this.localFees!,{id:crypto.randomUUID(),kind:'SINGLE',name:'',amount:450,active:true}];this.update();}
 editOption(kind:string,id:string,key:string,value:any){
  const items=kind==='group'?this.localGroups!:this.localFees!;
  const next=items.map(item=>item.id===id?{...item,[key]:value}:item);
  if(kind==='group')this.localGroups=next;else this.localFees=next;
  this.setError('');this.update();
 }

 previewTerms=false;
 closeTermsPreview=()=>{this.previewTerms=false;};
 get termsPreviewContent(){return activityTermsText({terms:this.ui.terms});}
 editorTabs=[{id:'main',name:'基本資訊'},{id:'map',name:'活動地圖'},{id:'fees',name:'參賽組別'},{id:'images',name:'圖片與附件'},{id:'terms',name:'條款與公開資訊'}];
private _state_terms:any; private _ready_terms=false;
private setTerms=(next:any)=>{const value=typeof next==='function'?next(this._state_terms):next;if(!Object.is(value,this._state_terms)){this._state_terms=value;this.update();}};
private _state_error:any; private _ready_error=false;
private setError=(next:any)=>{const value=typeof next==='function'?next(this._state_error):next;if(!Object.is(value,this._state_error)){this._state_error=value;this.update();}};
private _state_attachments:any; private _ready_attachments=false;
private setAttachments=(next:any)=>{const value=typeof next==='function'?next(this._state_attachments):next;if(!Object.is(value,this._state_attachments)){this._state_attachments=value;this.update();}};
private _state_publicVisibility:any; private _ready_publicVisibility=false;
private setPublicVisibility=(next:any)=>{const value=typeof next==='function'?next(this._state_publicVisibility):next;if(!Object.is(value,this._state_publicVisibility)){this._state_publicVisibility=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    initial,
    defaults,
    onSave,
    Dialog,
    onClose
  } = propsValue;
  const published: any = initial?.status === 'PUBLISHED';
  if (!this._ready_terms) {
    const stateInitial: any = () => initial?.terms || (defaults.template?.trim() ? [{
      id: crypto.randomUUID(),
      title: '活動告知',
      content: defaults.template,
      required: defaults.templateRequired
    }] : []);
    this._state_terms = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_terms = true;
  }
  const terms: any = this._state_terms;
  const setTerms: any = this.setTerms;
  if (!this._ready_error) {
    const stateInitial: any = '';
    this._state_error = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_error = true;
  }
  const error: any = this._state_error;
  const setError: any = this.setError;
  if (!this._ready_attachments) {
    const stateInitial: any = () => initial?.attachments || {
      images: [],
      documents: []
    };
    this._state_attachments = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_attachments = true;
  }
  const attachments: any = this._state_attachments;
  const setAttachments: any = this.setAttachments;
  if (!this._ready_publicVisibility) {
    const stateInitial: any = () => ({
      ...defaultVisibility,
      ...initial?.publicVisibility
    });
    this._state_publicVisibility = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_publicVisibility = true;
  }
  const publicVisibility: any = this._state_publicVisibility;
  const setPublicVisibility: any = this.setPublicVisibility;
  if(this.localGroups===null)this.localGroups=eventDivisionCatalog(initial,defaults.groups);
  if(this.localFees===null)this.localFees=eventFeeCatalog(initial||{fees:defaults.fees});
  const divisionOptions=this.localGroups;
  const eventFees=this.localFees;
  const divisions=divisionOptions.filter((group:any)=>group.active!==false).map((group:any)=>group.code);
  function submit(event: any) {
    event.preventDefault();
    const form: any = new FormData(event.currentTarget),
      publish: any = event.submitter?.value === 'publish';
    const name: any = String(form.get('name') || '').trim();
    const latitude: any = String(form.get('mapLatitude') || '').trim(),
      longitude: any = String(form.get('mapLongitude') || '').trim();
    if (Boolean(latitude) !== Boolean(longitude) || latitude && (!Number.isFinite(Number(latitude)) || Math.abs(Number(latitude)) > 85 || !Number.isFinite(Number(longitude)) || Math.abs(Number(longitude)) > 180)) {
      setError('請同時填寫有效緯度（-85 至 85）與經度（-180 至 180），或將兩欄一併留空。');
      return;
    }
    const mapLocation: any = latitude ? {
      lat: Number(latitude),
      lng: Number(longitude),
      approximate: form.has('mapApproximate')
    } : null;
    const next: any = {
      ...initial,
      attachments,
      mapLocation,
      name,
      starts: String(form.get('starts') || ''),
      location: String(form.get('location') || '').trim(),
      opens: String(form.get('opens') || ''),
      closes: String(form.get('closes') || ''),
      divisions: divisionOptions.filter((group:any)=>group.active!==false).map((group:any)=>group.code.trim().toUpperCase()),
      divisionCatalog: divisionOptions.map((group:any)=>({...group,code:group.code.trim().toUpperCase(),name:group.name.trim()})),
      feeCatalog: eventFees.map((fee:any)=>({...fee,name:fee.name.trim()})),
      fees: legacyEventFees(eventFees),
      terms,
      status: published || publish ? 'PUBLISHED' : 'DRAFT',
      description: String(form.get('description') || ''),
      summary: String(form.get('summary') || '').trim()
    };
    if (!name) {
      setError('請填寫賽事名稱。');
      return;
    }
    if ((publish || published) && (!next.starts || !next.location || !next.opens || !next.closes || !next.divisions.length)) {
      setError('發布賽事須完整填寫日期、地點、報名期間與至少一個組別。');
      return;
    }
    if (next.opens && next.closes && next.opens >= next.closes) {
      setError('報名開始時間必須早於截止時間。');
      return;
    }
    const optionErrors=eventOptionErrors(next.divisionCatalog,next.feeCatalog,{published:publish||published});
    if(optionErrors.length){setError(optionErrors[0]);return;}
    if (published && !next.summary) {
      setError('更新已發布賽事請填寫公開更新摘要。');
      return;
    }
    if ((publish || published) && terms.some((term: any) => !term.title.trim() || !term.content.trim())) {
      setError('請完成活動條款標題與內容。');
      return;
    }
    onSave({
      ...next,
      publicVisibility
    });
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,adminRegistrationActions,cancellationSourceLabel,softDeleteManualRegistration,FeedbackManagement,RegistrationOrders,orderIdOf,orderFromRows,isActiveParticipant,validateParticipants,OptionParameters,RoleManagement,MemberRoleAssignments,MemberTagging,canViewScreen,roleName,HistoricalEventManagement,EventExports,PublicVisibilitySettings,defaultVisibility,registrationClosed,EventAttachments,MemberManagement,memberFieldLabels,RegistrationEditor,ArticleManagement,EventLocationPicker,Mountains,ArrowLeft,ArrowRight,Users,CalendarBlank,SlidersHorizontal,ShieldCheck,DownloadSimple,Plus,CheckCircle,LockSimple,X,PencilSimple,Trash,ArrowCounterClockwise,UserCircle,IdentificationCard,ListNumbers,ChatCircleDots,groupDefaults,feeLabels,initialDefaults,paymentLabels,statusLabels,initialEvents,initialRows,closedDemoRows,initialRegistrationRows,displayName,canReconcile,price,EventEditor,SettingsPanel,AdminWorkspace,initial,defaults,onSave,Dialog,onClose,published,terms,setTerms,error,setError,attachments,setAttachments,publicVisibility,setPublicVisibility,divisions,eventFees,divisionOptions,submit};
  return null;
}
}

@Component({selector:'demo-settings-panel',standalone:true,imports:[ScreenDialog,ConsentGate],host:{style:'display: contents'},templateUrl:'./AdminWorkspace.SettingsPanel.html'})
export class SettingsPanel extends ViewController {
 get activeTab(){return this.props["tab"]||this.panel;}
 settingsSaved=false;
 noticeDraft:string|null=null;
 templateDraft:string|null=null;
 previewKind:'notice'|'template'|null=null;
 closePreview=()=>{this.previewKind=null;};
 editNotice(value:string){this.noticeDraft=value;this.settingsSaved=false;}
 editTemplate(value:string){this.templateDraft=value;this.settingsSaved=false;}
 get imageLimit(){return mediaPolicy.maxImages;}
 bankFields=[{key:'name',name:'bankName',label:'銀行名稱'},{key:'code',name:'bankCode',label:'銀行代碼'},{key:'accountName',name:'accountName',label:'戶名'},{key:'number',name:'accountNumber',label:'帳號'},{key:'branch',name:'branch',label:'分行'}];
private _state_groups:any; private _ready_groups=false;
private setGroups=(next:any)=>{const value=typeof next==='function'?next(this._state_groups):next;if(!Object.is(value,this._state_groups)){this._state_groups=value;this.update();}};
private _state_error:any; private _ready_error=false;
private setError=(next:any)=>{const value=typeof next==='function'?next(this._state_error):next;if(!Object.is(value,this._state_error)){this._state_error=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    defaults,
    onSave
  } = propsValue;
  if(this.noticeDraft===null)this.noticeDraft=defaults.notice || DEFAULT_SIGNUP_NOTICE;
  if(this.templateDraft===null)this.templateDraft=defaults.template || DEFAULT_ACTIVITY_NOTICE;
  if (!this._ready_groups) {
    const stateInitial: any = defaults.groups;
    this._state_groups = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_groups = true;
  }
  const groups: any = this._state_groups;
  const setGroups: any = this.setGroups;
  if (!this._ready_error) {
    const stateInitial: any = '';
    this._state_error = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_error = true;
  }
  const error: any = this._state_error;
  const setError: any = this.setError;
  function submit(event: any) {
    event.preventDefault();
    const form: any = new FormData(event.currentTarget);
    if(!viewOwner.noticeDraft?.trim()||!viewOwner.templateDraft?.trim()){setError('請填寫註冊告知及活動條款預設內容。');return;}
    const fees: any = Object.fromEntries(Object.keys(feeLabels).map((key: any) => [key, Number(form.get(key))]));
    if (groups.some((group: any) => !group.name.trim() || !group.code.trim()) || new Set(groups.map((group: any) => group.code.toUpperCase())).size !== groups.length) {
      setError('請確認組別名稱與代碼完整，且代碼不重複。');
      return;
    }
    if (Object.values(fees).some((value: any) => !Number.isInteger(value) || value < 0)) {
      setError('費用必須是 0 或正整數。');
      return;
    }
    try{setImageLimit(form.get('imageLimit'));}catch(problem:any){setError(problem.message);return;}
    viewOwner.settingsSaved=true;
    setError('');
    onSave({
      ...defaults,
      groups,
      fees,
      bank: {
        name: form.get('bankName'),
        code: form.get('bankCode'),
        accountName: form.get('accountName'),
        number: form.get('accountNumber'),
        branch: form.get('branch'),
        instructions: form.get('bankInstructions')
      },
      notice: viewOwner.noticeDraft,
      requiresConsent: true,
      template: viewOwner.templateDraft,
      templateRequired: true
    });
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,adminRegistrationActions,cancellationSourceLabel,softDeleteManualRegistration,FeedbackManagement,RegistrationOrders,orderIdOf,orderFromRows,isActiveParticipant,validateParticipants,OptionParameters,RoleManagement,MemberRoleAssignments,MemberTagging,canViewScreen,roleName,HistoricalEventManagement,EventExports,PublicVisibilitySettings,defaultVisibility,registrationClosed,EventAttachments,MemberManagement,memberFieldLabels,RegistrationEditor,ArticleManagement,EventLocationPicker,Mountains,ArrowLeft,ArrowRight,Users,CalendarBlank,SlidersHorizontal,ShieldCheck,DownloadSimple,Plus,CheckCircle,LockSimple,X,PencilSimple,Trash,ArrowCounterClockwise,UserCircle,IdentificationCard,ListNumbers,ChatCircleDots,groupDefaults,feeLabels,initialDefaults,paymentLabels,statusLabels,initialEvents,initialRows,closedDemoRows,initialRegistrationRows,displayName,canReconcile,price,EventEditor,SettingsPanel,AdminWorkspace,defaults,onSave,groups,setGroups,error,setError,submit};
  return null;
}
}

@Component({selector:'demo-admin-workspace',standalone:true,imports:[ViewComponent, FormValue, IconComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./AdminWorkspace.AdminWorkspace.html'})
export class AdminWorkspace extends ViewController {
 settingsTabs=[{id:'main',name:'費用與組別'},{id:'bank',name:'收款資訊'},{id:'terms',name:'告知範本'},{id:'articleCategories',name:'文章分類'},{id:'feedbackTypes',name:'回饋類型'},{id:'registrationModes',name:'報名模式'},{id:'memberLabels',name:'會員標籤'},{id:'participantResidencies',name:'國籍分類'},{id:'registrationFees',name:'繳費選項'}];
 rosterStatus(row:any){if(row.cancelledAt)return '已取消';return ({PENDING:'待確認',RECONCILED:'已完成對帳',ONSITE:'現場完成',COMPLETED:'報名完成',MANUALLY_PAID:'已繳款',WALLET_PAID:'儲值金付款'} as any)[row.status]||row.status;}
 rosterQuery='';rosterSource='';eventQuery='';eventStatus='';
 filteredEvents(){return this.ui.catalog.filter((event:any)=>(!this.eventStatus||event.status===this.eventStatus)&&`${event.name} ${event.location}`.toLowerCase().includes(this.eventQuery.trim().toLowerCase()));}

  detailFields=[{key:'name',label:'姓名'},{key:'nickname',label:'綽號'},{key:'email',label:'Email'},{key:'phone',label:'聯絡電話'},{key:'division',label:'組別'},{key:'emergencyName',label:'緊急聯絡人'},{key:'emergencyPhone',label:'緊急聯絡電話'},{key:'source',label:'報名來源'}];
  changeVisibility=(value:any)=>this.ui.setCatalog(this.ui.catalog.map((event:any)=>event.id===this.ui.currentEvent.id?{...event,publicVisibility:value}:event));
  saveStart=(value:any)=>this.ui.setSavedOrders({...this.ui.savedOrders,[this.ui.currentEvent.id]:value});
  leaveArticle(){const action=this.ui.articleNavigation;this.ui.setArticleNavigation(null);this.ui.setArticleDirty(false);action?.();}

private _state_requestedSection:any; private _ready_requestedSection=false;
private setSection=(next:any)=>{const value=typeof next==='function'?next(this._state_requestedSection):next;if(!Object.is(value,this._state_requestedSection)){this._state_requestedSection=value;this.update();}};
private _state_articleDirty:any; private _ready_articleDirty=false;
private setArticleDirty=(next:any)=>{const value=typeof next==='function'?next(this._state_articleDirty):next;if(!Object.is(value,this._state_articleDirty)){this._state_articleDirty=value;this.update();}};
private _state_articleNavigation:any; private _ready_articleNavigation=false;
private setArticleNavigation=(next:any)=>{const value=typeof next==='function'?next(this._state_articleNavigation):next;if(!Object.is(value,this._state_articleNavigation)){this._state_articleNavigation=value;this.update();}};
private _state_exportTab:any; private _ready_exportTab=false;
private setExportTab=(next:any)=>{const value=typeof next==='function'?next(this._state_exportTab):next;if(!Object.is(value,this._state_exportTab)){this._state_exportTab=value;this.update();}};
private _state_selectedEvent:any; private _ready_selectedEvent=false;
private setSelectedEvent=(next:any)=>{const value=typeof next==='function'?next(this._state_selectedEvent):next;if(!Object.is(value,this._state_selectedEvent)){this._state_selectedEvent=value;this.update();}};
private _state_showFilters:any; private _ready_showFilters=false;
private setShowFilters=(next:any)=>{const value=typeof next==='function'?next(this._state_showFilters):next;if(!Object.is(value,this._state_showFilters)){this._state_showFilters=value;this.update();}};
private _state_filters:any; private _ready_filters=false;
private setFilters=(next:any)=>{const value=typeof next==='function'?next(this._state_filters):next;if(!Object.is(value,this._state_filters)){this._state_filters=value;this.update();}};
private _state_detail:any; private _ready_detail=false;
private setDetail=(next:any)=>{const value=typeof next==='function'?next(this._state_detail):next;if(!Object.is(value,this._state_detail)){this._state_detail=value;this.update();}};
private _state_confirm:any; private _ready_confirm=false;
private setConfirm=(next:any)=>{const value=typeof next==='function'?next(this._state_confirm):next;if(!Object.is(value,this._state_confirm)){this._state_confirm=value;this.update();}};
private _state_reconciliationError:any; private _ready_reconciliationError=false;
private setReconciliationError=(next:any)=>{const value=typeof next==='function'?next(this._state_reconciliationError):next;if(!Object.is(value,this._state_reconciliationError)){this._state_reconciliationError=value;this.update();}};
private _state_reconciliationMember:any; private _ready_reconciliationMember=false;
private setReconciliationMember=(next:any)=>{const value=typeof next==='function'?next(this._state_reconciliationMember):next;if(!Object.is(value,this._state_reconciliationMember)){this._state_reconciliationMember=value;this.update();}};
private _state_editor:any; private _ready_editor=false;
private setEditor=(next:any)=>{const value=typeof next==='function'?next(this._state_editor):next;if(!Object.is(value,this._state_editor)){this._state_editor=value;this.update();}};
private _state_notice:any; private _ready_notice=false;
private setNotice=(next:any)=>{const value=typeof next==='function'?next(this._state_notice):next;if(!Object.is(value,this._state_notice)){this._state_notice=value;this.update();}};
private _state_registrationEditor:any; private _ready_registrationEditor=false;
private setRegistrationEditor=(next:any)=>{const value=typeof next==='function'?next(this._state_registrationEditor):next;if(!Object.is(value,this._state_registrationEditor)){this._state_registrationEditor=value;this.update();}};
private _state_deleteTarget:any; private _ready_deleteTarget=false;
private setDeleteTarget=(next:any)=>{const value=typeof next==='function'?next(this._state_deleteTarget):next;if(!Object.is(value,this._state_deleteTarget)){this._state_deleteTarget=value;this.update();}};
private _state_deleteError:any; private _ready_deleteError=false;
private setDeleteError=(next:any)=>{const value=typeof next==='function'?next(this._state_deleteError):next;if(!Object.is(value,this._state_deleteError)){this._state_deleteError=value;this.update();}};
private _state_showDeleted:any; private _ready_showDeleted=false;
private setShowDeleted=(next:any)=>{const value=typeof next==='function'?next(this._state_showDeleted):next;if(!Object.is(value,this._state_showDeleted)){this._state_showDeleted=value;this.update();}};
private _state_showCancelled:any; private _ready_showCancelled=false;
private setShowCancelled=(next:any)=>{const value=typeof next==='function'?next(this._state_showCancelled):next;if(!Object.is(value,this._state_showCancelled)){this._state_showCancelled=value;this.update();}};
private _state_registrationSaveError:any; private _ready_registrationSaveError=false;
private setRegistrationSaveError=(next:any)=>{const value=typeof next==='function'?next(this._state_registrationSaveError):next;if(!Object.is(value,this._state_registrationSaveError)){this._state_registrationSaveError=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    onReconcileRegistration,
    onCancelRegistration,
    financeNotice,
    feedbackRecords,
    setFeedbackRecords,
    roles,
    setRoles,
    optionSets,
    setOptionSets,
    members,
    setMembers,
    defaults,
    setDefaults,
    currentMemberId,
    onSwitchMember,
    historicalEvents,
    setHistoricalEvents,
    onOpenHistorical,
    onExit,
    onMemberMode,
    Dialog,
    catalog,
    setCatalog,
    rows,
    setRows,
    savedOrders,
    setSavedOrders,
    articleRecords,
    setArticleRecords,
    onOpenArticle,
    initialRole = 'MANAGER'
  } = propsValue;
  if (!this._ready_requestedSection) {
    const stateInitial: any = () => new URLSearchParams(window.location.search).get('section') || 'registrations';
    this._state_requestedSection = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_requestedSection = true;
  }
  const requestedSection: any = this._state_requestedSection;
  const setSection: any = this.setSection;
  if (!this._ready_articleDirty) {
    const stateInitial: any = false;
    this._state_articleDirty = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_articleDirty = true;
  }
  const articleDirty: any = this._state_articleDirty;
  const setArticleDirty: any = this.setArticleDirty;
  if (!this._ready_articleNavigation) {
    const stateInitial: any = null;
    this._state_articleNavigation = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_articleNavigation = true;
  }
  const articleNavigation: any = this._state_articleNavigation;
  const setArticleNavigation: any = this.setArticleNavigation;
  function navigate(action: any) {
    if (articleDirty) {
      setArticleNavigation(() => action);
      return;
    }
    action();
  }
  const role: any = initialRole;
  const feeLabels: any = Object.fromEntries(optionSets.registrationFees.map((option: any) => [option.id, option.name]));
  const allowed: any = (id: any) => canViewScreen(roles, propsValue.roleIds || role, `admin.${id}`);
  if (!this._ready_exportTab) {
    const stateInitial: any = 'entry';
    this._state_exportTab = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_exportTab = true;
  }
  const exportTab: any = this._state_exportTab;
  const setExportTab: any = this.setExportTab;
  if (!this._ready_selectedEvent) {
    const stateInitial: any = 'winter-forest';
    this._state_selectedEvent = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_selectedEvent = true;
  }
  const selectedEvent: any = this._state_selectedEvent;
  const setSelectedEvent: any = this.setSelectedEvent;
  if (!this._ready_showFilters) {
    const stateInitial: any = false;
    this._state_showFilters = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_showFilters = true;
  }
  const showFilters: any = this._state_showFilters;
  const setShowFilters: any = this.setShowFilters;
  if (!this._ready_filters) {
    const stateInitial: any = {
      division: '',
      fee: '',
      status: '',
      payment: ''
    };
    this._state_filters = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_filters = true;
  }
  const filters: any = this._state_filters;
  const setFilters: any = this.setFilters;
  if (!this._ready_detail) {
    const stateInitial: any = null;
    this._state_detail = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_detail = true;
  }
  const detail: any = this._state_detail;
  const setDetail: any = this.setDetail;
  if (!this._ready_confirm) {
    const stateInitial: any = null;
    this._state_confirm = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_confirm = true;
  }
  const confirm: any = this._state_confirm;
  const setConfirm: any = this.setConfirm;
  if (!this._ready_reconciliationError) {
    const stateInitial: any = '';
    this._state_reconciliationError = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_reconciliationError = true;
  }
  const reconciliationError: any = this._state_reconciliationError;
  const setReconciliationError: any = this.setReconciliationError;
  if (!this._ready_reconciliationMember) {
    const stateInitial: any = '';
    this._state_reconciliationMember = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_reconciliationMember = true;
  }
  const reconciliationMember: any = this._state_reconciliationMember;
  const setReconciliationMember: any = this.setReconciliationMember;
  if (!this._ready_editor) {
    const stateInitial: any = null;
    this._state_editor = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_editor = true;
  }
  const editor: any = this._state_editor;
  const setEditor: any = this.setEditor;
  if (!this._ready_notice) {
    const stateInitial: any = '';
    this._state_notice = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_notice = true;
  }
  const notice: any = this._state_notice;
  const setNotice: any = this.setNotice;
  if (!this._ready_registrationEditor) {
    const stateInitial: any = null;
    this._state_registrationEditor = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_registrationEditor = true;
  }
  const registrationEditor: any = this._state_registrationEditor;
  const setRegistrationEditor: any = this.setRegistrationEditor;
  if (!this._ready_deleteTarget) {
    const stateInitial: any = null;
    this._state_deleteTarget = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_deleteTarget = true;
  }
  const deleteTarget: any = this._state_deleteTarget;
  const setDeleteTarget: any = this.setDeleteTarget;
  if (!this._ready_deleteError) {
    const stateInitial: any = '';
    this._state_deleteError = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_deleteError = true;
  }
  const deleteError: any = this._state_deleteError;
  const setDeleteError: any = this.setDeleteError;
  if (!this._ready_showDeleted) {
    const stateInitial: any = false;
    this._state_showDeleted = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_showDeleted = true;
  }
  const showDeleted: any = this._state_showDeleted;
  const setShowDeleted: any = this.setShowDeleted;
  if (!this._ready_showCancelled) {
    const stateInitial: any = false;
    this._state_showCancelled = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_showCancelled = true;
  }
  const showCancelled: any = this._state_showCancelled;
  const setShowCancelled: any = this.setShowCancelled;
  if (!this._ready_registrationSaveError) {
    const stateInitial: any = '';
    this._state_registrationSaveError = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_registrationSaveError = true;
  }
  const registrationSaveError: any = this._state_registrationSaveError;
  const setRegistrationSaveError: any = this.setRegistrationSaveError;
  const currentEvent: any = catalog.find((event: any) => event.id === selectedEvent) || catalog[0];
  const divisionChoices=[...new Set([...currentEvent.divisions,...rows.filter((row:any)=>row.eventId===currentEvent.id).map((row:any)=>row.division)])];
  const rosterFeeChoices=registrationFeeChoices(currentEvent,optionSets.registrationFees,rows.filter((row:any)=>row.eventId===currentEvent.id));
  const labelStatus:any=(row:any)=>viewOwner.fragment('statusLabel',{class:'roster-status status-'+row.status.toLowerCase(),text:row.cancelledAt?('已取消報名'+(canReconcile(row)?' · 待核款回存':'')):statusLabels[row.status]});
const visibleRows: any = rows.filter((row: any) => row.eventId === currentEvent.id && (!viewOwner.rosterQuery || `${displayName(row)} ${row.id} ${orderIdOf(row)} ${row.name||''}`.toLowerCase().includes(viewOwner.rosterQuery.trim().toLowerCase())) && (!viewOwner.rosterSource || (viewOwner.rosterSource==='MANUAL'?row.source?.startsWith('MANUAL'):!row.source?.startsWith('MANUAL'))) && (showCancelled ? Boolean(row.cancelledAt) : showDeleted ? Boolean(row.deletedAt) && !row.cancelledAt : isActiveParticipant(row)) && Object.entries(filters).every(([key, value]) => !value || (key==='fee'?feeOptionIdOf(row):row[key]) === value));
  const visibleOrderCount = new Set(visibleRows.map(orderIdOf)).size;
  const menu: any = [{
    id: 'registrations',
    title: '報名名單',
    icon: Users
  }, {
    id: 'events',
    title: '賽事管理',
    icon: CalendarBlank
  }, {
    id: 'history',
    title: '歷史賽事',
    icon: ArrowCounterClockwise
  }, {
    id: 'articles',
    title: '專欄文章',
    icon: PencilSimple
  }, {
    id: 'exports',
    title: '名單與出發序',
    icon: ListNumbers
  }, {
    id: 'feedback',
    title: '意見回饋',
    icon: ChatCircleDots
  }, {
    id: 'settings',
    title: '參數設定',
    icon: SlidersHorizontal
  }, {
    id: 'tags',
    title: '會員標注',
    icon: Users
  }, {
    id: 'members',
    title: '會員管理',
    icon: IdentificationCard
  }, {
    id: 'roles',
    title: '角色與畫面權限',
    icon: ShieldCheck
  }, {
    id: 'assignments',
    title: '會員角色指派',
    icon: UserCircle
  }].filter((item: any) => allowed(item.id));
  const section: any = menu.some((item: any) => item.id === requestedSection) ? requestedSection : menu[0]?.id;
  const title: any = menu.find((item: any) => item.id === section)?.title || '報名名單';
  function openExports(id: any, tab: any) {
    if (!allowed('exports')) return;
    setSelectedEvent(id);
    setExportTab(tab);
    setSection('exports');
    setNotice('');
    window.scrollTo(0, 0);
  }
  function filter(key: any, value: any) {
    setFilters((previous: any) => ({
      ...previous,
      [key]: value
    }));
    setNotice('');
  }
  function openReconciliation(row: any, cancel = false) {
    setConfirm({
      ...row,
      cancel
    });
    setReconciliationError('');
    setReconciliationMember('');
  }
  function reconcile(row: any) {
    try {
      onReconcileRegistration(orderIdOf(row), !row.cancel, reconciliationMember);
      setConfirm(null);
      setDetail(null);
      setReconciliationError('');
      setNotice('');
    } catch (error) {
      setReconciliationError(error.message);
    }
  }
  const confirmOrder: any = confirm ? orderFromRows(rows, orderIdOf(confirm)) : null;
  function saveEvent(value: any) {
    value = {
      ...value,
      updatedAt: new Date().toLocaleDateString('sv-SE', {
        timeZone: 'Asia/Taipei'
      }).replaceAll('-', '.')
    };
    const id: any = value.id || `event-${crypto.randomUUID()}`;
    setCatalog((previous: any) => value.id ? previous.map((event: any) => event.id === id ? {
      ...value,
      revision: event.revision + 1
    } : event) : [...previous, {
      ...value,
      id,
      revision: 1
    }]);
    setEditor(null);
    setNotice('示範賽事已儲存。已發布賽事的附件可返回報名網站查看；重新整理即清除。');
  }
  function saveMember(id: any, changes: any) {
    if (role !== 'ADMIN') return;
    const current: any = members.find((person: any) => person.id === id);
    if (!current) return;
    const fields: any = Object.keys(memberFieldLabels).filter((key: any) => Object.hasOwn(changes, key) && changes[key] !== current[key]);
    if (!fields.length) return;
    const allowed: any = Object.fromEntries(fields.map((key: any) => [key, changes[key]]));
    const entry: any = {
      id: crypto.randomUUID(),
      time: new Date().toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei',
        hour12: false
      }),
      fields,
      before: Object.fromEntries(fields.map((key: any) => [key, current[key]])),
      after: allowed
    };
    setMembers((previous: any) => previous.map((person: any) => person.id === id ? {
      ...person,
      ...allowed,
      revision: person.revision + 1,
      history: [...person.history, entry]
    } : person));
    setNotice(`已更新 ${current.number} 的會員資料；Email、身分類別及既有報名紀錄保留。`);
    window.scrollTo(0, 0);
  }
  function saveRegistration(value: any) {
    const id: any = value.id || `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      ownerId: any = value.ownerId || value.memberId;
    const invalid: any = validateParticipants([{
      name: displayName(value),
      group: value.division
    }], [...currentEvent.divisions,...(value.id?[rows.find((row:any)=>row.id===id)?.division]:[])], {
      existingRows: rows.filter((row: any) => row.id !== id),
      ownerId,
      eventId: currentEvent.id
    });
    if (invalid) {
      setRegistrationSaveError(invalid);
      return;
    }
    const feeError=validateFeeSnapshot(value,currentEvent,rows.find((row:any)=>row.id===id));
    if(feeError){setRegistrationSaveError(feeError);return;}
    setRows((previous: any) => value.id ? previous.map((row: any) => row.id === id ? {
      ...value,
      id,
      ownerId
    } : row) : [...previous, {
      ...value,
      id,
      ownerId
    }]);
    setRegistrationEditor(null);
    setRegistrationSaveError('');
    setShowDeleted(false);
    setShowCancelled(false);
    setFilters({
      division: '',
      fee: '',
      status: '',
      payment: ''
    });
    setNotice(`${id} 的示範報名已${value.id ? '更新' : '建立'}；會員帳號資料未變更。`);
  }
  function deleteRegistration(e: any) {
    e.preventDefault();
    const reason: any = String(new FormData(e.currentTarget).get('reason') || '').trim();
    try {
      const next: any = softDeleteManualRegistration(rows, deleteTarget.id, reason, {
        id: currentMemberId,
        role,
        manageRegistrations: allowed('registrations')
      });
      setRows(next);
      setNotice(`已刪除 ${deleteTarget.id}，可至「已刪除」復原。`);
      setDeleteTarget(null);
      setDetail(null);
    } catch (error) {
      setDeleteError(error.message);
    }
  }
  function restoreRegistration(row: any) {
    setRows((previous: any) => previous.map((item: any) => item.id === row.id ? {
      ...item,
      deletedAt: null,
      deleteReason: ''
    } : item));
    setNotice(`已復原 ${row.id}，原編號與對帳狀態保留。`);
  }
  function exportCsv() {
    const csvCell: any = (value: any) => {
      let text: any = String(value ?? '');
      if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
      return '"' + text.replaceAll('"', '""') + '"';
    };
    const headers: any = ['整筆報名編號', '報名編號', '顯示名稱', '姓名', '綽號', '組別', '費用類別', '付款方式', '金額', '報名狀態', '取消來源', '取消時間', '取消操作者', '已回存儲值金', ...(showDeleted ? ['刪除原因', '刪除時間'] : [])];
    const lines: any = visibleRows.map((row: any) => [orderIdOf(row), row.id, displayName(row), row.name, row.nickname, row.division, row.feeName||feeLabels[row.fee], paymentLabels[row.payment], row.amount, row.cancelledAt ? `已取消報名${canReconcile(row) ? ' · 待核款回存' : ''}` : statusLabels[row.status], row.cancelledAt ? cancellationSourceLabel(row) : '', row.cancelledAt || '', row.cancelledBy || '', row.creditReturned || 0, ...(showDeleted ? [row.deleteReason, row.deletedAt] : [])]);
    const blob: any = new Blob(['\uFEFF' + [headers, ...lines].map((line: any) => line.map(csvCell).join(',')).join('\r\n')], {
      type: 'text/csv;charset=utf-8;'
    });
    const url: any = URL.createObjectURL(blob),
      link: any = document.createElement('a');
    link.href = url;
    link.download = '示範報名名單.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`已匯出目前篩選的 ${visibleRows.length} 筆示範名單。`);
  }
  const rowActions: any = (row: any) => {
    const actions: any = adminRegistrationActions(row, currentEvent),
      order: any = orderFromRows(rows, orderIdOf(row));
    return viewOwner.fragment("fragment15", {
      v0: viewOwner.fragment("fragment0", {
        v0: () => setDetail(row)
      }),
      v1: row.cancelledAt ? viewOwner.fragment("fragment3", {
        v0: viewOwner.fragment("fragment1", {
          v0: canReconcile(row) ? '已取消 · 待核款回存' : `已取消 · 退回 NT$${row.creditReturned || 0}`
        }),
        v1: canReconcile(row) && viewOwner.fragment("fragment2", {
          v0: () => openReconciliation(row)
        })
      }) : row.deletedAt ? viewOwner.fragment("fragment5", {
        v0: () => restoreRegistration(row),
        v1: viewOwner.fragment("fragment4", {
          v0: ArrowCounterClockwise,
          v1: {
            "size": 16
          }
        })
      }) : viewOwner.fragment("fragment12", {
        v0: viewOwner.fragment("fragment7", {
          v0: () => {
            setRegistrationSaveError('');
            setRegistrationEditor(row);
          },
          v1: viewOwner.fragment("fragment6", {
            v0: PencilSimple,
            v1: {
              "size": 16
            }
          })
        }),
        v1: actions.canDelete && viewOwner.fragment("fragment9", {
          v0: () => {
            setDeleteTarget(row);
            setDeleteError('');
          },
          v1: viewOwner.fragment("fragment8", {
            v0: Trash,
            v1: {
              "size": 16
            }
          })
        }),
        v2: onCancelRegistration && actions.canCancel && viewOwner.fragment("fragment10", {
          v0: () => onCancelRegistration(row)
        }),
        v3: (order.canReconcile || order.canUndoReconciliation) && row.payment === 'BANK_TRANSFER' && viewOwner.fragment("fragment11", {
          v0: () => openReconciliation(row, !order.canReconcile),
          v1: order.canReconcile ? '確認整筆對帳' : '取消整筆對帳'
        })
      }),
      v2: row.cancelledAt && viewOwner.fragment("fragment14", {
        v0: cancellationSourceLabel(row),
        v1: viewOwner.fragment("fragment13", {}),
        v2: new Date(row.cancelledAt).toLocaleString('zh-TW', {
          timeZone: 'Asia/Taipei',
          hour12: false
        })
      })
    });
  };
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,adminRegistrationActions,cancellationSourceLabel,softDeleteManualRegistration,FeedbackManagement,RegistrationOrders,orderIdOf,orderFromRows,isActiveParticipant,validateParticipants,OptionParameters,RoleManagement,MemberRoleAssignments,MemberTagging,canViewScreen,roleName,HistoricalEventManagement,EventExports,PublicVisibilitySettings,defaultVisibility,registrationClosed,EventAttachments,MemberManagement,memberFieldLabels,RegistrationEditor,ArticleManagement,EventLocationPicker,Mountains,ArrowLeft,ArrowRight,Users,CalendarBlank,SlidersHorizontal,ShieldCheck,DownloadSimple,Plus,CheckCircle,LockSimple,X,PencilSimple,Trash,ArrowCounterClockwise,UserCircle,IdentificationCard,ListNumbers,ChatCircleDots,groupDefaults,feeLabels,initialDefaults,paymentLabels,statusLabels,initialEvents,initialRows,closedDemoRows,initialRegistrationRows,displayName,canReconcile,price,EventEditor,SettingsPanel,AdminWorkspace,onReconcileRegistration,onCancelRegistration,financeNotice,feedbackRecords,setFeedbackRecords,roles,setRoles,optionSets,setOptionSets,members,setMembers,defaults,setDefaults,currentMemberId,onSwitchMember,historicalEvents,setHistoricalEvents,onOpenHistorical,onExit,onMemberMode,Dialog,catalog,setCatalog,rows,setRows,savedOrders,setSavedOrders,articleRecords,setArticleRecords,onOpenArticle,initialRole,requestedSection,setSection,articleDirty,setArticleDirty,articleNavigation,setArticleNavigation,role,allowed,exportTab,setExportTab,selectedEvent,setSelectedEvent,showFilters,setShowFilters,filters,setFilters,detail,setDetail,confirm,setConfirm,reconciliationError,setReconciliationError,reconciliationMember,setReconciliationMember,editor,setEditor,notice,setNotice,registrationEditor,setRegistrationEditor,deleteTarget,setDeleteTarget,deleteError,setDeleteError,showDeleted,setShowDeleted,showCancelled,setShowCancelled,registrationSaveError,setRegistrationSaveError,currentEvent,divisionChoices,rosterFeeChoices,labelStatus,visibleRows,visibleOrderCount,menu,section,title,confirmOrder,rowActions,navigate,openExports,filter,openReconciliation,reconcile,saveEvent,saveMember,saveRegistration,deleteRegistration,restoreRegistration,exportCsv};
  return null;
}
}
