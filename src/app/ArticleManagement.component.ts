import {mediaPolicy} from '../media-policy.js';
import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { optionName } from "../access-model.js";
import { ArrowLeft, ArrowRight, Plus, Eye, CheckCircle, PencilSimple, Trash, BookOpen } from './icon-symbols';
import { articleDate, articleHasDraftChanges, articleImageCount, articlePublishErrors, articleReadingMinutes, articleText, emptyArticleDocument, normalizeArticle, saveArticleRecord } from "../article-model.js";
import { readArticleImage } from "../article-images.js";
import { RichArticleEditor } from "./RichArticleEditor.component";
import { ArticleReadingSurface } from "./JournalPage.component";

@Component({selector:'demo-article-composer',standalone:true,imports:[ViewComponent, FormValue, IconComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./ArticleManagement.ArticleComposer.html'})
export class ArticleComposer extends ViewController {
 previewOpen=false;
 closeComposerPreview=()=>{this.previewOpen=false;};
 updateContent=(content:any)=>this.ui.change({content});
 requestBack(){this.ui.dirty?this.ui.setLeaving(true):this.ui.onBack();}

private _state_draft:any; private _ready_draft=false;
private setDraft=(next:any)=>{const value=typeof next==='function'?next(this._state_draft):next;if(!Object.is(value,this._state_draft)){this._state_draft=value;this.update();}};
private _state_baseline:any; private _ready_baseline=false;
private setBaseline=(next:any)=>{const value=typeof next==='function'?next(this._state_baseline):next;if(!Object.is(value,this._state_baseline)){this._state_baseline=value;this.update();}};
private _state_mode:any; private _ready_mode=false;
private setMode=(next:any)=>{const value=typeof next==='function'?next(this._state_mode):next;if(!Object.is(value,this._state_mode)){this._state_mode=value;this.update();}};
private _state_error:any; private _ready_error=false;
private setError=(next:any)=>{const value=typeof next==='function'?next(this._state_error):next;if(!Object.is(value,this._state_error)){this._state_error=value;this.update();}};
private _state_notice:any; private _ready_notice=false;
private setNotice=(next:any)=>{const value=typeof next==='function'?next(this._state_notice):next;if(!Object.is(value,this._state_notice)){this._state_notice=value;this.update();}};
private _state_leaving:any; private _ready_leaving=false;
private setLeaving=(next:any)=>{const value=typeof next==='function'?next(this._state_leaving):next;if(!Object.is(value,this._state_leaving)){this._state_leaving=value;this.update();}};
private _state_coverBusy:any; private _ready_coverBusy=false;
private setCoverBusy=(next:any)=>{const value=typeof next==='function'?next(this._state_coverBusy):next;if(!Object.is(value,this._state_coverBusy)){this._state_coverBusy=value;this.update();}};
private _state_editorBusy:any; private _ready_editorBusy=false;
private setEditorBusy=(next:any)=>{const value=typeof next==='function'?next(this._state_editorBusy):next;if(!Object.is(value,this._state_editorBusy)){this._state_editorBusy=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    categories,
    record,
    onSave,
    onBack,
    onDirtyChange,
    Dialog
  } = propsValue;
  if (!this._ready_draft) {
    const stateInitial: any = record.draft;
    this._state_draft = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_draft = true;
  }
  const draft: any = this._state_draft;
  const setDraft: any = this.setDraft;
  if (!this._ready_baseline) {
    const stateInitial: any = JSON.stringify(record.draft);
    this._state_baseline = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_baseline = true;
  }
  const baseline: any = this._state_baseline;
  const setBaseline: any = this.setBaseline;
  if (!this._ready_mode) {
    const stateInitial: any = 'edit';
    this._state_mode = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_mode = true;
  }
  const mode: any = this._state_mode;
  const setMode: any = this.setMode;
  if (!this._ready_error) {
    const stateInitial: any = '';
    this._state_error = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_error = true;
  }
  const error: any = this._state_error;
  const setError: any = this.setError;
  if (!this._ready_notice) {
    const stateInitial: any = '';
    this._state_notice = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_notice = true;
  }
  const notice: any = this._state_notice;
  const setNotice: any = this.setNotice;
  if (!this._ready_leaving) {
    const stateInitial: any = false;
    this._state_leaving = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_leaving = true;
  }
  const leaving: any = this._state_leaving;
  const setLeaving: any = this.setLeaving;
  if (!this._ready_coverBusy) {
    const stateInitial: any = false;
    this._state_coverBusy = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_coverBusy = true;
  }
  const coverBusy: any = this._state_coverBusy;
  const setCoverBusy: any = this.setCoverBusy;
  if (!this._ready_editorBusy) {
    const stateInitial: any = false;
    this._state_editorBusy = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_editorBusy = true;
  }
  const editorBusy: any = this._state_editorBusy;
  const setEditorBusy: any = this.setEditorBusy;
  const dirty: any = JSON.stringify(draft) !== baseline;
  this.scheduleEffect(0, () => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);
  this.scheduleEffect(1, () => {
    if (!dirty) return;
    const beforeUnload: any = (event: any) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);
  function change(patch: any) {
    setDraft((previous: any) => ({
      ...previous,
      ...patch
    }));
    setNotice('');
    setError('');
  }
  function save(publish: any, leave = false) {
    if (coverBusy || editorBusy) return;
    const categoryValid: any = categories.some((category: any) => category.id === draft.category && (category.active || category.id === record.draft.category));
    const problem: any = publish ? !categoryValid ? '請先選擇啟用中的文章分類。' : articlePublishErrors(draft)[0] : articleImageCount(draft.content) > mediaPolicy.maxImages ? `每篇文章最多加入 ${mediaPolicy.maxImages} 張內文圖片。` : '';
    if (problem) {
      setError(problem);
      return;
    }
    const next: any = normalizeArticle(draft);
    onSave(next, publish);
    setDraft(next);
    setBaseline(JSON.stringify(next));
    setError('');
    setNotice(publish ? '文章已發布，可從定向專欄閱讀。' : '草稿已儲存於本次分頁；公開內容維持上次發布版本。');
    if (leave) onBack();
  }
  async function chooseCover(event: any) {
    const file: any = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    setCoverBusy(true);
    setError('');
    try {
      change({
        cover: await readArticleImage(file)
      });
    } catch (problem) {
      setError(problem.message);
    } finally {
      setCoverBusy(false);
    }
  }
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,optionName,ArrowLeft,ArrowRight,Plus,Eye,CheckCircle,PencilSimple,Trash,BookOpen,articleDate,articleHasDraftChanges,articleImageCount,articlePublishErrors,articleReadingMinutes,articleText,emptyArticleDocument,normalizeArticle,saveArticleRecord,readArticleImage,RichArticleEditor,ArticleReadingSurface,ArticleComposer,ArticleManagement,categories,record,onSave,onBack,onDirtyChange,Dialog,draft,setDraft,baseline,setBaseline,mode,setMode,error,setError,notice,setNotice,leaving,setLeaving,coverBusy,setCoverBusy,editorBusy,setEditorBusy,dirty,change,save,chooseCover};
  return null;
}
}

@Component({selector:'demo-article-management',standalone:true,imports:[ViewComponent, IconComponent, ScreenDialog],host:{style:'display: contents'},templateUrl:'./ArticleManagement.ArticleManagement.html'})
export class ArticleManagement extends ViewController {
 previewArticle:any=null;
 preview(record:any){this.previewArticle={...record.draft,id:record.id,updatedAt:record.savedAt||record.published?.updatedAt};}
 closePreview=()=>{this.previewArticle=null;};
 articleTabs=[{id:'ALL',name:'全部文章'},{id:'PUBLISHED',name:'已發布'},{id:'DRAFT',name:'草稿'},{id:'TRASH',name:'已刪除'}];
 deleteArticle(){this.ui.setRecords(this.ui.records.map((r:any)=>r.id===this.ui.remove.id?{...r,deletedAt:new Date().toISOString()}:r));this.ui.setRemove(null);}
 restoreArticle(record:any){this.ui.setRecords(this.ui.records.map((r:any)=>r.id===record.id?{...r,deletedAt:null}:r));}

private _state_editing:any; private _ready_editing=false;
private setEditing=(next:any)=>{const value=typeof next==='function'?next(this._state_editing):next;if(!Object.is(value,this._state_editing)){this._state_editing=value;this.update();}};
private _state_filter:any; private _ready_filter=false;
private setFilter=(next:any)=>{const value=typeof next==='function'?next(this._state_filter):next;if(!Object.is(value,this._state_filter)){this._state_filter=value;this.update();}};
private _state_query:any; private _ready_query=false;
private setQuery=(next:any)=>{const value=typeof next==='function'?next(this._state_query):next;if(!Object.is(value,this._state_query)){this._state_query=value;this.update();}};
private _state_message:any; private _ready_message=false;
private setMessage=(next:any)=>{const value=typeof next==='function'?next(this._state_message):next;if(!Object.is(value,this._state_message)){this._state_message=value;this.update();}};
private _state_remove:any; private _ready_remove=false;
private setRemove=(next:any)=>{const value=typeof next==='function'?next(this._state_remove):next;if(!Object.is(value,this._state_remove)){this._state_remove=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    categories,
    records,
    setRecords,
    onDirtyChange,
    onOpenPublic,
    Dialog
  } = propsValue;
  if (!this._ready_editing) {
    const stateInitial: any = null;
    this._state_editing = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_editing = true;
  }
  const editing: any = this._state_editing;
  const setEditing: any = this.setEditing;
  if (!this._ready_filter) {
    const stateInitial: any = 'ALL';
    this._state_filter = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_filter = true;
  }
  const filter: any = this._state_filter;
  const setFilter: any = this.setFilter;
  if (!this._ready_query) {
    const stateInitial: any = '';
    this._state_query = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_query = true;
  }
  const query: any = this._state_query;
  const setQuery: any = this.setQuery;
  if (!this._ready_message) {
    const stateInitial: any = '';
    this._state_message = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_message = true;
  }
  const message: any = this._state_message;
  const setMessage: any = this.setMessage;
  if (!this._ready_remove) {
    const stateInitial: any = null;
    this._state_remove = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_remove = true;
  }
  const remove: any = this._state_remove;
  const setRemove: any = this.setRemove;
  function edit(record: any = undefined) {
    setEditing(record || {
      id: crypto.randomUUID(),
      draft: normalizeArticle({
        title: '',
        excerpt: '',
        category: categories.find((category: any) => category.active)?.id || '',
        author: '台灣定向編輯部',
        content: emptyArticleDocument()
      }),
      published: null
    });
    setMessage('');
    window.scrollTo(0, 0);
  }
  function save(draft: any, publish: any) {
    const next: any = saveArticleRecord(records.find((item: any) => item.id === editing.id) || editing, draft, publish);
    setRecords((previous: any) => previous.some((item: any) => item.id === next.id) ? previous.map((item: any) => item.id === next.id ? next : item) : [next, ...previous]);
    setEditing(next);
  }
  function exit() {
    setEditing(null);
    onDirtyChange(false);
    window.scrollTo(0, 0);
  }
  if (editing) { this.ui={editing,categories,ArticleComposer,save,exit,onDirtyChange,Dialog}; return viewOwner.fragment("fragment0", {
    v0: ArticleComposer,
    v1: {
      "categories": categories,
      "key": editing.id,
      "record": editing,
      "onSave": save,
      "onBack": exit,
      "onDirtyChange": onDirtyChange,
      "Dialog": Dialog
    }
  });
  }
  const active: any = records.filter((item: any) => !item.deletedAt),
    shown: any = records.filter((item: any) => (filter === 'TRASH' ? item.deletedAt : !item.deletedAt) && (filter === 'PUBLISHED' ? item.published : filter === 'DRAFT' ? !item.published : true) && `${item.draft.title} ${item.draft.excerpt}`.toLowerCase().includes(query.toLowerCase()));
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,optionName,ArrowLeft,ArrowRight,Plus,Eye,CheckCircle,PencilSimple,Trash,BookOpen,articleDate,articleHasDraftChanges,articleImageCount,articlePublishErrors,articleReadingMinutes,articleText,emptyArticleDocument,normalizeArticle,saveArticleRecord,readArticleImage,RichArticleEditor,ArticleReadingSurface,ArticleComposer,ArticleManagement,categories,records,setRecords,onDirtyChange,onOpenPublic,Dialog,editing,setEditing,filter,setFilter,query,setQuery,message,setMessage,remove,setRemove,active,shown,edit,save,exit};
  return null;
}
}
