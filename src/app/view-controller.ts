import { DomSanitizer } from '@angular/platform-browser';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, DestroyRef, Directive, DoCheck, ElementRef, EnvironmentInjector, Input, OnChanges, OnDestroy, QueryList, SimpleChanges, TemplateRef, Type, ViewChildren, ViewContainerRef, Renderer2, inject } from '@angular/core';
import type { Editor } from '@tiptap/core';

/** A template and its lexical data; Angular owns all DOM creation and event bindings. */
export interface ViewFragment { kind: 'template'; owner: ViewController; name: string; context: Record<string, any>; key?: any }
@Directive({ selector: 'ng-template[viewAnchor]', standalone: true })
export class ViewAnchor { @Input() viewAnchor=''; constructor(public template: TemplateRef<any>) {} }

/** Shared Angular lifecycle for template contexts, deferred browser resources and cleanup. */
@Directive()
export abstract class ViewController implements DoCheck, AfterViewInit, AfterViewChecked, OnDestroy {
  @Input() props: Record<string, any> = {};
  @ViewChildren(ViewAnchor) anchors!: QueryList<ViewAnchor>;
  protected readonly changeDetector=inject(ChangeDetectorRef);
  protected readonly destroyRef=inject(DestroyRef);
  fragments=new Map<string,TemplateRef<any>>();
  view:any=null;
  ui:any={};
  panel="main";
  setPanel(value:string){this.panel=value;this.update();}
  list(value:any):{key:string,value:any}[]{return Object.entries(value||{}).map(([key,value])=>({key,value}));}
  add(setter:any,rows:any[],item:any){setter([...rows,item]);}
  remove(setter:any,rows:any[],index:number){setter(rows.filter((_,i)=>i!==index));}
  patchRow(setter:any,rows:any[],index:number,key:string,value:any){setter(rows.map((row,i)=>i===index?{...row,[key]:value}:row));}
  private callbackCache=new Map<string,()=>void>();
  handle(key:string,value:any=null){const id=key+":"+String(value);if(!this.callbackCache.has(id))this.callbackCache.set(id,()=>this.ui[key]?.(value));return this.callbackCache.get(id)!;}
  toggleList(setter:any,values:any[],id:any,enabled:boolean){setter(enabled?[...new Set([...values,id])]:values.filter(v=>v!==id));}
  patchList(setter:any,draft:any,key:string,id:any,enabled:boolean){this.patch(setter,draft,key,enabled?[...new Set([...(draft[key]||[]),id])]:(draft[key]||[]).filter((v:any)=>v!==id));}
  uid(){return crypto.randomUUID();}
  /** Native details menus close after a navigation choice, including the current page. */
  closeNavigationMenu(event:Event){
    const target=event.target as Element;
    if(event.type==='click'&&!target.closest('button,a'))return;
    const element=event.currentTarget as HTMLElement;
    const selectedMenu=target.closest('details');
    if(selectedMenu)selectedMenu.open=false;
    const menu=element.closest('nav')||element.closest('header')||element;
    if(menu instanceof HTMLDetailsElement)menu.open=false;
    menu.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(details=>details.open=false);
  }
  noOp=()=>{};
  merge(a:any,b:any){return {...a,...b};}
  drop(setter:any,rows:any[],id:any){setter(rows.filter(row=>row.id!==id));}
  closePanel=()=>this.setPanel("main");
  dismissError=()=>this.ui.setError?.("");
  viewRecords(){this.props["onBack"]?.();this.props["onViewRecords"]?.();}
  byId(rows:any[],id:any){return rows?.find(row=>row.id===id); }
  patch(setter:any,current:any,key:string,value:any){setter({...current,[key]:value});}
  field(event:Event){return (event.target as HTMLInputElement).value;}
  checked(event:Event){return (event.target as HTMLInputElement).checked;}
  shortDate(value:string){if(!value)return "—";const d=value.slice(0,10);return d.replaceAll("-",".")+"（"+["日","一","二","三","四","五","六"][new Date(d+"T12:00:00+08:00").getUTCDay()]+"）";}
  feeLabel(key:string){return ({MEMBER:"會員",LEGACY_PREPAID:"舊制已預繳",SINGLE:"單次報名"} as any)[key]||key;}
  statusLabel(key:string){return ({PENDING:"銀行待確認",RECONCILED:"已完成對帳",ONSITE:"現場繳費",COMPLETED:"報名完成",PAID:"已繳款",CANCELLED:"已取消"} as any)[key]||key;}
  private effects=new Map<number,{callback:()=>any,deps:any[]|undefined,last?:any[],cleanup?:()=>void,ran:boolean}>();
  private effectQueued=false;
  private destroyed=false;
  private urls=new Map<number,{file:File,url:string}>();
  private editor?:Editor;
  private initializedView=false;
  private sanitizer=inject(DomSanitizer);
  protected trustedResource(value:string){return this.sanitizer.bypassSecurityTrustResourceUrl(value);}
  protected abstract compute(props:any):any;
  protected fragment(name:string,context:Record<string,any>,key?:any):ViewFragment { return {kind:'template',owner:this,name,context,key}; }
  protected update(){if(!this.destroyed)this.changeDetector.markForCheck();}
  ngDoCheck(){this.view=this.compute(this.props);}
  ngAfterViewInit(){this.collectTemplates();this.anchors.changes.subscribe(()=>{this.collectTemplates();this.update();});this.initializedView=true;this.changeDetector.detectChanges();}
  private collectTemplates(){this.fragments=new Map(this.anchors.map(anchor=>[anchor.viewAnchor,anchor.template]));}
  protected scheduleEffect(id:number,callback:()=>any,deps?:any[]){const old=this.effects.get(id);this.effects.set(id,{...old,callback,deps,ran:old?.ran||false});}
  ngAfterViewChecked(){
    if(!this.initializedView||this.effectQueued||this.destroyed)return;
    const changed=[...this.effects.values()].some(effect=>!effect.ran||!effect.deps||!effect.last||effect.deps.length!==effect.last.length||effect.deps.some((value,index)=>!Object.is(value,effect.last[index])));
    if(!changed)return;this.effectQueued=true;
    queueMicrotask(()=>{this.effectQueued=false;if(this.destroyed)return;for(const effect of this.effects.values()){
      if(effect.ran&&effect.deps&&effect.last&&effect.deps.length===effect.last.length&&effect.deps.every((value,index)=>Object.is(value,effect.last[index])))continue;
      effect.cleanup?.();effect.last=effect.deps?.slice();effect.ran=true;const cleanup=effect.callback();effect.cleanup=typeof cleanup==='function'?cleanup:undefined;
    }});
  }
  protected fileResource(id:number,file:File){const cached=this.urls.get(id);if(cached?.file===file)return cached.url;if(cached)URL.revokeObjectURL(cached.url);if(!file){this.urls.delete(id);return '';}const url=URL.createObjectURL(file);this.urls.set(id,{file,url});return url;}
  protected editorResource(factory:()=>Editor){if(!this.editor)this.editor=factory();return this.editor;}
  ngOnDestroy(){this.destroyed=true;for(const effect of this.effects.values())effect.cleanup?.();for(const resource of this.urls.values())URL.revokeObjectURL(resource.url);this.editor?.destroy();}
}
@Directive({ selector:'[elementBinding]', standalone:true })
export class ElementBinding implements OnChanges,OnDestroy {
  @Input() elementBinding:any;
  constructor(private element:ElementRef){}
  ngOnChanges(){if(this.elementBinding)this.elementBinding.current=this.element.nativeElement;}
  ngOnDestroy(){if(this.elementBinding?.current===this.element.nativeElement)this.elementBinding.current=null;}
}
@Directive({ selector:'[editorMount]', standalone:true })
export class EditorMount implements OnChanges {
 @Input() editorMount:any;
 constructor(private element:ElementRef){}
 ngOnChanges(){const dom=this.editorMount?.view?.dom;if(dom&&dom.parentNode!==this.element.nativeElement)this.element.nativeElement.replaceChildren(dom);}
}

@Directive({selector:'[elementAttributes]',standalone:true})
export class ElementAttributes implements OnChanges {
 @Input() elementAttributes:any;
 private element=inject(ElementRef); private renderer=inject(Renderer2);
 ngOnChanges(){for(const [key,value] of Object.entries(this.elementAttributes||{})){if(key==='key'||value==null)continue;const name=key==='className'?'class':key;if(name==='style'&&typeof value==='object'){for(const [property,content] of Object.entries(value))this.renderer.setStyle(this.element.nativeElement,property,content);}else if(name in this.element.nativeElement)this.renderer.setProperty(this.element.nativeElement,name,value);else this.renderer.setAttribute(this.element.nativeElement,name,String(value));}}
}

/** Apply controlled field values after contextual option templates have been checked. */
@Directive({selector:'[formValue]',standalone:true})
export class FormValue implements AfterViewChecked {
 @Input() formValue:any;private element=inject(ElementRef);
 ngAfterViewChecked(){const element=this.element.nativeElement;const value=this.formValue==null?'':String(this.formValue);if(element.value!==value)element.value=value;}
}
