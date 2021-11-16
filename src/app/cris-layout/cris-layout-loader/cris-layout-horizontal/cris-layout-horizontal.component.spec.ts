import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrisLayoutHorizontalComponent } from './cris-layout-horizontal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterMock } from '../../../shared/mocks/router.mock';
import { MockActivatedRoute } from '../../../shared/mocks/active-router.mock';
import { By } from '@angular/platform-browser';
import { loaderTabs } from '../../../shared/testing/new-layout-tabs';


describe('CrisLayoutHorizontalComponent', () => {
  let component: CrisLayoutHorizontalComponent;
  let fixture: ComponentFixture<CrisLayoutHorizontalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrisLayoutHorizontalComponent ],
      providers: [
        { provide: Router, useValue: new RouterMock() },
        { provide: ActivatedRoute, useValue: new MockActivatedRoute() },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrisLayoutHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shouldshow navbar', () => {
    component.tabs = loaderTabs;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('ds-cris-layout-navbar'))).toBeTruthy();
  });
});
