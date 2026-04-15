import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PublicationClaimComponent } from '../../../notifications/suggestions/targets/publication-claim/publication-claim.component';
import { AdminNotificationsSuggestionTargetsPageComponent } from './admin-notifications-suggestion-targets-page.component';

describe('AdminNotificationsSuggestionTargetsPageComponent', () => {
  let component: AdminNotificationsSuggestionTargetsPageComponent;
  let fixture: ComponentFixture<AdminNotificationsSuggestionTargetsPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule.forRoot(),
        AdminNotificationsSuggestionTargetsPageComponent,
      ],
      providers: [
        AdminNotificationsSuggestionTargetsPageComponent,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AdminNotificationsSuggestionTargetsPageComponent, { remove: { imports: [PublicationClaimComponent] } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminNotificationsSuggestionTargetsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
