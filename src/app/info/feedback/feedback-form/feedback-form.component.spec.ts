import {
  DebugElement,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AuthService } from '@dspace/core';
import { FeedbackDataService } from '@dspace/core';
import { Feedback } from '@dspace/core';
import { NativeWindowMockFactory } from '@dspace/core';
import { RouterMock } from '@dspace/core';
import { NotificationsService } from '@dspace/core';
import { RouteService } from '@dspace/core';
import { NativeWindowService } from '@dspace/core';
import { AuthServiceStub } from '@dspace/core';
import { EPersonMock } from '@dspace/core';
import { NotificationsServiceStub } from '@dspace/core';
import { routeServiceStub } from '@dspace/core';
import { BtnDisabledDirective } from '../../../shared/btn-disabled.directive';
import { FeedbackFormComponent } from './feedback-form.component';


describe('FeedbackFormComponent', () => {
  let component: FeedbackFormComponent;
  let fixture: ComponentFixture<FeedbackFormComponent>;
  let de: DebugElement;
  const notificationService = new NotificationsServiceStub();
  const feedbackDataServiceStub = jasmine.createSpyObj('feedbackDataService', {
    create: of(new Feedback()),
  });
  const authService: AuthServiceStub = Object.assign(new AuthServiceStub(), {
    getAuthenticatedUserFromStore: () => {
      return of(EPersonMock);
    },
  });
  const routerStub = new RouterMock();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FeedbackFormComponent, BtnDisabledDirective],
      providers: [
        { provide: RouteService, useValue: routeServiceStub },
        { provide: UntypedFormBuilder, useValue: new UntypedFormBuilder() },
        { provide: NotificationsService, useValue: notificationService },
        { provide: FeedbackDataService, useValue: feedbackDataServiceStub },
        { provide: AuthService, useValue: authService },
        { provide: NativeWindowService, useFactory: NativeWindowMockFactory },
        { provide: Router, useValue: routerStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackFormComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have page value', () => {
    expect(component.feedbackForm.controls.page.value).toEqual('http://localhost/home');
  });

  it('should have email if ePerson', () => {
    expect(component.feedbackForm.controls.email.value).toEqual('test@test.com');
  });

  it('should have disabled button', () => {
    expect(de.query(By.css('button')).nativeElement.getAttribute('aria-disabled')).toBe('true');
    expect(de.query(By.css('button')).nativeElement.classList.contains('disabled')).toBeTrue();
  });

  describe('when message is inserted', () => {

    beforeEach(() => {
      component.feedbackForm.patchValue({ message: 'new feedback' });
      fixture.detectChanges();
    });

    it('should not have disabled button', () => {
      expect(de.query(By.css('button')).nativeElement.getAttribute('aria-disabled')).toBe('false');
      expect(de.query(By.css('button')).nativeElement.classList.contains('disabled')).toBeFalse();
    });

    it('on submit should call createFeedback of feedbackDataServiceStub service', () => {
      component.createFeedback();
      fixture.detectChanges();
      expect(feedbackDataServiceStub.create).toHaveBeenCalled();
    });
  });


});
