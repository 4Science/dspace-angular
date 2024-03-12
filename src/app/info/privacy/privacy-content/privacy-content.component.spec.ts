import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from '../../../shared/testing/active-router.stub';
import { ComponentFixture, TestBed, waitForAsync, } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PrivacyContentComponent } from './privacy-content.component';

describe('PrivacyContentComponent', () => {
  let component: PrivacyContentComponent;
  let fixture: ComponentFixture<PrivacyContentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), PrivacyContentComponent],
    providers: [{ provide: ActivatedRoute, useValue: new ActivatedRouteStub() }],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
