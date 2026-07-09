import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import {
  Observable,
  of,
} from 'rxjs';
import { SiteDataService } from 'src/app/core/data/site-data.service';
import { LocaleService } from 'src/app/core/locale/locale.service';
import { Site } from 'src/app/core/shared/site.model';

import { MarkdownViewerComponent } from '../../shared/markdown-viewer/markdown-viewer.component';
import { CmsInfoComponent } from './cms-info.component';

describe('CmsInfoComponent', () => {
  let component: CmsInfoComponent;
  let fixture: ComponentFixture<CmsInfoComponent>;
  let localeServiceSpy: jasmine.SpyObj<LocaleService>;
  let activatedRouteStub: any;
  let siteServiceStub: any;

  const site: Site = Object.assign(new Site(), {
    metadata: {
      'dc.rights' : [{
        value: 'English text',
        language: 'en',
      },
      {
        value: 'German text',
        language: 'de',
      }],
    },
  });

  beforeEach(async () => {
    localeServiceSpy = jasmine.createSpyObj('LocaleService', ['getCurrentLanguageCode']);
    localeServiceSpy.getCurrentLanguageCode.and.returnValue(of('en'));
    activatedRouteStub = {
      data: of({ schema: 'cris', qualifier: 'testQualifier' }),
      queryParamMap: of({}),
    };
    siteServiceStub = {
      find(): Observable<Site> {
        return of(site);
      },
    };
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CmsInfoComponent,
        MockComponent(MarkdownViewerComponent),
      ],
      providers: [
        { provide: SiteDataService, useValue: siteServiceStub },
        { provide: LocaleService, useValue: localeServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CmsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set headLabel$ when data is successfully retrieved', () => {
    const headLabelSpy = spyOn(component.headLabel$, 'next');

    component.ngOnInit();

    expect(headLabelSpy).toHaveBeenCalledOnceWith('info.testQualifier.head');
  });

  it('should log a warning to console if metadata content is missing', () => {
    spyOn(console, 'warn');
    site.metadata['cris.cms.testQualifier'] = undefined;

    component.ngOnInit();

    expect(console.warn).toHaveBeenCalledWith('Metadata cris.cms.testQualifier has no content');
  });
});
