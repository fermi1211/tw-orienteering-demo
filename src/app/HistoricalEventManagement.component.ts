import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { ArrowRight, CheckCircle, Eye, Plus, Trash } from './icon-symbols';
import { EventAttachments } from "./EventAttachments.component";
import { emptyHistoricalEvent, emptyMaterial, historicalErrors, historicalFeeLabels, materialSchemas, normalizeHistoricalEvent } from "../historical-event-model.js";
const EventLocationPicker={load:()=>import('./EventLocationPicker.component').then(module=>module.EventLocationPicker)};
const uuid: any = () => crypto.randomUUID();
@Component({selector:'demo-material-editor',standalone:true,imports:[ViewComponent, IconComponent],host:{style:'display: contents'},templateUrl:'./HistoricalEventManagement.MaterialEditor.html'})
export class MaterialEditor extends ViewController {
 imageChange=(value:any)=>this.ui.update({images:value.images});
 addMaterialRow(){this.ui.update({rows:[...this.ui.material.rows,{id:crypto.randomUUID()}]});}
 removeMaterialRow(id:string){this.ui.update({rows:this.ui.material.rows.filter((r:any)=>r.id!==id)});}


protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    kind,
    value,
    onChange,
    Dialog
  } = propsValue;
  const schema: any = materialSchemas[kind],
    material: any = value || emptyMaterial();
  const update: any = (patch: any) => onChange({
    ...material,
    ...patch
  });
  function updateRow(id: any, key: any, value: any) {
    update({
      rows: material.rows.map((row: any) => row.id === id ? {
        ...row,
        [key]: value
      } : row)
    });
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,ArrowRight,CheckCircle,Eye,Plus,Trash,EventAttachments,emptyHistoricalEvent,emptyMaterial,historicalErrors,historicalFeeLabels,materialSchemas,normalizeHistoricalEvent,EventLocationPicker,uuid,MaterialEditor,HistoricalEventEditor,MapFallback,HistoricalEventManagement,kind,value,onChange,Dialog,schema,material,update,updateRow};
  return null;
}
}

