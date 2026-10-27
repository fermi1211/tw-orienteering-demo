import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { DownloadSimple, ArrowUp, ArrowDown, Plus, Trash, CheckCircle, LockSimple, ArrowCounterClockwise } from './icon-symbols';
import { activeEventRows, registrationClosed, createStartOrder, assignStartDivision, syncStartOrder, entryName, moveStartEntry, generateSectionTimes, validateStartOrder, startReportSections } from "../event-export-model.js";
import { renderRosterImages } from "../roster-image.js";

@Component({selector:'demo-image-preview',standalone:true,imports:[IconComponent],host:{style:'display: contents'},templateUrl:'./EventExports.ImagePreview.html'})
export class ImagePreview extends ViewController {
private _state_pages:any; private _ready_pages=false;
private setPages=(next:any)=>{const value=typeof next==='function'?next(this._state_pages):next;if(!Object.is(value,this._state_pages)){this._state_pages=value;this.update();}};
private _state_index:any; private _ready_index=false;
private setIndex=(next:any)=>{const value=typeof next==='function'?next(this._state_index):next;if(!Object.is(value,this._state_index)){this._state_index=value;this.update();}};
private _state_busy:any; private _ready_busy=false;
private setBusy=(next:any)=>{const value=typeof next==='function'?next(this._state_busy):next;if(!Object.is(value,this._state_busy)){this._state_busy=value;this.update();}};
private _state_error:any; private _ready_error=false;
private setError=(next:any)=>{const value=typeof next==='function'?next(this._state_error):next;if(!Object.is(value,this._state_error)){this._state_error=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    kind,
    event,
    rows,
    settings,
    disabled
  } = propsValue;
  if (!this._ready_pages) {
    const stateInitial: any = [];
    this._state_pages = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_pages = true;
  }
  const pages: any = this._state_pages;
  const setPages: any = this.setPages;
  if (!this._ready_index) {
    const stateInitial: any = 0;
    this._state_index = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_index = true;
  }
  const index: any = this._state_index;
  const setIndex: any = this.setIndex;
  if (!this._ready_busy) {
    const stateInitial: any = true;
    this._state_busy = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_busy = true;
  }
  const busy: any = this._state_busy;
  const setBusy: any = this.setBusy;
  if (!this._ready_error) {
    const stateInitial: any = '';
    this._state_error = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_error = true;
  }
  const error: any = this._state_error;
  const setError: any = this.setError;
  const signature: any = JSON.stringify({
    kind,
    eventName: event.name,
    date: event.starts,
    rows,
    settings
  });
  this.scheduleEffect(0, () => {
    let cancelled: any = false,
      created: any = [];
    setBusy(true);
    setError('');
    const timer: any = setTimeout(() => {
      renderRosterImages(kind, event, rows, settings).then((next: any) => {
        if (cancelled) {
          next.forEach((page: any) => URL.revokeObjectURL(page.url));
          return;
        }
        created = next;
        setPages(next);
        setBusy(false);
      }).catch(() => {
        if (!cancelled) {
          setError('圖片預覽無法產生，請檢查表單內容後重試。');
          setBusy(false);
        }
      });
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      created.forEach((page: any) => URL.revokeObjectURL(page.url));
    };
  }, [signature]);
  const pageIndex: any = Math.min(index, Math.max(0, pages.length - 1)),
    page: any = pages[pageIndex];
  const filename: any = `${event.name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 60)}-${kind === 'entry' ? '組別名單' : '出發序'}-${pageIndex + 1}.png`;
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,DownloadSimple,ArrowUp,ArrowDown,Plus,Trash,CheckCircle,LockSimple,ArrowCounterClockwise,activeEventRows,registrationClosed,createStartOrder,assignStartDivision,syncStartOrder,entryName,moveStartEntry,generateSectionTimes,validateStartOrder,startReportSections,renderRosterImages,ImagePreview,StartOrderEditor,EventExports,kind,event,rows,settings,disabled,pages,setPages,index,setIndex,busy,setBusy,error,setError,signature,pageIndex,page,filename};
  return null;
}
}

