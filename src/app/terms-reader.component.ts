import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild, inject} from '@angular/core';
import {readingAtEnd} from '../consent-model.js';

@Component({selector:'ui-terms-reader',standalone:true,template:`
  <p class="screen-muted">請閱讀以下完整內容；內容較長時，請捲動至底部。</p>
  <div #scroller class="screen-terms-reader" role="region" [attr.aria-label]="title+'內容'" tabindex="0" (scroll)="checkEnd()">
    <div class="screen-terms-copy">{{content}}</div>
    <p class="screen-terms-end">— 條款內容結束 —</p>
  </div>
  <p class="screen-reading-status" aria-live="polite">{{completed?'已閱讀至條款底部':'尚未閱讀完條款，請繼續向下捲動'}}</p>
`})
export class TermsReader implements OnChanges, AfterViewChecked, OnDestroy {
  @Input() content='';
  @Input() title='條款';
  @Output() completedChange=new EventEmitter<boolean>();
  @ViewChild('scroller') scroller?:ElementRef<HTMLElement>;
  completed=false;
  private pending=true;
  private queued=false;
  private destroyed=false;
  private observer?:ResizeObserver;
  private detector=inject(ChangeDetectorRef);
  ngOnChanges(){this.completed=false;this.pending=true;this.completedChange.emit(false);}
  ngAfterViewChecked(){
    if(!this.pending||this.queued||!this.scroller)return;
    this.queued=true;
    queueMicrotask(()=>{
      this.queued=false;if(this.destroyed||!this.scroller)return;
      this.pending=false;this.scroller.nativeElement.scrollTop=0;
      this.observer?.disconnect();
      this.observer=new ResizeObserver(()=>this.checkEnd());
      this.observer.observe(this.scroller.nativeElement);
      this.checkEnd();
    });
  }
  checkEnd(){
    if(this.completed||!this.scroller||!readingAtEnd(this.scroller.nativeElement))return;
    this.completed=true;this.completedChange.emit(true);this.detector.markForCheck();
  }
  ngOnDestroy(){this.destroyed=true;this.observer?.disconnect();}
}
