import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { orderFromRows, orderIdOf, ordersForRoster, paymentStatusText, updateOrderBank } from "../registration-order-model.js";

@Component({selector:'demo-registration-orders',standalone:true,imports:[ScreenDialog, FormValue],host:{style:'display: contents'},templateUrl:'./RegistrationOrders.RegistrationOrders.html'})
export class RegistrationOrders extends ViewController {
private _state_editing:any; private _ready_editing=false;
private setEditing=(next:any)=>{const value=typeof next==='function'?next(this._state_editing):next;if(!Object.is(value,this._state_editing)){this._state_editing=value;this.update();}};
private _state_error:any; private _ready_error=false;
private setError=(next:any)=>{const value=typeof next==='function'?next(this._state_error):next;if(!Object.is(value,this._state_error)){this._state_error=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    rows,
    matchingRows,
    eventId,
    onReconcile,
    setRows,
    Dialog
  } = propsValue;
  if (!this._ready_editing) {
    const stateInitial: any = null;
    this._state_editing = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_editing = true;
  }
  const editing: any = this._state_editing;
  const setEditing: any = this.setEditing;
  if (!this._ready_error) {
    const stateInitial: any = '';
    this._state_error = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_error = true;
  }
  const error: any = this._state_error;
  const setError: any = this.setError;
  const orders: any = ordersForRoster(rows, matchingRows ?? rows, eventId);
  const selectedOrder: any = orders.find((order:any)=>order.id===this.panel) || orders[0];
  function save(e: any) {
    e.preventDefault();
    const form: any = new FormData(e.currentTarget),
      last5: any = String(form.get('last5') || ''),
      date: any = String(form.get('date') || '');
    if (!/^\d{5}$/.test(last5) || !date) {
      setError('請填寫五位帳號末碼與繳款日期。');
      return;
    }
    setRows((prev: any) => updateOrderBank(prev, editing.id, {
      last5,
      date
    }, '管理員'));
    setEditing(null);
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,orderFromRows,orderIdOf,paymentStatusText,updateOrderBank,RegistrationOrders,rows,eventId,onReconcile,setRows,Dialog,editing,setEditing,error,setError,orders,selectedOrder,save};
  return null;
}
}
