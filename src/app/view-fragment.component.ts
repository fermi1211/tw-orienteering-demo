import { Component, Directive, EmbeddedViewRef, EnvironmentInjector, Input, OnChanges, OnDestroy, ViewContainerRef, inject } from '@angular/core';
import { IconComponent } from './icons.component';
import { ViewController } from './view-controller';

@Component({selector:'demo-loading',standalone:true,template:'<p role="status" class="hint">正在準備畫面…</p>'})
class LoadingSurface {}

/** Mounts Angular standalone components, retaining keyed state between data updates. */
@Directive({selector:'ng-container[viewComponent]',standalone:true})
export class ViewComponent implements OnChanges,OnDestroy {
 @Input() viewComponent:any;
 @Input() componentProps:any={};
 private container=inject(ViewContainerRef);
 private environment=inject(EnvironmentInjector);
 private current:any;
 private type:any;
 private key:any;
 private version=0;
 ngOnChanges(){
  const type=this.viewComponent?.icon?IconComponent:this.viewComponent;
  const key=this.componentProps?.key;
  if(!type){this.container.clear();this.current=null;this.type=null;return;}
  if(type!==this.type||key!==this.key){
   this.container.clear();this.current=null;this.type=type;this.key=key;const version=++this.version;
   if(type.load){
    this.container.createComponent(LoadingSurface,{environmentInjector:this.environment});
    type.load().then((component:any)=>{if(version!==this.version)return;this.container.clear();this.current=this.container.createComponent(component,{environmentInjector:this.environment});this.current.setInput('props',this.componentProps);}).catch((error:any)=>console.error('無法載入畫面',error));
    return;
   }
   this.current=this.container.createComponent(type,{environmentInjector:this.environment});
  }
  if(this.current)this.current.setInput('props',this.viewComponent?.icon?{...this.componentProps,name:this.viewComponent.icon}:this.componentProps);
 }
 ngOnDestroy(){this.version++;this.container.clear();}
}

/** Renders contextual TemplateRefs without adding DOM wrappers (including table/select children). */
@Directive({selector:'ng-container[viewFragment]',standalone:true})
export class ViewFragmentComponent implements OnChanges,OnDestroy {
 @Input() viewFragment:any;
 @Input() viewOwner!:ViewController;
 @Input() viewRevision=0;
 private container=inject(ViewContainerRef);
 private records:{template:any,key:any,view:EmbeddedViewRef<any>}[]=[];
 ngOnChanges(){
  const values:any[]=[];
  const flatten=(value:any)=>{if(Array.isArray(value))value.forEach(flatten);else if(value!=null&&typeof value!=='boolean')values.push(value);};flatten(this.viewFragment);
  const next:typeof this.records=[];const available=new Set(this.records);
  for(let index=0;index<values.length;index++){
   const value=values[index],isTemplate=value?.kind==='template';
   const template=isTemplate?value.owner.fragments.get(value.name):this.viewOwner.fragments.get('text');
   if(!template)continue;
   const context=isTemplate?value.context:{value:String(value)};
   const key=isTemplate?(value.key??index):index;
   let record=this.records.find(item=>available.has(item)&&item.template===template&&Object.is(item.key,key));
   if(record){available.delete(record);record.view.context.$implicit=context;if(this.container.indexOf(record.view)!==next.length)this.container.move(record.view,next.length);record.view.markForCheck();}
   else record={template,key,view:this.container.createEmbeddedView(template,{$implicit:context},{index:next.length})};
   next.push(record);
  }
  for(const record of available){const index=this.container.indexOf(record.view);if(index>=0)this.container.remove(index);}
  this.records=next;
 }
 ngOnDestroy(){this.container.clear();this.records=[];}
}