@Component({selector:'demo-start-order-editor',standalone:true,imports:[ViewComponent, IconComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./EventExports.StartOrderEditor.html'})
export class StartOrderEditor extends ViewController {
 validateSave(){if(this.ui.errors.length)this.setPanel("validation");else {this.ui.save();this.props["onPublish"]?.(this.ui.order);}}
 preview=false;
 closePreview=()=>{this.preview=false;this.update();};
 addSection(){this.ui.changeOrder({...this.ui.order,sections:[...this.ui.order.sections,{id:crypto.randomUUID(),title:'自訂分區',theme:'green',divisions:[],start:'09:00',interval:2,parallel:1,rowsPerColumn:13,entries:[]}]});}
 removeSection(id:string){this.ui.changeOrder({...this.ui.order,sections:this.ui.order.sections.filter((s:any)=>s.id!==id)});}

private _state_draft:any; private _ready_draft=false;
private setDraft=(next:any)=>{const value=typeof next==='function'?next(this._state_draft):next;if(!Object.is(value,this._state_draft)){this._state_draft=value;this.update();}};
private _state_message:any; private _ready_message=false;
private setMessage=(next:any)=>{const value=typeof next==='function'?next(this._state_message):next;if(!Object.is(value,this._state_message)){this._state_message=value;this.update();}};
private _state_error:any; private _ready_error=false;
private setError=(next:any)=>{const value=typeof next==='function'?next(this._state_error):next;if(!Object.is(value,this._state_error)){this._state_error=value;this.update();}};
private _state_regenerate:any; private _ready_regenerate=false;
private setRegenerate=(next:any)=>{const value=typeof next==='function'?next(this._state_regenerate):next;if(!Object.is(value,this._state_regenerate)){this._state_regenerate=value;this.update();}};
private _state_mode:any; private _ready_mode=false;
private setMode=(next:any)=>{const value=typeof next==='function'?next(this._state_mode):next;if(!Object.is(value,this._state_mode)){this._state_mode=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    event,
    rows,
    saved,
    onSave,
    Dialog
  } = propsValue;
  if (!this._ready_draft) {
    const stateInitial: any = () => syncStartOrder(saved || createStartOrder(event), rows);
    this._state_draft = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_draft = true;
  }
  const draft: any = this._state_draft;
  const setDraft: any = this.setDraft;
  if (!this._ready_message) {
    const stateInitial: any = '';
    this._state_message = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_message = true;
  }
  const message: any = this._state_message;
  const setMessage: any = this.setMessage;
  if (!this._ready_error) {
    const stateInitial: any = '';
    this._state_error = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_error = true;
  }
  const error: any = this._state_error;
  const setError: any = this.setError;
  if (!this._ready_regenerate) {
    const stateInitial: any = null;
    this._state_regenerate = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_regenerate = true;
  }
  const regenerate: any = this._state_regenerate;
  const setRegenerate: any = this.setRegenerate;
  if (!this._ready_mode) {
    const stateInitial: any = 'edit';
    this._state_mode = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_mode = true;
  }
  const mode: any = this._state_mode;
  const setMode: any = this.setMode;
  const order: any = syncStartOrder(draft, rows),
    errors: any = validateStartOrder(order, rows),
    rowMap: any = new Map(rows.map((row: any) => [row.id, row]));
  const assigned: any = new Set(order.sections.flatMap((section: any) => section.entries.map((entry: any) => entry.recordId)));
  const unassigned: any = rows.filter((row: any) => !assigned.has(row.id));
  const divisionChoices: any = [...new Set([...event.divisions, ...rows.map((row: any) => row.division)])];
  const changed: any = JSON.stringify(order) !== JSON.stringify(saved || syncStartOrder(createStartOrder(event), rows));
  function changeOrder(next: any) {
    setDraft(next);
    setMessage('');
    setError('');
  }
  function changeSection(id: any, patch: any) {
    changeOrder({
      ...order,
      sections: order.sections.map((section: any) => section.id === id ? {
        ...section,
        ...patch
      } : section)
    });
  }
  function changeEntry(sectionId: any, recordId: any, patch: any) {
    changeOrder({
      ...order,
      sections: order.sections.map((section: any) => section.id === sectionId ? {
        ...section,
        entries: section.entries.map((entry: any) => entry.recordId === recordId ? {
          ...entry,
          ...patch
        } : entry)
      } : section)
    });
  }
  function generate(section: any) {
    try {
      const next: any = generateSectionTimes(section);
      changeSection(section.id, next);
      setRegenerate(null);
      setMessage(`已依設定產生「${section.title}」的出發時間，請檢查並儲存。`);
    } catch (problem) {
      setError(problem.message);
      setRegenerate(null);
    }
  }
  function save() {
    if (errors.length) {
      setError(errors[0]);
      return;
    }
    onSave(order);
    setMessage('出發序已儲存於本次分頁預覽。');
    setError('');
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,DownloadSimple,ArrowUp,ArrowDown,Plus,Trash,CheckCircle,LockSimple,ArrowCounterClockwise,activeEventRows,registrationClosed,createStartOrder,assignStartDivision,syncStartOrder,entryName,moveStartEntry,generateSectionTimes,validateStartOrder,startReportSections,renderRosterImages,ImagePreview,StartOrderEditor,EventExports,event,rows,saved,onSave,Dialog,draft,setDraft,message,setMessage,error,setError,regenerate,setRegenerate,mode,setMode,order,errors,rowMap,assigned,unassigned,divisionChoices,changed,changeOrder,changeSection,changeEntry,generate,save};
  return null;
}
}

@Component({selector:'demo-event-exports',standalone:true,imports:[ViewComponent, FormValue, IconComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./EventExports.EventExports.html'})
export class EventExports extends ViewController {
 visibilityChange(key:string,value:boolean){this.props['onVisibilityChange']?.({...this.ui.event.publicVisibility,[key]:value});}
 publishOrder=(order:any)=>{this.ui.onSave(order);this.visibilityChange('startOrder',true);};

 preview=false;
 closePreview=()=>{this.preview=false;this.update();};
 setPanelPreview(){this.preview=true;this.update();}
 filteredEntries(){return this.panel==='main'?this.ui.entries:this.ui.entries.filter((r:any)=>r.division===this.panel);}
 exportEntries(){const rows=[['暱稱','組別'],...this.filteredEntries().map((r:any)=>[r.displayNameOverride||r.nickname||r.name,r.division])];const csv='\ufeff'+rows.map(row=>row.map((v:any)=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=this.ui.event.name+'-名單.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

private _state_entrySettings:any; private _ready_entrySettings=false;
private setEntrySettings=(next:any)=>{const value=typeof next==='function'?next(this._state_entrySettings):next;if(!Object.is(value,this._state_entrySettings)){this._state_entrySettings=value;this.update();}};
private _state_now:any; private _ready_now=false;
private setNow=(next:any)=>{const value=typeof next==='function'?next(this._state_now):next;if(!Object.is(value,this._state_now)){this._state_now=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    catalog,
    event,
    rows,
    onEventChange,
    tab,
    onTabChange,
    saved,
    onSave,
    Dialog
  } = propsValue;
  if (!this._ready_entrySettings) {
    const stateInitial: any = {
      title: 'Entry List',
      rowsPerColumn: 13
    };
    this._state_entrySettings = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_entrySettings = true;
  }
  const entrySettings: any = this._state_entrySettings;
  const setEntrySettings: any = this.setEntrySettings;
  if (!this._ready_now) {
    const stateInitial: any = Date.now();
    this._state_now = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_now = true;
  }
  const now: any = this._state_now;
  const setNow: any = this.setNow;
  this.scheduleEffect(0, () => {
    const timer: any = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const entries: any = activeEventRows(rows, event.id),
    closed: any = registrationClosed(event, now);
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,DownloadSimple,ArrowUp,ArrowDown,Plus,Trash,CheckCircle,LockSimple,ArrowCounterClockwise,activeEventRows,registrationClosed,createStartOrder,assignStartDivision,syncStartOrder,entryName,moveStartEntry,generateSectionTimes,validateStartOrder,startReportSections,renderRosterImages,ImagePreview,StartOrderEditor,EventExports,catalog,event,rows,onEventChange,tab,onTabChange,saved,onSave,Dialog,entrySettings,setEntrySettings,now,setNow,entries,closed};
  return null;
}
}
