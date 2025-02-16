import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { utcToZonedTime } from 'date-fns-tz';
import { getTestScheduler } from 'jasmine-marbles';
import { TestScheduler } from 'rxjs/testing';

import { SystemWideAlertDataService } from '../../core/data/system-wide-alert-data.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { createPaginatedList } from '../../shared/testing/utils.test';
import { SystemWideAlert } from '../system-wide-alert.model';
import { SystemWideAlertBannerComponent } from './system-wide-alert-banner.component';


describe('SystemWideAlertBannerComponent', () => {
  let comp: SystemWideAlertBannerComponent;
  let fixture: ComponentFixture<SystemWideAlertBannerComponent>;
  let systemWideAlertDataService: SystemWideAlertDataService;

  let systemWideAlert: SystemWideAlert;
  let systemWideAlertEmptyMessage: SystemWideAlert;
  let systemWideAlertNullMessage: SystemWideAlert;
  let systemWideAlertUndefinedMessage: SystemWideAlert;
  let scheduler: TestScheduler;

  beforeEach(waitForAsync(() => {
    scheduler = getTestScheduler();

    const countDownDate = new Date();
    countDownDate.setDate(countDownDate.getDate() + 1);
    countDownDate.setHours(countDownDate.getHours() + 1);
    countDownDate.setMinutes(countDownDate.getMinutes() + 1);

    systemWideAlert = Object.assign(new SystemWideAlert(), {
      alertId: 1,
      message: 'Test alert message',
      active: true,
      countdownTo: utcToZonedTime(countDownDate, 'UTC').toISOString(),
    });

    systemWideAlertEmptyMessage = Object.assign(new SystemWideAlert(), {
      alertId: 1,
      message: '',
      active: true,
    });

    systemWideAlertNullMessage = Object.assign(new SystemWideAlert(), {
      alertId: 1,
      message: null,
      active: true,
    });

    systemWideAlertUndefinedMessage = Object.assign(new SystemWideAlert(), {
      alertId: 1,
      message: undefined,
      active: true,
    });

    systemWideAlertDataService = jasmine.createSpyObj('systemWideAlertDataService', {
      searchBy: createSuccessfulRemoteDataObject$(createPaginatedList([systemWideAlert])),
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), SystemWideAlertBannerComponent],
      providers: [
        { provide: SystemWideAlertDataService, useValue: systemWideAlertDataService },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemWideAlertBannerComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('init', () => {
    it('should init the comp', () => {
      expect(comp).toBeTruthy();
    });
    it('should set the time countdown parts in their respective behaviour subjects', fakeAsync(() => {
      spyOn(comp.countDownDays, 'next');
      spyOn(comp.countDownHours, 'next');
      spyOn(comp.countDownMinutes, 'next');
      comp.ngOnInit();
      tick(2000);
      expect(comp.countDownDays.next).toHaveBeenCalled();
      expect(comp.countDownHours.next).toHaveBeenCalled();
      expect(comp.countDownMinutes.next).toHaveBeenCalled();
      discardPeriodicTasks();

    }));
  });

  describe('banner', () => {
    it('should display the alert message and the timer', () => {
      comp.countDownDays.next(1);
      comp.countDownHours.next(1);
      comp.countDownMinutes.next(1);
      fixture.detectChanges();

      const banner = fixture.debugElement.queryAll(By.css('span'));
      expect(banner.length).toEqual(6);

      expect(banner[0].nativeElement.innerHTML).toContain('system-wide-alert-banner.countdown.prefix');
      expect(banner[0].nativeElement.innerHTML).toContain('system-wide-alert-banner.countdown.days');
      expect(banner[0].nativeElement.innerHTML).toContain('system-wide-alert-banner.countdown.hours');
      expect(banner[0].nativeElement.innerHTML).toContain('system-wide-alert-banner.countdown.minutes');

      expect(banner[5].nativeElement.innerHTML).toContain(systemWideAlert.message);
    });

    it('should display the alert message but no timer when no timer is present', () => {
      comp.countDownDays.next(0);
      comp.countDownHours.next(0);
      comp.countDownMinutes.next(0);
      fixture.detectChanges();

      const banner = fixture.debugElement.queryAll(By.css('span'));
      expect(banner.length).toEqual(2);
      expect(banner[1].nativeElement.innerHTML).toContain(systemWideAlert.message);
    });

    it('should not display an alert when none is present', () => {
      comp.systemWideAlert$.next(null);
      fixture.detectChanges();

      const banner = fixture.debugElement.queryAll(By.css('span'));
      expect(banner.length).toEqual(0);
    });

    it('should not display an alert when no message is present', () => {
      comp.systemWideAlert$.next(systemWideAlertEmptyMessage);
      fixture.detectChanges();

      const banner = fixture.debugElement.queryAll(By.css('span'));
      expect(banner.length).toEqual(0);
    });

    it('should not display an alert when null message is present', () => {
      comp.systemWideAlert$.next(systemWideAlertNullMessage);
      fixture.detectChanges();

      const banner = fixture.debugElement.queryAll(By.css('span'));
      expect(banner.length).toEqual(0);
    });

    it('should not display an alert when undefined message is present', () => {
      comp.systemWideAlert$.next(systemWideAlertUndefinedMessage);
      fixture.detectChanges();

      const banner = fixture.debugElement.queryAll(By.css('span'));
      expect(banner.length).toEqual(0);
    });
  });
});
