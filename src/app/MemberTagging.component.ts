import {OptionParameters} from './OptionParameters.component';
import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { CheckCircle, Tag, UserCircle } from './icon-symbols';
import { applyMemberLabels, optionName, roleName } from "../access-model.js";

@Component({selector:'demo-member-labels',standalone:true,imports:[],host:{style:'display: contents'},templateUrl:'./MemberTagging.MemberLabels.html'})
export class MemberLabels extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    member,
    labels
  } = propsValue;
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,CheckCircle,Tag,UserCircle,applyMemberLabels,optionName,roleName,MemberLabels,LabelEditor,MemberTagging,member,labels};
  return null;
}
}

@Component({selector:'demo-label-editor',standalone:true,imports:[ScreenDialog],host:{style:'display: contents'},templateUrl:'./MemberTagging.LabelEditor.html'})
export class LabelEditor extends ViewController {
private _state_selected:any; private _ready_selected=false;
private setSelected=(next:any)=>{const value=typeof next==='function'?next(this._state_selected):next;if(!Object.is(value,this._state_selected)){this._state_selected=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    member,
    labels,
    onSave,
    onClose,
    Dialog
  } = propsValue;
  if (!this._ready_selected) {
    const stateInitial: any = member.labelIds || [];
    this._state_selected = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_selected = true;
  }
  const selected: any = this._state_selected;
  const setSelected: any = this.setSelected;
  const options: any = labels.filter((label: any) => label.active || (member.labelIds || []).includes(label.id));
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,CheckCircle,Tag,UserCircle,applyMemberLabels,optionName,roleName,MemberLabels,LabelEditor,MemberTagging,member,labels,onSave,onClose,Dialog,selected,setSelected,options};
  return null;
}
}

@Component({selector:'demo-member-tagging',standalone:true,imports:[ScreenDialog,ViewComponent, FormValue],host:{style:'display: contents'},templateUrl:'./MemberTagging.MemberTagging.html'})
export class MemberTagging extends ViewController {
private _state_query:any; private _ready_query=false;
private setQuery=(next:any)=>{const value=typeof next==='function'?next(this._state_query):next;if(!Object.is(value,this._state_query)){this._state_query=value;this.update();}};
private _state_filter:any; private _ready_filter=false;
private setFilter=(next:any)=>{const value=typeof next==='function'?next(this._state_filter):next;if(!Object.is(value,this._state_filter)){this._state_filter=value;this.update();}};
private _state_editing:any; private _ready_editing=false;
private setEditing=(next:any)=>{const value=typeof next==='function'?next(this._state_editing):next;if(!Object.is(value,this._state_editing)){this._state_editing=value;this.update();}};
private _state_notice:any; private _ready_notice=false;
private setNotice=(next:any)=>{const value=typeof next==='function'?next(this._state_notice):next;if(!Object.is(value,this._state_notice)){this._state_notice=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    members,
    setMembers,
    labels,
    roles,
    Dialog,
    onParameters
  } = propsValue;
  if (!this._ready_query) {
    const stateInitial: any = '';
    this._state_query = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_query = true;
  }
  const query: any = this._state_query;
  const setQuery: any = this.setQuery;
  if (!this._ready_filter) {
    const stateInitial: any = '';
    this._state_filter = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_filter = true;
  }
  const filter: any = this._state_filter;
  const setFilter: any = this.setFilter;
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
  const shown: any = members.filter((member: any) => (!filter || (filter === 'none' ? !(member.labelIds || []).length : (member.labelIds || []).includes(filter))) && `${member.name} ${member.nickname} ${member.number}`.toLowerCase().includes(query.trim().toLowerCase()));
  function save(member: any, selected: any) {
    setMembers((previous: any) => previous.map((item: any) => item.id === member.id ? applyMemberLabels(item, selected, labels) : item));
    setNotice(`已更新 ${member.number} 的會員標籤。`);
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,CheckCircle,Tag,UserCircle,applyMemberLabels,optionName,roleName,MemberLabels,LabelEditor,OptionParameters,MemberTagging,members,setMembers,labels,roles,Dialog,onParameters,query,setQuery,filter,setFilter,editing,setEditing,notice,setNotice,shown,save};
  return null;
}
}
