import {ScreenDialog} from './screen-dialog.component';
import {EventSummary} from './event-summary.component';
import {MemberNavigation} from './member-navigation.component';
import { IconComponent } from './icons.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { optionName } from "../access-model.js";
import { ArrowLeft, ArrowRight, BookOpen, Clock, MagnifyingGlass } from './icon-symbols';
import { articleDate, articleReadingMinutes } from "../article-model.js";
import { ArticleContent } from "./ArticleContent.component";

@Component({selector:'demo-article-reading-surface',standalone:true,imports:[ViewComponent],host:{style:'display: contents'},templateUrl:'./JournalPage.ArticleReadingSurface.html'})
export class ArticleReadingSurface extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    article,
    categories = [],
    preview = false
  } = propsValue;
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,optionName,ArrowLeft,ArrowRight,BookOpen,Clock,MagnifyingGlass,articleDate,articleReadingMinutes,ArticleContent,ArticleReadingSurface,ArticleCard,JournalPage,article,categories,preview};
  return null;
}
}

@Component({selector:'demo-article-card',standalone:true,imports:[IconComponent],host:{style:'display: contents'},templateUrl:'./JournalPage.ArticleCard.html'})
export class ArticleCard extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    categories,
    article,
    featured,
    onRead
  } = propsValue;
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,optionName,ArrowLeft,ArrowRight,BookOpen,Clock,MagnifyingGlass,articleDate,articleReadingMinutes,ArticleContent,ArticleReadingSurface,ArticleCard,JournalPage,categories,article,featured,onRead};
  return null;
}
}

@Component({selector:'demo-journal-page',standalone:true,imports:[ViewComponent, IconComponent],host:{style:'display: contents'},templateUrl:'./JournalPage.JournalPage.html'})
export class JournalPage extends ViewController {
private _state_category:any; private _ready_category=false;
private setCategory=(next:any)=>{const value=typeof next==='function'?next(this._state_category):next;if(!Object.is(value,this._state_category)){this._state_category=value;this.update();}};
private _state_query:any; private _ready_query=false;
private setQuery=(next:any)=>{const value=typeof next==='function'?next(this._state_query):next;if(!Object.is(value,this._state_query)){this._state_query=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    categories,
    articles,
    articleId,
    onRead,
    onBack
  } = propsValue;
  if (!this._ready_category) {
    const stateInitial: any = '__all__';
    this._state_category = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_category = true;
  }
  const category: any = this._state_category;
  const setCategory: any = this.setCategory;
  if (!this._ready_query) {
    const stateInitial: any = '';
    this._state_query = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_query = true;
  }
  const query: any = this._state_query;
  const setQuery: any = this.setQuery;
  if (articleId) {
    this.ui={articleId,articles,categories,onBack,ArticleReadingSurface,ArticleCard};
    const article: any = articles.find((item: any) => item.id === articleId);
    return viewOwner.fragment("fragment16", {
      v0: viewOwner.fragment("fragment1", {
        v0: onBack,
        v1: viewOwner.fragment("fragment0", {
          v0: ArrowLeft,
          v1: {
            "size": 18
          }
        })
      }),
      v1: article ? viewOwner.fragment("fragment10", {
        v0: viewOwner.fragment("fragment2", {
          v0: ArticleReadingSurface,
          v1: {
            "article": article,
            "categories": categories
          }
        }),
        v1: viewOwner.fragment("fragment9", {
          v0: viewOwner.fragment("fragment3", {
            v0: BookOpen,
            v1: {
              "size": 26
            }
          }),
          v1: viewOwner.fragment("fragment6", {
            v0: viewOwner.fragment("fragment4", {}),
            v1: viewOwner.fragment("fragment5", {})
          }),
          v2: viewOwner.fragment("fragment8", {
            v0: onBack,
            v1: viewOwner.fragment("fragment7", {
              v0: ArrowRight,
              v1: {
                "size": 18
              }
            })
          })
        })
      }) : viewOwner.fragment("fragment15", {
        v0: viewOwner.fragment("fragment11", {
          v0: BookOpen,
          v1: {
            "size": 50
          }
        }),
        v1: viewOwner.fragment("fragment12", {}),
        v2: viewOwner.fragment("fragment13", {}),
        v3: viewOwner.fragment("fragment14", {
          v0: onBack
        })
      })
    });
  }
  const visible: any = articles.filter((article: any) => (category === '__all__' || article.category === category) && `${article.title} ${article.excerpt}`.toLowerCase().includes(query.trim().toLowerCase()));
  /* Native screen bindings: preserve the existing state and business handlers. */
  this.ui = {ViewController,ViewAnchor,ElementBinding,ElementAttributes,EditorMount,FormValue,ViewFragmentComponent,ViewComponent,optionName,ArrowLeft,ArrowRight,BookOpen,Clock,MagnifyingGlass,articleDate,articleReadingMinutes,ArticleContent,ArticleReadingSurface,ArticleCard,JournalPage,categories,articles,articleId,onRead,onBack,category,setCategory,query,setQuery,visible};
  return null;
}
}
