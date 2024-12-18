import { ChangeDetectorRef } from '@angular/core';
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  BrowserModule,
  By,
} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  Store,
  StoreModule,
} from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import uniqueId from 'lodash/uniqueId';

import { INotificationBoardOptions } from '../../../../config/notifications-config.interfaces';
import { AppState } from '../../../app.reducer';
import { NotificationsServiceStub } from '../../testing/notifications-service.stub';
import { Notification } from '../models/notification.model';
import { NotificationType } from '../models/notification-type';
import { NotificationComponent } from '../notification/notification.component';
import { notificationsReducer } from '../notifications.reducers';
import { NotificationsService } from '../notifications.service';
import { ProcessNotificationComponent } from '../process-notification/process-notification.component';
import { NotificationsBoardComponent } from './notifications-board.component';

export const bools = { f: false, t: true };

describe('NotificationsBoardComponent', () => {
  let comp: NotificationsBoardComponent;
  let fixture: ComponentFixture<NotificationsBoardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        StoreModule.forRoot({ notificationsReducer }, {
          runtimeChecks: {
            strictStateImmutability: false,
            strictActionImmutability: false,
          },
        }),
        NotificationsBoardComponent, NotificationComponent,
      ],
      providers: [
        { provide: NotificationsService, useClass: NotificationsServiceStub },
        ChangeDetectorRef,
      ],
    }).overrideComponent(NotificationsBoardComponent, { remove: { imports: [NotificationComponent, ProcessNotificationComponent] } }).compileComponents();  // compile template and css
  }));

  beforeEach(inject([NotificationsService, Store], (service: NotificationsService, store: Store<AppState>) => {
    store
      .subscribe((state) => {
        const notifications = [
          new Notification(uniqueId(), NotificationType.Success, 'title1', 'content1'),
          new Notification(uniqueId(), NotificationType.Info, 'title2', 'content2'),
        ];
        state.notifications = notifications;
      });

    fixture = TestBed.createComponent(NotificationsBoardComponent);
    comp = fixture.componentInstance;
    comp.options = {
      rtl: false,
      position: ['top', 'right'],
      maxStack: 5,
      timeOut: 5000,
      clickToClose: true,
      animate: 'scale',
    } as INotificationBoardOptions;

    fixture.detectChanges();
  }));

  it('should create component', () => {
    expect(comp).toBeTruthy();
  });

  it('should have two notifications', () => {
    expect(comp.notifications.length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('ds-notification')).length).toBe(2);
  });

  describe('notification countdown', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = fixture.debugElement.query(By.css('div.notifications-wrapper'));
    });

    it('should not be paused by default', () => {
      expect(comp.isPaused$).toBeObservable(cold('f', bools));
    });

    it('should pause on mouseenter', () => {
      wrapper.triggerEventHandler('mouseenter');

      expect(comp.isPaused$).toBeObservable(cold('t', bools));
    });

    it('should resume on mouseleave', () => {
      wrapper.triggerEventHandler('mouseenter');
      wrapper.triggerEventHandler('mouseleave');

      expect(comp.isPaused$).toBeObservable(cold('f', bools));
    });

    it('should be passed to all notifications', () => {
      fixture.debugElement.queryAll(By.css('ds-notification'))
        .map(node => node.componentInstance)
        .forEach(notification => {
          expect(notification.isPaused$).toEqual(comp.isPaused$);
        });
    });
  });

})
;
