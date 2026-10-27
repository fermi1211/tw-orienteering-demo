import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { ArrowRight, CalendarBlank, CaretLeft, CaretRight, List, MapPin } from './icon-symbols';
import { groupedEvents, stateLabels } from "../public-event-model.js";
import { calendarDays, calendarEvents, currentCalendarMonth, shiftCalendarMonth, taipeiDate } from "../event-calendar-model.js";

@Component({selector:'demo-event-calendar',standalone:true,imports:[IconComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./EventList.EventCalendar.html'})
export class EventCalendar extends ViewController {
closePicker=()=>this.setSelectedDate(null);
private _state_selectedDate:any; private _ready_selectedDate=false;
private setSelectedDate=(next:any)=>{const value=typeof next==='function'?next(this._state_selectedDate):next;if(!Object.is(value,this._state_selectedDate)){this._state_selectedDate=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    catalog,
    month,
    onMonthChange,
    now,
    onSelect,
    Dialog
  } = propsValue;
  if (!this._ready_selectedDate) {
    const stateInitial: any = null;
    this._state_selectedDate = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_selectedDate = true;
  }
  const selectedDate: any = this._state_selectedDate;
  const setSelectedDate: any = this.setSelectedDate;
  const dates: any = calendarEvents(catalog, month, now);
  const days: any = calendarDays(month);
  const today: any = taipeiDate(now);
  const [year, number] = month.split('-').map(Number),
    title: any = `${year} 年 ${number} 月`,
    total: any = [...dates.values()].reduce((sum: any, events: any) => sum + events.length, 0);
  function choose(date: any) {
    const events: any = dates.get(date);
    setSelectedDate(date);
  }
  function changeMonth(value: any) {
    setSelectedDate(null);
    onMonthChange(value);
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,ArrowRight,CalendarBlank,CaretLeft,CaretRight,List,MapPin,groupedEvents,stateLabels,calendarDays,calendarEvents,currentCalendarMonth,shiftCalendarMonth,taipeiDate,EventCalendar,EventList,catalog,month,onMonthChange,now,onSelect,Dialog,selectedDate,setSelectedDate,dates,days,today,year,number,title,total,choose,changeMonth};
  return null;
}
}

/** The visual shell shares the existing event projections and selection callbacks. */
@Component({selector:'demo-event-list',standalone:true,imports:[ViewComponent],host:{style:'display: contents'},templateUrl:'./EventList.EventList.html'})
export class EventList {
  @Input() props: any = {};
  selectedSection = 'open';
  readonly icons = { ArrowRight, CalendarBlank, List, MapPin };
  readonly calendarComponent = EventCalendar;
  get sections(): any[] { return groupedEvents(this.props.catalog, this.props.now); }
  get featured(): any { return this.sections.find(section => section.key === 'open')?.events[0] || this.sections.find(section => section.key === 'future')?.events[0]; }
  get visibleSections(): any[] { return this.selectedSection === 'open' ? this.sections.filter(section => section.key !== 'past') : this.sections.filter(section => section.key === this.selectedSection); }
  get calendarProps(): any { return {catalog:this.props.catalog,month:this.props.month,onMonthChange:this.props.onMonthChange,now:this.props.now,onSelect:this.props.onSelect,Dialog:this.props.Dialog}; }
  status(event:any): string { return event.kind === 'HISTORICAL' ? '歷史賽事' : stateLabels[event.state]; }
  weekday(date:string): string { return ['日','一','二','三','四','五','六'][new Date(date+'T12:00:00+08:00').getUTCDay()]; }
  chooseSection(key:string): void { this.selectedSection=key; if(this.props.mode!=='list') this.props.onModeChange('list'); }
}
