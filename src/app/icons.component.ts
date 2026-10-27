import { Component, Input, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { iconPaths } from './icon-data';
@Component({selector:'demo-icon',standalone:true,host:{style:'display: contents'},template:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" [attr.width]="props.size||24" [attr.height]="props.size||24" [attr.class]="props.className||null" aria-hidden="true" focusable="false" [innerHTML]="paths"></svg>`})
export class IconComponent {
 @Input() props:any={};private sanitizer=inject(DomSanitizer);
 get paths(){return this.sanitizer.bypassSecurityTrustHtml(iconPaths[this.props.name+':'+(this.props.weight||'regular')]||iconPaths[this.props.name+':regular']||'');}
}
