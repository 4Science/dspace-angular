import {
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  Store,
  StoreModule,
} from '@ngrx/store';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { TranslateLoaderMock } from '../mocks';
import { Notification } from './models';
import { NotificationType } from './models';
import {
  NewNotificationAction,
  RemoveAllNotificationsAction,
  RemoveNotificationAction,
} from '@dspace/core';
import { notificationsReducer } from '@dspace/core';
import { NotificationsService } from '@dspace/core';
import { mockStoreModuleConfig } from "../utilities";

describe('NotificationsService test', () => {
  const store: Store<Notification> = jasmine.createSpyObj('store', {
    dispatch: {},
    select: observableOf(true),
  });
  let service: NotificationsService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({ notificationsReducer }, mockStoreModuleConfig),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        NotificationComponent, NotificationsBoardComponent,
      ],
      providers: [
        { provide: Store, useValue: store },
        NotificationsService,
        TranslateService,
      ],
    });

    service = TestBed.inject(NotificationsService);
  }));

  it('Success method should dispatch NewNotificationAction with proper parameter', () => {
    const notification = service.success('Title', observableOf('Content'));
    expect(notification.type).toBe(NotificationType.Success);
    expect(store.dispatch).toHaveBeenCalledWith(new NewNotificationAction(notification));
  });

  it('Warning method should dispatch NewNotificationAction with proper parameter', () => {
    const notification = service.warning('Title', observableOf('Content'));
    expect(notification.type).toBe(NotificationType.Warning);
    expect(store.dispatch).toHaveBeenCalledWith(new NewNotificationAction(notification));
  });

  it('Info method should dispatch NewNotificationAction with proper parameter', () => {
    const notification = service.info('Title', observableOf('Content'));
    expect(notification.type).toBe(NotificationType.Info);
    expect(store.dispatch).toHaveBeenCalledWith(new NewNotificationAction(notification));
  });

  it('Error method should dispatch NewNotificationAction with proper parameter', () => {
    const notification = service.error('Title', observableOf('Content'));
    expect(notification.type).toBe(NotificationType.Error);
    expect(store.dispatch).toHaveBeenCalledWith(new NewNotificationAction(notification));
  });

  it('Remove method should dispatch RemoveNotificationAction with proper id', () => {
    const notification = new Notification('1234', NotificationType.Info, 'title...', 'description');
    service.remove(notification);
    expect(store.dispatch).toHaveBeenCalledWith(new RemoveNotificationAction(notification.id));
  });

  it('RemoveAll method should dispatch RemoveAllNotificationsAction', () => {
    service.removeAll();
    expect(store.dispatch).toHaveBeenCalledWith(new RemoveAllNotificationsAction());
  });

});
