import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { orderTotals } from "../registration-order-model.js";
import { ArrowRight, ArrowLeft, CalendarBlank, MapPin, CheckCircle, Clock, LockSimple, Mountains, FileText, SquaresFour } from './icon-symbols';
const feeNames: any = {
  MEMBER: '會員',
  LEGACY_PREPAID: '舊制已預繳',
  SINGLE: '單次報名'
};
const paymentNames: any = {
  NOT_REQUIRED: '不需繳款',
  BANK_TRANSFER: '銀行轉帳',
  ONSITE: '現場繳費',
  WALLET: '儲值金付款'
};
export const isPendingRecord: any = (record: any) => record.status.includes('待確認帳款');
export const isReconciledRecord: any = (record: any) => record.status.includes('已完成對帳');
export function createMultipleRecords(events: any, residency: any, profile: any) {
  return [{
    id: 'DEMO-MULTI-01',
    event: events[0],
    group: '公開組 OPEN',
    fee: 'SINGLE',
    payment: 'BANK_TRANSFER',
    amount: 450,
    last5: '00123',
    date: '2026-10-20',
    status: '報名完成(待確認帳款)'
  }, {
    id: 'DEMO-MULTI-02',
    event: {
      ...events[1],
      state: 'open'
    },
    group: '男子進階組 MA',
    fee: 'MEMBER',
    payment: 'NOT_REQUIRED',
    amount: 0,
    last5: '',
    date: '',
    status: '報名完成'
  }, {
    id: 'DEMO-MULTI-03',
    event: {
      ...events[2],
      state: 'open'
    },
    group: '公開組 OPEN',
    fee: 'SINGLE',
    payment: residency === 'FOREIGN' ? 'ONSITE' : 'BANK_TRANSFER',
    amount: 450,
    last5: residency === 'FOREIGN' ? '' : '00567',
    date: residency === 'FOREIGN' ? '' : '2026-10-21',
    status: residency === 'FOREIGN' ? '報名完成(現場繳費)' : '報名完成(已完成對帳)'
  }].map((record: any) => ({
    ...record,
    eventId: record.event.id,
    profile: {
      ...profile
    },
    isDemo: true
  }));
}
@Component({selector:'demo-my-registrations',standalone:true,imports:[ViewFragmentComponent, IconComponent, MemberNavigation],host:{style:'display: contents'},templateUrl:'./MyRegistrations.MyRegistrations.html'})
export class MyRegistrations extends ViewController {
openWallet=()=>this.setPanel("wallet");
private _state_filter:any; private _ready_filter=false;
private setFilter=(next:any)=>{const value=typeof next==='function'?next(this._state_filter):next;if(!Object.is(value,this._state_filter)){this._state_filter=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    records,
    defaultEvent,
    onEdit,
    onBrief,
    onExplore,
    onDemo,
    notice,
    feeOptions = [],
    creditPanel,
    onCancel,
    canCancel = () => true
  } = propsValue;
  if (!this._ready_filter) {
    const stateInitial: any = 'ALL';
    this._state_filter = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_filter = true;
  }
  const filter: any = this._state_filter;
  const setFilter: any = this.setFilter;
  const labels: any = {
    ...feeNames,
    ...Object.fromEntries(feeOptions.map((option: any) => [option.id, option.name]))
  };
  const eventFor: any = (record: any) => record.event || defaultEvent;
  const pending: any = records.filter(isPendingRecord).length;
  const visible: any = filter === 'PENDING' ? records.filter(isPendingRecord) : records;
  const eventGroups: any = [...new Set(visible.map((record: any) => eventFor(record).id))].map((id: any) => ({
    event: eventFor(visible.find((record: any) => eventFor(record).id === id)),
    records: visible.filter((record: any) => eventFor(record).id === id)
  })).sort((a: any, b: any) => a.event.date.localeCompare(b.event.date));
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,orderTotals,ArrowRight,ArrowLeft,CalendarBlank,MapPin,CheckCircle,Clock,LockSimple,Mountains,FileText,SquaresFour,feeNames,paymentNames,isPendingRecord,isReconciledRecord,createMultipleRecords,MyRegistrations,records,defaultEvent,onEdit,onBrief,onExplore,onDemo,notice,feeOptions,creditPanel,onCancel,canCancel,filter,setFilter,labels,eventFor,pending,visible,eventGroups};
  return null;
}
}
