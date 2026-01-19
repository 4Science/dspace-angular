import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { SiteDataService } from '../../../core/data/site-data.service';
import { LocaleService } from '../../../core/locale/locale.service';
import { ActivatedRouteStub } from '../../../shared/testing/active-router.stub';
import { PrivacyContentComponent } from './privacy-content.component';

describe('PrivacyContentComponent', () => {
  let component: PrivacyContentComponent;
  let fixture: ComponentFixture<PrivacyContentComponent>;
  let siteServiceSpy: jasmine.SpyObj<SiteDataService>;
  let localeServiceSpy: jasmine.SpyObj<LocaleService>;

  beforeEach(waitForAsync(() => {
    siteServiceSpy = jasmine.createSpyObj('SiteDataService', ['find']);
    localeServiceSpy = jasmine.createSpyObj('LocaleService', ['getCurrentLanguageCode']);

    siteServiceSpy.find.and.returnValue(of({ metadataAsList: [] } as any));
    localeServiceSpy.getCurrentLanguageCode.and.returnValue('en');

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PrivacyContentComponent],
      providers: [
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: SiteDataService, useValue: siteServiceSpy },
        { provide: LocaleService, useValue: localeServiceSpy },
      ],
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

  it('should use fallback language when current language is not available', (done) => {
    const mockSite = {
      metadataAsList: [
        { key: 'cris.cms.privacy-policy', language: 'en', value: 'Privacy policy in english' },
      ],
    };

    siteServiceSpy.find.and.returnValue(of(mockSite as any));
    localeServiceSpy.getCurrentLanguageCode.and.returnValue('it');

    component.ngOnInit();

    component.privacyPolicyText$.subscribe((value) => {
      expect(value).toBe('Privacy policy in english');
      done();
    });
  });

  it('should use current language when available', (done) => {
    const mockSite = {
      metadataAsList: [
        { key: 'cris.cms.privacy-policy', language: 'en', value: 'Privacy policy in english' },
        { key: 'cris.cms.privacy-policy', language: 'it', value: 'Privacy policy in italiano' },
      ],
    };

    siteServiceSpy.find.and.returnValue(of(mockSite as any));
    localeServiceSpy.getCurrentLanguageCode.and.returnValue('it');

    component.ngOnInit();

    component.privacyPolicyText$.subscribe((value) => {
      expect(value).toBe('Privacy policy in italiano');
      done();
    });
  });
});
