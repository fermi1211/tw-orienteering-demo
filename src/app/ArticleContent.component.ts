import { Component, Input, OnChanges, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { articleHtml } from '../article-html.js';
@Component({selector:'demo-article-content',standalone:true,host:{style:'display: contents'},template:'<div class="article-body" [innerHTML]="html"></div>'})
export class ArticleContent implements OnChanges {
 @Input() props:any={};html:SafeHtml='';private sanitizer=inject(DomSanitizer);
 ngOnChanges(){this.html=this.sanitizer.bypassSecurityTrustHtml(articleHtml(this.props.content));}
}
