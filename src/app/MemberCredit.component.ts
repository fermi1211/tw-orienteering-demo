import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { Wallet, ArrowDownLeft, ArrowUpRight } from './icon-symbols';

@Component({selector:'demo-wallet-payment-choice',standalone:true,imports:[ViewFragmentComponent, ViewAnchor, ViewComponent],host:{style:'display: contents'},templateUrl:'./MemberCredit.WalletPaymentChoice.html'})
export class WalletPaymentChoice extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    balance,
    amount,
    selected,
    onChange,
    available = true
  } = propsValue;
  if (!available || amount <= 0 || balance < amount) return null;
  return viewOwner.fragment("fragment10", {
    v0: viewOwner.fragment("fragment1", {
      v0: viewOwner.fragment("fragment0", {
        v0: Wallet,
        v1: {
          "size": 20
        }
      })
    }),
    v1: viewOwner.fragment("fragment2", {
      v0: balance,
      v1: amount
    }),
    v2: viewOwner.fragment("fragment5", {
      v0: !selected ? 'radio-row selected' : 'radio-row',
      v1: viewOwner.fragment("fragment3", {
        v0: !selected,
        v1: () => onChange(false)
      }),
      v2: viewOwner.fragment("fragment4", {})
    }),
    v3: viewOwner.fragment("fragment9", {
      v0: selected ? 'radio-row selected' : 'radio-row',
      v1: viewOwner.fragment("fragment6", {
        v0: selected,
        v1: () => onChange(true)
      }),
      v2: viewOwner.fragment("fragment7", {}),
      v3: viewOwner.fragment("fragment8", {
        v0: amount
      })
    })
  });
}
}

@Component({selector:'demo-member-credit',standalone:true,imports:[IconComponent],host:{style:'display: contents'},templateUrl:'./MemberCredit.MemberCredit.html'})
export class MemberCredit extends ViewController {
private _state_expanded:any; private _ready_expanded=false;
private setExpanded=(next:any)=>{const value=typeof next==='function'?next(this._state_expanded):next;if(!Object.is(value,this._state_expanded)){this._state_expanded=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    balance,
    entries,
    memberNumber
  } = propsValue;
  if (!this._ready_expanded) {
    const stateInitial: any = false;
    this._state_expanded = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_expanded = true;
  }
  const expanded: any = this._state_expanded;
  const setExpanded: any = this.setExpanded;
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,Wallet,ArrowDownLeft,ArrowUpRight,WalletPaymentChoice,MemberCredit,balance,entries,memberNumber,expanded,setExpanded};
  return null;
}
}
