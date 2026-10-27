import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { cancellationQuote } from "../member-credit-model.js";

@Component({selector:'demo-cancellation-dialog',standalone:true,imports:[FormValue, ScreenDialog],host:{style:'display: contents'},templateUrl:'./CancellationDialog.CancellationDialog.html'})
export class CancellationDialog extends ViewController {
private _state_reason:any; private _ready_reason=false;
private setReason=(next:any)=>{const value=typeof next==='function'?next(this._state_reason):next;if(!Object.is(value,this._state_reason)){this._state_reason=value;this.update();}};
private _state_memberId:any; private _ready_memberId=false;
private setMemberId=(next:any)=>{const value=typeof next==='function'?next(this._state_memberId):next;if(!Object.is(value,this._state_memberId)){this._state_memberId=value;this.update();}};
private _state_error:any; private _ready_error=false;
private setError=(next:any)=>{const value=typeof next==='function'?next(this._state_error):next;if(!Object.is(value,this._state_error)){this._state_error=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    state,
    rowIds,
    actor,
    members,
    Dialog,
    onClose,
    onConfirm
  } = propsValue;
  if (!this._ready_reason) {
    const stateInitial: any = '';
    this._state_reason = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_reason = true;
  }
  const reason: any = this._state_reason;
  const setReason: any = this.setReason;
  if (!this._ready_memberId) {
    const stateInitial: any = '';
    this._state_memberId = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_memberId = true;
  }
  const memberId: any = this._state_memberId;
  const setMemberId: any = this.setMemberId;
  if (!this._ready_error) {
    const stateInitial: any = '';
    this._state_error = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_error = true;
  }
  const error: any = this._state_error;
  const setError: any = this.setError;
  const rows: any = state.rows.filter((row: any) => rowIds.includes(row.id) && !row.cancelledAt);
  let quote: any,
    problem: any = '';
  try {
    quote = cancellationQuote(state, rowIds, actor, memberId);
  } catch (e) {
    problem = e.message;
  }
  const needsMember: any = rows.some((row: any) => !row.ownerId && !row.memberId && row.amount > 0 && ['RECONCILED', 'MANUALLY_PAID', 'WALLET_PAID'].includes(row.status));
  function submit(e: any) {
    e.preventDefault();
    if (problem) {
      setError(problem);
      return;
    }
    try {
      onConfirm({
        reason,
        creditMemberId: memberId
      });
    } catch (e) {
      setError(e.message);
    }
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,cancellationQuote,CancellationDialog,state,rowIds,actor,members,Dialog,onClose,onConfirm,reason,setReason,memberId,setMemberId,error,setError,rows,quote,problem,needsMember,submit};
  return null;
}
}
