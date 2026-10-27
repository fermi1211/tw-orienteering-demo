import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { ArrowLeft, CalendarBlank, MapPin } from './icon-symbols';
import { EventDocuments, EventHero, EventImageGallery } from "./EventAttachments.component";
import { LocationMap } from "./EventDetail.component";
import { historicalFeeLabels, materialSchemas } from "../historical-event-model.js";

@Component({selector:'demo-historical-material',standalone:true,imports:[ViewComponent],host:{style:'display: contents'},templateUrl:'./HistoricalEventDetail.HistoricalMaterial.html'})
export class HistoricalMaterial extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    material,
    schema,
    Dialog
  } = propsValue;
  if (!material) {this.ui={material};return null;}
  const columns: any = schema.columns.filter((column: any) => material.rows?.some((row: any) => row[column.key]));
  this.ui={material,schema,Dialog,EventImageGallery,columns};
  return null;
}
}

@Component({selector:'demo-historical-event-detail',standalone:true,imports:[ViewComponent, IconComponent],host:{style:'display: contents'},templateUrl:'./HistoricalEventDetail.HistoricalEventDetail.html'})
export class HistoricalEventDetail extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    event,
    onBack,
    Dialog
  } = propsValue;
  if (!event) {this.ui={event,onBack}; return viewOwner.fragment("fragment2", {
    v0: viewOwner.fragment("fragment0", {}),
    v1: viewOwner.fragment("fragment1", {
      v0: onBack
    })
  });
  }
  const fees: any = Object.entries(event.fees || {}),
    hasDescription: any = Boolean(event.description),
    hasGroups: any = Boolean(event.divisions.length);
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,ArrowLeft,CalendarBlank,MapPin,EventDocuments,EventHero,EventImageGallery,LocationMap,historicalFeeLabels,materialSchemas,HistoricalMaterial,HistoricalEventDetail,event,onBack,Dialog,fees,hasDescription,hasGroups};
  return null;
}
}
