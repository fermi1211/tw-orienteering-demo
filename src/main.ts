import { bootstrapApplication } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';
import { App } from './app/App.component';
import { installSelectFeedback } from './select-feedback';
installSelectFeedback(document);
bootstrapApplication(App,{providers:[provideZoneChangeDetection({eventCoalescing:true})]}).catch(error=>console.error(error));
