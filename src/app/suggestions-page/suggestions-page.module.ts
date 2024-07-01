import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuggestionsPageComponent } from './suggestions-page.component';
import { SharedModule } from '../shared/shared.module';
import { SuggestionsPageRoutingModule } from './suggestions-page-routing.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SuggestionsService } from '../notifications/suggestions.service';
import { SuggestionDataService } from '../core/notifications/suggestions/suggestion-data.service';

@NgModule({
  declarations: [SuggestionsPageComponent],
  imports: [
    CommonModule,
    SharedModule,
    SuggestionsPageRoutingModule,
    NotificationsModule
  ],
  providers: [
    SuggestionDataService,
    SuggestionsService
  ]
})
export class SuggestionsPageModule { }
