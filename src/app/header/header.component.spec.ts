import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { HostWindowService } from '../shared/host-window.service';
import { MenuService } from '../shared/menu/menu.service';
import { HostWindowServiceStub } from '../shared/testing/host-window-service.stub';
import { MenuServiceStub } from '../shared/testing/menu-service.stub';
import { HeaderComponent } from './header.component';

let comp: HeaderComponent;
let fixture: ComponentFixture<HeaderComponent>;

describe('HeaderComponent', () => {
  const menuService = new MenuServiceStub();

  // waitForAsync beforeEach
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        NoopAnimationsModule,
        ReactiveFormsModule],
      declarations: [HeaderComponent],
      providers: [
        { provide: HostWindowService, useValue: new HostWindowServiceStub(0) },
        { provide: MenuService, useValue: menuService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();  // compile template and css
  }));

  // synchronous beforeEach
  beforeEach(() => {
    spyOn(menuService, 'getMenuTopSections').and.returnValue(observableOf([]));

    fixture = TestBed.createComponent(HeaderComponent);

    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when the toggle button is clicked', () => {

    beforeEach(() => {
      spyOn(menuService, 'toggleMenu');
      const navbarToggler = fixture.debugElement.query(By.css('.navbar-toggler'));
      navbarToggler.triggerEventHandler('click', null);
    });

    it('should call toggleMenu on the menuService', () => {
      expect(menuService.toggleMenu).toHaveBeenCalled();
    });

  });
});
