import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { defaultVisibility } from "../public-event-model.js";

@Component({selector:'demo-public-visibility-settings',standalone:true,imports:[],host:{style:'display: contents'},templateUrl:'./PublicEventParticipation.PublicVisibilitySettings.html'})
export class PublicVisibilitySettings extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    value,
    onChange
  } = propsValue;
  const settings: any = {
    ...defaultVisibility,
    ...value
  };
  const change: any = (key: any, checked: any) => onChange({
    ...settings,
    [key]: checked
  });
  this.ui={settings,change};
  return null;
}
}

@Component({selector:'demo-public-event-participation',standalone:true,imports:[],host:{style:'display: contents'},templateUrl:'./PublicEventParticipation.PublicEventParticipation.html'})
export class PublicEventParticipation extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    data,
    mode = 'all'
  } = propsValue;
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,defaultVisibility,PublicVisibilitySettings,PublicEventParticipation,data,mode};
  return null;
}
}