@Component({selector:'demo-historical-event-editor',standalone:true,imports:[ViewComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./HistoricalEventManagement.HistoricalEventEditor.html'})
export class HistoricalEventEditor extends ViewController {
 materialCallbacks=new Map<string,(value:any)=>void>();
 materialChange(key:string){if(!this.materialCallbacks.has(key))this.materialCallbacks.set(key,(value:any)=>{this.ui.setMaterials({...this.ui.materials,[key]:value});this.ui.mark();});return this.materialCallbacks.get(key)!;}
 materialKey:string|null=null;
 closeMaterial=()=>{this.materialKey=null;this.update();};
 saveMaterial=(value:any)=>{this.ui.setMaterials({...this.ui.materials,[this.materialKey!]:value});this.ui.mark();};

private _state_materials:any; private _ready_materials=false;
private setMaterials=(next:any)=>{const value=typeof next==='function'?next(this._state_materials):next;if(!Object.is(value,this._state_materials)){this._state_materials=value;this.update();}};
private _state_attachments:any; private _ready_attachments=false;
private setAttachments=(next:any)=>{const value=typeof next==='function'?next(this._state_attachments):next;if(!Object.is(value,this._state_attachments)){this._state_attachments=value;this.update();}};
private _state_divisions:any; private _ready_divisions=false;
private setDivisions=(next:any)=>{const value=typeof next==='function'?next(this._state_divisions):next;if(!Object.is(value,this._state_divisions)){this._state_divisions=value;this.update();}};
private _state_terms:any; private _ready_terms=false;
private setTerms=(next:any)=>{const value=typeof next==='function'?next(this._state_terms):next;if(!Object.is(value,this._state_terms)){this._state_terms=value;this.update();}};
private _state_mapOpen:any; private _ready_mapOpen=false;
private setMapOpen=(next:any)=>{const value=typeof next==='function'?next(this._state_mapOpen):next;if(!Object.is(value,this._state_mapOpen)){this._state_mapOpen=value;this.update();}};
private _state_dirty:any; private _ready_dirty=false;
private setDirty=(next:any)=>{const value=typeof next==='function'?next(this._state_dirty):next;if(!Object.is(value,this._state_dirty)){this._state_dirty=value;this.update();}};
private _state_confirmExit:any; private _ready_confirmExit=false;
private setConfirmExit=(next:any)=>{const value=typeof next==='function'?next(this._state_confirmExit):next;if(!Object.is(value,this._state_confirmExit)){this._state_confirmExit=value;this.update();}};
private _state_errors:any; private _ready_errors=false;
private setErrors=(next:any)=>{const value=typeof next==='function'?next(this._state_errors):next;if(!Object.is(value,this._state_errors)){this._state_errors=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    initial,
    onSave,
    onClose,
    Dialog
  } = propsValue;
  const source: any = initial || emptyHistoricalEvent();
  if (!this._ready_materials) {
    const stateInitial: any = () => Object.fromEntries(Object.keys(materialSchemas).map((key: any) => [key, {
      ...emptyMaterial(),
      ...source.materials?.[key]
    }]));
    this._state_materials = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_materials = true;
  }
  const materials: any = this._state_materials;
  const setMaterials: any = this.setMaterials;
  if (!this._ready_attachments) {
    const stateInitial: any = source.attachments;
    this._state_attachments = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_attachments = true;
  }
  const attachments: any = this._state_attachments;
  const setAttachments: any = this.setAttachments;
  if (!this._ready_divisions) {
    const stateInitial: any = () => source.divisions.map((value: any) => ({
      id: uuid(),
      value
    }));
    this._state_divisions = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_divisions = true;
  }
  const divisions: any = this._state_divisions;
  const setDivisions: any = this.setDivisions;
  if (!this._ready_terms) {
    const stateInitial: any = source.terms;
    this._state_terms = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_terms = true;
  }
  const terms: any = this._state_terms;
  const setTerms: any = this.setTerms;
  if (!this._ready_mapOpen) {
    const stateInitial: any = false;
    this._state_mapOpen = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_mapOpen = true;
  }
  const mapOpen: any = this._state_mapOpen;
  const setMapOpen: any = this.setMapOpen;
  if (!this._ready_dirty) {
    const stateInitial: any = false;
    this._state_dirty = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_dirty = true;
  }
  const dirty: any = this._state_dirty;
  const setDirty: any = this.setDirty;
  if (!this._ready_confirmExit) {
    const stateInitial: any = false;
    this._state_confirmExit = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_confirmExit = true;
  }
  const confirmExit: any = this._state_confirmExit;
  const setConfirmExit: any = this.setConfirmExit;
  if (!this._ready_errors) {
    const stateInitial: any = [];
    this._state_errors = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_errors = true;
  }
  const errors: any = this._state_errors;
  const setErrors: any = this.setErrors;
  const mark: any = () => setDirty(true);
  function updateDivision(id: any, value: any) {
    setDivisions((previous: any) => previous.map((item: any) => item.id === id ? {
      ...item,
      value
    } : item));
    mark();
  }
  function updateTerm(id: any, key: any, value: any) {
    setTerms((previous: any) => previous.map((item: any) => item.id === id ? {
      ...item,
      [key]: value
    } : item));
    mark();
  }
  function requestClose() {
    if (dirty) setConfirmExit(true);else onClose();
  }
  function submit(event: any) {
    event.preventDefault();
    const form: any = new FormData(event.currentTarget);
    const latitude: any = String(form.get('mapLatitude') || '').trim(),
      longitude: any = String(form.get('mapLongitude') || '').trim();
    if (Boolean(latitude) !== Boolean(longitude)) {
      setErrors(['請同時填寫地圖緯度與經度，或將兩欄一併清除。']);
      return;
    }
    const value: any = {
      ...source,
      name: String(form.get('name') || ''),
      starts: String(form.get('starts') || ''),
      location: String(form.get('location') || ''),
      description: String(form.get('description') || ''),
      attachments,
      divisions: divisions.map((item: any) => item.value),
      terms,
      materials,
      fees: Object.fromEntries(Object.keys(historicalFeeLabels).map((key: any) => [key, String(form.get(`history-fee-${key}`) || '')])),
      mapLocation: latitude ? {
        lat: Number(latitude),
        lng: Number(longitude),
        approximate: form.has('mapApproximate')
      } : null,
      status: source.status === 'PUBLISHED' || event.submitter?.value === 'publish' ? 'PUBLISHED' : 'DRAFT'
    };
    const problems: any = historicalErrors(value);
    setErrors(problems);
    if (problems.length) {
      document.getElementById('history-errors')?.focus();
      return;
    }
    onSave(normalizeHistoricalEvent(value));
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,ArrowRight,CheckCircle,Eye,Plus,Trash,EventAttachments,emptyHistoricalEvent,emptyMaterial,historicalErrors,historicalFeeLabels,materialSchemas,normalizeHistoricalEvent,EventLocationPicker,uuid,MaterialEditor,HistoricalEventEditor,MapFallback,HistoricalEventManagement,initial,onSave,onClose,Dialog,source,materials,setMaterials,attachments,setAttachments,divisions,setDivisions,terms,setTerms,mapOpen,setMapOpen,dirty,setDirty,confirmExit,setConfirmExit,errors,setErrors,mark,updateDivision,updateTerm,requestClose,submit};
  return null;
}
}

@Component({selector:'demo-map-fallback',standalone:true,imports:[ViewFragmentComponent, ViewAnchor, FormValue],host:{style:'display: contents'},templateUrl:'./HistoricalEventManagement.MapFallback.html'})
export class MapFallback extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    point
  } = propsValue;
  return viewOwner.fragment("fragment3", {
    v0: viewOwner.fragment("fragment0", {
      v0: point?.lat ?? ''
    }),
    v1: viewOwner.fragment("fragment1", {
      v0: point?.lng ?? ''
    }),
    v2: point?.approximate && viewOwner.fragment("fragment2", {
      v0: "on"
    })
  });
}
}

