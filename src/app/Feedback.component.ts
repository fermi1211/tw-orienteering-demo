import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { ChatCircleDots, ArrowRight, CheckCircle, Circle, MagnifyingGlass } from './icon-symbols';
import { adminFeedback, feedbackErrors, feedbackTypeName, FEEDBACK_DESCRIPTION_LIMIT, setFeedbackResolved } from "../feedback-model.js";
const dateLabel: any = (value: any) => new Date(value).toLocaleString('zh-TW', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});
const issueNumber: any = (record: any) => `#${String(record.number).padStart(4, '0')}`;
@Component({selector:'demo-feedback-form',standalone:true,imports:[FormValue, IconComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./Feedback.FeedbackForm.html'})
export class FeedbackForm extends ViewController {
private _state_typeId:any; private _ready_typeId=false;
private setTypeId=(next:any)=>{const value=typeof next==='function'?next(this._state_typeId):next;if(!Object.is(value,this._state_typeId)){this._state_typeId=value;this.update();}};
private _state_description:any; private _ready_description=false;
private setDescription=(next:any)=>{const value=typeof next==='function'?next(this._state_description):next;if(!Object.is(value,this._state_description)){this._state_description=value;this.update();}};
private _state_errors:any; private _ready_errors=false;
private setErrors=(next:any)=>{const value=typeof next==='function'?next(this._state_errors):next;if(!Object.is(value,this._state_errors)){this._state_errors=value;this.update();}};
private _state_created:any; private _ready_created=false;
private setCreated=(next:any)=>{const value=typeof next==='function'?next(this._state_created):next;if(!Object.is(value,this._state_created)){this._state_created=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    types,
    onSubmit,
    onClose,
    Dialog,
    memberNumber
  } = propsValue;
  if (!this._ready_typeId) {
    const stateInitial: any = '';
    this._state_typeId = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_typeId = true;
  }
  const typeId: any = this._state_typeId;
  const setTypeId: any = this.setTypeId;
  if (!this._ready_description) {
    const stateInitial: any = '';
    this._state_description = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_description = true;
  }
  const description: any = this._state_description;
  const setDescription: any = this.setDescription;
  if (!this._ready_errors) {
    const stateInitial: any = {};
    this._state_errors = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_errors = true;
  }
  const errors: any = this._state_errors;
  const setErrors: any = this.setErrors;
  if (!this._ready_created) {
    const stateInitial: any = null;
    this._state_created = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_created = true;
  }
  const created: any = this._state_created;
  const setCreated: any = this.setCreated;
  const activeTypes: any = types.filter((type: any) => type.active);
  function submit(event: any) {
    event.preventDefault();
    const value: any = {
        typeId,
        description
      },
      invalid: any = feedbackErrors(value, types);
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    try {
      setCreated(onSubmit(value));
    } catch (error) {
      setErrors({
        submit: error.message
      });
    }
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,ChatCircleDots,ArrowRight,CheckCircle,Circle,MagnifyingGlass,adminFeedback,feedbackErrors,feedbackTypeName,FEEDBACK_DESCRIPTION_LIMIT,setFeedbackResolved,dateLabel,issueNumber,FeedbackForm,FeedbackManagement,types,onSubmit,onClose,Dialog,memberNumber,typeId,setTypeId,description,setDescription,errors,setErrors,created,setCreated,activeTypes,submit};
  return null;
}
}

@Component({selector:'demo-feedback-management',standalone:true,imports:[FormValue, ScreenDialog],host:{style:'display: contents'},templateUrl:'./Feedback.FeedbackManagement.html'})
export class FeedbackManagement extends ViewController {
private _state_status:any; private _ready_status=false;
private setStatus=(next:any)=>{const value=typeof next==='function'?next(this._state_status):next;if(!Object.is(value,this._state_status)){this._state_status=value;this.update();}};
private _state_typeId:any; private _ready_typeId=false;
private setTypeId=(next:any)=>{const value=typeof next==='function'?next(this._state_typeId):next;if(!Object.is(value,this._state_typeId)){this._state_typeId=value;this.update();}};
private _state_search:any; private _ready_search=false;
private setSearch=(next:any)=>{const value=typeof next==='function'?next(this._state_search):next;if(!Object.is(value,this._state_search)){this._state_search=value;this.update();}};
private _state_notice:any; private _ready_notice=false;
private setNotice=(next:any)=>{const value=typeof next==='function'?next(this._state_notice):next;if(!Object.is(value,this._state_notice)){this._state_notice=value;this.update();}};
private _state_detailId:any; private _ready_detailId=false;
private setDetailId=(next:any)=>{const value=typeof next==='function'?next(this._state_detailId):next;if(!Object.is(value,this._state_detailId)){this._state_detailId=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    records,
    setRecords,
    types,
    role,
    Dialog
  } = propsValue;
  if (!this._ready_status) {
    const stateInitial: any = 'OPEN';
    this._state_status = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_status = true;
  }
  const status: any = this._state_status;
  const setStatus: any = this.setStatus;
  if (!this._ready_typeId) {
    const stateInitial: any = '';
    this._state_typeId = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_typeId = true;
  }
  const typeId: any = this._state_typeId;
  const setTypeId: any = this.setTypeId;
  if (!this._ready_search) {
    const stateInitial: any = '';
    this._state_search = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_search = true;
  }
  const search: any = this._state_search;
  const setSearch: any = this.setSearch;
  if (!this._ready_notice) {
    const stateInitial: any = '';
    this._state_notice = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_notice = true;
  }
  const notice: any = this._state_notice;
  const setNotice: any = this.setNotice;
  if (!this._ready_detailId) {
    const stateInitial: any = null;
    this._state_detailId = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_detailId = true;
  }
  const detailId: any = this._state_detailId;
  const setDetailId: any = this.setDetailId;
  if (role !== 'ADMIN') return null;
  const all: any = adminFeedback(records, role),
    open: any = all.filter((record: any) => record.status === 'OPEN').length,
    resolved: any = all.length - open;
  const detail: any = all.find((record: any) => record.id === detailId);
  const visible: any = all.filter((record: any) => (status === 'ALL' || record.status === status) && (!typeId || record.typeId === typeId) && (!search.trim() || `${issueNumber(record)} ${record.description} ${feedbackTypeName(record, types)}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))).sort((a: any, b: any) => b.number - a.number);
  function toggle(record: any, checked: any) {
    setRecords((previous: any) => setFeedbackResolved(previous, record.id, checked, role));
    setNotice(`${issueNumber(record)} 已${checked ? '標記為已解決' : '重新開啟，回到待處理'}。`);
  }
  const check: any = (record: any) => viewOwner.fragment("fragment2", {
    v0: viewOwner.fragment("fragment0", {
      v0: record.status === 'RESOLVED',
      v1: `已解決 ${issueNumber(record)}`,
      v2: (event: any) => toggle(record, event.target.checked)
    }),
    v1: viewOwner.fragment("fragment1", {})
  });
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,ChatCircleDots,ArrowRight,CheckCircle,Circle,MagnifyingGlass,adminFeedback,feedbackErrors,feedbackTypeName,FEEDBACK_DESCRIPTION_LIMIT,setFeedbackResolved,dateLabel,issueNumber,FeedbackForm,FeedbackManagement,records,setRecords,types,role,Dialog,status,setStatus,typeId,setTypeId,search,setSearch,notice,setNotice,detailId,setDetailId,all,open,resolved,detail,visible,check,toggle};
  return null;
}
}
