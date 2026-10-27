import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { CheckCircle, Plus } from './icon-symbols';
import { optionErrors } from "../access-model.js";
const definitions: any = [{
  key: 'participantResidencies',
  name: '參賽者國籍分類',
  fixed: true,
  hint: '分類名稱可調整，已成立報名保留分類；本國／外國的付款規則保持固定。'
}, {
  key: 'feedbackTypes',
  name: '回饋類型',
  hint: '可新增、改名或停用；停用不刪除既有回饋紀錄。'
}, {
  key: 'registrationModes',
  name: '報名模式',
  fixed: true,
  hint: '單人／多人流程可改名或停用；已成立報名仍可查閱。'
}, {
  key: 'registrationFees',
  name: '報名繳費選項',
  fixed: true,
  hint: '選項可改名／停用，費率於下方設定；既有報名保留原費用。'
}, {
  key: 'articleCategories',
  name: '文章分類',
  hint: '新增文章可選啟用分類；停用不移除既有文章。'
}, {
  key: 'memberLabels',
  name: '會員標籤',
  hint: '可新增會員分類標籤，停用後保留既有標注。'
}];
@Component({selector:'demo-option-parameters',standalone:true,imports:[IconComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./OptionParameters.OptionParameters.html'})
export class OptionParameters extends ViewController {
 optionDraft:any=null;
 byIdDefinition(){return this.ui.definitions.find((d:any)=>d.key===(this.props["tab"]||this.panel))||this.ui.definitions[0];}
 editOption(option:any){this.optionDraft={...option};this.update();}
 addOption(){this.optionDraft={id:crypto.randomUUID(),name:'',active:true,isNew:true};this.update();}
 closeOption=()=>{this.optionDraft=null;this.update();};
 saveOption(){if(!this.optionDraft.name.trim())return;const key=this.byIdDefinition().key;const {isNew,...value}=this.optionDraft;this.ui.setDraft({...this.ui.draft,[key]:isNew?[...this.ui.draft[key],value]:this.ui.draft[key].map((o:any)=>o.id===value.id?value:o)});this.ui.setSaved(false);this.closeOption();}

private _state_draft:any; private _ready_draft=false;
private setDraft=(next:any)=>{const value=typeof next==='function'?next(this._state_draft):next;if(!Object.is(value,this._state_draft)){this._state_draft=value;this.update();}};
private _state_errors:any; private _ready_errors=false;
private setErrors=(next:any)=>{const value=typeof next==='function'?next(this._state_errors):next;if(!Object.is(value,this._state_errors)){this._state_errors=value;this.update();}};
private _state_saved:any; private _ready_saved=false;
private setSaved=(next:any)=>{const value=typeof next==='function'?next(this._state_saved):next;if(!Object.is(value,this._state_saved)){this._state_saved=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    value,
    onSave,
    onRoles,
    onAssignments,
    onTags
  } = propsValue;
  if (!this._ready_draft) {
    const stateInitial: any = value;
    this._state_draft = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_draft = true;
  }
  const draft: any = this._state_draft;
  const setDraft: any = this.setDraft;
  if (!this._ready_errors) {
    const stateInitial: any = [];
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
  function update(key: any, id: any, patch: any) {
    setDraft((previous: any) => ({
      ...previous,
      [key]: previous[key].map((item: any) => item.id === id ? {
        ...item,
        ...patch
      } : item)
    }));
    setSaved(false);
  }
  function submit(event: any) {
    event.preventDefault();
    const problems: any = definitions.flatMap(({
      key,
      name
    }) => optionErrors(draft[key]).map((problem: any) => `${name}：${problem}`));
    setErrors(problems);
    if (problems.length) return;
    const next: any = Object.fromEntries(definitions.map(({
      key
    }) => [key, draft[key].map((item: any) => ({
      ...item,
      name: item.name.trim()
    }))]));
    onSave({
      ...value,
      ...next
    });
    setDraft({
      ...value,
      ...next
    });
    setSaved(true);
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,CheckCircle,Plus,optionErrors,definitions,OptionParameters,value,onSave,onRoles,onAssignments,onTags,draft,setDraft,errors,setErrors,saved,setSaved,update,submit};
  return null;
}
}