@Component({selector:'demo-historical-event-management',standalone:true,imports:[ViewComponent, FormValue, IconComponent],host:{style:'display: contents'},templateUrl:'./HistoricalEventManagement.HistoricalEventManagement.html'})
export class HistoricalEventManagement extends ViewController {
private _state_editor:any; private _ready_editor=false;
private setEditor=(next:any)=>{const value=typeof next==='function'?next(this._state_editor):next;if(!Object.is(value,this._state_editor)){this._state_editor=value;this.update();}};
private _state_search:any; private _ready_search=false;
private setSearch=(next:any)=>{const value=typeof next==='function'?next(this._state_search):next;if(!Object.is(value,this._state_search)){this._state_search=value;this.update();}};
private _state_filter:any; private _ready_filter=false;
private setFilter=(next:any)=>{const value=typeof next==='function'?next(this._state_filter):next;if(!Object.is(value,this._state_filter)){this._state_filter=value;this.update();}};
private _state_notice:any; private _ready_notice=false;
private setNotice=(next:any)=>{const value=typeof next==='function'?next(this._state_notice):next;if(!Object.is(value,this._state_notice)){this._state_notice=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    records,
    setRecords,
    Dialog,
    onOpenPublic
  } = propsValue;
  if (!this._ready_editor) {
    const stateInitial: any = null;
    this._state_editor = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_editor = true;
  }
  const editor: any = this._state_editor;
  const setEditor: any = this.setEditor;
  if (!this._ready_search) {
    const stateInitial: any = '';
    this._state_search = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_search = true;
  }
  const search: any = this._state_search;
  const setSearch: any = this.setSearch;
  if (!this._ready_filter) {
    const stateInitial: any = 'all';
    this._state_filter = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_filter = true;
  }
  const filter: any = this._state_filter;
  const setFilter: any = this.setFilter;
  if (!this._ready_notice) {
    const stateInitial: any = '';
    this._state_notice = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_notice = true;
  }
  const notice: any = this._state_notice;
  const setNotice: any = this.setNotice;
  const shown: any = records.filter((event: any) => (filter === 'all' || event.status === filter) && `${event.name} ${event.location}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())).sort((a: any, b: any) => b.starts.localeCompare(a.starts));
  function save(value: any) {
    const id: any = value.id || `history-${uuid()}`;
    setRecords((previous: any) => value.id ? previous.map((event: any) => event.id === id ? {
      ...value,
      id
    } : event) : [...previous, {
      ...value,
      id
    }]);
    setEditor(null);
    setNotice(value.status === 'PUBLISHED' ? '歷史賽事已公開；未填項目會自動隱藏。' : '歷史賽事草稿已儲存，尚未公開。');
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,ArrowRight,CheckCircle,Eye,Plus,Trash,EventAttachments,emptyHistoricalEvent,emptyMaterial,historicalErrors,historicalFeeLabels,materialSchemas,normalizeHistoricalEvent,EventLocationPicker,uuid,MaterialEditor,HistoricalEventEditor,MapFallback,HistoricalEventManagement,records,setRecords,Dialog,onOpenPublic,editor,setEditor,search,setSearch,filter,setFilter,notice,setNotice,shown,save};
  return null;
}
}
