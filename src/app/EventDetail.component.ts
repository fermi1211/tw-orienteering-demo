import {eventFeeCatalog} from '../event-options-model.js';
import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { ArrowLeft, ArrowRight, MapPin, ArrowSquareOut, CalendarBlank, Clock } from './icon-symbols';
import { EventHero, EventDocuments } from "./EventAttachments.component";
import { PublicEventParticipation } from "./PublicEventParticipation.component";
import { stateLabels } from "../public-event-model.js";
const feeNames: any = {
  MEMBER: '會員',
  LEGACY_PREPAID: '舊制已預繳',
  SINGLE: '單次報名'
};
const groupNames: any = {
  ME: '男子菁英組',
  WE: '女子菁英組',
  MA: '男子進階組',
  WA: '女子進階組',
  OPEN: '公開組'
};
const dateTime: any = (value: any) => value ? new Intl.DateTimeFormat('zh-TW', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).format(new Date(`${value}:00+08:00`)) : '待主辦單位公告';
@Component({selector:'demo-location-map',standalone:true,imports:[ViewFragmentComponent, ViewAnchor, ViewComponent],host:{style:'display: contents'},templateUrl:'./EventDetail.LocationMap.html'})
export class LocationMap extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    event
  } = propsValue;
  const point: any = event.mapLocation;
  const valid: any = point && Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 85 && Math.abs(point.lng) <= 180;
  const delta: any = point?.approximate ? 0.045 : 0.006;
  const bbox: any = valid ? [Math.max(-180, point.lng - delta * 1.6), Math.max(-85, point.lat - delta), Math.min(180, point.lng + delta * 1.6), Math.min(85, point.lat + delta)].map((n: any) => n.toFixed(6)).join(',') : '';
  const query: any = new URLSearchParams({
    bbox,
    layer: 'mapnik'
  });
  if (valid && !point.approximate) query.set('marker', `${point.lat},${point.lng}`);
  const osmUrl: any = valid ? `https://www.openstreetmap.org/?${point.approximate ? '' : `mlat=${point.lat}&mlon=${point.lng}`}#map=${point.approximate ? 12 : 16}/${point.lat}/${point.lng}` : `https://www.openstreetmap.org/search?${new URLSearchParams({
    query: event.location || ''
  })}`;
  return viewOwner.fragment("fragment13", {
    v0: viewOwner.fragment("fragment2", {
      v0: viewOwner.fragment("fragment0", {
        v0: MapPin,
        v1: {
          "size": 23
        }
      }),
      v1: viewOwner.fragment("fragment1", {})
    }),
    v1: viewOwner.fragment("fragment3", {
      v0: event.location || '地點待公告'
    }),
    v2: valid ? viewOwner.fragment("fragment6", {
      v0: viewOwner.fragment("fragment4", {
        v0: point.approximate ? '區域示意 · 實際集合點待主辦單位公告' : '主辦單位設定的活動位置'
      }),
      v1: viewOwner.fragment("fragment5", {
        v0: `${event.name}地點地圖`,
        v1: this.trustedResource(`https://www.openstreetmap.org/export/embed.html?${query}`)
      }, bbox + String(point.approximate))
    }) : viewOwner.fragment("fragment7", {}),
    v3: viewOwner.fragment("fragment11", {
      v0: viewOwner.fragment("fragment8", {}),
      v1: viewOwner.fragment("fragment10", {
        v0: osmUrl,
        v1: viewOwner.fragment("fragment9", {
          v0: ArrowSquareOut,
          v1: {
            "size": 17
          }
        })
      })
    }),
    v4: viewOwner.fragment("fragment12", {})
  });
}
}

@Component({selector:'demo-event-detail',standalone:true,imports:[ViewComponent, IconComponent],host:{style:'display: contents'},templateUrl:'./EventDetail.EventDetail.html'})
export class EventDetail extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    event,
    state,
    participation,
    user,
    fromRegistration,
    onBack,
    onRegister,
    Dialog
  } = propsValue;
  const attachments: any = event.status === 'PUBLISHED' ? event.attachments : undefined;
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,ArrowLeft,ArrowRight,MapPin,ArrowSquareOut,CalendarBlank,Clock,EventHero,EventDocuments,PublicEventParticipation,stateLabels,feeNames,groupNames,dateTime,LocationMap,EventDetail,event,state,participation,user,fromRegistration,onBack,onRegister,Dialog,attachments,feeChoices:eventFeeCatalog(event).filter((option:any)=>option.active!==false)};
  return null;
}
}
