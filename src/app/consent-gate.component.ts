import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ScreenDialog} from './screen-dialog.component';
import {TermsReader} from './terms-reader.component';
import {consentError} from '../consent-model.js';
let gateSequence=0;

@Component({selector:'ui-consent-gate',standalone:true,imports:[ScreenDialog,TermsReader],template:`
  <section class="screen-consent-gate">
    @if(inline){<ui-terms-reader [content]="content" [title]="title" (completedChange)="readingChanged($event)"/>}
    <div class="screen-consent-row">
      <label class="screen-check"><input type="checkbox" [checked]="accepted&&read" [attr.aria-disabled]="!read" [attr.aria-invalid]="!!error" [attr.aria-describedby]="id+'-message'" (click)="guard($event)" (change)="toggle($event)"/>{{label}}</label>
      @if(!inline){<button type="button" class="screen-text-link screen-orange" (click)="openReader()">閱讀{{title}} →</button>}
    </div>
    <p [id]="id+'-message'" [class.screen-error]="!!error" [class.screen-muted]="!error" aria-live="polite">{{error||(read?'已閱讀完整條款，請確認是否同意。':'請先開啟並閱讀完整條款，再勾選同意。')}}</p>
  </section>
  @if(opened&&!inline){<ui-dialog [title]="title" [wide]="true" [close]="closeReader">
    <ui-terms-reader [content]="content" [title]="title" (completedChange)="readingChanged($event)"/>
    @if(error){<p class="screen-error" role="alert">{{error}}</p>}
    <div class="screen-actions"><button type="button" class="screen-secondary" (click)="closeReader()">關閉</button><button type="button" class="screen-primary" (click)="finishReading()">完成閱讀</button></div>
  </ui-dialog>}
`})
export class ConsentGate implements OnChanges {
  @Input() content='';
  @Input() title='活動告知';
  @Input() label='我已閱讀並同意條款';
  @Input() inline=false;
  @Input() accepted=false;
  @Input() attempts=0;
  @Output() acceptedChange=new EventEmitter<boolean>();
  @Output() readChange=new EventEmitter<boolean>();
  readonly id=`consent-${++gateSequence}`;
  read=false;
  opened=false;
  error='';
  ngOnChanges(changes:SimpleChanges){
    if(changes['content']){this.read=false;this.accepted=false;this.error='';this.acceptedChange.emit(false);this.readChange.emit(false);}
    if(changes['attempts']&&this.attempts>0)this.error=consentError(this.read,this.accepted);
  }
  openReader(){this.error='';this.opened=true;}
  closeReader=()=>{this.opened=false;};
  readingChanged(done:boolean){
    if(!done)return;
    this.read=true;this.error='';this.readChange.emit(true);
  }
  guard(event:Event){
    if(!this.read){event.preventDefault();this.accepted=false;this.acceptedChange.emit(false);this.error='請閱讀完條款';}
  }
  toggle(event:Event){
    if(!this.read){(event.target as HTMLInputElement).checked=false;this.error='請閱讀完條款';return;}
    this.accepted=(event.target as HTMLInputElement).checked;this.error='';this.acceptedChange.emit(this.accepted);
  }
  finishReading(){if(!this.read){this.error='請閱讀完條款';return;}this.opened=false;}
  validate(){this.error=consentError(this.read,this.accepted);return !this.error;}
}
