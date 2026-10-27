import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {IconComponent} from './icons.component';
let openDialogs=0;let previousOverflow='';
@Component({selector:'ui-dialog',standalone:true,imports:[IconComponent],template:`<dialog #dialog class="screen-dialog" [class.is-wide]="wide" [attr.aria-label]="title" (cancel)="$event.preventDefault();close()" (click)="backdrop($event)"><div class="screen-dialog-body"><header><div>@if(kicker){<p class="screen-kicker">{{kicker}}</p>}<h2>{{title}}</h2></div><button type="button" class="icon-button" aria-label="關閉視窗" (click)="close()"><demo-icon [props]="{name:'x',size:22}"/></button></header><ng-content/></div></dialog>`})
export class ScreenDialog implements AfterViewInit,OnDestroy{
 @Input() title='';@Input() kicker='';@Input() wide=false;@Input() close:()=>void=()=>{};
 @ViewChild('dialog') dialog!:ElementRef<HTMLDialogElement>;
 ngAfterViewInit(){if(openDialogs++===0){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}this.dialog.nativeElement.showModal();}
 backdrop(e:MouseEvent){if(e.target===this.dialog.nativeElement)this.close();}
 ngOnDestroy(){this.dialog.nativeElement.close();if(--openDialogs===0)document.body.style.overflow=previousOverflow;}
}
